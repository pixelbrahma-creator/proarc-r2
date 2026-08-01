/* =========================================================================
   Home's one script — the map's sweep, and nothing else.

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

  var field = document.querySelector('[data-map]');
  if (!field) return;

  // No observer, no animation — and no arming either, so the finished map
  // stands.
  if (typeof IntersectionObserver !== 'function') return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;

  field.classList.add('hm-map--armed');

  // Commit the hidden state in its own style pass. Reading a layout
  // property is what forces it; the void is there so a minifier cannot
  // decide the read is dead code.
  void field.offsetHeight;

  var observer = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].intersectionRatio < 0.4) continue;
        observer.disconnect();
        field.classList.add('hm-map--drawing');
        return;
      }
    },
    { threshold: [0.4] }
  );

  observer.observe(field);
})();
