'use strict';

/**
 * Contact's facts and its Subject index — Screen 08.
 *
 * Spec: `_bmad/wds/D-UX-Design/08-contact.md` §4 (the rows), §6 (the form),
 * §12 (X14 / X15). Data: `_bmad/wds/D-UX-Design/08-contact-data.md` §1, and
 * `data/contact.json` carries it. The page's words live in
 * `pages-src/contact.html`; this file supplies only what is data.
 *
 * IT INVENTS NOTHING AND IT PLACEHOLDS NOTHING. Two facts about ProArc are
 * unpublished — the street address (X14) and the office day range (X15) —
 * and the rule for both is the same:
 *
 *   A BRACKETED DUMMY IS A BOARD DEVICE AND DIES AT BUILD. `08-contact-data`
 *   §5 says so because `/careers` shipped "[ Job Title ]" live to the public,
 *   which is the section Screen 07 deleted. A square bracket anywhere in
 *   data/contact.json THROWS here rather than reaching a reader.
 *
 *   AN OPEN GATE RENDERS AN ABSENCE, NEVER A PLACEHOLDER. With no street the
 *   row relabels to Post and carries the PO Box alone — §4's own written
 *   fallback, so that a bare PO Box never ships under the label "Address"
 *   (the fault X14 names on three surfaces). With no day range the Hours row
 *   is not rendered at all: the row exists to answer "when can I reach you",
 *   and a time with no days does not answer it. Both are one edit to
 *   data/contact.json away from arriving — no markup changes.
 *
 *   THE GATES ARE PRINTED EVERY BUILD. About's X5 placements taught it: a
 *   guess that stops being printed has become a fact without anyone deciding
 *   it. An absent row is quieter than a wrong one and therefore easier to
 *   forget, so the build says out loud which rows are missing and why.
 *
 *   THE PRINTED NUMBER AND THE DIALLED NUMBER ARE ONE NUMBER. The tel: href
 *   is derived from the phone string, never authored beside it. ProArc's own
 *   site writes the number both ways (+97167446633 in markup, spaced in
 *   copy) and that is exactly how a digit goes missing from one of them.
 *
 * THE ROUTE IS THE THIRD GATE, AND IT IS PRINTED LIKE THE OTHER TWO.
 * `php/contact.php` calls get_magic_quotes_gpc(), removed in PHP 8, and a
 * static host executes no PHP at all. Mahesh decided it in Session J: no
 * submission now, wired when there is real hosting (10-forms.md §0).
 *
 *   THE ACTION IS NOT NULLED, unlike street and hours.days. A form with no
 *   action posts to the page itself and discards a real client's enquiry in
 *   silence; a named route fails loudly, and js/forms.js turns that loud
 *   failure into a stated one that keeps every word the reader typed and
 *   names the working channel.
 *
 *   THERE IS NO WIRED FLAG, for this file's own reason: a flag and a value
 *   can contradict each other and one of them is then a lie. Nothing here
 *   or in the build decides whether the route works — the script posts and
 *   reads the answer, so the same code is correct on a static host today
 *   and on a server at cutover.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function escapeText(s) {
  return String(s).replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function readJson(...parts) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, ...parts), 'utf8'));
}

/* ------------------------------------------------------------------ *
 * The contract
 * ------------------------------------------------------------------ */

/**
 * Every string that can reach the page passes through here. The bracket is
 * the shippable-dummy tell and it is checked on the way out of the data
 * file rather than at review time, because review is what missed it on the
 * live site.
 */
function clean(value, where) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw new Error(`contact: ${where} is ${typeof value} in data/contact.json; every published value is a string or null.`);
  }
  const s = value.trim();
  if (!s) {
    throw new Error(`contact: ${where} is empty in data/contact.json. An unknown fact is null — a blank is a row with nothing in it.`);
  }
  if (/[[\]]/.test(s)) {
    throw new Error(
      `contact: ${where} carries a square bracket ("${s}"). Bracketed dummies are a board device ` +
        `(08-contact-data.md §5) and die at build — "[ Job Title ]" shipped live on /careers once. ` +
        `Leave the value null: an open gate renders nothing.`
    );
  }
  return s;
}

function load() {
  const db = readJson('data', 'contact.json');
  const pub = db.published || {};

  const poBox = clean(pub.poBox, 'published.poBox');
  const phone = clean(pub.phone, 'published.phone');
  const email = clean(pub.email, 'published.email');
  const street = clean(db.street, 'street');
  const times = clean(db.hours && db.hours.times, 'hours.times');
  const days = clean(db.hours && db.hours.days, 'hours.days');
  const action = clean(db.form && db.form.action, 'form.action');
  const method = clean(db.form && db.form.method, 'form.method');
  const lat = clean(db.coords && db.coords.lat, 'coords.lat');
  const lng = clean(db.coords && db.coords.lng, 'coords.lng');

  if (!poBox || !phone || !email) {
    throw new Error('contact: poBox, phone and email are ProArc\'s own published values (08-contact-data.md §1) and none of them is optional.');
  }
  if (!times) {
    throw new Error('contact: hours.times is confirmed (9:00–18:00, Mahesh 31 Jul). Only hours.days is gated.');
  }
  // Derived, not authored: a space or a dash in the printed number must not
  // be able to change what a tap dials.
  const dial = phone.replace(/[^\d+]/g, '');
  if (!/^\+\d{7,15}$/.test(dial)) {
    throw new Error(`contact: "${phone}" does not reduce to an international dialling string (got "${dial}"); the tel: href is derived from it.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`contact: "${email}" is not an email address; the mailto: href is derived from it.`);
  }

  /* ------------------------------------------------------------------ *
   * DIRECTIONS (Session XXXVII) — a link keyed on a POINT, never on prose
   *
   * 🔴 THE TARGET IS THE ONE THING THIS LINK CAN GET WRONG, and v1 gets it
   * wrong. proarc.ae ships a "Get Directions" button asking Google Maps for
   * `13003, Ajman, United Arab Emirates` — THE PO BOX, handed over as though
   * it were a street address — so the reader is delivered to whatever Google
   * guesses that means. 08-contact §7: "Broken by construction, not by a bad
   * URL." A PO Box cannot be navigated to; that is the whole of X14.
   *
   * So it is keyed on ProArc's OWN PUBLISHED PIN — `proarc.ae/js/scripts.js`
   * carries `latLng: [25.392760, 55.436931]`, "Our office - Ajman" — which is
   * confirmed data under 08-contact-data §1 (what ProArc publishes about
   * itself) rather than a directory's account of ProArc. A coordinate cannot
   * be misresolved, and it stays right even if the street STRING is wrong:
   * the pin is the location, the address is its caption.
   *
   * 🔴 IT IS DERIVED, NOT AUTHORED, for the same reason `tel:` is: a URL
   * typed beside a number is a second copy of the number, and the two drift.
   * ------------------------------------------------------------------ */
  if (!/^-?\d{1,3}\.\d{4,}$/.test(lat) || !/^-?\d{1,3}\.\d{4,}$/.test(lng)) {
    throw new Error(`contact: coords must be decimal degrees at 4+ places (got "${lat}", "${lng}"); the directions href is derived from them.`);
  }
  const mapsHref = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lat + ',' + lng);

  /* 🔴 THE PO BOX MAY NEVER REACH THE MAP. This is v1's exact fault written
     as a guard rather than as a warning: the day somebody "simplifies" the
     href to use the address, the build stops instead of shipping a button
     that sends clients to the wrong place. */
  if (mapsHref.indexOf(poBox.replace(/\D/g, '').slice(0, 5)) > -1) {
    throw new Error('contact: the directions link resolves the PO Box. That is v1\'s fault (08-contact §7) — it is keyed on coords, never on the postal string.');
  }

  return { poBox, phone, dial, email, street, times, days, action, method, lat, lng, mapsHref };
}

/* ------------------------------------------------------------------ *
 * THE DIRECTIONS MARK — drawn once, used on three surfaces
 *
 * 🔴 IT IS NOT A GOOGLE GLYPH, AND IT CANNOT BE. §1.5a rule 1 bars
 * redrawing a third-party mark and rule 3 bars any third-party mark from
 * `--color-surface-dark` — and two of this link's three homes, the footer
 * and the overlay, are black. A branded pin was barred in both before it
 * was drawn. What is imported by a Google-shaped glyph is exactly what
 * 09-menu §11 refuses an embedded map for: "someone else's typography,
 * colour, controls" inside a monochrome page.
 *
 * 🔴 AND IT NEVER SHIPS ALONE. The site's only other icon is About's ISO
 * ring-seal (07-about §13.5.4), and its record settles this: "not text rows"
 * was resolved as ICONS-PLUS-TEXT, because "a bare icon row would have lost
 * the gate's readable claim". The footer's own socials are the WORDS
 * Facebook and Instagram, where an icon is the universal convention. So this
 * is a mark BESIDE a word, in the site's own hairline register, and the word
 * is what carries the link's meaning to a screen reader — the drawing is
 * `aria-hidden`, as the ring-seals are.
 *
 * The geometry is the ring the ISO seals already established, set on a stem:
 * a location reduced to a hairline. `currentColor` is what lets one drawing
 * serve paper and black without a second asset or a filter.
 * ------------------------------------------------------------------ */
const DIRECTIONS_MARK =
  '<svg class="wayfind__mark" width="12" height="16" viewBox="0 0 12 16" ' +
  'fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true" focusable="false">' +
  '<circle cx="6" cy="6" r="4.5"/><path d="M6 10.5V15.5"/></svg>';

function directionsMark() {
  return DIRECTIONS_MARK;
}

/* ------------------------------------------------------------------ *
 * The facts — §4
 * ------------------------------------------------------------------ */

/**
 * Three or four ruled rows. Every row carries every key: {{#each}} merges
 * the item over the page data, so a key left absent on one row would
 * inherit whatever the outer scope happens to hold under that name.
 *
 * `isolate` is §4's RTL clause. The values it marks are identifiers written
 * in Latin script — a PO Box, a phone number, an email address — and they
 * must not reorder around Arabic text. Hours is not marked: its value is
 * the one on this page that becomes Arabic when the page does.
 */
function factRows(d) {
  const rows = [];

  if (d.street) {
    rows.push({
      label: 'Address',
      href: '',
      plain: true,
      isolate: true,
      value: '',
      lines: [d.street, d.poBox].map(escapeText),
      /* 🔴 THE LINK RIDES ON THE ADDRESS ROW AND NOWHERE ELSE ON THIS PAGE.
         08-contact §7 wrote the shape before the gate cleared — when X14
         clears "it returns as A FACTS-ROW PLUS A PLAIN LINK, not a photo
         band" — and this is that sentence built. It is also why /contact
         does not get a second directions link of its own further down: S-2
         refuses repeating the footer's row one viewport above the footer,
         and a door printed twice on one page is that fault exactly. */
      way: true,
      wayHref: escapeAttr(d.mapsHref),
      wayMark: DIRECTIONS_MARK,
    });
  } else {
    rows.push({
      label: 'Post',
      href: '',
      plain: true,
      isolate: true,
      value: '',
      lines: [escapeText(d.poBox)],
      way: '',
      wayHref: '',
      wayMark: '',
    });
  }

  rows.push({
    label: 'Phone',
    href: escapeAttr('tel:' + d.dial),
    plain: '',
    isolate: true,
    value: escapeText(d.phone),
    lines: [],
    way: '',
    wayHref: '',
    wayMark: '',
  });

  rows.push({
    label: 'Email',
    href: escapeAttr('mailto:' + d.email),
    plain: '',
    isolate: true,
    value: escapeText(d.email),
    lines: [],
    way: '',
    wayHref: '',
    wayMark: '',
  });

  if (d.days) {
    rows.push({
      label: 'Hours',
      href: '',
      plain: true,
      isolate: '',
      value: '',
      lines: [escapeText(`${d.days}, ${d.times}`)],
      way: '',
      wayHref: '',
      wayMark: '',
    });
  }

  // The fault X14 names on three surfaces, asserted rather than remembered.
  rows.forEach((r) => {
    if (r.label === 'Address' && !d.street) {
      throw new Error('contact: a PO Box under the label "Address" is the X14 fault itself. The label is Post until a street arrives.');
    }
  });

  /* 🔴 EVERY ROW CARRIES EVERY KEY, AND THAT IS NOW ASSERTED RATHER THAN
     WRITTEN IN A DOCSTRING. `{{#each}}` merges the item over the page data,
     so a key MISSING from one row does not render empty — it inherits
     whatever the outer scope holds under that name. Three keys arrived this
     session and had to be spelled onto four rows that do not use them; the
     docstring above has said so since §4 was built, and a sentence is not a
     guard. */
  const KEYS = ['label', 'href', 'plain', 'isolate', 'value', 'lines', 'way', 'wayHref', 'wayMark'];
  rows.forEach((r) => {
    const missing = KEYS.filter((k) => !(k in r));
    if (missing.length) {
      throw new Error(`contact: the "${r.label}" row is missing ${missing.join(', ')} — an absent key inherits the page scope's value under that name, it does not render empty.`);
    }
  });

  /* Exactly one row may carry the door. */
  const doors = rows.filter((r) => r.way).length;
  if (doors > 1) {
    throw new Error(`contact: ${doors} facts rows carry the directions link; §7 puts it on the address and S-2 refuses the repeat.`);
  }

  return rows;
}

/* ------------------------------------------------------------------ *
 * The Subject index — §6
 * ------------------------------------------------------------------ */

/**
 * `?project={slug}` pre-fills Subject with the building's own title, so the
 * mapping is the records' and is emitted as an island rather than guessed
 * from the slug at runtime — "seasidehills" is not a building's name, and
 * title-casing a slug would invent one. An unknown slug finds no entry and
 * the page works, which is §6's stated behaviour by construction.
 */
function subjectIndexJson() {
  const db = readJson('data', 'projects.json');
  const index = {};
  db.projects.forEach((p) => {
    if (!p.slug || !p.title) {
      throw new Error(`contact: a record in data/projects.json has no ${p.slug ? 'title' : 'slug'}; the Subject index is built from both.`);
    }
    index[p.slug] = p.title;
  });
  const count = Object.keys(index).length;
  if (!count) {
    throw new Error('contact: the Subject index is empty. Every closing band on a record page links here with ?project=.');
  }
  return { json: JSON.stringify(index).replace(/<\/script/gi, '<\\/script'), count };
}

/* ------------------------------------------------------------------ *
 * The view
 * ------------------------------------------------------------------ */

function viewData(prefix) {
  const d = load();
  const facts = factRows(d);
  const subject = subjectIndexJson();

  const labels = facts.map((r) => r.label);
  if (new Set(labels).size !== labels.length) {
    throw new Error(`contact: two fact rows share a label (${labels.join(' · ')}).`);
  }

  console.log(
    `    contact: ${facts.length} fact rows — ${labels.join(' · ')}. ` +
      `X14 ${d.street ? 'CLOSED' : 'OPEN'}: ${d.street ? 'the street ships under Address' : 'no street address is published, so the row is Post and carries the PO Box alone'}. ` +
      `X15 ${d.days ? 'CLOSED' : 'OPEN'}: ${d.days ? `the office is open ${d.days}` : 'the day range is unknown, so no Hours row is rendered (times are confirmed ' + d.times + ')'}.`
  );
  console.log(
    `    contact: THE ROUTE GATE IS OPEN — the form posts to ${d.action}, which fatals on PHP 8 and ` +
      `executes nothing on a static host, so every submission fails and the form says so (10-forms.md §0). ` +
      `Decided by Mahesh: no submission now, wired when there is real hosting. Set form.action in ` +
      `data/contact.json and the success state arrives with no code change.`
  );
  console.log(`    contact: ${subject.count} project slugs in the Subject index for ?project=.`);

  return {
    facts,
    formAction: escapeAttr(prefix + d.action),
    formMethod: escapeAttr(d.method),
    subjectIndexJson: subject.json,
    careersHref: `${prefix}careers.html`,
    email: escapeText(d.email),
    emailHref: escapeAttr('mailto:' + d.email),
  };
}

function hasViewData(srcName) {
  return srcName === 'contact';
}

module.exports = { hasViewData, viewData, load, factRows, directionsMark };
