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
     .surface-dark wrapper (Services, /ajman), ITS first child. While it
     intersects the chrome band the mark is at arrival size; once it has
     scrolled past, html.chrome-quiet steps the mark to the reading size.
     The edge is the page's own, never a guessed pixel threshold. Landing
     mid-page (back button, anchors) starts quiet, which is correct.
     ----------------------------------------------------------------- */
  var arrivalObserver = null;

  function arrivalTarget() {
    var main = document.querySelector('main');
    if (!main) return null;
    var t = main.firstElementChild;
    if (t && t.classList.contains('surface-dark') && t.firstElementChild) {
      t = t.firstElementChild;
    }
    return t;
  }

  function onArrival(entries) {
    root.classList.toggle('chrome-quiet', !entries[entries.length - 1].isIntersecting);
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

  /* The band height and the viewport both move on resize; rebuild rather
     than patch, debounced — the observer set is small. */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(arm, 150);
  });

  arm();
})();
