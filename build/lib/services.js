'use strict';

/**
 * Everything Services derives from the records — V-1, the range drawn.
 *
 * Spec: `_bmad/wds/D-UX-Design/06-services.md` §3. Copy authority:
 * `_bmad/wds/E-Brand-Framework/04-copy-direction.md` v3.3 §4. The page's
 * words live in `pages-src/services.html`; this file supplies only what the
 * records decide — which buildings are drawn, how tall each one is, and
 * which two the caption may name.
 *
 *
 * Four rules govern everything below, and each of them was a mistake first
 * (board 13 rev 4, corrected at rev 5):
 *
 *   E7.2 — A RECORD WITH NO STOREY COUNT IS NOT DRAWN. No height is ever
 *   inferred. Fifteen of the 47 name their levels; the other thirty-two are
 *   absent from the drawing rather than guessed at.
 *
 *   E3.7 — A DRAWING STATES ONLY WHAT ITS RECORD HOLDS. Levels are read,
 *   never asserted, and a basement is the only thing the records place below
 *   ground — so basements are drawn BELOW the datum. Rev 4 summed everything
 *   above the line and drew One 678's `2B+G+6P+42F` as a fifty-one-storey
 *   tower, which is a drawing saying more than its record.
 *
 *   E9.6 — E9 GOVERNS DRAWINGS AS IT GOVERNS PHOTOGRAPHS. Seven of the
 *   fifteen are not standing. The WHOLE drawing is anonymous since Session
 *   XXVI (the named ends and then the capnote were both removed, Mahesh),
 *   so no elevation asserts a building — 🔴 and no words on the page carry
 *   the set-level duty either. That discharge is an open letter item, not
 *   something this file provides.
 *
 *   E3.3 — THE FOOTPRINT IS AN INVENTED VALUE, invented identically for
 *   every building, and since Session XXVI it is DERIVED, not picked: the
 *   tallest elevation draws at RATIO (6.5:1) and every building takes that
 *   same footprint. A 90-storey record widens every plan on the sheet;
 *   nobody edits a constant. (The records hold no drawable plan dimension —
 *   `builtUpArea` exists on 44 but W3 bars it and BUA/storeys is an E7.2
 *   inference — so width stays invented, only now by rule.)
 *
 *   E3.3b — THE STOREY PITCH IS THE SECOND INVENTED VALUE, invented
 *   identically for every level of the SAME NAMED KIND. The parser already
 *   knows each level's kind; flattening that into one integer was what made
 *   the sheet read as a bar chart — zero floor-pitch variance is a
 *   gridline's signature, and no elevation sheet has it.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function escapeText(s) {
  return String(s).replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function loadDb() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
}

/* ------------------------------------------------------------------ *
 * Reading a configuration string — E3.7
 * ------------------------------------------------------------------ */

/**
 * The fifteen strings are ProArc's own and they are not one format:
 * `Ground + First + 2 Parking + Roof` beside `2B+G+6P+42F` beside
 * `G+3P+Podium Amenities+12 Typical Floors (4 Towers)+Roof`.
 *
 * So the vocabulary is explicit and anything outside it THROWS. A parser
 * that shrugs at a token it does not know draws a building shorter than its
 * record, silently, and a wrong elevation looks exactly like a right one —
 * which is the whole reason E3.7 exists. A new configuration string on a
 * record fails this build loudly and gets a decision.
 *
 * Three readings are calls taken at the build, recorded rather than assumed:
 *
 *   a level the record NAMES is a level that is DRAWN — roof, podium,
 *   podium amenities, mezzanine and Zamzam's health club all stand on the
 *   ground, so all of them are storeys of the elevation. E3.7 says the
 *   drawing states what the record holds, and the record holds them.
 *
 *   a HELIPAD is not a storey. It is a marking on a roof that is already
 *   drawn, and counting it would add a floor to a building that has none.
 *
 *   `(4 Towers)` is not height. Azha Park's four towers are one record and
 *   one elevation; the parenthetical is stripped before the levels are read,
 *   because a plan count drawn as height is exactly the rev-4 fault.
 */
const LEVEL_RULES = [
  // Below ground. The only thing the records place there.
  { re: /^(\d+)\s*b(?:asements?)?$/, levels: (m) => ({ below: Number(m[1]) }) },

  // Named single levels, all above ground, each carrying its E3.3b kind.
  // A penthouse and a health club are storeys of the ordinary pitch — the
  // kinds that exist are the kinds whose ARCHETYPE differs, not every word
  // the records use.
  { re: /^(?:g|ground)(?:\s*floor)?$/, levels: () => ({ stack: ['ground'] }) },
  { re: /^first(?:\s*floor)?$/, levels: () => ({ stack: ['floor'] }) },
  { re: /^(?:m|mezzanine)$/, levels: () => ({ stack: ['mezzanine'] }) },
  { re: /^podium(?:\s*amenities)?$/, levels: () => ({ stack: ['podium'] }) },
  { re: /^roof$/, levels: () => ({ stack: ['roof'] }) },
  { re: /^penthouse$/, levels: () => ({ stack: ['floor'] }) },
  { re: /^health\s*club$/, levels: () => ({ stack: ['floor'] }) },

  // A roof marking, not a level — see the note above.
  { re: /^helipad$/, levels: () => ({ stack: [] }) },

  // Counted levels above ground.
  { re: /^(\d+)\s*p(?:arking)?$/, levels: (m) => ({ stack: new Array(Number(m[1])).fill('parking') }) },
  { re: /^(\d+)\s*(?:typical\s*)?f(?:loors?)?$/, levels: (m) => ({ stack: new Array(Number(m[1])).fill('floor') }) },
];

function parseConfiguration(project) {
  const raw = String(project.configuration)
    .replace(/\([^)]*\)/g, ' ') // "(4 Towers)" — a plan count, never height
    .replace(/&amp;/g, '&');

  const stack = []; // above-ground levels, bottom-up, in the record's own order
  let below = 0;

  raw.split('+').forEach((part) => {
    const token = part.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!token) return;

    const rule = LEVEL_RULES.find((r) => r.re.test(token));
    if (!rule) {
      throw new Error(
        `services: ${project.slug} — the configuration "${project.configuration}" contains a level this build ` +
          `cannot read ("${part.trim()}"). E3.7: a drawing states only what its record holds, so an unreadable ` +
          `level is a decision, never a default. Extend LEVEL_RULES in build/lib/services.js deliberately.`
      );
    }

    const got = rule.levels(rule.re.exec(token));
    if (got.stack) stack.push(...got.stack);
    below += got.below || 0;
  });

  if (stack.length < 1) {
    throw new Error(
      `services: ${project.slug} — "${project.configuration}" reads as no above-ground level at all. ` +
        `A building with nothing above the datum cannot be drawn as an elevation.`
    );
  }

  return { stack, above: stack.length, below };
}

/* E3.3b — the storey pitch, the second invented value. One number per named
   KIND, applied identically to every level of that kind on the sheet: the
   ground storey is the tall one, parking decks are the tight band, the roof
   is a parapet. Every kind a LEVEL_RULE can emit MUST have a row here — the
   guard in elevation() throws on one that does not, because a missing pitch
   silently drawn at 0 is a building shorter than its record (E3.7). */
const KIND_PITCH = {
  ground: 14,
  podium: 11,
  parking: 7,
  mezzanine: 7,
  floor: 9,
  roof: 5,
  basement: 9, // below the datum
};

function drawnHeight(stack) {
  return stack.reduce((sum, kind) => {
    if (!(kind in KIND_PITCH)) {
      throw new Error(`services: level kind "${kind}" has no E3.3b pitch. Extend KIND_PITCH deliberately.`);
    }
    return sum + KIND_PITCH[kind];
  }, 0);
}

/* ------------------------------------------------------------------ *
 * The set, and its two ends — §3.1, §3.3, §3.5
 * ------------------------------------------------------------------ */

/**
 * §3.3 as amended Session XXVI: ascending by DRAWN HEIGHT — by what a reader
 * can see on the sheet, which under E3.3b is no longer the same number as
 * the storey count (six parking decks are shorter than five floors). Ties
 * fall back to the storey count, then to D1 `order`, the only curation the
 * site has. Nothing here is random and nothing reads the clock, so a
 * rebuild produces the same file.
 *
 * TIES ARE REAL: the three Mark & Save stores are identical triplets, and
 * Bluebell and One 678 hold the IDENTICAL string `2B+G+6P+42F` (the fifth
 * O5 duplicate-pair candidate, found by this drawing). Identical strings
 * draw identical elevations — that is what the practice built, recorded so
 * it is never "fixed". (The end-reversal that used to live here served the
 * caption's two named ends; the caption is gone, Session XXVI.)
 */
function drawnSet(db) {
  const drawable = db.projects.filter((p) => p.configuration && String(p.configuration).trim());

  const rows = drawable
    .map((project) => {
      const read = parseConfiguration(project);
      return Object.assign({ project, height: drawnHeight(read.stack) }, read);
    })
    .sort((a, b) => a.height - b.height || a.above - b.above || a.project.order - b.project.order);

  if (rows.length < 2) {
    throw new Error(
      `services: the range is drawn from ${rows.length} record(s). The page's one visual is a RANGE — ` +
        `it cannot be drawn from fewer than two buildings (§3).`
    );
  }

  return rows;
}

/* ------------------------------------------------------------------ *
 * The drawing — §3, §3.7, E3.3
 * ------------------------------------------------------------------ */

/**
 * The geometry, in SVG user units. One unit is about one CSS pixel at the
 * desktop container width, and the drawing scales with its column — which is
 * safe here in a way it is not on the map, because every stroke carries
 * `vector-effect: non-scaling-stroke` and stays 1px at every width. What
 * scaling DOES threaten is the floor pitch, and §3.7 answers that by
 * deleting the internal rules whole below 768px rather than shrinking them.
 */
/* E3.3 as a rule, not a number (Session XXVI): the tallest elevation on the
   sheet draws at RATIO, and every building takes that same footprint. The
   gap and the datum overhang derive from the footprint, so the whole plan
   dimension of the sheet follows the records with nobody editing constants.
   The corner return (RETURN_INSET) is the one vertical drawn INSIDE each
   silhouette — the building's near corner. It is what makes every shape
   asymmetric, and a bar never is. */
/* 🔴 RATIO WAS 6.5 AND IS 5.5 (Session XXVI, Mahesh's call on the
   rendered page). This is the one number that sets how much VERTICAL ROOM
   the sheet takes: a wider foot makes a wider sheet, and a wider sheet
   rendered at 100% of its column is a SHORTER band — 6.5 gave 482px at
   1440, 5.5 gives 407. The shrink is also the more honest proportion. A
   49-storey tower stands about 171m on a 30m plan, which is 5.7:1, so 6.5
   was drawing every building MORE slender than one really is. Both readings
   point the same way, which is why this number moved and the pitch did not.
   The cost is stated: a flatter sheet, and the towers carry less presence. */
const RATIO = 5.5;
const GAP_RATIO = 0.375;
const RETURN_INSET = 0.18;
const PAD_TOP = 16;
const PAD_BOTTOM = 8;

function geometry(rows) {
  const tallest = Math.max(...rows.map((r) => r.height));
  const FOOT = Math.round(tallest / RATIO);
  return { FOOT, GAP: Math.round(FOOT * GAP_RATIO), PAD: Math.round(FOOT / 2) };
}

/**
 * Each elevation is drawn as two paths that both START AT THE DATUM, so the
 * verticals rise bottom-up together under the draw-in (§4) and the top line
 * closes them at the end. A basement is a third path below the line. The
 * floor lines are ONE path per elevation rather than a line element each:
 * they arrive together as a set, and one element is one transition to fade
 * and one thing for §3.7 to delete.
 *
 * `pathLength="1"` normalises the dash arithmetic — every path is one unit
 * long whatever its real length, so the CSS carries no per-building numbers
 * and the tall stack and the short one finish together.
 */
function elevation(row, i, datumY, g) {
  const x = g.PAD + i * (g.FOOT + g.GAP);
  const topY = datumY - row.height;
  const parts = [];

  parts.push(
    `<path class="sv-rise" style="--elev-index:${i}" pathLength="1" d="M ${x} ${datumY} V ${topY}"></path>`
  );
  parts.push(
    `<path class="sv-rise" style="--elev-index:${i}" pathLength="1" d="M ${x + g.FOOT} ${datumY} V ${topY} H ${x}"></path>`
  );

  // The corner return — the near corner of the volume, one inset vertical
  // from the datum to the roofline. Above ground only: below the datum
  // there is nothing to see a corner of.
  const xr = x + Math.round(g.FOOT * RETURN_INSET);
  parts.push(
    `<path class="sv-rise sv-rise--return" style="--elev-index:${i}" pathLength="1" d="M ${xr} ${datumY} V ${topY}"></path>`
  );

  // E3.7 — the datum is real. Basements are the only thing the records place
  // below it, and that is where they are drawn: same footprint, same x, one
  // box. (The lab render that offset these kept two footprints alive at
  // once; deriving x and FOOT in one place is what makes that impossible.)
  if (row.below > 0) {
    const botY = datumY + row.below * KIND_PITCH.basement;
    parts.push(
      `<path class="sv-rise" style="--elev-index:${i}" pathLength="1" ` +
        `d="M ${x} ${datumY} V ${botY} H ${x + g.FOOT} V ${datumY}"></path>`
    );
  }

  // Floor lines at each internal level boundary — cumulative through the
  // E3.3b stack, so a tall ground reads tall and the parking band reads
  // tight. The top boundary is the roofline and the outline already draws
  // it.
  const floors = [];
  let cum = 0;
  row.stack.forEach((kind, k) => {
    cum += KIND_PITCH[kind];
    if (k < row.stack.length - 1) floors.push(`M ${x} ${datumY - cum} H ${x + g.FOOT}`);
  });
  for (let k = 1; k < row.below; k++) {
    const y = datumY + k * KIND_PITCH.basement;
    floors.push(`M ${x} ${y} H ${x + g.FOOT}`);
  }
  if (floors.length) {
    parts.push(`<path class="sv-floors" style="--elev-index:${i}" d="${floors.join(' ')}"></path>`);
  }

  return parts.join('');
}

function drawing(rows) {
  const g = geometry(rows);
  const maxHeight = Math.max(...rows.map((r) => r.height));
  const maxBelow = Math.max(...rows.map((r) => r.below));
  const datumY = PAD_TOP + maxHeight;
  const height = datumY + maxBelow * KIND_PITCH.basement + PAD_BOTTOM;
  const width = 2 * g.PAD + rows.length * g.FOOT + (rows.length - 1) * g.GAP;

  const elevations = rows.map((row, i) => elevation(row, i, datumY, g)).join('');

  // The ground line runs under all of them and PAST them — the datum
  // overhangs the outermost elevations by PAD at both ends and meets the
  // viewBox edges, which the full-bleed figure carries to the viewport
  // edges. The ground leaving the frame is the difference between a site
  // and a chart: a chart's axis is coextensive with its data. It draws
  // first (§4).
  const datum = `<path class="sv-datum" pathLength="1" d="M 0 ${datumY} H ${width}"></path>`;

  return {
    drawViewBox: `0 0 ${width} ${height}`,
    drawHtml: datum + elevations,
    drawCount: rows.length,
  };
}

/* ------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------ */

function viewData(prefix) {
  const db = loadDb();
  const rows = drawnSet(db);

  const low = rows[0];
  const high = rows[rows.length - 1];
  const standing = rows.filter((r) => r.project.status === 'Completed').length;
  const g = geometry(rows);

  console.log(
    `    services: ${rows.length} of ${db.projects.length} records drawn ` +
      `(E7.2 — ${db.projects.length - rows.length} name no levels, so none is inferred); ` +
      `${standing} standing, ${rows.length - standing} rising ` +
      `(E9.6 — 🔴 the page carries NO set-level disclosure since Session XXVI; letter item pending); ` +
      `range ${low.project.title} (${low.height}u) → ${high.project.title} (${high.height}u above, ${high.below}B); ` +
      `E3.3 derives FOOT ${g.FOOT} · GAP ${g.GAP} · overhang ${g.PAD}.`
  );

  return Object.assign(
    {
      workHref: `${prefix}projects.html`,
      contactHref: `${prefix}contact.html`,
    },
    drawing(rows)
  );
}

function hasViewData(srcName) {
  return srcName === 'services';
}

module.exports = { hasViewData, viewData, parseConfiguration, drawnSet, KIND_PITCH, RATIO, geometry };
