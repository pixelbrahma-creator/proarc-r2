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
const CREST = require('./crest');
const { slugify } = require('./slugify');

const ROOT = path.join(__dirname, '..', '..');

function escapeText(s) {
  return String(s).replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Attribute values need the quote too, and escapeText does not close it —
   it exists for text nodes, where a `"` is a `"`. "Marina & Creek" and
   "Malls & shops" are the values that made this necessary. */
function escapeAttr(s) {
  return escapeText(s).replace(/"/g, '&quot;');
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
    // Souk Salah led this room until the opening band shipped, and the band
    // now opens the same territory with the same photograph — the souk holds
    // three frames of one arcade from nearly one position, so no reframing
    // of it can stop the repeat. City Life, Al Khor is D1's next in the set
    // and is in Ajman, which is the whole of the 1 Aug objection to
    // citymalluaq; the souk is not lost, it leads the fold and rides the
    // quiet line. See OPEN_BAND_FRAME for the rule this belongs to.
    lead: 'citylifekhor',
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
    // The room names its frame because the band took the hero (see
    // OPEN_BAND_FRAME). A room without a `frame` takes the record's lead
    // image, exactly as every other surface on the site does.
    frame: 'gallery-02',
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
    // §5.2 excluded Seaside Hills here because the claim's photograph already
    // LINKED it and no destination repeats on this page. Board 20 retired that
    // photograph and its caption, so the reason is gone: the opening band shows
    // Seaside Hills but names nothing and links nothing. Leaving the exclusion
    // would have dropped the building from Home's words for a rule that no
    // longer applies — the quiet kind of stale that survives a green build.
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

  /* A room may NAME its frame, and the name resolves or the build stops —
     the same doctrine as OPEN_BAND_FRAME, for the same reason: an index
     slides onto a neighbouring photograph in silence when a curation
     changes, and a name cannot. Only the four image fields move; the plate's
     name, place, href and E9 provenance are the record's and are untouched.
     A named gallery frame ships alone, with no srcset — the `-md` variant
     exists for the hero only, and a one-candidate srcset would be a lie the
     browser has to parse. */
  if (room.frame) {
    const shipping = images.gallery || [];
    const rel = shipping.find((f) => f.replace(/^.*\//, '').replace(/\.webp$/, '') === room.frame);
    if (!rel) {
      throw new Error(
        `home: the ${room.key} room names ${room.frame} of ${lead.slug}, which that record does not ship. ` +
          `It ships ${shipping.length ? shipping.map((f) => f.replace(/^.*\//, '')).join(', ') : 'nothing'}.`
      );
    }
    const img = W.image(manifest, rel, lead.slug, prefix);
    plate.plateSrc = img.src;
    plate.plateSrcset = '';
    plate.plateWidth = img.width;
    plate.plateHeight = img.height;
  }

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
 * THE SECOND READING OF HOME — the client option of 3 Aug, PROMOTED to the
 * route on 4 Aug. It shipped as `index1` while it was being judged; the
 * name survives only in the punch list and in git.
 *
 * Mahesh's brief, from the client: the beat turns to paper with black type
 * and loses the drawing; it keeps the sentence, gains one line naming the
 * services, and one link. Then each room becomes a FULL-BLEED photograph
 * with a black band under it carrying the verb and the set's names.
 *
 * That last part is not a new idea — 01-home §5.2 says the four rooms ship
 * in their fallback forms and each "graduates to a full-bleed photograph
 * the day its image lands, with nothing around it restructured". This is
 * that graduation, put to the client early rather than waited for.
 *
 * WHAT IS NOT INVENTED HERE. The names are the sets in Proarc's own order,
 * the photographs are named frames of named records, and the services line
 * is READ OFF the Services page rather than retyped — see servicesLine().
 * ------------------------------------------------------------------ */

/**
 * Which photograph leads each room at full bleed.
 *
 * 🔴 RE-PICKED 4 AUG (Mahesh, on the live page: the photographs are wrong).
 * H11 note 3 left this open by design — three of the four were the room's
 * EXISTING print promoted to full bleed, deliberately, so the option
 * compared LAYOUT rather than picture editing. The layout is liked, so the
 * frames are now curated for the band they actually ship in.
 *
 * WHAT WAS WRONG, measured rather than judged. A full-bleed band is
 * ~2.86:1 (100vw × 62vh at 1440×813) and it crops VERTICALLY, so the
 * fraction of a frame that survives is `0.35 × its aspect ratio`. The four
 * that shipped were the four TALLEST frames in reach:
 *
 *   azhagarden/hero      0.77  — PORTRAIT. Keeps 27%. Three-quarters of the
 *                               photograph is thrown away and the tower is
 *                               cut off at both ends; half the band is sky.
 *   ajmanbank/gallery-02 1.43  — keeps 50%. The crop lands mid-facade: a
 *                               wall of blue glazing with no top and no
 *                               base. A texture, not a building.
 *   citylifekhor/hero    1.50  — keeps 52%. The ground plane goes entirely,
 *                               so a room about where Ajman SHOPS shows a
 *                               dark glazed box that reads as an office.
 *   cityschool/gallery-03 1.88 — the one frame near the band's own
 *                               proportion, and disqualified on the other
 *                               axis: an orange/magenta/teal panelled
 *                               facade is the loudest thing on a monochrome
 *                               site.
 *
 * SO THE RULE THIS TABLE NOW FOLLOWS, and it is the band's rule, not the
 * site's: **a full-bleed frame is chosen for its PROPORTION first.** A
 * photograph composed as a horizontal survives the crop; one composed as a
 * portrait cannot be rescued by any object-position, because the fault is
 * that there is no picture left. Then, in order: it must read as its sector
 * at a glance, it must keep a ground (the crop eats top and bottom, so a
 * building floating in sky loses both), and it must be a PHOTOGRAPH — the
 * `Visualisation` records are refused below rather than relied on here.
 *
 * WHERE THE CANDIDATES CAME FROM. Mahesh named the FEATURED SECTIONS of
 * Ravi's v1 site as the starting point, and the useful thing there is not
 * its markup but its judgement: v1's hero slider and its featured rail are
 * both full-height surfaces, so the nine records it puts in them are nine
 * records someone already judged at full bleed — citylifekhor,
 * exclusivevillas, blacksquare, edu-delhiprivate, citylifealtallah,
 * souksalah, azha-park-residences, seasidehills, edu-habitataltallah.
 * Three of this table's four picks come out of that list. (v1 is not
 * imported from and not diffed against; a list of records is not a design.)
 *
 * 🔴 A FRAME IS NAMED, NEVER INDEXED — the doctrine OPEN_BAND_FRAME states.
 * A name resolves to the photograph someone chose, or the build stops; an
 * index slides onto a neighbouring photograph in silence.
 *
 * Each pick, and what it was picked over:
 *
 *   learns — `edu-northgatebritish/gallery-05` (1920×1080, keeps 62%). The
 *   whole school in one three-quarter view, the name legible on the fascia,
 *   and a planted boundary wall that gives the frame a continuous base, so
 *   the vertical crop keeps ground rather than sky. Terracotta and grey
 *   against green: the most restrained palette in a sector whose
 *   photographs are mostly primary-coloured panels. Over `gallery-04` (the
 *   building is a thin strip in the lower third — the crop keeps mostly
 *   sky), over `edu-delhiprivate/gallery-03` (1.84 and well composed, but
 *   the same colour objection as cityschool plus a foreground of flags,
 *   bollards and road markings), and over the set's own lead
 *   `habitatschool`, whose hero is already in the opening band.
 *
 *   shops — `citylifejurf/gallery-02` (1920×948, keeps 71%). The only frame
 *   in the sector that shows SHOPS rather than a retail shed seen across a
 *   car park: a terrace of shopfronts at street level, signage, café tables
 *   and parasols, planting along the pavement. That is the room's whole
 *   claim. Over `citylifealtallah`'s three frames, each carrying a "LEASING
 *   NOW 052 6055 255" hoarding across the facade — a phone number in a
 *   full-bleed photograph is the developer-marketing register E10 rules
 *   out, and it dates the picture. Over `citylifetallah/gallery-03`, which
 *   is the widest frame on the site (2.63, keeps 92%) and is a
 *   VISUALISATION — placeholder "Tenant" fascia boards, stock figures, CGI
 *   palms — on a record that carries no provenance label. Noted for the
 *   data, not fixed here.
 *
 *   works — `blacksquare/hero` (1920×879, keeps 76%). Natively horizontal,
 *   golden hour, and the only works frame that shows the building IN Ajman:
 *   the lit gold bays, the Ramada tower beside it, the skyline running off
 *   to the right and the road along the bottom. A room under a sentence
 *   that says *Proarc has shaped how Ajman works* should show Ajman.
 *   `ajmanbank/gallery-03` is the blue tower against an empty sky with
 *   ~45% of the frame blank; `rholding` is a proposal, so its images are
 *   renders (F-1).
 *
 *   lives — `seasidehills/hero` (1920×1133, keeps 59%). A long low
 *   residential block across a lawn at golden hour: balconies, terraces and
 *   planting, composed as a horizontal, and a photograph rather than a
 *   render. The homes set is the one where that last clause does the work —
 *   `azha-park-residences` is `Visualisation`, and `exclusivevillas` and
 *   `rosetower` offer views FROM a home (a terrace, a pool, a lobby) rather
 *   than a home.
 *
 * 🔴 seasidehills appears TWICE ON THE PAGE and that is the bank's own
 * precedent, not an oversight: the opening band takes `gallery-02` and this
 * band takes the hero, so the page shows two different photographs of one
 * building. The rule is that no PHOTOGRAPH ships twice, and it is now
 * asserted by the build rather than by hand — see assertNoRepeatedFrame().
 */
const ROOMS_FULL_FRAME = {
  schools: { record: 'edu-northgatebritish', frame: 'gallery-05' },
  shops: { record: 'citylifejurf', frame: 'gallery-02' },
  works: { record: 'blacksquare' },
  homes: { record: 'seasidehills' },
};

/**
 * THE MOSQUE'S FRAME (Mahesh, 4 Aug) — the fifth full-bleed photograph.
 *
 * 🔴 THIS OVERRIDES THE CLIENT'S OWN "MOSQUE EXEMPT" INSTRUCTION, and it is
 * Mahesh's decision rather than a tidy-up. What the exemption was protecting
 * is untouched and still governs the section: A SET OF ONE HAS NO NAMES TO
 * BAND, so the mosque takes a photograph and NO names wall. It becomes a
 * fifth FRAME, not a fifth room — which is the same distinction the marker
 * made on 4 Aug, when `.ha-room__marker` became `.ha-marker` because the
 * page has five territories and only four of them are rooms.
 *
 * `gallery-02`, and the three it was picked over are all on the record:
 *
 *   hero        800×1200  ar 0.67 — PORTRAIT, and it keeps 30% of itself in
 *   the 2.215:1 cell. It is also ALREADY SPENT: it is the mosque's cell in
 *   the opening band, and assertNoRepeatedFrame() refuses it by rule rather
 *   than by memory. Both objections are decisive on their own.
 *
 *   gallery-04  1920×1024 ar 1.88 — the frontal elevation, the whole arcade
 *   of arches legible, and the strongest ARCHITECTURAL read of the four.
 *   Refused on provenance, and the refusal is MEASURED rather than judged:
 *   sample its sky across the top band of the frame and it returns **51
 *   distinct colours in 2,080 pixels** with a luminance that falls 6 units
 *   from the top of the frame towards the horizon — the wrong direction for
 *   a sky, and a range no atmosphere has. `gallery-01` is the same shoot,
 *   tighter, and worse: **11 distinct colours in 2,240 pixels**, sd (1.6,
 *   3.1, 5.7). Those two share a flat pale-lavender field that is a
 *   REPLACED sky, and a replaced sky on a record carrying no provenance
 *   label is exactly what E9.4 is for. This band is the one surface on the
 *   site permitted to run a photograph at full bleed with no label beside
 *   it (rule 8 bars the label, so the guard below refuses the image
 *   instead) — so it is the last surface that should carry a composite.
 *
 *   gallery-02  1920×1024 ar 1.88 — keeps 85%, and its sky measures **595
 *   distinct colours in 2,080 pixels**, sd (21, 34, 52), brightening 4
 *   units towards the horizon. A photograph. It reads as a mosque at a
 *   glance — minaret, crenellated parapet, teal ridge tiles, palm fronds —
 *   and it is golden-hour warm, which is the light `blacksquare` and
 *   `seasidehills` already carry two and three bands above it.
 *
 * The one thing gallery-02 gives up is the frontal arcade. That is the
 * right thing to give up: the band is evidence that the building stands,
 * not a plate of its elevation, and the record page carries all three
 * frames for a reader who wants the elevation.
 */
const MOSQUE_FULL_FRAME = { record: 'alghalamosque', frame: 'gallery-02' };

/**
 * THE SERVICES LINE IS READ OFF THE SERVICES PAGE, never retyped.
 *
 * Six names, in the order that page states them. Typed here instead, this
 * line would be the seventh copy of a list the site already publishes, and
 * the first one nothing checks — which is exactly how /careers' route
 * description kept a sentence for months after both visible surfaces
 * deleted it.
 *
 * It reads the SOURCE rather than the built page: build:pages compiles the
 * routes in meta order, so services.html may not exist yet when Home is
 * rendered, and a reader that depends on build order is a reader that works
 * until someone reorders a JSON file.
 */
function servicesLine() {
  const src = fs.readFileSync(path.join(ROOT, 'pages-src', 'services.html'), 'utf8');
  /* matchAll, for the CAPTURE. A global .match() returns whole matches and
     throws the groups away, so trimming one by hand left the delimiter on
     every name — the page shipped "Master planning<". Same family as every
     other regex-as-parser fault here: it produced a plausible string. */
  const names = [...src.matchAll(/class="sv-block__name[^"]*">([^<]+)</g)].map((m) => m[1].trim());
  if (names.length < 2) {
    throw new Error(
      'home: Home names the services, and pages-src/services.html yielded ' +
        `${names.length} of them. The line is read off that page rather than retyped, so a markup ` +
        'change there has to be followed here rather than silently shipping a shorter list.'
    );
  }
  return names.map(escapeText).join(' <span class="hm-sep">&middot;</span> ');
}

/**
 * THE ROOM'S SECTOR NAME, DERIVED FROM THE OPENING BAND — never retyped.
 *
 * "Learns / Schools and universities" (Mahesh, 4 Aug). The five sector
 * names are already authored, once, in OPEN_BAND — *Schools and
 * universities · Malls & shops · Offices · Homes · The mosque* — and a
 * second copy here would be the same fault as a retyped services line: a
 * list the page already publishes, in a copy nothing checks.
 *
 * 🔴 THE JOIN IS THE HREF, NOT THE ORDER. OPEN_BAND is keyed by zone and
 * ROOMS by room.key, and today the two run 1:1 in the same sequence — so
 * `OPEN_BAND[i].label` would work, and would silently relabel every room
 * the first time a zone is reordered or the mosque moves. The href is the
 * band's own declared join: its stated amendment is that *a band label
 * links ONLY to the destination its own section below carries*, which is
 * exactly the statement "this zone and that room are the same territory".
 * So it is matched on, and 0 or 2 matches stop the build.
 *
 * (records.js also holds a sector table with a `noun` — Schools · Malls &
 * shops · Homes. It is NOT the source here: those nouns are the Work
 * surfaces' register and they are not the band's words. The band says
 * "Schools and universities", which is the pair of cells it shows.)
 */
function bandZone(href, what) {
  const zones = OPEN_BAND.filter((z) => z.href === href);
  if (zones.length !== 1) {
    throw new Error(
      `home: Home's ${what} takes its sector name from the opening band by href, and ` +
        `"${href}" matches ${zones.length} of the band's zones rather than exactly one. ` +
        'The band and the sections below are the same five territories; if one of them moved, the label is a ' +
        'guess and a reordered band would silently relabel a section.'
    );
  }
  return zones[0];
}

function sectorLabel(href, what) {
  const zone = bandZone(href, what);
  /* 🔴 A DERIVED ZONE HAS NO SECTOR NAME TO GIVE, AND THIS THROWS RATHER THAN
     RETURNING null. The mosque's zone carries `label: null` on purpose; a
     caller that asked for it and got null would have shipped an empty label
     and a silently unnamed territory, which is exactly the class of fault the
     rest of this function exists to prevent. */
  if (zone.label === null) {
    throw new Error(
      `home: Home's ${what} asked the opening band for "${href}"'s sector name, and that zone ` +
        'has none — its label is DERIVED from the record, because a set of one has a name rather ' +
        'than a sector. Call mosqueMarkerName(db.projects) for it.'
    );
  }
  return zone.label;
}

/**
 * Every name in the set, in Proarc's order, with NO ellipsis and no total —
 * and, from 4 Aug, EVERY NAME IS A LINK.
 *
 * The ellipsis on this page means "a selection" (selectionHtml above). This
 * band is not a selection, so it does not wear one — but it is still not
 * every RECORD: O5's corroborated pairs are suppressed sitewide, so what
 * ships is every name the site prints for that sector. Saying "all fifteen"
 * anywhere near it would be false as well as barred by E12.
 *
 * 🔴 THIS AMENDS "A ROOM KEEPS EXACTLY ONE DESTINATION", and it amends it
 * the same way the opening band's labels were amended on 2 Aug rather than
 * breaking it. The shape a sweep can hold:
 *
 *   a name links ONLY to its own record, and no record is reachable twice
 *   from this page. The rooms' verbs reach the four SECTOR pages, the band's
 *   labels reach the same four plus the mosque, and the mosque is the one
 *   record any other surface links — and the mosque is in no wall, because
 *   its sector has no room. Sectors partition the records, so a name cannot
 *   appear in two walls; O5 suppression stops it appearing twice in one.
 *
 * THE CURRENT NAME — the building in the photograph above — is marked and
 * is NOT a link. It is the one name on the band whose destination the
 * reader is already looking at, and leaving it plain is also what
 * index.html does with the same word (the print's evidence name has never
 * been a link). See `.ha-name--current` in home-alt.css for why the mark is
 * weight and value rather than the hollow Mega Splash it was drafted as.
 */
function setNamesHtml(records, prefix, currentSlug) {
  let marked = 0;
  const html = records
    .map((p) => {
      const name = escapeText(p.title);
      if (p.slug === currentSlug) {
        marked++;
        return `<span class="ha-name ha-name--current">${name}</span>`;
      }
      return `<a class="ha-name" href="${prefix}projects/${p.slug}.html">${name}</a>`;
    })
    .join(' <span class="hm-sep">&middot;</span> ');

  /* The mark is the band's whole answer to "which of these am I looking
     at". Unmarked, the wall still renders — every name a link, nothing
     wrong on the page — so this is exactly the kind of fault a screenshot
     passes. It happens the moment a frame is picked from outside the room's
     own set, which is one edit away at all times. */
  if (marked !== 1) {
    throw new Error(
      `home: Home's ${currentSlug} leads a room whose names wall marks it ${marked} times rather than once. ` +
        'The photograph names a building and the wall marks that building; a frame picked from outside the ' +
        "room's own sector leaves the wall unmarked and the band silently loses its subject."
    );
  }
  return html;
}

/**
 * A FULL-BLEED FRAME: resolved by NAME, and E9-guarded — in ONE place.
 *
 * 🔴 THE GUARD WAS ON `roomFullData()` ONLY, and the mosque is not a room.
 * Extending it by copying the `if (plate.plateProvenance)` block into the
 * prays moment would have left the site's ONE surface that may run an
 * unlabelled photograph at full bleed governed by two implementations of
 * one rule — the fault this file already records twice (a sector mapping
 * derived twice, a sweep order derived twice: "one map derived twice is how
 * two surfaces start disagreeing about where a building is"). So the
 * resolution and the guard were lifted out instead, and every full-bleed
 * frame on the page now goes through this function or it does not ship.
 *
 * `what` names the surface in both error messages, because the message is
 * read by whoever changes a pick, and "Home's shops room" is a place to
 * look where "a full-bleed frame" is not.
 */
function fullBleedFrame(db, manifest, prefix, pick, what) {
  const record = findRecord(db.projects, pick.record);
  const images = manifest.projects[record.slug];
  if (!images) throw new Error(`home: ${record.slug} is not in the manifest.`);

  const plate = W.plate(record, manifest, prefix);
  if (pick.frame) {
    const shipping = images.gallery || [];
    const rel = shipping.find((f) => f.replace(/^.*\//, '').replace(/\.webp$/, '') === pick.frame);
    if (!rel) {
      throw new Error(
        `home: Home's ${what} names ${pick.frame} of ${record.slug}, which that record does not ship. ` +
          `It ships ${shipping.length ? shipping.map((f) => f.replace(/^.*\//, '')).join(', ') : 'nothing'}.`
      );
    }
    const img = W.image(manifest, rel, record.slug, prefix);
    plate.plateSrc = img.src;
    plate.plateSrcset = '';
    plate.plateWidth = img.width;
    plate.plateHeight = img.height;
  }

  /* 🔴 E9 HAS NO HOME ON THIS BAND, so a labelled image cannot ride it.
     The framed print carried its provenance in the strip beside the
     building's name; the strip's name moved into the wall on 4 Aug and the
     label has nowhere left to sit that is not ON the photograph, which
     rule 8 bars. So a render is refused rather than shipped unlabelled —
     the failure mode being prevented is the quiet one, where a
     `Visualisation` runs full-bleed as evidence of a building that stands.
     All five picks are `Completed` photographs; this fires the day one is
     swapped for a design-stage record, which is exactly when it should. */
  if (plate.plateProvenance) {
    throw new Error(
      `home: Home's ${what} leads on ${record.slug}, which is labelled "${plate.plateProvenance}". ` +
        'A full-bleed band has nowhere to carry an E9 label except on the photograph, and rule 8 bars text ' +
        'on a photograph — so this surface takes photographs only, and a render needs a decided treatment first.'
    );
  }

  return { record, plate };
}

function roomFullData(db, manifest, prefix, room) {
  const set = selectableSet(db.projects, room);
  const pick = ROOMS_FULL_FRAME[room.key];
  if (!pick) throw new Error(`home: Home has no full-bleed frame for the ${room.key} room.`);

  const { record, plate } = fullBleedFrame(db, manifest, prefix, pick, `${room.key} room`);

  return {
    roomVerb: room.verb,
    roomHref: prefix + room.href,
    roomSector: escapeText(sectorLabel(room.href, `the ${room.key} room`)),
    // The photograph carries NO words — rule 8. `roomEvidence` is now the
    // image's alt text alone: the name it used to print in the strip is the
    // marked name in the wall below, where it is one word rather than two.
    roomEvidence: escapeText(record.title),
    fullSrc: plate.plateSrc,
    fullSrcset: plate.plateSrcset,
    fullWidth: plate.plateWidth,
    fullHeight: plate.plateHeight,
    roomFrame: plate.plateSrc,
    roomNamesHtml: setNamesHtml(set, prefix, record.slug),
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
 * 🔴 THE SHORELINE IS BACK, AND THAT REVERSES HALF OF THIS NOTE (5 Aug).
 * It used to read "no coastline, no boundaries, no joining lines" — Option B
 * was the marks and nothing else. That was written when NO coast existed
 * anywhere on the site, so B was not a preference, it was the only thing
 * there was: § 6.1's Option A had always been the drawn one, with B as the
 * contractual fallback "if the commissioned artwork is not excellent by
 * launch". A rough shoreline was drawn in house on 4 Aug and the creek
 * joined it on 5 Aug, so the fallback's condition no longer holds.
 *
 * And the ask settles it either way: Mahesh asked for this band in order to
 * SHOW the creek. Bare dots do not read as Ajman — that is exactly what the
 * first build of this band looked like, and looking at it is how the missing
 * half was found. The coast comes from districts.js, the same source /ajman
 * draws, because one map derived twice is how two surfaces start disagreeing
 * about where the water is.
 *
 * B's remaining price is still /ajman's to pay: no district polygons here,
 * so no district interaction and no hit layer.
 *
 * No labels either, and that half of the note STANDS. E7.1 puts labels at a
 * true 12px, and ten of them on a field this size — with no ledger beneath
 * to answer them — is a scatter of words, not a map. It also gives the two
 * surfaces a clean division of labour on the FIELD itself.
 *
 * 🔴 THE WIDER CLAUSE — "Home shows the SHAPE, /ajman names it" — WAS RETIRED
 * ON 8 AUG (Mahesh: "yes, change that rule"). It was locked in v1.3, so the
 * amendment carries his signature and lives in 00-Design-Continuity.md. What
 * survives is the half about the DRAWING: no names are set on the field, and
 * the ten that now ship sit in a column beside it. The old sentence also
 * ended "the link line is the caption", and that link line had been deleted
 * a day before this comment was read.
 */
/* THE MAGNITUDE (Mahesh, 5 Aug): "xxxxxx million square meters of living
   space in Ajman and around — give a random figure now, we can get the actual
   from client."
 *
 * 🔴 E12'S THIRD DOOR, TAKEN — BY MAHESH, IN HIS OWN WORDS, ON 6 AUG 2026.
 * *"Make the text '420000 sqm living space in Ajman and around it'"*, and,
 * asked which figure he meant, he confirmed the shipped 4,200,000 m².
 *
 * This is the amendment 01-home.md § 6.1 recorded as open and REFUSED to take
 * by delegation. Three shapes were put to him on 5 Aug — the magnitude in the
 * DRAWING, the figure in the RECORD register, or E12 amended with a named
 * exemption — and he delegated the choice, so the record was taken and the
 * third door was left shut on the explicit grounds that *a guideline revision
 * needs his own signature and a delegation is not one*. He has now signed it
 * himself. The exemption is NAMED and it is exactly one element wide:
 *
 *     E12 exemption 4 — Home's map band states its magnitude in its own
 *     heading. `.hm-map__head`, and no other display prose on any surface.
 *
 * `sweep-home`'s digit audit is what holds that boundary: it excluded the
 * record table by name and now excludes the head by name, so the figure is
 * still permitted in exactly one place and a quantity anywhere else on Home
 * still fails the board.
 *
 * 🔴 THE FIGURE IS PROVISIONAL AND AWAITS PROARC'S OWN NUMBER. Replacing it is
 * a one-line change here and nothing else on the site.
 *
 * 📌 THIS DIRECTORY SHIPS WITH THE SITE — the repository root is what the host
 * serves, so this file is fetchable. The status of the figure, the marker that
 * used to render beneath it and the instruction that removed it are recorded
 * in the PRIVATE spec (01-home.md § 6.1) and not restated here. `_bmad/` is a
 * separate, git-excluded repository; build/ is not. */
const LIVING_SPACE = {
  /* The figure leads and the original cadence survives behind it — the comma
     after "living space" is § 6.1's, kept so the sentence still lands on the
     place rather than on the number. Grouped, with the unit, not spelled and
     not rounded into prose ("over four million"): a spelled quantity is the
     thing E12 bars wearing a different coat, and `sweep-home` tests for it
     separately from the digit audit. */
  label: '4,200,000 m² of living space, in Ajman and around it',
};

function livingSpaceData() {
  return {
    livingSpaceLabel: escapeText(LIVING_SPACE.label),
  };
}

function mapData(projects, prefix, manifest) {
  const marks = D.buildDistrictMarks();

  // E7.3 — a spatial sweep, west to east. The sort lives in districts.js
  // because /ajman sweeps the same marks, and one map derived twice is how
  // two surfaces start disagreeing about where a building is.
  const swept = D.sweepOrder(marks.marks);

  /* The circles are generated rather than looped in the page source: the
     only per-mark value is its index (the 34ms stagger reads it in CSS),
     and an index is data, not a style. pages-src carries no inline style
     attributes — the districts.js constellation sets the same precedent.

     `data-district` is what lets a mark take the hovered state with its own
     cluster (Mahesh, 6 Aug). It is the mark's DISTRICT and not its record:
     the reader is pointing at an area, and lighting one dot of six inside the
     area they are pointing at would answer a question nobody asked. */
  const circles = swept
    .map(
      (m, i) =>
        `<circle class="hm-mark" style="--mark-index:${i}" data-district="${slugify(m.district)}" ` +
        `data-slug="${escapeAttr(m.slug)}" cx="${m.x}" cy="${m.y}" r="5"></circle>`
    )
    .join('');

  /* The shoreline is FIRST in the svg, as it is on /ajman, and for the same
     reason: SVG paints in document order and the coast is ground — the marks
     are the argument and nothing may sit on top of them.

     IT DOES NOT DRAW, AND THAT IS A DECISION RATHER THAN A SHORTCUT. /ajman
     wipes the coast on and then staggers the marks behind it, timed off
     `--coast-draw`. Here the land is simply present and the records arrive on
     it, which is the truer order for a band whose whole sentence is where
     these buildings stand — and it means Home needs no `--coast-length`, no
     second dash pipeline, and no way for the dots to beat the ground onto the
     page. A map with no coast in its data still builds; this is an addition
     to the drawing, never a precondition for it. */
  const coast = marks.coast
    ? `<path class="hm-coast" d="${marks.coast.path}" fill="none"></path>`
    : '';

  /* THE MAP ANSWERS BACK WITH A BUILDING (Mahesh, 8 Aug): *"can each dot
   * beautifully show thumbnail of that project, with small caption … and on
   * click goes to that project specific page? on mobile touch on a dot can do
   * the same thing?"* — and, granting the freedom the second half needed,
   * *"in mobile it need not be exact."*
   *
   * 🔴 SO THERE ARE TWO PARTITIONS AND THE BREAKPOINT BETWEEN THEM IS
   * MEASURED, NOT STYLED. Above 1024 the pointer resolves to a MARK; below it
   * the pointer resolves to a DISTRICT. The reason is in districts.js's
   * markRegions(): the per-mark cells run 12.4px inscribed at the 320 render
   * against a 44px minimum target and 17 of 28 fail it, because
   * scatter.minSeparation was chosen so two marks stay COUNTABLE and a floor
   * for countability is 3.9x under a floor for targeting. The district cells
   * clear 44px at every width. Neither partition is a preference and neither
   * can do the other's job.
   *
   * 🔴 NO PROJECT NAME IS VISIBLE TEXT IN THIS BUILD, AND THAT IS ARCHITECTURE
   * RATHER THAN TASTE. The card is ONE element, populated by script from these
   * data attributes. Shipping 28 names as markup would print "G+8 Floor +
   * Penthouse" into the band — a digit, which sweep-home's E12 audit fails
   * outside the head — and would put every name on the page a second time,
   * which the "no building is named twice anywhere on the page" assertion
   * fails against the four rooms above. Both are avoided by never rendering
   * the names, not by widening either assertion.
   *
   * 🔴 THE ?q= HREFS ARE PERCENT-ENCODED AND THAT IS LOAD-BEARING. work.js
   * reads the query with /[?&]q=([^&]*)/, so a RAW ampersand terminates the
   * match: "?q=Marina & Creek" fills the field with "Marina " and returns two
   * records instead of one. A reader who types never hits this because
   * writeQuery() encodes; a build-authored href gets no such treatment.
   *
   * THE REGIONS ARE REAL LINKS. A cross-document move only a script can make
   * is a link pretending not to be one, and it is also the whole no-JS story:
   * with no script a district region still reaches its filtered set on
   * /projects and a mark region still reaches its own record page.
   * `tabindex="-1"` keeps them out of the tab order — the svg is aria-hidden,
   * and the roll call below carries the keyboard's doors in text. */
  const bySlug = new Map(projects.map((r) => [r.slug, r]));
  const images = (manifest && manifest.projects) || {};

  const markHits = D.markRegions(marks)
    .map((r) => {
      const record = bySlug.get(r.slug);
      if (!record) {
        throw new Error(
          `home: the map places a mark for "${r.slug}" and data/projects.json holds no such ` +
            'record. A mark with no record cannot be named, and E7.2 places no mark by ' +
            'inference — so this is a renamed slug or a deleted record, not a missing caption.'
        );
      }
      const thumb = (images[r.slug] || {}).thumb;
      if (!thumb) {
        throw new Error(
          `home: "${r.slug}" has a mark and no thumb in images/manifest.json, so its card would ` +
            'open empty. The manifest is keyed by SLUG — imagePrefix is an ingest key and names ' +
            'no output path.'
        );
      }
      return (
        `<a class="hm-hit hm-hit--mark" href="${prefix}projects/${r.slug}.html" tabindex="-1" ` +
        `data-slug="${escapeAttr(r.slug)}" data-district="${slugify(r.district)}" ` +
        `data-name="${escapeAttr(record.title)}" data-noun="${escapeAttr(W.buildingNoun(record))}" ` +
        `data-place="${escapeAttr(r.district)}" data-thumb="${escapeAttr(prefix + thumb)}">` +
        `<path fill="none" pointer-events="all" ` +
        `d="M${r.points.map((pt) => `${pt[0]} ${pt[1]}`).join('L')}Z"></path></a>`
      );
    })
    .join('');

  const districtHits = D.districtRegions(marks)
    .map((r) => {
      return (
        `<a class="hm-hit hm-hit--district" href="${prefix}projects.html?q=${encodeURIComponent(r.name)}" ` +
        `tabindex="-1" data-district="${slugify(r.name)}" data-place="${escapeAttr(r.name)}">` +
        `<path fill="none" pointer-events="all" ` +
        `d="M${r.points.map((pt) => `${pt[0]} ${pt[1]}`).join('L')}Z"></path></a>`
      );
    })
    .join('');

  /* THE ROLL CALL — the ten district names, in text, as the keyboard's and
     the screen reader's doors. Mahesh, 8 Aug, on being told this retires the
     locked v1.3 clause "Home shows the SHAPE, /ajman names it": *"yes, change
     that rule."* It is recorded in 00-Design-Continuity.md, not here.

     NO COUNTS, on his instruction: *"these are selected works .. so putting a
     number to it doesn't make sense."* E12.1 already says the same thing —
     where a quantity was doing work, a name does it.

     The order is the districts' authored order, which is the order the marks
     were laid down in, so the list and the drawing cannot drift apart. */
  const rollCall = D.districtRegions(marks)
    .map(
      (r) =>
        `<li class="hm-roll__item"><a class="hm-roll__link" ` +
        `href="${prefix}projects.html?q=${encodeURIComponent(r.name)}" ` +
        `data-district="${slugify(r.name)}">${escapeText(r.name)}</a></li>`
    )
    .join('');

  return {
    mapViewBox: marks.viewBox,
    mapCoastHtml: coast,
    mapMarksHtml: circles,
    mapHitsHtml: districtHits + markHits,
    mapRollCallHtml: rollCall,
    mapMarkCount: swept.length,
  };
}

/* ------------------------------------------------------------------ *
 * The opening band — five territories, six photographs, one proportion
 * ------------------------------------------------------------------ */

/**
 * Board 20 rev 7 (Mahesh, 2 Aug). The opening screen is the sentence and,
 * anchored to the fold beneath it, a full-bleed band that shows what the
 * sentence's five verbs are about. It replaces the paper claim and the single
 * at-tier photograph, which was cut by the fold at every width.
 *
 * **This is a curation, not a derivation**, which is why the table is authored
 * here rather than computed: which frame of a record leads the band is a
 * judgement about a 222px cell, and it is not the judgement that picked the
 * record's own lead image. Three of the six are NOT the record's hero — a hero
 * is chosen to be a hero (wide, establishing, room for type over it) and none
 * of that survives at this size. The crop centres live beside them in
 * `home.css` as `object-position`, because a value that positions ink is a
 * style value; the reasoning for each is in `00t-Chisel-Punch-List.md` H2-f.
 *
 * **E3.6 permits the band, on both of its conditions rather than one**: every
 * cell shares one proportion (4:5) AND an art-directed crop exists per record.
 * Nothing is set on any of these photographs, so §1.5's panel and scrim are
 * not needed and no contrast measurement is owed.
 *
 * The labels are NOT links. Every destination they would reach is already the
 * one link of a section below (the page's rule is that no destination repeats),
 * and Offices has no page at all under the five-built rule — three records mint
 * no sector page. The band shows; the rooms below navigate.
 */
/*
 * THE LABELS ARE LINKS — decided by Mahesh, 2 Aug, amending the 29 Jul lock.
 *
 * The band shipped with inert labels because every destination they would
 * reach is already the one link of a section below, and the page's rule was
 * that no destination repeats. That rule is now amended rather than broken,
 * and the amendment has a shape a sweep can hold:
 *
 *   a band label links ONLY to the destination its own section below
 *   carries, so the band is a second route to the same five places and
 *   never a sixth destination. Every href here MUST appear below; nothing
 *   on the page may be reached three times.
 *
 * This is the second amendment to the one-link lock (the practice beat's two
 * doors were the first) and it is the larger of the two, so it is bounded by
 * three assertions in sweep-home.js rather than the beat's two.
 *
 * 🔴 OFFICES IS INTERIM. Its label points at the arrival, which is where the
 * works room's verb goes today, because `/projects/offices` cannot be built:
 * the exhibition anatomy spends three records on photographs and takes its
 * catalogue from `set.slice(3)`, so a three-record set leaves the catalogue
 * empty — which is why work.js throws below four. One href changes here when
 * that anatomy is decided.
 */
/* 🔴 THE UNIVERSITY CELL IS `edu-cityuniversity`, NOT `cityuniversity` (3 Aug,
   Mahesh: not happy with the tile). Both records are a City University and
   they are O5's own pair — the letter asks whether they are one building or
   two. Nothing about that question is settled by this cell, because the band
   prints no names: it chooses a PHOTOGRAPH, and the two records' libraries
   are not equally good.

   The kept twin's frames are: the hero and gallery-02, which are the same
   entrance under the same orange fascia with bollards and a parked car;
   gallery-03, a white pergola that reads as a shaded walk rather than as a
   university; and gallery-04, an evening aerial that reads as a render.
   `edu-cityuniversity/gallery-02` is the symmetrical academic block with its
   lawn — no signage, no cars, no dead ground, and it says *university* at
   tile scale, which is the whole job of a cell under a label that says
   "and universities".

   Two things to know rather than to fix. The record is the second-of-pair
   that O5_SECOND_OF_PAIR suppresses from the Learns wall — no word is
   printed twice, because a band cell prints no word at all. And the letter's
   list C asks whether this record's LEAD image is a photograph or a render;
   gallery-02 is not that frame, and it carries the shadow falloff, kerbs and
   planting of a photograph. If the answer comes back "render", this cell
   changes with every other frame of that record. */
/**
 * 🔴 THE MARKER IS THE BUILDING'S OWN NAME, NOT THE TERRITORY'S — Mahesh,
 * Session XXXV: "make The Mosque to the name of mosque itself."
 *
 * The four rooms are SETS and a set takes a sector name. This is a set of
 * one, and a set of one has a name. So the fifth marker stops being the
 * odd one out twice over — it was the only marker that named no building
 * while standing over a photograph of exactly one.
 *
 * NOTHING IS TYPED, WHICH IS THE POINT THE OLD DERIVATION WAS MAKING. The
 * zone is still resolved FIRST and still by href, so a reordered opening
 * band fails here exactly as loudly as it did when the label came from the
 * zone; only the string taken is different. The band keeps "The mosque" —
 * it names territories, and there the fifth is a territory like the rest.
 */
function mosqueMarkerName(projects) {
  const href = 'projects/alghalamosque.html';
  bandZone(href, 'the prays moment');
  const slug = href.replace(/^projects\//, '').replace(/\.html$/, '');
  const record = findRecord(projects, slug);
  if (!record || !record.title) {
    throw new Error(
      `home: the prays moment's marker is data/projects.json's own title for "${slug}", ` +
        'and no such record carries one. The marker is derived, never authored.'
    );
  }
  return record.title;
}

const OPEN_BAND = [
  { label: 'Schools and universities', href: 'projects/schools.html', pair: true, cells: ['habitatschool', 'edu-cityuniversity'] },
  { label: 'Malls & shops', href: 'projects/malls.html', cells: ['souksalah'] },
  { label: 'Offices', href: 'projects.html', cells: ['ajmanbank'] },
  { label: 'Homes', href: 'projects/homes.html', cells: ['seasidehills'] },
  /* 🔴 THE FIFTH ZONE'S LABEL IS DERIVED, NOT TYPED (Mahesh, 9 Aug, Session
     XXXVI: rename it here as well). The four above are SETS and take a sector
     name — that is what the band's words are. This is a set of one, and a set
     of one has a name, so its label is the record's own title and `null` here
     is the assertion that nobody may type it. Same source as the prays
     moment's marker, which is the point: the band and the beat six screens
     down now say the same word because they READ the same word, not because
     two strings were kept in step by hand. */
  { label: null, href: 'projects/alghalamosque.html', cells: ['alghalamosque'] },
];

/**
 * Which frame of each record leads the band: the hero, or a gallery slot.
 *
 * NO PHOTOGRAPH SHIPS TWICE ON THIS PAGE. The band and the rooms below draw
 * from the same 47 records, and nothing was watching the overlap: the first
 * build put `souksalah/hero` and `ajmanbank/hero` in BOTH surfaces, so nine
 * image slots carried seven frames and a reader met the souk and the bank
 * twice, once cropped. The fix is split across the two surfaces on one rule
 * — the FOLD keeps the strongest frame, because it is the page's first
 * image of that territory:
 *
 *   Offices — the band moves to `gallery-02`, the daylight tower read
 *   (mass 0.121–0.723, so its centre is 0.42 — the same derivation the
 *   rev-7 crop pass used on the hero). The works room keeps the hero,
 *   which is the set's D1 lead. `gallery-04` was tested and rejected: it
 *   is the podium, and a red retail hoarding of promotional posters runs
 *   across its bottom third — the habitat fault (a mundane foreground at
 *   223px), with a colour intrusion on top of it. `gallery-03` is the
 *   hero's own dusk angle plus the same hoarding, so it defeats the point.
 *
 *   Malls & shops — souksalah holds THREE frames of one arcade from nearly
 *   one position, so no frame of it can stop the repeat. The ROOM moves
 *   instead, to `citylifekhor`: D1's next in the set, in Ajman (which is
 *   what ruled `citymalluaq` out, not the set's order), and a dusk exterior
 *   that reads as a mall where the souk's interior corridor does not.
 */
/* 🔴 A SLOT IS NAMED, NEVER INDEXED (3 Aug, H8-c). This map held INDICES
   into the manifest's shipping list — `{ gallery: 2 }` — which is the exact
   fault `build/lib/images.js` was rewritten to abolish, surviving in a
   second surface that its rewrite never reached. It fired the first time a
   curation changed: habitatschool dropped one frame, index 2 stopped
   existing, and the build refused.

   Refusing was right, and it is also the mild version. Had the record
   dropped a LATER slot instead, index 2 would still have resolved — onto a
   different photograph, silently, with no error and no probe to catch it.
   A name cannot do that: it resolves to the frame someone chose, or it
   throws.

   habitatschool now takes its HERO, and the band does not change: the frame
   it used to name (gallery-04) was the hero's own near-twin, which is why
   the record dropped it. */
/* 🔴 THE BANK'S TWO FRAMES ARE SWAPPED (3 Aug, Mahesh: not happy with the
   tile). The band held `gallery-02` and the works room held the hero, and
   that is the wrong way round by this file's own stated rule — THE FOLD
   KEEPS THE STRONGEST FRAME, because it is the page's first image of that
   territory. gallery-02 is the daylight tower read with a row of parked cars
   across its bottom edge, and in a 4:5 cell they cannot be cropped out: a
   landscape frame in a portrait cell overflows HORIZONTALLY, so the whole
   height ships and `object-position` chooses left-to-right and nothing else.
   The hero is the same building with sky where the car park was.

   The room takes gallery-02 in exchange, where a wide print at a quieter
   place on the page carries the cars without trouble. Nothing is added and
   nothing is lost: the two surfaces still show two different photographs of
   one building, which is the rule this swap was always serving. */
const OPEN_BAND_FRAME = {
  habitatschool: 'hero',
  'edu-cityuniversity': { gallery: 'gallery-02' },
  souksalah: 'hero',
  ajmanbank: 'hero',
  seasidehills: { gallery: 'gallery-02' },
  alghalamosque: 'hero',
};

function openBandCell(db, manifest, prefix, slug) {
  const record = findRecord(db.projects, slug);
  const images = manifest.projects[slug];
  if (!images) throw new Error(`home: ${slug} is not in the manifest.`);

  const pick = OPEN_BAND_FRAME[slug];
  let rel;
  if (pick === 'hero') {
    rel = images.hero;
  } else {
    const shipping = images.gallery || [];
    rel = shipping.find((f) => f.replace(/^.*\//, '').replace(/\.webp$/, '') === pick.gallery);
    if (!rel) {
      throw new Error(
        `home: the opening band names ${pick.gallery} of ${slug}, which that record does not ship. ` +
          `It ships ${shipping.length ? shipping.map((f) => f.replace(/^.*\//, '')).join(', ') : 'nothing'}. ` +
          'Either the curation dropped it (data/projects.json images.gallery) or the name is wrong — ' +
          'a band frame names a photograph, so a missing one stops the build rather than sliding onto its neighbour.'
      );
    }
  }

  const img = W.image(manifest, rel, slug, prefix);
  return {
    src: img.src,
    html:
      `<figure class="hm-open__cell"><img class="hm-open__img hm-open__img--${slug}" ` +
      `src="${img.src}" width="${img.width}" height="${img.height}" ` +
      `alt="${escapeText(record.title)}" fetchpriority="high" decoding="async"></figure>`,
  };
}

/**
 * `seen` is an out-parameter, and it exists so the band's frames can be
 * compared with the rooms' without resolving either of them twice — a
 * second resolution is how two surfaces start disagreeing about which
 * photograph they hold, which is the fault this whole file keeps recording.
 */
function openBandHtml(db, manifest, prefix, seen) {
  return OPEN_BAND.map((zone) => {
    const cells = zone.cells
      .map((slug) => {
        const cell = openBandCell(db, manifest, prefix, slug);
        if (seen) seen.push(cell.src);
        return cell.html;
      })
      .join('');
    const cls = zone.pair ? 'hm-open__zone hm-open__zone--pair' : 'hm-open__zone';
    /* The label keeps its own register — 12px, 700, uppercase — and takes
       the site's black-ground link idiom on top of it: a drawn rule that
       thickens, never a colour and never an arrow. Five arrows across the
       fold would make the band a menu, which is the reading Board 20's
       frame removed when it dropped them. */
    /* A null label is the DERIVED one — resolved here from the record's own
       title, through the same function the prays moment's marker uses, so the
       two can never drift. */
    const label = zone.label === null ? mosqueMarkerName(db.projects) : zone.label;
    return (
      `<div class="${cls}"><div class="hm-open__cells">${cells}</div>` +
      `<p class="hm-open__label"><a class="hm-open__labellink" href="${prefix}${zone.href}">` +
      `${escapeText(label)}</a></p></div>`
    );
  }).join('');
}

/* ------------------------------------------------------------------ *
 * The page
 * ------------------------------------------------------------------ */

/**
 * NO PHOTOGRAPH SHIPS TWICE ON THE PAGE, asserted rather than remembered.
 *
 * The rule is stated in OPEN_BAND_FRAME and it was enforced for index.html
 * by `sweep-home.js` — which is Home's sweep, so the option inherited the
 * rule and none of the checking (H11 note 2). Both surfaces draw from the
 * same 47 records and the overlap has already fired once: the first index
 * build put `souksalah/hero` and `ajmanbank/hero` in the band AND in the
 * rooms, so nine slots carried seven frames.
 *
 * It compares RESOLVED SOURCES, not slugs. A record may legitimately appear
 * on both surfaces in two different frames — seasidehills does, and the
 * bank did before it — so a slug comparison would refuse the arrangement
 * the rule was written to permit.
 *
 * 🔴 IT COVERS FIVE SECTIONS FROM 4 AUG, not four. The mosque's own frame
 * is the case the rule was most likely to be broken on: the record's HERO
 * is the obvious pick for its section AND is already the band's mosque
 * cell, so the one photograph a reader has certainly already seen is the
 * one a picker reaches for first. A guard that stopped at the rooms would
 * have said nothing.
 */
function assertNoRepeatedFrame(bandSrcs, sectionSrcs) {
  const counts = new Map();
  bandSrcs.concat(sectionSrcs).forEach((src) => counts.set(src, (counts.get(src) || 0) + 1));
  const repeated = [...counts.entries()].filter(([, n]) => n > 1).map(([src]) => src);
  if (repeated.length) {
    throw new Error(
      `home: Home ships ${repeated.length} photograph(s) twice — ${repeated.join(', ')}. ` +
        'The opening band and the five full-bleed sections draw from the same 47 records, and a reader who ' +
        'meets one building twice on one page (once cropped) reads it as a site with six photographs. ' +
        'Move the SECTION, not the band: the fold keeps the strongest frame.'
    );
  }
}

/**
 * `srcName` is the route. It carried TWO readings of Home while `index1` was
 * a live option, so the option could take Home's data and state only its
 * differences — an option that re-derives them is an option whose differences
 * stop being legible.
 *
 * 🔴 THE OPTION WAS PROMOTED (4 Aug) AND THE GATE IS GONE WITH IT. It read
 * `if (srcName === 'index1')`, and the promotion moved the source to
 * `index.html` — so the branch simply stopped firing and the build **shipped
 * Home missing four of its five bands and an empty services line, with no
 * error**. Nothing threw because every guard inside the branch guards the
 * data it builds, and an unbuilt branch has no data to guard. The page's own
 * probe caught it (0 rooms, 1 frame of 5). A reading keyed on a FILENAME
 * cannot survive the file being renamed; there is one Home now, and this is
 * unconditional.
 *
 * `crestHtml`, `rooms` and the map are the replaced reading's data and no
 * placeholder consumes them any more. They are left computed rather than
 * deleted here on purpose — the delete pass runs last, behind a liveness
 * manifest, not as a side effect of a promotion.
 */
function viewData(prefix, srcName) {
  const db = loadDb();
  const manifest = loadManifest();

  const seaside = findRecord(db.projects, 'seasidehills');
  const hero = W.plate(seaside, manifest, prefix);
  const map = mapData(db.projects, prefix, manifest);

  const bandSrcs = [];
  const bandHtml = openBandHtml(db, manifest, prefix, bandSrcs);

  const roomsFull = ROOMS.map((room) => roomFullData(db, manifest, prefix, room));
  const mosque = fullBleedFrame(db, manifest, prefix, MOSQUE_FULL_FRAME, 'prays moment');
  assertNoRepeatedFrame(bandSrcs, roomsFull.map((r) => r.roomFrame).concat([mosque.plate.plateSrc]));
  const alt = {
    servicesLine: servicesLine(),
    roomsFull,
    /* THE PRAYS MOMENT TAKES THE MARKER TOO (Mahesh, 4 Aug: make this
       section look better).

       The mosque stays EXEMPT from the room pattern, which is the client's
       own instruction and is right — a set of one has no names to band and
       no second building to photograph. What it was NOT exempt from is
       being the sentence's fifth verb: after four bands each carrying a
       photograph, an 84px marker and a wall of names, "And prays." arrived
       as two lines of text inside 562px of black, and the page's five verbs
       stopped reading as five.

       The marker is the same object as the rooms', derived the same way,
       from the band's OWN fifth zone — the one labelled "The mosque",
       whose href is the very link this section carries. Nothing is typed
       and nothing is invented; the territory that has been named four
       times gets named a fifth. */
    mosqueSector: escapeText(mosqueMarkerName(db.projects)),

    /* THE MOSQUE GETS A PHOTOGRAPH (Mahesh, 4 Aug) — see
       MOSQUE_FULL_FRAME for the frame and for what it was picked over.
       The section keeps its exemption from the ROOM pattern in the one
       place that mattered: there is no names wall here, because a set of
       one has no names to band. What it stops being exempt from is the
       page's own evidence rule — four verbs each stood on a photograph
       and the fifth stood on nothing. */
    mosqueFullSrc: mosque.plate.plateSrc,
    mosqueFullWidth: mosque.plate.plateWidth,
    mosqueFullHeight: mosque.plate.plateHeight,
    // Rule 8 again: the photograph carries no words, so this is the alt
    // text alone. The visible name is the line's own link, below it.
    mosqueEvidence: escapeText(mosque.record.title),
};

  return Object.assign(
    {
      // The opening band. `hero` below is no longer a section of the page —
      // the single at-tier photograph was retired at Board 20 — and survives
      // only as the page's Open Graph image.
      openBandHtml: bandHtml,

      // The second beat's mark — 47 courses, five widths, one datum, all of
      // it read off the records. See build/lib/crest.js for what it draws
      // and, as importantly, what it refuses to draw.
      crestHtml: CREST.markup(db.projects),

      rooms: ROOMS.map((room) => roomData(db, manifest, prefix, room)),

      mosqueHref: `${prefix}projects/alghalamosque.html`,
      aboutHref: `${prefix}about.html`,
      servicesHref: `${prefix}services.html`,
      ajmanHref: `${prefix}ajman.html`,
      contactHref: `${prefix}contact.html`,

      ogImage: hero.plateSrc,
    },
    map,
    livingSpaceData(),
    alt
  );
}

function hasViewData(srcName) {
  return srcName === 'index';
}

module.exports = { hasViewData, viewData, selectionHtml, mapData, O5_SECOND_OF_PAIR };
