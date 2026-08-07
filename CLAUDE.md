# ProArc R2 — Project Rules

This repository is **R2**, a structure and flow redesign. It is standalone.
Ravi's v1 site lives in a different repository and **is not touched at any
stage** — do not import from it, do not diff against it, do not "keep it in
sync". Where R2 and v1 disagree, that is the point.

## The authority

Two documents, in this order:

1. `docs/ProArc-Typography-Guideline-v1.2.md` — **LOCKED**. The system.
2. `docs/ProArc-Typography-Guideline-v1.3.md` — **SIGNED 31 Jul 2026**. The
   extension: clauses E1–E13. Everything in v1.2 still holds except where
   v1.3 explicitly corrects it.

**Read both before writing or changing any CSS, any component style, or any
markup that renders text.** The rules below are the enforceable summary, not
a replacement for them. Layout comes from the screen specs; **words come from
the brand framework**. Neither is overridden by what looks good in a browser.

Design tokens live in `src/styles/tokens.css`. Every type and colour value in
the codebase comes from a token. If a value you need is not a token, **stop
and ask** — do not invent one.

> Tokens added since v1.3 was signed, each a recorded decision rather than a
> build-time value: **`--fs-menu-nav`** (52px fixed; 09-menu §5, measured
> label metrics — `--fs-h1` collapses and the nav must not), and the **Board
> 17 brand set** (2 Aug, Mahesh): `--logo-size-desktop/tablet/mobile`
> (160/128/96 — the rendered decision above §8's 96/80 floors, which stay as
> the record) and `--logo-clear-space-desktop` (25px — §8's own
> max(24, cap height) rule overtaking the floor at 160). Anything further is
> a guideline revision.

---

## Hard rules — never violate these

1. **No hardcoded colours.** No hex, `rgb()`, `hsl()`, or named colours
   anywhere except `tokens.css`. Use `var(--color-*)`.
2. **No hardcoded font sizes.** Use `var(--fs-*)`. Font sizes are authored in
   `rem`, never `px`.
3. **The site is monochrome.** The only colour in the interface is
   `--color-signal` / `--color-signal-on-dark`, and it appears **only** in
   form validation states. If you are reaching for colour anywhere else, the
   answer is weight, size, or space.
4. **No italics on content type.** No `font-style: italic`, no `oblique`, no
   `transform: skew()` on text. The oblique belongs to the wordmark only.
5. **No physical direction properties.** The site is bilingual EN/AR. Use
   `margin-inline-start`, `padding-inline-end`, `border-inline-start`,
   `text-align: start`. Never `margin-left`, `padding-right`,
   `text-align: left`, `border-left`.
6. **Never apply `letter-spacing` to Arabic.** It is zero, always, enforced
   globally in `tokens.css`. Positive tracking severs the connecting strokes;
   negative tracking collides them.
7. **Light weight (300) is Latin-only.** Arabic never uses 300; it maps to 400.
8. **No text directly on a photograph.** Use the black panel
   (`--color-surface-dark`). If a full-bleed scrim is unavoidable it must be
   **minimum 60% black across the entire text bounding box plus 24px bleed**,
   with pure `#FFFFFF` text. A gradient that fades to nothing behind the words
   is a bug.
9. **Body text is never below 16px** at any breakpoint. Minimum text size
   anywhere is 12px (13px Arabic), reserved for captions, eyebrows and labels.
10. **No gradient text, no text-shadow, no glow.** No gradient fills on
    headings. No coloured shadows.
11. **Hierarchy never comes from opacity** (§9.16). Size, weight, space.
12. **No border-radius.** No radius tokens exist in the system.

## v1.3 — what the extension adds

Summarised. The clause text governs; read it.

- **E1 — the ground rule.** A band's ground (paper or black) is a decided
  property of that band, not a decoration. **E1.4:** the opening statement
  sits on paper. Do not default a band to dark because it looks better.
- **E2 — the dark role table.** Type roles on black have their own
  assignments. Do not derive them by inverting the light ones.
- **E5 — Arabic on black** has its own clause. It is not "the Arabic rules
  plus the dark rules".
- **E6 / E6.1 — form states and field borders.** The one place colour is
  permitted, and the only place.
- **E7.1–E7.5 — the map.** Every map surface is governed; there is no
  general-purpose map component to reach for.
- **E8 — the inverted wordmark master.** Use the asset. v1 shipped a
  re-derived mark at 2.76:1 because it was eyeballed.
- **E9 / E9.4 / E9.5 / E9.6 — image provenance.** Renders and photographs are
  labelled differently and are not interchangeable. **E9.5:** the Homes print
  comes from the completed residential records only.
- **E10 / E10.1 / E10.2a–c — copy registers.** Developer-marketing register
  is out. Match the register the clause names for the surface you are on.
- **E11 — measure.** Already folded into `tokens.css`: `--measure-body` 55ch,
  `--measure-body-lg` 48ch. A `ch` is the width of a zero, not of a
  character; the old 68ch rendered 80–85 characters.
- **E12 — no quantities in display prose.** "Numbers are for records; names
  are for prose." Three exemptions only: method-"one", years-as-dates, and
  quoted designations. This is why `/ajman` reads *"All but one of Proarc's
  buildings stand in Ajman"* rather than a count.
- **E13.1–E13.4 — menu amendments.** The overlay is the site's only
  navigation surface at every width, with a permanent-field trigger.

## Structural rules

- Heading levels follow document structure, not visual size. Never skip
  `h1` → `h3`. A large heading that is not the page's top-level heading is an
  `h2` styled at H1 size.
- **The closing band is ONE register site-wide: 32px light** (`--fs-h2` /
  `--fw-light`), on all fifty-four pages that carry it. Its GROUND inverts per
  E1.2 — paper on a black page, black on a paper one — but its type does not
  change with it. Home shipped 700 uppercase until the /ajman build and that
  was a leftover, not a decision.
- **A heading's REGISTER is stated by the page, never inherited.** base.css
  gives `h1` its shape (size, leading) and nothing else; `.t-hero` is the
  uppercase display register and `.t-editorial` the light sentence-case one.
  v1's sitewide `h1 { text-transform: uppercase }` was deleted at the Home
  build — it had been leaking through inheritance onto all 47 record pages,
  which shipped their building names in caps against Screen 04's decided
  register. **A transform is invisible to a textContent probe: verify type
  transforms with a screenshot or a computed-style read, never by asserting
  on text.**
- **On a dark ground, state a heading's colour.** base.css colours every
  heading `--color-ink` and tokens.css lifts only the `.t-*` display classes
  under `.surface-dark`, so a bare `h2`/`h3` on black is #111111 on #000000.
- `text-transform: uppercase` for uppercase. Never type capitals into content.
- Metadata and spec lists are real `<table>` markup with `<th scope="row">`.
- Set `lang` and `dir` on `<html>` and on every inline language switch.
- Never `user-select: none` on content type.
- Respect `prefers-reduced-motion`; no text animates in by default. **The one
  decided exception is the record page's neighbours marker** (P2-b/H5-d): it
  is outline type, and it DRAWS — a `clip-path` wipe, the menu's own
  vocabulary. MVRDV's scale+**fade** was refused because this file's motion
  language rules out decorative fades. Two traps if another surface copies it:
  **never observe the element the reveal clips** (Chrome folds `clip-path`
  into the intersection rect, so the observer never fires), and **`clip-path`
  does not interpolate to `none`** — both resting and armed states must be
  `inset()`.
- No inline `style=""` attributes in `pages-src/` or `partials/` — every
  styled value lives in `src/styles/` where stylelint can see it.
- No numbered markers on non-sequences. No grids of identical cards.

### Two collapses on mobile (≤767px) — intentional, do not "fix" them

- Mega Splash ceases to exist and resolves to H1 (both 34px).
- H3 and Body Large are both 20px, separated by weight (600 vs 300) and space.

## Spacing — semantic aliases, never raw values

`--gap-inline` (12) · `--gap-tight` (16) · `--gap-block` (24) ·
`--gap-heading` (64) · `--gap-component` (64) · `--gap-section` (200) ·
`--gap-section-major` (280 — statement sections only: mission/vision, closing
CTA; do not inflate every gap).

Container `--container-max` **1120px**, gutters `--gutter-desktop/tablet/mobile`
(80/40/20). Padding `--pad-card` (40), `--pad-overlay-panel` (48),
`--pad-table-row` (12).

The legacy `--space-*` scale in `tokens-layout.css` pre-dates v1.2. It survives
only for the carried `base.css` / `layout.css` primitives. **New R2 CSS uses
the aliases above.**

## Accessibility

WCAG 2.1 AA is the floor: 4.5:1 body, 3:1 large text (24px+, or 19px+ at 700).
Every permitted pair is already measured in §5 of the guideline. **If you
introduce a new text/background pair, measure it and add it to §5.** Contrast
over photography is measured against the lightest patch inside the text box,
never the image average.

Never signal meaning with colour alone. Nav active = weight 700 + underline.
Inline emphasis = weight 600, no colour. Errors = colour + text string + 2px
inline-start rule.

## The wordmark

- Never re-set the word "proarc" in General Sans as a stand-in for the mark.
  Use the supplied asset, or the plain string "ProArc" in text-only contexts.
- Never place the white mark on a photograph without its black field.
- Never mirrored, flipped, or recoloured. In RTL its position moves; the
  artwork does not change.
- Minimum rendered width 96px desktop, 80px mobile. Minimum clear space 24px.
- **Rendered size is decided (Board 17): 160px desktop / 128 at ≤1024 / 96 at
  ≤780, clear space 25px at 160 and 24px below** — via the `--logo-size-*`
  tokens, never restated locally.
- **The chrome is ground-aware (trigger only).** The page ships FIELDED — the
  safe state — and `js/chrome.js` arms `html.chrome-ink` on clean paper. The
  PLATE keeps its permanent black field until the E8 ink master is supplied;
  do not derive an inverted mark with a filter, ever. The open overlay forces
  the black state by CSS source order in `components.css` — keep those rules
  AFTER the `chrome-ink` ones.
- **The chrome sits on the content axis** (container edge + gutter, the
  `--chrome-axis` calc) and moves on the LAYOUT's breakpoints (1024/780).
  Never reintroduce a bare-gutter offset or a 1023/767 chrome breakpoint.
- **The chrome RETREATS (E13.2a, 4 Aug — the first amendment to a signed
  clause).** Past the page's own arrival a downward scroll retires it; any
  upward scroll, any focus inside it, and the open overlay return it. It
  ships PRESENT and the script arms the retreat, so a script that never runs
  leaves a page with its navigation intact. **The reason is measured, not
  stylistic:** permanent chrome covered **4.53%** of all visible text line
  boxes at 1440 and **8.00%** at 375 (trigger), 2.89% and 4.89% (plate), and
  /ajman's authority sentence was severed mid-word at display size. 🔴 **The
  TRIGGER is permanent below 780 — decided against that measurement**, on the
  grounds that the overlay is the only navigation surface. 🔴 **And the two
  halves are keyed differently: the PLATE is keyed on the ARRIVAL, not on a
  direction** — present at each page's opening band, absent through its body,
  back when the reader returns to the top. Returning it on scroll-up put it
  straight over /ajman's ledger (*"Habitat Schoo"*, cut mid-word), and it
  covers **146px of a 339px ledger column — 43%** — so the text cannot be
  moved clear instead. Identity is made once per page. The plate's half needs
  **no scroll listener**; `chrome-quiet` already knew. It travels by
  `transform`, never `display` or
  `visibility`, so a retired trigger stays focusable and `focusin` returns
  it. No RTL restatement (the block axis does not flip) and no
  reduced-motion branch (the global clamp makes it instant; the retreat is
  function, and a reader who asked for less motion still wants the words).
  Verify with `_bmad/tools/p24-chrome-retreat.js`, never by eye at one width
  — the trigger's band means the class is ON at 375 while nothing moves, so
  **a class check passes vacuously; assert the computed transform.**
- **The arrival clearance is now ONE TOKEN, `--arrival-clearance`** (P3/H5-c,
  3 Aug), defined in `tokens-layout.css` beside the gap tokens it is made of.
  It replaced sixteen spelled-out `calc()`s across eight stylesheets and
  deleted seven per-page `@media (max-width: 1023px)` blocks — the token
  restates itself, so a page never should. **Never re-spell the calc in a page
  stylesheet.** Deriving it from the PLATE instead was measured and refused:
  plate+clear is 131.7 at 1440 but 117.4 at 1023 and 106.0 at 768, which
  reinstates the narrower-band-gets-less asymmetry H4-c repaired.
- **The rule it carries, for all fifty-eight pages (H2-b, amended H4-c 3 Aug):**
  `--gap-component + --gap-heading`, restated as
  `+ --gap-block × 2` at **≤1023** —
  and **where an arrival's own column runs UNDER the plate, its first ink must
  also clear the plate's bottom edge by the plate's own clear space**
  (`--logo-clear-space-desktop` 25 at 160, 24 below). The clearance belongs to
  **whatever ink arrives first**, not to whatever is set at display size: the
  sector pages arrive on a 12px `.wk-way` label and were the tightest surfaces
  on the site because a list built by looking at headings could not see them.
  An arrival must carry an `--arrival` modifier or the ≤1023 restatement never
  reaches it. **Measure cap ink, not the line box** — the difference is ~15px
  at display size, which is the whole margin in question.
- **1023, not 1024, and `× 2` — both are load-bearing (H4-c).** The rule is
  built out of `--gap-component` and `--gap-heading`, and **those two tokens
  are themselves responsive**: `tokens-layout.css` steps them 64 → 40 at
  **1023**. Keyed at 1024 with a single `--gap-block`, the restatement that
  exists to give the narrower band MORE clearance delivered 152 on one pixel
  of width and **104 across the whole 768–1023 band, against 128 on desktop**
  — and 88 below 767, where every arrival on the site cleared the plate by
  13.8–19.9px against the 24px it owes. **A rule made of tokens inherits
  THOSE tokens' breakpoints.** If you move a gap token's breakpoint, this
  rule has to be re-derived; it is not independent of them.
- **Verify it with `_bmad/tools/p21-arrival-clearance.js`, never by hand at
  three widths.** H2-b checked 1440 / 1024 / 768 and passed, and **all three
  of those widths sit in a pocket where the broken rule looks right, each for
  a different reason** — 1024 is the one-pixel sliver, 768 is inside the
  13px window where the chrome has already stepped to the mobile mark (780)
  but the type tokens have not (767), and 1440 is plain desktop. p21 measures
  both sides of 1024/1023, 781/780/779 and 768/767 on every route, and
  asserts that no arrival steps more than 24px across a single pixel.
  **Home's opening is exempt from the cliff assertion and the reason is in
  the probe** — `.hm-open`'s padding is a clearance FLOOR that the sentence
  floats above via `margin-block: auto`, not the position it takes.

## Build discipline

Root `.html` and `projects/*.html` are **build outputs**. Never hand-edit.
Edit `pages-src/`, `partials/`, `src/styles/`, `data/` only, then rebuild:

```
npm run build            # = build:manifest && build:pages && build:projects
```

Two page steps, because there are two kinds of page:

> 🔴 **THE NEXT TWO PASSAGES DESCRIBE A PAGE THAT NO LONGER EXISTS** (4 Aug,
> H14). The client option `index1` was promoted into `index`, and Home's
> second beat lost its drawing with it — the beat is on paper, the
> constellation is gone, and `build/lib/crest.js` and `js/home.js` are
> orphans awaiting the delete pass. **Do not build against the crest or the
> map on Home; /ajman keeps its map.** The reasoning is kept because it is
> the record of two decisions and of a measured refusal, and because the
> shared-datum construction it describes is what the promoted page's own
> closing band was then built on (H13 option D).

**Home's second beat carried a drawing, and `build/lib/crest.js` generates it
from `projects.json`** — one course per record, its width the size of the set
that record belongs to, so the mark's whole silhouette is the portfolio's own
proportions. **A zone with no data is not drawn:** the authored version this
replaced carried an archway for "approvals navigated" and no record holds
approvals data. Its only two invented values — the course height and the mark's
maximum width — are named in the file, as E3.3's footprint is. It carries no
words, no legend and no number; E12 governs display prose, and the Services
precedent is explicit that a drawing may show what prose may not say.

**Its SVG box ends on the ground line** — the bottom pad is half the datum's
stroke, which is all the datum needs not to be clipped. That is load-bearing:
the beat puts the words' column and the mark's box on the same two edges
(`align-items: stretch` + `space-between` in `home.css` §4), so the route
links' rules and the mark's ground read as one horizontal with **no offset on
either side**, and the sentence hangs from the drawing's apex. Restore a pad
there and the shared datum silently becomes near-alignment. The top keeps ten
units — the apex is a mitred point, and a miter runs past the path that closes
it.

> **H10, 3 Aug — the beat is bounded by TWO horizontals, and both are
> asserted now.** `align-items: end` carried the ground line alone and the
> words' 269px column fell 251px to reach it, so the reader met **519px of
> black** after the band's last label. `stretch` + `space-between` keeps the
> datum and adds its twin. **`--fs`-style constants govern here too: 380px is
> the drawing's decided height and it sets the gap between the sentence and
> its route links** — at 520 that gap is 315 and reads as two unrelated
> things; at 270 the mark renders 95px wide. **The approach is measured ink
> to ink**, `calc(var(--gap-section) - var(--gap-component))`, because the
> band already ends with a tail of its own and 200 was being stacked on top
> of it. That one is keyed at **1024, not 1025** — it subtracts the BAND's
> tail and the band wraps at 1023, where the grid below it is keyed to the
> MARK, which is `display:none` until 1025. **Verify with `p9-home.js`, which
> now measures the DRAWN datum line rather than the SVG's box** — written
> against the box it passed a beat pushed 12px off its floor, because the
> words' column stretches to a padded box and the delta stays 0.00.
>
> 🔴 **`p9-home.js` IS NO LONGER THAT PROBE** (4 Aug, H14). It threw on a
> null the moment the drawing left Home, and the file now carries the
> promoted page's own checks — the five full-bleed frames, rule 8 measured
> over text rects, the marker's register and the closing band's geometry, at
> 1440 / 1024 / 768 / 640 / RTL-1440 / a true framed 375 / RTL-375. The datum
> probe is at `983fb3a:_bmad/tools/p9-home.js`. **`p10-home-motion.js` is
> deleted** — Home has no motion of its own now.

Home's data comes from **`build/lib/home.js`** on the same terms: it consumes
`records.js`, `work.js` (the plate) and `districts.js` (the marks) and derives
only what no other surface wants — the rooms' fallback forms and the
selections that end in an ellipsis. **/ajman's comes from `build/lib/ajman.js`**
on the same terms again: the district ledger's blocks and rows, and the marks.
**Services' comes from `build/lib/services.js`**: the range drawn, generated
from the fifteen records that carry a `configuration`. Its level vocabulary is
explicit and **an unrecognised level throws** — a parser that shrugs draws a
building shorter than its record, silently, and a wrong elevation looks exactly
like a right one (E3.7). Basements are drawn below the datum; the footprint is
the one invented value and is identical for every building (E3.3); no height is
ever inferred for a record that holds none (E7.2).
**About's comes from `build/lib/about.js`**, and it is the one page lib that
derives nothing: twenty-eight of the client wall's thirty-two rows have no
record behind them, so the membership is authored in `data/clients.json` and
the lib's whole job is to refuse a wall that disagrees with the site. A mark
file that is absent throws — §1.5a rule 2 bars typesetting a name in place of
a mark, so **a client with no artwork has no row**. A logo on disk that the
data neither ships nor lists in `notShipped` throws, so a new mark cannot be
silently left off. A relation that is not a `projects.json` title throws: the
wall names no building the site cannot show.
E7.3's west-to-east sweep is **not** either page's — it lives in
`districts.js`, because both maps need the identical order and one map derived
twice is how two surfaces start disagreeing about where a building is.

- **`build:pages`** compiles the 11 hand-authored pages from `pages-src/*.html`
  against `pages-src/meta.json`, which is the route contract: every page's
  output path, its ground (E1) and its two nav states. A route declared there
  with no source file is reported as skipped and writes nothing, so a route can
  be decided now and built later. A route may name a shared source via
  `template` (the three sector pages are one `pages-src/_sector.html` by
  decision); `assetPrefix` is derived from the outFile's depth. The Work
  surfaces' data (D1 sector sets, the building noun, row metadata, the search
  island) comes from **`build/lib/work.js`**, which consumes `records.js` and
  never re-derives its rules.
- **`build:projects`** renders the 47 records from
  `partials/project-detail.template.html`. The rules it applies live in
  **`build/lib/records.js`** — the sector mapping, the location display, the
  spec rows, the prose strips, the neighbours — because the Work surfaces want
  three of them too, and a second implementation is how two surfaces start
  disagreeing about one record.

> **The derivatives are a vocabulary, not a pile.** `images.hero` and
> `images.gallery` in `data/projects.json` address images by **slot index**,
> so deleting an unreferenced derivative silently re-points every curation on
> that record — the build refuses rather than shipping the wrong photograph.
> Removing images is a **compaction** (renumber the files, rewrite the
> curation, verify the output is byte-identical), never a tidy-up.

**Which image leads a record is data, not filename order** (`build/lib/images.js`).
`images.hero` names the gallery slot that leads and `images.gallery` names what
ships beneath it; absent, slot 1 leads and the rest follow. Both the pipeline
and the manifest reader honour it, so re-running the image pipeline cannot
revert a curation. The reasons are in `_bmad/…/00i-D1-Curation-Log.md`.

**`build:images` is not part of `build`.** It reads raw sources that are not in
this repository, so running it here processes nothing; it now exits rather than
writing the empty manifest that would silently strip every image from the site.
On a clone, `build:manifest` is the right script.

**`build:band` is not part of `build` either — but unlike `build:images` it
WORKS on a clone.** It writes `band.webp`, the Work surfaces' own derivative:
the hero's frame, uncropped, at 800w. The distinction is the input — it reads
the committed `hero-md.webp` rather than the absent originals, which is what
lets it run anywhere. The reason it exists is measured: the arrival renders 46
photographs, and at `hero-md` that set is **6.79 MB** against the 1.15 MB the
whole page weighed before; at 800w it is 2.45 MB, and `hero-md` stays in the
srcset for the widest tiles. **`thumb` was not an option** — it is a 4:3
machine crop (`fit: cover`, `position: attention`) and the set's whole premise
is that nothing is cropped, so a cropped thumbnail would both misstate the
building's shape and break the row arithmetic, which is computed from aspect
ratios. A downscale of an already-lossy file is acceptable in this direction
only: resampling down averages the earlier encoder's artefacts away. **The
derivative is optional by design** — absent, the manifest omits it and the
markup serves `hero-md`, which is heavier and correct. A missing optimisation
must never fail a build.

> **A green page is not a proportionate one.** Two builds running, the fault
> that mattered most was invisible to every assertion: /ajman's ledger shipped
> at 4,336px against its own ~1,900px arithmetic, and Services' range first
> drew twelve units per storey on a forty-two-unit footprint — a ratio no
> elevation has — and read as a bar chart rather than an elevation sheet. Both
> were found by looking at the rendered page. **Screenshot the finished page at
> full size before calling a screen done**, and look at it as a page rather
> than as a checklist.

> **A generated drawing needs a CONSTRAINT, not an arrangement.** /ajman's
> marks are scattered off `data/districts.json` every build, so anything fixed
> by hand is overwritten by the next building that lands. Three pairs had
> merged into single blobs — the closest 3.2 units apart — under a fully green
> board, because the sweep counted them, sized them, ordered them and named
> them, and **a count cannot see a collision.** The rule now lives in the
> generator (`scatter.minSeparation`), which rejects and re-draws any mark
> landing too close to another **or to the coast**, and throws rather than
> placing an overlapping one. 🔴 **State the rule in the units the fault
> appears in.** A mark is a true 5px at every width, so the drawing scales
> *under* it and an overlap is decided in SCREEN pixels: the ≤639 band renders
> a unit at 0.571px, and a separation that looks generous at 1440 is a blob on
> a phone. `sweep-ajman` therefore asserts the payoff at all four widths by
> name, not once in user units.

> **A reveal needs a rendered "before", and a STICKY element does not get one
> off-screen.** Every drawn surface ships finished and its script *arms* it, so
> a broken script leaves a complete page. That arming is a computed style
> until the element paints — and an ordinary element gets pre-painted while
> off-screen where a sticky one does not. So on a sticky surface the armed
> state must be **re-committed on screen** (remove → force reflow → add →
> force reflow) before the reveal, or every transition collapses: the values
> jump, `document.getAnimations()` reports zero, and the page looks finished
> rather than broken. It costs nothing visible — a browser cannot paint inside
> a task. `js/ajman.js` carries the worked example.

**No page loads anything from a CDN.** v1's GSAP, ScrollTrigger and Lenis are
gone with the scroll-reveal system they drove — R2's motion language is "the
site draws", and a handover package should not depend on three external hosts.
`js/reveals.js`, `js/smooth-scroll.js` and `src/styles/animations.css` are still
in the tree but nothing loads them; a screen that needs one opts in through its
own `pageScript`.

> **`object-position`'s percentage is not a crop centre.** It distributes the
> OVERFLOW, so the visible window's centre lands at `p·(1−w) + w/2` where `w`
> is the crop window as a fraction of the source width. Writing a judged centre
> (0.42) straight into the CSS moved a 4:5 cell 4.5% to the right and cut
> "Ajman" off its own sign. Judged centres live in the punch list's crop table;
> object-positions live in the stylesheet; they are different numbers.

> **The probe harness has two invocation traps, and both read as findings.**
> `probe.js`'s **5th positional CLI arg is the reduced-motion flag, not the
> height** — `node probe.js url script 1440 900` silently runs the page under
> `prefers-reduced-motion: reduce`, so every motion assertion fails with a
> confident, plausible message (p9-home reported the map "armed at load" on an
> untouched Home; it is 45/45). Use `… 1440`, or `… 1440 "" 900`. And the
> Chrome profile is **keyed on the port and persists**, so a stylesheet edit is
> invisible to a re-run on a port used before it: the probe reports the old
> layout and the change looks inert — a 64→128px padding read as unchanged at
> 1440 while the same edit appeared at 1024 and 768. `Network.setCacheDisabled`
> now closes the second one; the first is still positional, so count the args.

> **A tripwire mutation that no longer matches is invisible in the summary.**
> `--tripwire` corrupts the built HTML to prove the sweep can fail, and it
> reports a *total* failure count — which cannot tell a mutation that landed
> from one that missed. Two crest mutations carried a draw delay in their
> literal and both went stale the moment the choreography was slowed; the run
> would still have said "the sweep can fail". **Every mutation in
> `sweep-home.js` now goes through `mutate()`, which exits 1 with `TRIPWIRE
> INERT` when its target is gone.** Aim a mutation at what the family is
> actually about — the class, the geometry — never at an incidental attribute
> that rides alongside it.

> **A BRANCH KEYED ON A FILENAME DIES SILENTLY WHEN THE FILE IS RENAMED, AND
> AN UNBUILT BRANCH HAS NOTHING TO GUARD.** `build/lib/home.js` carried the
> whole second reading behind `if (srcName === 'index1')`. Promoting the
> option to `index.html` turned that branch off, and the build shipped Home
> **missing four of its five bands with an empty services line** — no error,
> because every guard lived *inside* the branch and guards the data it
> builds. stylelint 0, `check:links` 3338/0, `sweep-seo` 31/31, all on a page
> missing most of itself. **A guard placed inside the thing it guards cannot
> report that thing's absence**; assert the PRESENCE of what a branch
> produces, from outside it. And key a variant on what it IS — a route
> contract, a stylesheet list — never on what its source file is called.

> **The manifest trap.** `images/manifest.json` is gitignored and the raw
> sources are not in this repository. `build:pages` does **not** fail without
> a manifest — it silently emits an empty project-data island. Run
> `build:manifest` after every fresh clone; `build:manifest:check` verifies it
> against disk without writing.

> **The declared-width trap.** A column's declared width is not the width its
> content gets, and the difference is invisible in the source. About's 200px
> mark column delivered **174.9px**, then 197.9px, then 200.0px: a
> `padding-inline-end` *inside* the cell (so `max-inline-size: 100%` resolved
> against 176px), auto table layout treating `inline-size` as a **preference**
> and negotiating it down (`table-layout: fixed` makes it exact), and the UA
> stylesheet's `td { padding: 1px }`, which survives a rule that sets only
> `padding-block`. Every static assertion passed at 174.9. **Measure the
> rendered box, never the declared one.**

> **A cap assertion is satisfied by an element of no size.** A probe that
> measures images must force every `loading="lazy"` image loaded first *and
> assert that it loaded*. About's first probe run reported PropertyTech at
> **0.0px tall** and passed "no mark exceeds the 32px cap" on that same
> element in the same run. Same family as `innerText` of a hidden element and
> the unfocused page that fires no focus events.

> **Trimming artwork: the naive trim looks exactly like a working one.** These
> logo files each carry 10–56 disconnected lossy-webp alpha specks at ≤48%
> alpha — invisible on paper, but an any-alpha bounding box stops at them, and
> that is what `magick -trim`, PIL `getbbox()` and sharp `.trim()` all use. Keep
> the union of the alpha-connected components that contain a pixel **above 50%
> alpha**; cropping to the strict 50% box instead slices the letterforms' own
> antialiasing. Re-encode a crop of already-lossy artwork at **q92 with
> `alphaQuality: 100`**, never lossless — lossless re-encodes the artefacts
> faithfully at 2.6× the bytes, and exact alpha is what lets a sweep assert
> that a file's box equals its ink box.

## Checking your work — the board, and how fast it is

```
npm run serve            # 127.0.0.1:8765 — every probe needs an HTTP origin
npm run check:fast       # the 8 static checks, ~1s. Run this constantly.
npm run check:changed    # + the probes your diff implicates
npm run check            # everything, in parallel. ~62s. Before every commit.
```

**The cost was never the checking, it was Chrome starting.** Measured: the
twelve static checks total **~3s**; the browser probes total **~330s** and were
run one after another for no reason but that a shell loop is written that way.
They are independent, so `board.js` runs them concurrently on assigned ports and
the board's floor is now its slowest single check (p21, ~58s) rather than the
sum — **62s wall for 334s of work at 43 checks**, which is *faster* than the
32-check board it replaced.

> 🔴 **DO NOT JUDGE THE BOARD'S RUNTIME FROM ONE RUN.** Session XXVII's first
> 43-check run took **1,399s**, with `p11` and `p21` — files nothing had
> touched — **21–27× slower**. That reads exactly like "the new checks broke
> the board." It was **contention**: 40 Chrome processes and load average 29.6
> on the machine. Two clean re-runs gave 61.7s and 64.6s. Before believing a
> slow board, check `uptime` and `ps aux | grep Chrome`, and kill orphaned
> probe instances with `pkill -f "remote-debugging-port="`. **One timing
> measurement cannot separate contention from regression** — the same rule
> this project already applies to flake attribution.

> 🔴 **`--changed` NARROWS, IT NEVER QUIETLY COVERS LESS.** Each check declares
> the source paths that can move what it measures, and the skipped set is
> **printed by name on every run**. That declaration is a hand-written list —
> this project's recorded blind spot — so it **fails safe**: a changed file that
> matches no check's declared scope makes the board run *everything*, because an
> unclassified file has an unknown blast radius. **Run the full board before
> committing** regardless; `--changed` is for the loop, not for the gate.
>
> 📌 Both bugs found while building it were invisible in the verdict and obvious
> in the list it prints — a mis-parsed `git status` line left `rc/styles/…` in
> the set, tripped the fail-safe, and the board stayed correct while the
> derivation was broken. **Read the list, not just the verdict.**

## Before you finish any UI task

Run through this list and state the result:

1. `npm run check` passes — **43/43**. (`npx stylelint "src/**/*.css"` alone is
   assertion 1 of 43.) The number moves when a probe is added; it was 32
   before Session XXVII registered ten files that had never run, 27 before
   the Work surfaces' set landed (7 Aug), and this line had been reading 24
   since well before that. **A stale count here trains a reader to ignore the
   line**, which is the same failure `sweep-pins` reports for documents.

   🔴 **AND 32 → 43 WAS NOT TEN NEW PROBES — IT WAS TEN THAT ALREADY EXISTED
   AND WERE NEVER REGISTERED.** 24 of 39 probe files were off the board;
   among them sat 460 already-green assertions and **two live reds**
   (`sweep-services` 80/81 for three commits, `p17-contact` 39/40). **Read
   the board's LIST, not its verdict** — a check that is absent reports
   nothing, and nothing looks exactly like green. `00u` §1.0a is the full
   inventory, including the **13 files still off the board**, which are not
   one kind: four assert a *deleted* design (dead, not red — do not
   register), two *throw*, seven untriaged.
2. No new hardcoded hex, px font-size, or physical margin/padding/border.
3. Any new text/background pair has a measured contrast ratio.
4. Checked at 375px, 768px and 1440px.
5. Checked with `dir="rtl"` and `lang="ar"`.
6. Zoom to 200% at 1280×720 produces no horizontal scroll.
7. **Look at the page.** Screenshot it at full size and read it as a page, not
   as a set of assertions. Three builds running, the thing that was wrong was
   green in every check: a marquee-ratio drawing that read as a bar chart, a
   heading whose box cleared what its ink did not, a mark column 25px short.

## Asking rather than guessing

If a design need is not covered by the guideline, do not improvise a value.
Say what is missing and ask. The specification is versioned; extending it is a
deliberate act, not a build-time decision.
