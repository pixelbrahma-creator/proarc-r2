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
npm run build:manifest && npm run build:pages
```

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
