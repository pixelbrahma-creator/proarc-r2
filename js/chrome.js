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

  function arm() {
    if (observer) observer.disconnect();
    inBand.clear();

    /* The band is the plate's RENDERED height — measure the box, never
       the declared value. Everything below it is clipped out of the root
       by the negative bottom margin. */
    var band = Math.ceil(plate.getBoundingClientRect().height) || 112;
    var below = Math.max(0, window.innerHeight - band);

    observer = new IntersectionObserver(onEntries, {
      root: null,
      rootMargin: '0px 0px -' + below + 'px 0px',
      threshold: 0,
    });

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
