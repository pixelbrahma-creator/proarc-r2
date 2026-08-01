'use strict';

/**
 * The client wall on About — Screen 07.
 *
 * Spec: `_bmad/wds/D-UX-Design/07-about.md` §5. Presentation inherited
 * decided from `05-ajman.md` §6.3. The page's words live in
 * `pages-src/about.html`; this file supplies only the wall.
 *
 * IT DERIVES NOTHING. Twenty-eight of the thirty-two rows have no record
 * behind them — Ajman Sewerage and FEWA have no building among the 47 at
 * all — so there is nothing in `projects.json` to derive a wall from. The
 * membership is authored in `data/clients.json` and this file's whole job
 * is to refuse to build a wall that disagrees with the rest of the site:
 *
 *   A ROW WITHOUT A MARK IS NOT A ROW. §1.5a rule 2 bars typesetting a
 *   client's name in place of their mark, so a client with no artwork has
 *   no row — that is why the 13 typeset names come off, and why Khazna
 *   cannot appear under any X5 or X11 outcome. A `file` naming artwork
 *   that is not on disk THROWS rather than rendering a broken image where
 *   a trademark should be.
 *
 *   EVERY LOGO FILE IS ACCOUNTED FOR. The 34 files are either shipped or
 *   listed in `notShipped` with a reason. A new mark dropped into
 *   images/logos/ fails this build instead of being silently left off the
 *   wall, and a deleted one fails it instead of leaving a hole.
 *
 *   A RELATION NAMES A RECORD THE SITE HOLDS. The four relation strings
 *   must match a `projects.json` title exactly. The wall is a credibility
 *   surface on a page whose argument is the wall; naming a building the
 *   site cannot show is the one way it could damage the thing it exists
 *   to support.
 *
 *   THE PROVISIONAL PLACEMENTS STAY VISIBLE. AIMS Group, BAHR and Al
 *   Arabia are grouped on a guess ProArc has not confirmed (X5). The
 *   build prints them by name every run, because a guess that stops being
 *   printed has become a fact without anyone deciding it.
 *
 * WHAT IT DOES NOT CHECK, AND WHERE THAT LIVES INSTEAD. The wall's real
 * geometric precondition is that each file's box equals its ink box — the
 * trim (commit `a111345`) established it, and the CSS honouring 32px while
 * the screen shows 6.7px is exactly the fault that hid for a week. Proving
 * it means an alpha-connected-component pass over 34 files, which is too
 * slow to run on every build, so it lives in `_bmad/tools/sweep-about.js`.
 * What IS cheap is the consequence: this file reports the rendered
 * arithmetic from the manifest's intrinsic sizes every run, so an asset
 * regression shows up as a number moving.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const LOGO_DIR = path.join(ROOT, 'images', 'logos');

/**
 * §1.5a rule 4 caps a third-party mark at 32px optical height, and W-A
 * gives the mark column 200px. Both live here rather than only in the CSS
 * so the reported arithmetic and the rendered wall cannot drift apart.
 */
const MARK_CAP = 32;
const MARK_CONTAINER = 200;

function escapeText(s) {
  return String(s).replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function readJson(...parts) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, ...parts), 'utf8'));
}

/* ------------------------------------------------------------------ *
 * The contract
 * ------------------------------------------------------------------ */

function loadWall() {
  const db = readJson('data', 'clients.json');
  const projects = readJson('data', 'projects.json');
  const manifest = readJson('images', 'manifest.json');

  const groups = db.groups;
  const rows = db.clients;
  const notShipped = Object.keys(db.notShipped);
  const titles = new Set(projects.projects.map((p) => p.title));

  const onDisk = fs
    .readdirSync(LOGO_DIR)
    .filter((f) => f.endsWith('.webp'))
    .map((f) => f.replace(/\.webp$/, ''))
    .sort();

  const seen = new Set();
  rows.forEach((c) => {
    if (seen.has(c.file)) throw new Error(`about: ${c.file} appears twice in data/clients.json.`);
    seen.add(c.file);

    if (!onDisk.includes(c.file)) {
      throw new Error(
        `about: ${c.file} has no mark at images/logos/${c.file}.webp. ` +
          `The presentation is mark-plus-name (§1.5a rule 2) — a client with no artwork has no row.`
      );
    }
    if (!groups.includes(c.group)) {
      throw new Error(
        `about: ${c.file} is grouped "${c.group}", which is not one of the four heads ` +
          `(${groups.join(' · ')}). A fifth head is a decision, not a typo.`
      );
    }
    if (c.relation && !titles.has(c.relation)) {
      throw new Error(
        `about: ${c.file}'s relation "${c.relation}" is not a record title in data/projects.json. ` +
          `The wall names no building the site does not hold.`
      );
    }
  });

  const unaccounted = onDisk.filter((f) => !seen.has(f) && !notShipped.includes(f));
  if (unaccounted.length) {
    throw new Error(
      `about: images/logos holds ${unaccounted.join(', ')}, which data/clients.json neither ships ` +
        `nor lists in notShipped. Every mark is a decision — take it in the data file.`
    );
  }
  const missing = notShipped.filter((f) => !onDisk.includes(f));
  if (missing.length) {
    throw new Error(`about: notShipped names ${missing.join(', ')}, which is not in images/logos.`);
  }

  return { groups, rows, manifest };
}

/* ------------------------------------------------------------------ *
 * The wall
 * ------------------------------------------------------------------ */

/**
 * Intrinsic dimensions come from the manifest rather than being measured
 * here: the manifest is reconstructed from the committed derivatives, so
 * width/height on the <img> and the arithmetic below are the same numbers
 * the browser will lay out with. Both are needed — the attributes reserve
 * the row's height before the mark loads, on a page that is thirty-two
 * rows of images.
 */
function size(manifest, file) {
  const wh = manifest.sizes[`images/logos/${file}.webp`];
  if (!wh) {
    throw new Error(
      `about: no intrinsic size for images/logos/${file}.webp. ` +
        `Run "npm run build:manifest" — the manifest is gitignored and is rebuilt from the derivatives.`
    );
  }
  return { w: wh[0], h: wh[1] };
}

/** How wide the mark renders at the 32px cap, before the container clips it. */
function opticalWidth(s) {
  return (s.w / s.h) * MARK_CAP;
}

function viewData(prefix) {
  const { groups, rows, manifest } = loadWall();

  const wall = groups.map((head) => {
    const members = rows
      .filter((c) => c.group === head)
      .sort((a, b) => a.name.localeCompare(b.name, 'en'));
    if (!members.length) {
      throw new Error(`about: the head "${head}" has no marks under it. An empty head labels nothing.`);
    }
    return {
      groupHead: escapeText(head),
      // The head names its own table through <caption>. Four tables rather
      // than one with head rows: a caption is a table's own name, where a
      // heading above the wall would be the invented section label §9.9
      // and 05-ajman §6.1 both refuse.
      groupId: 'ab-wall-' + head.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''),
      marks: members.map((c) => {
        const s = size(manifest, c.file);
        return {
          markSrc: `${prefix}images/logos/${c.file}.webp`,
          markW: s.w,
          markH: s.h,
          clientName: escapeText(c.name),
          // Explicitly empty, never absent: {{#each}} merges the item over
          // the page data, so an absent key would inherit whatever the outer
          // scope happens to hold under the same name.
          relation: c.relation ? escapeText(c.relation) : '',
        };
      }),
    };
  });

  /* ---- what the assets actually do at the cap ---- */

  const optical = rows
    .map((c) => ({ name: c.name, w: opticalWidth(size(manifest, c.file)) }))
    .sort((a, b) => a.w - b.w);
  const widths = optical.map((o) => o.w);
  const median = (widths[(widths.length >> 1) - 1] + widths[widths.length >> 1]) / 2;
  const limited = optical.filter((o) => o.w > MARK_CONTAINER);
  const shortest = Math.min(...widths.map((w) => Math.min(MARK_CAP, (MARK_CONTAINER / w) * MARK_CAP)));
  const provisional = rows.filter((c) => c.provisional);

  console.log(
    `    about: ${rows.length} marks in ${groups.length} groups; at the ${MARK_CAP}px cap they run ` +
      `${widths[0].toFixed(1)}–${widths[widths.length - 1].toFixed(1)}px wide ` +
      `(${(widths[widths.length - 1] / widths[0]).toFixed(1)}:1, median ${median.toFixed(1)}); ` +
      `in the ${MARK_CONTAINER}px column ${limited.length} width-limited` +
      `${limited.length ? ` (${limited.map((o) => o.name).join(', ')})` : ''}, ` +
      `shortest row renders ${shortest.toFixed(1)}px tall.`
  );
  console.log(
    `    about: X5 — ${provisional.length} group placements are ProArc's to confirm: ` +
      `${provisional.map((c) => `${c.name} → ${c.group}`).join(' · ')}.`
  );

  return {
    wall,
    workHref: `${prefix}projects.html`,
    careersHref: `${prefix}careers.html`,
    contactHref: `${prefix}contact.html`,
  };
}

function hasViewData(srcName) {
  return srcName === 'about';
}

module.exports = { hasViewData, viewData, loadWall, opticalWidth, MARK_CAP, MARK_CONTAINER };
