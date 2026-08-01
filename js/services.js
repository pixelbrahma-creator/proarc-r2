/* =========================================================================
   Services' one script — the range draws itself.

   Spec: _bmad/wds/D-UX-Design/06-services.md §4. Enhancement only, and the
   word is load-bearing: the FINISHED drawing is what the HTML and CSS ship.
   This file's first act is to HIDE the strokes, so if it never runs — no JS,
   an error above it, a blocked file — the reader gets the whole range drawn
   rather than an empty black band. That is the inverse of a reveal system
   that starts every element at opacity 0, and it is the reason the CDN
   stack is gone from this repository.

   Three rules the build has already paid for once, on other pages:

     under prefers-reduced-motion the draw-in does nothing at all, and the
     script does not even arm. Zeroing a duration does not cancel a DELAY,
     and a 95ms-per-elevation stagger would leave the drawing blank for its
     whole run under the setting that exists to prevent exactly that.

     the hidden state is committed with a forced reflow BEFORE the
     transition is armed. Arming both in one style pass makes the browser
     treat the reveal itself as the transition, and nothing animates — the
     values jump and document.getAnimations() reports zero.

     the armed state is RE-COMMITTED ON SCREEN before the reveal. /ajman's
     sweep never animated at all while looking perfectly finished, because
     its map lives in a sticky column and a sticky element is not
     pre-painted off-screen the way an ordinary one is. This drawing is not
     sticky, so it should get that paint for free — but "should" was exactly
     the reasoning that failed there, the fix costs one synchronous block
     that no browser can paint inside, and the alternative is a page that
     looks finished rather than broken. Verified with getAnimations(), three
     runs, because two green runs are not evidence either.

     it plays ONCE. The observer disconnects on the first qualifying entry
     and there is no scroll-linked replay.
   ========================================================================= */

(function () {
  'use strict';

  var drawing = document.querySelector('[data-drawing]');
  if (!drawing || typeof IntersectionObserver !== 'function') return;

  // No arming under reduce: the drawing is already complete in the markup,
  // so doing nothing IS the finished state.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;

  drawing.classList.add('sv-drawing--armed');

  // Commit the hidden state in its own style pass. Reading a layout property
  // is what forces it; the void is there so a minifier cannot decide the
  // read is dead code.
  void drawing.offsetHeight;

  var observer = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].intersectionRatio < 0.4) continue;
        observer.disconnect();

        // Re-commit the armed state while the element is on screen — see the
        // third rule above. remove/reflow/add/reflow is one synchronous
        // block, so the reader never sees the drawing complete and emptied.
        drawing.classList.remove('sv-drawing--armed');
        void drawing.offsetHeight;
        drawing.classList.add('sv-drawing--armed');
        void drawing.offsetHeight;

        requestAnimationFrame(function () {
          drawing.classList.add('sv-drawing--drawing');
        });
        return;
      }
    },
    { threshold: [0.4] }
  );

  observer.observe(drawing);
})();
