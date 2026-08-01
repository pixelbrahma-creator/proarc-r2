'use strict';

/**
 * /careers — Screen 07 §8.
 *
 * The page is one paragraph plus the application form, and both of the
 * things this file supplies are there so a fact is not written down twice:
 *
 *   THE PRACTICE'S EMAIL COMES FROM CONTACT'S DATA FILE. It appears in this
 *   page's paragraph, it is where the application routes, and it is already
 *   in data/contact.json as one of ProArc's own published values. Reading
 *   it from there rather than retyping it into the source is what stops the
 *   two pages disagreeing the day it changes. (The menu overlay in
 *   partials/header.html holds a third, hand-written copy; that one is
 *   watched by the Contact sweep rather than fixed here, because threading
 *   data through the chrome touches every page's shell.)
 *
 *   THE ROUTE IS NAMED AND KNOWN-MISSING. There is no php/careers.php:
 *   php/contact.php is a five-field message handler that would drop a CV
 *   without saying so, and it fatals on PHP 8 anyway. The action still
 *   points at the route the forms phase must build, because a form with no
 *   action posts to the page itself and discards an application in silence
 *   where a named route fails loudly. The build says so every run.
 *
 * WHAT IS DELETED HERE, AND IT IS DELETED BY NOT EXISTING (§8): the
 * `Current Openings` section and its two "[ Job Title ]" placeholders,
 * which shipped live to the public; `Why Work With Us` and its
 * unsupportable claims; and the X6 staffing register, which appeared twice
 * on the live page including inside the form's own placeholder — and a
 * fourth time in this route's meta description until this build.
 */

const fs = require('fs');
const path = require('path');
const contact = require('./contact');

const ROOT = path.join(__dirname, '..', '..');

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The register the live page repeated twice and the route contract carried
 * a third time. It is checked on the way out rather than remembered: X9
 * bars a headcount permanently and X6 has not answered, so no form of this
 * sentence has a surface anywhere until ProArc supplies one.
 */
const STAFFING_REGISTER = /architects?,?\s+engineers?\s+and\s+(?:site\s+engineers?|mep)/i;

function viewData(prefix, pageData) {
  const c = contact.load();
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'careers.json'), 'utf8'));
  const form = db.form || {};

  ['action', 'method', 'enctype', 'accept'].forEach((k) => {
    if (typeof form[k] !== 'string' || !form[k].trim()) {
      throw new Error(`careers: form.${k} is missing from data/careers.json. A file upload needs all four.`);
    }
  });
  if (form.enctype !== 'multipart/form-data') {
    throw new Error(`careers: enctype is "${form.enctype}". A CV upload posted as urlencoded arrives as a filename and nothing else.`);
  }
  if (pageData && STAFFING_REGISTER.test(String(pageData.description))) {
    throw new Error(
      `careers: the route description carries the X6 staffing register ("${pageData.description}"). ` +
        `It was deleted from two live surfaces on this page; a meta description is a third.`
    );
  }

  const exists = fs.existsSync(path.join(ROOT, form.action));
  console.log(
    `    careers: the application posts to ${form.action}, which ${exists ? 'exists' : 'DOES NOT EXIST IN THE TREE'} — ` +
      `the forms phase's to build (07-about.md §8). Until it does, the paragraph's ${c.email} is the working route.`
  );

  return {
    formAction: escapeAttr(prefix + form.action),
    formMethod: escapeAttr(form.method),
    formEnctype: escapeAttr(form.enctype),
    cvAccept: escapeAttr(form.accept),
    email: escapeAttr(c.email),
    emailHref: escapeAttr('mailto:' + c.email),
  };
}

function hasViewData(srcName) {
  return srcName === 'careers';
}

module.exports = { hasViewData, viewData, STAFFING_REGISTER };
