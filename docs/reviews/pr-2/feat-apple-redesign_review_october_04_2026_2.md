# PR #2 Review - Round 2

**Plan of record:** [#2](https://github.com/amalrajbr/amalrajbr.github.io/pull/2) - Redesign portfolio (3D hero, tooling section) and update content from latest resume
**Unit:** [#2](https://github.com/amalrajbr/amalrajbr.github.io/pull/2) - Redesign portfolio (3D hero, tooling section) and update content from latest resume
**Branch:** `feat/apple-redesign` (base: `main`)
**Reviewer:** reviewer
**Date:** October 04, 2026 (America/New_York)
**Diff stats:** 14 files, +2389 / -513 (whole PR); round diff `e7dd057...9c980ad`: 5 files, +218 / -70
**Commits reviewed:** the 19 commits `5234b23` through `9c980ad` on top of `e7dd057`; PR head `9c980ad`
**Prior review doc:** [feat-apple-redesign_review_october_04_2026_1.md](feat-apple-redesign_review_october_04_2026_1.md)

## Verdict: **PASS**

## Summary

The developer fixed every blocking round-1 finding (H1, H2, M1-M5) and the new layout, focus and fallback behaviour held up under reproduction at every viewport and emulation I used; the 19 commits introduce no Critical, High or Medium defect. What remains is Low and Nit: the LCP fix for the hero is only partly effective, restoring a lost WebGL context logs three browser warnings, focusing a card panel scrolls its top under the sticky bars, and a settled scene is still re-rendered every frame. None of these needs another review round.

## Findings

### Critical

_None._

### High

_None._

### Medium

_None._

### Low

- **L1 - The hero LCP fix is only partly effective: LCP is still about 1.9 s locally and 2.6 s under simulated mobile conditions**
  - **Location:** `css/styles.css:140-149` (CSS-only `rise` entrance, 0.6 s opacity fade), `js/main.js:288-297` (stage import starts after `load` plus idle).
  - **Issue:** The entrance now starts at first paint without waiting for script, as intended (it plays with `main.js` blocked and is disabled under `prefers-reduced-motion`). But the LCP number barely moved. Three loads of the page at 1440x900 gave `P.lede` at 1896, 1856 and 1944 ms (round 1: 2032 ms, DOMContentLoaded about 150 ms). Isolating the causes: with `stage.js` blocked the LCP drops to 940-1024 ms; with `stage.js` blocked and the entrance animation turned off it is 296 ms; with `main.js` blocked it is 264 ms. So the 0.6 s fade costs about 0.65 s because the element only counts once it is visibly painted, and the lazily loaded 3D stage (module graph, PMREM, shader compile) costs another 0.9 s by occupying the main thread right when the hero text should paint. With CDP throttling (4x CPU, 1.6 Mbps, 150 ms RTT, 390x844) FCP was 728 ms and LCP 2596 ms, just over the 2.5 s "good" threshold.
  - **Impact:** Not user-visible breakage; a slower-than-necessary hero on mid-range phones, on a page whose own commit message says the hero text and LCP should not wait for the 3D download.
  - **Rule cited:** web.dev "Largest Contentful Paint": LCP should occur within 2.5 s; web.dev "Optimize LCP": do not delay the LCP element behind animation or competing work.
  - **Recommendation:** Start the stage later (for example wait for the hero's `animationend` or a fixed 1.5-2 s after `load`, then `requestIdleCallback`), and make the lede's entrance transform-only (keep `opacity: 1`) so it paints at first frame. Re-measure with the same observer.

- **L2 - Restoring a lost WebGL context logs three `INVALID_OPERATION` warnings**
  - **Location:** `js/stage.js:86` (`if (environment) environment.dispose();` inside `buildEnvironment`, called from the `webglcontextrestored` handler).
  - **Issue:** The recovery itself works (see status of L2 below), but each restore prints `WebGL: INVALID_OPERATION: delete: object does not belong to this context` three times, because the previous PMREM render target belonged to the context that was lost. In a throwaway copy of the site with only that line removed, the same loss/restore cycle logged no warnings and rendered identically.
  - **Impact:** Console noise only, and only after a context loss.
  - **Rule cited:** Khronos WebGL wiki "HandlingContextLost": resources of a lost context are already invalid; do not delete them against the new context.
  - **Recommendation:** Skip `environment.dispose()` when called from the restore path (the first build has nothing to dispose), or set `environment = null` in the `webglcontextlost` handler.

- **L3 - Focusing a tab panel scrolls its top edge under the sticky bars**
  - **Location:** `css/styles.css` (`.panel`, no `scroll-margin-top`), `index.html:215-219` (new `tabindex="0"`).
  - **Issue:** Pressing Tab from the selected tab moves focus to the panel (verified: `panel-backend`, solid 2 px outline). The Backend panel is about 2015 px tall, so the browser aligned its top edge with the top of the viewport; the nav (48 px) and tab bar then covered the first row of cards, including the top of the focus ring. The panel remains partly visible, so SC 2.4.11 is met, but the enhanced criterion is not.
  - **Impact:** Cosmetic for keyboard users; the first 120 px of the panel is hidden right after the jump.
  - **Rule cited:** WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum, met) and SC 2.4.12 (Enhanced, AAA): "no part of the focus indicator is hidden"; CSS Scroll Snap Level 1, `scroll-margin`.
  - **Recommendation:** Add `.panel { scroll-margin-top: calc(var(--nav-h) + 96px); }` (nav plus tab bar height).

- **L4 - A settled scene is still re-rendered every frame (round-1 L4 only partly done)**
  - **Location:** `js/stage.js:307-317` (`frame` always calls `renderer.render`, line 315).
  - **Issue:** The pixel-ratio cap works as specified: 1440x900 at DPR 2 renders a 2137x1350 canvas (ratio 1.5, 2.9 MP), a phone at DPR 3 keeps ratio 2 (1.27 MP), a 768x1024 tablet at DPR 2 gets 1.5, and 1440x900 at DPR 1 stays at 1. `powerPreference` is gone. But now that the pose settles (verified: composited frames are identical from about 8 s after load), the loop still re-renders the unchanged scene each frame; at DPR 2 on an integrated GPU I measured about 22 `requestAnimationFrame` calls per second against about 59 at DPR 1, with the visible output not changing.
  - **Impact:** Wasted GPU and battery while the hero or the pinned section is on screen and idle; no visible defect.
  - **Rule cited:** three.js manual, "Rendering on Demand": render only when something changed.
  - **Recommendation:** In `frame`, skip `renderer.render` when `idleAmplitude(idleAge) === 0` and the damped state is within epsilon of its targets and no scroll/pointer/resize has marked the scene dirty.

### Nits

- **N1 - The idle wobble moves for 6 s, one second over the 5 s threshold.** `js/layout.js:15` (`hold = 4, fade = 2`). SC 2.2.2 applies to automatic motion lasting "more than five seconds". `hold = 3, fade = 2` keeps the same feel within the limit. Verified settle: sampled composited output was identical from 8 s after navigation (the stage appears about 1-2 s after load), consistent with 4 + 2 s of stage time.
- **N2 - If the boot fails after the cards were rendered, the cards are hidden and the page says the script is not running.** `css/styles.css:452` hides `.panel` under `html:not(.js)`. With `ResizeObserver` removed (main.js throws at the observer after `renderCards` has run) the page showed 35 cards in the DOM, 0 visible panels and the "not running" note. Only a browser without `ResizeObserver` hits this, so it is a Nit; `html:not(.js) .panel:empty { display: none }` would keep rendered content visible.
- **N3 - At 768x1024 the new bottom fade dims the lowest 20 px of the bottom plate.** `css/styles.css` (`mask-image` fade of 56 px on the stacked `.visual`). The lowest plate ends about 20 px inside the fade zone at that size (row brightness at the plate's lower edge 105 masked against 141 unmasked, then 60 against 88); 820x1180 and phones are unaffected. Barely visible, but a 40 px fade would clear it.

## Status of round-1 findings

- **H1 - fixed.** One layout switch (`(max-width: 734px), (max-aspect-ratio: 21/20)`) now drives both CSS (`css/styles.css:546`) and the stage (`js/main.js:16-17`, `stacked` input). Reproduced at 768x1024, 820x1180, 1024x768, 1440x900, 390x844, 844x390, 1000x1000, 1050x1000 (exactly 1.05, stacked), 1060x1000 (side by side), 900x850, 1100x1000, 735x900, 1180x820, 1366x1024, 1366x768, 1280x720, 1920x1080, 1024x600, 960x540 and 900x600, each at progress 0.1, 0.45, 0.62 and 0.9 (the two boundary cases 1050x1000 and 1060x1000 at 0.62 only; most also at 1.0): copy never overlaps the plates, copy stays between the nav and the viewport bottom, no pill is clipped. A runtime resize across the boundary (1000x1000 to 1200x800 to 800x1000 and back) re-flows copy, plates and pills correctly.
- **H2 - fixed.** With `main.js` blocked and with JavaScript disabled, at 390, 768 and 1440: tab bar, panels and hamburger are hidden, one note is shown, 5 nav links are visible, and under 900 px the header is static so wrapped links never cover the hero (hero copy top 187 px against header bottom 72 px at 390; 177 against 47 at 768). Deviation (static header, panels hidden, one message for both states): accepted. See N2 for one edge.
- **M1 - fixed; deviation accepted.** At scrollY 500 `.hero-copy` has `is-gone`, `.cta-row` is `visibility: hidden`, `.btn.focus()` leaves focus unchanged, `elementFromPoint` over the old button returns the container, and Tab from a click inside the hero skips to "Ask for a walkthrough". Chrome's accessibility tree at that scroll position still exposes the h1 and lists only the contact-section copies of "Contact now" and "LinkedIn profile". Opacity is 0.005 at the 0.55 threshold, so nothing visibly pops. `.to-top` is `visibility: hidden` and unfocusable at the top, visible and focusable when scrolled, and the fade-out still plays (sampled 1.00, 0.93, 0.49, 0.21, 0.06, 0.00 and then hidden within about 400 ms). Hiding only the controls so the heading stays in the accessibility tree is better than my recommendation.
- **M2 - fixed; deviation accepted.** Open menu: `main`, `footer`, `.skip` and `#to-top` are `inert`, and Chrome's accessibility tree drops `main` and `contentinfo`. Tab cycles brand, menu button and the six links only. Escape from a link returns focus to the button; Escape with the menu closed does not steal focus; `inert` and body overflow are restored on every close path. Keyboard activation of a link scrolls to the target and leaves focus at the document (the expected anchor behaviour). Resizing to desktop while open closes the menu and removes `inert`; the focus call is a harmless no-op there.
- **M3 - fixed.** The contrast sweep (computed colours composited over their backgrounds) found no failure in the initial state or in any of the six tabs (134-246 text elements each); unselected tab text is `#424245`; hover on `.btn` and `.gnav-cta` is `#0066cc` (5.57:1).
- **M4 - fixed.** No pill is clipped at 1024x768 (pill 2 now ends at 993 px in a 1009 px layout viewport) or at any viewport listed under H1; `calloutLeft` is unit-tested (see below).
- **M5 - fixed.** The new copy matches the READMEs' qualifiers ("keeps going through rate-limit pauses while the session stays open", "Rate-limit tolerant", "Reports back on the issue or PR", "an antipattern catalogue mined from your repository's own bug-fix history") and exposes nothing new.
- **L1 - fixed.** After toggling reduced motion on and off, `webgl` returns, the canvas is at opacity 1 and the loop runs at about 59 fps. If the toggle happens while the pinned section is on screen the layout change moves the scroll position, so the stage is correctly idle until the section is back in view (it returns on re-scroll).
- **L2 - fixed (functionally).** Forced loss and restore, twice, on the hero and on the pinned section: the CSS stack shows during the loss, the `webgl` class returns, and the restored scene matches the pre-loss frame (metal reflections, brand gradient, glass and glow intact, not dark). New console noise is L2 above.
- **L3 - fixed; deviation accepted.** The scroll chevron runs 2 iterations (3.6 s) only while `is-pinned` (verified with `getAnimations`: one `hint` animation, 2 iterations, 1800 ms, gone after the section is left); the wobble settles as described under N1.
- **L4 - partly fixed.** Pixel-ratio cap and `powerPreference` removal verified; the remaining render-on-demand part is L4 above. The 1.5 MP threshold in device pixels is a sound reading of my recommendation.
- **L5 - partly fixed.** See L1 above.
- **L6 - fixed.** In `forced-colors: active` the selected tab (AI & ML after a click) has a 2 px outline, the thumb is hidden and `.btn` has a 1 px border.
- **L7 - fixed.** `type="button"` on all six tabs; `tabindex="0"` on the five card panels (not the certificates panel); the key sequence tab, Tab, panel, Shift+Tab, tab, ArrowRight, Tab, End works; the focused panel shows a 2 px outline. html-validate no longer reports the missing button types; its only remaining report is `no-redundant-role` on the skills `<ul role="list">` (`index.html:186`), which is the deliberate VoiceOver workaround for `list-style: none` and is accepted. See L3 above for a side effect.
- **L8 - fixed; deviation accepted.** At 844x390 the copy block is 22,69 to 343,369 in the intro and in every step (nothing under the nav, nothing past 390 px); with JavaScript off and with reduced motion the lede keeps its full height (86 px) because the rule is scoped to `.scrolly`.
- **L9 - owner check pending.** Not re-raised.
- **L10 - handled by the orchestrator** (removal before merge), per the brief.
- **N1, N2, N3, N4 - fixed.** The hero glow fades out before the stage's bottom edge (no step visible in a crop at the hero boundary); the skills line is a real `list` with 10 `listitem`s, no generated separators, no dangling dot at 1440 or 390; the header stays light while the mobile menu is open over a dark section and returns to dark on close; the active nav link has `aria-current="location"`.
- **N5-N9 - out of scope this round**, as stated.

### Judgement of the remaining deviations

- **Extra commit `9c980ad` (bottom fade on the stacked `.visual`):** accepted. It removes the hard floor-glow edge; N3 above is a 20 px side effect at one size.
- **Tall stacked tablets show empty space between the canvas and the copy:** spacing, not a defect. At 768x1024 about 160 px and at 820x1180 about 230 px of dark gradient separate the floor glow from the bottom-anchored copy; nothing overlaps, and the object reads as a header for the copy below it.
- **`js/layout.js`:** imported only by `js/stage.js` (`import { ... } from './layout.js'`, a relative path with no bare specifier, so browsers without import maps still get the CSS stack from the failed stage import); the network log shows it as one more same-origin request. Its helpers, run in Node: `calloutLeft` keeps an in-bounds `x`, clamps to `mountWidth - gutter - pillWidth`, never returns a negative value even for a pill wider than the mount, and returns 815 for the round-1 failing case (x 858, pill 178, mount 1009); `idleAmplitude` is 1 up to 4 s, 0.5 at 5 s, 0 from 6 s, monotonic non-increasing, and 1 for negative age; `pixelRatioFor` returns 1 at 1440x900x1, 1.5 at 1440x900x2, 2 for a phone canvas at DPR 3 (1.32 MP), 1.5 for 3000x2000 at DPR 3, and 1 for `0` or `undefined`.

## What's good

- `js/main.js:16-17` and `css/styles.css:546` share one layout query string, with comments in both places naming the other, and the stage receives the result as data (`js/stage.js:163-166`) instead of guessing from the canvas aspect ratio; that is why H1 stays fixed across 20 viewport sizes and a live resize.
- `css/styles.css:492-501` (`.to-top` with `visibility` flipped after the fade) and `css/styles.css:254-256` (hide only `.cta-row` once the copy is fully faded) remove controls from the tab order without a visible pop, per WCAG SC 2.4.7, while keeping the h1 in the accessibility tree.
- `js/main.js:26-42` (`inert` on everything outside the header plus focus return on every close path, guarded by `if (open === !menu.hidden) return`) is the APG modal-dialog behaviour in a few lines; Chrome's accessibility tree confirms the page behind the menu disappears from assistive technology.
- `js/stage.js:78-106` rebuilds exactly what lived only on the GPU after a restore, and the restored frame matched the original in both scenes across two cycles.
- `css/styles.css:447-458` gives the no-script and failed-boot states one coherent layout (note, hidden dead controls, a header that cannot cover the hero), verified in six combinations of state and width.
- Regression sweep, all clean: 0 non-log console messages and 0 horizontal overflow (scroll width equal to client width) across a full scroll, six tab clicks and a return scroll at 1440x900, 390x844 and 768x1024; same-origin requests only (10 requests including `js/layout.js`); 35 cards, 3 certificates and counts 18, 6, 5, 5, 1, 3; all six tabs by mouse and by ArrowLeft, ArrowRight, Home and End with wrap-around; reduced-motion reload (class `js` only, no canvas, `stage.js` and Three.js never requested, 19 of 19 scrub words opaque, hero entrance animation `none`); forced no-WebGL (CSS stack, steps advance, one expected `console.error` and one page warning); vendored Three.js unchanged (5 of 5 files still byte-identical to upstream r178, and `git diff e7dd057...HEAD` touches nothing in `vendor/`, `js/data.js` or `docs/`).
- No personal contact details, employer name, internal project names or private tooling identifiers appear in the tree, the 22 commit messages on the branch, or the review docs.

## Verification checklist

- [x] every JS file passes `node --check --input-type=module` (main.js, stage.js, data.js, layout.js and the four vendored files)
- [x] page loaded over http in a real browser with a clean console at 1440x900 and 390x844 (0 console messages on load; 0 non-log messages through a full scroll and tab sweep at 1440x900, 390x844 and 768x1024)
- [x] 3D stage verified running (class `webgl`, hardware-accelerated WebGL, about 58-60 rAF/s at DPR 1) and each fallback verified: reduced motion (pass), no WebGL (pass), JS failure and JavaScript disabled (pass at 390, 768 and 1440), plus runtime reduced-motion toggle and forced context loss and restore (pass)
- [x] network log shows same-origin requests only
- [x] vendored Three.js verified against upstream r178 (5 of 5 identical; unchanged since round 1)
- [x] contrast and keyboard checks done (text-contrast sweep on all six tabs and hover states; menu, hero, tab and panel key sequences; forced-colors)
- [x] new content verified against the resume and plugin READMEs (the only content change this round is the M5 copy, checked against the three READMEs)
- [x] no PII or internal identifiers in any committed file (tree, commit messages and review docs scanned)
- [x] test state and screenshots cleaned up

### Environment, coverage and what remains unmeasured

- Branch verified: `git branch --show-current` printed `feat/apple-redesign`; HEAD `9c980ad` equals the PR head (`gh pr view`). Preview server `http://127.0.0.1:8123` (working tree). One throwaway server on another port was used for the L2 experiment and has been stopped and its copy removed.
- Browser: headless Chromium 146 (Playwright MCP) with hardware-accelerated WebGL. Not tested: Safari, iOS, Firefox, real touch, a real network. The throttled run used CDP emulation (4x CPU, 1.6 Mbps, 150 ms RTT), not a device.
- Exercised at `http://127.0.0.1:8123/`: the viewports listed under H1 for the pinned section; 1440x900, 768x1024, 820x1180, 1000x1000 and 844x390 for the hero; 390, 768 and 1440 for JavaScript-off and `main.js`-blocked loads; 844x390 for JavaScript off and reduced motion; emulations for `prefers-reduced-motion` (reload and runtime toggle), `forced-colors: active`, a stubbed `getContext` (no WebGL), a stubbed missing `ResizeObserver`, `WEBGL_lose_context` loss and restore, and device scale factors 1, 2 and 3.
- Measured here: LCP (observer, three runs plus isolating variants), pose settle (composited-frame hashes every 2 s for 28 s and pixel differences), rAF rates, pixel-ratio caps, `to-top` fade, `getAnimations` for the chevron, Chrome's accessibility tree for `inert` and `visibility: hidden`.
- Not measurable here: settle timing on slower GPUs (the 6 s hold plus fade is wall-clock time, so it should hold, but frame pacing at low fps was not observed), real screen-reader announcements (only Chrome's accessibility tree was inspected), `inert`, `mask-image` and `max-aspect-ratio` behaviour on older Safari and Firefox.
- Cleanup performed: every screenshot and snapshot I created under the Playwright MCP output directory was deleted (the three files that predated round 1 were left untouched); extra tabs and contexts were closed; media emulation was reset; the throwaway server and site copy were removed; no files were created in the host repo other than this review document.

## Action items for developer (ordered)

_None._

## Notes for next round

_None._
