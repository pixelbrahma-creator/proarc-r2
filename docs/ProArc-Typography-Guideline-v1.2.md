# ProArc Typography & Layout Guideline — v1.2 (Locked)

**Status:** Locked specification. Supersedes v1.1, v1.0 and the v0.2 open draft.
**Date:** 27 July 2026
**Audience:** Designers and developers implementing the ProArc website.
**Region:** United Arab Emirates. Bilingual English / Arabic.

**What changed from v1.1:** three gaps closed that the first build exposed. A full spacing and layout-frame scale (§2, new). A desktop overlay navigation role (§4.7). A third-party logo carve-out to the monochrome rule (§1.5a). The "96px between sections" figure in v1.1 is corrected. Full change record in Appendix C.

**Measurement note:** every spacing and size figure attributed to "the current build" was measured from R1 desktop screenshots at DPR 2, viewport 1668 CSS px, container 1301 CSS px. Device scale was calibrated from the 1px hairline rules in the metadata table, which render at exactly 2 device pixels.

---

## 0. Decisions Locked

| # | Question | Locked decision |
|---|---|---|
| 1 | Scope of "sans-serif only" | Content and UI typography only. The wordmark is exempt. |
| 2 | Metadata treatment | Ruled table. Two columns, hairline dividers, one family. |
| 3 | Text over images | Solid black panel default. Scrim fallback at 60% minimum. Direct-on-photo prohibited. |
| 4 | Display register | Dual. Hero Display (Bold, uppercase) and Editorial Display (Light, sentence case). |
| 5 | Inline emphasis | Weight 400 → 600. No colour. |
| 6 | Latin family | General Sans. |
| 7 | Colour policy | Monochrome. Colour appears only as a validation signal, plus the third-party logo carve-out in §1.5a. |
| 8 | Bilingual scope | English and Arabic both first-class. IBM Plex Sans Arabic companion. |
| 9 | **Spacing** | **A ten-step vertical scale with semantic aliases, plus an explicit horizontal frame. §2.** |
| 10 | **Desktop navigation** | **Full-screen overlay menu triggered from a fixed control. No horizontal top bar. §4.7.** |

---

## 1. Font Family and Colour

### 1.1 Latin primary

**General Sans**, Indian Type Foundry (Frode Helland), via [Fontshare](https://www.fontshare.com/fonts/general-sans), **ITF Free Font License**. Six weights Extralight to Bold plus italics and two variable fonts. ProArc uses five weights, no italics.

### 1.2 Arabic companion

**IBM Plex Sans Arabic**, IBM BX&D with Bold Monday, via [Google Fonts](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic), **SIL OFL 1.1**. Seven weights 100–700, no italics.

Chosen over Cairo, Almarai and Noto Sans Arabic because it carries the exact five weights at matching numeric values, was drawn as a systematic companion to a neutral Latin grotesk, and holds its hinting at 14px, which matters for the metadata tables.

### 1.3 Weights in use

| Weight | Value | Latin use | Arabic use |
|---|---|---|---|
| Light | 300 | Editorial Display, Body Large, overlay nav inactive | *Not used — maps to 400* |
| Regular | 400 | Body, metadata values, footer links | as Latin, plus Editorial Display and Body Large |
| Medium | 500 | Captions, eyebrows, overlay support text | same |
| Semibold | 600 | H2, H3, inline emphasis, footer labels | same, plus nav |
| Bold | 700 | Hero Display, Mega Splash, overlay nav active | same |

Both families are free. Self-host WOFF2; do not hot-link either CDN. Keep each licence file in its font directory — OFL requires it.

### 1.4 Fallback stacks

```css
:root {
  --font-latin:
    "General Sans",
    -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  --font-arabic:
    "IBM Plex Sans Arabic",
    "Noto Sans Arabic", "Geeza Pro", "Segoe UI", Tahoma, sans-serif;
}

html:lang(en) { font-family: var(--font-latin); }
html:lang(ar) { font-family: var(--font-arabic); }
```

Inter is deliberately absent. Mixed-script strings are resolved by `unicode-range` on the `@font-face` declarations (`U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF`), not by wrapping spans. No `--font-mono` token exists.

### 1.5 Colour policy

The wordmark is white on solid black, no second colour. A type system that introduces a brand colour underneath a monochrome mark puts the two in competition, and the mark loses.

The positive argument matters more. On an architecture site the photography is the colour, and it changes on every project. A neutral interface lets that land without contest. Introduce an accent and every photograph must be checked against it, and the palette starts deciding which projects can be shown well.

Every job colour did in v1.0 has a monochrome equivalent: eyebrows use a 24px rule mark, active navigation uses a weight step, inline emphasis uses weight 600.

**The validation exception.** Colour survives only in form validation. Helper text and error text occupy the same position, size and weight; in one grey they are indistinguishable until read. Everywhere else a missed signal costs a moment. In the enquiry form it costs a submission, which is the one conversion the site exists to produce. Colour never carries the message alone: an error presents colour, an explicit text string, and a 2px rule on the field's inline-start edge.

**Rejected: the desert palette.** Sand, ochre and terracotta are the reflexive Gulf-brand choice and the most predictable thing this site could do. They also sit in the tonal range most architectural renders already occupy, so they muddy the photography rather than framing it.

### 1.5a Third-party logos — the second exception

Client and partner marks are the only other place colour enters. This is not a design preference: a client's mark is their property, and recolouring or greyscaling it may breach their brand terms as well as reducing recognition.

1. **Reproduce marks as supplied.** Do not recolour, greyscale, duotone, invert or redraw. No hover-to-colour transition, because that requires an altered rest state.
2. **Never set a client's name in General Sans as a substitute for their mark.** Obtain the asset or omit the client entirely. A grid mixing real logos with typeset names reads as unfinished, and typesetting a wordmark you do not own is a trademark risk. This is a hard rule.
3. **All third-party marks sit on `--color-surface` (white).** Never on `--color-surface-dark`. Supplied assets are usually optimised for light backgrounds, and a mark carrying its own dark tile will clash against black.
4. **Normalise by optical height, not bounding box.** Cap each mark at 32px optical height inside a container of uniform size. A wordmark and a roundel at the same box height look wildly different in weight; match what the eye reads.
5. **Container treatment is uniform.** Either a 1px `--color-hairline` border on every cell or none on any cell. Never a mix.
6. **No third-party mark appears within 96px of `--color-signal`.** The validation red must never be mistaken for part of a client's identity.
7. **Logo colour never propagates.** No page colour, hover state or accent is ever derived from a client's brand palette.

### 1.6 Colour tokens

```css
:root {
  --color-ink:               #111111;
  --color-ink-secondary:     #595959;
  --color-surface:           #FFFFFF;
  --color-surface-dark:      #000000;
  --color-on-dark:           #FFFFFF;
  --color-on-dark-body:      #EDEDED;
  --color-on-dark-secondary: #A6A6A6;
  --color-hairline:          #D6D6D6;
  --color-hairline-dark:     #333333;
  --color-signal:            #B3261E;
  --color-signal-on-dark:    #F2695C;
}
```

| Pair | Ratio | Verdict |
|---|---|---|
| `--color-ink` on white | **18.88:1** | AAA |
| `--color-ink-secondary` on white | **7.00:1** | AAA |
| `--color-on-dark` on black | **21.00:1** | Maximum |
| `--color-on-dark-body` on black | **17.94:1** | AAA |
| `--color-on-dark-secondary` on black | **8.63:1** | AAA |
| `--color-signal` on white | **6.54:1** | AA any size |
| `--color-signal-on-dark` on black | **6.95:1** | AA any size |
| `--color-signal` on black | **3.21:1** | **Prohibited** |
| `--color-signal-on-dark` on white | **3.02:1** | **Prohibited** |

Body copy on black is `#EDEDED`, not white: pure white on pure black halates at reading size and the counters close up. Display type stays pure white, where the match to the wordmark matters more and the effect is imperceptible.

**Over a scrim, always pure `#FFFFFF`.** `--color-on-dark-secondary` measures 8.63:1 on flat black but collapses to as low as **3.46:1** over a photograph — this was the R1 build's first accessibility failure. The halation argument applies to flat surfaces, never to imagery.

---

## 2. Spacing and Layout Frame *(new in v1.2)*

v1.1 carried a single line — "12px within groups, 96px between sections" — which was too tight and left the build to invent its own scale. The build's invented scale was sound; this section formalises it and corrects the section figure upward.

### 2.1 Vertical scale

```css
:root {
  --space-2xs:  8px;
  --space-xs:  12px;
  --space-s:   16px;
  --space-m:   24px;
  --space-l:   40px;
  --space-xl:  64px;
  --space-2xl: 96px;
  --space-3xl:144px;
  --space-4xl:200px;
  --space-5xl:280px;
}
```

### 2.2 Semantic aliases — use these, not the raw steps

```css
:root {
  --gap-inline:        var(--space-xs);   /* 12  metadata label to value        */
  --gap-tight:         var(--space-s);    /* 16  items inside one group         */
  --gap-block:         var(--space-m);    /* 24  paragraph to paragraph         */
  --gap-heading:       var(--space-xl);   /* 64  heading block to its content   */
  --gap-component:     var(--space-xl);   /* 64  card to card, row to row       */
  --gap-section:       var(--space-4xl);  /* 200 between page sections          */
  --gap-section-major: var(--space-5xl);  /* 280 statement sections             */
}
```

`--gap-section-major` applies to the mission and vision block, the closing call to action, and any full-width statement moment. Everything else uses `--gap-section`. The point is differentiation: inflating every gap to 280px makes the page longer without making it more considered.

The current build measures 200–210px between sections and 62–67px for heading-to-content and card-to-card. Those already match `--gap-section` and `--gap-heading`; adopting the tokens is largely a matter of replacing hardcoded values, not re-spacing the page.

### 2.3 Responsive spacing

```css
@media (max-width: 1023px) {
  :root {
    --gap-section:       var(--space-3xl); /* 144 */
    --gap-section-major: var(--space-4xl); /* 200 */
    --gap-heading:       var(--space-l);   /*  40 */
    --gap-component:     var(--space-l);   /*  40 */
  }
}
@media (max-width: 767px) {
  :root {
    --gap-section:       var(--space-2xl); /*  96 */
    --gap-section-major: var(--space-3xl); /* 144 */
    --gap-heading:       var(--space-m);   /*  24 */
    --gap-component:     var(--space-l);   /*  40 */
  }
}
```

### 2.4 Horizontal frame

The build's container is 1301px inside a 1668px viewport, leaving 177px gutters — 10.6% each side. That is the tightest thing about the layout, and it is where the page most lacks air.

```css
:root {
  --container-max:  1120px;
  --gutter-desktop:   80px;  /* minimum */
  --gutter-tablet:    40px;
  --gutter-mobile:    20px;
}

.container {
  max-inline-size: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--gutter-desktop);
}
```

| Viewport | Container | Resulting gutter each side |
|---|---|---|
| 1668px | 1120px | 274px (16.4%) |
| 1440px | 1120px | 160px (11.1%) |
| 1280px | 1120px | 80px |
| 1024px | 864px | 80px |

Narrowing the container is the single largest whitespace gain available and it changes no vertical value.

### 2.5 Measure rules — the column-count constraint

The build's Our Story section runs body text at **32 and 35 characters per line** across three columns. That is well below the 45-character floor at which reading turns choppy, and it produces the worst combination available: a wide, dense-looking container filled with cramped columns.

1. **Minimum measure for running prose is 45 characters.** If a column cannot hold 45, reduce the column count. This overrides any grid.
2. **Maximum two text columns on desktop for running prose.** Three-column prose is prohibited.
3. **Short labelled items** — under 25 words, such as the "Why Proarc?" blocks — may run three-up at a minimum of 32 characters.
4. Maxima from §4 still apply: 68 characters for Body, 60 for Body Large.

### 2.6 Component padding

| Context | Desktop | Tablet | Mobile |
|---|---|---|---|
| Bordered card | 40px | 32px | 24px |
| Overlay panel on imagery | 48px | 32px | 24px |
| Metadata table row | 12px top and bottom | same | same |

---

## 3. Type Scale

Base 16px = 1rem. Arabic runs 5% larger; see §7.3.

| Role | px | rem | Step |
|---|---|---|---|
| Caption / Label | 12 | 0.75 | — |
| Metadata | 14 | 0.875 | ×1.167 |
| Body | 16 | 1 | ×1.143 *(base)* |
| Body Large / Lead | 20 | 1.25 | ×1.25 |
| H3 | 24 | 1.5 | ×1.20 |
| H2 | 32 | 2 | ×1.333 |
| **H1 — Display** | **52** | **3.25** | **×1.625 (φ)** |
| Mega Splash | 84 | 5.25 | ×1.615 (φ) |

φ steps are rounded to whole pixels: 32 × 1.618 = 51.8 → 52; 52 × 1.618 = 84.1 → 84. Whole pixels are preferred because sub-pixel display sizes render inconsistently.

**Absolute floors, restated because the R1 build broke all three.** Body copy is never below 16px at any breakpoint. Any text is never below 12px, and 12px is reserved for captions, eyebrows and labels. Arabic minimum is 13px. The R1 build shipped services card body at ~12–13px, overlay contact copy at ~13px, and overlay thumbnail captions at ~11px.

---

## 4. Specifications by Role

| Role | Size | Weight | Tracking | Line-height | Max measure | Colour and contrast |
|---|---|---|---|---|---|---|
| **Hero Display (H1)** | 52px | 700 | −0.03em | 1.05 | 20ch, 2 lines max | ink on white 18.88:1 / white on black 21.00:1 |
| **Editorial Display (H1)** | 52px | 300 | −0.005em | 1.15 | 24ch, 3 lines max | ink on white 18.88:1. Never on a photo |
| **H2** | 32px | 600 | −0.02em | 1.20 | 28ch | ink 18.88:1 |
| **H3** | 24px | 600 | −0.015em | 1.30 | 45ch | ink 18.88:1 |
| **Body Large / Lead** | 20px | 300 | −0.005em | 1.50 | 60ch, min 45ch | ink 18.88:1 |
| **Body** | 16px | 400 | 0 | 1.60 | 68ch, min 45ch | ink 18.88:1 / `--color-on-dark-body` 17.94:1 |
| **Body — inline emphasis** | 16px | **600** | 0 | 1.60 | inherits | same colour as body. **No colour change** |
| **Caption / Label** | 12px | 500 | +0.04em | 1.50 | 40ch | secondary 7.00:1 / on dark 8.63:1 |
| **Eyebrow** | 12px | 500 | +0.04em, uppercase | 1.50 | 24ch | secondary 7.00:1, with a 24px × 1px rule mark |
| **Metadata label** | 14px | 500 | +0.02em | 1.65 | 18ch | secondary 7.00:1 |
| **Metadata value** | 14px | 400 | 0 | 1.65 | 40ch | ink 18.88:1 |
| **Overlay nav item** | 52px | 300 rest / 700 active | −0.01em | 1.40 | n/a | rest 8.63:1, active 21.00:1 |
| **Overlay thumbnail caption** | 14px | 400 | 0 | 1.45 | 24ch | `--color-on-dark-secondary` 8.63:1 |
| **Overlay contact body** | 16px | 400 | 0 | 1.60 | 32ch | `--color-on-dark-body` 17.94:1 |
| **Overlay contact detail** | 20px | 400 | 0 | 1.50 | 24ch | `--color-on-dark` 21.00:1 |
| **Menu trigger label** | 12px | 500 | +0.06em, uppercase | 1.00 | n/a | white on black pill 21.00:1 |
| **Footer section label** | 12px | 600 | +0.06em, uppercase | 1.50 | 20ch | on dark 8.63:1 |
| **Footer body and links** | 16px | 400 | 0 | 1.60 | 32ch | `--color-on-dark-body` 17.94:1 |
| **Footer office listing** | 14px | 400 | 0 | 1.55 | 28ch | `--color-on-dark-body` 17.94:1 |
| **Overlay panel on image** | 52px | 700 | −0.03em | 1.05 | 18ch | white on black panel 21.00:1 |
| **Scrim text on image** | 52px | 700 | −0.03em | 1.05 | 18ch | pure white on ≥60% scrim, 5.74:1 worst |
| **Scrim supporting line** | 20px | 500 | 0 | 1.45 | 40ch | pure white on ≥60% scrim, 5.74:1 worst |
| **Form helper** | 14px | 400 | 0 | 1.55 | 40ch | secondary 7.00:1 |
| **Form error** | 14px | 500 | 0 | 1.55 | 40ch | `--color-signal` 6.54:1 + text string + 2px rule |

### 4.1 Hero Display
Uppercase, maximum 8 words. Longer copy is not a hero headline; set it as Editorial Display. **Never place an eyebrow, kicker or pill above it.** The headline is the top of the page.

### 4.2 Editorial Display
Sentence case with terminal punctuation. Light 300 at 52px is the only sub-400 Latin weight permitted, and only at this size. Tracking stays near zero; tight tracking on a light weight thins the joins. **Never over a photograph.**

### 4.3 H2 and H3
**Sentence case, always.** The R1 build mixed sentence case ("Five disciplines, one in-house team.") with Title Case ("Trusted By 45+ Organisations Across the UAE", "Our Story", "Why Proarc?"). Sentence case is the answer everywhere.

Do not skip `h1` → `h3`. Visual size is style; heading level is structure.

H3 at 24px against Body Large at 20px is a 1.20 step, tighter than the 1.25 guidance. Deliberate: separation is carried by a 300-unit weight delta. Do not close it further, and do not set Body Large at 600.

### 4.4 Body and inline emphasis
`text-align: start`. Never justified. Measure between 45 and 68 characters.

Inline emphasis qualifies only when all four hold: the string contains a numeral or unit of specification ("50-floor", "12,000 m²", "Phase 3", not "award-winning"); one per paragraph; expressed as weight 600 and nothing else; never a link.

### 4.5 Caption, label and eyebrow
The eyebrow is the constrained element. Permitted only for genuine taxonomy — project type, location, client, sector, date. **Prohibited as an invented section label** of the "OUR MISSION", "OUR VISION", "OUR PROCESS" variety, which turn a page into visible scaffolding. Never above the Hero Display. Never on two consecutive sections. Never a pill or chip: no fill, no border, no radius. Marked by a 24px × 1px rule inline before the label with a 12px gap, on the inline-start side.

### 4.6 Metadata and spec lists
Two columns, hairline rule below each row in `--color-hairline`, no outer border, no vertical rules, no zebra, no fill. Labels use the `--color-ink-secondary` token, never an opacity applied to `--color-ink`. Real `<table>` markup with `<th scope="row">`.

The R1 build implemented this correctly. It is the reference component.

### 4.7 Navigation — desktop overlay *(new in v1.2)*

v1.1 specified a horizontal top bar. The build uses a full-screen overlay triggered from a fixed control, and that pattern is adopted as the standard. **There is no horizontal top bar.**

**Trigger control.** Fixed, inline-start, vertically near the top. A single black pill containing the icon, with the word MENU as a 12px uppercase label **inside or immediately beneath the same pill, not a second stacked pill**. The R1 build renders two separate pills; consolidate to one. Minimum hit target 44 × 44px. On light sections the pill stays black; it is the one persistent black element on a white page and that is intentional.

**Overlay.** Full-viewport `--color-surface-dark`. Three regions: nav list on the inline-start side, project mega-menu centre, contact on the inline-end side.

**Nav items.** 52px, Light 300 at rest, Bold 700 when current, 24px between items. Active state is **weight plus brightness only** — `--color-on-dark-secondary` at rest, `--color-on-dark` when current. No colour, no underline, no marker. The R1 build does this correctly.

**Mega-menu.** Thumbnails in a plain grid. **No bordered container around the grid** — the R1 build nests a bordered box inside the overlay panel, which is a card inside a card. Separate with space alone. Captions are 14px, not the ~11px the build ships.

**Reserve width for the bold state** so the list does not reflow between pages; set item widths from the 700 metrics.

**Accessibility.** Trap focus inside the overlay while open. Return focus to the trigger on close. `aria-expanded` on the trigger, `aria-current="page"` on the active item. Escape closes.

### 4.8 Footer
On `--color-surface-dark`. Section labels 12px Semibold uppercase in `--color-on-dark-secondary`. Body and links 16px in `--color-on-dark-body`. Multi-office listings compress to 14px, which is the floor — add a column rather than dropping to 12px. Links underlined on hover only, except links inside a paragraph, which are underlined at rest.

### 4.9 Text over images

**Default: solid black panel.** A `--color-surface-dark` block, inset from or abutting the image, never partially overlapping. Contrast 21.00:1, invariant across every photograph. This is the wordmark's own field, so a black panel with a white headline is the mark scaled up.

**Fallback: scrim.** Full-bleed heroes only. Black gradient at **minimum 60% opacity across the whole bounding box of the text plus a 24px bleed**. It may fade above and below that region; it may not fade inside it. Minimum 20px, minimum weight 500, **pure `#FFFFFF` only**.

| Scrim | Background over a white photo region | White text | Verdict |
|---|---|---|---|
| 45% | #8C8C8C | 3.36:1 | Fails |
| 55% | #737373 | 4.74:1 | Rejected, margin too thin |
| **60%** | **#666666** | **5.74:1** | **Minimum** |
| 65% | #595959 | 7.00:1 | Safe |

**Prohibited: direct-on-photo.** No text on an unmodified photograph at any size or weight.

**The wordmark obeys the same rule.** R1 measured the mark at **2.76:1** on the About hero. A logotype is exempt from WCAG 1.4.3, but the trailing diagonal device is fine linework and stops resolving below about 4.5:1. Either give the mark a black field or extend the header scrim until it clears 4.5:1.

---

## 5. Responsive Behaviour

Breakpoints: **Desktop ≥ 1024px · Tablet 768–1023px · Mobile ≤ 767px.**

| Role | Desktop | Tablet | Mobile |
|---|---|---|---|
| Mega Splash | 84px | 60px | **34px — collapsed into H1** |
| H1 Display | 52px | 40px | **34px** |
| Overlay nav item | 52px | 40px | 32px |
| H2 | 32px | 28px | 26px |
| H3 | 24px | 22px | **20px — collapsed with Body Large** |
| Body Large | 20px | 20px | 20px |
| Body | 16px | 16px | 16px |
| Metadata | 14px | 14px | 14px |
| Caption | 12px | 12px | 12px |

**Mega Splash collapses into H1 on mobile.** Below 768px there is no Mega Splash. An 84px display size on a 375px viewport fits about four characters per line. Any layout depending on Mega reading differently from H1 must be redesigned, not rescaled.

**H3 collapses to Body Large size on mobile.** Both 20px, separated by weight (600 against 300) and by the 32px above an H3.

**Body, Metadata and Caption never scale.** Body is at the 16px floor and mobile has the worst reading conditions. Mobile gains comfort from a narrower measure, not smaller type.

### 5.1 Optical tracking

| Role | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero Display | −0.03em | −0.025em | −0.02em |
| Editorial Display | −0.005em | −0.005em | 0 |
| H2 | −0.02em | −0.02em | −0.015em |
| H3 | −0.015em | −0.015em | −0.01em |
| Body Large | −0.005em | −0.005em | 0 |

Uppercase label tracking does not change. **Arabic tracking is zero at every size and breakpoint.**

### 5.2 Display line-height

| Role | Desktop | Tablet | Mobile |
|---|---|---|---|
| Mega Splash | 1.00 | 1.05 | 1.15 |
| Hero Display | 1.05 | 1.10 | 1.15 |
| Editorial Display | 1.15 | 1.18 | 1.25 |
| H2 | 1.20 | 1.22 | 1.25 |

### 5.3 Frame and measure

| Breakpoint | Container | Gutter | Body max-width (Latin) | Arabic |
|---|---|---|---|---|
| Desktop | 1120px | 80px min | 640px | 620px |
| Tablet | fluid | 40px | 600px | 580px |
| Mobile | fluid | 20px | 100% − gutters | same |

Text columns collapse to one below 1024px. Hero Display extends from 2 lines to 3 on mobile; beyond 3 lines the copy is too long. Do not go below 34px to make it fit.

---

## 6. Accessibility Baseline

**WCAG 2.1 AA.** 4.5:1 below 24px or below 19px bold; 3:1 at 24px+, or 19px+ at 700.

### 6.1 Light surfaces (#FFFFFF)

| Text | Ratio | Needs | Margin |
|---|---|---|---|
| Display, H2, H3 — `--color-ink` | 18.88:1 | 3:1 | 6.3× |
| Body, Body Large, inline emphasis — `--color-ink` | 18.88:1 | 4.5:1 | 4.2× |
| Caption, eyebrow, metadata label — `--color-ink-secondary` | 7.00:1 | 4.5:1 | 1.6× |
| Metadata value — `--color-ink` | 18.88:1 | 4.5:1 | 4.2× |
| Form helper — `--color-ink-secondary` | 7.00:1 | 4.5:1 | 1.6× |
| Form error — `--color-signal` | 6.54:1 | 4.5:1 | 1.5× |

### 6.2 Dark surfaces (#000000)

| Text | Ratio | Needs | Margin |
|---|---|---|---|
| Panel headline, overlay nav active — `--color-on-dark` | 21.00:1 | 3:1 | 7.0× |
| Body, footer links, overlay contact — `--color-on-dark-body` | 17.94:1 | 4.5:1 | 4.0× |
| Overlay nav rest, captions, footer labels — `--color-on-dark-secondary` | 8.63:1 | 4.5:1 | 1.9× |
| Form error on dark — `--color-signal-on-dark` | 6.95:1 | 4.5:1 | 1.5× |
| **`--color-signal` on black** | **3.21:1** | 4.5:1 | **Prohibited** |
| **`--color-signal-on-dark` on white** | **3.02:1** | 4.5:1 | **Prohibited** |
| **`--color-ink` on black** | **1.11:1** | 4.5:1 | **Prohibited** |

### 6.3 Over photography

Measured against the **lightest and busiest patch inside the text bounding box**, never the image average.

| Case | Effective background | Ratio | Needs | Verdict |
|---|---|---|---|---|
| Headline 52px 700 on 60% scrim, pure white | #666666 | 5.74:1 | 3:1 | Pass |
| Supporting line 20px 500 on 60% scrim, pure white | #666666 | 5.74:1 | 4.5:1 | Pass, tightest case in the system |
| `--color-on-dark-secondary` over a photo | varies | **as low as 3.46:1** | 4.5:1 | **Prohibited** |
| Text directly on photography | unbounded | unmeasurable | 4.5:1 | Prohibited |

### 6.4 Rules that are not ratios

1. **Never signal meaning with colour alone.** Nav active uses weight plus brightness. Inline emphasis uses weight. Errors use colour plus text plus a rule.
2. **Heading levels follow structure, not size.** No `h1` → `h3` skips.
3. **Floors:** body never below 16px; nothing below 12px (13px Arabic).
4. **Body line-height** 1.60 Latin, 1.75 Arabic. Both above the WCAG 1.4.12 minimum.
5. **200% zoom** at 1280×720 produces no horizontal scroll, in both directions.
6. **Respect `prefers-reduced-motion`.** No text animates in by default.
7. **Never `user-select: none`** on content type.
8. **Uppercase via `text-transform`**, never typed into the CMS.
9. **Set `lang` and `dir`** on `<html>` and on every inline language switch.
10. **Overlay menus trap focus**, restore it on close, and respond to Escape.

---

## 7. Bilingual Arabic and RTL

**Scope assumption:** English and Arabic both first-class, built together. Flag immediately if release one is English-only, because the Latin face was chosen partly for how it sits beside its Arabic companion.

**Regulatory context, stated accurately.** The UAE Ministry of Culture received approval in 2026 to draft a federal Arabic Language Law, implementation targeted for 2027. The draft covers ten sectors including economy and business, technology and digitisation, and customer service, and reported provisions require Arabic in all public-facing advertising. Published reporting does not specifically name commercial websites. Treat this as a strong reason to build bilingual capability now, not as a settled obligation; confirm against counsel and against any specific tender.

### 7.1 Logical properties only
Never `left`, `right`, `margin-left`, `padding-right`, `text-align: left`, `border-left`. Use `inline-start` / `inline-end` and `text-align: start`. Set `dir="rtl"` on `<html>` for the Arabic build, not per component.

The metadata table mirrors, the eyebrow rule mark moves to the right, navigation order reverses, a horizontal scrim reverses and a vertical one does not. Numerals, phone numbers, emails and Latin proper nouns keep their internal LTR direction under the Unicode bidirectional algorithm. Where a mixed string breaks, the fix is `<bdi>`, not a hard-coded direction.

### 7.2 Size compensation
Arabic carries its weight lower and has a smaller effective x-height. It runs at **1.05× the Latin size**, rounded to whole pixels.

| Role | Latin | Arabic |
|---|---|---|
| Caption | 12px | 13px |
| Metadata | 14px | 15px |
| Body | 16px | 17px |
| Body Large | 20px | 21px |
| H3 | 24px | 25px |
| H2 | 32px | 34px |
| H1 | 52px | 55px |
| Mega Splash | 84px | 88px |

Confirm the multiplier with a 16px against 17px proof before build sign-off, then adjust the single token. Never adjust individual roles.

### 7.3 Weights
**Light 300 is not used in Arabic.** Editorial Display and Body Large, 300 in Latin, are **400 in Arabic**. Everything else maps one to one. Compensate for the lost delicacy with space, not a lighter weight: increase the margin above an Arabic Editorial Display from 48px to 64px.

### 7.4 Tracking is always zero
`letter-spacing` on Arabic is a defect. Positive tracking severs the connecting strokes; negative collides them. There is no correct non-zero value.

```css
html:lang(ar) *, [dir="rtl"] * { letter-spacing: 0 !important; }
```

The `!important` is deliberate and is the only one in this system. A single inherited tracking value from a Latin component breaks Arabic sitewide, and the failure looks like a font bug.

### 7.5 Case and style
No `text-transform` — Arabic has no case, and uppercase applied to a mixed string capitalises only the Latin words. Because uppercase is unavailable, **Arabic navigation and eyebrows step from 500 to 600** to recover the lost distinction. No italics, real or synthetic. On Arabic links use `text-underline-offset: 0.25em` and `text-decoration-skip-ink: auto`; descenders cross the underline position.

### 7.6 Line-height

| Role | Latin | Arabic |
|---|---|---|
| Mega Splash | 1.00 | 1.20 |
| Hero Display | 1.05 | 1.25 |
| Editorial Display | 1.15 | 1.30 |
| H2 | 1.20 | 1.35 |
| H3 | 1.30 | 1.45 |
| Body Large | 1.50 | 1.65 |
| Body | 1.60 | 1.75 |
| Metadata | 1.65 | 1.80 |
| Caption | 1.50 | 1.65 |

### 7.7 Numerals
**Western Arabic digits (0–9) in both language versions.** Standard commercial practice in the UAE, keeps the metadata tables identical across builds, avoids column-width divergence. Eastern Arabic-Indic digits are not used. Dates are written in full; numeric date order is ambiguous across the two audiences. Units stay metric with the symbol trailing the numeral in both directions.

### 7.8 Bilingual lockups
Both set at their own scale, so Arabic is 5% larger — do not force a matching pixel size. **The Latin drops uppercase in a bilingual lockup** and is set sentence case at 700, because an uppercase Latin line beside an Arabic line with no uppercase equivalent reads as two levels of emphasis rather than one message in two languages. Vertical order, not side by side, unless the composition is wide enough for both at full measure.

---

## 8. The Wordmark and Content Type

The mark is a white lowercase oblique bold wordmark with a trailing device of parallel diagonal strokes on a solid black field. Three of its properties are brand signatures and are therefore **prohibited in content typography**.

1. **The oblique.** No content type is ever italic or obliqued. Not headlines, pull quotes, captions or emphasis. General Sans ships true italics; they are not used. Never apply a `skew` transform to text.
2. **The lowercase.** No headline is set all-lowercase to echo the mark. Hero Display is uppercase, Editorial Display is sentence case, and there is no third option.
3. **The diagonal device.** A brand graphic, never a typographic ornament. Never a bullet, divider, list marker, hover underline or letterform substitute. The eyebrow rule mark is horizontal, 1px, and deliberately not a scaled-down version of the device.

**Further rules.**

- **Never re-set "proarc" in General Sans** as a stand-in for the mark. Use the plain string "ProArc" in text-only contexts.
- **Clear space:** minimum the cap height of the wordmark on all four sides; minimum 24px in the header.
- **Minimum rendered width:** 96px desktop, 80px mobile. Below that the diagonal device fills in.
- **Field colour** is `#000000`, exactly `--color-surface-dark`, so the mark on a dark panel needs no adjustment and shows no seam. On light surfaces use the inverted master. **Action: confirm an inverted master exists.** Do not derive it with a CSS filter.
- **Never place the white mark on bare photography.** R1 measured 2.76:1 on the About hero.
- **The mark does not mirror in RTL.** Its position moves to the inline-start side; the artwork never flips. **Open brand question:** the device is directional and in RTL points against the reading direction. That is the mark owner's call. This document's position is that a wordmark is a fixed asset and mirroring it produces a second, unauthorised mark.

---

## 9. Do's and Don'ts

**Do**

1. **Align to `start`.** No centred body copy or headlines, never justified. The R1 home hero and project slides are centred; the About hero is not, and the About hero is the correct model.
2. **Use one family per script** and let weight do the work. A third family requires a version bump.
3. **Keep the measure between 45 and 68 characters.** Below 45, reduce the column count rather than the type size.
4. **Keep the page monochrome.** The only colour in the interface is validation. Client marks are reproduced as supplied under §1.5a and influence nothing else.
5. **Space in groups, not on a grid.** `--gap-tight` inside a component, `--gap-heading` from a heading to its content, `--gap-section` between sections.
6. **Measure contrast against the worst pixel**, never the average, wherever type meets an image.
7. **Set `lang` and `dir`** on every page and every inline language switch.

**Don't**

8. **Don't italicise, oblique or skew content type**, and don't use the diagonal device as an ornament.
9. **Don't put an eyebrow above the hero**, don't run eyebrows on consecutive sections, and don't invent section labels like "OUR MISSION".
10. **Don't number things that are not a sequence.** Five parallel disciplines and three parallel reasons are not steps. Delete `01`–`05`.
11. **Don't build a grid of identical cards.** Vary weight, size and structure by importance.
12. **Don't set body copy in uppercase**, and don't apply `text-transform: uppercase` to any element that can contain Arabic.
13. **Don't apply letter-spacing to Arabic. Ever.**
14. **Don't set type on a bare photograph**, and don't use a gradient that fades to nothing behind the words.
15. **Don't apply gradients, glows or shadows to text.**
16. **Don't build hierarchy from opacity.** Every colour is a named token with a measured ratio.
17. **Don't stack a small icon tile or outlined numeral above a heading.**
18. **Don't typeset a client's name in place of their logo.**

---

## Appendix A — Complete Token Block

```css
:root {
  /* Families */
  --font-latin: "General Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
                Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-arabic: "IBM Plex Sans Arabic", "Noto Sans Arabic", "Geeza Pro",
                 "Segoe UI", Tahoma, sans-serif;
  --arabic-scale: 1.05;

  /* Weights */
  --fw-light: 300; --fw-regular: 400; --fw-medium: 500;
  --fw-semibold: 600; --fw-bold: 700;

  /* Type scale — desktop, Latin */
  --fs-caption: 0.75rem;  --fs-metadata: 0.875rem; --fs-body: 1rem;
  --fs-body-lg: 1.25rem;  --fs-h3: 1.5rem;         --fs-h2: 2rem;
  --fs-h1: 3.25rem;       --fs-mega: 5.25rem;
  --fs-nav-overlay: 3.25rem;

  /* Line-height */
  --lh-mega: 1; --lh-hero: 1.05; --lh-editorial: 1.15; --lh-h2: 1.2;
  --lh-h3: 1.3; --lh-body-lg: 1.5; --lh-body: 1.6; --lh-metadata: 1.65;
  --lh-caption: 1.5; --lh-nav: 1.4;

  /* Tracking */
  --ls-hero: -0.03em; --ls-editorial: -0.005em; --ls-h2: -0.02em;
  --ls-h3: -0.015em;  --ls-body-lg: -0.005em;   --ls-body: 0em;
  --ls-caption: 0.04em; --ls-meta-label: 0.02em; --ls-nav: 0.06em;
  --ls-nav-overlay: -0.01em;

  /* Spacing — vertical */
  --space-2xs: 8px;  --space-xs: 12px;  --space-s: 16px;   --space-m: 24px;
  --space-l: 40px;   --space-xl: 64px;  --space-2xl: 96px; --space-3xl: 144px;
  --space-4xl: 200px; --space-5xl: 280px;

  --gap-inline:        var(--space-xs);
  --gap-tight:         var(--space-s);
  --gap-block:         var(--space-m);
  --gap-heading:       var(--space-xl);
  --gap-component:     var(--space-xl);
  --gap-section:       var(--space-4xl);
  --gap-section-major: var(--space-5xl);

  /* Layout frame — horizontal */
  --container-max: 1120px;
  --gutter-desktop: 80px;
  --gutter-tablet: 40px;
  --gutter-mobile: 20px;

  /* Component padding */
  --pad-card: 40px;
  --pad-overlay-panel: 48px;
  --pad-table-row: 12px;

  /* Measure */
  --measure-body: 68ch;      --measure-body-min: 45ch;
  --measure-body-lg: 60ch;   --measure-h3: 45ch;
  --measure-h2: 28ch;        --measure-hero: 20ch;
  --measure-editorial: 24ch; --measure-overlay: 18ch;
  --measure-body-ar: 620px;

  /* Colour */
  --color-ink: #111111;              --color-ink-secondary: #595959;
  --color-surface: #FFFFFF;          --color-surface-dark: #000000;
  --color-on-dark: #FFFFFF;          --color-on-dark-body: #EDEDED;
  --color-on-dark-secondary: #A6A6A6;
  --color-hairline: #D6D6D6;         --color-hairline-dark: #333333;
  --color-signal: #B3261E;           --color-signal-on-dark: #F2695C;

  /* Overlay */
  --scrim-min-opacity: 0.6;

  /* Brand */
  --logo-min-width-desktop: 96px;
  --logo-min-width-mobile: 80px;
  --logo-clear-space: 24px;
  --logo-max-third-party: 32px;   /* optical height, §1.5a */
}

html:lang(ar), [dir="rtl"] {
  font-family: var(--font-arabic);
  font-size: calc(1rem * var(--arabic-scale));
  --lh-mega: 1.2; --lh-hero: 1.25; --lh-editorial: 1.3; --lh-h2: 1.35;
  --lh-h3: 1.45; --lh-body-lg: 1.65; --lh-body: 1.75; --lh-metadata: 1.8;
  --lh-caption: 1.65;
  --fw-light: 400;
}
html:lang(ar) *, [dir="rtl"] * {
  letter-spacing: 0 !important;
  text-transform: none;
  font-style: normal;
}

@media (max-width: 1023px) {
  :root {
    --fs-mega: 3.75rem; --fs-h1: 2.5rem; --fs-h2: 1.75rem; --fs-h3: 1.375rem;
    --fs-nav-overlay: 2.5rem;
    --lh-mega: 1.05; --lh-hero: 1.1; --lh-editorial: 1.18; --lh-h2: 1.22;
    --ls-hero: -0.025em;
    --gap-section: var(--space-3xl);
    --gap-section-major: var(--space-4xl);
    --gap-heading: var(--space-l);
    --gap-component: var(--space-l);
    --pad-card: 32px;
    --pad-overlay-panel: 32px;
  }
}

@media (max-width: 767px) {
  :root {
    --fs-mega: 2.125rem; --fs-h1: 2.125rem; --fs-h2: 1.625rem; --fs-h3: 1.25rem;
    --fs-nav-overlay: 2rem;
    --lh-mega: 1.15; --lh-hero: 1.15; --lh-editorial: 1.25; --lh-h2: 1.25;
    --ls-hero: -0.02em; --ls-editorial: 0; --ls-h2: -0.015em;
    --ls-h3: -0.01em; --ls-body-lg: 0;
    --gap-section: var(--space-2xl);
    --gap-section-major: var(--space-3xl);
    --gap-heading: var(--space-m);
    --gap-component: var(--space-l);
    --pad-card: 24px;
    --pad-overlay-panel: 24px;
  }
}
```

---

## Appendix B — Design Critique Record

Audited against the impeccable.style catalogue of 46 convergent-design patterns.

**Changed as a result**

- *Hero eyebrow, repeated section kickers*: restricted in §4.5 to genuine taxonomy, never above the hero, never consecutive, never a pill.
- *Numbered section markers*: prohibited in §9 rule 10 for non-sequential items after the R1 build used `01`–`05` and `01`–`03`.
- *Identical card grids*: prohibited in §9 rule 11.
- *Overused font*: Inter removed from the decision and from the fallback chain.
- *Low contrast text*: the v0.2 scrim value of 55% measured 4.74:1 and was replaced with a 60% floor at 5.74:1. Secondary greys over photography prohibited after measuring 3.46:1 in R1.
- *Hierarchy from opacity*: replaced with measurable tokens.
- *Line length too long / too short*: §2.5 adds a 45-character minimum after R1 measured 32–35 characters in three-column prose.
- *Nested cards*: §4.7 removes the bordered container inside the overlay.
- *Tiny body text*: §3 restates the 16px and 12px floors after R1 shipped 11–13px in three places.
- *Gradient text, icon-tile-above-heading, justified text, all-caps body*: explicit prohibitions in §9.

**Considered and deliberately kept**

- *Single font family for everything*: the catalogue prefers a display face paired with a body face. Rejected. All five reference studios run one family; the dual register plus case and tracking supplies the differentiation.
- *Flat type hierarchy*: the 1.20 step between H3 and Body Large is below the 1.25 guidance. Kept, with the weight-delta rule in §4.3, because a six-step scale from 12px to 52px cannot hold 1.25 throughout and the references sit in the 1.2–1.4 band by choice.

---

## Appendix C — Change Record

### v1.1 → v1.2

| Area | v1.1 | v1.2 | Trigger |
|---|---|---|---|
| Spacing | one line: "12px within, 96px between" | full ten-step scale with semantic aliases and responsive steps (§2.1–2.3) | build invented a sound scale; spec had none |
| Section gap | 96px | 200px default, 280px for statement sections | 96px measured too tight for the design's character |
| Horizontal frame | gutters only | container max 1120px, gutter minimums, resulting gutter table (§2.4) | build ran 1301px container / 177px gutters; the tightest thing on the page |
| Measure | maxima only (68ch / 60ch) | adds a 45-character **minimum** and a two-column limit for prose (§2.5) | build ran 32–35 characters in three columns |
| Component padding | not specified | card 40px, overlay panel 48px, table row 12px (§2.6) | not specified anywhere |
| Desktop nav | horizontal top bar | full-screen overlay role with trigger, nav, mega-menu and focus rules (§4.7) | build uses an overlay; spec covered neither |
| Third-party logos | not addressed | §1.5a carve-out: reproduce as supplied, never typeset a client name, white surfaces only, 32px optical height, uniform containers | client marks put colour on a monochrome page |
| Type floors | stated once | restated in §3 with the three R1 breaches named | build shipped 11–13px in three places |
| Heading case | "sentence case" | restated in §4.3 with the R1 inconsistency named | build mixed sentence and Title Case |
| Wordmark on photo | prohibited | prohibition retained, with the measured 2.76:1 failure cited (§4.9, §8) | R1 measurement |

### Open items requiring an answer from ProArc

1. Confirm an inverted black-on-white master of the wordmark exists, or commission one.
2. Confirm whether release one is bilingual or English-only.
3. Decide the RTL treatment of the mark's directional stripe device. This document's position: never mirrored.
4. Run the 16px against 17px Latin/Arabic proof and confirm or adjust `--arabic-scale`.
5. Obtain real logo assets for every client currently shown as typeset text, or remove those clients from the grid.

---

*ProArc Typography & Layout Guideline v1.2. Locked 27 July 2026. Changes require a version increment and re-verification of §6.*
