/* =========================================================================
   The menu overlay — the site's only navigation surface.

   Spec: _bmad/wds/D-UX-Design/09-menu.md · v1.3 E13.1–E13.4 · v1.2 §4.7

   Replaces v1's js/nav.js, which was not carried: R2's chrome is a
   different object. The overlay is not a mobile fallback for a desktop bar
   — there is no width at which navigation lives somewhere else.

   What this file owns:

     the open and close, including the reflow the drawn open depends on
     the focus trap, and returning focus to the trigger
     the G-4 swap: the constellation at rest, the preview on WORK
     scroll lock, and inertness while closed

   What it deliberately does NOT own: the timings, the easing and the
   stagger, all of which live in components.css so that the motion can be
   read in one place and disabled in one place.
   ========================================================================= */

(function () {
  'use strict';

  var trigger = document.querySelector('[data-menu-trigger]');
  var overlay = document.querySelector('[data-menu-overlay]');
  var plate = document.querySelector('.chrome-plate');
  var nib = document.querySelector('[data-menu-nib]');

  if (!trigger || !overlay) return;

  var FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  var CLOSE_FALLBACK_MS = 650;

  /* How long the pointer must REST on a door before it takes the stage.
     Not a motion value — the motion lives in components.css, as ever — but
     an intent threshold, and it sits here for the same reason
     CLOSE_FALLBACK_MS does: it is behaviour, not choreography.

     🔴 It exists because the reader's path to the stage runs THROUGH the
     other doors. "All projects →" sits at the stage's foot while WORK sits
     at the nav's head, so a pointer travelling to it crosses SERVICES and
     ABOUT and — before this — handed the stage to each in turn, tearing
     down the panel the reader was aiming at. Walking a real cursor along
     that path is what showed it. **The two-state swap had the same fault**:
     hovering SERVICES called setSwap(false) and hid the preview. Nobody
     reported it until the stage got big enough to notice.

     90ms is under the threshold at which a deliberate hover feels delayed
     and far above the few milliseconds a transiting pointer spends on any
     one row. Keyboard focus does not wait: focus LANDS on things, so it is
     never in transit. */
  var STAGE_INTENT_MS = 90;

  var isOpen = false;
  var closeTimer = null;

  /* ---------------------------------------------------------------------
     The focus trap.

     Its scope is the trigger, the plate and the overlay — not the overlay
     alone. Both pieces of chrome are part of the open menu: the trigger is
     now the ✕ that closes it, and the plate is the Home door the overlay
     offers in place of a Home nav item. Trapping the overlay by itself
     would put the two controls a reader most needs out of reach.

     Elements are filtered on getClientRects() rather than offsetParent:
     the chrome is position:fixed, for which offsetParent is null even when
     the element is plainly on screen. Rect-counting also excludes the
     preview's seven links while the panel is display:none, which is what
     keeps them out of the tab order at rest without a single tabindex.
     --------------------------------------------------------------------- */
  function trapNodes() {
    var nodes = [trigger];
    if (plate) nodes.push(plate);
    nodes = nodes.concat(Array.prototype.slice.call(overlay.querySelectorAll(FOCUSABLE)));
    return nodes.filter(function (el) {
      return el.getClientRects().length > 0;
    });
  }

  function onKeydown(event) {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') return;

    var nodes = trapNodes();
    if (nodes.length === 0) return;

    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    var active = document.activeElement;

    if (event.shiftKey && (active === first || nodes.indexOf(active) === -1)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* Anything that steals focus out of the trap — a browser control, a
     stray script — is pulled back to the trigger rather than left loose
     behind an overlay the reader cannot see past. */
  function onFocusIn(event) {
    if (!isOpen) return;
    if (trapNodes().indexOf(event.target) === -1) trigger.focus();
  }

  /* ---------------------------------------------------------------------
     Open and close
     --------------------------------------------------------------------- */

  function open() {
    if (isOpen) return;
    isOpen = true;

    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    overlay.removeAttribute('inert');
    document.documentElement.classList.add('is-menu-open');

    overlay.classList.add('is-armed');  /* commit the hidden state...        */
    void overlay.offsetWidth;           /* ...force the reflow...            */
    overlay.classList.add('is-open');   /* ...then flip, so the browser sees
                                           a transition rather than treating
                                           the reveal itself as one. Arming
                                           and flipping in a single style
                                           pass is the trap that cost Screen
                                           06 a session. */

    if (nib) {
      nib.classList.remove('is-running');
      void nib.offsetWidth;
      nib.classList.add('is-running');
    }

    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Close menu');

    /* Focus is not moved INTO the overlay: the trigger has become the ✕ in
       the same place, so the reader is already on the control that closes
       it, and focus-return on close is true by construction rather than by
       bookkeeping.

       It is moved TO the trigger, though, and that is not redundant. Safari
       does not focus a <button> when it is clicked, so on that browser the
       reader's focus would still be somewhere in the page behind the
       overlay — and a Tab from outside the trap's node list falls straight
       through to the hidden page. Focusing here makes the invariant the
       trap depends on ("focus starts inside") true everywhere. */
    trigger.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    /* Focus goes home before anything becomes inert, so it is never lost
       inside a subtree that has just stopped existing for the reader. */
    trigger.focus();

    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open menu');

    overlay.classList.add('is-closing');

    var settle = function () {
      if (isOpen) return;  /* reopened mid-close: leave it alone */
      overlay.classList.remove('is-open', 'is-closing', 'is-armed');
      overlay.setAttribute('inert', '');
      document.documentElement.classList.remove('is-menu-open');
      if (nib) nib.classList.remove('is-running');
      closeTimer = null;
    };

    overlay.addEventListener('transitionend', function handler(event) {
      if (event.propertyName !== 'clip-path') return;
      overlay.removeEventListener('transitionend', handler);
      settle();
    });

    /* Under reduced motion the clip-path transition is suppressed entirely,
       so transitionend never fires and the overlay would stay open for
       good. The timer is the only thing that closes it in that case. */
    closeTimer = setTimeout(settle, CLOSE_FALLBACK_MS);
  }

  trigger.addEventListener('click', function () {
    if (isOpen) close();
    else open();
  });

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('focusin', onFocusIn);

  /* ---------------------------------------------------------------------
     G-4, "the swap" — five occupants, and the rail (8 Aug)

     §4.4 left this door open in terms: it refused a per-item panel because
     SERVICES, ABOUT and CONTACT had "no honest preview content", and
     recorded that "a per-item panel system is open for a later revision if
     content ever exists". It does. The stage now holds one of five, and
     still never two.

     The RESTING occupant is the page the reader is already on, and it is
     decided by the BUILD — `data-stage` ships on the overlay, so an
     overlay whose script never runs still opens on the right one. This
     file reads that attribute once rather than re-deriving it from the lit
     item, because two derivations of one fact is how two surfaces start
     disagreeing about where the reader is.

     The constellation was the resting occupant until 8 Aug, when Mahesh
     refused it on the one ground no measurement reaches: nobody could tell
     what it was. §6 had built it as ornament — no label, no link, no count
     — so there was nothing in it to say.

     Focus is hover's twin, so nothing the pointer reveals is unreachable by
     keyboard. The pointer half is gated on a real hover capability: touch
     has no hover, so the resting stage simply stays and the item navigates.
     Every stage is an enhancement of a route that already works.
     --------------------------------------------------------------------- */

  /* Read once, at load, from what the build decided. */
  var REST_STAGE = overlay.getAttribute('data-stage') || 'rest';

  var navItems = Array.prototype.slice.call(overlay.querySelectorAll('.menu-nav__item'));

  /* The row the rail parks on at rest: the lit item, or none. */
  var restRow = -1;
  navItems.forEach(function (el, i) {
    if (el.classList.contains('is-lit')) restRow = i;
  });

  /* `item` is a nav element, or null for the resting state. The stage name
     comes from the item's own data-menu-stage — the build's key, not a
     list index, so reordering the nav cannot point an item at the wrong
     stage and an Arabic label changes nothing. */
  function setStage(item) {
    var row = item ? navItems.indexOf(item) : restRow;
    overlay.setAttribute('data-stage',
      (item && item.getAttribute('data-menu-stage')) || REST_STAGE);

    /* The rail travels to the hovered row, or parks on the lit one. A
       stage that says "About" with no row marked is the ambiguity this
       change exists to remove. */
    overlay.style.setProperty('--rail-row', String(row < 0 ? 0 : row));
    overlay.style.setProperty('--rail-on', row < 0 ? '0' : '1');
  }

  /* The pointer's half, which waits; setStage() itself never does. */
  var intent = null;
  var intentTarget = null;
  function clearIntent() {
    if (intent) { clearTimeout(intent); intent = null; }
    intentTarget = null;
  }

  /* 🔴 IS THE POINTER CROSSING THIS DOOR, OR CHOOSING IT?

     The dwell alone cannot tell them apart: a slow deliberate diagonal
     rests on each row for longer than any threshold worth having, and a
     threshold long enough to survive it would make a real hover feel
     broken. The discriminator is DIRECTION, not time — the stage sits at
     the row's inline end, so a pointer travelling toward it is in transit
     and a pointer that is not is choosing.

     Which side "toward the stage" is on is read from the rendered boxes
     rather than from a direction constant, so RTL needs no restatement:
     the regions flip by logical properties and this flips with them. */
  var lastX = null;
  function stageIsInlineEndOf(navEl) {
    var c = overlay.querySelector('[data-menu-centre]');
    if (!c || !navEl) return null;
    return c.getBoundingClientRect().left > navEl.getBoundingClientRect().left;
  }
  function travellingToStage(x, navEl) {
    if (lastX === null) return false;
    var dx = x - lastX;
    if (Math.abs(dx) < 2) return false;          /* settled — a choice */
    var toRight = stageIsInlineEndOf(navEl);
    if (toRight === null) return false;
    return toRight ? dx > 0 : dx < 0;
  }

  function requestStage(item) {
    var want = item ? item.getAttribute('data-menu-stage') : REST_STAGE;
    if (want === overlay.getAttribute('data-stage')) { clearIntent(); return; }

    /* 🔴 IDEMPOTENT FOR THE SAME TARGET, and that is the whole point. A
       pointer moving across a door fires mousemove every few milliseconds;
       restarting the timer on each one meant it never survived long enough
       to fire, so a deliberate hover NEVER took the stage while the pointer
       was still creeping. Measured, not reasoned: a pure vertical move onto
       SERVICES left the stage on WORK for the entire traverse. The dwell
       counts from the FIRST sample on a door, not the last. */
    if (intent && intentTarget === want) return;

    clearIntent();
    intentTarget = want;
    intent = setTimeout(function () {
      intent = null;
      intentTarget = null;
      setStage(item);
    }, STAGE_INTENT_MS);
  }

  function stageFor(event) {
    var item = event.target.closest('.menu-nav__item');
    if (item) {
      requestStage(item);
      return true;
    }
    /* Reaching the stage CANCELS any pending change: the reader has
       arrived at what they were aiming for, and a door they merely crossed
       on the way must not take it from them. */
    if (event.target.closest('[data-menu-centre]')) {
      clearIntent();
      return true;
    }
    return false;
  }

  setStage(null);

  /* 🔴 THE POINTER MUST BE ABLE TO REACH THE STAGE, AND THE PATH RUNS
     THROUGH DEAD GROUND. A reader going from WORK to "All projects →"
     crosses the 64px gutter between the nav column and the stage, where the
     event target is the regions grid — neither a nav item nor the stage.
     Resetting there tore the panel down mid-journey and made the exit link
     unreachable by pointer: it was reported from the live site, and walking
     the real cursor along that path reproduced it at the exact step the
     target became `menu-overlay__regions`.

     So the pointer NEVER resets on neutral ground. Only leaving the overlay
     does. That is the contract the original two-state swap had — its
     handler fell through without resetting — and widening the swap to five
     occupants is what quietly dropped it.

     Focus is different and keeps its reset: focus lands ON things, so
     moving it to the trigger or the plate is a real departure rather than a
     journey across a gap. */
  if (window.matchMedia('(hover: hover)').matches) {
    overlay.addEventListener('mousemove', function (event) {
      var item = event.target.closest('.menu-nav__item');
      if (item) {
        /* A door crossed on the way to the stage does not take it. A door
           the pointer has settled on does, after the dwell. */
        if (travellingToStage(event.clientX, item)) clearIntent();
        else requestStage(item);
      } else if (event.target.closest('[data-menu-centre]')) {
        clearIntent();
      }
      lastX = event.clientX;
    });

    overlay.addEventListener('mouseover', function (event) {
      stageFor(event);
    });
    overlay.addEventListener('mouseleave', function () {
      clearIntent();
      lastX = null;
      setStage(null);
    });
  }

  /* Focus is instant — it lands on things rather than travelling across
     them, so it is never in transit and must never feel delayed. */
  overlay.addEventListener('focusin', function (event) {
    clearIntent();
    var item = event.target.closest('.menu-nav__item');
    if (item) { setStage(item); return; }
    if (event.target.closest('[data-menu-centre]')) return;
    setStage(null);
  });

  /* Closing returns the stage to rest, so the next open does not flash the
     last thing the previous reader hovered. */
  overlay.addEventListener('transitionend', function (event) {
    if (event.propertyName === 'clip-path' && !overlay.classList.contains('is-open')) {
      clearIntent();
      setStage(null);
    }
  });
})();
