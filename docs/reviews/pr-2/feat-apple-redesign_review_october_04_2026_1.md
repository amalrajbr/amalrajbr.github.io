# PR #2 Review - Round 1

**Plan of record:** [#2](https://github.com/amalrajbr/amalrajbr.github.io/pull/2) - Redesign portfolio (3D hero, tooling section) and update content from latest resume
**Unit:** [#2](https://github.com/amalrajbr/amalrajbr.github.io/pull/2) - Redesign portfolio (3D hero, tooling section) and update content from latest resume
**Branch:** `feat/apple-redesign` (base: `main`)
**Reviewer:** reviewer
**Date:** October 04, 2026 (America/New_York)
**Diff stats:** 12 files, +2040 / -513
**Commits reviewed:** `0c3664c` (redesign), `49a9932` (content update); PR head `49a9932`
**Prior review doc:** _None - first round._

## Verdict: **CHANGES_REQUESTED**

## Summary

The PR replaces the Tailwind page with a hand-written site and a lazily loaded Three.js stage, then adds the resume content. The security, privacy and supply-chain posture is clean: every DOM interpolation is escaped, runtime requests are same-origin only, the vendored Three.js r178 files are byte-identical to upstream, and no personal contact details, employer name or internal identifiers are in any committed file. Content is accurate against the resume and the plugin READMEs with one qualifier problem (M5). Changes are requested because the pinned "Built to build." section is broken at tablet-portrait widths (H1), the failed-boot / no-JS fallback leaves the whole Experience section as dead controls over empty panels while the PR claims a readable static page (H2), and four Medium accessibility and layout defects were reproduced (M1-M4), plus one Medium content-qualifier issue (M5). The single most important next step is H1 (tablet layout), then H2.

## Findings

### Critical

_None._

### High

- **H1 - Pinned "Built to build." section overlaps and clips at tablet-portrait widths (about 735-900 px wide, aspect <= 1.05)**
  - **Location:** `css/styles.css:306-312` (`.scrolly .showcase-copy`: copy column pinned left from 735 px up), `js/stage.js:179,200-209` (`wide = camera.aspect > 1.05` decides where the 3D stack sits: centred when not wide), `js/stage.js:254-263` (callout pill positions).
  - **Issue:** CSS and JS use different rules for "wide". CSS keeps the desktop arrangement (copy column at left, 292 px wide at 768) for every viewport at or above 735 px, while the stage centres the plates whenever the aspect ratio is 1.05 or less. At 768x1024 the active step's copy box measures x 22..314, y 302..722 and the plates span roughly x 130..590, so the plates are drawn behind the step text (see the overlapping "work as a persistent pair ... leaving a written record" paragraph and the "Reports back on GitHub" chip, which sit on the silver and blue plates). The three callout pills sit at x 685..814, 689..862 and 685..812 in a 753 px layout viewport, so "Code Review", "Review Orchestration" and "Monitor Loop" are cut off at the right edge ("Code", "Rev", "Moni" visible). The intro state (progress 0.1) also has the plate touching the lede paragraph.
  - **Impact:** Portrait tablets (768x1024, 810x1080, 820x1180, 834x1194) and any tall narrow desktop window get body copy rendered over a bright, high-reflectance 3D object (grey `#a1a1a6` text over silver plate pixels, visibly low contrast where they cross) and clipped labels. This is the section the PR exists to show off, and 768 is a required test width.
  - **Rule cited:** WCAG 2.2 SC 1.4.3 Contrast (Minimum): "The visual presentation of text ... has a contrast ratio of at least 4.5:1"; WCAG Understanding SC 1.4.10 Reflow principle: content must be presented "without loss of information". Brief dimension 4: "no overlap/clipping, legible text".
  - **Recommendation:** Make CSS and JS agree on one layout switch. Either (a) apply the existing mobile arrangement (object on top, copy underneath, callouts hidden, `css/styles.css:503-520`) for `(max-aspect-ratio: 21/20)` as well as `(max-width: 734px)`, and expose the same flag to the stage (e.g. read `matchMedia` in `main.js` and pass `layout: 'stacked' | 'side'` to `stage.update`), or (b) keep the side layout but push the stage right (`posX`) whenever the CSS copy column is visible. In both cases clamp the callout x position to `width - pill width - gutter`, or hide callouts when they cannot fit (see M4).

- **H2 - Failed-boot and no-JS fallbacks leave a dead tab bar and an empty Experience section with no message**
  - **Location:** `index.html:15-27` (head script drops the `js` and `scrolly` classes on failure), `index.html:200-221` (tab bar is static HTML, panels are empty, `<noscript>` message), `js/main.js:84-85` (cards and certificates exist only after `renderCards`/`renderCerts` run).
  - **Issue:** I blocked `js/main.js` in a fresh page (the PR's "forced main.js failure" case) and also loaded the page with JavaScript disabled. In the failed-boot case the head script correctly removes `js`/`scrolly`, and every heading and paragraph is visible, but: 0 of the 35 cards exist, all six panels are empty (`innerHTML` length 0), the six tab buttons are visible with no counts and do nothing, and there is no explanatory text because `<noscript>` content is never shown when scripting is enabled but the script failed. With JavaScript disabled the `<noscript>` text is shown, but the dead tab bar is still rendered above it. At 390 px with `main.js` blocked, the hamburger button is visible and inert (clicking it leaves `#menu` hidden) while the desktop nav is hidden, so there is no navigation at all.
  - **Impact:** The "Work contributions" section is the main evidence on the page. A visitor with a failed module load, a script blocker, or a crawler that does not run JavaScript sees a heading, six dead pills and blank space. The PR claims (commit 1 and Test notes) that failure "degrades to a readable static page"; it does for headings and paragraphs, not for this section. This is pre-existing architecture (the old page also rendered the cards from script), but the PR introduces the fallback claim and the class-removal machinery, and it is incomplete.
  - **Rule cited:** MDN, "Progressive enhancement": core content and functionality should work without the enhancement layer; HTML Living Standard, `noscript` element: its content applies only "if scripting is disabled", so it cannot cover a script that is enabled but failed; WAI-ARIA APG Tabs pattern: a tab must control a panel that has content.
  - **Recommendation:** Smallest fix: in the head script's failure branch also add a class (for example `no-boot`) and in CSS under `html:not(.js) , html.no-boot` hide `#tabs-bar` and `.menu-btn`, and show the same "rendered with JavaScript" message that `<noscript>` shows today (reuse one element, not two). Better fix: emit the 35 cards and 3 certificates as static HTML (a ten-line Node script that renders `js/data.js` into `index.html`, committed), have `main.js` enhance rather than build, and show the tab bar only under `.js`.

### Medium

- **M1 - Hero copy fades to opacity 0 but its links stay focusable and clickable (also the back-to-top button)**
  - **Location:** `css/styles.css:238-242` (`opacity: calc(1 - var(--p) * 1.8)` on `.hero-copy`), `css/styles.css:466-474` (`.to-top` uses `opacity: 0; pointer-events: none` only), `js/main.js:222-226`.
  - **Issue:** At 1440x900 and scrollY 500 (progress 0.64) `.hero-copy` computes `opacity: 0`; I focused "Contact now" and `document.elementFromPoint` at its centre returned the button, so a keyboard user's focus ring is invisible and a mouse click would open the mail client from blank space. Opacity reaches 0 at progress about 0.556, which is scrollY of roughly 390 px. `.to-top` is likewise focusable while invisible (for example Shift+Tab from the top of the page lands on it).
  - **Impact:** Keyboard users who have scrolled the hero and then press Tab traverse two invisible controls; pointer users can trigger invisible links.
  - **Rule cited:** WCAG 2.2 SC 2.4.7 Focus Visible: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible."
  - **Recommendation:** When `heroP` is at or above about 0.55, toggle a class that sets `visibility: hidden` (or the `inert` attribute) on `.hero-copy`; add `.to-top:not(.visible) { visibility: hidden; }` with the transition delayed so the fade still plays.

- **M2 - Mobile menu does not manage focus: Escape drops focus to `<body>`, Tab walks into content hidden under the overlay**
  - **Location:** `js/main.js:22-31` (`setMenu`, Escape handler), `index.html:72-83` (menu markup is a sibling of `<main>`), `css/styles.css:171-177`.
  - **Issue:** At 390x844 I opened the menu, tabbed to "Overview" and pressed Escape: the menu closed and `document.activeElement` became `BODY` (the trigger is not refocused). With the menu open, repeated Tab after the last link ("Contact") moved focus to "Contact now", "LinkedIn profile" and "Ask for a walkthrough", all fully covered by the overlay (`elementFromPoint` returned the menu), and the page cannot scroll to reveal them because `body` is `overflow: hidden`.
  - **Impact:** Keyboard and switch users lose their place on close and can focus elements they cannot see while the menu is open.
  - **Rule cited:** WCAG 2.2 SC 2.4.3 Focus Order and SC 2.4.11 Focus Not Obscured (Minimum); WAI-ARIA APG Modal Dialog pattern: Escape closes and "focus returns to the element that invoked the dialog", and the page behind is inert.
  - **Recommendation:** In `setMenu(false)` return focus to `menuBtn` when focus was inside `#menu` (or when closed via Escape); while open, set `inert` on `main`, `footer` and the skip link (or trap Tab within the header and menu).

- **M3 - Unselected tab labels (and the hovered primary button) are below the 4.5:1 text contrast minimum**
  - **Location:** `css/styles.css:371-375` (`.seg` track `rgba(0,0,0,.06)`), `css/styles.css:377-382` (`.seg-tab` colour `var(--ink-3)` = `#6e6e73`), `css/styles.css:116` (`.btn:hover` background `#0077ed`).
  - **Issue:** Computed from the rendered colours in Chromium: the five unselected tab labels (14 px, weight 500) are 4.08:1 against the track; a full-document text-contrast sweep (computed colours composited over ancestor backgrounds; it excludes gradient-clipped text and opacity-faded states) reported no other failures. White text on `.btn:hover` (`#0077ed`) is 4.32:1 at 17 px.
  - **Impact:** The primary section navigation of the page is slightly under AA for low-vision users.
  - **Rule cited:** WCAG 2.2 SC 1.4.3 Contrast (Minimum): 4.5:1 for text below 24 px (or 18.66 px bold).
  - **Recommendation:** Use `var(--ink-2)` (`#424245`) for unselected tab text, or lighten the track to `rgba(0,0,0,.04)`; darken the hover blue (the page already uses `#0066cc` at 5.6:1 for links).

- **M4 - Callout pills are clipped by the window at 1024x768**
  - **Location:** `js/stage.js:254-263` (`offset = S.scale * pxPerWorld * 1.95 + 28`, no clamp to the mount width).
  - **Issue:** At 1024x768, with step 2 active, the "02 Review Orchestration" pill spans x 858..1036 in a 1024 px window, so its label is cut off ("Review Orchestrati"). At 1440 it fits (right edge 1372). The same unclamped offset causes the clipping described in H1 at 768.
  - **Impact:** A visibly truncated label in the headline section at a required test width (iPad landscape and small laptops). The text is duplicated in the step copy, so no information is lost, which is why this is Medium rather than High.
  - **Rule cited:** WCAG Understanding SC 1.4.10 Reflow principle ("without loss of information"); brief dimension 4 ("no overlap/clipping").
  - **Recommendation:** Clamp each pill's x so that `x + pillWidth <= width - gutter` (measure `el.offsetWidth` once per resize), or move the pills to the left of the plates when there is no room on the right.

- **M5 - "Built to build." copy states three capabilities more strongly than the plugin READMEs support**
  - **Location:** `index.html:155` ("Checks your code against the mistakes your own repository has already made"), `index.html:162` (chip "Reports back on GitHub"), `index.html:167-168` (paragraph "rides out rate-limit pauses without losing progress", chip "Rate-limit safe").
  - **Issue:** (a) The Monitor Loop README limits rate-limit recovery to a session that is still open and treats runs that must outlive the session as out of scope; "Rate-limit safe" and "without losing progress" drop that qualifier. (b) The Review Orchestration README describes GitHub reporting for issue and pull-request sources; a plan-file or current-branch run reports in the session unless a pull request is created, so "Reports back on GitHub" is true for only some starting points. (c) The Code Review README's repository-owned catalogue exists once the repository has mined its own history; before that the audit uses stack-level starter patterns, so "the mistakes your own repository has already made" is true only after mining.
  - **Impact:** The brief for this section requires that it "must not overclaim". Each statement is directionally right and individually small, but together they read as guarantees for private tooling that readers cannot inspect.
  - **Rule cited:** Content accuracy (brief dimension 5: the section "must not overclaim" and every new claim must trace to the plugin READMEs): the Monitor Loop README's behaviour and limits sections, the Review Orchestration README's description of how it finishes, and the Code Review README's section on a repository with no catalogue yet.
  - **Recommendation:** Reword without adding internals, for example: "Rate-limit tolerant" and "keeps a long run moving through rate-limit pauses while the session stays open"; "Reports back on the issue or PR"; "Checks your code against an antipattern catalogue mined from your repository's own bug-fix history". These are capability-level and expose nothing new.

### Low

- **L1 - Toggling reduced motion off at runtime leaves the 3D stage rendering invisibly**
  - **Location:** `js/main.js:249-254` (change handler), `js/main.js:265-266,277` (`loadStage` returns the existing stage without re-adding `webgl`).
  - **Issue:** Emulating `reduce` removes the `webgl` class and pauses the stage; emulating `no-preference` again re-shows the stage (`syncStage` -> `s.show` -> `resume`) but never restores `webgl`, so the canvas stays at `opacity: 0` over a visible CSS stack. I measured 60 `requestAnimationFrame` calls per second after the toggle: the GPU is working for nothing.
  - **Impact:** Rare (an OS setting changed mid-session) but wasted GPU and a stuck fallback until reload.
  - **Rule cited:** MDN `MediaQueryList` `change` event / `prefers-reduced-motion`: handlers must restore the non-reduced state when the query stops matching.
  - **Recommendation:** Add `root.classList.add('webgl')` in the `loadStage` branch that returns an existing stage (or inside `syncStage` after `s.show`).

- **L2 - WebGL context loss is terminal; `webglcontextrestored` is ignored**
  - **Location:** `js/stage.js:74`, `js/main.js:275`.
  - **Issue:** Forcing loss via `WEBGL_lose_context` correctly falls back to the CSS stack (class removed, opacity 0.02 then 0, no exceptions), but a later `restoreContext()` does nothing: `stageFailed = true`, the renderer is never disposed, the `pointermove` and `ResizeObserver` listeners stay attached, and the 3D never returns until reload. On mobile GPUs under memory pressure, loss and restore are common.
  - **Rule cited:** Khronos WebGL wiki "HandlingContextLost": call `preventDefault()` on `webglcontextlost` "to indicate that you want to handle restoration", then rebuild or resume on `webglcontextrestored`.
  - **Recommendation:** Either handle `webglcontextrestored` (re-add `webgl`, resume) or dispose the renderer and listeners on loss so nothing leaks.

- **L3 - Continuous idle animation has no pause control**
  - **Location:** `js/stage.js:181,192` (idle sine wobble keeps the scene permanently animating), `css/styles.css:327-337` (`hint` keyframes, `infinite`).
  - **Issue:** The hero stack rotates slowly forever and the "Keep scrolling" chevron loops, both starting automatically and lasting more than five seconds, with no pause, stop or hide control. Reduced motion is respected, which mitigates it.
  - **Rule cited:** WCAG 2.2 SC 2.2.2 Pause, Stop, Hide (Level A): moving content that starts automatically and lasts more than five seconds needs a mechanism to pause, stop or hide it; SC 2.3.3 (AAA) for the reduced-motion respect.
  - **Recommendation:** Stop the idle wobble after a few seconds (settle the pose), and animate the chevron a fixed number of iterations. No toggle is needed if nothing keeps moving.

- **L4 - Stage renders every frame at up to 2x device pixel ratio with `high-performance` power preference**
  - **Location:** `js/stage.js:69` (`powerPreference: 'high-performance'`), `js/stage.js:161` (`setPixelRatio(min(dpr, 2))`), `js/stage.js:270-277`.
  - **Issue:** Measured about 58-60 rAF/s whenever a mount is visible (it correctly drops to 0 off-screen). Because of the idle wobble the scene is never settled, so it re-renders MSAA physical materials with clearcoat and iridescence at up to 2880x1800 on a retina desktop and requests the discrete GPU on dual-GPU laptops.
  - **Rule cited:** three.js manual, "Rendering on Demand": render only when something changed; WebGL spec: `high-performance` hints the discrete GPU.
  - **Recommendation:** Cap DPR at 1.5 for canvases larger than about 1.5 megapixels, drop `powerPreference` (let the UA choose), and skip `render()` while the target state equals the current state.

- **L5 - Above-the-fold hero copy is gated on JavaScript and a one-second transition (LCP 2.03 s on localhost)**
  - **Location:** `css/styles.css:134-139` (`.js [data-reveal]` starts at `opacity: 0`), `js/main.js:145-152`.
  - **Issue:** Hero text stays invisible until `main.js` has run, the observer has fired and a 1 s (plus up to 270 ms stagger) transition has finished. In a fresh page on this machine (DCL 155 ms, no network latency) the largest-contentful-paint entry was `P.lede` at 2032 ms after an initial candidate at 196 ms. Over a real network this will cross the 2.5 s "good" threshold.
  - **Rule cited:** web.dev "Largest Contentful Paint": LCP should occur within 2.5 s; web.dev "Optimize LCP": do not hide the LCP element until script runs.
  - **Recommendation:** Give the three hero elements a CSS-only entrance (a short `animation` under `.js`) that starts at first paint, and keep the IO-driven reveal for below-the-fold content.

- **L6 - Forced-colors (Windows High Contrast): the selected tab is not distinguishable**
  - **Location:** `css/styles.css:371-396` (selection is shown only by the `.seg-thumb` background and a text colour change).
  - **Issue:** Emulating `forced-colors: active`, the six tabs render identically; the thumb background and colour difference are removed. (Gradient text and the 3D canvas remain visible, which is fine.)
  - **Rule cited:** WCAG 2.2 SC 1.4.1 Use of Color; SC 1.4.11 Non-text Contrast.
  - **Recommendation:** Add `@media (forced-colors: active) { .seg-tab[aria-selected="true"] { outline: 2px solid Highlight; } .seg-thumb { display: none; } }`; likewise give `.btn` a `border: 1px solid ButtonText` under forced colours.

- **L7 - Tab panels without focusable content are not in the tab order; tab buttons lack `type="button"`**
  - **Location:** `index.html:215-220`, `index.html:204-209`.
  - **Issue:** Backend, Full-Stack, AI & ML, DevOps and Data Eng panels contain no focusable element, so a keyboard user cannot move focus into the content after the tablist. The six `<button>` elements have no `type` (html-validate `no-implicit-button-type`; the file has no form, so there is no behavioural effect today).
  - **Rule cited:** WAI-ARIA APG Tabs pattern: "When the tabpanel does not contain any focusable elements ... the tabpanel should set `tabindex="0"`"; HTML Living Standard, `button` element: the default `type` is `submit`.
  - **Recommendation:** Add `tabindex="0"` to the five card panels (not the certificates panel, which has links) and `type="button"` to the tabs.

- **L8 - Short landscape viewports: the intro copy block is taller than the viewport**
  - **Location:** `css/styles.css:308-312`, `css/styles.css:525-528`.
  - **Issue:** At 844x390 (landscape phone) before the first step activates, `.showcase-copy` measures 480 px tall with its top at -45 px, so the eyebrow and "Built to build." heading are above the viewport and under the 48 px nav. Once a step is active (copy 300 px tall) it fits.
  - **Rule cited:** WCAG 2.2 SC 1.3.4 Orientation (content must remain available in either orientation); brief dimension 4 ("no overlap/clipping").
  - **Recommendation:** In the `max-height: 640px` rule also hide the intro lede (`.showcase-head .lede`) or switch to the stacked layout for heights under about 500 px.

- **L9 - "Valid thru 2028" on the Cloud Practitioner card is not supported by the resume and conflicts with AWS's three-year rule (pre-existing text, re-published here)**
  - **Location:** `js/data.js:215` (`badge`) and `index.html:273`.
  - **Issue:** The resume does not state a validity date. The card says "Issued July 2024" and "Valid thru 2028"; AWS's recertification policy gives Cloud Practitioner a three-year validity, which would end July 2027 unless the owner renewed it. The "Valid thru 2028" clause is unchanged from `main`, so it is pre-existing and not a new or changed claim introduced by this PR; the brief's High threshold for unsupported changed claims therefore does not apply. It is Low because the PR re-publishes it inside the combined AWS card and the resume cannot confirm it.
  - **Rule cited:** Content accuracy; AWS Certification recertification policy (aws.amazon.com/certification/policies/recertification/): "valid for 3 years".
  - **Recommendation:** Owner to check the certification dashboard (renewal may explain 2028) and either keep the date, change it, or drop the validity clause. Not a blocker if confirmed.

- **L10 - The committed review docs will be served publicly if merged as-is**
  - **Location:** `docs/reviews/pr-2/` on the PR branch (this file, and later rounds).
  - **Issue:** GitHub Pages is a legacy build from `main` at `/` with `.nojekyll`, so everything in the tree is published as static files, including `docs/reviews/pr-2/*.md`.
  - **Rule cited:** GitHub Pages documentation, "Configuring a publishing source": the publishing source directory is published in full.
  - **Recommendation:** Decide at merge time whether the review trail should be public; if not, remove the directory in a final commit on the branch (or squash-merge excluding it) before merging.

### Nits

- **N1 - Hero glow ends in a hard horizontal edge.** The radial gradient in `.hero-stage::before` (`css/styles.css:226-229`) is clipped by `overflow: hidden` while still at about 4% alpha; in the 1500 px scroll screenshot a faint step is visible at the hero's bottom edge. Fade to `transparent` by 100% height.
- **N2 - Skills line wraps with a dangling separator.** At 1440 the first line ends "FastAPI ·" (`css/styles.css:361-362`, generated `::after` dot). It is also a paragraph of spans with CSS-generated separators, which some screen readers announce as "middle dot". An unstyled `<ul>` with inline items avoids both.
- **N3 - The header keeps its dark theme under the open menu.** Opening the mobile menu while over the Tools or Recognition section shows a grey translucent header with white text above the light overlay (`js/main.js:218` toggles `on-dark` regardless of the menu). Cosmetic; suppress `on-dark` while `aria-expanded="true"`.
- **N4 - `aria-current="true"` on section links** (`js/main.js:38`): `aria-current="location"` is the specific token for an in-page position.
- **N5 - Link previews have no image.** `index.html:9-12` has Open Graph title, description and URL but no `og:image`, no `twitter:card`, no `apple-touch-icon`.
- **N6 - Optional hardening.** No Content-Security-Policy; GitHub Pages cannot send headers but a `<meta http-equiv="Content-Security-Policy">` with `script-src 'self'` plus hashes for the two inline scripts would make the "no third-party requests" claim enforceable (OWASP Content Security Policy Cheat Sheet).
- **N7 - Two "three plugins" statements on one page.** The existing AI & ML card "AI Agent Skill Plugins" (`js/data.js:152`) describes three work plugins for Claude Code and OpenAI Codex, while the new section says "Three Claude Code plugins I wrote for my own workflow". They are different sets; a reader could think they are the same. Consider adding "work" to the card summary or "personal" to the section lede.
- **N8 - The commit messages and PR body carry a claude.ai session URL.** It is an identifier for a private session, not a secret, but the repository is public; confirm the owner is happy for it to be there.
- **N9 - `update()` interleaves layout reads and style writes** (`js/main.js:212-241`: `getBoundingClientRect` on four elements, class toggles, then `offsetTop`/`offsetHeight` in the stage branch). No jank was observed on this machine; batching all reads first would remove a possible forced layout per scroll frame on slow devices.

## What's good

- `js/main.js:10` `esc()` plus its use on every interpolated field in `renderCards` (`js/main.js:58-63`), `renderCerts` (`js/main.js:68-80`, including the `href` attributes) and the scrub words (`js/main.js:157`) satisfies OWASP's DOM-based XSS rule to HTML-encode before assigning `innerHTML`; the data is also a constant module, so there is no tainted source. External links carry `target="_blank" rel="noopener"` (`index.html:99,291`, `js/main.js:78`).
- Vendored Three.js is verified: `three.module.min.js`, `three.core.min.js`, `addons/environments/RoomEnvironment.js`, `addons/geometries/RoundedBoxGeometry.js` and `LICENSE` are byte-for-byte identical (SHA-256) to tag `r178` in `mrdoob/three.js`; the license is MIT and matches. The import map (`index.html:28-30`) uses relative URLs, appears before the module script, and `main.js` deliberately has no bare specifiers (`js/main.js:1-3`), so a browser without import maps still gets the full page and the CSS stack.
- The network log over the full tour shows nine requests, all `127.0.0.1` same-origin: no fonts, no CDN, no analytics. With reduced motion, `stage.js` and the 714 KB of Three.js are never requested; the critical path is about 22 KB gzipped and the lazy 3D bundle about 190 KB gzipped (`js/main.js:265-281` waits for `load` and idle).
- Render-loop hygiene: measured 0 `requestAnimationFrame` calls per second with the Experience section on screen versus about 58 per second with a mount visible (`js/main.js:283-293`, `js/stage.js:278-279`); `dt` is clamped (`js/stage.js:273`); `visibilitychange` pauses the loop (`js/main.js:301-304`); context loss degrades without exceptions (L2 aside).
- The boot-failure design in `index.html:15-27` is sound: `DOMContentLoaded` waits for module scripts, so `window.__siteReady` (`js/main.js:309`) is a reliable "booted" signal; blocking `main.js` verifiably restores a plain layout in which all headings, ledes and the tooling steps are visible (the content gap is H2, not the mechanism).
- Reduced motion is thorough: reload with `reduce` gives `class="js"` only, no canvas, 0 reveal elements below full opacity, 19 of 19 scrub words opaque, steps all at opacity 1, no sticky hero (`css/styles.css:530-536`, `js/main.js:162,172`).
- The tab widget follows the APG tabs pattern with roving `tabindex`, `aria-selected`, `aria-controls`/`aria-labelledby`, and Arrow/Home/End with wrap-around, verified by key presses (`js/main.js:124-137`); headings are ordered h1, h2, h3 throughout, all sections have `aria-labelledby`, the two navs are labelled, and the skip link works. html-validate reports only the missing button types (L7).
- Content: all 28 pre-existing cards and 2 certificates are identical to `main` (checked programmatically), and the seven added cards map one-to-one to the current-role bullets with no invented metrics (25 minutes to 3 seconds and 300 records into batches of 30 are the resume's own figures). The employer name, the internal platform slug, the internal identifier acronym, the phone number and the city appear nowhere in the tree or the commit messages. The AWS services list, the FastAPI addition, "Senior Software Engineer" and "7+" all trace to the resume. The repository that holds the plugins is confirmed private via `gh`, so "not publicly available" is true, and the section names no repository, command or prompt.

## Verification checklist

- [x] every JS file passes `node --check --input-type=module` (main.js, stage.js, data.js and the four vendored files)
- [x] page loaded over http in a real browser with a clean console at 1440x900 and 390x844 (0 console messages on both; the only console output across the session came from deliberately forced failure tests)
- [x] 3D stage verified running (class `webgl`, hardware-accelerated WebGL, about 58-60 rAF/s) and each fallback verified: reduced motion (pass), no WebGL (pass: CSS stack, steps still advance, one expected `console.error` from three plus the page's own warning), JS failure (headings pass, Experience section fails: H2)
- [x] network log shows same-origin requests only
- [x] vendored Three.js verified against upstream r178 (5 of 5 files identical)
- [x] contrast and keyboard checks done (findings M1, M2, M3, L6, L7)
- [x] new content verified against the resume and plugin READMEs (finding M5, L9)
- [x] no PII or internal identifiers in any committed file (tree, `vendor/`, both commit messages and the PR body; the session-URL nit is N8)
- [x] test state and screenshots cleaned up

### Environment and coverage

- Branch verified: `git branch --show-current` printed `feat/apple-redesign`; HEAD `49a9932` equals the PR head (`gh pr view`) and `origin/feat/apple-redesign`. Preview server `http://127.0.0.1:8123` served `text/javascript` for `.js` modules.
- Browser: headless Chromium 146 (Playwright MCP). Not tested: Safari, iOS, Firefox, touch input, or a throttled network; Pages' real cache and gzip behaviour were not observable locally.
- Exercised at `http://127.0.0.1:8123/`: 1440x900 (hero at progress 0 and 0.64, overview, tooling at progress about 0.2, 0.4, 0.7 and 1.0, experience, six tabs by mouse and by Arrow/Home/End, certificates, recognition), 1024x768 (hero, tooling step 2), 768x1024 (hero, tooling at 0.1 and 0.62), 390x844 (hero, menu open/Escape/Tab-through/link click, tooling at five progress points, tabs, horizontal overflow), 844x390 (tooling at four progress points). Extra conditions in separate tabs or emulation: `prefers-reduced-motion` reload, runtime reduced-motion toggle, `forced-colors: active`, forced no-WebGL (canvas `getContext` stubbed), forced `main.js` failure (route abort), JavaScript disabled (new browser context), forced WebGL context loss and restore, rAF sampling, LCP observer.
- Cleanup performed: all screenshots and snapshot files I created under the Playwright MCP output directory, plus one screenshot that the tool saved in the working directory, were deleted (three files that predated this round were left untouched); extra tabs and the no-JS context were closed; media emulation was reset; no files were created in the host repo other than this review document; no servers were started or stopped.

## Action items for developer (ordered)

1. H1: make the CSS pinned layout and the stage's `wide` rule agree (portrait tablets get the stacked layout, or the stage moves right), so copy never sits on the plates at 735-900 px wide portrait viewports.
2. H2: give the failed-boot and no-JS states a coherent Experience section (hide the dead tab bar and hamburger, show one message), or render the cards as static HTML.
3. M1: hide `.hero-copy` (`visibility`/`inert`) once its opacity reaches 0, and hide `.to-top` when not visible.
4. M2: return focus to the menu button on close, and make the page behind the open menu inert.
5. M3: raise the unselected tab text and the `.btn:hover` colour to at least 4.5:1.
6. M4: clamp callout pill positions to the mount width (and re-test 1024x768).
7. M5: reword the four phrases so they carry the READMEs' qualifiers.
8. L1 to L10 in order of effort: L1 (one line), L7 (attributes), L6, L3, L4, L5, L8, L2, L9 (owner check), L10 (decision).
9. Nits at discretion.

## Notes for next round

- Re-verify at 768x1024, 820x1180, 1024x768, 1440x900 and 390x844 that no pinned-section text overlaps the plates and no pill is clipped (H1, M4); also re-check 844x390 (L8).
- Re-run the failed-boot (route abort of `js/main.js`) and JavaScript-disabled loads and confirm the Experience section shows a message or static content, with no dead controls (H2).
- Re-run the keyboard passes: hero Tab at scrollY 500, menu Escape focus return and Tab containment, tab Arrow/Home/End (M1, M2, L7).
- Re-run the text-contrast sweep (M3) and the runtime reduced-motion toggle (L1).
- Check that any copy edits for M5 still trace to the three READMEs, and that no `docs/reviews` decision (L10) was taken silently.
- If the cards become static HTML (H2), re-compare card text and counts against `js/data.js` and against the resume.
