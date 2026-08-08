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

/**
 * W-B, taken 7 Aug 2026 — TWO CLIENTS ACROSS. The row is 960px, not
 * --container-max's 1120: the two 80px gutters come off first. What fits is
 *
 *     mark 200 + gap 24 + name 224   = 448 per client
 *     448 x 2 + a 64px gutter        = 960 exactly
 *
 * §5's own W-B note priced this at ~1,100px against a 1,120px row and
 * predicted 7 degraded marks; measured it is 1,862px, ONE width-limited mark
 * (unchanged from W-A), and 8 of 32 names wrapping to two lines. Three
 * separate sources priced this geometry by arithmetic and all three were
 * wrong, which is why NAME_COLUMN lives here beside the other two rather
 * than only in the CSS.
 */
const NAME_COLUMN = 224;
const PAIR_GUTTER = 64;
const ROW_WIDTH = 960;

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

/**
 * Two clients to a <tr>, flat rather than nested.
 *
 * FLAT KEYS ON PURPOSE. render.js's {{#if}} takes a single \w+ key, so a
 * nested `{{#if b.relation}}` silently renders nothing — the branch does not
 * fail, it disappears, which is the failure mode that hides. `aHasRelation` /
 * `hasB` are single words and cannot do that.
 *
 * The odd tail keeps its pair of empty cells: table-layout is fixed and the
 * columns are stated, so a short final row would otherwise re-negotiate
 * nothing — but the hairline would stop halfway across the group and read as
 * a rule that means something. Two groups of eleven ship an empty tail.
 */
function pairRows(marks) {
  const out = [];
  for (let i = 0; i < marks.length; i += 2) {
    const a = marks[i];
    const b = marks[i + 1] || null;
    out.push({
      aSrc: a.markSrc, aW: a.markW, aH: a.markH, aName: a.clientName,
      aRelation: a.relation, aHasRelation: Boolean(a.relation),
      hasB: Boolean(b),
      noB: !b,
      bSrc: b ? b.markSrc : '', bW: b ? b.markW : '', bH: b ? b.markH : '',
      bName: b ? b.clientName : '', bRelation: b ? b.relation : '',
      bHasRelation: Boolean(b && b.relation),
    });
  }
  const placed = out.reduce((n, r) => n + 1 + (r.hasB ? 1 : 0), 0);
  if (placed !== marks.length) {
    throw new Error(`about: pairing lost a client — ${marks.length} in, ${placed} out.`);
  }
  return out;
}

/**
 * THE MOSAIC (X24) — Mahesh's 8-Aug reversal of a rendered kill (Session
 * XXXII). Freya built a 15-tile page-foot mosaic, killed it on the render
 * as "/projects with the captions removed", and Mahesh — shown that render
 * beside /projects — chose the mosaic over the seam photograph anyway. His
 * call, and the build is her tightened re-cut: FIVE tiles in two rows, the
 * work's index at the wall's foot, not a second catalogue.
 *
 * THE FIVE ARE ¶2'S SENTENCE — learn, shop, pray, work, live — one tile
 * per human sense, which is the page's own argument in pictures. They are
 * DUMMIES: the real selection is ProArc's (X24, data-placeholder in the
 * template), and swapping a slug here is the whole edit.
 *
 * 🔴 A TILE MUST BE A PHOTOGRAPH. E9.3 exempts nothing from provenance
 * labelling on an index surface, an uncaptioned mosaic cannot label a
 * Visualisation, so a record carrying the label simply cannot appear —
 * this build THROWS rather than shipping a render unmarked.
 *
 * The aspects are CHOSEN, not intrinsic — object-fit crops the source into
 * the stated box, and the row heights fall out of the flex arithmetic
 * (row width minus gaps, over the aspect sum). The portrait tile is the
 * strip's one vertical; the class, not the position, carries that fact,
 * because mobile reorders it to close the strip full-width.
 */
const MOSAIC = [
  { row: 0, slug: 'cityschool',       a: 1.7027 },              // learn
  { row: 0, slug: 'citylifealtallah', a: 1.5    },              // shop
  { row: 1, slug: 'alghalamosque',    a: 0.6667, tall: true },  // pray
  { row: 1, slug: 'ajmanbank',        a: 1.5    },              // work
  { row: 1, slug: 'rosetower',        a: 1.6341 },              // live
];

function mosaic(manifest, prefix) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const bySlug = new Map(data.projects.map((p) => [p.slug, p]));
  const rows = [[], []];
  MOSAIC.forEach((t) => {
    const record = bySlug.get(t.slug);
    if (!record) throw new Error(`about: mosaic tile "${t.slug}" names no record the site holds.`);
    if (record.provenance) {
      throw new Error(
        `about: mosaic tile "${t.slug}" is a ${record.provenance} — an uncaptioned mosaic ` +
          'cannot label one (E9.3, exempt: none), so it cannot appear. Pick a photograph.'
      );
    }
    const images = manifest.projects[t.slug] || {};
    const sizeOf = (rel) => {
      const wh = manifest.sizes && manifest.sizes[rel];
      if (!wh) throw new Error(`about: mosaic tile "${t.slug}" has no intrinsic size for ${rel}. Run npm run build:manifest.`);
      return { src: prefix + rel, w: wh[0], h: wh[1] };
    };
    if (!images.band || !images.heroMd) {
      throw new Error(`about: mosaic tile "${t.slug}" is missing its band/hero-md derivatives — a tile without its weight decision is not a tile.`);
    }
    const small = sizeOf(images.band);
    const large = sizeOf(images.heroMd);
    // Emitted as generated markup, like /projects' tiles — the --a datum
    // may ride generated output but never an authored source (CLAUDE.md's
    // inline-style bar is on pages-src/, where stylelint cannot see).
    rows[t.row].push(
      `<img class="ab-index__tile${t.tall ? ' ab-index__tile--tall' : ''}" style="--a:${t.a.toFixed(4)}" ` +
        `src="${small.src}" srcset="${small.src} ${small.w}w, ${large.src} ${large.w}w" ` +
        `sizes="(max-width: 767px) 46vw, 35vw" width="${large.w}" height="${large.h}" ` +
        `alt="" loading="lazy" decoding="async">`
    );
  });
  console.log(
    `    about: X24 — the mosaic ships ${MOSAIC.length} DUMMY tiles ` +
      `(${MOSAIC.map((t) => t.slug).join(' · ')}); the selection is ProArc's to confirm.`
  );
  return rows
    .map((tiles) => `      <div class="ab-index__row">\n        ${tiles.join('\n        ')}\n      </div>`)
    .join('\n');
}

/* THE FIVE-STAR RATING LIVES UNDER THE GROUP IT NAMES (Mahesh, 8 Aug,
 * Session XXXIII: "move ... to client section below Government and
 * Authorities"). It left the story, where it had been the closing beat, for
 * the one group on the wall it is actually about — a MUNICIPAL rating read
 * beside the municipality's own peers rather than beside strangers.
 *
 * Keyed to the head BY NAME and it THROWS if that head ever leaves
 * clients.json. A proof that silently detaches from its group does not
 * vanish — it re-attaches to whichever group happens to be first, which is
 * a false attribution rather than a missing one. Same doctrine as the coast
 * parser: refuse rather than draw something plausible.
 */
/* THE DISCIPLINES ROW READS /services, IT DOES NOT RETYPE IT.
 *
 * The facts table's Team row was refused because it drew from X6's OPEN
 * staffing register, which names neither an interior designer nor an urban
 * planner while /services ships six blocks including both. Freya's read, 8
 * Aug (Session XXXIII): the fault was the REGISTER, not the question. So the
 * row asks the same question of the CLOSED register — the six blocks Mahesh
 * called on 1 Aug — and the two omissions disappear with it.
 *
 * Read from `pages-src/services.html`, exactly as `home.js` reads it for the
 * services line, and for the same reason: two surfaces that retype one list
 * are two surfaces that will disagree. SOURCE, not the built page — build
 * order is not a contract.
 *
 * The middot is bound to the name BEFORE it with a non-breaking space and
 * each name is nowrap, so a line can only break AFTER a separator. Freya
 * rendered the plain-space version at 768 and it broke onto "· Interior
 * design", where a leading separator reads as a bullet.
 */
function disciplineNames() {
  const src = fs.readFileSync(path.join(ROOT, 'pages-src', 'services.html'), 'utf8');
  const names = [...src.matchAll(/class="sv-block__name[^"]*">([^<]+)</g)].map((m) => m[1].trim());
  if (names.length < 2) {
    throw new Error(
      'about: the disciplines row is read off pages-src/services.html rather than retyped, and ' +
        `that page yielded ${names.length} name(s). A markup change there has to be followed here ` +
        'rather than silently shipping a shorter list of what the practice does.'
    );
  }
  return names;
}

function disciplinesRow() {
  const names = disciplineNames();
  return names
    .map((n, i) => {
      const name = escapeText(n);
      return i === names.length - 1
        ? `<span class="ab-facts__d">${name}</span>`
        : `<span class="ab-facts__d">${name}&nbsp;&middot;</span>`;
    })
    .join(' ');
}

const PROOF_HEAD = 'Government & authorities';
const PROOF_LINE =
  'Ajman Municipality and Planning Department awarded us a five-star rating in 2023.';

function viewData(prefix) {
  const { groups, rows, manifest } = loadWall();

  const disciplines = disciplinesRow();

  if (!groups.includes(PROOF_HEAD)) {
    throw new Error(
      `about: the five-star proof is keyed to the head "${PROOF_HEAD}", which is not in ` +
        `clients.json (${groups.join(' · ')}). Re-home the proof deliberately; do not let it ` +
        `fall to another group.`
    );
  }

  const wall = groups.map((head) => {
    const members = rows
      .filter((c) => c.group === head)
      .sort((a, b) => a.name.localeCompare(b.name, 'en'));
    if (!members.length) {
      throw new Error(`about: the head "${head}" has no marks under it. An empty head labels nothing.`);
    }
    return {
      groupHead: escapeText(head),
      /* Explicitly empty, never absent — {{#each}} merges the item over the
         page data, so an absent key inherits the outer scope's value and the
         proof would print under every group. */
      proof: head === PROOF_HEAD ? escapeText(PROOF_LINE) : '',
      // The head names its own table through <caption>. Four tables rather
      // than one with head rows: a caption is a table's own name. The
      // section heading above them — "Clients" — is Mahesh's 8-Aug
      // reversal of §9.9/05-ajman §6.1's refusal (Session XXXII); the
      // captions still do the group labelling beneath it.
      groupId: 'ab-wall-' + head.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''),
      pairs: pairRows(
        members.map((c) => {
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
        })
      ),
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
  const placedRows = wall.reduce((n, g) => n + g.pairs.length, 0);
  const placedClients = wall.reduce(
    (n, g) => n + g.pairs.reduce((m, r) => m + 1 + (r.hasB ? 1 : 0), 0), 0
  );
  if (placedClients !== rows.length) {
    throw new Error(`about: the wall placed ${placedClients} clients of ${rows.length}.`);
  }
  console.log(
    `    about: W-B — ${placedClients} clients in ${placedRows} rows, two across; ` +
      `${MARK_CONTAINER} + ${MARK_CONTAINER === 200 ? 24 : '?'} + ${NAME_COLUMN} per client, ` +
      `x2 + a ${PAIR_GUTTER}px gutter = ${MARK_CONTAINER * 2 + 24 * 2 + NAME_COLUMN * 2 + PAIR_GUTTER}px ` +
      `against a ${ROW_WIDTH}px row.`
  );

  console.log(
    `    about: X5 — ${provisional.length} group placements are ProArc's to confirm: ` +
      `${provisional.map((c) => `${c.name} → ${c.group}`).join(' · ')}.`
  );

  /**
   * Leadership — X9's four roles, carried verbatim from the v1 page. No
   * names and no photographs, because ProArc has supplied neither; the
   * roles are the only part of it v1 actually asserted.
   *
   * IT IS AUTHORED HERE RATHER THAN IN data/ ON PURPOSE. A data file would
   * make this look like a maintained record. It is a placeholder with a
   * publication gate on it (X19), and when X9 answers it becomes four
   * names, four confirmed roles and four photographs in one edit — at which
   * point moving it to data/ is the right call and not before.
   */
  const leadership = [
    { role: 'Founder &amp; Principal Architect' },
    { role: 'Design Director' },
    { role: 'Head of Project Management' },
    { role: 'MEP Engineering Lead' },
  ];
  console.log(
    `    about: X9 — leadership ships with ${leadership.length} PLACEHOLDER cards ` +
      `(no names, no photographs). /about must not be published in this state; see X19.`
  );

  return {
    wall,
    disciplines,
    mosaicTiles: mosaic(manifest, prefix),
    leadership,
    workHref: `${prefix}projects.html`,
    careersHref: `${prefix}careers.html`,
    contactHref: `${prefix}contact.html`,
  };
}

function hasViewData(srcName) {
  return srcName === 'about';
}

module.exports = { hasViewData, viewData, loadWall, opticalWidth, pairRows,
                   MARK_CAP, MARK_CONTAINER, NAME_COLUMN, PAIR_GUTTER, ROW_WIDTH };
