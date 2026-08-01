'use strict';

/**
 * Everything Home derives from the records — the claim's photograph, the
 * four rooms, the Prays moment and the map.
 *
 * Spec: `_bmad/wds/D-UX-Design/01-home.md`. Copy authority:
 * `_bmad/wds/E-Brand-Framework/04-copy-direction.md` v3.3 §1. The page's
 * words live in `pages-src/index.html`; this file supplies only what the
 * records decide — which building leads a room, which names follow it, and
 * where the marks sit.
 *
 * It consumes records.js (the record rules), work.js (the D1 order and the
 * plate) and districts.js (the marks). It re-derives none of them: three
 * surfaces already draw the same marks, and a second implementation is how
 * two surfaces start disagreeing about one building.
 *
 * Three things here are Home's own, and each is written as a rule:
 *
 *   the rooms ship in their FALLBACK forms (01-home §5.2's per-room
 *   contract) because G6 — four at-tier photographs — has no date. Each
 *   room graduates to a full-bleed photograph the day its image lands, and
 *   nothing around it restructures.
 *
 *   a name is never printed twice. Two of the corroborated O5 pairs are one
 *   school under two records; Home shows a SELECTION, so the second name of
 *   a pair is simply not selected. This is a display rule, not a data
 *   merge — merging is O5's job, when ProArc confirms.
 *
 *   the marks animate in a SPATIAL sweep (E7.3), west to east. districts.js
 *   lays them down in authored district order, which is by size — an order
 *   that would read as a ranking. Sorting them by x here claims nothing
 *   about time or importance, which is the whole point of the clause.
 */

const fs = require('fs');
const path = require('path');
const R = require('./records');
const W = require('./work');
const D = require('./districts');

const ROOT = path.join(__dirname, '..', '..');

function escapeText(s) {
  return String(s).replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function loadDb() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
}

function loadManifest() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'images', 'manifest.json'), 'utf8'));
  if (!Object.keys(manifest.projects || {}).length) {
    throw new Error(
      'images/manifest.json holds no projects — run `npm run build:manifest`. ' +
        'An empty manifest does not fail the page build; it silently strips every image.'
    );
  }
  return manifest;
}

/* ------------------------------------------------------------------ *
 * O5 — the pairs external corroboration reads as one school
 * ------------------------------------------------------------------ */

/**
 * The Ajman Private Education Affairs Office roster indicates Woodlem Park
 * Private ≡ Woodlem Park Al Jurf and City University ≡ City University
 * Campus (continuity, 31 Jul). Both records still ship — the merge is a
 * data decision waiting on ProArc — but Home would print one school under
 * two names within a few centimetres, which is the one place the
 * duplication is unmissable.
 *
 * So Home suppresses the SECOND name of each pair from its selections. The
 * record it keeps is the D1-stronger of the two, which is why this is a
 * slug list rather than a rule: the pairing is external knowledge, not
 * anything the data holds.
 */
const O5_SECOND_OF_PAIR = ['edu-cityuniversity', 'edu-woodlemparkaljurf'];

/* ------------------------------------------------------------------ *
 * The rooms — 01-home §5.2, in the sentence's order
 * ------------------------------------------------------------------ */

/**
 * learns · shops · works · lives. Each room names the record that leads it
 * rather than taking the set's first, because two of the four are build
 * decisions rather than D1 outcomes:
 *
 *   shops leads on souksalah, not on the D1 lead's sibling citymalluaq —
 *   board 7 named City Mall before D1 was curated, and City Mall is the one
 *   record OUTSIDE the Emirate. A room about where Ajman shops led by a
 *   mall in Umm Al Quwain spends its evidence arguing against itself.
 *   Souk Salah is D1's own lead for the set, in Ajman, built for Ajman
 *   Municipality (Mahesh, 1 Aug).
 *
 *   works leads on ajmanbank as a PRINT, not as the self-drawing elevation
 *   board 7 drew. None of the three works records carries a `configuration`,
 *   and E3.7 says a generated drawing states only what its record holds —
 *   so the elevation would be an invention. The photograph is honest and
 *   the room keeps the same shape as its neighbours (Mahesh, 1 Aug).
 */
const ROOMS = [
  {
    key: 'schools',
    verb: 'Learns',
    href: 'projects/schools.html',
    // The names wall — learns' fallback form (board 7 frame B). No
    // photograph: the wall is the room's visual, and the names are its
    // evidence.
    form: 'wall',
    wallCount: 10,
  },
  {
    key: 'shops',
    verb: 'Shops',
    href: 'projects/malls.html',
    form: 'print',
    lead: 'souksalah',
    quietCount: 3,
  },
  {
    key: 'works',
    verb: 'Works',
    // D-2: the works set has no sector page (the five-built rule), so the
    // verb lands on the arrival, where the works room lists the whole set.
    href: 'projects.html',
    form: 'print',
    lead: 'ajmanbank',
    // NO quiet line. The set holds three records: the lead, The Black
    // Square, and rholding — which is a proposal, not a building (F-1,
    // its own summary says so). One name followed by an ellipsis promises
    // a selection that does not exist, and the verb already lands on the
    // page that lists the set.
    quietCount: 0,
  },
  {
    key: 'homes',
    verb: 'Lives',
    href: 'projects/homes.html',
    form: 'print',
    lead: 'azhagarden',
    quietCount: 3,
    // §5.2: Seaside Hills is deliberately absent — the claim's photograph
    // already links it, and no destination repeats on this page.
    exclude: ['seasidehills'],
  },
];

/** One sector's records in Proarc's order, minus the names Home never prints. */
function selectableSet(projects, room) {
  const excluded = O5_SECOND_OF_PAIR.concat(room.exclude || []);
  return projects
    .filter((p) => R.sectorKey(p) === room.key && !excluded.includes(p.slug))
    .sort((a, b) => a.order - b.order);
}

function findRecord(projects, slug) {
  const found = projects.find((p) => p.slug === slug);
  if (!found) throw new Error(`home: no record "${slug}" — a room's lead is named, not guessed.`);
  return found;
}

/**
 * A selection of the rest of the verb's buildings — plain text, never
 * links, so the room keeps exactly one destination. The middots carry
 * their own class because the separator is #595959 against #A6A6A6 names,
 * and a template cannot be trusted to join them consistently (03-work's
 * alsoline precedent: the punctuation ships with the line).
 *
 * The ellipsis is the argument (§5.2): a selection that trails off says
 * there is more without printing a total.
 */
function selectionHtml(records, count) {
  if (!count || !records.length) return '';
  const names = records.slice(0, count).map((p) => escapeText(p.title));
  return names.join(' <span class="hm-sep">&middot;</span> ') + '&hellip;';
}

function roomData(db, manifest, prefix, room) {
  const set = selectableSet(db.projects, room);

  if (room.form === 'wall') {
    return {
      roomVerb: room.verb,
      roomHref: prefix + room.href,
      roomWall: '1',
      // The wall is a selection like every other room's quiet line, so it
      // ends in an ellipsis and states no total.
      roomWallHtml: selectionHtml(set, room.wallCount),
      roomPrint: '',
      roomEvidence: '',
      roomQuietHtml: '',
    };
  }

  const lead = findRecord(db.projects, room.lead);
  const rest = set.filter((p) => p.slug !== lead.slug);
  const images = manifest.projects[lead.slug];
  if (!images) throw new Error(`home: ${lead.slug} is not in the manifest.`);
  const plate = W.plate(lead, manifest, prefix);

  return {
    roomVerb: room.verb,
    roomHref: prefix + room.href,
    roomWall: '',
    roomPrint: '1',
    // The print carries NO caption of its own: §5.2 puts the evidence name
    // in the strip, at inline-end, opposite the verb. One name, one place
    // on the page, and nothing is ever set on the photograph.
    roomEvidence: escapeText(lead.title),
    // E9 rides the print exactly as it rides every other image on the site.
    roomProvenance: plate.plateProvenance,
    printSrc: plate.plateSrc,
    printSrcset: plate.plateSrcset,
    printWidth: plate.plateWidth,
    printHeight: plate.plateHeight,
    roomQuietHtml: selectionHtml(rest, room.quietCount),
  };
}

/* ------------------------------------------------------------------ *
 * The map — Option B, the constellation (01-home §6.1, E7.1–E7.3)
 * ------------------------------------------------------------------ */

/**
 * The marks are the page's own, at a TRUE 5px radius (E7.1): a mark set
 * inside a scaling drawing is not the size it is authored at. The svg here
 * is never scaled UP — it renders at its own 560×440 above 640px and at a
 * known 0.5714 below it, where the mark compensates exactly (home.css).
 * Two states, both exact, no JS involved in either.
 *
 * No coastline, no boundaries, no joining lines: Option B is the marks and
 * nothing else, and B's price — no district polygons, so no district
 * interaction — is /ajman's to pay, not Home's. Home's map was always one
 * visual and one link.
 *
 * No labels either. E7.1 puts labels at a true 12px, and ten of them
 * around a 560px field with no boundaries to anchor them is a scatter of
 * words, not a map. The link line is the caption.
 */
function mapData() {
  const marks = D.buildDistrictMarks();

  // E7.3 — a spatial sweep, west to east. The sort lives in districts.js
  // because /ajman sweeps the same marks, and one map derived twice is how
  // two surfaces start disagreeing about where a building is.
  const swept = D.sweepOrder(marks.marks);

  // The circles are generated rather than looped in the page source: the
  // only per-mark value is its index (the 34ms stagger reads it in CSS),
  // and an index is data, not a style. pages-src carries no inline style
  // attributes — the districts.js constellation sets the same precedent.
  const circles = swept
    .map(
      (m, i) =>
        `<circle class="hm-mark" style="--mark-index:${i}" cx="${m.x}" cy="${m.y}" r="5"></circle>`
    )
    .join('');

  return {
    mapViewBox: marks.viewBox,
    mapMarksHtml: circles,
    mapMarkCount: swept.length,
  };
}

/* ------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------ */

function viewData(prefix) {
  const db = loadDb();
  const manifest = loadManifest();

  const seaside = findRecord(db.projects, 'seasidehills');
  const hero = W.plate(seaside, manifest, prefix);
  const map = mapData();

  return Object.assign(
    {
      // The claim's photograph. G4's two art-directed crops are still owed;
      // until they land one composition serves both widths, judged rather
      // than cropped by CSS (E3.6 — never cropped, its own aspect ratio).
      heroSrc: hero.plateSrc,
      heroSrcset: hero.plateSrcset,
      heroWidth: hero.plateWidth,
      heroHeight: hero.plateHeight,
      heroName: hero.plateName,
      heroPlace: hero.platePlace,
      heroHref: hero.plateHref,
      heroProvenance: hero.plateProvenance,

      rooms: ROOMS.map((room) => roomData(db, manifest, prefix, room)),

      mosqueHref: `${prefix}projects/alghalamosque.html`,
      aboutHref: `${prefix}about.html`,
      ajmanHref: `${prefix}ajman.html`,
      contactHref: `${prefix}contact.html`,

      ogImage: hero.plateSrc,
    },
    map
  );
}

function hasViewData(srcName) {
  return srcName === 'index';
}

module.exports = { hasViewData, viewData, selectionHtml, mapData, O5_SECOND_OF_PAIR };
