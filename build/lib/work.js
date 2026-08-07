'use strict';

/**
 * Everything the Work surfaces derive from the records — the arrival
 * (projects.html) and the three sector pages (projects/schools · malls ·
 * homes). The ledger, projects/list.html, retired in Session XXI — its
 * columns moved inside the arrival's rooms and its page was deleted.
 *
 * Spec: `_bmad/wds/D-UX-Design/03-work.md`. Copy authority:
 * `_bmad/wds/E-Brand-Framework/04-copy-direction.md` v3.3 §2 — the support
 * lines and the arrival header below are that document's decided wording,
 * verbatim.
 *
 * The record rules themselves (sector mapping, location display, year
 * parse, provenance) come from records.js — a second implementation is how
 * two surfaces start disagreeing about one record. This file only adds the
 * derivations no other surface wants: the D1-ordered sector sets, the
 * building's own noun, and the row metadata.
 */

const fs = require('fs');
const path = require('path');
const R = require('./records');

const ROOT = path.join(__dirname, '..', '..');

/* ------------------------------------------------------------------ *
 * Escaping — the same two helpers generate-projects.js carries
 * ------------------------------------------------------------------ */

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeText(s) {
  return String(s).replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ------------------------------------------------------------------ *
 * The order (D1) and the sector sets
 * ------------------------------------------------------------------ */

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

/** All 47, in Proarc's order. An unranked record is a build error, not a tail. */
function ordered(projects) {
  const unranked = projects.filter((p) => typeof p.order !== 'number');
  if (unranked.length) {
    throw new Error(
      `work surfaces: ${unranked.length} record(s) carry no D1 order (${unranked.map((p) => p.slug).join(', ')}).`
    );
  }
  return projects.slice().sort((a, b) => a.order - b.order);
}

/** One sector's records, in Proarc's order. */
function sectorSet(projects, key) {
  return ordered(projects).filter((p) => R.sectorKey(p) === key);
}

/* ------------------------------------------------------------------ *
 * The building's own noun — the rooms' and catalogues' type column
 * ------------------------------------------------------------------ */

/**
 * Derived from the record's own title where the title names its kind, so
 * the site never asserts a kind the record does not hold. The three
 * override entries are the spec's own noun list applied to titles that
 * carry no kind word (Mark & Save is the list's "Superstore"; the two
 * furniture retailers are its "Showroom"). Everything else falls back to
 * its sector's plain noun.
 */
const NOUN_OVERRIDES = {
  marksaverashdiya: 'Superstore',
  marksavealtallah: 'Superstore',
  marksavealjurf: 'Superstore',
  royalfurniture: 'Showroom',
  homesrus: 'Showroom',
};

// Order matters: University before School ("City University Campus"),
// Residences before Residence only by regex boundary.
const NOUN_TOKENS = [
  ['University', 'University'],
  ['School', 'School'],
  ['Mosque', 'Mosque'],
  ['Mall', 'Mall'],
  ['Souk', 'Souk'],
  ['Souq', 'Souq'],
  ['Tower', 'Tower'],
  ['Villas', 'Villas'],
  ['Villa', 'Villas'],
  ['Residences', 'Residence'],
  ['Residence', 'Residence'],
  ['Penthouse', 'Residence'],
  ['Headquarters', 'Office'],
  ['Office', 'Office'],
];

const SECTOR_FALLBACK_NOUN = {
  schools: 'School',
  shops: 'Mall',
  homes: 'Residence',
  works: 'Office',
  mosque: 'Mosque',
};

function buildingNoun(project) {
  if (NOUN_OVERRIDES[project.slug]) return NOUN_OVERRIDES[project.slug];
  const words = String(project.title).split(/[\s,]+/);
  for (const [token, noun] of NOUN_TOKENS) {
    if (words.includes(token)) return noun;
  }
  return SECTOR_FALLBACK_NOUN[R.sectorKey(project)];
}

/**
 * On a sector page the set's own noun goes unsaid in its rows — only the
 * exception speaks (E10.2: "University beside City University"). On the
 * Homes page the set's kinds ARE the set (the declined name was "Villas &
 * towers"), so all three go unsaid there.
 *
 * 🔴 THE ARRIVAL'S GROUPED ROOMS TAKE THE SAME RULE (Session XXI). When the
 * ledger's rows moved inside the four rooms, the type noun came with them —
 * and rendered, it read "School" fifteen times under *Learns* and "Office"
 * three times under *Works*. A noun that repeats for every row of its group
 * is not information, it is the group's own heading restated per line. It
 * earns its place only where the set is mixed: *Shops* (Souk · Mall ·
 * Superstore · Showroom) and *Lives* (the three that go unsaid on the Homes
 * PAGE speak here, because the arrival's rooms sit beside each other and the
 * sector page's set does not).
 *
 * The two tables are NOT the same list, and that is the point. The Homes
 * PAGE suppresses all three of Residence/Tower/Villas because there the
 * kinds are the whole set; the *Lives* ROOM suppresses only Residence, so
 * that Tower and Villas — the difference — still speak.
 */
const UNSAID_NOUNS = {
  schools: ['School'],
  shops: ['Mall'],
  homes: ['Residence', 'Tower', 'Villas'],
};

/**
 * The arrival's four rooms suppress only their own dominant noun. `works`
 * appears here and not above because there is no works sector page (D-2) —
 * it never needed an entry while the room was a bare name list, since a
 * bare name list has no noun column to be noisy in.
 */
const ROOM_UNSAID_NOUNS = {
  schools: ['School'],
  shops: ['Mall'],
  works: ['Office'],
  homes: ['Residence'],
};

/* ------------------------------------------------------------------ *
 * Row metadata — the ground rule applied to a set's rows
 * ------------------------------------------------------------------ */

/**
 * District-if-any: metadata speaks districts, a plain-Ajman location goes
 * unsaid, another emirate is named in full (E10.2 — only difference
 * speaks). This is a SET surface; the record page's own E10.2a exception
 * does not apply here.
 */
function rowPlace(project) {
  const district = R.districtOf(project);
  if (district) return district;
  const display = R.displayLocation(project);
  return display === 'Ajman' ? '' : display;
}

/** name · place · noun-if-spoken · year, as data for one catalogue/list row. */
function rowData(project, manifest, prefix, unsaidNouns) {
  const noun = buildingNoun(project);
  const provenance = R.provenance(project);
  const images = manifest.projects[project.slug] || {};
  return {
    rowHref: `${prefix}projects/${project.slug}.html`,
    rowName: escapeText(project.title),
    rowProvenance: provenance ? escapeText(provenance) : '',
    rowPlace: escapeText(rowPlace(project)),
    rowNoun: unsaidNouns && unsaidNouns.includes(noun) ? '' : escapeText(noun),
    rowYear: R.parseYear(project) || '',
    rowThumb: images.thumb ? prefix + images.thumb : '',
  };
}

/* ------------------------------------------------------------------ *
 * Images — intrinsic sizes ride the manifest; a missing one is an error
 * ------------------------------------------------------------------ */

function image(manifest, rel, slug, prefix) {
  const size = manifest.sizes && manifest.sizes[rel];
  if (!size) throw new Error(`${slug}: no intrinsic size for ${rel}. Run npm run build:manifest.`);
  return { src: prefix + rel, width: size[0], height: size[1] };
}

/** A record's lead image with its srcset, exactly as the project page builds it. */
function leadImage(project, manifest, prefix) {
  const images = manifest.projects[project.slug];
  if (!images) throw new Error(`${project.slug}: not in the manifest.`);
  const hero = image(manifest, images.hero, project.slug, prefix);
  const heroMd = images.heroMd ? image(manifest, images.heroMd, project.slug, prefix) : null;
  const srcset =
    heroMd && heroMd.width !== hero.width ? `${heroMd.src} ${heroMd.width}w, ${hero.src} ${hero.width}w` : '';
  return { src: hero.src, width: hero.width, height: hero.height, srcset };
}

/** A print/study/room-lead figure: the image plus its off-image caption. */
function plate(project, manifest, prefix) {
  const img = leadImage(project, manifest, prefix);
  const provenance = R.provenance(project);
  return {
    plateHref: `${prefix}projects/${project.slug}.html`,
    plateName: escapeText(project.title),
    platePlace: escapeText(rowPlace(project)),
    plateProvenance: provenance ? escapeText(provenance) : '',
    plateSrc: img.src,
    plateSrcset: img.srcset,
    plateWidth: img.width,
    plateHeight: img.height,
  };
}

/* ------------------------------------------------------------------ *
 * The three sector pages — copy from 04-copy-direction.md v3.3 §2,
 * verbatim
 * ------------------------------------------------------------------ */

const SECTOR_PAGES = {
  'projects-schools': {
    key: 'schools',
    noun: 'Schools',
    verb: 'Learns.',
    support:
      'Where Ajman learns — campuses across the Emirate, from Habitat and Woodlem Park to its universities. ' +
      'The school groups that build with us come back — campus after campus.',
    also: [
      { label: 'Malls & shops', href: 'malls.html' },
      { label: 'Homes', href: 'homes.html' },
    ],
  },
  'projects-malls': {
    key: 'shops',
    noun: 'Malls & shops',
    verb: 'Shops.',
    support:
      'Where Ajman shops — the City Life malls, the souk built for Ajman Municipality, and the stores a ' +
      'neighbourhood uses on a Tuesday.',
    also: [
      { label: 'Schools', href: 'schools.html' },
      { label: 'Homes', href: 'homes.html' },
    ],
  },
  'projects-homes': {
    key: 'homes',
    noun: 'Homes',
    verb: 'Lives.',
    support: 'Where Ajman lives — from the villas at Al Zorah to One 678, going up now at Aamra.',
    also: [
      { label: 'Schools', href: 'schools.html' },
      { label: 'Malls & shops', href: 'malls.html' },
    ],
  },
};

/**
 * "Also: Malls & shops · Homes — and one mosque." — the decided line, its
 * punctuation included, so the template cannot mis-join it. The mosque
 * phrase links to the record ("one" rides E12's method-word exemption).
 */
function alsoLineHtml(cfg, prefix) {
  const links = cfg.also
    .map((a) => `<a class="wk-also__link" href="${a.href}">${escapeText(a.label)}</a>`)
    .join(' &middot; ');
  return `Also: ${links} &mdash; and <a class="wk-also__link" href="${prefix}projects/alghalamosque.html">one mosque</a>.`;
}

function sectorViewData(srcName, prefix) {
  const cfg = SECTOR_PAGES[srcName];
  const db = loadDb();
  const manifest = loadManifest();
  const set = sectorSet(db.projects, cfg.key);

  if (set.length < 4) {
    throw new Error(`${srcName}: the set holds ${set.length} records — below the exhibition's own anatomy.`);
  }

  const unsaid = UNSAID_NOUNS[cfg.key];
  const catalogue = set.slice(3).map((p) => rowData(p, manifest, prefix, unsaid));

  return {
    sectorNoun: cfg.noun,
    sectorVerb: cfg.verb,
    sectorSupport: escapeText(cfg.support),
    backHref: `${prefix}projects.html`,
    print: [plate(set[0], manifest, prefix)],
    studies: [plate(set[1], manifest, prefix), plate(set[2], manifest, prefix)],
    catalogueRows: catalogue,
    frameSrc: catalogue[0].rowThumb,
    alsoHtml: alsoLineHtml(cfg, prefix),
    ogImage: leadImage(set[0], manifest, prefix).src,
  };
}

/* ------------------------------------------------------------------ *
 * The arrival — projects.html (03-work §4.1)
 * ------------------------------------------------------------------ */

/**
 * The four rooms, in the sentence's order. The verb is the link — except
 * works, whose set has no page (the five-built rule, D-2): its heading is
 * a heading, and the room, which lists every name in the set, is the
 * set's whole home.
 *
 * The opener lines are authored here in the register the spec fixes —
 * nouns and names, no formula, no counts. The page's one "Ajman" and one
 * formula belong to the mosque line; an organisation's own name (Ajman
 * Bank, Ajman Municipality) never counts against it (E10.2b's principle).
 */
const ROOMS = [
  {
    key: 'schools',
    verb: 'Learns',
    opener: 'Campuses across the Emirate — Habitat, Woodlem Park, City School, and the universities.',
    href: 'projects/schools.html',
  },
  {
    key: 'shops',
    verb: 'Shops',
    opener: 'The City Life malls, the souk built for Ajman Municipality, and the neighbourhood stores.',
    href: 'projects/malls.html',
  },
  {
    key: 'works',
    verb: 'Works',
    opener: 'Ajman Bank’s headquarters and The Black Square.',
    href: null,
  },
  {
    key: 'homes',
    verb: 'Lives',
    opener: 'From the villas at Al Zorah to the towers rising at Aamra.',
    href: 'projects/homes.html',
  },
];

/**
 * One row of a room's table (Session XXI — the merge).
 *
 * The room used to render a bare two-column name list and the ledger
 * rendered the same 47 records again as a table. They were measured to be
 * the identical four-way cut of the identical set, differing only in
 * REGISTER — so the ledger's COLUMNS moved inside the rooms and the ledger's
 * PAGE retired. This is the row that carries them: the ledger's own
 * name · district · type · year, with the type suppressed where the room
 * already says it.
 */
function roomRow(project, manifest, prefix, unsaid) {
  return rowData(project, manifest, prefix, unsaid);
}

function arrivalViewData(prefix) {
  const db = loadDb();
  const manifest = loadManifest();

  const rooms = ROOMS.map((room) => {
    const set = sectorSet(db.projects, room.key);
    return {
      roomVerb: room.verb,
      roomHref: room.href ? prefix + room.href : '',
      // the engine has {{#if}} only, so the heading-not-a-link case (works,
      // D-2) carries its own flag
      roomHrefAbsent: room.href ? '' : '1',
      roomOpener: escapeText(room.opener),
      lead: [plate(set[0], manifest, prefix)],
      rows: set.map((p) => roomRow(p, manifest, prefix, ROOM_UNSAID_NOUNS[room.key])),
    };
  });

  return {
    rooms,
    // 🔴 THE RESTING TALLY IS GONE (Mahesh, 6 Aug: "we are not giving number
    // anywhere"). It read "47 projects" and it was the last count on the
    // Work system after the ledger's chips retired with the ledger. The
    // ELEMENT survives, empty, because js/work.js writes the live search
    // result count into it — a count the reader asked for by typing is not
    // the same claim as a portfolio size printed at rest.
    mosqueHref: `${prefix}projects/alghalamosque.html`,
    searchIndexJson: searchIndexJson(db, prefix),
    ogImage: leadImage(sectorSet(db.projects, 'homes')[0], manifest, prefix).src,
  };
}

/* ------------------------------------------------------------------ *
 * THE LEDGER IS GONE (Session XXI, 6 Aug)
 *
 * `ledgerViewData` and the CHIPS table stood here and built
 * projects/list.html. Mahesh, reading the two pages side by side: the
 * arrival and the ledger "look kind of redundant". Measured, they were not
 * merely similar — they applied the IDENTICAL four-way cut (schools · shops
 * · works · homes) to the IDENTICAL 47 records, and differed in exactly one
 * datum per row, the type noun. A reader who followed "Every project, as a
 * list" passed 11,220px at 1440 to meet the same 47 records twice.
 *
 * So the ledger's COLUMNS moved into the rooms (see `roomRow`) and the
 * ledger's PAGE retired. Its chips died with it because the four rooms were
 * always the filter — 03-work §4.1 said so, and the chips were a second
 * answer to a question the page had already answered. Its sort control died
 * on the same reasoning it was built on: it served the tender reader, whose
 * persona is flagged confirm-or-retire on an unanswered question, and whom
 * the ledger failed anyway for want of a client column.
 *
 * The one thing NOT taken from it is its search index, which was always
 * shared and is built below.
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * Search — one index, both registers (03-work §4.4)
 * ------------------------------------------------------------------ */

const VERB_OF = { schools: 'learns', shops: 'shops', works: 'works', homes: 'lives', mosque: 'prays' };

/**
 * Title, verb, noun, district, summary — "school" and "learns" both find
 * the set; "Black Square" finds the building. The summary goes through
 * records.js's statement() so Lorem ipsum never becomes searchable text
 * (the homesrus gate) and the area clause stays stripped.
 */
function searchText(project, provenance) {
  const noWarn = () => {};
  return [
    project.title,
    VERB_OF[R.sectorKey(project)],
    R.SECTORS[R.sectorKey(project)].noun,
    buildingNoun(project),
    rowPlace(project),
    R.parseYear(project) || '',
    provenance || '',
    R.statement(project, noWarn),
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * 🔴 THE NOUN IS ITS OWN FIELD, not just a word in the blob (Session XXII).
 *
 * `text` is a single lowercased run of title + verb + sector noun + building
 * noun + district + year + summary, and `matches()` looks for a substring in
 * it. That is right for "black square" and wrong for a KIND, and the three
 * ways it goes wrong were all measured on the built page rather than guessed:
 *
 *   1. THE SECTOR NOUN. Every shops record carries "Malls & shops", so
 *      `mall` returned 13 — all twelve shops records plus one more — where
 *      the Mall kind is 5. Eight of those thirteen matched nothing but the
 *      sector's own name.
 *   2. THE SUMMARY PROSE. `university` returned 5, three of them because
 *      City School and the two City Lifes say they are "part of the city
 *      university campus". `tower` caught "a residential tower featuring",
 *      `showroom` caught Car Souq's "50 professional showrooms", and `mall`
 *      caught Jeddah Heights' "the extensive mall and Ajman skyline".
 *   3. THE PLURAL. A substring match cannot tell `tower` from "towers".
 *
 * So a noun query stops consulting the blob and reads this field instead —
 * `university` is 2 and `mall` is 5, which is what the room tables show.
 * The blob is untouched for every other query, so "learns", "shops" and a
 * building's own name all still find the set the way they did.
 */
function searchIndexJson(db, prefix) {
  const records = ordered(db.projects).map((p) => {
    const provenance = R.provenance(p);
    const meta = [rowPlace(p), buildingNoun(p), R.parseYear(p) || ''].filter(Boolean);
    return {
      href: `${prefix}projects/${p.slug}.html`,
      name: p.title + (provenance ? ` · ${provenance}` : ''),
      meta: meta.join(' · '),
      noun: buildingNoun(p).toLowerCase(),
      text: searchText(p, provenance),
    };
  });
  return JSON.stringify(records).replace(/<\/script/gi, '<\\/script');
}

/* ------------------------------------------------------------------ *
 * The entry point inject-partials.js calls
 * ------------------------------------------------------------------ */

function hasViewData(srcName) {
  return srcName === 'projects' || !!SECTOR_PAGES[srcName];
}

function viewData(srcName, prefix) {
  if (SECTOR_PAGES[srcName]) return sectorViewData(srcName, prefix);
  if (srcName === 'projects') return arrivalViewData(prefix);
  return {};
}

// `plate` and `leadImage` are exported for Home (build/lib/home.js), whose
// rooms show the same figure this file already derives for the Work
// surfaces. Home re-deriving it is how two surfaces start disagreeing about
// one photograph.
module.exports = { hasViewData, viewData, buildingNoun, rowPlace, searchText, plate, leadImage, image };
