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
 * It consumes records.js for the two things that are not this page's to
 * decide (the display location and the link to a record's own page), and
 * re-derives neither: the caption on the range and the caption on that
 * building's own page must never disagree about where it stands.
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
 *   fifteen are not standing. The middle of the drawing is anonymous, so no
 *   individual elevation asserts a building; the capnote carries the duty in
 *   words for the whole set. See the note on the ends below.
 *
 *   E3.3 — THE FOOTPRINT IS THE ONE INVENTED VALUE, and it is invented
 *   identically for every building. No record holds a plan dimension, so
 *   every elevation is the same width and only height carries meaning.
 */

const fs = require('fs');
const path = require('path');
const R = require('./records');

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

  // Named single levels, all above ground.
  { re: /^(?:g|ground)(?:\s*floor)?$/, levels: () => ({ above: 1 }) },
  { re: /^first(?:\s*floor)?$/, levels: () => ({ above: 1 }) },
  { re: /^(?:m|mezzanine)$/, levels: () => ({ above: 1 }) },
  { re: /^podium(?:\s*amenities)?$/, levels: () => ({ above: 1 }) },
  { re: /^roof$/, levels: () => ({ above: 1 }) },
  { re: /^penthouse$/, levels: () => ({ above: 1 }) },
  { re: /^health\s*club$/, levels: () => ({ above: 1 }) },

  // A roof marking, not a level — see the note above.
  { re: /^helipad$/, levels: () => ({ above: 0 }) },

  // Counted levels above ground.
  { re: /^(\d+)\s*p(?:arking)?$/, levels: (m) => ({ above: Number(m[1]) }) },
  { re: /^(\d+)\s*(?:typical\s*)?f(?:loors?)?$/, levels: (m) => ({ above: Number(m[1]) }) },
];

function parseConfiguration(project) {
  const raw = String(project.configuration)
    .replace(/\([^)]*\)/g, ' ') // "(4 Towers)" — a plan count, never height
    .replace(/&amp;/g, '&');

  let above = 0;
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
    above += got.above || 0;
    below += got.below || 0;
  });

  if (above < 1) {
    throw new Error(
      `services: ${project.slug} — "${project.configuration}" reads as no above-ground level at all. ` +
        `A building with nothing above the datum cannot be drawn as an elevation.`
    );
  }

  return { above, below };
}

/* ------------------------------------------------------------------ *
 * The set, and its two ends — §3.1, §3.3, §3.5
 * ------------------------------------------------------------------ */

/**
 * §3.3: ascending by above-ground storeys — by what a reader can see. The
 * basements are drawn but they do not order the set.
 *
 * TIES ARE REAL AND THERE ARE THREE OF THEM: the three Mark & Save stores
 * are identical triplets, Deca 035 and the penthouse record both read ten,
 * and Bluebell and One 678 hold the IDENTICAL string `2B+G+6P+42F` (the
 * fifth O5 duplicate-pair candidate, found by this drawing). Five of the
 * fifteen elevations are therefore visual duplicates — and that is what the
 * practice built, recorded so it is never "fixed".
 *
 * A tie is broken by D1, `order`, the only curation the site has. The
 * consequence that matters is at the ends: the caption may name only the two
 * terminal elevations (§3.5), so the terminal elevation of a tied group must
 * be the best-curated record of it. Ascending `order` already puts the best
 * of the low group first; the top group is reversed so the best of it lands
 * last. Nothing here is random and nothing reads the clock, so a rebuild
 * produces the same file.
 */
function drawnSet(db) {
  const drawable = db.projects.filter((p) => p.configuration && String(p.configuration).trim());

  const rows = drawable
    .map((project) => Object.assign({ project }, parseConfiguration(project)))
    .sort((a, b) => a.above - b.above || a.project.order - b.project.order);

  if (rows.length < 2) {
    throw new Error(
      `services: the range is drawn from ${rows.length} record(s). The page's one visual is a RANGE — ` +
        `it cannot be drawn from fewer than two buildings (§3).`
    );
  }

  // The top tie, reversed so the best-curated record of it is terminal.
  const tallest = rows[rows.length - 1].above;
  const topFrom = rows.findIndex((r) => r.above === tallest);
  if (topFrom < rows.length - 1) {
    const top = rows.splice(topFrom).reverse();
    rows.push(...top);
  }

  return rows;
}

/**
 * §3.5 — the caption names and links ONLY the two ends, and its support is
 * the district: a record surface (E10.2a), read through records.js so this
 * caption and that building's own page cannot disagree about where it is.
 *
 * THE STATUS IS DELIBERATELY ABSENT, and this is an amendment to §3.5 and to
 * the capnote's second clause, decided 1 Aug (Mahesh). The spec asks a named
 * end to carry its record's status where the building is not standing — but
 * `records.js` suppresses exactly that string on all 47 records, because the
 * site never says a building is unbuilt, and Services would be the single
 * surface reintroducing it. E9.6's duty is discharged for the SET by the
 * capnote in words, which names nobody. What survived the 1 Aug lock was the
 * E9 provenance caption, a statement about an image; a status label is a
 * statement about a building.
 *
 * Configuration strings stay off the caption too (E12): the drawing may show
 * what prose may not say, and a quantity's place is the building's own spec
 * table.
 */
function end(row, prefix) {
  return {
    endName: escapeText(row.project.title),
    endHref: `${prefix}projects/${row.project.slug}.html`,
    endPlace: escapeText(R.displayLocation(row.project)),
  };
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
const PITCH = 9; // one storey
const FOOT = 48; // E3.3 — the one invented value, identical for every building
const GAP = 18;
const PAD_TOP = 16;
const PAD_BOTTOM = 8;

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
function elevation(row, i, datumY) {
  const x = i * (FOOT + GAP);
  const topY = datumY - row.above * PITCH;
  const parts = [];

  parts.push(
    `<path class="sv-rise" style="--elev-index:${i}" pathLength="1" d="M ${x} ${datumY} V ${topY}"></path>`
  );
  parts.push(
    `<path class="sv-rise" style="--elev-index:${i}" pathLength="1" d="M ${x + FOOT} ${datumY} V ${topY} H ${x}"></path>`
  );

  // E3.7 — the datum is real. Basements are the only thing the records place
  // below it, and that is where they are drawn.
  if (row.below > 0) {
    const botY = datumY + row.below * PITCH;
    parts.push(
      `<path class="sv-rise" style="--elev-index:${i}" pathLength="1" ` +
        `d="M ${x} ${datumY} V ${botY} H ${x + FOOT} V ${datumY}"></path>`
    );
  }

  const floors = [];
  for (let k = 1; k < row.above; k++) {
    const y = datumY - k * PITCH;
    floors.push(`M ${x} ${y} H ${x + FOOT}`);
  }
  for (let k = 1; k < row.below; k++) {
    const y = datumY + k * PITCH;
    floors.push(`M ${x} ${y} H ${x + FOOT}`);
  }
  if (floors.length) {
    parts.push(`<path class="sv-floors" style="--elev-index:${i}" d="${floors.join(' ')}"></path>`);
  }

  return parts.join('');
}

function drawing(rows) {
  const maxAbove = Math.max(...rows.map((r) => r.above));
  const maxBelow = Math.max(...rows.map((r) => r.below));
  const datumY = PAD_TOP + maxAbove * PITCH;
  const height = datumY + maxBelow * PITCH + PAD_BOTTOM;
  const width = rows.length * FOOT + (rows.length - 1) * GAP;

  const elevations = rows.map((row, i) => elevation(row, i, datumY)).join('');

  // The ground line runs under all of them: it is what makes fifteen
  // separate elevations one drawing, and it is the line the basements are
  // below. It draws first (§4).
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

  console.log(
    `    services: ${rows.length} of ${db.projects.length} records drawn ` +
      `(E7.2 — ${db.projects.length - rows.length} name no levels, so none is inferred); ` +
      `${standing} standing, ${rows.length - standing} rising (E9.6 — the capnote carries the set); ` +
      `range ${low.project.title} (${low.above}) → ${high.project.title} (${high.above} above, ${high.below} below).`
  );

  return Object.assign(
    {
      // Two rows from one markup block: the caption is the same object
      // twice, and a second copy of it in the source is how the two ends
      // start being presented differently.
      ends: [end(low, prefix), end(high, prefix)],
      workHref: `${prefix}projects.html`,
      contactHref: `${prefix}contact.html`,
    },
    drawing(rows)
  );
}

function hasViewData(srcName) {
  return srcName === 'services';
}

module.exports = { hasViewData, viewData, parseConfiguration, drawnSet, PITCH, FOOT, GAP };
