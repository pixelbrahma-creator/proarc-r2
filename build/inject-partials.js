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
const work = require('./lib/work');
const home = require('./lib/home');
const ajman = require('./lib/ajman');
const services = require('./lib/services');
const about = require('./lib/about');
const contact = require('./lib/contact');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'pages-src');
const META_PATH = path.join(SRC_DIR, 'meta.json');

/**
 * A page one directory down (projects/list.html) reaches its assets one
 * directory up. Derived from the declared outFile rather than hardcoded '',
 * which silently broke every nested authored route; a meta entry may still
 * override it explicitly.
 */
function defaultAssetPrefix(outFile) {
  return '../'.repeat(outFile.split('/').length - 1);
}

function main() {
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  let count = 0;

  Object.keys(meta).forEach((srcName) => {
    if (srcName.startsWith('_')) return; // documentation keys, not routes
    const pageData = Object.assign({ assetPrefix: defaultAssetPrefix(meta[srcName].outFile) }, meta[srcName]);

    // `template` names a shared source (pages-src/_sector.html serves three
    // routes); its data varies per route, its structure must not — one
    // template is how three sector pages stay one design.
    const srcFile = pageData.template || srcName;
    const srcPath = path.join(SRC_DIR, srcFile + '.html');
    if (!fs.existsSync(srcPath)) {
      console.warn(`  ! skipping "${srcName}": no source file at pages-src/${srcFile}.html`);
      return;
    }

    // The Work surfaces render from the records (build/lib/work.js), Home
    // from build/lib/home.js and /ajman from build/lib/ajman.js — the data is
    // merged here so the sources stay structure and copy only.
    let data = pageData;
    if (work.hasViewData(srcName)) {
      data = Object.assign({}, pageData, work.viewData(srcName, pageData.assetPrefix));
    } else if (home.hasViewData(srcName)) {
      data = Object.assign({}, pageData, home.viewData(pageData.assetPrefix));
    } else if (ajman.hasViewData(srcName)) {
      data = Object.assign({}, pageData, ajman.viewData(pageData.assetPrefix));
    } else if (services.hasViewData(srcName)) {
      data = Object.assign({}, pageData, services.viewData(pageData.assetPrefix));
    } else if (about.hasViewData(srcName)) {
      data = Object.assign({}, pageData, about.viewData(pageData.assetPrefix));
    } else if (contact.hasViewData(srcName)) {
      data = Object.assign({}, pageData, contact.viewData(pageData.assetPrefix));
    }

    const source = fs.readFileSync(srcPath, 'utf8');
    let compiled = injectShell(source, data);
    // second pass: resolve the page's own {{tokens}} (loops, islands)
    compiled = render(compiled, data);

    const leftover = compiled.match(/{{[^}]+}}/g);
    if (leftover) {
      console.warn(`  ! ${srcName}: unresolved template tokens left in output: ${leftover.join(', ')}`);
    }

    // Routes nest (projects/list.html, projects/schools.html), and the
    // projects/ directory does not exist in a fresh clone until the project
    // pages are generated. Create the parent rather than depending on which
    // build script happened to run first.
    const outPath = path.join(ROOT, pageData.outFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, compiled, 'utf8');
    console.log(`  ✓ ${srcName}.html -> ${pageData.outFile}`);
    count++;
  });

  console.log(`\nCompiled ${count} page(s).`);
}

main();
