'use strict';

/**
 * The machine contract — what every page tells a crawler and a share card.
 *
 * A META DESCRIPTION IS A DISPLAY SURFACE. It is the sentence a person
 * reads in a search result, and the site's copy rules reach it exactly as
 * they reach the page. /careers proved the point at this build: its route
 * description carried the X6 staffing register verbatim, months after the
 * sentence was deleted from the two surfaces anyone was looking at. This
 * file is where that class of fault is checked rather than remembered.
 *
 * ONE ORIGIN, STATED ONCE. Canonicals were authored by hand in meta.json
 * and in generate-projects.js, and an absolute og:image has to agree with
 * them. ORIGIN is the single value; every canonical is checked against it
 * at build, so a typo in one route cannot quietly point a crawler at a
 * domain the practice does not own.
 *
 * og:image MUST BE ABSOLUTE. All 53 pages that carried one shipped a
 * relative path — "../images/projects/rosetower/hero-md.webp" — which is
 * not a URL a scraper can fetch from anywhere. Every share card on the site
 * was blank. partials/head.html carried the note that the path was "the SEO
 * pass's to fix"; this is that fix, applied in renderShell so all
 * fifty-eight pages take it from one place.
 *
 * WHAT THIS FILE WILL NOT DO: invent a fact to satisfy a schema. The
 * structured data below carries what ProArc publishes about itself and what
 * the records hold, and nothing else — no headcount, no project count, no
 * street address until X14 answers, no rating, no SearchAction for a search
 * that has no URL endpoint.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

/** The one origin. Every canonical on the site is checked against it. */
const ORIGIN = 'https://proarc.ae';

/**
 * Google truncates a result snippet around 155–160 characters. The cap is
 * not a style rule — a description longer than this is a sentence the
 * reader sees cut off mid-word, so a route that exceeds it takes its
 * ledger line instead (see descriptionFor).
 */
const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 15;
const TITLE_MAX = 60;

/**
 * CLIENT OPTIONS — pages that are SHOWN and not published.
 *
 * An option is a real built page on a real URL, because that is the only
 * honest way to judge one — so it carries `noindex`, stays out of
 * sitemap.xml, and when a decision is taken it is either promoted into a
 * route or deleted. It is never a page that quietly stays.
 *
 * 🔴 Named here rather than pattern-matched on the filename. A rule that
 * exempts anything matching /option|preview|tmp/ eventually exempts a real
 * page someone named badly; a list of names cannot.
 *
 * 🔴 EMPTY, and that is a state rather than a gap. `index1.html` was the
 * only entry and it was PROMOTED into `index` on 4 Aug — the option was
 * decided, so the exemption went with the route. The list stays because the
 * mechanism is what makes showing the next option cheap; an empty one means
 * every built page is a published page, which is what the SEO audit's route
 * count then asserts.
 */
const OPTION_ROUTES = [];

function readJson(...parts) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, ...parts), 'utf8'));
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ------------------------------------------------------------------ *
 * Absolute URLs
 * ------------------------------------------------------------------ */

/**
 * A page-relative asset path to an absolute URL.
 *
 * Every asset path on the site is `assetPrefix + 'images/…'`, and the
 * prefix is a run of `../` derived from the route's own depth — so the
 * absolute form is the path with its prefix removed, under the origin.
 * Throws rather than guessing at anything else: a path this cannot resolve
 * is a path that would ship as a broken share card.
 */
function absoluteAsset(relPath) {
  if (!relPath) return '';
  if (/^https?:\/\//i.test(relPath)) return relPath;
  const stripped = String(relPath).replace(/^(?:\.\.\/)+/, '').replace(/^\.\//, '').replace(/^\//, '');
  if (!/^(?:images|assets)\//.test(stripped)) {
    throw new Error(
      `seo: cannot make "${relPath}" absolute — an og:image is expected under images/ or assets/. ` +
        `A relative og:image is not a URL a scraper can fetch, which is how all 53 share cards shipped blank.`
    );
  }
  return `${ORIGIN}/${stripped}`;
}

/**
 * What renderShell merges into every page's data. The canonical is the
 * page's identity, so og:url is derived from it rather than authored a
 * second time.
 */
function shellData(pageData) {
  const canonical = pageData.canonical || '';
  if (!canonical) {
    throw new Error(`seo: "${pageData.title || 'a page'}" declares no canonical. Every route on the site has one.`);
  }
  if (canonical.indexOf(ORIGIN + '/') !== 0 && canonical !== ORIGIN + '/') {
    throw new Error(`seo: canonical "${canonical}" is not under ${ORIGIN}.`);
  }
  const ogImageAbs = pageData.ogImage ? absoluteAsset(pageData.ogImage) : '';
  return {
    ogUrl: canonical,
    ogImageAbs,
    // A summary_large_image card with no image is a broken card, not a
    // large one. The type follows what the page can actually offer.
    twitterCard: ogImageAbs ? 'summary_large_image' : 'summary',
  };
}

/* ------------------------------------------------------------------ *
 * The description rule
 * ------------------------------------------------------------------ */

/**
 * A record's description is ITS OWN STATEMENT when the statement can serve
 * as one, and its ledger line otherwise. Neither is written here — both
 * come from the record.
 *
 * Three faults are why the rule exists, all measured on the built pages:
 *
 *   TWELVE STATEMENTS RUN PAST THE SNIPPET. The longest is 249 characters,
 *   so a reader sees two thirds of a sentence and then nothing.
 *
 *   THREE RECORDS SHARE ONE. Mark & Save at Rashdiya, Al Tallah and Al Jurf
 *   carry the same summary in the data — the mail-merge X1 exists to
 *   replace — so three routes described themselves identically.
 *
 *   ONE HAS NO STATEMENT AT ALL. Homes R Us ships mute (its summary is
 *   Lorem ipsum), and its description was the fallback already.
 *
 * The ledger line is what the site itself prints when it lists a building:
 * name, kind, place, year. It is numberless but for the year, which E12
 * exempts as a date, and it is unique by construction because no two
 * records share a name.
 */
const PRACTICE_CLAUSE = 'Architecture, engineering and project management by Proarc.';

function descriptionFor(statement, ledgerLine, seenStatements) {
  const s = (statement || '').trim();
  const tooLong = s.length > DESCRIPTION_MAX;
  const duplicated = s && seenStatements && seenStatements.get(s) > 1;
  if (!s || tooLong || duplicated) {
    /**
     * THE LEDGER LINE ALONE IS TOO THIN TO BE A DESCRIPTION. The first run
     * of this rule produced "Car Souq — Ajman." at seventeen characters:
     * true, unique, and useless in a result — a 249-character brochure
     * sentence traded for a stub. The practice clause carries the rest,
     * and the unique part still leads.
     *
     * A FIRST-SENTENCE FALLBACK WAS TRIED AND DROPPED: measured on all
     * thirteen, every over-long statement is a SINGLE sentence, so the
     * first sentence is the whole statement and buys nothing.
     */
    return {
      text: `${ledgerLine} ${PRACTICE_CLAUSE}`,
      reason: !s ? 'no statement' : tooLong ? `statement is ${s.length} chars` : 'statement is shared with another record',
    };
  }
  return { text: s, reason: '' };
}

/**
 * UTF-8 read as Latin-1 and saved back. `’` becomes `â€™`, `–` becomes
 * `â€“`. Three records carried it into five built pages — the Work
 * arrival and the ledger among them — and it is invisible to every check
 * that looks at structure rather than at characters.
 */
const MOJIBAKE = /â€|Ã[©¨¢«]|â€™|Â[ ]/;

/* ------------------------------------------------------------------ *
 * Structured data
 * ------------------------------------------------------------------ */

const PRACTICE_ID = `${ORIGIN}/#practice`;

/**
 * The practice, from data/contact.json — the same file Contact renders its
 * facts from and /careers takes its address from.
 *
 * NO STREET ADDRESS UNTIL X14. proarc.ae publishes a PO Box and nothing
 * else, and a PostalAddress with an invented streetAddress is the same
 * fault as the page's, told to a machine. postOfficeBoxNumber is the field
 * schema.org has for exactly this.
 *
 * NO COUNT OF ANYTHING. numberOfEmployees is barred by X9 permanently and
 * a project count is barred by the no-numbers rule; neither appears here
 * because structured data is not a loophole in a copy rule.
 */
function practiceJsonLd() {
  const db = readJson('data', 'contact.json');
  const pub = db.published;
  const node = {
    '@context': 'https://schema.org',
    '@type': 'ArchitecturalService',
    '@id': PRACTICE_ID,
    name: 'Proarc',
    url: ORIGIN + '/',
    logo: `${ORIGIN}/images/ui/logo-mark.webp`,
    email: pub.email,
    telephone: pub.phone.replace(/[^\d+]/g, ''),
    address: {
      '@type': 'PostalAddress',
      postOfficeBoxNumber: (pub.poBox.match(/\d+/) || [''])[0],
      addressLocality: 'Ajman',
      addressCountry: 'AE',
    },
    areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
  };
  if (pub.founded) node.foundingDate = String(pub.founded);
  if (Array.isArray(pub.social) && pub.social.length) node.sameAs = pub.social.slice();
  return node;
}

/**
 * The site node. NO SearchAction: the Work arrival's search runs in the
 * browser over a build-made island and has no URL a crawler could query,
 * so declaring one would advertise an endpoint that does not exist.
 */
function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${ORIGIN}/#site`,
    name: 'Proarc',
    url: ORIGIN + '/',
    publisher: { '@id': PRACTICE_ID },
    inLanguage: 'en',
  };
}

/**
 * One record. `dateCreated` is omitted unless the record holds a real year
 * — eight of the forty-seven read "Under Proposal" or similar, and a
 * schema date is a claim about when the thing was made.
 */
function projectJsonLd(project) {
  const node = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${ORIGIN}/projects/${project.slug}#project`,
    name: project.title,
    url: `${ORIGIN}/projects/${project.slug}`,
    creator: { '@id': PRACTICE_ID },
    isPartOf: { '@id': `${ORIGIN}/#site` },
  };
  if (project.description) node.description = project.description;
  if (project.image) node.image = project.image;
  if (project.location) node.locationCreated = { '@type': 'Place', name: project.location };
  if (project.year && /^\d{4}$/.test(String(project.year))) node.dateCreated = String(project.year);
  return node;
}

/** JSON inside a <script> needs its closing tag escaped, nothing else. */
function embed(nodes) {
  const payload = nodes.length === 1 ? nodes[0] : nodes;
  return JSON.stringify(payload).replace(/<\/script/gi, '<\\/script');
}

module.exports = {
  MOJIBAKE,
  PRACTICE_CLAUSE,
  ORIGIN,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  TITLE_MAX,
  OPTION_ROUTES,
  PRACTICE_ID,
  absoluteAsset,
  shellData,
  descriptionFor,
  practiceJsonLd,
  siteJsonLd,
  projectJsonLd,
  embed,
  escapeAttr,
};
