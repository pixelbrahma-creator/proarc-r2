/* =========================================================================
   The record page's one script — the neighbours marker draws itself.

   Spec: P2-b, boarded at H5-d (3 Aug). Enhancement only, and the word is
   load-bearing: the FINISHED marker is what the HTML and CSS ship. This
   file's first act is to CLIP it, so if it never runs — no JS, an error
   above it, a blocked file — the reader gets the marker fully drawn rather
   than an empty black band.

   Three rules this build has already paid for once, on /ajman:

     under prefers-reduced-motion this does NOTHING AT ALL — it does not arm.
     Zeroing a duration does not cancel an armed state, and the armed state
     here is a marker clipped to zero width. The setting that exists to
     prevent motion would otherwise delete the heading instead.

     the clipped state is committed with a FORCED REFLOW before the class
     that releases it can be removed. Arming and releasing in one style pass
     makes the browser treat the arming itself as the transition, and
     nothing animates.

     it plays ONCE and never replays — the observer disconnects on the first
     qualifying entry. A marker that re-wipes every time it re-enters reads
     as a glitch, not as a reveal.

   What this does NOT do: it never touches the rail's links, thumbnails or
   text. Those are complete and interactive with or without this file. Only
   the marker's own clip is scripted.
   ========================================================================= */

(function () {
  'use strict';

  var head = document.querySelector('.pd-neighbours__head');
  var rail = document.querySelector('.pd-neighbours');

  /* No rail (the mosque has no sector siblings), or no observer support:
     the finished marker stands and there is nothing to arm. */
  if (!head || !rail || typeof IntersectionObserver !== 'function') return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;

  rail.classList.add('pd-neighbours--armed');

  /* Commit the clipped state in its own style pass. Reading a layout
     property is what forces it; the void is there so a minifier cannot
     decide the read is dead code. */
  void rail.offsetHeight;

  /* 🔴 OBSERVE THE RAIL, NEVER THE MARKER. The armed state clips the marker
     to zero width, and Chrome folds clip-path into the intersection
     rectangle — so an observer watching the marker sees ratio 0 forever and
     the reveal never fires. It fails as a permanently blank heading on a
     page where every assertion about the armed state passes. Measured: with
     `observe(head)` at threshold 0.4 the callback never ran once.

     The rail is the element that carries the class and is never clipped, so
     it is always a truthful target. rootMargin rather than a threshold
     because rail heights run 496→801px between records; a ratio would fire
     at a different moment on different pages, where -20% of the viewport is
     the same moment everywhere. */
  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      rail.classList.remove('pd-neighbours--armed');
      observer.disconnect();
      return;
    }
  }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });

  observer.observe(rail);
})();
