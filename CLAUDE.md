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

> One token has been added since v1.3 was signed: **`--fs-menu-nav` (52px,
> fixed at every breakpoint)**. The menu overlay's nav list cannot borrow
> `--fs-h1`, which collapses to 40px and then 34px, and 09-menu §5 decides
> 52-at-every-width on measured label metrics. It implements a signed clause
> rather than introducing a value, but it is the only such addition — treat
> the next one as a guideline revision.

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
- Respect `prefers-reduced-motion`; no text animates in by default.
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

## Build discipline

Root `.html` and `projects/*.html` are **build outputs**. Never hand-edit.
Edit `pages-src/`, `partials/`, `src/styles/`, `data/` only, then rebuild:

```
npm run build            # = build:manifest && build:pages && build:projects
```

Two page steps, because there are two kinds of page:

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

> **A green page is not a proportionate one.** Two builds running, the fault
> that mattered most was invisible to every assertion: /ajman's ledger shipped
> at 4,336px against its own ~1,900px arithmetic, and Services' range first
> drew twelve units per storey on a forty-two-unit footprint — a ratio no
> elevation has — and read as a bar chart rather than an elevation sheet. Both
> were found by looking at the rendered page. **Screenshot the finished page at
> full size before calling a screen done**, and look at it as a page rather
> than as a checklist.

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

> **The manifest trap.** `images/manifest.json` is gitignored and the raw
> sources are not in this repository. `build:pages` does **not** fail without
> a manifest — it silently emits an empty project-data island. Run
> `build:manifest` after every fresh clone; `build:manifest:check` verifies it
> against disk without writing.

## Before you finish any UI task

Run through this list and state the result:

1. `npx stylelint "src/**/*.css"` passes.
2. No new hardcoded hex, px font-size, or physical margin/padding/border.
3. Any new text/background pair has a measured contrast ratio.
4. Checked at 375px, 768px and 1440px.
5. Checked with `dir="rtl"` and `lang="ar"`.
6. Zoom to 200% at 1280×720 produces no horizontal scroll.

## Asking rather than guessing

If a design need is not covered by the guideline, do not improvise a value.
Say what is missing and ask. The specification is versioned; extending it is a
deliberate act, not a build-time decision.
