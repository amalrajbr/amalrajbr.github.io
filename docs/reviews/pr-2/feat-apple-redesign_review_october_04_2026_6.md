# PR #2 Review - Round 6

**Plan of record:** [#2](https://github.com/amalrajbr/amalrajbr.github.io/pull/2) - Redesign portfolio (3D hero, tooling section) and update content from latest resume
**Unit:** [#2](https://github.com/amalrajbr/amalrajbr.github.io/pull/2) - Redesign portfolio (3D hero, tooling section) and update content from latest resume
**Branch:** `feat/apple-redesign` (base: `main`)
**Reviewer:** reviewer (coderabbit:code-reviewer)
**Date:** October 04, 2026 (America/New_York)
**Diff stats:** 14 files, +2504 / -583 (whole PR, including the tracked round-4 review doc). Delta since the round-4 head `da3cdaa`, site files only: `css/styles.css`, `index.html`, `js/main.js`, 91 insertions and 17 deletions.
**Commits reviewed:** `da3cdaa..cc8a598`: `1f01e59` (M1), `2c8f526` (L1), `724b901` (N1, N2), `8cc778c` (M1 stand-in, superseded), `262b1a5` (M1 lede fade), `e220c84` (L2), `239508d` (L3), `cc8a598` (M1 gate widened to 840 px tall), plus my own round-4 doc commits `1ae40b5` and `2746e68`. PR head `cc8a598`, `gh` reports `MERGEABLE` / `CLEAN`.
**Prior review doc:** round 1 `e7dd057:docs/reviews/pr-2/feat-apple-redesign_review_october_04_2026_1.md` (CHANGES_REQUESTED); round 2 `7b4ce2b:docs/reviews/pr-2/feat-apple-redesign_review_october_04_2026_2.md` (PASS); round 4 `2746e68:docs/reviews/pr-2/feat-apple-redesign_review_october_04_2026_4.md` (CHANGES_REQUESTED, M1). The round-3 and round-5 files in the working tree are untracked orchestrator stubs marked INCOMPLETE (interrupted reviewer sessions); neither was edited or staged.

## Verdict: **PASS**

## Summary

The round-4 blocker is fixed and everything else the developer changed holds up. M1: in a pixel-level re-measurement (glyph pixels found by differencing screenshots with and without the text) no text pixel falls below 4.5:1 in any of the 136 pinned states I re-ran (30 sizes: phones from 320x568 to 430x932 and the 735-882 px wide windows the same gate catches, intro and steps, WebGL on and off), and round 4's own measure (share of the whole text box under 4.5:1) drops from 55-87% to 0.0% at 320x568; the compact layout also still reads as Apple-level (the object is the hero of the screen). L1 to L3, N1 and N2 are fixed as described, the Admin Tooling text is identical to `main` word for word, and layouts outside the compact gate are pixel-identical to the round-4 head apart from the scrollbar thumb. What remains is two Low items and two Nits; none needs another round.

## Findings

### Critical

_None._

### High

_None._

### Medium

_None._

### Low

- **L1 - The new `ul.tool-points` lists may lose their list semantics in Safari with VoiceOver**
  - **Location:** `index.html:158` and `index.html:192` (`<ul class="tool-points">`), `css/styles.css:494` (`.tool-points`), global `ul, ol { list-style: none }` at `css/styles.css:46`.
  - **Issue:** WebKit has long removed list semantics from a `ul` whose `list-style` is `none` unless it carries `role="list"` (the reason `ul.skills` at `index.html:277` has it). Chrome's accessibility tree is correct here (`term` "Highlights:", `definition` containing `list` with `listitem`s, then `term` "Result:" and its `definition`; no role attribute needed), but I could not test Safari. If WebKit still applies the heuristic, VoiceOver users hear the five or six items without "list, 5 items". The same is true of the chip and tag lists elsewhere on the page (`.tags`, `.chips`, `.tags-row`), none of which carries the role, so this is a page-wide convention, not something this delta introduced.
  - **Impact:** Small: the items are still read in order inside their `dt`/`dd` pair; only the item count announcement can be missing, and only in Safari.
  - **Rule cited:** WAI-ARIA 1.2 `list` role and Scott O'Hara's "Fixing lists" practice (the rule the repository already follows once); HTML Living Standard `ul`.
  - **Recommendation:** Lightest fix: add `role="list"` to the two `ul.tool-points`. html-validate reports it as `no-redundant-role`, exactly as it already does for the skills list, which the project has accepted. If the owner wants consistency, do the same for `.tags`/`.chips` in one pass; otherwise leave as is.

- **L2 - The compact pinned layout switches at a hard 840 px height cliff, which an iOS dynamic toolbar could cross mid-scroll (not reproducible here)**
  - **Location:** `css/styles.css:607-633` (`@media (max-aspect-ratio: 21/20) and (max-height: 840px)` at line 616), and the CSS comment on that block, which states the risk itself.
  - **Issue:** At 840 px and below the pinned section uses the compact framing; at 841 and up the previous layout. Side by side at 390x840 and 390x844 the intro differs visibly (26 px against 34 px title, a different object size and copy position), though both are clean and the steps look nearly identical. The media query measures the viewport height, which in iOS Safari changes while the toolbar collapses, while the stage is `100svh` and does not. A tall phone (about 430x932, 790 px with the toolbar and 932 px without) can therefore cross the gate while the user is scrolling inside the pinned section, swapping layouts under their thumb. Headless Chromium has no dynamic toolbar, so I could verify the cliff (390x840 against 390x844, loaded separately) but not the iOS trigger.
  - **Impact:** At worst a one-time layout jump on a few tall iPhones; no overlap or legibility problem on either side (both sides measured clean).
  - **Rule cited:** CSS Values and Units Level 4 (`svh`, `lvh`, `dvh`: viewport units that do and do not follow browser UI) against Media Queries Level 4 `height`, whose behaviour with a dynamic browser toolbar is browser-dependent rather than specified.
  - **Recommendation:** Verify once on a real iPhone with a Pro Max-sized screen. If it jumps, key the compact block off a fixed-size box instead of the window: a container query needs a size-contained element above the elements it restyles, and the block's first rule restyles `.showcase-stage` itself, so this needs a small markup change (an inner wrapper that takes over the flex column, with `container-type: size` on the stage and `@container (max-height: 840px)` on the wrapper's children), after which the query follows `100svh`, which does not change while the toolbar moves. Keep every declaration of the block as it is.

### Nits

- **N1 - The last item of each "Highlights" list keeps its full stop, and an odd count leaves one item alone on the third row at 1440 px.** `index.html:163` ("read-only export logs.") and `index.html:198` ("Slack notifications."): the sentence's closing period travels with the last item because the words are verbatim, so the other items have no punctuation and the last one does; in the first card at 1440 the fifth item sits alone on a third row. Both are the price of the verbatim constraint; moving or dropping the period is a copy decision for the owner, and a visible oddity only on close reading.
- **N2 - The compact block depends on container-query units (`cqh`).** `css/styles.css:620-624`: supported in Chrome 105+, Safari 16+ and Firefox 110+; older browsers lose the sizing of the CSS stand-in in that portrait range only (the 3D object is unaffected). Information only.

### Information for the owner (does not affect the verdict)

Unchanged from round 4: the first Admin Tooling card's body text (`index.html:153`) names two organisations, as the live `main` text does.

## Status of prior findings

- **Round-4 M1 (pinned intro over the object on short phones) - fixed.** I re-ran my own measurement, not the developer's. Method: for the eyebrow, title, lede (intro) or active step kicker, title and paragraph (steps), a screenshot with the text and one with it transparent; the pixels that differ are the glyphs, and each is scored against the pixel beneath it. WebGL on: 320x568, 360x640, 375x667, 390x667, 360/375/390/412 x 740, 360/390/412 x 800, 375x812, 360/390/412 x 820 and 360/390/412 x 840, at pinned progress 0.15 (intro), 0.4 (step 0) and 0.7 (step 1). WebGL off (forced, stubbed `getContext`): 320x568, 360x640, 375x667, 390x667, 360/375/390/412 x 740, 360/390/412 x 800 and 375x812 at all three states; 360/390/412 x 820 and x 840, 390x844 and 412x915 at 0.15 and 0.4. Result: 0 glyph pixels under 4.5:1 and 0 under 3:1 in every state (between 6,000 and 11,000 glyph pixels per state); the lowest contrast anywhere is 6.77:1 (the 14 px step kicker). I also ran the boundary above the gate in the worst case (WebGL off, intro) at 375x860, 390x860, 412x870, 390x900 and 430x932: lowest 6.98:1. The intro-to-step-0 hand-over was sampled every frame at 390x740 (WebGL on): at the cross-over the lower of the lede's and the step's opacities peaks at 0.18, for less than 150 ms, and the reverse hand-over peaks at 0.18 as well, so two paragraphs are never both legible on top of each other. Round 4's own measure re-run, because the glyph mask only counts pixels that change by at least 60 in some channel and could in principle miss text on a plate of similar brightness: with the text made transparent, the share of all pixels of the text box under 4.5:1 and under 3:1, intro, WebGL on and off. 320x568: eyebrow 0.0% / 0.0% (round 4: 87% / 80%), title 0.0% / 0.0% (round 4: 55% / 53%), lede 0.0% / 0.0%; 360x640: eyebrow 0.0% / 0.0% (round 4: 15% / 14.5%); 375x667: eyebrow 0.0% / 0.0% (round 4: 6.6% / 1.3%). The mount box now ends before the copy starts (48-244 against 252 at 320x568; 48-338 against 346 at 360x640; 48-365 against 373 at 375x667), and the glyph counts are constant (eyebrow 709-711, title exactly 1413 at every compact phone size), so no text dropped out of the mask. The gate also matches windows 735 to 882 px wide up to 840 px tall, where the 735 px type tiers apply inside the compact block; I ran 735x760, 768x780, 800x800, 840x840 and 882x840 at intro, step 0 and step 1 with WebGL on and at intro and step 0 with it off: 0.0% of every text box under 4.5:1 in every state, the copy block ends at the viewport bottom by design and the active step's chips end 26 px above it, the object's box is 397 to 476 px tall, and the views at 735x760, 800x800 and 882x840 show a large, unclipped object with the copy block clear below it. Compact framing judged as a designer under Design-system fidelity.
- **Round-4 M1, "unchanged" sizes - confirmed.** With WebGL off, the pinned section at 0.15, 0.4 and 0.9 on this head against a throwaway copy of `da3cdaa` (port 8124, since stopped and removed): 390x844, 412x915, 768x1024, 820x1180, 1024x768, 1440x900, 844x390, 568x320, 1000x1000, 1050x1000, 1060x1000, 900x850, 1366x768, 360x841 and 320x844 differ by 74 to 330 pixels per frame (about 1,100 at the two later states of 1050x1000). For four of those frames (1050x1000 at 0.4 and 0.9, 390x844 at 0.15, 1440x900 at 0.4) I located the differing pixels: all inside the scrollbar thumb column, whose length changes because the page got shorter; I did not locate the rest, but the counts are of the same size. This includes the round-2 H1 sizes.
- **Round-4 L1 (hover lift dead with JavaScript on) - fixed.** Real mouse hover at 1440x900 with JS on: on a `.tool-card` and on a Backend `.card` with `--i:2`, `translate` eases `0 -0.06px`, `-2.66px`, `-4px` over about 0.55 s with no stagger delay (the computed delay list is `0.18s, 0.18s, 0s, 0s` for opacity, transform, translate, box-shadow), the second shadow layer eases 0.004, 0.133, 0.2, `transform` stays `none` (no double lift), and at rest both `transform` and `translate` are `none`. Under `prefers-reduced-motion: reduce` there is no lift on either card type and the shadow appears. With JS disabled the lift still runs (`translate` reaches `0 -4px`, `transform` `none`, shadow eases); I read the value on leaving mid-ease, so I did not record the final rest value for the JS-off case.
- **Round-4 L2 (off-token sizes) - fixed.** See Design-system fidelity: `.tool-card h3` 24 px / 600 / -0.025em is the `.card.span2 h3` tier; `.tags-row li` 12 px, 5 px 11 px is the `.chips li` tier; the new text rows are 15 px / -0.016em like `.card p`; `.admin`, `.stack` and `.recognition` all compute 168 px / 168 px.
- **Round-4 L3 (Highlights and Result run-ins) - fixed.** The section text (`<section id="admin-tooling">`) extracted from `origin/main:index.html` and from this head: 275 tokens each, punctuation included, identical; the only difference is the nine standalone middle dots, now absent. Each Highlights list equals `main`'s dot-separated segments per card (5 and 6 items); chips, titles and tags unchanged. Semantics are valid and correct in Chrome's tree (see L1 for Safari). Columns: 1440 px two columns (3 rows), 1024 px one column (5 and 6 rows), 768 px three columns (2 rows), 390 and 320 px one column; no element outside the viewport, no horizontal overflow, no list item taller than two lines at any of them. Contrast: `dt` 16.83:1, `dd` and items 10.01:1, hairline 1.25:1 (decorative row separators, not information). JS disabled (390 px), `main.js` blocked and `js/data.js` blocked (boot failure): every `dl`, `dt`, `dd` and list item (21 with the two `dl`s, 19 without) visible and opaque, no overflow.
- **Round-4 N1 (scroll-spy mark at hero and contact) - fixed.** At 1440x900, instant jumps to each section centre: Overview, Admin Tooling, Plugins, Experience, Stack, Recognition going down; "-" (cleared) at the contact block, at the page bottom and at the hero; correct again going back up through all six; after a fresh load the mark is absent; after "back to top" (click on `#to-top` from the bottom) it is cleared at `scrollY` 0.
- **Round-4 N2 (duplicate media block) - fixed.** At 900 px the nav and Contact are hidden, the menu button shows and the cards are one column; at 901 px the nav and Contact show, the button is hidden and the cards are two columns.
- **Round-2 and round-1 findings - unaffected.** Verified by the pixel comparison above for the pinned layouts, the same-origin and console sweep below, and `git diff da3cdaa HEAD -- vendor js/stage.js js/layout.js js/data.js` being empty.
- **Round-4 information item (organisation names), L9 and the round-2 Low/Nit follow-ups - not re-raised.**

## Design-system fidelity

Owner bar: a software-engineer portfolio at Apple web-design quality, no deviation from the established system. Judged on the changes of this round: the compact short-portrait pinned layout, the re-typeset Admin Tooling cards and the hover lift. Visual passes on stitched sheets of viewport screenshots (320x568, 360x640, 375x667, 390x740, 390x800 at intro and step 0; 390x840 against 390x844 at intro and step 0) and of the Admin cards at 1440, 1024 and 390 px; computed styles at 1440x900.

- **Compact pinned layout: still Apple-level, no deviation.** The object is the hero of every compact screen: it takes the room between the header and the copy and looks large at 360x640 through 390x800 (the developer reports -2% to -7% against the old layout there; I did not measure it), visibly smaller at 320x568 (the developer reports -29%, unavoidable at that height) and still reads as the three-plate "AR" mark with its floor glow. Title (26 px, the same size the active steps already use), eyebrow, lede and steps sit in the bottom block with clear separation from the object at every size, and nothing overlaps (see the measurement). The 26 px intro title is a step down from the 34 px used above the gate, but it matches the compact state the steps already use and keeps the type hierarchy; the lede stays, which was my stated preference over collapsing it. The hand-over between lede and step is a quick cross-fade (about 0.2 s out, 0.5 s back in with a short delay), smooth and never double-legible. The only visible discontinuity is the intro title size at the 840/841 cliff (L2), cosmetic. The CSS stand-in (no WebGL) sizes to the same box and is clean in every measured state. At 735x760 to 882x840 (windows, not phones, that the same gate catches) the compact layout also reads well: the centred object, then a left-aligned copy block with the same hierarchy, as in the stacked tablet layout of round 2.
- **Hover lift and cards.** The lift now matches what the `.card` rule always declared: 4 px, the page's 0.55 s `--ease`, shadow in step, no stagger on hover; the new cards and the Experience cards behave identically; reduced motion removes the lift only. Nothing changes at rest.
- **Admin Tooling re-typeset: the strongest part of the new section now.** `.tool-card h3` equals the `.card.span2 h3` tier (24 px / 600 / -0.6 px against the card's 20 px, the domain tile's 22 px and the steps' 34 px); `.tags-row li` equals `.chips li` (12 px / 500, 5 px 11 px; `#fff` on the grey section instead of translucent white on black); `.tool-card .tags li` equals `.card .tags li` exactly; `dt`/`dd`/rows use 15 px / -0.016em / `--ink` and `--ink-2` like `.card p`; hairlines use `--line`, the token the tab bar uses; padding of `.admin` equals `.stack` and `.recognition` (168 px). `.tool-body` and `.tool-sub` stay at 16 px, the Overview tile paragraph tier. In the screenshots the Highlights read as a labelled spec table with hairline rows rather than a run-on sentence, which is what the Apple product pages do and removes the last element that looked carried over from the old page.
- **What I would still point out (not deviations, both Nit-level).** The odd-numbered Highlights list leaves one item alone on a third row at 1440 and the last items keep a full stop (N1); at 1024 each list is one column of five or six rows, so the cards are tall there.
- **Better or worse than its neighbours.** The Admin Tooling section is now on a par with Experience and Overview in craft and clearly better than at the start of the round, and the previous weak spot, the pinned section on short phones, now meets the page's standard too.
- **Fix guidance respected.** None of the developer's fixes removed or flattened a design feature: the lede stayed, the object kept its footprint outside the smallest phones, the lift works instead of being dropped, and the hairline list kept every word. The recommendations in L1 and L2 keep the design as well.

## What's good

- `css/styles.css:607-633`: the compact block is scoped to the pinned mode and the portrait guard (so landscape phones and tablets keep the layouts verified in round 2), gives the stage a flex column so the object gets exactly the free height at any copy wrap, and its comment records the measurements and the dynamic-toolbar caveat; this is the kind of constraint documentation the repository needs.
- `css/styles.css:150-159`: the hover lift is restated per property (`translate`, `box-shadow` at zero delay; only opacity and transform keep the stagger) inside `prefers-reduced-motion: no-preference`, with a comment explaining why the reveal rule cannot cancel it; the independent `translate` property is the right tool.
- `index.html:154-206`: the `dl`/`div`/`dt`/`dd` grouping with a real `ul` inside the `dd` is valid HTML (div-wrapped name-value groups), correct in the accessibility tree and word-for-word identical to `main`.
- `js/main.js:57-58`: the scroll-spy change is one comment and one list, with the hero and contact observed so that reaching them clears the mark.
- Regression sweep, all clean: 0 console messages after load, a full scroll and six tab clicks at 1440x900 and at 390x844; 10 requests each, all same-origin; 35 cards, 3 certificates and tab counts 18, 6, 5, 5, 1, 3 at both sizes, no horizontal overflow during the scroll; tabs by keyboard (ArrowRight through all six with wrap, ArrowLeft, End, Home); reduced-motion reload (class `js` only, no canvas, no stage or Three.js request, scrub words all on); forced no-WebGL (CSS stand-in, `webgl` class absent) in the matrix; boot failure and blocked `main.js` (the Admin facts stay visible, no cards are rendered); vendored Three.js and `js/stage.js`, `js/layout.js`, `js/data.js` unchanged since round 2/3; no external URL added in the delta.

## Verification checklist

- [x] every JS file passes `node --check --input-type=module` (`main.js`, `stage.js`, `data.js`, `layout.js`)
- [x] page loaded over http in a real browser with a clean console at 1440x900 and 390x844 (0 messages after load, full scroll and six tab clicks)
- [x] 3D stage running (class `js scrolly webgl`, canvas present) and each fallback verified: reduced motion, no WebGL (full pinned matrix), boot failure (`js/data.js` blocked), `main.js` blocked, JavaScript disabled (390 px)
- [x] network log shows same-origin requests only (10 requests at each size, all `127.0.0.1:8123`)
- [x] vendored Three.js unchanged since round 2/3 (`git diff --stat da3cdaa HEAD -- vendor` empty); the five files were byte-identical to upstream r178 in round 4 and are untouched
- [x] contrast and keyboard checks done (pinned section matrix over real glyph pixels; Admin dt/dd/items; tabs by keyboard)
- [x] content verified against `origin/main` (275 tokens, identical; programmatic), and the unchanged copy against the resume and plugin READMEs in earlier rounds
- [x] design-system fidelity judged (section above)
- [x] no PII or internal identifiers introduced in the delta or the eight commit messages (the only matches of my scan were the `noreply` addresses in the trailers); no phone number, address or employer name added
- [x] test state and screenshots cleaned up

### Merge cleanliness (F)

`git merge-base --is-ancestor origin/main HEAD` holds; `gh` reports `MERGEABLE` / `CLEAN` at `cc8a598`; `git grep -nE '^(<<<<<<<|=======|>>>>>>>)'` finds nothing; the only file under `docs/` tracked at this head is the round-4 review doc (the orchestrator removes the review docs before merge; this round-6 document, once committed, joins it and must be removed the same way, because Pages publishes from `main`); no new external URL in the site files.

### Environment, coverage and what remains unmeasured

- Branch verified: `git branch --show-current` printed `feat/apple-redesign`; HEAD `cc8a598` equals the PR head. The preview server `http://127.0.0.1:8123` served the working tree (cache force-refreshed; the compact media query was confirmed in the served CSS).
- Browser: headless Chromium through the Playwright MCP tools. Not tested: Safari, iOS (and its dynamic toolbar, see L2), Firefox, real touch, a real GPU, a real screen reader (only Chrome's accessibility tree).
- Emulations and states: `prefers-reduced-motion: reduce` (reload; hover), forced no-WebGL (stubbed `getContext` in throwaway pages that were closed), JavaScript disabled (a separate browser context), route aborts for `js/main.js` and `js/data.js`, viewports as listed above, a mouse hover on cards, programmatic scrolling to pinned progress 0.15, 0.4, 0.7 and 0.9.
- The browser degraded mid-run once (screenshots came back blank white and glyph counts dropped to 0 in a few no-WebGL wide-window states, while the DOM was fine); I closed and restarted it and re-ran the affected states, which then gave normal counts. Every earlier state I report had normal glyph counts (thousands of pixels per element), so none of those numbers is affected.
- One throwaway server (port 8124, a copy of `da3cdaa` under the scratchpad) was used for the pixel comparison; it was stopped and the copy deleted.
- Cleanup performed: every screenshot, snapshot, console log and helper script I created under `.playwright-mcp` was deleted and the pre-existing files there were left alone; the tab was reset to `about:blank`; media emulation was reset; no servers or files were left in the host repo besides this review document.

## Action items for developer (ordered)

_None required for the verdict._ Optional, in order of value:

1. **L1:** add `role="list"` to the two `ul.tool-points` (and accept the html-validate `no-redundant-role` report, as for the skills list), or leave.
2. **L2:** check the pinned section once on a real tall iPhone; if the layout jumps while the toolbar collapses, key the compact block off the stage with an `@container` height query.
3. **N1:** the owner may decide whether the closing full stops stay on the last list items.

## Notes for next round

_None._
