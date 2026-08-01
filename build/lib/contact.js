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
 * THE FORM'S ROUTE IS KNOWN-BROKEN AND SAYS SO, EVERY RUN. `php/contact.php`
 * calls get_magic_quotes_gpc(), removed in PHP 8, and a static host executes
 * no PHP at all. §6 hands the route to the forms phase as its first
 * question. The action is still written: a named route that fails loudly is
 * recoverable, where a form with no action posts to the page itself and
 * discards a real client's enquiry in silence. Until the forms phase runs,
 * the Email row is the page's working channel.
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

  return { poBox, phone, dial, email, street, times, days, action, method };
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
    });
  } else {
    rows.push({
      label: 'Post',
      href: '',
      plain: true,
      isolate: true,
      value: '',
      lines: [escapeText(d.poBox)],
    });
  }

  rows.push({
    label: 'Phone',
    href: escapeAttr('tel:' + d.dial),
    plain: '',
    isolate: true,
    value: escapeText(d.phone),
    lines: [],
  });

  rows.push({
    label: 'Email',
    href: escapeAttr('mailto:' + d.email),
    plain: '',
    isolate: true,
    value: escapeText(d.email),
    lines: [],
  });

  if (d.days) {
    rows.push({
      label: 'Hours',
      href: '',
      plain: true,
      isolate: '',
      value: '',
      lines: [escapeText(`${d.days}, ${d.times}`)],
    });
  }

  // The fault X14 names on three surfaces, asserted rather than remembered.
  rows.forEach((r) => {
    if (r.label === 'Address' && !d.street) {
      throw new Error('contact: a PO Box under the label "Address" is the X14 fault itself. The label is Post until a street arrives.');
    }
  });

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
    `    contact: the form posts to ${d.action} — which fatals on PHP 8 and executes nothing on a static host. ` +
      `The route is the forms phase's first question (08-contact.md §6); until it runs, the Email row is the working channel.`
  );
  console.log(`    contact: ${subject.count} project slugs in the Subject index for ?project=.`);

  return {
    facts,
    formAction: escapeAttr(prefix + d.action),
    formMethod: escapeAttr(d.method),
    subjectIndexJson: subject.json,
    careersHref: `${prefix}careers.html`,
  };
}

function hasViewData(srcName) {
  return srcName === 'contact';
}

module.exports = { hasViewData, viewData, load, factRows };
