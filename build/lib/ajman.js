'use strict';

/**
 * Everything /ajman derives from the records — the standing map's marks and
 * the district ledger beside them.
 *
 * Spec: `_bmad/wds/D-UX-Design/05-ajman.md`. Copy authority:
 * `_bmad/wds/E-Brand-Framework/04-copy-direction.md` v3.3 §2a. The page's
 * words live in `pages-src/ajman.html`; this file supplies only what the
 * records decide — which building sits under which head, and where the
 * marks sit.
 *
 * It consumes records.js (the record rules) and districts.js (the marks and
 * the sweep). It re-derives none of them: three surfaces already draw the
 * same marks, and the ledger and the map on THIS page must agree about every
 * one of the 47 or the page argues with itself.
 *
 * Three things here are /ajman's own:
 *
 *   the ledger is the page's INVENTORY and is deliberately more complete
 *   than the map can be (§4.2). It carries the 18 records whose data names
 *   no district and the one outside the Emirate — the map carries neither,
 *   because E7.2 places no mark by inference.
 *
 *   NO COUNTS ON ANY HEAD (§4.2). The distribution is 6·6·5·4·2·1·1·1·1·1,
 *   so a count beside each head prints a list of five ones and the page
 *   announces its own thin tail. The rows are the count.
 *
 *   the timeline (§8) turns ITSELF on. "Until the years arrive" is a
 *   definition, not a reminder: 40 of 47 is a perfect fill (seven
 *   in-progress buildings can never carry a completion year), so the gate is
 *   computed from the data every build and the section ships hidden until
 *   the field reaches it. Nobody has to remember.
 */

const fs = require('fs');
const path = require('path');
const R = require('./records');
const D = require('./districts');
const { slugify } = require('./slugify');

const ROOT = path.join(__dirname, '..', '..');

/**
 * §8's definition, as a number the build can test. 24 parse today; Ravi can
 * date 14 more and two prose entries can be repaired.
 */
const TIMELINE_THRESHOLD = 40;

function escapeText(s) {
  return String(s).replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function loadDb() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
}

/* ------------------------------------------------------------------ *
 * The ledger — §4.2
 * ------------------------------------------------------------------ */

/**
 * A row is the building's name linking to its own page, with the meta at
 * inline-end: the E9 provenance label where the record carries one, then the
 * year where one parses. Both are absent far more often than not, and an
 * absent one prints nothing rather than a dash — §4.2 asks for a quiet ruled
 * block, and a column of em-dashes is a table with holes in it.
 *
 * The year here is a RECORD SURFACE, which is the whole of E12's split: this
 * page's display prose carries no quantity at all, and the ledger carries
 * every one the records hold.
 */
function rowData(project, prefix) {
  const meta = [];
  const label = R.provenance(project);
  if (label) meta.push(escapeText(label));
  const year = R.parseYear(project);
  if (year) meta.push(year);

  return {
    rowName: escapeText(project.title),
    rowHref: `${prefix}projects/${project.slug}.html`,
    rowMetaHtml: meta.join(' <span class="aj-sep">&middot;</span> '),
  };
}

/** D1, Proarc's order — the same sequence every other surface reads. */
function inOrder(projects) {
  return projects.slice().sort((a, b) => a.order - b.order);
}

/**
 * The blocks, in the order §4.2 fixes: districts by size, then the
 * plain-Ajman group, then Umm Al Quwain.
 *
 * `blockKey` is what ties a block to its marks. Only district blocks carry
 * one — the 18 and the one outside the Emirate have no mark on the map, so
 * their blocks do not pretend to drive it (§3.4, as Option B rewrites it).
 * The head for the outside block is read from the record's own location
 * string through records.js, so the ledger cannot name a place the caption
 * on that building's page does not.
 */
function buildBlocks(db, marks, prefix) {
  const bySlug = new Map(db.projects.map((p) => [p.slug, p]));
  const pick = (slugs) => inOrder(slugs.map((s) => bySlug.get(s)));

  const districtBlocks = marks.districts
    .filter((d) => d.slugs.length)
    // By size. Array#sort is stable, so the five districts of one keep the
    // authored order rather than shuffling between builds.
    .sort((a, b) => b.slugs.length - a.slugs.length)
    .map((d) => ({
      blockKey: slugify(d.name),
      blockHead: escapeText(d.name),
      rows: pick(d.slugs).map((p) => rowData(p, prefix)),
    }));

  const blocks = districtBlocks.slice();

  // §4.2 — "Also in Ajman", the site's own phrase, already in use on Screen
  // 04's neighbours block. It reads as editorial sequencing, never as a gap.
  if (marks.unplaced.plainAjman.length) {
    blocks.push({
      blockKey: '',
      blockHead: 'Also in Ajman',
      rows: pick(marks.unplaced.plainAjman).map((p) => rowData(p, prefix)),
    });
  }

  // The one record outside the Emirate. It closes the ledger and it is never
  // on a map of one Emirate.
  marks.unplaced.outsideEmirate.forEach((slug) => {
    const project = bySlug.get(slug);
    blocks.push({
      blockKey: '',
      blockHead: escapeText(R.displayLocation(project)),
      rows: [rowData(project, prefix)],
    });
  });

  return blocks;
}

/* ------------------------------------------------------------------ *
 * The map — Option B, in a 58% sticky column (§3.1, §3.6, E7.1–E7.3)
 * ------------------------------------------------------------------ */

/**
 * The marks are the page's own, at a TRUE 5px radius (E7.1) — which is only
 * true if the drawing does not scale under them, so ajman.css gives the
 * field four KNOWN widths with --mark-scale cancelling each. Home needed
 * three; this map lives in a 58% column above 821px and stacks below it, and
 * those are genuinely two different geometries.
 *
 * No coastline, no boundaries, no joining lines: Option B is "the identical
 * build minus the linework" (§3.6). AND NO LABELS — decided at this build,
 * on Home's own reasoning: E7.1 puts a label at a true 12px, and ten of them
 * with no boundaries to anchor them is a scatter of words, worse in a column
 * narrower than Home's. §3.7 already makes the ledger the legend below 768;
 * in Option B it is the legend at every width, and the labels arrive with
 * the boundaries that can hold them.
 *
 * `data-district` is what makes the ledger's block the map's control (§3.4
 * as Option B rewrites it): with no polygons there is nothing on the map to
 * touch, so the map answers the ledger rather than indexing it.
 */
function mapData(marks) {
  if (!marks.marks.length) {
    throw new Error(
      'ajman: the map has no marks — /ajman does not ship without its centrepiece (§3.6, v4 §8.2). ' +
        'Check data/projects.json location strings and data/districts.json.'
    );
  }

  const circles = D.sweepOrder(marks.marks)
    .map(
      (m, i) =>
        `<circle class="aj-mark" data-district="${slugify(m.district)}" style="--mark-index:${i}" ` +
        `cx="${m.x}" cy="${m.y}" r="5"></circle>`
    )
    .join('');

  return {
    mapViewBox: marks.viewBox,
    mapMarksHtml: circles,
    mapMarkCount: marks.marks.length,
  };
}

/* ------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------ */

function viewData(prefix) {
  const db = loadDb();
  const marks = D.buildDistrictMarks();
  const blocks = buildBlocks(db, marks, prefix);

  // The ledger is the page's inventory, so it holds every record or it is
  // not one. A silent short ledger on the page that exists to show the whole
  // body of work is the failure this page cannot survive.
  const rowCount = blocks.reduce((n, b) => n + b.rows.length, 0);
  if (rowCount !== db.projects.length) {
    throw new Error(`ajman: the ledger holds ${rowCount} rows against ${db.projects.length} records.`);
  }

  const dated = db.projects.filter((p) => R.parseYear(p)).length;
  const timelineReady = dated >= TIMELINE_THRESHOLD;

  console.log(
    `    ajman: ${marks.marks.length} of ${db.projects.length} records placed ` +
      `(X3 — ${marks.unplaced.plainAjman.length} name no district, ` +
      `${marks.unplaced.outsideEmirate.length} outside the Emirate); ` +
      `ledger ${rowCount}/${db.projects.length}; ` +
      `timeline ${timelineReady ? 'SHIPPING' : 'hidden'} at ${dated}/${TIMELINE_THRESHOLD} years (W5).`
  );

  return Object.assign(
    {
      blocks,
      // §8 — the slot exists and turns itself on. Until then it renders
      // nothing at all: a pending section ships hidden, never as an empty box.
      timelineReady: timelineReady ? '1' : '',

      learnsHref: `${prefix}projects/schools.html`,
      contactHref: `${prefix}contact.html`,
    },
    mapData(marks)
  );
}

function hasViewData(srcName) {
  return srcName === 'ajman';
}

module.exports = { hasViewData, viewData, buildBlocks, TIMELINE_THRESHOLD };
