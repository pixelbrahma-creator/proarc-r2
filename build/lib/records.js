'use strict';

/**
 * Everything the project page derives from a record. Screen 04
 * (`04-project.md`) decides all of it; this file is that spec in code, and
 * every rule below names the clause it implements.
 *
 * It lives apart from the generator because three of these rules — the
 * sector mapping, the location display and the year parse — are wanted by
 * the Work surfaces too, and a second implementation is how two surfaces
 * start disagreeing about the same record.
 */

const fs = require('fs');
const path = require('path');
const { resolveDistrict } = require('./districts');
// P1-b: the district tail link anchors into /ajman's ledger, whose block keys
// come from this same slugifier — one implementation, so the two cannot drift.
const { slugify } = require('./slugify');

const ROOT = path.join(__dirname, '..', '..');
const geo = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'districts.json'), 'utf8'));

/* ------------------------------------------------------------------ *
 * Sector membership (M2) — 03-work.md §3.1
 * ------------------------------------------------------------------ */

// Six Commercial records are shops by building type. The mapping is a
// DISPLAY layer: data/projects.json's `category` is untouched until ProArc
// confirms (O6, closed as M2 on 30 Jul).
const SHOPS_FROM_COMMERCIAL = [
  'marksaverashdiya', 'marksavealtallah', 'marksavealjurf',
  'homesrus', 'royalfurniture', 'carsouq',
];
const WORKS = ['ajmanbank', 'blacksquare', 'rholding'];

// `page: null` means the set has no sector page, so its records go back to
// the arrival. Offices holds three and fails the five-built rule (D-2), and
// the mosque is a name rather than a set (E10.1).
const SECTORS = {
  schools: { noun: 'Schools', more: 'More schools', page: 'projects/schools.html' },
  shops: { noun: 'Malls & shops', more: 'More malls and shops', page: 'projects/malls.html' },
  homes: { noun: 'Homes', more: 'More homes', page: 'projects/homes.html' },
  works: { noun: 'Offices', more: 'More offices', page: null },
  mosque: { noun: 'Mosque', more: null, page: null },
};

function sectorKey(project) {
  if (project.category === 'Educational') return 'schools';
  if (project.category === 'Residential') return 'homes';
  if (project.category === 'Religious') return 'mosque';
  if (project.category === 'Retail & Mixed-Use') return 'shops';
  if (SHOPS_FROM_COMMERCIAL.includes(project.slug)) return 'shops';
  if (WORKS.includes(project.slug)) return 'works';
  throw new Error(`${project.slug}: no sector for category "${project.category}" — M2 covers every record by construction, so this is a new record or a changed category.`);
}

/** The back link. Records whose set has no page read "All work" (§2.3). */
function backLink(project) {
  const sector = SECTORS[sectorKey(project)];
  return sector.page
    ? { label: sector.noun, href: sector.page }
    : { label: 'All work', href: 'projects.html' };
}

/* ------------------------------------------------------------------ *
 * Place — E10.2a, §3.2: a record always states its own place
 * ------------------------------------------------------------------ */

/**
 * "Al Jurf, Ajman" · "Ajman" · "Umm Al Quwain". District resolution is the
 * map's own X3 rule, imported rather than repeated, so the caption and the
 * mark can never disagree about where a building is.
 */
function displayLocation(project) {
  const { district, reason } = resolveDistrict(project.location, geo.districts, geo.outsideEmirate);
  if (district) return `${district}, Ajman`;
  if (reason === 'outside-emirate') {
    const token = project.location
      .split(',')
      .map((t) => t.trim())
      .find((t) => geo.outsideEmirate.includes(t.toLowerCase()));
    return token || project.location;
  }
  return 'Ajman';
}

function districtOf(project) {
  return resolveDistrict(project.location, geo.districts, geo.outsideEmirate).district;
}

/* ------------------------------------------------------------------ *
 * The specification table — §4
 * ------------------------------------------------------------------ */

function normaliseName(s) {
  return String(s)
    .replace(/\([^)]*\)/g, ' ')       // "READ (R Education and…)" -> "READ"
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ten records hold dd/mm/yyyy; fourteen hold a bare year; two hold prose. */
function parseYear(project) {
  const raw = project.year;
  if (!raw) return null;
  const dmy = /^\d{2}\/\d{2}\/(\d{4})$/.exec(raw);
  if (dmy) return dmy[1];
  if (/^\d{4}$/.test(raw)) return raw;
  return null; // "Under Proposal" · "Expected completion 2029" — §4 suppresses both
}

function sentenceCase(s) {
  const t = String(s).trim();
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/**
 * Completed-or-Status is ONE row (§4).
 *
 * One case the spec could not have anticipated and the build must not paper
 * over: a record whose status says Completed while its year field holds
 * prose is disagreeing with itself. That is `rholding` — four renders, one
 * of them a different building, and "Under Proposal" where a year belongs.
 * Printing "Status — completed" would assert as fact the half of the
 * contradiction we have the least reason to believe, so the row is
 * suppressed and the build says so. W4 resolves it.
 */
function statusRow(project, warn) {
  const year = parseYear(project);
  if (project.status === 'Completed' && year) return { label: 'Completed', value: year };
  if (project.status === 'Completed' && project.year && !year) {
    warn(`${project.slug}: status "Completed" but year reads "${project.year}" — the record contradicts itself, so the status row is suppressed (W4).`);
    return null;
  }
  if (!project.status) return null;
  if (project.status === 'Completed') return { label: 'Status', value: sentenceCase(project.status) };

  /**
   * NEVER SAY A BUILDING IS UNBUILT — Mahesh, 1 Aug 2026. This closes the
   * status-row question that had been open since build session B.
   *
   * "Under construction", "Design stage", "Under design" and "Design
   * development" are the site's only statements that a building does not
   * stand, and they appear in exactly one place: this row, on the eight
   * records that carry one. They are now suppressed, so a record in
   * progress simply shows what it does hold — client, location,
   * configuration — and the site never dates or discounts it.
   *
   * Two things deliberately NOT suppressed with it, because neither says
   * anything about the building:
   *
   *   the E9 provenance caption ("· Visualisation") is a statement about
   *   the IMAGE, and E9 exists precisely so a render never implies a
   *   building that does not exist. Removing it would break the rule this
   *   decision is otherwise consistent with.
   *
   *   the closing band's conditional ("the team behind Zamzam Tower"
   *   rather than "that delivered") avoids claiming a delivery without
   *   ever announcing the absence of one.
   */
  warn(`${project.slug}: status "${project.status}" suppressed — the site never says a building is unbuilt (Mahesh, 1 Aug).`);
  return null;
}

function specRows(project, warn) {
  const rows = [];

  // Client — suppressed when it restates the title (§4). Containment on the
  // normalised strings, not a hard-coded list of five, so a corrected
  // spelling (X2) cannot quietly resurrect a duplicate.
  if (project.client) {
    const c = normaliseName(project.client);
    const t = normaliseName(project.title);
    if (c && !(t.includes(c) || c.includes(t))) rows.push({ label: 'Client', value: project.client });
  }

  rows.push({ label: 'Location', value: displayLocation(project) });

  if (project.configuration) rows.push({ label: 'Configuration', value: project.configuration });

  // Scope: one row, shipped hidden until the field exists (v4 §9.5). No new
  // machinery — the same empty-row suppression as every other row, so 47
  // pages gain a row the day the data lands and nothing moves.
  if (project.scope) rows.push({ label: 'Scope', value: project.scope });

  const status = statusRow(project, warn);
  if (status) rows.push(status);

  // Never on this table: Built-up area (W3), Sector (E10.2 — the back link
  // and the title already say it), Code (internal; the asset-library join
  // key, retained in the data and suppressed in display).
  return rows;
}

/* ------------------------------------------------------------------ *
 * The prose — §3.1 / E10.4, and the area clause
 * ------------------------------------------------------------------ */

// "…, spanning a built-up area of 62,000 sqm." Ten educational summaries
// carry exactly this tail, and it is the same figure W3 bars from the spec
// table — so barring the ROW does not keep a contaminated area off the
// page, because the number walks in through the statement instead. The
// clause is removed at build; the data keeps ProArc's original text, which
// X1's prose pass replaces wholesale. Removing an unverified claim is the
// same class of act as §3.1's existing strip, and every removal is logged.
const AREA_CLAUSE = /,?\s*(?:spanning|covering|with)\s+a\s+(?:total\s+)?built-up area of[^.]*/i;

// `homesrus` carries Lorem ipsum in BOTH its summary and its description,
// live on the built site today. The decision is that it ships mute — a page
// with no paragraph beats a page with someone else's Latin in it (§10, W4) —
// and muting it means muting the statement too, which is where the Latin
// would otherwise land in Body Large at the top of the page.
const PLACEHOLDER_PROSE = /lorem ipsum|dolor sit amet/i;

function isPlaceholder(text) {
  return PLACEHOLDER_PROSE.test(String(text || ''));
}

function statement(project, warn) {
  const raw = String(project.summary || '').trim();
  if (!raw) return '';
  if (isPlaceholder(raw)) {
    warn(`${project.slug}: summary is Lorem ipsum — the statement is suppressed and the record ships mute (§10).`);
    return '';
  }
  const trimmed = raw.replace(AREA_CLAUSE, '').replace(/\s+\./, '.').trim();
  if (trimmed !== raw) warn(`${project.slug}: area clause removed from the statement (W3) — "${raw.slice(trimmed.length - 1)}"`);
  return trimmed;
}

function normaliseProse(s) {
  return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Prose that appears on more than one record is a mail-merge: whatever it
 * says, it is not about the building whose page it is on.
 *
 * §3.1 names the educational case — ten descriptions whose remainder, once
 * the duplicated summary is stripped, is one boilerplate paragraph — and
 * decides those pages ship statement-only. Measured across all 47, the
 * fault is three blocks, not one: the ten schools, the three Mark & Save
 * stores (a shared paragraph carrying "a monumental 25,000 sqm masterpiece"
 * and "form and function dance in perfect harmony"), and two City Life
 * malls. So the decision is implemented as the rule it is rather than as
 * the list of ten it was found on, and it covers five records the spec
 * could not have named.
 */
function sharedParagraphs(all) {
  const counts = new Map();
  all.forEach((p) => {
    // Counted AFTER the duplicate-summary strip, not before: the ten
    // schools' descriptions differ (each names its own school and area) and
    // only their remainders are identical. Counting the raw paragraph finds
    // the Mark & Save and City Life blocks and misses the case the spec
    // actually names.
    new Set(strippedBody(p).map((t) => normaliseProse(t))).forEach((k) => {
      if (k) counts.set(k, (counts.get(k) || 0) + 1);
    });
  });
  return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k));
}

/**
 * The statement is the summary, so the body drops the duplicate (E10.4).
 * 41 of 47 descriptions open with the summary word for word.
 *
 * `shared` is the set from sharedParagraphs() above; omit it and no
 * mail-merge filtering happens, which is only ever right in a unit test.
 */
function strippedBody(project) {
  const paras = (project.description || [])
    .map((p) => String(p).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((p) => !isPlaceholder(p));
  if (!paras.length) return [];

  const summary = normaliseProse(project.summary || '');
  if (!summary) return paras;

  const first = paras[0];
  if (normaliseProse(first).startsWith(summary)) {
    const remainder = first.slice(summary.length).replace(/^\s*/, '');
    return remainder ? [remainder, ...paras.slice(1)] : paras.slice(1);
  }
  return paras;
}

function bodyParagraphs(project, shared) {
  const out = strippedBody(project);
  if (!shared) return out;
  return out.filter((t) => !shared.has(normaliseProse(t)));
}

/* ------------------------------------------------------------------ *
 * The neighbours — §7
 * ------------------------------------------------------------------ */

/**
 * One relation per page, named in the block's head; first match wins.
 * Client (12) -> district (16) -> sector, rotated (19) -> suppressed (the
 * mosque, a set of one).
 *
 * The client key normalises R Select's three spellings and READ's two (X2).
 * The displayed form is the variant carrying the most capitals, then the
 * shortest — "R Select" over "R select", "READ" over "Read" — which is a
 * stand-in for the corrected list X2 will bring back.
 */
function clientKey(project) {
  return project.client ? normaliseName(project.client) : '';
}

function canonicalClient(variants) {
  return variants
    .slice()
    .sort((a, b) => {
      const caps = (s) => (s.match(/[A-Z]/g) || []).length;
      return caps(b) - caps(a) || a.length - b.length || a.localeCompare(b);
    })[0];
}

/**
 * The head is set as a MARKER at display size (P2-c, 3 Aug), so it drops a
 * trailing parenthetical expansion: "READ (R Education and Academic
 * Development)" is 51 characters and rendered FOUR lines of 84px hollow type,
 * 336px tall against a 801px rail — a legal disclosure shouted over two
 * thumbnails. Nothing is lost: the full form is the record's own `client`
 * value and still renders in the Client spec row on the same page, which is
 * where an expansion belongs.
 *
 * This strips a parenthetical; it never invents a short form. A client whose
 * name has no parenthetical is returned untouched.
 */
function markerName(name) {
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim() || name;
}

/** The rail's decided geometry: three across, one row. Not a cap on what the
 *  reader can reach — a relation with more than three carries a tail link to
 *  the surface that holds all of them (see `more` below). */
const SHOWN = 3;

/**
 * P1-b (H7, 3 Aug) — EVERY relation this record holds, not the first one.
 *
 * §7 used to read "one relation per page, first match wins". Measured, that
 * discarded 579 of 704 reachable related records and produced both faults
 * Mahesh reported: 11 short rails, and SEVEN CLOSED GROUPS whose members only
 * ever show each other (the four City Lifes, the four offices, Al Zorah,
 * Aamra, Al Jurf, Emirates City, READ). A reader inside one could not get out
 * through the rail — it was a trap, not a door.
 *
 * ORDER IS UNCHANGED — client, then district, then sector — so `relations[0]`
 * is byte-for-byte what the page shipped before, and the default view cannot
 * regress. Everything after it is new reach.
 *
 * 🔴 THREE ACROSS, NOT SIX. Mahesh asked for more where the relation is big.
 * Measured, "big" only ever means district (max 5) and sector (max 15) —
 * a client set never exceeds three, so it could never have paid. Six
 * thumbnails in two rows would be a **grid of identical cards**, which the
 * structural rules bar outright, and six of fifteen is still arbitrary
 * truncation. So a large relation keeps its three and gains a TAIL LINK to
 * the surface that already holds the whole set — the sector page, or
 * /ajman's ledger for a district. The reader reaches all fifteen, not six.
 */
function relationsFor(project, all) {
  const self = project.slug;
  const out = [];

  const ck = clientKey(project);
  if (ck) {
    const m = all.filter((p) => p.slug !== self && clientKey(p) === ck);
    if (m.length) {
      const name = markerName(canonicalClient([project, ...m].map((p) => p.client)));
      // No tail link: a client set is at most three, so there is never a rest.
      out.push({ key: 'client', label: name, head: `Also for ${name}`, members: m, more: null });
    }
  }

  const district = districtOf(project);
  if (district) {
    const m = all.filter((p) => p.slug !== self && districtOf(p) === district);
    if (m.length) {
      out.push({
        key: 'district',
        label: district,
        head: `Also in ${district}`,
        members: m,
        // The ledger is grouped by district and each block is anchored.
        more: { href: `ajman.html#district-${slugify(district)}`, label: `All of ${district}` },
      });
    }
  }

  const key = sectorKey(project);
  const sector = SECTORS[key];
  if (sector.more) {
    // Rotation by position in the set, so no two pages of a sector open on
    // the same three and a rebuild produces the same page (v4 §8.7).
    const members = all.filter((p) => sectorKey(p) === key);
    const i = members.findIndex((p) => p.slug === self);
    const rotated = [];
    for (let n = 1; n < members.length; n++) rotated.push(members[(i + n) % members.length]);
    if (rotated.length) {
      out.push({
        key: 'sector',
        label: sector.noun,
        head: sector.more,
        members: rotated,
        // `works` has no sector page under the five-built rule, and its set is
        // three, so it needs no tail link either.
        more: sector.page ? { href: sector.page, label: `All ${sector.noun.toLowerCase()}` } : null,
      });
    }
  }

  return out;
}

function neighbours(project, all) {
  const relations = relationsFor(project, all);
  if (!relations.length) return null; // the mosque: a name, not a set

  const shaped = relations.map((r) => ({
    key: r.key,
    label: r.label,
    head: r.head,
    total: r.members.length,
    records: r.members.slice(0, SHOWN),
    more: r.members.length > SHOWN ? r.more : null,
  }));

  // head/records keep the pre-P1-b shape so nothing downstream has to know
  // about relations to render the default view.
  return { relations: shaped, head: shaped[0].head, records: shaped[0].records };
}

/* ------------------------------------------------------------------ *
 * Provenance (E9) and the closing band (§9)
 * ------------------------------------------------------------------ */

/**
 * E9.4: provenance is confirmed data, never our reading. The field is
 * populated only where ProArc's own filing attests it — the five records
 * whose originals arrived under `Renders/` folders in a commit that calls
 * them render assets (00h §3). Sealine, Gateway and Zamzam ship UNLABELLED
 * until the letter comes back, which is a one-line data edit.
 */
function provenance(project) {
  return project.provenance || null;
}

/** §9: "delivered" on the 39 completed records, "behind" on the 8 that are not. */
function ctaSentence(project) {
  const verb = project.status === 'Completed' ? 'that delivered' : 'behind';
  return `Planning something similar? Talk to the team ${verb} ${project.title}.`;
}

module.exports = {
  SECTORS,
  sectorKey,
  backLink,
  displayLocation,
  districtOf,
  parseYear,
  specRows,
  statement,
  sharedParagraphs,
  bodyParagraphs,
  neighbours,
  provenance,
  ctaSentence,
};
