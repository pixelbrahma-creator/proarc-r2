# ProArc — R2

A structure and flow redesign of the ProArc architecture-practice website.

This repository is **R2**. It is not a branch of the v1 site and it does not
modify it. v1 is Ravi's build, fixed against Typography Guideline v1.2 and
shipped from his own repository; it is not touched at any stage. R2 is built
here, against v1.2 plus the signed v1.3 extension, and handed over as a whole.

---

## What is in here, and where it came from

R2 inherits a **system** and a **body of content**. It inherits no pages.

**Carried across, unchanged unless noted**

| | |
|---|---|
| `assets/fonts/` | General Sans (ITF Free Font License) and IBM Plex Sans Arabic (SIL OFL 1.1), self-hosted. Licensed, subsetted, `unicode-range`d. |
| `src/styles/tokens.css` | The v1.2 type system implemented — scale, weights, letter-spacing, measures, the neutral colour ramp, the `.t-*` type roles. **Changed:** E11's corrected measures folded in (`--measure-body` 68ch → 55ch, `--measure-body-lg` 60ch → 48ch). |
| `src/styles/fonts.css` | `@font-face` declarations. |
| `src/styles/tokens-layout.css` | Spacing, radius, motion, z-index. **Changed:** `--container-max` restored to the locked 1120px (see below). |
| `src/styles/base.css` | Reset and element defaults. Carries one open review item, flagged in the file. |
| `src/styles/layout.css` | `.container`, `.section`, `.grid`, `.split`, aspect ratios. |
| `data/projects.json` | All 47 project records. |
| `images/` | 370 committed `.webp` derivatives — heroes, hero-md, thumbs, 194 gallery frames, 34 logos. |
| `build/` | The static pipeline. |
| `docs/` | Typography Guideline v1.2 (locked) and v1.3 (signed). The design authority. |
| `php/contact.php` | The form endpoint, for the eventual real host. |
| `js/smooth-scroll.js`, `js/reveals.js` | Design-neutral scroll plumbing. |

**Deliberately not carried**

v1's markup and its visual vocabulary: every root `.html`, every
`projects/*.html`, `pages-src/*.html`, `src/styles/components.css` (1,263
lines), `src/styles/pages/*.css` (663 lines), the project-detail template,
`partials/header.html`, `partials/footer.html`, and the page-specific scripts
(`nav.js`, `home.js`, `projects-filter.js`, `contact.js`, `careers.js`,
`testimonials.js`).

None of it is lost — it is alive and shipping in Ravi's repository, which is
where the v1 track lives. It is simply not the material R2 is made from.

### Two corrections applied during the move

1. **`--container-max` 1250px → 1120px.** v1 carries 1250px from a client
   request made against the v1 track (`b8ea7a7`, "1250px content width,
   centered hero"). That request contradicts v1.2 §2.4 and §9 rule 1, and it
   was written into a *global* token, so it would have crossed into R2 by
   import rather than by decision. R2 starts from the locked value. If ProArc
   restates the request at the R2 walkthrough, it is decided on the record.

2. **E11 measures folded into `tokens.css`.** While R2 shared a repository
   with v1 these lived in a scoped override file so they could not restyle
   v1's shipped pages. There is no v1 here to protect, so they go where they
   belong.

---

## The build

```
npm install
npm run build:manifest   # reconstruct images/manifest.json from committed .webp
npm run build:pages      # generate the project pages
npm run lint:css
```

> **The manifest trap.** `images/manifest.json` is gitignored and the raw
> sources are not in this repository. `build:pages` does **not** fail without
> a manifest — it silently emits an empty project-data island. Always run
> `build:manifest` after a fresh clone. `npm run build:manifest:check`
> verifies the manifest against what is actually on disk without writing.

`build:images` is only for reprocessing from raw sources, which live on the
machine that first processed them.

---

## Page inventory — 58 pages, all authored fresh

| Group | Pages |
|---|---|
| Home | 1 |
| Work | arrival · ledger · 3 sector pages (schools, malls, homes) · 47 project pages from one template | **52** |
| Rest | `/ajman` · Services · About · Contact · Careers | **5** |

There is no offices sector page: the sector rule requires five built
projects and offices has three. Testimonials is deleted outright.

The 47 project pages come from a single template, so that column is one
piece of work, not forty-seven.

---

## Rules

- **`docs/` is the authority.** v1.2 is locked; v1.3 is signed. Layout comes
  from the screen specs, words come from the brand framework. Neither is
  overridden by what looks good in a browser.
- **Root `.html` and `projects/*.html` are build outputs.** Never hand-edit.
  Edit the source and rebuild.
- **No raw colour outside `tokens.css`**, no px font-sizes, no physical
  direction properties, no `text-align: left|right`. stylelint enforces all
  four on every commit.
- **Every page ships checked** at 375 / 768 / 1440, under `dir="rtl"`, and at
  200% zoom without horizontal scroll. Any new colour pair is measured before
  it ships — v1's wordmark shipped at 2.76:1 because it was eyeballed.

## Handover

R2 is handed over once, as a whole, at the end — not incrementally. This
repository is standalone, so it can be transferred to ProArc or to Ravi
outright when that time comes.
