# PR #2 Review - Round 4

**Plan of record:** [#2](https://github.com/amalrajbr/amalrajbr.github.io/pull/2) - Redesign portfolio (3D hero, tooling section) and update content from latest resume
**Unit:** [#2](https://github.com/amalrajbr/amalrajbr.github.io/pull/2) - Redesign portfolio (3D hero, tooling section) and update content from latest resume
**Branch:** `feat/apple-redesign` (base: `main`)
**Reviewer:** reviewer (coderabbit:code-reviewer)
**Date:** October 04, 2026 (America/New_York)
**Diff stats:** 13 files, +2272 / -583 (whole PR). Delta since the round-2 PASS (`9c980ad`): `css/styles.css` +30, `index.html` +69/-6, `js/main.js` +1/-1. (`git diff 9c980ad...HEAD` also lists the deletion of the round-1 review doc from `47cc938`; that is docs-only and not part of the site.)
**Commits reviewed:** `7b4ce2b` (round-2 doc), `47cc938` (removes the review docs from the branch), `ef0d8ab` (from `main`), `da3cdaa` (merge of `main` plus the port); PR head `da3cdaa`, which `gh pr view` reports as `MERGEABLE` / `CLEAN`.
**Prior review docs:** round 1 (CHANGES_REQUESTED) at `e7dd057:docs/reviews/pr-2/feat-apple-redesign_review_october_04_2026_1.md`; round 2 (PASS) at `7b4ce2b:docs/reviews/pr-2/feat-apple-redesign_review_october_04_2026_2.md`. The round-3 file in the working tree is an untracked orchestrator stub marked INCOMPLETE (the reviewer session hit a usage limit before it produced anything); this round is the re-run.

## Verdict: **CHANGES_REQUESTED**

## Summary

The merge with `main` is complete and safe: the Admin Tooling section, the hero sentence and the three nav links are all present, the section text is identical to `main` (checked programmatically, 1997 characters, every label and tag), nothing else from `main` was dropped, and the new section is accessible, readable without JavaScript, free of overflow from 320 to 1440 px, and correctly tracked by the scroll-spy. One Medium defect blocks the verdict, and it is not in the delta: while checking the "Plugins" section that now follows the new one, the pinned intro on short phones (320x568, partly 360x640) draws the heading and eyebrow over the 3D object (or the CSS stack when WebGL is off), with the heading below 3:1 contrast over much of its box. It is identical at the round-2 commit, so round 2 simply never tested those sizes. Against the owner's design-system fidelity bar (see the section of that name) the delta shows no visible deviation from the established look: the new section reuses the page's own type, card, pill, reveal and background-rhythm patterns, and only small off-token details remain (L2, L3). M1 is also the one place where the page falls short of the Apple-level finish. The single most important next step is M1; the fix is small and mostly CSS (see the recommendation).

## Findings

### Critical

_None._

### High

_None._

### Medium

- **M1 - On short phones the pinned "Built to build." intro puts its eyebrow and heading over the 3D object (pre-existing, found this round)**
  - **Location:** `css/styles.css:576-590` (stacked arrangement: `.scrolly .showcase .visual` is 54% of the viewport and `.scrolly .showcase-copy` is bottom-anchored with the intro lede still open); the only short-viewport compaction, `css/styles.css:594-603`, is limited to `min-width: 735px`. Framing of the object itself is in `js/stage.js` (`input.stacked`, line 166 onward).
  - **Issue:** At 320x568, progress 0.15 (the intro, before a step is active), the eyebrow sits at y 140-162 and the heading at 170-206 while the stage's mount box runs 0-307. In the screenshot the plates run behind both lines. To measure legibility I made the three text elements transparent, took a clipped screenshot of each box and decoded the pixels in the page: for the heading (`#f5f5f7`) 55% of the sampled pixels of its box give less than 4.5:1 (53% less than 3:1, lightest pixel 1.05:1); for the eyebrow (`#a1a1a6`) 87% give less than 4.5:1 and the best case is 2.44:1. These are shares of the whole text box, not of the glyphs, but the screenshot shows glyphs on the plates. In step 0 (progress 0.4) the eyebrow moves to y 252-274 and still touches the lowest plate. With WebGL forced off the CSS stack (`.stack-fallback`, y 71-235 here) covers the same lines and the first line of the lede. At 360x640 (intro) the plate's lowest corner crosses the left of the eyebrow (15% of its box under 3:1); the heading and lede are clear (at least 6.97:1). At 375x667 only a corner glint touches the eyebrow (1.3% of its box under 3:1, not a legibility problem), and 390x667, 390x844, 768x1024 and 1440x900 are clean (viewed).
  - **Pre-existing:** In a throwaway copy of `9c980ad` (the round-2 commit, port 8124, since stopped and deleted) the geometry is identical: eyebrow 140-162, heading 170-206, mount 0-307 at 320x568; 234-256, 264-300, 0-346 at 360x640. The delta does not touch the showcase CSS (the eyebrow text changed from "Developer tooling" to "Claude Code plugins", one line either way). Round 2's size list did not include phones shorter than 667 px.
  - **Impact:** On 320x568 and, less severely, 360x640 phones the first third of the pinned section has a heading and label that are partly unreadable over the object; the same class of defect as round-1 H1, with much smaller reach (phones at most 640 px tall, intro and first step only).
  - **Rule cited:** WCAG 2.2 SC 1.4.3 Contrast (Minimum): 4.5:1 for text and 3:1 for large text, measured against the actual background; the brief for this round names 320 px wide and 568 px tall as supported sizes (menu, section layout).
  - **Recommendation (keep the design, do not strip it):** Preferred: give short stacked viewports (`max-height: 640px`) a compact framing of the object, smaller and lifted into the room between the nav and the copy (lower `.visual` height from 54%, or scale and lift the plates in `js/stage.js` when `stacked` and the canvas is short; apply the same change to `.stack-fallback` and its `--fb-top`), so the object, the heading and the lede all stay. Only if that leaves the object too small to read at 320x568 (about 90 px of free height above the intro copy there), fall back to the pattern the page already uses for short landscape: start the intro in the compact state with the lede collapsed (`css/styles.css:600-601`, pinned mode only, so the static and reduced-motion layouts keep their lede). That fallback hides one paragraph for the first third of the section on those phones, so use it only when the first option cannot fit. Either way, re-measure at 320x568, 360x640, 375x667 and 390x667 at progress 0.15, in step 0 and in step 1, with WebGL on and forced off.

### Low

- **L1 - The `.tool-card` hover lift never fires when JavaScript is on, and its shadow snaps instead of easing**
  - **Location:** `css/styles.css:470-475` (`.tool-card` transition and `:hover`), `css/styles.css:134-139` (`.js [data-reveal]`, `.js [data-reveal].in`), `css/styles.css:617`.
  - **Issue:** `.js [data-reveal].in { transform: none }` has specificity (0,3,0) and beats `.tool-card:hover { transform: translateY(-4px) }` (0,2,0). In the browser, hovering the first card for 1.5 s gave `transform: none` with `:hover` matched, and only the shadow changed, instantly, because `.js [data-reveal]` (0,2,0) also overrides `.tool-card`'s `transition` list (computed `transition-property: opacity, transform`). The lift works only with JavaScript off. Under `prefers-reduced-motion: reduce` the lift is off as well (the rule at line 617 wins), which is acceptable. The `opacity 1s` in `.tool-card`'s own transition list only shows in the failed-boot path, where it gives the two cards a 1 s fade-in when `.js` is dropped; harmless.
  - **Pre-existing pattern:** the experience cards share it (`css/styles.css:415-420`; hovering the first Backend card also gave `transform: none`), so the new cards copy an existing dead declaration.
  - **Impact:** Cosmetic; the intended 4 px lift and eased shadow are not seen in the normal mode.
  - **Rule cited:** CSS Cascade Level 4, specificity and order of appearance: a declaration that can never win is dead code; MDN "CSS transitions" (the transition used is the one on the winning rule).
  - **Recommendation:** Make the lift work, since a hover response on the cards is part of the polished look: for both card types, lift with the independent `translate: 0 -4px` property (which `transform: none` does not reset) inside `@media (prefers-reduced-motion: no-preference)`, and give the cards their transition list at `.js .tool-card[data-reveal]` / `.js .card[data-reveal]` (including `translate` and `box-shadow`) so it is not overridden. Do not resolve this by deleting the hover treatment.
- **L2 - A few off-token sizes in the new section (visible only side by side)**
  - **Location:** `css/styles.css:461-486`.
  - **Issue:** Computed at 1440x900 against the nearest existing equivalents. `.tool-card h3` is 28 px / 700 / -0.03em; the page's card tiers are `.card h3` 20 px / 600 / -0.025em (24 px on `.span2`), `.domain h3` 22 px / 600, and `.step h3` 34 px / 700 / -0.035em, so 28/700 sits between tiers. `.tags-row li` is 13 px with 6 px 13 px padding on `#fff`, a fourth pill size next to `.card .tags li` (12 px, 4 px 10 px), `.chips li` (12 px, 5 px 11 px) and the callouts (13 px, 7 px 13 px). `.tool-note` is 14 px against 15-17 px for the other paragraph tiers (14 px appears only in `.step-kicker`). `.admin` padding is `clamp(80px, 12vw, 160px)` against `clamp(80px, 12vw, 168px)` on `.stack` and `.recognition`.
  - **Impact:** None a visitor would name on its own; in the screenshots the new cards read as a larger "featured" tier of the same family. Listed so the system stays tight.
  - **Rule cited:** the page's own tokens and type tiers in `css/styles.css` (owner design-fidelity instruction).
  - **Recommendation:** Snap to existing tiers where it costs nothing: the card title to the `.card.span2` size (24 px / 600) or to `.step h3`'s tier, the chip row to 12-13 px with the `.chips` padding, `.admin` to the 168 px clamp. If the larger title is a deliberate "featured card" tier, keep it and say so in a comment.
- **L3 - The "Highlights" and "Result" run-ins are the one piece that keeps the old page's presentation**
  - **Location:** `index.html:154-155` and `index.html:172-173`; `css/styles.css:479-480`.
  - **Issue:** The words are carried over verbatim (correctly), but the "Highlights" lists are still one 14 px sentence with literal `&middot;` separators, as on the Tailwind page, and wrap mid-item at card width (for example "CSV column / selection" over two lines). Everything else in the section is typeset like the rest of the redesign; this is the line a design-savvy visitor reads as "template". The redesign already turned the skills line into a real list for the same reason.
  - **Impact:** Polish only; legible and aligned.
  - **Rule cited:** owner design-fidelity instruction; WAI-ARIA / HTML list semantics (a list of discrete items belongs in a `ul`).
  - **Recommendation:** Keep every word, change only the markup and styling: render each Highlights list as a `ul` of items separated by hairline or spacing (or small tertiary chips in `--ink-3`), so items no longer break mid-phrase and the middle dots are not read out. Keep "Highlights:" and "Result:" as the leading labels.

### Nits

- **N1 - `aria-current="location"` stays on the last section link when the viewport returns to the hero or the contact block (pre-existing logic, same with six links).** `js/main.js:46-57`: the observer only sets and clears the attribute when one of the six sections crosses the mid-viewport line, and neither `#top` nor `#contact` is observed. After an instant `scrollTo(0, 0)` from the pinned section the nav still marked "Plugins", and at the contact block it keeps "Recognition". Within the six sections the behaviour is correct in both directions (see the status section). WAI-ARIA 1.2 `aria-current`: the value should describe the current location. Observe `#top` and `#contact` and clear the attribute for them.
- **N2 - Two consecutive `@media (max-width: 900px)` blocks.** `css/styles.css:541-547`: the new `.tool-cards` rule is a second block with the same query right after the nav-collapse block. Merge it into the first one. Style only.

### Information for the owner (does not affect the verdict)

The first Admin Tooling card's body text (`index.html:153`) names two organisations, as the live `main` text does and as carried over on purpose. The new current-role cards elsewhere deliberately name no employer or product. Worth a conscious decision by the owner; not a defect of this PR.

## Status of prior findings

- **Round-1 H1 (pinned section at tablet-portrait widths) - still fixed.** Re-checked at 1440x900 and 768x1024: boundary, pinned intro and step 1 look as in round 2, the object never overlaps the copy. See M1 for the new short-phone observation, which is a different size class.
- **Round-1 H2 (no-JS / failed-boot fallback) - still fixed, now including the new section.** Detail under B and D below.
- **Round-1 M2 (menu `inert`) - re-checked:** the seven-item menu closes on Escape, restores `inert` on `main` and the body overflow at six sizes, and a link click closes it and lands on the target. Round-1 M1 (hero controls) is untouched by the delta (only the hero sentence changed).
- **Round-1 M3 (contrast) - holds for the new section:** the lowest text pair is 4.66:1.
- **Round-1 M4, M5, L1-L8, N1-N4 - not affected by the delta** (the only changes touching them are the hero sentence, the plugin eyebrow label and the nav labels; `git diff 9c980ad HEAD -- js/stage.js js/layout.js js/data.js vendor/` is empty).
- **Round-2 Low/Nit follow-ups - none made worse.** The new section sits between the two stage mounts and the render loop is idle there (0 `requestAnimationFrame` calls in 2 s with the section in view, against 110 in the hero and 117 in the pinned section), so the render-on-demand item (round-2 L4) is not worse. The hero lede is of similar length (round-2 L1). Panel focus margin, wobble length, `.panel:empty` and the 20 px fade are untouched.
- **L9 (Cloud Practitioner "Valid thru 2028") and the PR body's "Decisions to confirm" - not re-raised.**

## Design-system fidelity

Owner bar: the site must read as a software-engineer portfolio at Apple web-design quality, with no deviation from the established system. Judged as a visitor at 1440x900 and 390x844 (hero, overview, Admin Tooling, the pinned plugin section, Experience), and by comparing computed styles of the new elements with their nearest existing equivalents at 1440x900.

- **Verdict on the delta: no visible deviation; two Low clusters (L2, L3).** The new section does not read as a template and does not clash with its neighbours.
- **Type.** `#admin-tooling .eyebrow`, `.section-title` and `.lede` are the shared classes and compute identically to the Overview, Stack and Recognition equivalents: eyebrow 20.64 px / 600 / -0.012em, title 68 px / 700 / -0.04em / 1.06, lede 28 px / 500 (the same as the hero, plugin and Stack ledes; Experience uses its own 22 px lede). Left alignment matches Overview and Stack; Experience, Recognition and Contact are centred, so the page keeps its alternation. The hero sentence change wraps to four lines at 1440 and stays balanced.
- **Cards.** `.tool-card` equals `.card` in radius (24 px), shadow (`0 0 0 1px` at 4% black), background (`#fff` on `--bg-2`), ink tokens (`--ink`, `--ink-2`, `--ink-3`) and the in-card tag pills (12 px, 4 px 10 px, `--bg-2`, identical to `.card .tags li`). Padding scales `clamp(24px, 3vw, 36px)` against 28 px on `.card`, a deliberate larger tier for two feature cards against 35 grid cards. The grey-section-with-white-cards pattern is the Experience pattern; the new section also inverts the Overview tiles (grey tiles on light) the way the page already alternates.
- **Rhythm.** Section backgrounds now run light (`#fbfbfd`), grey (`#f5f5f7`), black, grey, light, near-black, light. The Overview-to-Admin step is as subtle as Experience-to-Stack, and Admin-to-Plugins is the same hard light-to-black edge the page already uses; the header tint flips at exactly the 48 px line. Section padding follows the clamp family (L2 notes the 8 px at the cap).
- **Motion.** The new elements use the shared `[data-reveal]` fade-up with the same stagger variable (`--i`) and the same `--ease`; no new keyframes, nothing runs on its own. Hover behaves like the Experience cards: a shadow, and the lift that is dead for both (L1).
- **Nav and controls.** Six links with the existing `clamp(18px, 2.8vw, 38px)` gap fit with room to spare from 901 px; the active-link treatment (full opacity plus `aria-current`) and the blur/tint behaviour are unchanged; the seven-item overlay uses the same 30 px / 600 rows and scrolls on very short phones; "Plugins" and the eyebrow "Claude Code plugins" read cleanly against "Admin Tooling" and "Built to build.".
- **Better or worse than its neighbours.** Better: it is the cleanest long-form block on the page (generous top padding, a clear title-lede-chips-cards sequence) and the white-on-grey chip row is as crisp as anything in the hero. Worse: the cards are the densest text on the page (five blocks each, with 14 px notes) and the Highlights run-ins (L3) are the only unredesigned element; the 28 px card title is a tier the rest of the page does not use (L2).
- **The pinned plugin section.** Intact and as polished as in round 2 at 1440x900 and 768x1024, but on 320x568 and 360x640 it falls short of the bar (M1).
- **Fix guidance.** M1 and L1 recommendations are written to keep the design (a compact object framing and a working hover lift, with collapsing the lede only as a last resort for the very shortest phones). None of the recommendations removes or flattens an owner-requested feature.

## What's good

- `index.html:136-189`: the new section is plain, static HTML with `aria-labelledby="admin-title"` (its computed region name is the heading text), one `h2` then two `h3`, real `ul` lists for the chip row and the tag rows, `article` per card, and no redundant roles; html-validate reports nothing about it beyond the repository's existing `style="--i:n"` stagger convention.
- Content fidelity: the section text extracted from `origin/main:index.html` and from the branch is identical (1997 characters), including both `h3` titles, the four "Highlights" and "Result" labels, the five chips and the 8 and 10 card tags in order. The hero sentence, and the three nav entries (`index.html:59`, `77`, `362`), match `main`.
- `css/styles.css:460-486` uses the existing tokens, so every text pair clears AA with margin where it matters (`.tool-body` and `.tool-note` 10.01:1, `.tool-sub` and the chip text 5.07:1, the lowest 4.66:1).
- `css/styles.css:545-547` switches the cards to one column at exactly the width where the nav collapses (900), so the two layout changes never disagree.
- `js/main.js:57` adds `admin-tooling` to the scroll-spy list with no other logic change; the `on-dark` tint rule (`js/main.js:107`) needed no change because the new section is light and its neighbours are unchanged.
- The `html:not(.js)` path needed no new rules: the section is not behind any `.js` selector, so it is fully visible with JavaScript off and with `main.js` blocked.
- The rename of the plugin section's label to "Plugins" left no stale reference: the only remaining `#tools` occurrences are the id, the three links and the JS selector, all consistent.

## Verification checklist

- [x] every JS file passes `node --check --input-type=module` (`main.js`, `stage.js`, `data.js`, `layout.js` and the four vendored files)
- [x] page loaded over http in a real browser with a clean console at 1440x900 (0 messages after load, scroll and the pinned-section checks) and 390x844 (0 messages through a full scroll and six tab clicks)
- [x] 3D stage verified running (class `js scrolly webgl`, canvas present) and each fallback verified: reduced motion (pass), no WebGL (pass at 1440x900; the CSS stack and the expected `console.error` plus one warning), JavaScript disabled (pass at 1440, 768, 390 and 320), `main.js` blocked (pass at 1440 and 390) and a boot failure by blocking `js/data.js` (pass at 1440 and 390)
- [x] network log shows same-origin requests only (11 requests at 390x844, all `127.0.0.1:8123`)
- [x] vendored Three.js compared with upstream r178 (fetched from unpkg, SHA-256): 5 of 5 identical (`three.module.min.js`, `three.core.min.js`, `RoomEnvironment.js`, `RoundedBoxGeometry.js`, `LICENSE`); unchanged since round 2
- [x] contrast and keyboard checks done (composited contrast of every text pair in the new section; nav links, tabs by ArrowLeft/Right/Home/End, focus ring on the new nav link, Enter on nav links, menu Escape); M1 above is the one contrast failure found
- [x] design-system fidelity (owner bar) judged as a visitor at 1440x900 and 390x844 from the hero through Overview, Admin Tooling and the plugin boundary to Experience, with computed-style comparisons of the new elements against `.card`, `.domain`, `.step`, `.chips`, `.eyebrow`, `.section-title` and `.lede` (see the section above)
- [x] content verified against the carried-over `main` text (programmatic comparison), the resume and the plugin READMEs for the unchanged copy
- [x] no PII or internal identifiers introduced in the delta or in the four commit messages (the owner's public contact address that was already on the page is the only address; no phone number or address anywhere)
- [x] test state and screenshots cleaned up

### A. Merge resolution

`git merge-base --is-ancestor origin/main HEAD` holds; `git grep -nE '^(<<<<<<<|=======|>>>>>>>)'` finds nothing; nothing under `docs/` is tracked at `da3cdaa` (the committed copy of this review doc will be, so it must be removed before merge exactly as `47cc938` did: Pages publishes from `main`); `README.md` and `PLAN.md` are identical to `main`; every `href="#..."` target exists, every `aria-labelledby` resolves and there are no duplicate ids. The three pieces from `ef0d8ab` (section, hero sentence, nav links) are all present; the old `#experience, #admin-tooling { scroll-margin-top: 65px }` has no counterpart and needs none, because the new design's fixed header is 48 px and the section keeps 80-160 px of top padding (the heading lands at 110 px after a menu jump at 390 px).

### B. The new section

- Contrast (computed, composited): eyebrow 4.66:1 (20.6 px, 600), `h2` 15.46:1, lede 4.66:1 (28 px), chip text 5.07:1 on white, `h3` 16.83:1, `.tool-sub` 5.07:1, `.tool-body` and `.tool-note` 10.01:1, "Highlights:" and "Result:" labels 16.83:1, card tags 4.66:1 (12 px on `#f5f5f7`).
- Layout, `#admin-tooling` scrolled into view: 1440x900, 1024x768, 920x768, 901x768, 900x768, 768x1024, 390x844, 360x740 and 320x568. No horizontal overflow, no element outside the viewport, no clipped box; two columns at 901 and wider, one column at 900 and below; every reveal element has class `in`. At 320 the heading wraps to three lines and nothing is cut.
- Header: at 901, 920, 960, 1000, 1024, 1040, 1068, 1100, 1200 and 1440 px (768 px tall) the six links fit on one line; the narrowest gap between links is 25.2 px (at 901), the gap from the last link to the Contact button is at least 129 px, nothing wraps or overflows.
- Mobile menu: seven items occupy y 68-580; at 390x844, 390x667, 375x667 and 360x640 they fit, at 320x568 the overlay scrolls (scroll height 612 against 568, the last link reachable at scroll 44) and at 568x320 as well (612 against 320, reachable at 292). Escape closes it and restores `inert` and the body overflow.
- Keyboard and focus: the section has no focusable controls, so Tab passes through it (from the "Admin Tooling" link the next stop is the walkthrough link inside the plugin section); the nav link shows a 2 px focus ring and Enter lands the section at the top with the heading at 198 px. The only keyboard anomaly seen was a test artefact: pressing Enter during the smooth focus scroll from a preceding Tab raced two smooth scrolls; with a pause the jump lands exactly.
- Reduced motion (reload): class `js` only, no canvas, only `styles.css`, `main.js` and `data.js` requested, all six reveal elements opaque, scroll-spy still moves, hover gives the shadow only.
- JavaScript disabled, `main.js` blocked and boot failure: the section is fully visible (all six reveal elements opaque, text length 2028 characters of rendered text), six nav links visible, no menu button, no overflow; below 900 px the header is static and wraps to two rows at 390 (header bottom 105 px, hero copy top 221 px).

### C. Scroll-spy and navigation

At 1440x900, centring each section in the viewport, `aria-current="location"` is on Overview, Admin Tooling, Plugins, Experience, Stack and Recognition in that order and again in reverse; at the contact block it stays on Recognition. The header turns `on-dark` exactly when the plugin section's top reaches 48 px (not at 49), stays light over the Overview/Admin boundary and over the Admin section. From the mobile menu at 390x844 and 320x568 both "Admin Tooling" and "Plugins" close the menu and land on their target. No stale "Tools" reference remains in `index.html`, `css/styles.css`, `js/main.js`, `js/stage.js`, `js/layout.js` or `README.md` (comments name "developer tooling" and "tooling showcase", which still describe the section accurately).

### D. Regression sweep

35 cards, 3 certificates and tab counts 18, 6, 5, 5, 1, 3; all six tabs by mouse and by keyboard (ArrowRight through all six with wrap, ArrowLeft, End, Home, then Tab to the focused panel with a solid outline). The Admin Tooling to Plugins boundary at 1440x900 and 768x1024: the two sections are contiguous (gap 0), the canvas begins at the plugin section's top, the pinned intro and step 1 render as in round 2 and the back-to-top button hides while pinned. The stage is idle while the Admin section is in view (0 animation-frame requests in 2 s).

### Environment, coverage and what remains unmeasured

- Branch verified: `git branch --show-current` printed `feat/apple-redesign`; HEAD `da3cdaa` equals the PR head. The working tree was clean except for the untracked `docs/` bookkeeping. The preview server `http://127.0.0.1:8123` was confirmed to serve the HEAD bytes (SHA-256 of `index.html`, `css/styles.css` and the four JS files equal their `git show HEAD:` hashes).
- Browser: headless Chromium through the Playwright MCP tools with WebGL. Not tested: Safari, iOS, Firefox, real touch, a real network, a real screen reader (only Chrome's accessibility tree: the region name and heading levels were read from it), Windows forced colours for the new cards (they have no border, like the existing cards).
- Emulations and states: `prefers-reduced-motion: reduce` (reload), forced no-WebGL (stubbed `getContext`, in a throwaway tab that was closed), JavaScript disabled (separate browser contexts), `main.js` blocked and `js/data.js` blocked (route abort), viewports as listed above.
- One throwaway server (port 8124, a copy of `9c980ad` under the scratchpad) was used for the M1 comparison; it was stopped and its copy deleted.
- The design-fidelity pass was added after the first commit of this document, on the same head (`da3cdaa`; the site files are unchanged since). Visual pass: viewport screenshots at 1440x900 (overview end, Admin top, Admin cards, Experience top, hero) and 390x844 (hero, Admin top, both cards, boundary, Experience).
- Cleanup performed: every screenshot, snapshot and console log I created (including one that landed in the repository root of the working directory) was deleted and the pre-existing files in `.playwright-mcp` were left alone; the tab was reset to `about:blank`; media emulation was reset; no servers or files were left in the host repo besides this review document.

## Action items for developer (ordered)

1. **M1:** make the stacked pinned section height-aware so that at 320x568 and 360x640 the intro heading and eyebrow clear the 3D object and the CSS stack, keeping the design: compact framing of the object first (smaller and lifted, `.visual` height, `js/stage.js` framing, `.stack-fallback`), collapsing the lede only as the last resort; re-measure at the listed sizes, progress 0.15, step 0 and step 1, with and without WebGL.
2. **L1 (recommended):** make the card hover lift work with JavaScript on (independent `translate`, transition list on `.js .tool-card[data-reveal]` and `.js .card[data-reveal]`), for both card types; do not remove the hover treatment.
3. **L2, L3 (recommended, design polish):** snap the new section's sizes to the existing tiers (or document the "featured card" tier); re-typeset the Highlights run-ins as list items, words unchanged.
4. **N1, N2 (optional):** observe `#top` and `#contact` to clear `aria-current`; merge the second `max-width: 900px` block.

## Notes for next round

- Re-run the M1 measurements: eyebrow, heading and lede boxes against the plate pixels at 320x568, 360x640, 375x667 and 390x667 at progress 0.15, in step 0 and in step 1, with WebGL on and forced off; confirm 1440x900, 768x1024, 844x390 and 568x320 are unchanged (the short-landscape rule at `css/styles.css:594-603` must not regress).
- Re-run the design-fidelity comparison for anything the developer touches (card title, chip row, Highlights markup, hover, pinned framing): computed styles against the existing tiers and a visual pass at 1440x900 and 390x844, so that no fix flattens a design feature.
- Re-confirm A (merge cleanliness, nothing under `docs/` tracked) after the developer's commits and after this review doc has been removed from the branch, and re-run `node --check` on `js/stage.js` and `js/main.js` if either changes.
