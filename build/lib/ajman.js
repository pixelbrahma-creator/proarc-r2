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
 * build minus the linework" (§3.6).
 *
 * THE LABELS ARE BACK (Mahesh, 3 Aug), reversing this build's own decision.
 * That decision read: E7.1 puts a label at a true 12px, and ten of them with
 * no boundaries to anchor them is a scatter of words. The reversal is a
 * judgement about the drawing, made on the drawing — the field is sparse
 * enough that ten names read as a map rather than as scatter, and the ledger
 * being the legend is no reason for the map to be mute.
 *
 * WHAT THE ORIGINAL OBJECTION GOT RIGHT, AND WHAT IT COSTS TO HONOUR:
 * a label inside this SVG is in USER UNITS, so it scales with the viewBox
 * while the 12px floor does not. ajman.css therefore restates --label-size
 * at each of the field's four known widths, exactly as --mark-scale is
 * restated, and drops the labels entirely at the width where the arithmetic
 * stops working. See the block beside --mark-scale for the numbers.
 *
 * A label is anchored to its CLUSTER, not to the district's nominal centre:
 * the centroid of the marks that are actually drawn, dropped clear of the
 * lowest of them. A name floating beside an empty patch of field, because a
 * centre was authored where no building stands, is the fault this avoids.
 *
 * `data-district` is what makes the ledger's block the map's control (§3.4
 * as Option B rewrites it): with no polygons there is nothing on the map to
 * touch, so the map answers the ledger rather than indexing it. The labels
 * carry the same `data-district` and the same rest-and-current grammar as
 * the marks, so a current block now lifts a NAME as well as a cluster.
 *
 * The svg stays `aria-hidden`. These names are a second rendering of the
 * ledger directly beneath them, and announcing all ten twice is worse for a
 * screen reader than announcing them once as the text they already are.
 */

/* Baseline drop from the cluster's lowest mark, in user units. The mark is
   r=5 scaled up to 1.4 at its largest LABELLED width, so its underside is 7
   below centre; a ~12-unit cap then starts around 14 below and the name
   clears the drawing by roughly the mark's own diameter. */
const LABEL_DROP = 26;
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

  const byDistrict = new Map();
  marks.marks.forEach((m) => {
    if (!byDistrict.has(m.district)) byDistrict.set(m.district, []);
    byDistrict.get(m.district).push(m);
  });

  // A district with no mark gets no label: there is nothing on the field for
  // the name to be the name OF, and a floating word is the scatter the
  // original decision was right to fear.
  const labels = marks.districts
    .filter((d) => byDistrict.has(d.name))
    .map((d) => {
      const ks = byDistrict.get(d.name);
      const cx = Math.round(ks.reduce((sum, k) => sum + k.x, 0) / ks.length);
      const cy = Math.max.apply(null, ks.map((k) => k.y));
      return (
        `<text class="aj-map__label" data-district="${slugify(d.name)}" ` +
        `x="${cx}" y="${cy + LABEL_DROP}">${escapeText(d.name)}</text>`
      );
    })
    .join('');

  if (!labels) {
    throw new Error(
      'ajman: the map drew marks but produced no labels — every drawn cluster owes a name. ' +
        'A district in data/districts.json is not matching the marks built from it.'
    );
  }

  /* THE MAP BECOMES TOUCHABLE, and it costs no tab stop (Mahesh, 4 Aug).
     Until now the selection ran one way: the ledger was the control and the
     map answered it, because with no polygons there was nothing on the map to
     touch. The regions supply the missing half.

     They are LAST in the svg, which is deliberate — an SVG shape takes
     pointer events by default, so a hit layer underneath the marks would let
     a mark swallow the pointer and the district under the cursor would depend
     on whether the reader happened to be over a dot. On top, with the marks
     and labels beneath it, there is exactly one element under the pointer
     anywhere on the field.

     MOUSE ONLY, AND THAT IS THE WHOLE ACCESSIBILITY ARGUMENT. No `tabindex`,
     no `role`, no `<a>`: the regions add ZERO tab stops, so the page's keyboard
     path is what it was — every ledger row is already a link and focus drives
     the same selection hover does. The svg stays `aria-hidden`, so nothing
     here is announced twice. Nothing is reachable ONLY by pointer either:
     everything a region selects, the ledger beneath it already states as text.

     `fill="none"` with `pointer-events="all"` is what makes a region invisible
     and still hittable — an unfilled shape is not a target otherwise. Stated
     as attributes rather than CSS because they are what the element IS; a
     stylesheet that failed to load would otherwise leave ten opaque plates
     over the drawing. */
  const hits = D.districtRegions(marks)
    .map(
      (r) =>
        `<path class="aj-hit" data-district="${slugify(r.name)}" fill="none" ` +
        `pointer-events="all" d="M${r.points.map((p) => `${p[0]} ${p[1]}`).join('L')}Z"></path>`
    )
    .join('');

  return {
    mapViewBox: marks.viewBox,
    mapMarksHtml: circles,
    mapLabelsHtml: labels,
    mapHitsHtml: hits,
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
