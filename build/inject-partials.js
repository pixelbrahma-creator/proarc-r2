'use strict';

/**
 * Compiles every hand-authored page in pages-src/ into a final static
 * page at the project root, splicing in the shared head/header/footer/
 * scripts partials. Source pages contain only <!-- @include X --> markers
 * plus their own <main>. Never hand-edit the root-level output files —
 * edit pages-src/*.html + pages-src/meta.json and re-run this script.
 *
 * Usage: node build/inject-partials.js
 */

const fs = require('fs');
const path = require('path');
const { injectShell } = require('./lib/partials');
const { render } = require('./lib/render');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'pages-src');
const META_PATH = path.join(SRC_DIR, 'meta.json');

/**
 * Trimmed project dataset for projects.html's grid/filter/search — inlined
 * as a <script type="application/json"> island at build time (rather than
 * fetched at runtime) so the page works from file:// with no CORS issues.
 */
function buildProjectsDataJson() {
  const dbPath = path.join(ROOT, 'data', 'projects.json');
  const manifestPath = path.join(ROOT, 'images', 'manifest.json');
  if (!fs.existsSync(dbPath) || !fs.existsSync(manifestPath)) return '[]';

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const rows = db.projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    location: p.location,
    locationFilter: p.locationFilter,
    status: p.status || '',
    thumb: (manifest.projects[p.slug] || {}).thumb || '',
  }));

  return JSON.stringify(rows).replace(/<\/script/gi, '<\\/script');
}

function main() {
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  const projectsDataJson = buildProjectsDataJson();
  let count = 0;

  Object.keys(meta).forEach((srcName) => {
    const pageData = Object.assign({ assetPrefix: '' }, meta[srcName]);
    const srcPath = path.join(SRC_DIR, srcName + '.html');
    if (!fs.existsSync(srcPath)) {
      console.warn(`  ! skipping "${srcName}": no source file at pages-src/${srcName}.html`);
      return;
    }

    const source = fs.readFileSync(srcPath, 'utf8');
    let compiled = injectShell(source, pageData);
    // second pass: resolve any remaining {{tokens}} in the page's own body
    // (e.g. the inlined projects-data JSON island on projects.html)
    compiled = render(compiled, Object.assign({ projectsDataJson }, pageData));

    const leftover = compiled.match(/{{[^}]+}}/g);
    if (leftover) {
      console.warn(`  ! ${srcName}: unresolved template tokens left in output: ${leftover.join(', ')}`);
    }

    const outPath = path.join(ROOT, pageData.outFile);
    fs.writeFileSync(outPath, compiled, 'utf8');
    console.log(`  ✓ ${srcName}.html -> ${pageData.outFile}`);
    count++;
  });

  console.log(`\nCompiled ${count} page(s).`);
}

main();
