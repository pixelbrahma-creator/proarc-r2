'use strict';

/**
 * The district layer — one derivation, three surfaces.
 *
 * The menu overlay's constellation (09-menu §6), Home's map beat and
 * /ajman's standing map all draw the same marks. They read them from here
 * so they cannot drift apart, and so a data fix reaches all three at once.
 *
 * What is derived and what is authored:
 *
 *   derived  which records earn a mark, and how many each district holds.
 *            Straight out of data/projects.json every build. A resolved O5
 *            duplicate or a landed district changes the output; no design
 *            decision and no hand-edit is involved (09-menu §6).
 *
 *   authored the cluster centres, in data/districts.json. Placeholder until
 *            the map commission lands, and labelled as such at every
 *            surface that draws them (E7.1 — the commission supplies
 *            coastline and boundaries; the marks are the page's).
 *
 * E7.2, no mark is placed by inference: a record earns a mark only when its
 * own location string names a district. Today 28 of 47 do. The 18 that say
 * only "Ajman" and the one in Umm Al Quwain are reported by name below, so
 * the gap stays visible rather than quietly rounding to 47.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

/**
 * The data carries at least one HTML entity in a location string
 * ("Marina &amp; Creek, Ajman") — an X1/X3-class fault that dies with the
 * prose pass. Decoding here means the normaliser matches on the text a
 * reader would see, not on the markup accident.
 */
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

/**
 * X3 normalisation. A location is a comma-separated string running from the
 * most specific place to the least ("Eastern Sector, Aamra, Ajman"), so the
 * FIRST token that resolves to a known district is the record's district.
 *
 * That single rule handles every shape in the file today:
 *   "Jurf, Hamidiya, Al Zohrah, Ajman"   -> Al Jurf       (first wins; one record, one mark)
 *   "Marina Boardwalk, Al Zorah, Ajman"  -> Al Zorah      (a development inside a district)
 *   "Emirates City, Aamra, Ajman"        -> Emirates City (the more specific of the two)
 *   "Global City, Aalia, Ajman"          -> Aalia
 *   "Ajman, U.A.E"                       -> unplaced      (names no district)
 */
function resolveDistrict(location, districts, outsideEmirate) {
  if (!location) return { district: null, reason: 'no-location' };

  const tokens = decodeEntities(location)
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    const hit = districts.find((d) => d.aliases.includes(token));
    if (hit) return { district: hit.name, reason: 'district' };
  }

  const outside = tokens.some((t) => outsideEmirate.includes(t));
  return { district: null, reason: outside ? 'outside-emirate' : 'no-district' };
}

/**
 * Deterministic scatter. Math.random() would make every build differ, which
 * turns a meaningless diff into noise and a meaningful one into camouflage.
 * mulberry32 off the authored seed: same data in, same pixels out.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDistrictMarks() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const geo = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'districts.json'), 'utf8'));

  const counts = new Map(geo.districts.map((d) => [d.name, []]));
  const plainAjman = [];
  const outside = [];

  db.projects.forEach((project) => {
    const { district, reason } = resolveDistrict(project.location, geo.districts, geo.outsideEmirate);
    if (district) counts.get(district).push(project.slug);
    else if (reason === 'outside-emirate') outside.push(project.slug);
    else plainAjman.push(project.slug);
  });

  // Marks are laid down in the authored district order, then in record order
  // inside a district, so the sequence the dots animate in is stable too.
  const rand = mulberry32(geo.scatter.seed);
  const marks = [];
  geo.districts.forEach((d) => {
    const slugs = counts.get(d.name);
    slugs.forEach((slug) => {
      const x = d.centre[0] + (rand() * 2 - 1) * geo.scatter.jitterX;
      const y = d.centre[1] + (rand() * 2 - 1) * geo.scatter.jitterY;
      marks.push({ district: d.name, slug, x: Math.round(x), y: Math.round(y) });
    });
  });

  return {
    viewBox: geo.viewBox,
    radius: geo.scatter.radius,
    marks,
    districts: geo.districts.map((d) => ({
      name: d.name,
      centre: d.centre,
      count: counts.get(d.name).length,
      slugs: counts.get(d.name),
    })),
    unplaced: { plainAjman, outsideEmirate: outside },
    total: db.projects.length,
  };
}

/**
 * The constellation, as the menu overlay draws it (09-menu §6).
 *
 * It is ornament and nothing else: no labels, no links, no hit areas, no
 * counts anywhere near it (E12 — the stars are never a tally). So it is
 * hidden from assistive technology outright rather than given a label that
 * would have to state a number to be useful.
 *
 * `--dot-index` carries each mark's position in the sequence; the 34ms
 * stagger is applied in CSS (09-menu §9), so the delay arithmetic lives with
 * the rest of the motion rather than baked into the markup.
 */
function renderConstellation(data, className) {
  const circles = data.marks
    .map(
      (m, i) =>
        `<circle class="menu-dot" style="--dot-index:${i}" cx="${m.x}" cy="${m.y}" r="${data.radius}"></circle>`
    )
    .join('');

  return (
    `<svg class="${className}" viewBox="${data.viewBox}" aria-hidden="true" focusable="false" ` +
    `preserveAspectRatio="xMidYMid meet">${circles}</svg>`
  );
}

module.exports = { buildDistrictMarks, renderConstellation, resolveDistrict, decodeEntities };
