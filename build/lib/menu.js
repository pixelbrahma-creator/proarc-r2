'use strict';

/* =========================================================================
   The overlay's stage — 09-menu §4.4, the revision the clause left open.

   §4.4 refused a per-item panel for SERVICES, ABOUT and CONTACT on the
   grounds that they had "no honest preview content, and inventing one —
   re-spending Services' range drawing, say — would spend a page's own
   visual twice", and recorded that "a per-item panel system is open for a
   later revision if content ever exists". Content exists. This file is
   that revision, and it obeys the clause's own test: each stage spends its
   page's STRUCTURE — the names, the sentence, the steps — never its
   picture.

   🔴 EVERY STRING HERE IS READ OFF THE PAGE THAT AUTHORS IT. Nothing is
   retyped. `build/lib/home.js`'s servicesLine() established the pattern
   and the reason: Home names the services and reads them off
   pages-src/services.html so that a markup change there has to be followed
   rather than silently shipping a shorter list. The same reasoning applies
   four times over here, and each reader THROWS rather than degrading —
   a stage that renders one fewer discipline than /services is exactly the
   kind of quiet disagreement between two surfaces this project keeps
   finding.

   The constellation is NOT a stage occupant. It was the overlay's resting
   image until 8 Aug, when Mahesh refused it on the one ground no
   measurement reaches: "at rest constellation doesn't make sense since no
   one will understand it." §6 built it as ornament — deliberately no
   labels, no links, no counts — so there was nothing in it to tell a
   reader what it was. The resting stage is now the page the reader is
   already on; where no nav item is lit (Home, /ajman, /careers) it is the
   practice's own opening sentence.
   ========================================================================= */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function readPage(name) {
  return fs.readFileSync(path.join(ROOT, 'pages-src', name), 'utf8');
}

/**
 * Pull every capture of `re` out of `src`, or throw naming the page and the
 * shape that was expected. The throw is the point: a regex over markup
 * fails by returning a plausible shorter list, and this file's whole job is
 * to agree with four other pages.
 */
function harvest(src, re, min, what, page) {
  const found = [...src.matchAll(re)].map((m) => m[1].trim()).filter(Boolean);
  if (found.length < min) {
    throw new Error(
      `menu: the overlay's ${what} is read off pages-src/${page} rather than retyped, and that ` +
        `page yielded ${found.length} where at least ${min} is required. A markup change there has ` +
        `to be followed here — shipping the shorter list would leave the menu and the page ` +
        `disagreeing about ${what}, silently.`
    );
  }
  return found;
}

/* SERVICES — the six blocks, in the order a building is made.
   The twin of home.js's servicesLine(), reading the same attribute off the
   same file. Session XXVII's lesson applies: when a decision lands on two
   twin surfaces the one that is not looked at is the one that rots, so if
   `sv-block__name` ever changes, BOTH readers move. */
function serviceNames() {
  return harvest(
    readPage('services.html'),
    /class="sv-block__name[^"]*">([^<]+)</g,
    6, 'service names', 'services.html'
  );
}

/* ABOUT — the support line beneath the story's opening. Mahesh chose this
   over the four group heads and over the client wall on 8 Aug. */
function aboutLine() {
  return harvest(
    readPage('about.html'),
    /class="ab-story__support[^"]*">([^<]+)</g,
    1, 'About line', 'about.html'
  )[0];
}

/* THE RESTING LINE — the story's own h1, the sentence one line above
   aboutLine(). The two are consecutive lines of one paragraph, which is
   why they can sit in the same overlay without colliding: the rest state
   states what the practice IS, and ABOUT elaborates it. */
function restLine() {
  return harvest(
    readPage('about.html'),
    /class="ab-story__line[^"]*">([^<]+)</g,
    1, 'resting line', 'about.html'
  )[0];
}

/* CONTACT — the three steps of "What happens after you write to us".
   Authored as an <ol> on the page, so it is a real sequence rather than a
   list wearing numbers. Only the step's own name is taken; the sentence
   after the dash belongs to the page. */
function contactSteps() {
  return harvest(
    readPage('contact.html'),
    /class="ct-process__line[^"]*">\s*<b>([^<]+)<\/b>/g,
    3, 'Contact steps', 'contact.html'
  );
}

const escapeText = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function rows(items) {
  return items.map((t) => `<li class="menu-stage__row">${escapeText(t)}</li>`).join('');
}

/**
 * The three new stages plus the resting one, as one markup string. They
 * ship in the document and CSS decides which is displayed — the same
 * contract the preview already has, so a reader with no JavaScript gets a
 * complete overlay rather than an empty one.
 */
let cache = null;
function stages() {
  if (cache === null) {
    cache = [
      `<ul class="menu-stage menu-stage--services">${rows(serviceNames())}</ul>`,
      `<p class="menu-stage menu-stage--about">${escapeText(aboutLine())}</p>`,
      `<ol class="menu-stage menu-stage--contact">${rows(contactSteps())}</ol>`,
      `<p class="menu-stage menu-stage--rest">${escapeText(restLine())}</p>`,
    ].join('\n      ');
  }
  return cache;
}

module.exports = { stages, serviceNames, aboutLine, restLine, contactSteps };
