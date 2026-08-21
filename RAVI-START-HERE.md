# Ravi — start here

Mahesh is away for a few days. This branch is yours; `main` is frozen and must
stay that way. Everything below has been run from a clean clone and works — the
board came back **59/59 in 108s** on a fresh machine before this was written.

---

## 1 · Setup, once

```bash
git clone https://github.com/pixelbrahma-creator/proarc-r2.git
cd proarc-r2
git checkout ravi/dev            # ← your branch. NOT main.

npm install                      # sharp + stylelint, nothing else

mkdir -p _bmad
git clone https://github.com/pixelbrahma-creator/proarc-r2-tools.git _bmad/tools

npm run build:manifest           # 🔴 REQUIRED — see below
npm run build                    # should leave the tree clean
git status                       # must print nothing
```

🔴 **`npm run build:manifest` is not optional and skipping it fails SILENTLY.**
`images/manifest.json` is gitignored, and `build:pages` **does not error without
it** — it emits an empty project-data island and the site ships with no images
wired. `git status` printing nothing after `npm run build` is your proof that the
build reproduces what is committed.

⚠️ **`npm run build:images` will do nothing here** and that is correct: it reads
raw sources that are not in this repository. It exits rather than writing the
empty manifest that would strip every image from the site.

---

## 2 · The loop

```bash
npm run serve         # 127.0.0.1:8765 — every browser probe needs an HTTP origin
npm run check:fast    # 13 static checks, ~1s. Run this constantly.
npm run check:changed # + the probes your diff implicates
npm run check         # everything, ~100s. Before every commit.
```

**Expect 59/59.** The board prints one omission:

```
board: 1 check(s) OMITTED — their subject is not in this checkout:
  sweep-pins  (needs _bmad/wds/D-UX-Design)
```

That is a check on Mahesh's design documents, which you do not have and do not
need. Nothing about the pages goes unchecked.

⚠️ **If the board looks slow or randomly red, it is usually contention.** Check
`uptime` and `pkill -f "remote-debugging-port="` before believing it. A 43-check
run once took 1,399s purely from 40 orphaned Chromes and read exactly like a
regression. `p23 ajman selection` is pointer-timing sensitive and is the usual
first casualty — re-run it clean before reporting it.

---

## 3 · 🔴 Never hand-edit the HTML

Root `*.html` and `projects/*.html` are **build outputs**. Editing them works
until the next `npm run build` silently reverts you.

**Edit these instead**, then rebuild:

| you want to change | edit |
|---|---|
| a hand-authored page | `pages-src/*.html` |
| the header, footer, head, scripts | `partials/*.html` |
| any style | `src/styles/` |
| record data | `data/*.json` |
| the 47 record pages | `partials/project-detail.template.html` + `build/lib/records.js` |

**Every colour and type value comes from a token** in `src/styles/tokens.css`.
🔴 **If the value you need is not a token, stop and leave it — do not invent
one.** Message Mahesh and park it. A new size is a guideline revision, not a
build-time decision.

---

## 4 · The twelve hard rules are in `CLAUDE.md` — read it before touching CSS

It is long and it is the authority. The ones most easily broken by accident:

- **No hardcoded colours or font sizes.** `var(--color-*)`, `var(--fs-*)`, in `rem`.
- **No physical directions.** The site is bilingual: `margin-inline-start`, not
  `margin-left`. `text-align: start`, not `left`.
- **No text on a photograph.** Use the black panel.
- **Body text never below 16px.** Absolute minimum anywhere is 12px, for captions
  and labels only.
- **No border-radius, no italics on content type, no gradient text, no shadows.**
- **Hierarchy never comes from opacity** — size, weight, space.

---

## 5 · Things that look like bugs and are decisions

Please do not "fix" these. Each was measured and chosen, and several were
re-decided more than once:

- **On mobile (≤767) Mega Splash resolves to H1 — both 34px** — and **H3 and Body
  Large are both 20px**, separated by weight (600 vs 300) and space. If two things
  read as the same size, the answer is weight or space, never a new size.
- **The sector/room tiles go TWO-up below 767**, not one column. A justified row of
  four gives 55px tiles at 375.
- **The footer nav breaks 4 + 3** by grid. Seven labels are 309px against 353px of
  column, so one row is impossible; the break is stated rather than left to rag.
  Its column gaps are deliberately uneven.
- **The chrome wears one of two INKS and has no black box** — except the
  hamburger's small chip over photographs, which is the only field left on the
  site and is there because bare strokes measured 1.28–2.65:1 against a 3.0 floor.
- **The wordmark is absent over a photograph**; the hamburger is not. Identity may
  be absent, navigation may not.
- **The chrome retires after one viewport height + 500px of downward scroll** and
  returns after 24px upward. That asymmetry is intentional.
- **The mark does not resize** on scroll. It used to; it was removed on 21 Aug.

---

## 6 · What is live, and what must not move

- The preview is **https://pixelbrahma-creator.github.io/proarc-r2/** and it is
  served from **`main`**, which is frozen at tag `milestone/2026-08-21-XLI`.
- 🔴 **ProArc are reviewing that exact preview right now.** Four questions about
  the chrome went to them on 21 Aug and their reply is outstanding. If `main`
  moves, their feedback stops being about a known state. **Push only to
  `ravi/dev`.**
- To see your own work, run `npm run serve` and use `127.0.0.1:8765`.
- ⚠️ On a phone, the preview's HTML is cached for 10 minutes (`max-age=600`). The
  CSS filenames carry content hashes so they can never be stale, but the page that
  points at them can be — **a cached page shows the old CSS and reads exactly like
  a failed deploy.** Add `?fresh=1` to force it.

---

## 7 · One measurement worth inheriting

If you tune anything for mobile: **a phone's screen is not its viewport.** The
iPhone this was last tuned on is 393 × 852, and Safari's URL bar (96) and toolbar
(83) take 179 of it — **the page gets 672.** A whole session's decisions were
taken against 852 and arrived weaker than agreed. Headless Chrome also clamps the
viewport to 500px minimum, which is why every narrow check runs in a same-origin
iframe.

---

## 8 · Before you stop for the day

```bash
npm run check          # 59/59
git add -A && git commit && git push origin ravi/dev
```

Leave `main` alone. Mahesh will review the branch against
`milestone/2026-08-21-XLI` when he is back.
