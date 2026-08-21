/* =========================================================================
   The ground-aware chrome — the observation strip.

   Spec: Board 17 (Session K, H1-b) · v1.2 §8 · v1.3 E13.2a · E8.3

   🔴 THERE IS NO FIELD ANY MORE, ANYWHERE (Mahesh, 21 Aug 2026): "we can
   make the black box removed everywhere .. even above photographs anywhere
   ..... blackbox can even be removed from behind the hamburger."

   That retires the three-ground table this file was built on. There is no
   longer a fielded state and an ink state; there are TWO INKS, and the only
   question either half of the chrome asks is which of them to wear:

     under mostly black   →  the WHITE master / white strokes
     under mostly paper   →  the BLACK master / ink strokes

   Everything else follows from that one change, and three long-standing
   problems fall out with it:

   1. THE SHIPPED STATE IS NOW THE ROUTE CONTRACT'S. The field used to be
      the safe default — legible on every ground, so a page whose script
      never ran was still correct. With no field there is no neutral state,
      so the BUILD ships the answer: `pages-src/meta.json` already declares
      each page's opening ground (E1), and `inject-partials` writes
      `class="chrome-ink plate-ink"` onto <html> for the paper ones. The
      script then only maintains what the build already got right. Same
      doctrine, different source of truth — and the classes keep exactly
      the meaning they had, so nothing downstream is renamed.

   2. EACH HALF ASKS ABOUT ITS OWN INK, AND THE STRADDLE GOES WITH IT.
      The band used to be watched FULL-WIDTH because a corner test needs a
      physical left/right that flips in RTL. That was true of a test written
      in left/right; it is not true of one written against an element's own
      live rect, which flips with the document for free. So the trigger asks
      about the BARS' box and the plate about the MARK's box — Session
      XXXV's ruling ("the axis is the bars' INK, not the button's box")
      arriving at the question of ground as well as of position. The
      trigger's 67px straddle, open since 20 Aug, is closed by this: it was
      a band-wide answer applied to a corner.

   3. THE ANSWER IS A MAJORITY, NOT AN ANY-OVERLAP. A field was a rectangle
      and could not be half-black, which is why no threshold could fix the
      straddle. INK can be neither, but it can be wrong over part of itself
      while a boundary crosses — so the flip is put where it costs least, at
      the midpoint. See decide().

   The strip is still the chrome's own band: an IntersectionObserver whose
   root margin clips the viewport to the plate's measured height. What
   counts as dark is derived from the stylesheets, not guessed — the only
   dark-ground classes in the system are .surface-dark (tokens.css) and
   .section--dark (layout.css), plus the always-black .site-footer and the
   .overlay-panel.

   🔴 AND A PHOTOGRAPH IS THE ONE GROUND THE RULING COULD NOT REACH. It was
   built with no field at all, measured by `p33-bare-chrome.js`, and bare ink
   came back at 1.22–2.65:1 against a 3.0 floor on every route that has a
   photograph under the chrome. So over media — and nowhere else — the two
   halves part company on the line E13.2a already draws: the PLATE is
   identity and is simply absent, the TRIGGER is navigation and keeps a
   field. The full numbers and the reasoning are at MEDIA below.

   What this file deliberately does NOT own: the open overlay's state.
   components.css settles that by source order (is-menu-open rules sit
   after the ink ones), so the two can never desync.
   ========================================================================= */

(function () {
  'use strict';

  var root = document.documentElement;
  var plate = document.querySelector('.chrome-plate');
  var trigger = document.querySelector('[data-menu-trigger]');

  /* The INK of each half, which is what the ground question is asked about
     — see inkBox(). Both fall back to their padded box if the inner element
     is ever absent, so a markup change degrades to the old, coarser answer
     rather than throwing. */
  var mark = plate && plate.querySelector('.chrome-plate__mark');
  var bars = trigger && trigger.querySelector('.chrome-trigger__bars');

  /* No chrome, or no observer support: the build has already shipped the
     route contract's own ground on <html>, so doing nothing leaves the page
     correct at its opening — which is where the chrome is at load. */
  if (!plate || !trigger || !('IntersectionObserver' in window)) return;

  /* THE DECLARED GROUNDS. One set for both halves now: from 20 Aug they
     carried two different selectors because the trigger's bare strokes
     needed §8's field back over a photograph while the plate's supplied
     artwork did not. Media is asked about separately below, so this is
     purely "what ground does the design DECLARE here", and both halves ask
     it with the same rule against different boxes. */
  var DARK_BAND =
    'main .overlay-panel, .surface-dark, .section--dark, .site-footer';

  /* 🔴 MEDIA IS BACK IN THE OBSERVATION SET, AND THE REASON IS A NUMBER.

     "No box anywhere" was built exactly as ruled and then MEASURED, by
     p33, which shoots the chrome against what it actually stands on. Bare
     ink over a photograph does not clear 3:1 anywhere it was tried:

       /index      the bars over Home's frames    1.28 · 1.34 · 1.64 · 2.44
       /projects   the mark over the photo grid   1.22 · 1.26 · 1.34 · 1.78
       /homes      the bars over the sector grid  1.90 · 2.65
       /blacksquare the bars over the gallery     1.57 · 1.68

     Medians ran 3–15:1 at the same positions, so an average — or a sample
     taken anywhere but the worst patch — would have passed every one of
     them. The failures are architecture against sky: a photograph with both
     ends of the range inside one 210×99 box, which NO single ink survives.
     Per-image ink selection was considered and does not reach it for the
     same reason.

     So the ruling is delivered where it can be and the two halves part
     company again — on the line E13.2a already draws between them:

       THE PLATE IS IDENTITY AND MAY BE ABSENT. Over a photograph it shows
       no box and no mark. Identity is made on the grounds the design
       declares, and a page's photographs are not one of them.

       THE TRIGGER IS NAVIGATION AND MAY NOT. It is the only way into the
       site's only navigation surface (E13.1), so it cannot answer a
       legibility problem by leaving. Over a photograph — and ONLY there —
       its field returns.

     Media is watched with ANY overlap rather than a majority, unlike the
     ground question below. A majority would blink the plate in and out at
     every gutter of a 46-photograph grid; any-overlap gives one clean
     transition at each edge of a run of pictures. */
  var MEDIA = 'main img, main video, main canvas';
  var WATCHED = DARK_BAND + ', ' + MEDIA;

  var observer = null;
  var inBand = new Set();
  var bandHeight = 0;                      /* set by arm() */

  /* THE TWO BOXES ARE THE INK'S, NOT THE PADDED BUTTON'S.

     Session XXXV ruled the axis off the bars rather than off the trigger's
     box, on Mahesh reading the page: the box sat on the text edge and the
     three strokes sat 25px inside it. The same distinction decides GROUND,
     and it matters more here than it did there — the plate's padded box is
     50px wider and 50px taller than the mark inside it, so a boundary
     entering the box changes the answer a full clear-space before it
     reaches any ink the reader can see.

     Horizontal extent is read live off the element, so RTL is carried for
     free — that is what a hardcoded left/right could not do, and the reason
     the band was originally watched full-width instead of per-corner.

     The VERTICAL is clipped to the band rather than taken from the rect,
     because the retreat is a translateY: a retired chrome would otherwise
     report itself as standing over nothing and latch the wrong ink for its
     own return. */
  function inkBox(el) {
    var r = el.getBoundingClientRect();
    var top = Math.max(0, Math.min(r.top, bandHeight || r.height));
    var bottom = Math.min(bandHeight || r.height, Math.max(r.bottom, 0));
    if (bottom <= top) { top = 0; bottom = Math.min(r.height, bandHeight || r.height); }
    return { left: r.left, right: r.right, top: top, bottom: bottom };
  }

  function overlapArea(el, box) {
    var q = el.getBoundingClientRect();
    if (!(q.width > 0 && q.height > 0)) return 0;
    var w = Math.min(q.right, box.right) - Math.max(q.left, box.left);
    var h = Math.min(q.bottom, box.bottom) - Math.max(q.top, box.top);
    return w > 0 && h > 0 ? w * h : 0;
  }

  /* 🔴 THE ANSWER IS A MAJORITY OF THE INK'S OWN BOX, AND THE THRESHOLD IS
     THE POINT OF THE WHOLE THING.

     While a ground boundary crosses the mark, part of the mark is over black
     and part over paper, and NO single ink is right for both. A field could
     not be half-black at all, which is why 20 Aug's straddle had no fix
     except taking the plate off screen early. Ink can be wrong over part of
     itself — briefly — so the question stops being "can this be avoided" and
     becomes "where does the flip cost least".

     At the midpoint. Flip on first contact and the ink is wrong over almost
     the whole mark for the whole crossing; flip on last contact and it is
     wrong over almost the whole mark in the other direction. At 0.5 the
     worst case is half the mark for half the crossing, and it is symmetric
     in both scroll directions — which matters now that the chrome comes
     back on the way up.

     Areas are summed and clamped: two declared dark bands do not overlap
     each other in this system, but a clamp costs nothing and an unclamped
     sum would flip early if one ever did. */
  function groundIsDark(el) {
    var box = inkBox(el);
    var area = (box.right - box.left) * (box.bottom - box.top);
    if (!(area > 0)) return false;
    var dark = 0;
    inBand.forEach(function (node) {
      if (node.matches(DARK_BAND)) dark += overlapArea(node, box);
    });
    return Math.min(dark, area) / area > 0.5;
  }

  function mediaUnder(el) {
    var box = inkBox(el);
    var hit = false;
    inBand.forEach(function (node) {
      if (!hit && node.matches(MEDIA) && overlapArea(node, box) > 0) hit = true;
    });
    return hit;
  }

  function decide() {
    var markMedia = mediaUnder(mark || plate);
    var barsMedia = mediaUnder(bars || trigger);

    /* Each half, its own ink, the same rule. `chrome-ink` and `plate-ink`
       keep exactly the meaning they have always had — the ink state, black
       strokes and the black master — so nothing downstream is renamed by
       the field's removal.

       Over media the ink question is moot for the plate (it is not painted)
       and settled for the trigger (a field is behind it, so its strokes are
       white). Answering it anyway keeps the state single-valued rather than
       undefined, which is what a probe reads. */
    root.classList.toggle('chrome-ink', !barsMedia && !groundIsDark(bars || trigger));
    root.classList.toggle('plate-ink', !groundIsDark(mark || plate));

    /* The plate leaves; the trigger fields. See the note at MEDIA. */
    root.classList.toggle('plate-on-media', markMedia);
    root.classList.toggle('chrome-fielded', barsMedia);
  }

  function onEntries(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) inBand.add(entry.target);
      else inBand.delete(entry.target);
    });
    decide();
  }

  /* -----------------------------------------------------------------
     The mark's two states. The arrival element is the page's own first
     band — main's first child, or, where that child is a page-spanning
     .surface-dark WRAPPER (Services, /ajman), ITS first child. While it
     intersects the chrome band the mark is at arrival size; once it has
     scrolled past, html.chrome-quiet steps the mark to the reading size.
     The edge is the page's own, never a guessed pixel threshold. Landing
     mid-page (back button, anchors) starts quiet, which is correct.

     A wrapper is a DIV and a band is a SECTION, and that distinction is
     load-bearing rather than stylistic. The first form of this test asked
     only whether the first child carried .surface-dark — true of Services'
     and /ajman's grouping div, and equally true of Home's opening screen,
     which is a band in its own right. On Home it descended into the
     sentence's .container, a box that begins BELOW the chrome band, so the
     quiet state armed at scroll 0 and the 160 arrival mark never rendered
     on the page it was tuned against. The rule was written from two pages'
     markup and a third page adopted the same class for a different reason.
     ----------------------------------------------------------------- */
  var arrivalObserver = null;

  function arrivalTarget() {
    var main = document.querySelector('main');
    if (!main) return null;
    var t = main.firstElementChild;
    if (t && t.tagName === 'DIV' && t.classList.contains('surface-dark') && t.firstElementChild) {
      t = t.firstElementChild;
    }
    return t;
  }

  function onArrival(entries) {
    root.classList.toggle('chrome-quiet', !entries[entries.length - 1].isIntersecting);
    /* The retreat is gated on this state, and this callback is the moment it
       changes — see applyRetreat's note. Declared below and hoisted; the
       observer cannot fire before the script has finished evaluating. */
    applyRetreat();
  }

  function arm() {
    if (observer) observer.disconnect();
    if (arrivalObserver) arrivalObserver.disconnect();
    inBand.clear();

    /* The band is the plate's RENDERED height — measure the box, never
       the declared value. The quiet state shrinks the plate, so the band
       is always measured at ARRIVAL size (the CSS var, not the live box)
       — otherwise the flip back would use a shorter band than the flip
       out, and the state would chatter at the boundary. */
    var arrivalMark = parseFloat(
      getComputedStyle(plate).getPropertyValue('--mark-size')
    );
    var pad = 2 * parseFloat(getComputedStyle(plate).paddingBlockStart);

    /* 🔴 THE MARK'S PROPORTION IS READ OFF THE MARK, NEVER TYPED. This was
       `117 / 330` — the first asset's canvas — and it was already wrong the
       moment ProArc supplied masters at a different ratio, silently, because
       nothing here would have thrown: a stale ratio just returns a band of
       the wrong height, and the ground and arrival states then flip at the
       wrong scroll position on all 58 pages. getAttribute rather than .width
       or naturalWidth: both of those answer the LOADED image, and this runs
       before the mark has decoded. */
    var markW = mark ? parseFloat(mark.getAttribute('width')) : 0;
    var markH = mark ? parseFloat(mark.getAttribute('height')) : 0;
    var ratio = markW > 0 && markH > 0 ? markH / markW : 0;

    var band = arrivalMark > 0 && ratio > 0
      ? Math.ceil(arrivalMark * ratio + pad)
      : Math.ceil(plate.getBoundingClientRect().height) || 112;
    bandHeight = band;                     /* decide() reads this */
    /* The retire threshold is a screen plus a margin, so its larger term
       belongs to the viewport rather than to the stylesheet — re-read here
       because arm() is what runs on resize. Declared below and hoisted. */
    RETIRE_TRAVEL = window.innerHeight + RETIRE_MARGIN;
    var below = Math.max(0, window.innerHeight - band);
    var opts = {
      root: null,
      rootMargin: '0px 0px -' + below + 'px 0px',
      threshold: 0,
    };

    /* 🔴 `plate-away` IS GONE, AND THE REASON IT EXISTED WENT WITH THE FIELD.

       It was added on 20 Aug to answer "i am seeing box when i scroll":
       `chrome-quiet` arms only once the arrival has left the chrome's band
       ENTIRELY, so for the last `band` pixels of the arrival that edge swept
       up through the plate's own box and the lower part of a SOLID FIELD
       hung over paper — 6px growing to 96px on Home. A field is a rectangle
       and cannot be half-black, so no threshold could fix it and the only
       answer was to take the plate off screen a band early.

       There is no rectangle now. The boundary still crosses the mark, but
       what crosses it is ink, and decide() puts the flip at the midpoint
       where it costs least. So the plate no longer has to hide from its own
       page, which is precisely what made Mahesh's second ask affordable:
       **removing the box is what lets the plate stay longer and come back
       sooner.** It travels on `chrome-retired` with the trigger now.

       📌 p14 IS STILL THE REASON `chrome-quiet` ITSELF IS UNTOUCHED. Moving
       it moves when the chrome's transitions run, and `p14-services-motion`
       samples `document.getAnimations()` — the whole document — so the
       chrome's transform lands inside its measurement window. p14 is scoped
       now, but the coupling is a property of any probe that asks the
       document, so chrome-quiet keeps its meaning: the mark's SIZE step,
       and the gate on the retreat. */
    observer = new IntersectionObserver(onEntries, opts);
    arrivalObserver = new IntersectionObserver(onArrival, opts);

    var entry = arrivalTarget();
    if (entry) arrivalObserver.observe(entry);

    var targets = document.querySelectorAll(WATCHED);
    if (targets.length === 0) {
      /* A page with no dark ground anywhere: nothing will ever fire, so
         decide now — and decide BOTH, or a half is left wearing whatever
         the build shipped on a page that can never correct it. */
      root.classList.add('chrome-ink');
      root.classList.add('plate-ink');
      return;
    }
    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  }

  /* -----------------------------------------------------------------
     THE RETREAT — E13.2a (4 Aug 2026, Mahesh). The chrome uncovers the page.

     🔴 THIS FILE'S OPENING CLAIM — "no scroll threshold to guess and no
     scroll listener at all" — IS NO LONGER TRUE, AND THAT IS THE WHOLE COST
     OF THE AMENDMENT. E13.2 bought permanence with "no scroll listener, no
     state change, nothing to desync", and permanence is what buried text ink
     on every long page: measured over ink rather than boxes, the trigger
     covers 4.53% of all visible lines at 1440 and 8.00% at 375, the plate
     2.89% and 4.89%. /ajman's authority sentence was cut mid-word at display
     size. So there is now exactly one scroll listener, and it is written to
     keep the rest of the claim: the retreat has ONE state, derived from a
     direction, and it can only ever desync into the SAFE state (present).

     WHAT IT IS NOT GATED ON: a pixel threshold. The retreat only applies once
     the page is past its own arrival, and `chrome-quiet` — the arrival
     observer above — already answers that question from the page's own first
     band. So the threshold this file refused to guess is still not guessed.

     🔴 THE TRAVEL IS ASYMMETRIC NOW, AND THAT IS THE SECOND HALF OF MAHESH'S
     21 AUG RULING: "keep the logo and hamburger longer when scrolling (and
     vice versa appear sooner when scrolling back)."

     One hysteresis of 24px both ways made the chrome leave on the smallest
     deliberate scroll — it was written to stop the state CHATTERING, and a
     value chosen to reject jitter is far too small to describe a reader who
     has decided to move on. Two values, and both are the site's own rather
     than invented:

       RETIRE_TRAVEL       one VIEWPORT HEIGHT + RETIRE_MARGIN. 🔴 RAISED
                           TWICE ON 21 Aug, both times by Mahesh reading the
                           built page rather than by a derivation: 200px
                           (--gap-section) → a full screen → a screen plus
                           500. 200 described a gesture rather than a
                           departure; a screen was the first non-arbitrary
                           threshold on this axis, because the reader has
                           replaced everything they could see; and the 500
                           on top of it is the margin he asked for after
                           living with the screen.

                           📌 THE SCREEN IS DERIVED AND THE 500 IS NOT, and
                           they are written as two terms so that stays
                           legible. Nothing in the system supplies a "and
                           then some" — it is a judgement made on the page,
                           exactly as HYSTERESIS's 24 was before it, and it
                           is named here rather than folded into the sum.
       RETURN_TRAVEL   24  --gap-block, the old hysteresis unchanged. It was
                           always the right size for "did they mean it"; it
                           was only ever the wrong size for "have they gone".

     So the chrome now holds through a whole screen of reading and retires
     only on a travelling scroll, and comes back on the first deliberate
     scroll up. The asymmetry is the point: leaving is expensive, returning
     is cheap — and it is now roughly 37:1 rather than 8:1.

     🔴 IT IS A LIVE READ, NOT A CONSTANT. innerHeight changes on rotate, on
     a resize, and on mobile browsers when the URL bar collapses — and a
     threshold captured once would then describe a viewport that is no longer
     there. arm() re-reads it, and arm() already runs on resize.

     🔴 AND THE ANCHOR IS THE EXTREME, NOT THE LAST POSITION. Measuring
     travel from the previous frame makes a 200px threshold unreachable —
     one pixel of jitter against the direction resets the count, and a
     trackpad supplies plenty. The anchor tracks the furthest point reached
     in the current direction and the flip is measured BACK from it, which
     is jitter-proof by construction and needs no second invented tolerance.
     ----------------------------------------------------------------- */
  /* Invented, and it says so — see the note above. A screen alone was still
     letting the chrome go sooner than Mahesh wanted it to. */
  var RETIRE_MARGIN = 500;
  var RETIRE_TRAVEL = window.innerHeight + RETIRE_MARGIN;  /* re-read by arm() */
  var RETURN_TRAVEL = 24;                  /* --gap-block */
  var anchorY = window.pageYOffset || 0;
  var goingDown = false;
  var ticking = false;

  /* 🔴 THE DIRECTION AND THE DECISION ARE SEPARATE, AND THE FIRST VERSION OF
     THIS DID NOT SEPARATE THEM. Deciding inside the scroll handler means the
     state is only ever re-evaluated when a scroll event fires — so a gesture
     whose LAST event lands before the arrival observer has flipped
     `chrome-quiet` leaves the chrome present until the reader scrolls again.
     Both inputs are asynchronous and neither is ordered against the other;
     a decision that reads them both has to be reachable from both. */
  function applyRetreat() {
    /* Four reasons never to retire, all of them the safe direction: the
       reader is going up, has not passed the arrival yet, has the overlay
       open (the trigger IS its close control and the plate IS the way home),
       or has focus inside the chrome — a keyboard reader who has reached the
       trigger must not have it slide away underneath them. */
    var hold =
      !goingDown ||
      !root.classList.contains('chrome-quiet') ||
      root.classList.contains('is-menu-open') ||
      plate.contains(document.activeElement) ||
      trigger.contains(document.activeElement);

    root.classList.toggle('chrome-retired', !hold);
  }

  function readDirection() {
    ticking = false;
    var y = window.pageYOffset || 0;

    /* Overscroll at either end reports positions outside the document on
       some browsers. Clamping rather than returning keeps the anchor honest
       — an unclamped bounce leaves a phantom travel behind it. */
    if (y < 0) y = 0;

    if (goingDown) {
      if (y > anchorY) anchorY = y;                    /* extend the extreme */
      if (anchorY - y >= RETURN_TRAVEL) { goingDown = false; anchorY = y; }
    } else {
      if (y < anchorY) anchorY = y;
      if (y - anchorY >= RETIRE_TRAVEL) { goingDown = true; anchorY = y; }
    }

    applyRetreat();

    /* 🔴 THE GROUND IS RE-READ EVERY FRAME NOW, AND IT HAS TO BE. The
       observer fires when a band ENTERS or LEAVES the chrome's strip, which
       was enough while the answer was any-overlap. It is not enough for a
       majority: a band can sit in the strip for hundreds of pixels of scroll
       while its edge crosses the mark, and no observer event fires in that
       window — that is the straddle, seen from the other side. The cost is
       one rect per element currently in the strip, typically nought to two,
       inside a rAF that is already reading layout. */
    decide();
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(readDirection);
  }, { passive: true });

  /* Focus returns it, always and immediately — no direction, no threshold.
     This is the half of the original decline's reason that is KEPT: the
     trigger is the site's only navigation control, so it may retreat from a
     reader who is scrolling away from it and must never retreat from one
     who is reaching for it. `focusin` rather than `focus` because the
     listener is on the document and focus does not bubble. */
  document.addEventListener('focusin', function (e) {
    if (plate.contains(e.target) || trigger.contains(e.target)) {
      /* Clearing the CLASS alone would last until the next applyRetreat and
         no longer: the remembered direction is still "down", so the arrival
         observer firing once would take the chrome away from a reader who is
         holding it. The direction is what has to be reset. */
      goingDown = false;
      anchorY = window.pageYOffset || 0;
      applyRetreat();
    }
  });

  /* The band height and the viewport both move on resize; rebuild rather
     than patch, debounced — the observer set is small. */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(arm, 150);
  });

  arm();
})();
