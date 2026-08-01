'use strict';

/**
 * The 47 project pages — one template, forty-seven times.
 *
 * Spec: `_bmad/wds/D-UX-Design/04-project.md`. The rules themselves live in
 * build/lib/records.js; this file is the assembly, and it fails loudly
 * rather than emitting a broken page.
 *
 * Never hand-edit anything under projects/ — edit data/projects.json
 * (content), partials/project-detail.template.html (structure) or
 * src/styles/pages/project.css (presentation), then re-run.
 *
 * Usage: node build/generate-projects.js
 */

const fs = require('fs');
const path = require('path');
const { render } = require('./lib/render');
const { renderShell, loadPartial } = require('./lib/partials');
const R = require('./lib/records');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'projects');

/** Every page in this set sits one directory down. */
const ASSET_PREFIX = '../';

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeText(s) {
  return String(s).replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * An image, with the intrinsic size the layout needs. The manifest carries
 * sizes for everything it references; a missing one is a build error rather
 * than a silent omission, because the symptom of an absent width/height is
 * forty-seven pages reflowing as their hero decodes.
 */
function image(manifest, rel, slug) {
  const size = manifest.sizes && manifest.sizes[rel];
  if (!size) throw new Error(`${slug}: no intrinsic size for ${rel}. Run npm run build:manifest.`);
  return { src: ASSET_PREFIX + rel, width: size[0], height: size[1] };
}

function main() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'images', 'manifest.json'), 'utf8'));
  const template = loadPartial('project-detail.template');

  if (!Object.keys(manifest.projects || {}).length) {
    throw new Error(
      'images/manifest.json holds no projects. It is gitignored and the raw sources are not in ' +
        'this repository, so run `npm run build:manifest` after a fresh clone — an empty manifest ' +
        'does not fail the build, it silently strips every image from the site.'
    );
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const projects = db.projects;
  const shared = R.sharedParagraphs(projects);
  const warnings = [];
  const warn = (m) => warnings.push(m);

  const stats = { written: 0, mute: [], statementOnly: [], noNeighbours: [], quantities: [] };

  projects.forEach((project) => {
    const images = manifest.projects[project.slug];
    if (!images) {
      warn(`${project.slug}: not in the manifest — no page written.`);
      return;
    }

    const hero = image(manifest, images.hero, project.slug);
    const heroMd = images.heroMd ? image(manifest, images.heroMd, project.slug) : null;
    // heroMd is a genuine second size on most records, but on a small source
    // the pipeline's withoutEnlargement makes it identical to the hero, and
    // two identical widths in a srcset is a candidate the browser can never
    // choose between.
    const heroSrcset =
      heroMd && heroMd.width !== hero.width
        ? `${heroMd.src} ${heroMd.width}w, ${hero.src} ${hero.width}w`
        : '';

    const gallery = (images.gallery || []).map((rel) => image(manifest, rel, project.slug));
    const back = R.backLink(project);
    const prose = R.bodyParagraphs(project, shared);
    const statement = R.statement(project, warn);
    const neighbours = R.neighbours(project, projects);
    const provenance = R.provenance(project);
    const specRows = R.specRows(project, warn);

    if (!statement && !prose.length) stats.mute.push(project.slug);
    else if (!prose.length) stats.statementOnly.push(project.slug);
    if (!neighbours) stats.noNeighbours.push(project.slug);

    // E12 debt, surfaced rather than swallowed: display prose carries no
    // quantities, and the brochure summaries X1 will rewrite still do.
    const quantities = [statement, ...prose].join(' ').match(/\d[\d,.]*/g);
    if (quantities) stats.quantities.push(`${project.slug} (${quantities.slice(0, 4).join(', ')})`);

    const pageData = {
      title: `${project.title} — Proarc`,
      description: statement || `${project.title}, ${R.displayLocation(project)}.`,
      canonical: `https://proarc.ae/projects/${project.slug}`,
      ogImage: (heroMd || hero).src,
      assetPrefix: ASSET_PREFIX,
      pageStylesheet: 'project',
      ground: 'paper',
      // The whole project block lights WORK; only an exact match takes
      // aria-current, and a record is not the page that link leads to.
      navLit: 'work',
      navExact: false,
    };

    const shell = renderShell(pageData);

    const viewData = Object.assign({}, pageData, {
      name: escapeText(project.title),
      backLabel: escapeText(back.label),
      backHref: ASSET_PREFIX + back.href,
      place: escapeText(R.displayLocation(project)),
      provenance: provenance ? escapeText(provenance) : '',
      // The photograph is the page's subject and the caption names it right
      // underneath, so a described alt would announce the same fact twice.
      heroAlt: escapeAttr(project.title),
      hero: hero.src,
      heroWidth: hero.width,
      heroHeight: hero.height,
      heroSrcset,
      statement: escapeText(statement),
      specRows: specRows.map((r) => ({ label: escapeText(r.label), value: escapeText(r.value) })),
      hasProse: prose.length > 0,
      proseParagraphs: prose.map(escapeText),
      hasGallery: gallery.length > 0,
      galleryLead: gallery[0] || null,
      hasGalleryRest: gallery.length > 1,
      galleryRest: gallery.slice(1),
      // One provenance line for the set where E9 applies — never a caption
      // per image, because no caption data exists for any of them.
      provenanceLine: provenance && gallery.length ? `${provenance}s.` : '',
      hasNeighbours: !!neighbours,
      neighboursHead: neighbours ? escapeText(neighbours.head) : '',
      neighbours: neighbours
        ? neighbours.records.map((n) => {
            const t = manifest.projects[n.slug] || {};
            const p = R.provenance(n);
            return {
              href: `${n.slug}.html`,
              thumb: ASSET_PREFIX + t.thumb,
              title: escapeText(n.title),
              meta: escapeText(p ? `${R.displayLocation(n)} · ${p}` : R.displayLocation(n)),
            };
          })
        : [],
      ctaSentence: escapeText(R.ctaSentence(project)),
      // The project travels in the link; contact's canonical stays /contact
      // so 47 query strings do not become 47 indexed duplicates.
      contactHref: `${ASSET_PREFIX}contact.html?project=${project.slug}`,
    });

    let page = render(template, viewData);
    page = page
      .replace('<!-- @include head -->', shell.head)
      .replace('<!-- @include header -->', shell.header)
      .replace('<!-- @include footer -->', shell.footer)
      .replace('<!-- @include scripts -->', shell.scripts);

    const leftover = page.match(/{{[^}]+}}/g);
    if (leftover) warn(`${project.slug}: unresolved template tokens: ${leftover.join(', ')}`);

    fs.writeFileSync(path.join(OUT_DIR, `${project.slug}.html`), page, 'utf8');
    stats.written++;
  });

  console.log(`Generated ${stats.written}/${projects.length} project page(s).`);
  console.log(`  statement only:  ${stats.statementOnly.length} (${stats.statementOnly.join(', ') || '—'})`);
  console.log(`  mute:            ${stats.mute.length} (${stats.mute.join(', ') || '—'})`);
  console.log(`  no neighbours:   ${stats.noNeighbours.length} (${stats.noNeighbours.join(', ') || '—'})`);
  console.log(`  E12 debt:        ${stats.quantities.length} record(s) carry a quantity in display prose (X1)`);

  if (warnings.length) {
    console.warn(`\n${warnings.length} warning(s):`);
    console.warn(warnings.map((w) => '  ! ' + w).join('\n'));
  }

  if (stats.written !== projects.length) {
    console.error(`\nOnly ${stats.written} of ${projects.length} pages were written.`);
    process.exit(1);
  }
}

main();
