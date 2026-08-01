'use strict';

/**
 * The menu overlay's preview — six records (09-menu §7).
 *
 * The decided rule is "the first six of D1 that satisfy the completed-only
 * rule" (E9.5 — unbuilt work never opens a set). D1, "Proarc's order", is
 * carried by an `order` integer on each record, which REPLACES the never-
 * curated `featured` field.
 *
 * The field landed with the curation pass (00i-D1-Curation-Log.md), so the
 * rule now runs against real data and the interim list it read until then
 * is deleted. It resolves to the six Mahesh approved on board 16 rev 2 —
 * not by carrying them as a list, but because the curation put each set's
 * strongest completed record at the head of the order and the head spans
 * the verbs by construction.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const PREVIEW_COUNT = 6;

function buildPreview() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'images', 'manifest.json'), 'utf8'));

  const unranked = db.projects.filter((p) => typeof p.order !== 'number');
  if (unranked.length) {
    throw new Error(
      `menu preview: ${unranked.length} record(s) carry no D1 order (${unranked
        .map((p) => p.slug)
        .join(', ')}). An unranked record is invisible to every ordered surface — ` +
        'rank it in data/projects.json rather than letting it fall off the end.'
    );
  }

  const ranked = db.projects.slice().sort((a, b) => a.order - b.order);

  // E9.5 — completed only. The order already puts built work first (D1
  // rule 1), so this filter should be a no-op at the head; it stays because
  // it is the rule, and a re-curation must not be able to slip a render in.
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

module.exports = { buildPreview, renderPreview, PREVIEW_COUNT };
