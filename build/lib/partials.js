'use strict';

const fs = require('fs');
const path = require('path');
const { render } = require('./render');

const PARTIALS_DIR = path.join(__dirname, '..', '..', 'partials');
const NAV_PAGES = ['home', 'about', 'services', 'projects', 'testimonials', 'careers', 'contact'];

function navActiveFlags(activePage) {
  const flags = {};
  NAV_PAGES.forEach((p) => {
    const key = 'navActive' + p[0].toUpperCase() + p.slice(1);
    flags[key] = p === activePage ? 'is-active' : '';
  });
  return flags;
}

function loadPartial(name) {
  return fs.readFileSync(path.join(PARTIALS_DIR, name + '.html'), 'utf8');
}

/**
 * Renders the four shared partials (head/header/footer/scripts) against
 * page-level data and returns them keyed by name, ready to splice into
 * an authored page or a generated template.
 *
 * pageData: { title, description, canonical, ogImage, assetPrefix,
 *             activePage, pageStylesheet, pageScript }
 */
function renderShell(pageData) {
  const data = Object.assign({ assetPrefix: '' }, pageData, navActiveFlags(pageData.activePage));
  return {
    head: render(loadPartial('head'), data),
    header: render(loadPartial('header'), data),
    footer: render(loadPartial('footer'), data),
    scripts: render(loadPartial('scripts'), data),
  };
}

/**
 * Injects the shared shell into a hand-authored page via HTML comment
 * markers: <!-- @include head|header|footer|scripts -->
 */
function injectShell(sourceHtml, pageData) {
  const shell = renderShell(pageData);
  return sourceHtml
    .replace('<!-- @include head -->', shell.head)
    .replace('<!-- @include header -->', shell.header)
    .replace('<!-- @include footer -->', shell.footer)
    .replace('<!-- @include scripts -->', shell.scripts);
}

module.exports = { renderShell, injectShell, loadPartial, navActiveFlags };
