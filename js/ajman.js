/* =========================================================================
   /ajman's one script — the map's sweep, and the ledger driving the map.

   Spec: _bmad/wds/D-UX-Design/05-ajman.md §3.4, §3.5 (E7.3). Enhancement
   only, both halves, and the word is load-bearing: the FINISHED map is what
   the HTML and CSS ship. This file's first act is to HIDE the marks, so if
   it never runs — no JS, an error above it, a blocked file — the reader
   gets every mark placed rather than an empty black field.

   Three rules the build has already paid for once:

     under prefers-reduced-motion the SWEEP does nothing at all. Zeroing a
     duration does not cancel a DELAY, and a 34ms-per-mark stagger would
     leave the map blank for its whole sweep under the setting that exists
     to prevent exactly that. The ledger interaction still runs: a fill
     change is not motion.

     the hidden state is committed with a forced reflow BEFORE the
     transition is armed. Arming both in one style pass makes the browser
     treat the reveal itself as the transition, and nothing animates.

     it plays ONCE, at 40% visibility, and never replays — the observer
     disconnects on the first qualifying entry. Input is never gated on it
     (§3.4): a district selected mid-draw applies immediately, which is free
     here because the two halves share no state.

   THE INTERACTION IS OPTION B'S, NOT §3.4'S AS WRITTEN. §3.4 makes the map
   the index and the ledger the answer — but it was specified against
   artwork that does not exist. Option B has no polygons, so there is
   nothing on the map to touch, and marks are not hit targets. The direction
   reverses: the ledger is the control and the map answers it.

   What this file does NOT do is as important. The block's own current state
   — its head lifting to #FFFFFF at weight 600 and its 2px #595959 rule — is
   pure CSS :hover/:focus-within, so it survives this script failing. Only
   the map's echo is scripted, and every row is already a link, so focus
   drives it exactly as hover does without adding one tab stop.
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     The sweep — E7.3, west to east (the order is the build's)
     --------------------------------------------------------------- */

  var field = document.querySelector('[data-map]');

  // No observer, no animation — and no arming either, so the finished map
  // stands.
  if (field && typeof IntersectionObserver === 'function') {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reduce || !reduce.matches) {
      field.classList.add('aj-map--armed');

      // Commit the hidden state in its own style pass. Reading a layout
      // property is what forces it; the void is there so a minifier cannot
      // decide the read is dead code.
      void field.offsetHeight;

      var observer = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].intersectionRatio < 0.4) continue;
            observer.disconnect();

            /* THE ARMED STATE IS RE-COMMITTED HERE, and this is not
               belt-and-braces — without it nothing animates at all.

               A transition needs a rendered "before". Arming at load only
               ever computed one: this map lives in a STICKY column, and a
               sticky element is not pre-painted while it is off-screen the
               way an ordinary one is. So the reveal became the marks' FIRST
               paint, the browser had nothing to interpolate from, and every
               mark jumped to full size — document.getAnimations() reporting
               zero while the page looked finished rather than broken.

               Measured, not reasoned: arming at load and revealing
               synchronously, after one frame, after two, or after a forced
               read all register ZERO transitions. Re-committing the armed
               state while the element is on screen registers all 28. This is
               why Home's identical script has never shown the fault — its
               map does not stick, so it gets the off-screen paint for free.

               The remove/reflow/add pair costs nothing visible: it is one
               synchronous block, and the browser cannot paint inside a task.
               The reader never sees the map complete and then emptied. */
            field.classList.remove('aj-map--armed');
            void field.offsetHeight;
            field.classList.add('aj-map--armed');
            void field.offsetHeight;

            requestAnimationFrame(function () {
              field.classList.add('aj-map--drawing');
            });
            return;
          }
        },
        { threshold: [0.4] }
      );

      observer.observe(field);
    }
  }

  /* ---------------------------------------------------------------
     The ledger answers on the map
     --------------------------------------------------------------- */

  var standing = document.querySelector('[data-standing]');
  if (!standing) return;

  // Only district blocks participate. "Also in Ajman" and the record
  // outside the Emirate carry no data-district because they have no mark:
  // E7.2 places none by inference, and a block that lit while the map said
  // nothing would claim those buildings were on it.
  // Marks AND labels: both carry data-district and both take the current
  // state, so a current block lifts a name and its cluster together. The
  // modifier is `is-current` rather than `aj-mark--current` because it now
  // lands on two different elements.
  var marks = standing.querySelectorAll('.aj-mark[data-district], .aj-map__label[data-district]');
  if (!marks.length) return;

  var byDistrict = {};
  for (var m = 0; m < marks.length; m++) {
    var key = marks[m].getAttribute('data-district');
    (byDistrict[key] || (byDistrict[key] = [])).push(marks[m]);
  }

  // Hover and focus are tracked separately rather than as one "current",
  // because they can point at different blocks at once — a mouse resting
  // over one district while the keyboard sits in another. Hover wins while
  // it lasts; leaving it falls back to wherever focus actually is, instead
  // of clearing a state the keyboard reader is still standing in.
  var hovered = null;
  var focused = null;
  var applied = null;

  function apply() {
    var next = hovered || focused;
    if (next === applied) return;

    if (applied && byDistrict[applied]) {
      for (var i = 0; i < byDistrict[applied].length; i++) {
        byDistrict[applied][i].classList.remove('is-current');
      }
    }

    if (next && byDistrict[next]) {
      for (var j = 0; j < byDistrict[next].length; j++) {
        byDistrict[next][j].classList.add('is-current');
      }
      standing.setAttribute('data-current', next);
    } else {
      standing.removeAttribute('data-current');
    }

    applied = next;
  }

  function districtOf(node) {
    if (!node || typeof node.closest !== 'function') return null;
    var block = node.closest('.aj-block[data-district]');
    return block ? block.getAttribute('data-district') : null;
  }

  // mouseover bubbles where mouseenter does not, so one listener covers
  // every block — including the gaps between them, which resolve to null
  // and clear the hover.
  standing.addEventListener('mouseover', function (event) {
    hovered = districtOf(event.target);
    apply();
  });

  standing.addEventListener('mouseleave', function () {
    hovered = null;
    apply();
  });

  standing.addEventListener('focusin', function (event) {
    focused = districtOf(event.target);
    apply();
  });

  standing.addEventListener('focusout', function (event) {
    // relatedTarget is where focus is going. Inside another block it is
    // that block's turn; anywhere else and the focus half is simply off.
    focused = districtOf(event.relatedTarget);
    apply();
  });
})();
