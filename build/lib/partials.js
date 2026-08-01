'use strict';

const fs = require('fs');
const path = require('path');
const { render } = require('./render');
const { buildDistrictMarks, renderConstellation } = require('./districts');
const { buildPreview, renderPreview } = require('./preview');
const seo = require('./seo');
const contact = require('./contact');

const PARTIALS_DIR = path.join(__dirname, '..', '..', 'partials');

/**
 * The nav — four noun labels, and the lock is four (09-menu §5, §11).
 * There is no Home item: the wordmark, which the overlay carries with its
 * field dissolved, is the Home door. /ajman and /careers are off-nav by
 * decision and light nothing.
 */
const NAV = [
  { key: 'work', label: 'Work', href: 'projects.html' },
  { key: 'services', label: 'Services', href: 'services.html' },
  { key: 'about', label: 'About', href: 'about.html' },
  { key: 'contact', label: 'Contact', href: 'contact.html' },
];

/**
 * Current-page semantics (09-menu §5). The lit item answers "which of these
 * four would take me back toward where I am", which is a wider question than
 * "which page am I on" — so the two states are separate and a page declares
 * both:
 *
 *   navLit    the item that gets weight 700 + #FFFFFF. The whole project
 *             block lights WORK: the arrival, the ledger, the three sector
 *             pages and all 47 records.
 *   navExact  whether that item also takes aria-current="page". Exact match
 *             ONLY — so /projects carries it and the 47 records do not,
 *             because a record is not the page the link leads to.
 *
 * Getting this wrong is silent in a browser and loud in a screen reader,
 * which is why it is two named fields rather than one clever inference.
 */
function navItems(pageData) {
  const lit = pageData.navLit || '';
  const exact = pageData.navExact === true;
  const prefix = pageData.assetPrefix || '';

  return NAV.map((item) => {
    const isLit = item.key === lit;
    return {
      navHref: prefix + item.href,
      navLabel: item.label,
      navLitClass: isLit ? ' is-lit' : '',
      navCurrentAttr: isLit && exact ? ' aria-current="page"' : '',
      // Only WORK carries a panel (§4 rule 4). The marker is an attribute
      // rather than a label match so the swap keeps working when the
      // bilingual build gives this item an Arabic label.
      navSwapAttr: item.key === 'work' ? ' data-menu-work' : '',
    };
  });
}

function loadPartial(name) {
  return fs.readFileSync(path.join(PARTIALS_DIR, name + '.html'), 'utf8');
}

/**
 * The constellation is identical on every page and derived from two JSON
 * files, so it is built once per process rather than 58 times.
 */
let constellationCache = null;
function constellation() {
  if (constellationCache === null) {
    constellationCache = renderConstellation(buildDistrictMarks(), 'menu-constellation');
  }
  return constellationCache;
}

/**
 * The preview's six records are the same everywhere too, but its markup
 * carries assetPrefix, so only the data lookup is cached.
 */
let previewCache = null;
function preview(assetPrefix) {
  if (previewCache === null) previewCache = buildPreview();
  return renderPreview(previewCache, assetPrefix);
}

/**
 * The overlay's phone and email are the same fact Contact's rows print, so
 * they come from the same file — data/contact.json, through contact.load(),
 * which validates them and derives the tel: from the printed number.
 * sweep-contact's agreement check stays as the tripwire on the built output.
 */
let chromeContactCache = null;
function chromeContact() {
  if (chromeContactCache === null) {
    const d = contact.load();
    chromeContactCache = {
      menuTel: 'tel:' + d.dial,
      menuPhone: d.phone,
      menuMailto: 'mailto:' + d.email,
      menuEmail: d.email,
    };
  }
  return chromeContactCache;
}

/**
 * A route's pageScript may name ONE script or SEVERAL.
 *
 * Contact is the first page to need two, and they are two on purpose:
 * js/contact.js does the ?project= pre-fill, which is that page's alone,
 * and js/forms.js is the validation grammar BOTH forms share — a second
 * copy of it on /careers is how two surfaces start disagreeing about what
 * a valid email address is.
 *
 * A string stays a string in meta.json, so every route written before this
 * existed is unchanged and every page it renders comes out byte-identical.
 */
function pageScripts(pageData) {
  const declared = pageData && pageData.pageScript;
  if (!declared) return [];
  const list = Array.isArray(declared) ? declared : [declared];
  return list.filter((name) => typeof name === 'string' && name.trim());
}

/**
 * Renders the shared partials against page-level data.
 *
 * pageData: { title, description, canonical, ogImage, assetPrefix,
 *             navLit, navExact, ground, pageStylesheet, pageScript }
 *
 * pageScript is a string or an array of strings; see pageScripts() above.
 */
function renderShell(pageData) {
  // The machine contract is derived HERE, in the one place both generators
  // pass through: og:url from the canonical, og:image made absolute, and
  // the Twitter card type following whether there is an image at all. All
  // fifty-eight pages shipped a RELATIVE og:image before this, which is not
  // a URL a scraper can fetch — every share card on the site was blank.
  const data = Object.assign({ assetPrefix: '' }, pageData, seo.shellData(pageData), chromeContact(), {
    navItems: navItems(pageData),
    constellation: constellation(),
    preview: preview(pageData.assetPrefix || ''),
    pageScripts: pageScripts(pageData),
  });

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

module.exports = { renderShell, injectShell, loadPartial, navItems, NAV };
