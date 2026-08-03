'use strict';

/**
 * The last build step: audit the machine contract on the BUILT BYTES, then
 * write sitemap.xml and robots.txt from what is actually there.
 *
 * IT READS THE OUTPUT, NOT THE INPUTS. The two generators each know their
 * own routes and neither can see the other's, so nothing in the pipeline
 * could tell that three records described themselves identically or that
 * every og:image on the site was unfetchable. This script runs after both
 * and reads the fifty-eight files a crawler would read.
 *
 * IT FAILS THE BUILD, and that is the point of putting it here. A wrong
 * canonical, a duplicate description, a relative og:image or a dangling
 * @id are all silent in the browser and wrong in a search result, which is
 * exactly the class of fault that survives a visual review. The things it
 * only WARNS about are the ones where the honest value is a judgement:
 * a short description can be deliberate (Contact's is its H1).
 *
 * THE SITEMAP CARRIES NO lastmod, changefreq OR priority. A lastmod set to
 * the build date says every page changed whenever the site was rebuilt,
 * which is a false claim made freshly every run; changefreq and priority
 * are ignored by every major crawler and would be invented numbers on a
 * site whose whole copy rule is that it does not invent numbers.
 *
 * Usage: node build/build-seo.js
 */

const fs = require('fs');
const path = require('path');
const seo = require('./lib/seo');

const ROOT = path.join(__dirname, '..');

function builtPages() {
  const files = fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .map((f) => ({ file: f, html: fs.readFileSync(path.join(ROOT, f), 'utf8') }));
  const dir = path.join(ROOT, 'projects');
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir)
      .filter((f) => f.endsWith('.html'))
      .forEach((f) => files.push({ file: 'projects/' + f, html: fs.readFileSync(path.join(dir, f), 'utf8') }));
  }
  return files.sort((a, b) => a.file.localeCompare(b.file));
}

/** The head only — a page's own copy may legitimately contain these words. */
function headOf(html) {
  return html.slice(0, html.indexOf('</head>'));
}

const attr = (s, re) => ((s.match(re) || [])[1] || '');

function readRoute(page) {
  const head = headOf(page.html);
  return {
    file: page.file,
    title: attr(head, /<title>([^<]*)<\/title>/),
    description: attr(head, /name="description" content="([^"]*)"/),
    canonical: attr(head, /rel="canonical" href="([^"]*)"/),
    ogUrl: attr(head, /property="og:url" content="([^"]*)"/),
    ogImage: attr(head, /property="og:image" content="([^"]*)"/),
    ogTitle: attr(head, /property="og:title" content="([^"]*)"/),
    twitterCard: attr(head, /name="twitter:card" content="([^"]*)"/),
    robots: attr(head, /name="robots" content="([^"]*)"/),
    jsonLd: (head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1] || '',
  };
}

/* ------------------------------------------------------------------ */

const errors = [];
const warnings = [];
const notes = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/**
 * Whole-document, not the head: mojibake is a CONTENT fault and it reached
 * the Work arrival, the ledger and three record pages before anything
 * caught it. Every structural check the site has passed on those pages —
 * headings, links, measures, contrast — because none of them looks at
 * characters. It is checked here because this is the one step that reads
 * every built byte.
 */
function auditEncoding(pages) {
  pages.forEach((p) => {
    if (seo.MOJIBAKE.test(p.html)) {
      const near = (p.html.match(/.{0,40}â€.{0,25}/) || p.html.match(/.{0,40}Ã.{0,25}/) || [''])[0];
      fail(`${p.file}: mojibake in the page — UTF-8 read as Latin-1: "${near.trim()}"`);
    }
  });
}

function audit(routes) {
  const byCanonical = new Map();
  const byDescription = new Map();
  const byTitle = new Map();
  const declaredIds = new Set();
  const referencedIds = [];

  routes.forEach((r) => {
    if (!r.title) fail(`${r.file}: no <title>.`);
    if (!r.description) fail(`${r.file}: no meta description.`);
    if (!r.canonical) fail(`${r.file}: no canonical.`);

    if (r.canonical && r.canonical.indexOf(seo.ORIGIN) !== 0) {
      fail(`${r.file}: canonical "${r.canonical}" is not under ${seo.ORIGIN}.`);
    }
    if (/\.html$/.test(r.canonical)) {
      fail(`${r.file}: canonical ends in .html — the site's canonicals are extensionless.`);
    }
    if (r.ogUrl !== r.canonical) {
      fail(`${r.file}: og:url "${r.ogUrl}" disagrees with the canonical "${r.canonical}".`);
    }

    // The fault this pass exists to fix: a page-relative og:image is not a
    // URL a scraper can resolve, and every share card on the site was blank.
    if (r.ogImage && !/^https:\/\//.test(r.ogImage)) {
      fail(`${r.file}: og:image "${r.ogImage}" is not absolute.`);
    }
    const wantCard = r.ogImage ? 'summary_large_image' : 'summary';
    if (r.twitterCard !== wantCard) {
      fail(`${r.file}: twitter:card is "${r.twitterCard}" with${r.ogImage ? '' : 'out'} an og:image; expected "${wantCard}".`);
    }
    if (r.ogTitle !== r.title) fail(`${r.file}: og:title disagrees with <title>.`);
    /* Every route of the SITE is indexable. A client OPTION is not a route
       of the site — it is a surface shown to Mahesh and then either adopted
       or deleted — so it declares `robots` in the route contract, is kept
       out of the sitemap below, and is exempt here. The exemption is by
       DECLARATION, not by filename: an accidental noindex on a real page
       still stops the build, which is the whole point of this check. */
    if (/noindex/i.test(r.robots) && !seo.OPTION_ROUTES.includes(r.file)) {
      fail(`${r.file}: robots says noindex; every route on this site is indexable.`);
    }

    if (r.description.length > seo.DESCRIPTION_MAX) {
      fail(`${r.file}: description is ${r.description.length} chars, past the ${seo.DESCRIPTION_MAX}-char snippet.`);
    } else if (r.description.length < seo.DESCRIPTION_MIN) {
      fail(`${r.file}: description is ${r.description.length} chars — too thin to be a sentence.`);
    } else if (r.description.length < 50) {
      warn(`${r.file}: description is ${r.description.length} chars (deliberate on Contact, worth a look elsewhere).`);
    }
    if (r.title.length > seo.TITLE_MAX) {
      warn(`${r.file}: title is ${r.title.length} chars; a result truncates around ${seo.TITLE_MAX}.`);
    }

    [[byCanonical, r.canonical, 'canonical'], [byDescription, r.description, 'description'], [byTitle, r.title, 'title']]
      .forEach(([map, value, what]) => {
        if (!value) return;
        if (map.has(value)) fail(`${r.file} and ${map.get(value)} share a ${what}: "${value.slice(0, 70)}"`);
        else map.set(value, r.file);
      });

    if (r.jsonLd) {
      let parsed = null;
      try {
        parsed = JSON.parse(r.jsonLd);
      } catch (e) {
        fail(`${r.file}: the JSON-LD block does not parse — ${e.message}`);
      }
      if (parsed) {
        const nodes = Array.isArray(parsed) ? parsed : [parsed];
        nodes.forEach((n) => {
          if (n['@id']) declaredIds.add(n['@id']);
          Object.keys(n).forEach((k) => {
            const v = n[k];
            if (v && typeof v === 'object' && !Array.isArray(v) && v['@id'] && Object.keys(v).length === 1) {
              referencedIds.push({ file: r.file, id: v['@id'], key: k });
            }
          });
          if (!n['@context']) fail(`${r.file}: a JSON-LD node has no @context.`);
        });
      }
    }
  });

  // A reference to an @id nothing declares is a node pointing at nothing —
  // invisible in the browser and a dead edge to a consumer.
  referencedIds.forEach((ref) => {
    if (!declaredIds.has(ref.id)) fail(`${ref.file}: JSON-LD ${ref.key} references "${ref.id}", which no page declares.`);
  });

  /**
   * THE CANONICALS ARE EXTENSIONLESS AND THE FILES ARE NOT — and the host
   * is now named: GITHUB PAGES (Mahesh, Session I, 1 Aug 2026), which
   * resolves /contact to contact.html, so the extensionless shape is
   * correct as built. The count is still printed because the fact it
   * guards is conditional on the host: a move to a host that does not
   * strip the extension re-opens this as a 404 on every canonical, and a
   * decision that stops being printed becomes a fact nobody re-checks.
   */
  const extensionless = routes.filter((r) => r.canonical && !/\/$/.test(r.canonical)).length;
  notes.push(
    `${extensionless} of ${routes.length} canonicals are extensionless against .html files — correct on ` +
      `GitHub Pages, the named host (Session I). A host change re-opens this: elsewhere it is a 404 on every canonical.`
  );

  const withoutImage = routes.filter((r) => !r.ogImage);
  if (withoutImage.length) {
    notes.push(
      `${withoutImage.length} routes share as a plain link card, having no og:image by decision ` +
        `(no photograph exists for them): ${withoutImage.map((r) => r.file).join(', ')}.`
    );
  }
}

/* ------------------------------------------------------------------ */

function writeSitemap(routes) {
  /* A client OPTION is shown, never published, so it is not in the sitemap.
     See seo.OPTION_ROUTES for what that means and why it is a named list. */
  const urls = routes
    .filter((r) => !seo.OPTION_ROUTES.includes(r.file))
    .map((r) => r.canonical)
    .filter(Boolean)
    .sort((a, b) => (a.length - b.length) || a.localeCompare(b));

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u.replace(/&/g, '&amp;')}</loc></url>`).join('\n') +
    '\n</urlset>\n';

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  return urls.length;
}

function writeRobots() {
  const body = [
    '# Proarc — https://proarc.ae',
    '#',
    '# Every route on this site is indexable, /careers included: it is off-nav',
    '# because the four-item overlay is a navigation decision, not because the',
    '# page is private. It is a working recruitment route and it is in the',
    '# sitemap.',
    '#',
    '# php/ holds the form handlers. There is nothing there for a crawler to',
    '# read and a handler is not a page.',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /php/',
    '',
    `Sitemap: ${seo.ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), body, 'utf8');
}

/* ------------------------------------------------------------------ */

function main() {
  const pages = builtPages();
  const routes = pages.map(readRoute);
  if (!routes.length) {
    console.error('seo: no built pages found. Run the page builds first.');
    process.exit(1);
  }

  auditEncoding(pages);
  audit(routes);
  const count = writeSitemap(routes);
  writeRobots();

  console.log(`\nSEO — audited ${routes.length} route(s).`);
  console.log(`  ✓ sitemap.xml   ${count} URLs, no lastmod/changefreq/priority`);
  console.log(`  ✓ robots.txt    all indexable, php/ disallowed, sitemap declared`);
  notes.forEach((n) => console.log(`  · ${n}`));
  if (warnings.length) {
    console.warn(`\n${warnings.length} warning(s):`);
    warnings.forEach((w) => console.warn('  ! ' + w));
  }
  if (errors.length) {
    console.error(`\n${errors.length} CONTRACT ERROR(S):`);
    errors.forEach((e) => console.error('  ✗ ' + e));
    process.exit(1);
  }
}

main();
