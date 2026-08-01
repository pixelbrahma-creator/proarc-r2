'use strict';

/**
 * The menu overlay's preview — six records (09-menu §7).
 *
 * The decided rule is "the first six of D1 that satisfy the completed-only
 * rule" (E9.5 — unbuilt work never opens a set). D1, "Proarc's order", is
 * carried by an `order` integer on each record, which REPLACES the never-
 * curated `featured` field.
 *
 * That field does not exist in data/projects.json yet — it lands with the
 * project-template session. Running the rule against the file's own order
 * today is not a degraded result, it is a wrong one: the file is clustered
 * by category, so the first six completed records are six schools in a row.
 * Six near-identical school thumbnails is precisely the monotony the
 * exhibition anatomy was built to make structurally impossible, and the
 * preview's whole job is to span the verbs.
 *
 * So the rule is implemented once, here, and reads its order from:
 *
 *   1. `order` on the record, when it exists — the real D1, and the only
 *      path once the field lands; or
 *   2. INTERIM_ORDER below — the six Mahesh saw and approved on board 16
 *      rev 2, which is the only curated ordering that exists today.
 *
 * When `order` lands, INTERIM_ORDER stops being consulted and can be
 * deleted. Nothing else about this file changes, and no caller changes at
 * all — which is the point of implementing the rule rather than the list.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const PREVIEW_COUNT = 6;

/**
 * INTERIM — board 16 rev 2's approved set, in its approved order.
 * Spans Residential · Educational · Retail & Mixed-Use · Commercial ·
 * Educational · Religious: the four verbs and the mosque.
 * Delete this when `order` lands on the records.
 */
const INTERIM_ORDER = [
  'seasidehills',
  'habitatschool',
  'souksalah',
  'ajmanbank',
  'cityuniversity',
  'alghalamosque',
];

function buildPreview() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'images', 'manifest.json'), 'utf8'));

  const hasOrderField = db.projects.some((p) => typeof p.order === 'number');

  const ranked = hasOrderField
    ? db.projects
        .filter((p) => typeof p.order === 'number')
        .slice()
        .sort((a, b) => a.order - b.order)
    : INTERIM_ORDER.map((slug) => {
        const record = db.projects.find((p) => p.slug === slug);
        if (!record) {
          throw new Error(
            `menu preview: interim record "${slug}" is not in data/projects.json. ` +
              'A renamed or merged slug (O5) must be re-curated, never silently dropped.'
          );
        }
        return record;
      });

  // E9.5 — completed only. Applied to both paths, because it is the rule and
  // not a property of the interim list.
  const completed = ranked.filter((p) => p.status === 'Completed');

  const chosen = completed.slice(0, PREVIEW_COUNT).map((p) => {
    const images = manifest.projects[p.slug] || {};
    if (!images.thumb) {
      throw new Error(
        `menu preview: "${p.slug}" has no thumb in images/manifest.json. ` +
          'Run npm run build:manifest — an empty manifest is the silent-emptying trap.'
      );
    }
    return { slug: p.slug, title: p.title, thumb: images.thumb };
  });

  if (chosen.length !== PREVIEW_COUNT) {
    throw new Error(
      `menu preview: resolved ${chosen.length} records, expected ${PREVIEW_COUNT}. ` +
        'The grid is drawn for six; a short set is a data problem, not a layout one.'
    );
  }

  return chosen;
}

/**
 * The preview grid. A plain grid, no bordered container (§4.7's card-in-card
 * prohibition), 14px name-only captions in the wayfinding register, and one
 * exit link carrying no count (E12 — "View All 47 Projects" is dead).
 *
 * E9.4 rides the thumbnails: provenance is confirmed data, never our reading,
 * so nothing ships a "· Visualisation" label until ProArc confirms the genre.
 * The six are completed records, which is the strongest honest position
 * available today.
 *
 * Nothing here carries tabindex. The panel is hidden with display:none at
 * rest, which takes its seven links out of the tab order outright; showing
 * it puts them back. That is what satisfies "nothing hover reveals is
 * unreachable by keyboard" (§4 rule 2) without a single tabindex to keep in
 * sync — and tabbing from WORK into the panel keeps the panel open, which is
 * the same path a pointer takes (§4 rule 5).
 *
 * The image carries alt="" because the record's name sits in the same link
 * as real text; a filled alt would make every thumbnail announce twice.
 */
function renderPreview(records, assetPrefix) {
  const cells = records
    .map(
      (r) =>
        `<a class="menu-preview__item" href="${assetPrefix}projects/${r.slug}.html">` +
        `<img class="menu-preview__thumb" src="${assetPrefix}${r.thumb}" alt="" width="800" height="600" loading="lazy" decoding="async">` +
        `<span class="menu-preview__name">${r.title}</span></a>`
    )
    .join('');

  return (
    `<div class="menu-preview" data-menu-preview>` +
    `<div class="menu-preview__grid">${cells}</div>` +
    `<a class="menu-preview__exit" href="${assetPrefix}projects.html">All projects <span class="menu-preview__arrow" aria-hidden="true">&rarr;</span></a>` +
    `</div>`
  );
}

module.exports = { buildPreview, renderPreview, PREVIEW_COUNT, INTERIM_ORDER };
