/* =========================================================================
   Home's script — two drawn surfaces, one contract.

   Spec: _bmad/wds/D-UX-Design/01-home.md §6.1 (E7.3). Enhancement only,
   and the word is load-bearing here: the FINISHED map is what the HTML and
   CSS ship. This file's first act is to HIDE the marks, so if it never
   runs — no JS, an error above it, a blocked file — the reader gets every
   mark placed rather than an empty black field. A reveal system that
   starts its elements hidden is one broken script away from a blank page,
   which is exactly why v1's scroll-reveal stack is gone.

   Three rules the build has already paid for once:

     under prefers-reduced-motion this file does nothing at all. Zeroing a
     duration does not cancel a DELAY, and a 34ms-per-mark stagger would
     leave the map blank for its whole sweep under the setting that exists
     to prevent exactly that.

     the hidden state is committed with a forced reflow BEFORE the
     transition is armed. Arming both in one style pass makes the browser
     treat the reveal itself as the transition, and nothing animates.

     it plays ONCE, at 40% visibility, and never replays — the observer
     disconnects on the first qualifying entry.
   ========================================================================= */

(function () {
  'use strict';

  // No observer, no animation — and no arming either, so both finished
  // drawings stand.
  if (typeof IntersectionObserver !== 'function') return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;

  /**
   * One surface, one contract: hide it, COMMIT the hidden state in its own
   * style pass, then draw it when it is properly in view, once.
   *
   * `armed` may name more than one element because a beat can be several
   * elements drawing as one gesture. Both surfaces are single-element today
   * — the beat's hairline was retired on 2 Aug — and the shape stays,
   * because a one-element special case is what forced this generalisation
   * the first time.
   */
  function drawOnce(el, armed, drawing, ratio) {
    if (!el) return;

    /* A surface the layout has deleted has no box, and an element with no
       box never intersects — so arming it would hide a drawing that then
       had no way to arrive. Below 1024 the mark is deleted whole (E3.7,
       the constellation's own rule), and this is what keeps a reader who
       resizes upward from meeting an empty column. */
    if (!el.getClientRects().length) return;

    armed.forEach(function (pair) {
      if (pair.el) pair.el.classList.add(pair.cls + '--armed');
    });

    // Reading a layout property is what forces the commit; the void is
    // there so a minifier cannot decide the read is dead code.
    void el.offsetHeight;

    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].intersectionRatio < ratio) continue;
          observer.disconnect();
          drawing.forEach(function (pair) {
            if (pair.el) pair.el.classList.add(pair.cls + '--drawing');
          });
          return;
        }
      },
      { threshold: [ratio] }
    );

    observer.observe(el);
  }

  /* The map — E7.3's spatial sweep. */
  var field = document.querySelector('[data-map]');
  drawOnce(field, [{ el: field, cls: 'hm-map' }], [{ el: field, cls: 'hm-map' }], 0.4);

  /* The practice mark — 47 courses on a datum, generated from the records
     (build/lib/crest.js). It draws at a LOWER ratio than the map because it
     is 520px of a two-column beat rather than a square field: at 0.4 a
     desktop reader has the whole thing on screen and is already past it.

     One element, one gesture. The hairline that drew with it was retired on
     2 Aug when the beat took the mark's own ground line as its datum. */
  var crest = document.querySelector('[data-crest]');
  drawOnce(crest, [{ el: crest, cls: 'hm-crest' }], [{ el: crest, cls: 'hm-crest' }], 0.25);
})();
