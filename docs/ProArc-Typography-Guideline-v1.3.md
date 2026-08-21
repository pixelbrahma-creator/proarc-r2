# ProArc Typography & Layout Guideline — v1.3 extension

**Status: LOCKED — signed off by Mahesh, 31 July 2026.** This document extends
`ProArc-Typography-Guideline-v1.2.md` (which remains locked and in force); it does not replace
it. Read the two together: v1.2 is the base system, this file is everything the dark ground and
the R2 screens required beyond it. Anything neither document covers is a spec extension decided
with Mahesh — never a build-time choice.

**Scope:** everything the dark ground requires and v1.2 does not cover, **plus every rule a screen
turned out to need that was a system rule rather than a screen decision.** Drafted 28 July 2026 from
the Screen 01 decisions (ground Option C, mark W1) and grown by four screens since:

| Added | From | Clauses |
|---|---|---|
| 29 Jul | Screen 01, board 7 | **E1.4** — the opening statement may take paper |
| 30 Jul | Screen 03 | **E9** image provenance · **E10** the three copy rules for navigation surfaces |
| 30 Jul | Screen 04 | **E1.2a** the band owns the switch on a paper page · **E3.6** the lead photograph of a set whose proportions vary · **E10.2a** a record states its own place · **E10.4** the statement is the summary |
| 30 Jul | Screen 05 | **E7.1–E7.5** the map's five clauses · **E10.2b** the ground is the subject on /ajman · **E1.2b** drafted and deliberately not written · E1's table corrected (the /ajman keepers row removed) |
| 30–31 Jul | Screen 06 *(CLOSED 31 Jul)* | **E3.7** a generated drawing states only what its record holds · **E9.6** E9 governs drawings, not only photographs · **E11** the measure token is not the measure. **E1's Services row is decided: `#000000`** (Mahesh, 31 Jul) |
| 31 Jul | Screen 07 *(About)* | **E10.2c** the four verbs may appear on About once, in their human sense · **E1's About/Contact row confirmed**, unamended, which completes E1's page-type table for R2 · **E12** is the clause this screen was written to from its first line |
| 31 Jul | Screen 09 *(the menu — CLOSED, the last screen)* | **E13.1–E13.4** the §4.7 amendment set (bars-only trigger · the identity-chrome field rule · the swap replaces the always-on mega grid · the sub-desktop form) · **W1 reaffirmed** after a same-day full reach-back (C-2 Benoy pairing and C-3 declined on rendered frames) |

**It has roughly doubled since it was drafted, and nobody has yet read it end to end as one
document.** That read is worth doing before sign-off rather than at it, because the clauses arrived
one screen at a time and their interactions have never been checked as a whole. Base items are
numbered E1–E10 as listed in `00-Design-Continuity.md` §9.

**The headline: this extension adds no new colour value.** Every rule below is built from the
eleven tokens already in v1.2 §1.6. Where a dark surface needs a value v1.2 assigned to a light
one, the extension **reassigns an existing token** rather than inventing a grey. A dark site
that needs new greys is a dark site building hierarchy from opacity, which §9.16 prohibits.

---

## E1 · The ground rule

**Black states, paper proves.**

Black carries the practice's voice — the pages where Proarc asserts something. Paper carries
the evidence — the pages a reader works through, and every page that reproduces someone else's
property.

| Surface | Ground | Why |
|---|---|---|
| **Home — the claim and the photograph's caption strip** | **`#FFFFFF`** | **Amendment, 29 Jul — see E1.4** |
| Home — the sentence, the four rooms, the mosque line, the map, the footer | `#000000` | The narrative page |
| **/ajman — every section** | **`#000000`** | The discovered chapter; the argument. **One ground end to end** — corrected 30 Jul, see below |
| ~~/ajman — the keepers grid~~ | — | **Removed 30 July 2026 (Screen 05).** The client wall moved to **About**, which is already `#FFFFFF`, so §1.5a is satisfied by the page instead of by an exception. /ajman carries the authority sentence on its own black ground and no third-party mark at all |
| The menu overlay | `#000000` | v1.2 §4.7 as amended by E13 |
| Closing invitation bands, site-wide | **the inverse of the page** (E1.2) | Black pages take a `#FFFFFF` band; paper pages a `#000000` one. **Contact carries no band at all** (E1.2c). *(Corrected at consolidation — this row previously said `#FFFFFF` site-wide, contradicting E1.2's own rule)* |
| Footer, site-wide | `#000000` | Closes the page as it opened |
| **Work index and all 47 project pages** | `#FFFFFF` | Sustained scanning, 47 photographs at mixed quality, spec tables, client names |
| **Services** | **`#000000`** | **Amendment decided 31 Jul 2026 (Screen 06, Mahesh):** the page states rather than proves — no client mark, no spec table, no inventory, no photograph — so none of paper's four reasons applies. Joins Home and /ajman as a stating surface |
| About — incl. the client wall | `#FFFFFF` | **CONFIRMED 31 Jul (Screen 07), E1 unamended.** Paper by hard rule, not preference: §1.5a bars third-party marks from `--color-surface-dark` and the wall is About's, so a black About would need a forced paper panel — the pattern Screens 05 and 06 spent two sessions eliminating. *(The separate client-wall row above was merged here at consolidation)* |
| Contact | `#FFFFFF` | **DECIDED 31 Jul (Screen 08) on its own rendered facts, not on E6** — the E6-based reason recorded at Screen 07 was circular (E6 exists so a form *can* be dark; see E6's scope correction). Paper because: the error state stays `#B3261E` instead of becoming R2's most saturated pixel · the browser's unoverridable autofill paint is invisible on paper and luminous on black · the page has no closing band (E1.2c), so the footer's black is its one ground switch. Black genuinely passed the Services stating test — this was a choice, made on board 15 §4's frames |
| Company profile PDF and all print artefacts | `#FFFFFF` | E8 |

**E1.1 — Switches land on section boundaries.** A ground change is full-bleed, at a section
edge, with no transition, no gradient, no hairline at the seam. A ground that changes mid-scroll
or mid-section is a bug, not an effect.

**E1.2 — The closing band inverts.** On a black page the closing invitation cannot be another
black band. It becomes `#FFFFFF` with `#111111` type — the single lit surface on the page, and
the moment the page asks for the project. On a paper page the closing band stays `#000000` with
`#FFFFFF` type, exactly as v1.2 has it. **The rule is: the closing band is always the inverse
of its page.**

**E1.2a — On a paper page the band owns the switch.** *Added 30 July 2026 from Screen 04.* On a
black page the closing band is white and reads as the one lit surface. On a **paper** page E1.2
inverts the other way — the band is `#000000` — and the footer is `#000000` too, so **the band and
the footer share a ground.** Two consequences, and they are rules:

1. **Nothing may sit between a paper page's last paper section and the footer** except the band. A
   third black block between them (the current build puts prev/next there) makes the paper→black
   switch — which is the band's entire effect — unreadable.
2. **The band is separated from the footer by structure, never by ground:** scale (the band's
   statement is display type; the footer's is 15px), and the footer's own `#333333` top hairline,
   which is the one thing that value is permitted to do (E3.2, decorative separation between text
   sections).

**E1.3 — One ground per page.** A page does not alternate. The only permitted exceptions are the
closing band (E1.2), a forced paper panel under §1.5a, and **the opening statement (E1.4)**.
Anything else is a new page.

**E1.2c — on a page with no closing band, the footer owns the switch.** *Added 31 July 2026 from
Screen 08.* One page in R2 carries no closing invitation band: Contact, which is every band's
destination — a band there would invite the reader to the page they are standing on, and the form
is the invitation. On such a page the paper→black switch that E1.2a gives to the band belongs to
**the footer alone**, landing on a section boundary (E1.1) as the page's only ground change.
Nothing may sit between the last paper section and the footer. The clause is deliberately narrow:
it does not license removing bands elsewhere — a page loses its band only where the band's
destination is the page itself.

**E1.2b was drafted and is not needed — recorded so the reasoning is not lost.** *30 July 2026.*
Screen 05 was going to need the mirror of E1.2a: on a **black** page, a forced paper panel adjacent
to the (white) closing band shares its ground, so the two would have to be separated by structure
rather than by ground. **The clause is not written, because no page needs it any more.** Moving
/ajman's client wall to About (Screen 05 §6.2) left /ajman with a single paper surface — the band —
and no page in R2 now carries a forced paper panel on a black ground. **If a later screen does, the
clause is E1.2a read from the other side, and the separation devices are the same: scale, plus a
`#D6D6D6` hairline on paper.** The general principle already covers it: *the two paper surfaces of a
black page must be adjacent, or the page alternates and E1.3 is broken.*

**E1.4 — The opening statement may take paper.** *Added 29 July 2026 by team decision on board 7,
before this draft was signed off.* A page whose first act is a **claim in display type** may set
that claim, and the caption strip of any photograph directly beneath it, on `#FFFFFF` with
`#111111` type, switching to the page's own ground at the first section boundary below.

- **Why the exception exists.** Home's job is to answer *is this practice substantial?* in about
  four seconds, and the only tools available are a sentence and one at-tier photograph. Every
  black-ground hero tested on board 6 put the claim on a panel over the image, which reads as a
  treatment applied to an asset — a small practice's move. On paper the claim reads as a practice
  stating a fact, and the photograph below it corroborates rather than carries.
- **The limit.** One such surface per page, at the top, ending at a section boundary. It may hold
  a claim, its support line, a photograph and that photograph's caption — **never a room, a
  list, a grid or a form.** A second paper section further down is E1.3's violation, not this
  exception.
- **Consequence for Home:** three switches, all on boundaries — paper → black at the sentence,
  black → paper at the invitation (E1.2), paper → black at the footer. The wordmark plate is a
  **visible black rectangle** across the opening statement and dissolves onto the black ground
  below it, which is §8's specified behaviour rather than a state change.
- **Sign-off note:** if the team declines this amendment at sign-off, Home's claim returns to
  `#000000` and `01-home.md` §4.1 changes with it. Nothing else on the page depends on it.

---

## E2 · The dark role table

v1.2 §4 assigns one colour per typographic role, assuming a white ground. This is the dark
column. It introduces no token; it assigns the three existing dark values.

| Role | Light ground (v1.2) | **Dark ground** | Ratio |
|---|---|---|---|
| Hero Display, Editorial Display, H2, H3 | `--color-ink` | `--color-on-dark` `#FFFFFF` | 21.00:1 |
| Body, Body Large, inline emphasis | `--color-ink` | `--color-on-dark-body` `#EDEDED` | 17.94:1 |
| Caption, eyebrow, label, metadata label | `--color-ink-secondary` | `--color-on-dark-secondary` `#A6A6A6` | 8.63:1 |
| Metadata value | `--color-ink` | `--color-on-dark-body` `#EDEDED` | 17.94:1 |
| Nav rest / active | — | `#A6A6A6` → `#FFFFFF` + weight 700 | 8.63 → 21.00 |
| Form helper | `--color-ink-secondary` | `#A6A6A6` | 8.63:1 |
| Form error | `--color-signal` | `--color-signal-on-dark` `#F2695C` | 6.95:1 (E6) |

**E2.1 — Emphasis without panels.** On white, emphasis has a fourth device: a black panel. On
black there is no panel, so a dark page has **three text values and no more**. Emphasis inside
running copy is **weight 600 in `#EDEDED`** — the same value, not a brighter one. Lifting a word
to `#FFFFFF` inside body copy is an opacity ramp wearing a token, and it is prohibited.

**E2.2 — No second dark surface.** There is no raised card grey, no `#0A0A0A`, no `#141414`.
Grouping on a dark ground is done with **space and rules**, never with a lighter panel. This is
what keeps every pair on this page already measured.

**E2.3 — The wordmark's field is `#000000` exactly**, which is why no near-black is permitted
anywhere: a `#0A0A0A` panel behind the mark shows a seam. (Concept board 2 and an earlier line
in continuity §4 both had `#0A0A0A`; both are corrected.)

---

## E3 · Photography and rules on a dark ground

**E3.1 — Images bleed to their container edge.** No vignette, no fade-to-ground, no scrim used
as decoration. A photograph that fades into black is the gradient-behind-text failure in another
costume.

**E3.2 — The boundary problem, and the measured answer.** A dark photograph on a white page has
an implicit edge. On black it does not, and the image stops being an object. Where a line is the
only thing bounding an image, an interactive target, or a state, WCAG 1.4.11 requires **3:1
against its background** — and the current hairline does not meet it:

| Line on `#000000` | Ratio | Use |
|---|---|---|
| `--color-hairline-dark` `#333333` | **1.66:1** | Decorative separation only — a rule between two text sections, where nothing depends on seeing it |
| `--color-ink-secondary` `#595959` | **3.00:1** | **Structural.** Any line that bounds an image, defines a hit target, or carries state |

`#595959` is already a token — v1.2 uses it as light-ground secondary text. On black it is
exactly the non-text floor. No new value is needed.

**E3.3 — Uniform treatment.** Frames are all-or-none across a set, per the principle already in
§1.5a rule 5. Never a mix within one grid.

**E3.4 — Text over photography is unchanged.** The black panel remains the default and the 60%
scrim remains the full-bleed fallback, pure `#FFFFFF` only. `--color-on-dark-secondary` over a
photograph falls to 3.46:1 and stays **prohibited** on either ground.

**E3.6 — The lead photograph of a set, when the set's proportions vary.** *Added 30 July 2026 from
Screen 04.* Stated as arithmetic, because it was mistaken for a matter of taste twice:

> **Full width, no crop and a capped height cannot coexist.** At a 1440px page width an uncropped
> 3:2 photograph is 960px tall, so anything below it starts off-screen. Cap the height and the image
> no longer reaches the page edges. Keep it edge-to-edge *and* capped and you are cropping.

Therefore, where a repeating page type's lead photograph **varies in proportion across the set**, the
image is shown **at its own aspect ratio inside a bounded column, height-capped, and never cropped**,
and **one arrangement serves the whole set** — the shape of the image's box varies because the
photographs do, and nothing else changes.

- **A fixed-height full-bleed band is available only where every image in the set shares a
  proportion, or where an art-directed crop exists per record** (E3.5). Absent both, a band crops on
  every page and destroys the ones whose subject is vertical.
- **Corollary, from the ProArc library:** a tower is photographed in portrait because that is the
  only way to photograph a tower. A landscape alternative of a tall building shows less building, so
  a portrait lead image is **not** a data defect to be corrected by asset request — it is a layout
  requirement.
- **Nothing is set on the photograph** in this arrangement, so §1.5's panel and the 60% scrim are
  not needed and must not be introduced: the hard rule is satisfied by composition. A page type built
  this way carries **no photo-contrast measurement at all**, which is its main structural advantage.

**E3.5 — Photography standard rises on black.** A flat or badly-lit image is more exposed on
black, not less. Where a dark ground carries photography, two art-directed crops are required —
wide and tall — and the tall crop must keep the subject's mass clear of any panel.

**E3.7 — A generated drawing states only what its record holds, and its ground line is real.**
*Added 30 July 2026 from Screen 06.* Where a page draws its own artefact from `data/`
(E7.1's principle taken off the map), three rules bind, and each of them was a real error first:

1. **The datum is not decoration.** Levels the record places **below** ground are drawn below
   the ground line. Rev 4 of Screen 06's range drawing summed `2B+G+6P+42F` to fifty-one and
   stacked all fifty-one above the line, asserting a fifty-one-storey tower where the record
   says forty-nine above ground and two below. **A drawing may not say more than the record**
   (E7.2, off the map).
2. **Display copy speaks the units a reader can see.** Where a drawing shows above- and
   below-ground levels, any figure set in display type is the **above-ground** count, and it is
   generated, never typed. Screen 06's *"Two storeys at one end, forty-nine at the other"* is
   the whole sentence's arithmetic, so a corrected record changes the output and never the copy.
3. **Internal rules are deleted whole below the width they survive, never shrunk.** Fifteen
   stacked elevations render at a 5.11px floor pitch at 1280, 3.66px at 768 and **1.81px at
   375** against a 1px non-scaling stroke — at which point the tall stacks fill solid. Below
   768px the floor lines are dropped **all of them or none**, leaving the silhouette and the
   datum, which are what carry the argument. This is E7's label floor read for line-work:
   *below its floor, a mark is deleted rather than shrunk*, and it is E3.3's uniform treatment
   that makes "all or none" the only available form.

**Measure the rendered pixel, never the authored one.** Both errors above are invisible in
source and obvious in a browser; neither was found by looking at the board.

---

## E4 · Pairs, verified

**Home introduces no unmeasured text pair.** Every value is a token with a ratio already in
v1.2 §6.2. The extension adds two **non-text** ratios, computed here and to be carried into §5
of the locked document:

| Pair | Ratio | Needs | Verdict |
|---|---|---|---|
| `#333333` on `#000000` | 1.66:1 | 3:1 for structural | Decorative use only |
| `#595959` on `#000000` | 3.00:1 | 3:1 | Structural minimum, exactly |
| `#FFFFFF` band on `#000000` page | surface adjacency | — | No text ratio; the band's own type is `#111111` on `#FFFFFF` = 18.88:1 |

**E4.1 — Focus indicators on dark.** 2px `#FFFFFF` outline with 2px offset — 21:1, the maximum
available. Never a dimmed or coloured ring.

**E4.2 — The standing rule.** Any new text/background pair is measured against the **worst
pixel**, never the average, and added to §5 before it ships. This is how R1's 2.76:1 wordmark
happened, and it is the one procedural rule that prevents a repeat.

---

## E5 · Arabic on a dark ground — ACTION, not yet answered

Arabic never uses weight 300; it maps to 400 (§7.3). Light strokes bloom on dark, and the
extension must not guess at the result.

**Required test before the bilingual build:** IBM Plex Sans Arabic at 400 and 600, on `#000000`
at `#EDEDED` and `#FFFFFF`, at 16px, 20px and display sizes, rendered on macOS and Windows.
Record whether 400 holds at body size on black or whether the dark ground requires 500 as its
floor. **Letter-spacing stays zero regardless — always.**

**Scope rewritten at consolidation (31 Jul).** An earlier close read *"Arabic pages default to
the paper ground; this costs nothing, because every Arabic page in scope is already paper"* —
written while Services was paper. **Services is now `#000000`, and the dark-ground Arabic
surfaces are real and central: Home, /ajman, Services, the menu overlay, every closing band's
inverse and every footer.** The deferral is no longer free: until E5's test runs, an Arabic
build either ships those pages with untested Light-mapped-to-400 strokes on black, or holds the
bilingual build. **E5 therefore rises in priority — it must run before the bilingual build's
first dark page, and its result may set 500 as the Arabic floor on black.** The test itself is
unchanged (above). Letter-spacing stays zero regardless — always.

---

## E6 · Form states on dark

One swap, written down before the forms phase begins:

| State | Light | Dark |
|---|---|---|
| Helper | `--color-ink-secondary` 7.00:1 | `#A6A6A6` 8.63:1 |
| Error text | `--color-signal` `#B3261E` 6.54:1 | `--color-signal-on-dark` `#F2695C` 6.95:1 |
| Error rule, 2px inline-start | `#B3261E` | `#F2695C` |
| Field border | `--color-hairline` | **`#595959`** — a field border is structural (E3.2) |

`--color-signal` `#B3261E` on black is **3.21:1 and prohibited**. `--color-signal-on-dark`
`#F2695C` on white is **3.02:1 and prohibited**. Neither token is interchangeable.

Colour never carries the message alone on either ground: colour **plus** an explicit text
string **plus** the 2px inline-start rule.

**E6.1 — the field border is structural on BOTH grounds.** *Added 31 July 2026 from Screen 08
(board 15, F1).* The table above assigned the dark border `#595959` (3.00:1, exactly 1.4.11's
floor) and left the light border at `--color-hairline` `#D6D6D6` — **1.45:1 on white, below the
floor on every form the site has ever shipped** (`components.css` `.form-field input`). A field
border is a component boundary, so it is structural under E3.2 on either ground: **light takes
`#595959` too** (7.00:1). `--color-hairline` remains correct for decorative rules; it was never
correct for an input boundary.

**Scope, corrected 31 July (Screen 08).** An earlier close to this clause read *"Contact is a
paper page under E1, so this applies to any form that later lands on a dark surface."* Screen 07
then cited that line as the reason Contact **must** be paper — which is circular: **E6 exists
precisely so a form can be dark** (that is what the token swap is for), and `tokens.css` already
ships the dark path (`.surface-dark .field-error` / `.field-invalid`). Contact was decided paper
on Screen 08 on its own rendered facts (error-state saturation, the browser's autofill paint, the
terminal switch — `08-contact.md` §2), with E6's swap table unused but intact for any dark-surface
form the site ever adds.

---

## E7 · Illustration and line-work — the map

Already a launch gate in v4 §8.2; the ground decision widens it. Required before the artwork is
commissioned:

| Rule | Draft position |
|---|---|
| Coastline stroke | 2px. `#111111` on paper, `#FFFFFF` on black |
| District boundaries | 1px. `#D6D6D6` on paper, `#333333` on black — decorative, nothing depends on seeing an individual boundary |
| Building marks | Solid dot, 5px radius at the reference viewport, scaling with the frame. `#111111` / `#FFFFFF` |
| Interactive district hit areas (/ajman) | Bounded at **`#595959` on black** — structural under E3.2 |
| Marker vocabulary | One mark for one building. No second shape, no size ranking, no category glyphs. Sector is carried by the district list, not by the marker |
| Label floor | 12px, `#595959` on paper / `#A6A6A6` on black. Below 12px a label is deleted, never shrunk |
| RTL | Geometry does not mirror — Ajman is not reversible. **Label alignment flips; the coastline does not** |
| Reduced motion | The finished map, immediately: every marker placed, counter at the current year, labels resolved |
| Fallback | Option B constellation — identical build minus the linework. Contractual |

**Prerequisite:** O5 duplicate verification and location normalisation before the brief goes
out. The map cannot be drawn against an unsettled record count — the 31 Jul external
corroboration indicates two educational pairs merge, and a fifth candidate pair (Bluebell /
One 678) is open; the honest total lands wherever O5 lands, and the marks are generated, so
the brief waits on the data, not the other way round.

### E7.1–E7.4 — added 30 July 2026 from Screen 05

These four came out of building the map rather than describing it, and each of them changes the
commission brief. None is improvisable at build time.

**E7.1 — The map is three layers, and the commission supplies one.** A stroke or a type size set
*inside* a scaling drawing is not that size on the page. The artwork is authored at a reference
size and rendered at another — in Screen 05's 58% column that factor is about **0.78**, so a 12px
label lands at **9.3px**, below E7's own floor, and a 5px mark lands at **3.9px**. The same drawing
at full width renders **1.34×** and both are too large. Therefore:

| Layer | Supplied by | Rule |
|---|---|---|
| Coastline and district boundaries | **the commission** | Strokes are **non-scaling**, so 2px is 2px at every width |
| The building marks | **the page**, from `data/projects.json` | A true 5px radius at every layout |
| The district labels | **the page**, in the site's own type | A true 12px — E7's floor, measured in rendered pixels |

Three consequences, all of them wanted: the map is **never stale** when a 48th building lands; the
labels **translate**, and their alignment flips in Arabic while the coastline does not, which
satisfies E7's RTL rule by construction; and **an illustrator cannot ship a mark we did not place.**

**E7.2 — No mark is placed by inference.** A mark asserts that a building stands in that place.
Where the record does not hold a location precise enough to place it, **the building has no mark** —
and the page says so by listing it in its own inventory rather than by putting it somewhere
plausible. This is E9's principle applied to cartography: *an image must never imply a building
exists that does not*, and a map must never imply a building stands where it does not.

Screen 05 is the live case: 18 of 47 records carry no district, so Option A can honestly place
**28 marks** under a statement that says forty-six. **This clause is therefore what decides whether
Option A can ship at all**, and it makes the artwork gate a *data* gate too — see E7.4.

**E7.3 — A mark carries no date.** A year counter running beside marks appearing one by one invites
the reader to date each mark as it lands. Where the completion year is absent on any record in the
set, **the counter and any build-order sequencing are suppressed** and the marks appear in a
**spatial sweep**, which claims nothing about time. On the ProArc data, 24 of 47 records parse a
completion year and eight of the 47 are not built, so the counter is gated behind the Year field
(gate W5) **on every surface that draws the map — /ajman and Home.**

**E7.4 — Option B is the data fallback as well as the artwork fallback, and it has a price.**
The contract sentence becomes: *ship Option B if the artwork is not excellent by launch, **or if the
location data has not landed.*** And B's cost is named rather than discovered: B is "identical build
minus the linework", so it is the marks and nothing else — no coastline, no boundaries, no joining
lines — which means **there are no district polygons and therefore no district interaction.** Where
the map is also an index, that interaction falls entirely to the accompanying list.

**E7.5 — Interactive artwork has a minimum polygon.** Where a district or region is a hit target,
**no polygon may be smaller than 44 × 44px at the narrowest supported viewport.** This is a brief
item, not a build item: ten polygons at 44px need ~19,400px² inside a 375 × 450 map, which is 11% of
it and comfortably drawable — but only if the illustrator is told before they draw. If delivered
artwork misses it, the map degrades to a picture and the list carries the interaction.

---

## E8 · Two grounds for the identity

1. ✅ **CLOSED 20 August 2026.** ProArc supplied both masters. **Never derive one from the other
   with a CSS filter, a mask or a blend mode** — that half of the clause is permanent and is why
   the plate wore a black field for seven weeks rather than inverting the one master it had.
   🔴 **The supplied files are named for the GROUND they serve, not for their ink:**
   `…for web BL.png` is the file for **BL**ack grounds and contains **WHITE** artwork; `…WT.png`
   is for **WhiTe** grounds and contains **BLACK**. Wired up by filename the pair ships inverted
   and the mark disappears on both grounds, passing every structural check. In this repository
   they are renamed for their INK — `logo-mark-white.webp`, `logo-mark-black.webp` — and
   `p31-plate-ground.js` §4 samples the rendered pixel rather than trusting either name.

2. **AMENDED 20 August 2026 (Mahesh), the second amendment to a signed clause after E13.2a.**
   The clause as signed read: *"On `#000000` the mark's field matches the page and shows no seam
   — the plate becomes invisible and the mark stands alone. On `#FFFFFF` the plate is a visible
   black rectangle."* That described the one-master workaround, and it is the sentence ProArc
   objected to. It is replaced by:

   > **The plate is ground-aware and carries no field of its own.** On a declared black band the
   > WHITE master paints and the field is present, so it dissolves into the page and the mark
   > stands alone. On anything else — paper *and photography* — the **BLACK** master paints and
   > there is no field. **Both are the same artwork in the same orientation at the same size.**
   > Nothing is recoloured, and neither master is ever placed on the other's ground.

   ⚠️ **The 20 August text above is SUPERSEDED by E8.3 below and is kept as the record of a
   position that lasted one day.** Its "on paper *and photography* the BLACK master paints" is
   no longer the rule: over photography nothing paints. Its cited figures — 11.14:1, 14.47:1 and
   3.12:1 on the sector pages — are historical.

3. **E8.3 — THE FIELD IS GONE FROM BOTH HALVES OF THE CHROME. Amended 21 August 2026 (Mahesh),
   the third amendment to a signed clause and the second to this one in two days.**

   > *"i think we can make the black box removed everywere .. even above photogrpahs anywhere
   > ....., blackbox can even be removed from behind the hamburger."*

   > **Neither the plate nor the trigger carries a field on any declared ground.** The chrome
   > wears one of two inks and nothing else: under a declared black band the WHITE master and
   > white strokes; under paper the **BLACK** master and ink strokes. Each half answers for its
   > OWN ink — the mark's box and the bars' box — and answers by MAJORITY, so the flip lands at
   > the midpoint of a crossing rather than at either edge of it.
   >
   > **Over a photograph the two halves part company, and the line is E13.2a's:**
   > **the plate is identity and is ABSENT; the trigger is navigation and keeps a field.**

   🔴 **THE PARTING IS A MEASUREMENT, NOT A PREFERENCE, AND THE LITERAL RULING WAS BUILT FIRST.**
   The chrome was shipped bare on every ground and measured by `p33-bare-chrome.js`, which walks
   every scroll position on four routes, shoots each twice, takes the ink to be the pixels that
   DIFFER, and reports the worst pixel rather than the median. Bare ink over photography:

   | route | half | worst composited contrast |
   |---|---|---|
   | `/index` | the bars over Home's five frames | **1.28 · 1.34 · 1.64 · 2.44** |
   | `/projects` | the mark over the 46-photograph grid | **1.22 · 1.26 · 1.34 · 1.78** |
   | `/projects/homes` | the bars over the sector grid | **1.90 · 2.65** |
   | `/projects/blacksquare` | the bars over the gallery | **1.57 · 1.68** |

   Against a 3.0 floor. **The medians at those same positions ran 3–15:1**, so an average — or a
   sample taken anywhere but the worst patch — would have passed every one. The failures are
   architecture against sky: both ends of the range inside one 210×99 box, which no single ink
   survives, so **choosing the master per photograph does not reach it either** and was refused
   on that ground rather than left untried.

   📌 **This is the third time §8's field over photography has been removed and measured back.**
   It is not decoration and it never was; what changed is which half of the chrome can afford to
   answer it by leaving. **ProArc's complaint is answered in full for the wordmark** — there is
   now no black rectangle behind the mark on any ground, anywhere on the site.

   🔴 **E8.3a — THE TRIGGER'S FIELD IS THE INK'S CHIP, NOT THE BUTTON'S BOX.** *Corrected the
   same day, on Mahesh reading the page: "the box still appears when we scroll back."* The field
   shipped as the BUTTON's background, and the button is 73×67 because it carries §8's clear
   space as padding — **four times the area three 1.5px strokes need**, which on a photograph
   reads as a slab rather than as a control. It is painted on the bars' own box now, inset 8px:
   **39×33, a 73% reduction**, with the bars unmoved and §4.7's hit target still the full button.

   ⚠️ **THREE BOX-FREE DEVICES WERE BUILT AND MEASURED BEFORE SETTLING FOR A SMALLER BOX**, and
   the numbers are recorded so none of them is re-proposed on intuition:

   | device | worst composited contrast |
   |---|---|
   | bare strokes | 1.28 – 2.65:1 |
   | white strokes + a drop-shadow | **1.02 – 2.81:1** |
   | `mix-blend-mode: difference` | 1.28 – 2.11:1 |

   The shadow fails because a 1.5px stroke's halo falls **outside** the stroke, so it barely
   darkens the ground the ink actually stands on. The blend fails because difference against
   mid-grey returns mid-grey, and a photograph is full of mid-grey. Both are *worse* than bare in
   places. **A scrim is also not available**: hard rule 8 requires ≥60% black across the whole
   box plus 24px bleed and names a gradient that fades behind the ink as a bug.

   ⚠️ **`p32` is unchanged and still a guard**; `p33` is the measurement. Do not read any figure
   in this clause as live without re-running p33 — and do not retire p32 because it currently
   measures almost nothing.
3. Print, PDF and tender artefacts are paper. The company profile PDF is specified on white.
4. The mark is never mirrored, flipped, rotated or recoloured. In RTL its **position** moves;
   the artwork does not. The device pointing against the reading direction in Arabic remains an
   open question for the mark owner, unchanged from v1.2 §8.

---

## E9 · Image provenance

**An image must never imply a building exists that does not.** Read from the 47 hero images on
29 July: nine are visualisations and two are construction photographs — eleven unbuilt works
shown, with nothing on any page saying so, and eight of the eleven in the largest sector
(Homes). Status was removed as a browsing axis (29 Jul), so provenance is a **caption duty**,
not a filter's.

**E9.1 — The vocabulary is two labels:** **Visualisation** (any render, exterior or interior)
and **Under construction** (a photograph of an incomplete building). No synonyms, no "artist's
impression", no abbreviation.

**E9.2 — Labels are captions, never badges.** The label sits in the image's off-image caption
line, or appended to the record's name in a row (*· Visualisation*), in the caption's secondary
value. **Nothing is set on the photograph** (§1.5 is unchanged), and no icon, ribbon or overlay
device exists for this.

**E9.3 — Where required:** wherever the image or its record appears at reading size — index
rows, catalogue rows, sector prints and studies, project-page heroes and galleries, and any
image another page borrows. Exempt: none. A thumbnail whose record is labelled in the same row
is covered by that row's label.

**E9.4 — Provenance is data, confirmed, not guessed.** The genre of every image is a field
supplied or confirmed by ProArc (the 29 Jul reading from the images is the draft, not the
record). **Action: ProArc confirms the eleven** — this is E9's open action, and no
*Visualisation* label ships from an unconfirmed guess.

**E9.5 — Editorial consequence.** Unbuilt work never opens a set: in any curated order,
completed photography precedes visualisations and construction shots (Screen 03's D1 rule 1 is
this clause applied).

**E9.6 — E9 governs drawings, not only photographs.** *Added 30 July 2026 from Screen 06.* A
generated line drawing of a building asserts the building exactly as a photograph does, so the
whole of E9 applies to it. Two forms this took on Screen 06, both found by building the thing:

1. **A sequence ending in a completed state may be made only from a completed record.** The
   three-state drawing (massing → frame → built) was first drawn from Gateway, whose status is
   `Under Construction`, while its third state showed a finished facade. It was moved to a
   completed record.
2. **A set of drawings carries its provenance the way a gallery does** — one line for the set
   (*"…eight standing, seven rising"*), and any drawing whose record is **named** carries that
   record's status in its own caption. An unnamed drawing inside a labelled set asserts nothing
   about a particular building, which is what makes the set line sufficient.

The label wording for a drawing is **the record's own status**, lower-cased (*under
construction*, *design stage*), not E9.1's two photographic labels — the site already does this
in Screen 04's merged Completed-or-Status row. E9.1 is unchanged and still governs photographs.

---

## E10 · The copy rules for navigation surfaces

Three rules, decided on Screen 03 (30 Jul), governing every index, list, control and wayfinding
surface site-wide — with four scoped exceptions added since (E10.2a, E10.2b, **E10.2c**, E10.4). They are copy-system rules, not typography — they live here because v1.2 §9
is where editorial rules live, and these extend it.

**E10.1 — The two registers: the verb speaks, the noun names.** The four verbs (learns · shops
· works · lives) open sets: headings, links, group heads — never a single building, never a
control, never a URL. The four nouns (**Schools · Malls & shops · Offices · Homes**) name what
the reader is holding: rows, filter controls, wayfinding, page titles, URLs. Every threshold
performs the translation exactly once — a verb door lands on a noun-named page whose support
line speaks the verb sentence. Neither register ever substitutes for the other: a chip never
says *Learns*; a heading never says *Schools*. (The 29 Jul lock — verbs are never renamed to
facility types — is unchanged by this rule and completed by it: the verbs keep every surface
they ever held.) The mosque is a name, not a set: no sector page, no chip; **its verb exists in
exactly two places, neither of them a set-opener** *(amended at consolidation for the 31 Jul
Prays decision)*: the `/projects` mosque line — *"Where Ajman prays. Al Ghala Mosque, for the
Ministry of Awqaf and Islamic Affairs."* — and Home's fifth verb-moment (*"And prays."*,
`01-home.md` §5.3), whose heading is not a link and whose one route is the building's own page.

**E10.2 — The ground goes unsaid; only difference speaks.** *In place:* each page writes
**Ajman once**, in running copy; metadata speaks districts (Al Jurf, Al Tallah, Hamidiya…); a
plain-Ajman location is written as nothing; a location outside Ajman is named in full. *In
kind:* on a single-set page the set's own noun is the ground and goes unsaid in its rows — only
the exception speaks (*University*, *Visualisation*); on mixed surfaces every row carries its
noun, because there it is information. Building names are names — an *Ajman* or a *School*
inside a title is never counted or suppressed.

**E10.2a — A record always states its own place.** *Added 30 July 2026 from Screen 04.* E10.2's
suppression governs **sets and running copy**, not a record's own metadata. On a single-record page
the ground is not an echo: 18 of the 47 projects are plain Ajman, and a project page can be a
reader's **first** page — arrived at from search, from a tender document, from a shared link — so
suppressing the location would leave 18 pages that never say where the building is. **A record's
caption and its Location row always name district-and-Emirate** (*Al Jurf, Ajman* · *Ajman* ·
*Umm Al Quwain*), while the page's running copy still says Ajman once.

**E10.2b — On a page whose subject is the place, the ground is the subject.** *Added 30 July 2026
from Screen 05.* E10.2's once-per-page cap on the word *Ajman* was written for pages where Ajman is
the background — an index, a project page, a service. **It does not apply to `/ajman`**, whose
subject is the Emirate: suppressing the word to a single appearance there produces evasive copy
(*"forty-six of the forty-seven stand here"*) in place of a plain statement. On that page the word
is written wherever a sentence needs it.

Two limits keep this from becoming a licence:

1. **The formula cap (E10.3) still applies, and is unspent.** *"Where Ajman ___"* is written **at
   most once per page** on `/ajman` as everywhere else — and Screen 05 spends it nowhere, so the
   page's Ajman repetition is never the formula repeating.
2. **Organisation and building names are names.** *Ajman Sewerage*, *Ajman Bank*, *Ajman's
   Municipality and Planning Department* are never counted against any cap and never suppressed —
   which E10.2 already says of building titles and which is restated here because the authority
   sentence contains the word three times by itself.

**E10.2c — On About, the four verbs may appear once, in their human sense.** *Added 31 July 2026
from Screen 07, decided by Mahesh.* The 29 July lock states that a verb names a set of buildings,
and therefore that the verbs appear on the Home sentence, the Work index groups, the sector views
and `/ajman`'s schools section — **and never on Services, About or Contact**. About's approved ¶2 is
built on *"It is where people learn, shop, work and live"*, so the lock and the copy were in direct
conflict and one had to give.

**The resolution: About is the one page where the verbs are permitted, and only in the sense the
theme actually came from** — a description of a life, not a taxonomy of buildings. The limits are
the whole clause:

1. **Once, in running prose, inside a single sentence.** Not a heading, not a link, not a group
   head, not a chip, not a page title, not a URL.
2. **Never as set-openers.** The moment a verb on About opens a set of buildings it is doing E10.1's
   job on a page E10.1 excludes, and the exception is void. This is why About's route to Work is
   placed at the **close of the story** and reads `The work →` — a noun — rather than sitting
   against ¶2, where it would retroactively convert the four verbs into doors.
3. **The lock is otherwise untouched.** Services and Contact still spend no verb; the verbs still
   keep every surface they already hold.

*Why it is written rather than waived: this is the third scoped exception to E10.2's family
(E10.2a for records, E10.2b for `/ajman`), and the pattern is the point — the copy rules bend at
named places, in writing, or they get improvised at build time.*

**E10.4 — The statement is the summary; the body drops the duplicate.** *Added 30 July 2026 from
Screen 04.* Where a record holds both a summary and a description, and **41 of 47 descriptions open
with the summary word for word**, the page carries the summary once — as its statement — and the
build strips the duplicated leading sentence from the body. Where the remainder is boilerplate, the
page ships with the statement alone. This is deliberate: it makes a mail-merged paragraph visible
instead of concealing it behind repetition, and a page that says one true thing beats a page that
repeats itself into filler.

**E10.3 — The formula cap.** The sentence pattern *"Where Ajman ___"* is written **at most once
per page**: on a sector page it opens the support line beneath a bare-verb H1 (*Learns.* — the
formula is never a heading); on the all-work index it belongs to the mosque line alone. Pages
that need neither write it nowhere.

---

## E11 · The measure token is not the measure

*Added 30 July 2026 from Screen 06. **Not a Services decision** — it corrects a token, so it
reaches every prose column on the site.*

v1.2 §4.4 and §9 rule 3 say *"keep the measure between **45 and 68 characters**"*. §4's table and
`src/styles/tokens.css:84–94` implement that as `68ch`. **A `ch` is the advance width of the
digit zero — 9.31px at 16px in General Sans — against about 7.5px for an average character in
running English.** So every maximum in the system is set about a quarter too wide.

Measured across seven widths with `Range.getClientRects()` — counting real line boxes, not
dividing height by line-height: **1.245 real characters per `ch`**, stable from 400px to 720px.

| Token | Renders | Real characters | The rule | To land it |
|---|---|---|---|---|
| `--measure-body` 68ch | 633px | **80–85** | 68 max | **55ch** |
| `--measure-body-lg` 60ch | 698px | **≈ 75** | 60 max | **48ch** |
| the 45ch prose floor | 419px | ≈ 56 | 45 min | over-delivers — safe |

**The floors are safe; the maxima are not.** Correcting the tokens narrows every prose column on
the site by about **19%**, which is a visible change to pages already designed — Home's support
lines, Work's openers, all 47 project pages' prose, /ajman's support and ledger. It is recorded
here rather than applied quietly, because a spec that states a character range and ships a token
that misses it by a quarter is the kind of drift v1.2's own closing rule exists to prevent.

**Screen 06 is built on the corrected values**, so the boards show what 55ch actually looks like.

**Two arithmetic results carried with it**, both from the same measuring pass: the container gives
**960px of content** at 1280 and wider (1120px max, 80px gutters), and a **four-across process row
runs 21–23 characters a line**, below every floor in §2.5. That second figure is why Screen 06's
numbered-card grid was dead before anyone had an opinion about it — see §9.10 and §9 rule 17,
which already ban numerals on parallel items.

**DECIDED at consolidation (31 Jul, Mahesh, D-1): the tokens are corrected** —
`--measure-body` **68ch → 55ch**, `--measure-body-lg` **60ch → 48ch** — landing v1.2's own
45–68-character rule. Every prose column narrows ~19%; Screen 06 was already built on the
corrected values and the final preview renders all nine pages on them. The correction ships in
the Phase-1 token pass (one `tokens.css` edit with the spacing aliases, `00f` R1-2.1).

---

## E12 · No quantities in display prose — site-wide

*Decided 31 July 2026 (Mahesh), generalised the same night from "no building counts" to "no
numbers"; drafted into the body at consolidation (it previously existed only as a sign-off-table
row). The doctrine in one line: **numbers are for records; names are for prose.***

**E12.1 — The rule.** Display prose carries **no quantities**: no counts of buildings, no
storeys, no floors of any kind (*"more than a dozen"* is dead), no spelled quantities (*"three
school groups"* is dead), no measures (*"ten-acre"* is dead), no record figure (no total is ever
printed in either direction — X12 was withdrawn on this rule). Where a quantity was doing work,
**a name does it**: the range names its two ends; the school groups are named, not counted;
Khazna is a role and a name, never megawatts.

**E12.2 — Three exemptions, stated as decisions:**

1. **"One" is the method word, not a measure** — *one office, one team, one practice answers,
   one Emirate* (rides along: *"every campus but one"*, *"all but one"*, *"one working day"*).
   It unifies rather than counts.
2. **Years are dates, not quantities** — *since 2006 · completed 2009 · the rating, 2023*.
   **Year counts stay dead** — never *"19+ years"*, never *"two decades"* as a boast.
3. **Quoted designations keep their names** — *"five-star"* is the rating's own name;
   *One 678* is a building's name.

**E12.3 — Quantities live in record surfaces**: spec tables, ledger columns, chip tallies,
generated captions and drawings — where E3.7 still pins the storey measure and E10's two
registers carry the split: **prose states, records record.**

**E12.4 — Identifiers are not quantities** *(the Screen 08 clarifier)*: a phone number, a PO
Box, an email address, a URL. Clock times and day ranges are times and dates (exemption 2's
logic). A contact-facts block is a record surface besides — written so nobody hesitates over
"9:00–18:00" at build time.

*The two reach-backs this rule opened are closed at consolidation: `03-work.md` §4.1's counted
arrival line is replaced by the selected-work arrival, and `05-ajman.md`'s statement is
numberless ("All but one…", riding exemption 1).*

---

## E13 · The menu — the §4.7 amendments

*Added 31 July 2026 from Screen 09 (board 16, revs 1–2; decisions Mahesh's). §4.7 is a locked
clause, so every change below is an amendment decided deliberately, not a build preference.
Full behaviour spec: `09-menu.md`.*

**E13.1 — The trigger is one pill, three lines, no word.** §4.7's "the word MENU as a 12px
uppercase label inside or immediately beneath the same pill" is **amended: the label is
dropped**. The pill contains the three lines alone; the accessible name is
`aria-label="Open menu"`. When open, **the bars become a ✕ in the same pill in the same
place** (`aria-label="Close menu"`, `aria-expanded="true"`) — the reader closes where they
opened, satisfying §4.7's focus-return by construction. The 44×44 minimum and the
never-two-pieces rule are unchanged.

**E13.2 — The identity-chrome field rule.** The trigger pill and the wordmark plate are the
same kind of object and now share one written rule: **identity chrome carries a permanent
`#000000` field; paper reveals the rectangle, black dissolves it.** This is §8's "shows no
seam" mechanism generalised from the mark to the pill — no scroll listener, no state change,
nothing to desync. On black the pill's three lines stand alone at 21:1, which satisfies
WCAG 1.4.11 (the component is identified by its glyph, not its boundary). *Recorded fallback:*
if a visible pill on black is ever wanted, the boundary is `#595959` (3.00:1, E3.2's exact
structural floor). *Rejected:* inversion — a CTA's shout applied to chrome that should be
found, not noticed.

**E13.2a — The retreat.** *Amendment to E13.2, decided 4 August 2026 (Mahesh), on a
measurement rather than a preference.* E13.2 bought its permanence with "no scroll
listener, no state change, nothing to desync". **What permanence also bought was
identity chrome sitting on top of the page's own words.** Measured over text ink —
`Range.getClientRects()` across the text nodes, five pages, every half viewport of
scroll — the trigger covers **4.53%** of all visible line boxes at 1440 and **8.00%**
at 375; the plate **2.89%** and **4.89%**. Whole words go fully covered, `/projects`
buries building names at 71–100%, and `/ajman`'s authority sentence was severed
**mid-word at display size**. A permanent field is a promise about the chrome; it was
being paid for by the argument.

So: **identity chrome keeps its permanent `#000000` field and gains one state.** Past
the page's own arrival, a downward scroll retires it; any upward scroll, any focus
inside it, and the open overlay return it. E13.2's field rule is untouched — this
amends only its *permanence*, and only in the block axis.

- **It ships present.** The retreat is armed by script, so a script that never runs
  leaves a complete page with its navigation intact — the same doctrine as the
  ground-aware field itself.
- **It travels by transform, never `display` or `visibility`**, so a retired trigger
  stays focusable and `focusin` returns it. §4.7's reachability is preserved by
  construction rather than by promise.
- **The arrival is not a guessed pixel threshold.** The retreat is gated on the state
  the arrival observer already computes from the page's own first band.
- 🔴 **CORRECTED 20 August 2026 (Mahesh, on the live page: *"i am seeing box when i
  scroll"*): THE PLATE AND THE TRIGGER LEAVE ON DIFFERENT EDGES.** The trigger keeps
  `chrome-quiet`, which fires when the arrival band has left the chrome's band
  entirely. The **plate** leaves one band earlier, on `plate-away` — the arrival band
  stops reaching *below* the chrome. The reason is E8.2: once the plate's field became
  conditional, `chrome-quiet`'s last band of travel swept the arrival's bottom edge up
  **through the plate's own box**, and the lower part of a solid field hung over paper
  — 6px growing to **96px** on Home, in both scroll directions. **A field is a
  rectangle and cannot be half-black, so no threshold answers this**; flipping to the
  paper state early is worse still, because it sets the black master's ink on the black
  that is yet to leave. The plate simply must not be on screen while a ground boundary
  crosses it. **The plate stands only while its own box is wholly on the arrival's
  ground**, which is what this clause meant by "at the page's opening band" all along.
  ⚠️ Re-keying `chrome-quiet` itself was tried first and broke `p14-services-motion`,
  which takes the first non-empty `document.getAnimations()` reading as its subject's
  choreography and got the chrome's transform instead.
- 🔴 **The trigger is PERMANENT below 780px.** Decided against the measurement, and
  knowingly: the trigger buries most at exactly the widths where it stays. The reason
  is that the overlay is the only navigation surface (E13.1) and a narrow reader
  scrolls most. 780 is the chrome's own breakpoint — a rule made of a token inherits
  that token's breakpoint.
- ⚠️ **THE TWO BULLETS ABOVE THIS ONE ARE SUPERSEDED BY E13.2b.** `plate-away` is
  deleted and the plate is no longer keyed on the arrival. Both are kept as the record
  of why, because the reasons expired rather than being overruled.
- 🔴 **THE PLATE WAS KEYED ON THE ARRIVAL RATHER THAN ON A DIRECTION** *(4 Aug, amended
  within the day, on the built page — SUPERSEDED 21 Aug)*. The first form returned the
  plate on any upward scroll, and back it came over /ajman's ledger — *"Habitat Schoo"*,
  cut mid-word. The plate covered **146px of a 339px ledger column, 43% of it**, so
  moving the TEXT clear was not a gap but a redesign. **That measurement was of a black
  rectangle**, and E8.3 removed it; see E13.2b.
- **No reduced-motion branch.** The global clamp makes the travel instant; the retreat
  is function, and a reader who asked for less motion still wants the words.

**E13.2b — Both halves travel together, and the travel is asymmetric.** *Amendment to
E13.2a, decided 21 August 2026 (Mahesh), in the same ruling as E8.3:* **"keep the logo
and hamburger longer when scrolling (and vice versa appear sooner when scrolling back)."**

> **The plate joins the trigger on `chrome-retired`.** Past the page's own arrival, a
> downward travel of **one viewport height plus 500px** retires both; an upward travel of **24px**
> (`--gap-block`) returns both, as do focus and the open overlay. The plate retires at
> every width; the trigger stays permanent below 780. **Over a photograph the plate does
> not return at all** — E8.3.

🔴 **THE RETIRE THRESHOLD MOVED TWICE IN ONE DAY, BOTH TIMES ON THE BUILT PAGE.** 200px
(`--gap-section`) → a full screen → **a full screen plus 500px**. *"Still increase the scroll
distance for logo retire ... may be after full screen height?"*, then *"we can increase the
retire distance by another 500 px"* — Mahesh, having lived with each. A section's gap turned
out to describe **a gesture rather than a departure**; a screen is the only threshold on this
axis that is not arbitrary, because the reader has replaced everything they could see; the
500 is the margin asked for on top of it. The asymmetry is now about **55:1** rather than 8:1.

📌 **THE TWO TERMS ARE KEPT SEPARATE IN THE SOURCE BECAUSE ONE IS DERIVED AND ONE IS NOT.**
`window.innerHeight + RETIRE_MARGIN`, with the 500 named and declared invented — the same
treatment `HYSTERESIS`'s 24 has carried since E13.2a, and the same discipline `districts.js`
applies to its two invented values. Folding them into one number would present a judgement as
an arithmetic. ⚠️ The screen term is a LIVE read, re-taken whenever the observers are
re-armed: a captured constant describes a viewport that is gone after a rotate or a collapsing
URL bar.

🔴 **AND THE MARK'S SIZE STEP IS RETIRED WITH IT (E13.2c).** *"After practically seeing, can
we avoid logo resize? anyway it is a disappearing after sometime and it is making it look odd
now."* The two-state mark — 160 at arrival, 96 past it — was decided on 2 August. 📌 **It
survived three weeks on the strength of being invisible:** from 4 August the plate was keyed
on the arrival, so it left the screen before the step and returned after it, and `plate-away`
then guaranteed that ordering. E13.2b put the plate back on screen through the body and the
step was **rendered for the first time**. A mark that resizes on its way to disappearing is
fidgeting, not hierarchy. **One size per breakpoint: 160 / 128 / 96.** `chrome-quiet` survives
and still gates the retreat; only the size rule it carried is gone.

📌 **A DECISION CAN SURVIVE BECAUSE NOTHING EVER RENDERED IT.** This is the register's
expiry lesson in a third form: not a number that went stale, not a scope that was too wide,
but a rule that was never once seen in the state it described.

🔴 **REMOVING THE FIELD IS WHAT MADE THIS AFFORDABLE, AND THE TWO HALVES OF THE RULING
ARE NOT INDEPENDENT.** Every reason the plate was confined to the arrival was a reason
about a **rectangle**: the ledger it covered, and the boundary it could not be half of.
What returns now is a wordmark at the reading size with nothing behind it, so the ledger
measurement no longer describes the object it was taken of. 📌 **This is the register's
own recorded failure mode — a refusal whose reason expires — caught by re-reading the
refusal rather than by tripping over it.**

🔴 **THE ASYMMETRY IS THE CLAUSE, NOT THE THRESHOLD.** One hysteresis of 24px both ways
was chosen to reject jitter, and a value that size cannot also mean "the reader has moved
on" — it made the chrome leave on the smallest deliberate scroll. Both new values are the
site's own spacing tokens rather than invented: a section's distance to go, a block's
distance to come back. **Leaving is expensive; returning is cheap.** The direction is read
from the furthest point reached in the current direction, not from the previous frame — a
200px threshold measured frame-to-frame is unreachable on a trackpad, and anchoring on the
extreme needs no second tolerance to absorb jitter.

📌 **The plate's half now costs a scroll listener**, which E13.2a's last bullet said it did
not. That was true of an arrival-keyed plate and is the price of this amendment; it is one
listener, already present for the trigger, and the ground question rides on the same frame.

*Supersedes* the note in `components.css` declining Dewan-style hide-on-scroll
("the trigger is the site's only navigation control and never retreats"). **Half of
that reason is kept rather than reversed**: the trigger may retreat from a reader
scrolling away from it and never from one reaching for it. Held by
`_bmad/tools/p24-chrome-retreat.js`.

**E13.3 — The centre region alternates; the mega grid is not always-on.** §4.7's "project
mega-menu centre" is **amended to a resting/revealed pair**: at rest the centre carries the
Ajman constellation (M4 — ornament under E7.2/E12/E3.7, 28 honest marks generated from the
map's own data); **hovering or focusing WORK swaps the centre to the preview panel** — six
completed records (E9.5), 14px name-only captions, "All projects →" as the one exit, no
bordered container (unchanged), **no counts** (E12 kills v1's "View All 47"). The two are
never shown together. Focus is hover's twin; **touch shows the resting state and WORK simply
navigates — the preview is an enhancement, never the only route.** Only WORK carries a panel;
per-item panels for the other three items are recorded as open-for-later, not designed.

**E13.4 — The sub-desktop overlay is nav + contact.** Below 1024px the constellation is
deleted whole (E3.7 read for ornament — never shrunk), and with no hover the preview does not
exist, so the small overlay is the four nav items at their full 52px scale plus the two
contact identifiers. Measured basis: the widest label at 700 (CONTACT, 266px) fits a 375px
viewport's 327px column; the nav column reserves **267px** at every width so weight changes
never reflow the list. The AR rest state is **400** (§7.3 — Arabic has no 300), narrowing the
rest/current contrast to 400→700; the brightness half of the active state carries the
difference.

*Riding notes: the overlay's contact region drops v1's address line — one of X14's four
surfaces retired by design (`09-menu.md` §8) · the region eyebrows die on §9 rule 9 · the
open/close choreography and its two build traps are specified in `09-menu.md` §9.*

---

## Sign-off

| Item | State |
|---|---|
| E1 ground rule | Drafted — needs team sign-off |
| **E1.4 opening statement on paper** | **Added 29 Jul from board 7 — needs sign-off with E1.** Home is built on it; if declined, `01-home.md` §4.1 reverts to `#000000` |
| E2 dark role table | Drafted — needs team sign-off |
| E3 photography and rules on dark | Drafted — needs team sign-off |
| E4 pairs verified | Computed and stated |
| E5 Arabic on black | **Action open** — test required, not answerable on paper |
| E6 form states | Drafted |
| E7 illustration | Drafted — gated behind O5 before the artwork brief |
| **E7.1–E7.5 the map's five new clauses** | **Added 30 Jul from Screen 05 — needs sign-off with E7.** The three-layer split · no mark by inference · a mark carries no date · Option B as the data fallback, with its interaction cost named · the 44px minimum polygon. **E7.2 is the one that decides whether Option A can ship**, and E7.3 reaches back into `01-home.md` §6.1 |
| **E1.2b** | **Drafted and deliberately not written** — no page needs it once /ajman's client wall moves to About. The reasoning is recorded under E1.3 for the screen that may need it later |
| **E10.2b the ground is the subject on /ajman** | **Added 30 Jul from Screen 05 — needs sign-off with E10.** A scoped exception in the same pattern as E10.2a, bounded by the unspent formula cap |
| E8 identity on two grounds | ✅ **CLOSED 20 Aug 2026** — ProArc supplied both masters, and E8.2 was amended with them. 🔴 **AMENDED AGAIN 21 Aug as E8.3: the field is gone from BOTH halves of the chrome.** Over photography the plate is ABSENT and the trigger alone keeps a field — measured, after the literal ruling was built and came back at 1.22–2.65:1 against a 3.0 floor. Held by `p31-plate-ground.js` (5 routes, 26 each), `p32-mark-on-media.js` and **`p33-bare-chrome.js`**, which is the check that decided it. **The never-derive half of E8.1 stands permanently** |
| **E1.2a band owns the switch on a paper page** | **Added 30 Jul from Screen 04 — needs sign-off with E1.** Screen 04's foot is built on it, and it is why prev/next was removed |
| **E3.6 the lead photograph of a set with varying proportions** | **Added 30 Jul from Screen 04 — needs sign-off with E3.** It *retires* an asset gate (no per-record crops commissioned) rather than opening one |
| **E9 image provenance** | **Added 30 Jul from Screen 03 — needs sign-off.** Action open: ProArc confirms the eleven unbuilt-work images (E9.4). **Read against the files 30 Jul:** the two construction photographs are **Sealine** and **Gateway**; seven of the nine visualisations identified; **two renders outside Homes unidentified** — no label ships from our reading |
| **E10 copy rules for navigation** | **Added 30 Jul from Screen 03 — needs sign-off with the Screen 03 decisions it records.** Screens 04–08 inherit all three clauses |
| **E10.2a a record states its own place · E10.4 statement-is-the-summary** | **Added 30 Jul from Screen 04 — needs sign-off with E10.** Screen 04 is built on both |
| **E3.7 a generated drawing states only what its record holds** | **Added 30 Jul from Screen 06 — needs sign-off with E3.** The datum is real · display copy speaks above-ground storeys · internal rules are deleted whole below the width they survive. All three were errors in rev 4 first, and none was visible in source |
| **E9.6 E9 governs drawings, not only photographs** | **Added 30 Jul from Screen 06 — needs sign-off with E9.** A drawing asserts its building as a photograph does. A completed-state sequence needs a completed record; a set carries one provenance line and any *named* drawing carries its record's status |
| **E11 the measure token is not the measure** | **Added 30 Jul from Screen 06 — needs sign-off, and it is the widest item in this draft.** 1.245 real characters per `ch` in General Sans, so `--measure-body` 68ch renders 80–85 characters. **Correcting it narrows every prose column on the site by ~19%**, including pages already designed. Screen 06's boards use the corrected values |
| **E1 amendment — Services on `#000000`** | **DECIDED 31 Jul (Mahesh, Screen 06).** E1's table updated above. Signs off with E1. **Screen 07 confirmed About and Contact stay paper, 31 Jul — E1's page-type table is now complete for R2** |
| **E10.2c — the four verbs on About** | **DECIDED 31 Jul (Mahesh, Screen 07).** Written above. Resolves a direct conflict between the 29 Jul verb lock and the approved ¶2 copy |
| **E12 — no quantities in display prose** | Clause text drafted in the row below; **Screen 07 is the second screen written to it from the first line** (Screen 06 was the first). Ready to formalise |
| **E12 (to draft) — no quantities in display prose, site-wide** | **Rule decided 31 Jul (Mahesh), generalised the same night from "no building counts" to "no numbers":** display prose carries no quantities — no counts, no storeys, no floors (*"more than a dozen"*), no spelled quantities, no measures. **Three exemptions:** "one" as the method word (*one office, one practice*; rides: *"every campus but one"*, *"one working day"*) · years as dates (*since 2006*, *completed 2009* — year counts stay barred) · quoted designations (*"five-star"* is the rating's name). Quantities live only in **record surfaces** — spec tables, ledger columns, generated captions — where **E3.7 still pins the storey measure**; the two E10 registers carry the split: *prose states, records record*. **Clarifier, 31 Jul (Screen 08): E12 governs quantities, and an identifier is not a quantity** — a phone number, a PO Box, an email address, a URL. Clock times and day ranges are times and dates (exemption 2's logic). A contact-facts block is a record surface besides, so it is doubly clear of the rule — written so no one hesitates over "9:00–18:00" at build time. Where a number was doing work, a name does it: the range names its two ends; the school groups are named, not counted. **The two blocking reach-backs are hereby resolved:** `03-work.md` §4.1's counted arrival line is dead (replacement: the selected-work arrival, `E-Brand-Framework/04-copy-direction.md` §2) and `05-ajman.md`'s S2 + schools line take numberless amendments (direction: statements name; "Every campus but one is in Ajman" survives on the one-exemption). **Drafted into the body at consolidation — E12.1–E12.4 above** |
| **E13.1–E13.4 — the §4.7 amendment set (Screen 09)** | **DECIDED 31 Jul (Mahesh, board 16 revs 1–2).** Bars-only trigger · the identity-chrome field rule · the swap · the sub-desktop form. `09-menu.md` is built on all four *(table fragment merged at consolidation)* |
| **W1 reaffirmation** | **DECIDED 31 Jul** — the chrome reach-back opened and closed the same day on rendered frames (C-1 kept; C-2/C-3 declined). Recorded here so consolidation sees the challenge happened |
| **E13.2a — the retreat** | **DECIDED 4 Aug 2026 (Mahesh), AFTER SIGN-OFF, and the first amendment to a signed clause.** E13.2's permanence was covering the page's own words — measured over ink, the trigger buries 4.53% of visible lines at 1440 and 8.00% at 375, the plate 2.89% and 4.89%, and /ajman's authority sentence was cut mid-word at display size. The field rule is untouched; only permanence is amended, and only in the block axis. 🔴 **The trigger stays permanent below 780 — decided against the measurement**, on the grounds that the overlay is the only navigation surface and a narrow reader scrolls most. Clause text above; held by `p24-chrome-retreat.js` |
| **E13.2b — both halves travel, asymmetrically** | **DECIDED 21 Aug 2026 (Mahesh), the second amendment to E13.2a and the fourth to a signed clause.** *"keep the logo and hamburger longer when scrolling (and vice versa appear sooner when scrolling back)."* The plate joins `chrome-retired`: 200px of downward travel to go, 24px of upward travel to return, `plate-away` deleted. 🔴 **It is affordable only because E8.3 removed the field** — every reason the plate was confined to the arrival was a reason about a rectangle, including the 146px ledger measurement, and the object those reasons described no longer exists. Clause text above; held by `p24-chrome-retreat.js` (38 per route) |

**SIGNED OFF — Mahesh, 31 July 2026, consolidation session.** Every "needs sign-off" row above
is signed with the document. The three open actions survive sign-off as actions, not blockers:
**E5** (the Arabic-on-black test — priority raised, see the clause) · ~~**E8** (the inverted
master — letter item)~~ **CLOSED 20 Aug 2026, ProArc supplied both masters** · **E9.4** (genre
confirmation — letter item).

**Three open actions rode through sign-off and TWO remain** — E5 blocks the bilingual build's
dark pages (its old free deferral died with the black Services — see the clause), and E9.4 is on
the letter. **E8 closed 20 Aug 2026** when ProArc supplied the two masters; it is the only one of
the three that was ever going to be answered by an attachment rather than by a test or a reading.
Everything else is decided.

---

*Drafted 28 July 2026 — Mahesh + Claude (Saga & Freya, WDS). Ratios for `#333333` and `#595959`
on `#000000` computed to WCAG 2.1 relative-luminance; all other ratios quoted from the locked
v1.2 §1.6 and §6.*
