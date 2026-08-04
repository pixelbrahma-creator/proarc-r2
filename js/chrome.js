/* =========================================================================
   The ground-aware trigger — the observation strip.

   Spec: Board 17 (Session K, H1-b) · v1.2 §8 · v1.3 E13.2 as amended

   The page SHIPS fielded — the safe state, correct on every ground — and
   this script arms html.chrome-ink only while the band under the chrome
   holds nothing but paper. Three grounds, one direction of failure:

     paper       no field, ink strokes          — this script's one job
     black       the field dissolves            — fielded and ink-free look
                                                  identical, so stay fielded
     photograph  the field returns              — §8 bars identity chrome
                                                  on bare photography

   The strip is the chrome's own band: an IntersectionObserver whose root
   margin clips the viewport to the plate's measured height, so there is
   no scroll threshold to guess and no scroll listener at all. What counts
   as "not paper" is derived from the stylesheets, not guessed: the only
   dark-ground classes in the system are .surface-dark (tokens.css) and
   .section--dark (layout.css), plus the always-black .site-footer and the
   .overlay-panel; photography is the media elements. Anything doubtful
   counts as not-paper — the conservative failure is a visible field,
   never invisible strokes.

   The band is watched FULL-WIDTH rather than trigger-corner-only: a
   corner test would need a physical left/right that flips in RTL, and the
   plate at the other end wants the same answer anyway.

   What this file deliberately does NOT own: the open overlay's black
   state. components.css settles that by source order (is-menu-open rules
   sit after the chrome-ink ones), so the two can never desync.
   ========================================================================= */

(function () {
  'use strict';

  var root = document.documentElement;
  var plate = document.querySelector('.chrome-plate');
  var trigger = document.querySelector('[data-menu-trigger]');

  /* No chrome, or no observer support: the safe state is already on. */
  if (!plate || !trigger || !('IntersectionObserver' in window)) return;

  var NOT_PAPER =
    'main img, main video, main canvas, main .overlay-panel, ' +
    '.surface-dark, .section--dark, .site-footer';

  var observer = null;
  var inBand = new Set();

  function onEntries(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) inBand.add(entry.target);
      else inBand.delete(entry.target);
    });
    root.classList.toggle('chrome-ink', inBand.size === 0);
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
    var band = arrivalMark > 0
      ? Math.ceil(arrivalMark * (117 / 330) + pad)
      : Math.ceil(plate.getBoundingClientRect().height) || 112;
    var below = Math.max(0, window.innerHeight - band);
    var opts = {
      root: null,
      rootMargin: '0px 0px -' + below + 'px 0px',
      threshold: 0,
    };

    observer = new IntersectionObserver(onEntries, opts);
    arrivalObserver = new IntersectionObserver(onArrival, opts);

    var entry = arrivalTarget();
    if (entry) arrivalObserver.observe(entry);

    var targets = document.querySelectorAll(NOT_PAPER);
    if (targets.length === 0) {
      /* A page of pure paper: nothing will ever fire, so decide now. */
      root.classList.add('chrome-ink');
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

     THE ONE INVENTED VALUE IS THE HYSTERESIS, AND IT IS NAMED HERE.
     A direction read off consecutive scroll events flips on sub-pixel jitter,
     on rubber-band overscroll, and on the layout shift a lazily-decoded image
     causes — and a chrome that flickers is worse than one that covers. 24px
     is the site's own --gap-block and, more to the point, the plate's clear
     space rounded up: below one clear space of travel the reader has not
     changed their mind about direction. Nothing else in the system supplies
     a "smallest deliberate scroll", so this is invented rather than derived
     and says so, exactly as districts.js names its two invented values.
     ----------------------------------------------------------------- */
  var HYSTERESIS = 24;
  var lastY = window.pageYOffset || 0;
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
       some browsers. Clamping rather than returning keeps lastY honest —
       an unclamped bounce leaves a phantom delta behind it. */
    if (y < 0) y = 0;

    var delta = y - lastY;
    if (Math.abs(delta) >= HYSTERESIS) {
      goingDown = delta > 0;
      lastY = y;
    }
    applyRetreat();
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
      lastY = window.pageYOffset || 0;
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
