// Page behaviour: nav, content rendering, scroll reveal and the pinned plugins section.
import { contributionData, certData, moreCertData } from './data.js?v=20261106a';

const root = document.documentElement;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const onChange = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));
// The one switch between the side-by-side and the stacked (object on top, copy underneath) layout of
// the pinned sections. styles.css carries the identical query: change both together.
const STACKED_QUERY = '(max-width: 734px), (max-aspect-ratio: 21/20)';
const stackedMQ = matchMedia(STACKED_QUERY);
const NAV_H = 48;

/* ---------------------------------------------------------------- nav + menu */
const nav = $('#gnav');
const menu = $('#menu');
const menuBtn = $('#menu-btn');
const toTop = $('#to-top');

// Everything outside the header is inert while the menu overlay is open, so Tab cannot reach content
// the overlay covers (and, on close, focus is not stranded there).
const behindMenu = $$('main, footer, .skip, #to-top');

function setMenu(open) {
    if (open === !menu.hidden) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    behindMenu.forEach((el) => el.toggleAttribute('inert', open));
    // Closing returns focus to the button that opened the menu. (A link click that scrolls to a section
    // moves focus again afterwards; at desktop widths the button is display: none, so this is a no-op.)
    if (!open) menuBtn.focus();
    requestUpdate(); // the header's on-dark tint follows the menu state (see update)
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
onChange(matchMedia('(min-width: 901px)'), (e) => { if (e.matches) setMenu(false); });
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' }));

const navLinks = $$('.gnav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
            if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
        });
    });
}, { rootMargin: '-50% 0px -50% 0px' });
// The hero and the contact block have no link of their own: observed so that reaching them clears the mark.
['top', 'overview', 'admin-tooling', 'tools', 'career', 'experience', 'stack', 'awards', 'contact'].forEach((id) => { const el = document.getElementById(id); if (el) sectionObserver.observe(el); });

/* ------------------------------------------------------ content: cards + certs */
// Keeps the card grid gapless on a 3-column layout (2-column and 1-column stay gapless anyway).
function spanClasses(n) {
    const out = new Array(n).fill('');
    if (n === 1) out[0] = 'span-all';
    else if (n % 3 === 1) { out[0] = 'span2'; out[n - 1] = 'span2'; }
    else if (n % 3 === 2) out[0] = 'span2';
    return out;
}

function renderCards(key) {
    const items = contributionData[key];
    const spans = spanClasses(items.length);
    $('#panel-' + key).innerHTML = '<div class="cards">' + items.map((item, i) => `
        <article class="card ${spans[i]}" data-reveal style="--i:${i % 3}">
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.summary)}</p>
            <ul class="tags">${item.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </article>`).join('') + '</div>';
    $(`#tab-${key} .count`).textContent = items.length;
}

function renderCerts() {
    $('#panel-certs').innerHTML = '<div class="certs">' + certData.map((c, i) => `
        <article class="cert" data-reveal style="--i:${i}">
            <div class="cert-icon"><svg class="icon" aria-hidden="true"><use href="#${esc(c.icon)}"/></svg></div>
            <div class="cert-main">
                <div class="cert-top">
                    <h3>${esc(c.title)}</h3>
                    <span class="badge ${c.badgeTone === 'good' ? 'good' : ''}">${esc(c.badge)}</span>
                </div>
                <p class="cert-issuer">${esc(c.issuer)}</p>
                <p class="cert-desc">${esc(c.description)}</p>
                ${c.verifyUrl ? `<a class="link-arrow" href="${esc(c.verifyUrl)}" target="_blank" rel="noopener">Verify certificate</a>` : ''}
            </div>
        </article>`).join('') + '</div>'
        + `<div class="cert-more" data-reveal><h3>Also completed</h3><ul class="tags">${moreCertData.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
    $('#tab-certs .count').textContent = certData.length + moreCertData.length;
}

Object.keys(contributionData).forEach(renderCards);
renderCerts();

/* ----------------------------------------------------------------- tabs (WAI-ARIA) */
const seg = $('#seg');
const tabs = $$('.seg-tab');
const thumb = $('.seg-thumb');
const tabsBar = $('#tabs-bar');

function placeThumb(btn, animate) {
    seg.classList.toggle('no-thumb-anim', !animate);
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.transform = `translateX(${btn.offsetLeft}px)`;
    if (seg.scrollWidth > seg.clientWidth) {
        seg.scrollTo({ left: btn.offsetLeft - (seg.clientWidth - btn.offsetWidth) / 2, behavior: animate && !reduceMotion.matches ? 'smooth' : 'auto' });
    }
}

function selectTab(key, { scroll = true, animate = true } = {}) {
    tabs.forEach((b) => {
        const on = b.dataset.tab === key;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on) placeThumb(b, animate);
    });
    $$('.panel').forEach((p) => { p.hidden = p.id !== 'panel-' + key; });
    const panel = $('#panel-' + key);

    // Replay the reveal so each tab feels like it arrives, not like it was swapped.
    const items = $$('[data-reveal]', panel);
    items.forEach((el) => el.classList.remove('in'));
    void panel.offsetWidth;
    requestAnimationFrame(() => items.forEach((el) => el.classList.add('in')));

    if (scroll) {
        const top = panel.getBoundingClientRect().top + scrollY - NAV_H - tabsBar.offsetHeight - 16;
        if (scrollY > top) scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
}

tabs.forEach((btn) => btn.addEventListener('click', () => selectTab(btn.dataset.tab)));
seg.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    tabs[next].focus();
    selectTab(tabs[next].dataset.tab, { scroll: false });
});

const activeTab = () => tabs.find((b) => b.getAttribute('aria-selected') === 'true');
selectTab('backend', { scroll: false, animate: false });
new ResizeObserver(() => placeThumb(activeTab(), false)).observe(seg);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeThumb(activeTab(), false));

/* ----------------------------------------------------- reveal, scrub, count-up */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
    });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
$$('[data-reveal]').forEach((el) => revealObserver.observe(el));

const scrubEl = $('[data-scrub]');
let scrubWords = [];
if (scrubEl) {
    scrubEl.innerHTML = scrubEl.textContent.trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
    scrubWords = $$('.w', scrubEl);
}
function updateScrub() {
    if (!scrubWords.length) return;
    if (reduceMotion.matches) { scrubWords.forEach((w) => w.classList.add('on')); return; }
    const r = scrubEl.getBoundingClientRect();
    const p = clamp((innerHeight * 0.92 - r.top) / (innerHeight * 0.5 + r.height * 0.6), 0, 1);
    const upTo = Math.round(p * scrubWords.length);
    scrubWords.forEach((w, i) => w.classList.toggle('on', i < upTo));
}

$$('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion.matches) return;
    el.textContent = (0).toFixed(decimals);
    const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now) => {
            const k = clamp((now - t0) / 1400, 0, 1);
            el.textContent = (target * (1 - Math.pow(1 - k, 4))).toFixed(decimals);
            if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
});

/* ------------------------------------------- scroll engine (pinned sections) */
const showcaseTrack = $('[data-track="showcase"]');
const showcaseStageEl = $('.showcase-stage');
const toolsSection = $('#tools');
const awardsSection = $('#awards');
const steps = $$('.step');
const callouts = $$('.callout');
const plateEls = $$('.sp');
const stagePrev = $('#stage-prev');
const stageNext = $('#stage-next');
const calloutBox = $('.callouts');

const STEP_START = 0.3; // before this the plates are still separating
const stepFor = (p) => (p < STEP_START ? -1 : Math.min(steps.length - 1, Math.floor((p - STEP_START) / ((1 - STEP_START) / steps.length))));

// Scroll to the middle of a step's stretch of the pinned section (-1 = the intro, before any step is shown).
function scrollToStep(i) {
    const span = showcaseTrack.offsetHeight - showcaseStageEl.offsetHeight;
    const p = i < 0 ? 0.1 : STEP_START + (i + 0.5) * ((1 - STEP_START) / steps.length);
    scrollTo({ top: showcaseTrack.getBoundingClientRect().top + scrollY + span * p, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
}
const scrollToSection = (id) => scrollTo({ top: document.getElementById(id).getBoundingClientRect().top + scrollY, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
const stepTitles = steps.map((el) => $('.step-kicker', el).textContent.trim());
// Previous / next move through the intro and the steps, then on to the neighbouring page sections.
const PREV_SECTION = { id: 'admin-tooling', label: 'Admin Tooling' };
const NEXT_SECTION = { id: 'career', label: 'Career' };
function stageTargets(step) {
    return {
        prev: step < 0 ? { label: PREV_SECTION.label, go: () => scrollToSection(PREV_SECTION.id) }
            : { label: step === 0 ? 'Overview' : stepTitles[step - 1], go: () => scrollToStep(step - 1) },
        next: step >= steps.length - 1 ? { label: NEXT_SECTION.label, go: () => scrollToSection(NEXT_SECTION.id) }
            : { label: stepTitles[step + 1], go: () => scrollToStep(step + 1) },
    };
}
let targets = stageTargets(-1);
stagePrev.addEventListener('click', () => targets.prev.go());
stageNext.addEventListener('click', () => targets.next.go());
callouts.forEach((el, i) => $('button', el).addEventListener('click', () => scrollToStep(i)));

function trackProgress(track, stageEl) {
    const span = track.offsetHeight - stageEl.offsetHeight;
    return span > 0 ? clamp(-track.getBoundingClientRect().top / span, 0, 1) : 0;
}

let ticking = false;
let lastStep = -2;

function update() {
    ticking = false;
    const sy = scrollY;
    nav.classList.toggle('scrolled', sy > 8);
    tabsBar.classList.toggle('stuck', tabsBar.getBoundingClientRect().top <= NAV_H + 1);
    const over = (el) => { const r = el.getBoundingClientRect(); return r.top <= NAV_H && r.bottom > NAV_H; };
    // The open menu is a light overlay: keep the header light under it, whatever section is behind.
    nav.classList.toggle('on-dark', menu.hidden && (over(toolsSection) || over(awardsSection)));
    updateScrub();

    const scrolly = root.classList.contains('scrolly');
    const showP = scrolly ? trackProgress(showcaseTrack, showcaseStageEl) : 0;
    // The back-to-top button would sit on the pinned 3D stage and its copy.
    toTop.classList.toggle('visible', sy > 700 && !(scrolly && showP > 0 && showP < 1));

    const step = scrolly ? stepFor(showP) : -1;
    if (step !== lastStep) {
        lastStep = step;
        steps.forEach((el, i) => el.classList.toggle('is-active', i === step));
        callouts.forEach((el, i) => el.classList.toggle('is-active', i === step));
        plateEls.forEach((el) => el.classList.toggle('is-active', Number(el.dataset.i) === step));
        showcaseStageEl.classList.toggle('has-step', step >= 0);
        targets = stageTargets(step);
        stagePrev.setAttribute('aria-label', 'Previous: ' + targets.prev.label);
        stageNext.setAttribute('aria-label', 'Next: ' + targets.next.label);
    }
    calloutBox.classList.toggle('on', showP > 0.16);
    // The plates come apart over the first third of the section. Outside the pinned mode they simply stay apart.
    showcaseStageEl.style.setProperty('--e', scrolly ? smooth(0.04, 0.34, showP).toFixed(3) : '1');
}
function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
}
addEventListener('scroll', requestUpdate, { passive: true });
addEventListener('resize', requestUpdate);
onChange(stackedMQ, requestUpdate);
onChange(reduceMotion, () => {
    root.classList.toggle('scrolly', !reduceMotion.matches);
    requestUpdate();
});

requestUpdate();

// Tells the inline head script that the page booted; if this never runs it restores the plain layout.
window.__siteReady = true;
