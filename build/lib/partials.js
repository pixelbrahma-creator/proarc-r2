'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { render } = require('./render');
const { buildPreview, renderPreview } = require('./preview');
const menu = require('./menu');
const seo = require('./seo');
const contact = require('./contact');

const PARTIALS_DIR = path.join(__dirname, '..', '..', 'partials');

/**
 * The nav — four noun labels, and the lock is four (09-menu §5, §11).
 * There is no Home item HERE: the wordmark, which THIS SURFACE carries with
 * its field dissolved (`html.is-menu-open .chrome-plate { transform: none }`),
 * is the Home door. /ajman and /careers are off-nav by decision and light
 * nothing.
 *
 * 🔴 SCOPED 9 Aug (XXXVIII), and this sentence was the last unscoped copy in
 * the tree — in the file an agent reads first. Both of its reasons are
 * properties of THE OVERLAY: the four-item lock is 09-menu §10's, and the
 * wordmark is present because this surface forces it present. Neither reaches
 * the FOOTER, which has always shipped six items — two of them precisely
 * because this nav refuses them — and carries no wordmark at all. Measured at
 * the foot of any page at >=780, `chrome-quiet` and `chrome-retired` are BOTH
 * armed and the on-screen home-door count is ZERO, so the footer now ships a
 * Home item and `sweep-footer.js` asserts a non-plate home door on all 57
 * routes. A refusal can be exactly right about its object and wrong about its
 * scope; 09-menu §11 carries the same note.
 *
 * 📌 THE ORDER OF THESE FOUR IS ASSERTED NOWHERE, and is argued nowhere either
 * (swept 9 Aug: §5 states it and never defends it, §11's refusals table has no
 * order row). `navSwapAttr` is keyed by `key` rather than by index precisely so
 * a permutation cannot mis-point a stage, and p29's rail check compares
 * POSITIONAL indices — `'0,1,2,3'` reads true for any permutation — so a
 * reorder ships green at 41/41. The one thing that actually moves is the rail's
 * RESTING row: the whole project block lights WORK (see below), which is 51 of
 * 58 routes, so WORK's position is where the rail parks on almost every page.
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
      // Every item now names its own stage (§4.4's revision, 8 Aug —
      // WORK was the only one with a panel before it). It is an attribute
      // rather than a label match so the stage keeps working when the
      // bilingual build gives this item an Arabic label, and rather than a
      // list index so that reordering the nav cannot silently point an
      // item at the wrong stage.
      navSwapAttr: ' data-menu-stage="' + item.key + '"',
    };
  });
}

function loadPartial(name) {
  return fs.readFileSync(path.join(PARTIALS_DIR, name + '.html'), 'utf8');
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
      /* 🔴 DIRECTIONS REACHES THE CHROME FROM THE SAME FILE THE PHONE DOES,
         and for the same recorded reason. The overlay's phone and email were
         hand-written here while Contact derived its own from
         data/contact.json, and Session I closed that: two sources for one
         fact. A maps URL typed into a partial is the identical shape — and
         v1 is the worked example of what it costs, since its Get Directions
         button asks Google Maps for the PO BOX and has done for years.

         The mark is emitted rather than written into the two partials for
         the same reason again: one drawing, three surfaces. */
      directionsHref: d.mapsHref,
      directionsMark: contact.directionsMark(),
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
 * A route's pageStylesheet may name ONE stylesheet or SEVERAL — the same
 * shape, and the same reason, as pageScripts() above.
 *
 * index1 is the first route to need two: it is an OPTION on Home, so it
 * takes home.css whole and states only its differences in home-alt.css.
 * A second full copy of a 900-line stylesheet is how two surfaces start
 * disagreeing about one page.
 *
 * A string still resolves to a one-element list, so every route that
 * existed is unchanged and every page it renders comes out byte-identical.
 */
function pageStyles(pageData) {
  const declared = pageData && pageData.pageStylesheet;
  if (!declared) return [];
  const list = Array.isArray(declared) ? declared : [declared];
  return list.filter((name) => typeof name === 'string' && name.trim());
}

/**
 * Every stylesheet link carries a content-hash query, so a browser that
 * cached yesterday's CSS cannot read today's page against it. Session
 * XXXI was judged partly on a stale about.css — no query on any <link>,
 * and a plain file server answers 304 — while every probe disables its
 * own cache, so the harness could never have reproduced what the
 * reviewer saw. The version is a hash of the file's bytes, not an
 * mtime, so a rebuild with unchanged CSS leaves every page
 * byte-identical.
 */
const styleVersions = new Map();

function styleVersion(relPath) {
  if (!styleVersions.has(relPath)) {
    const bytes = fs.readFileSync(path.join(__dirname, '..', '..', relPath));
    styleVersions.set(relPath, crypto.createHash('md5').update(bytes).digest('hex').slice(0, 8));
  }
  return styleVersions.get(relPath);
}

function bustStyles(headHtml) {
  return headHtml.replace(/href="([^"]*?)(src\/styles\/[^"?]+\.css)"/g,
    (whole, prefix, rel) => `href="${prefix}${rel}?v=${styleVersion(rel)}"`);
}

/**
 * Renders the shared partials against page-level data.
 *
 * pageData: { title, description, canonical, ogImage, assetPrefix,
 *             navLit, navExact, ground, pageStylesheet, pageScript, robots }
 *
 * pageScript and pageStylesheet are each a string or an array of strings.
 * `robots` defaults to the site's own answer — every route is indexable
 * unless it says otherwise, and the only routes that say otherwise are
 * client OPTIONS, which are shown rather than published.
 */
function renderShell(pageData) {
  // The machine contract is derived HERE, in the one place both generators
  // pass through: og:url from the canonical, og:image made absolute, and
  // the Twitter card type following whether there is an image at all. All
  // fifty-eight pages shipped a RELATIVE og:image before this, which is not
  // a URL a scraper can fetch — every share card on the site was blank.
  const data = Object.assign({ assetPrefix: '', robots: 'index, follow' }, pageData, seo.shellData(pageData), chromeContact(), {
    // The resting occupant, decided at BUILD time so an overlay with no
    // JavaScript opens on the right one. It is the page the reader is
    // already on; where no nav item is lit — Home, /ajman, /careers — it is
    // the story's opening sentence. js/menu.js reads this attribute rather
    // than re-deriving it, because two derivations of one fact is how two
    // surfaces start disagreeing about where the reader is.
    menuRestStage: pageData.navLit || 'rest',
    navItems: navItems(pageData),
    stages: menu.stages(),
    preview: preview(pageData.assetPrefix || ''),
    pageScripts: pageScripts(pageData),
    pageStyles: pageStyles(pageData),
  });

  return {
    head: bustStyles(render(loadPartial('head'), data)),
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
