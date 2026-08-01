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
      overlay.classList.remove('is-open', 'is-closing', 'is-armed', 'show-work');
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
     G-4, "the swap"

     The constellation is the resting centre; hovering or focusing WORK
     swaps in the preview. Never both — the centre holds one idea at a time.
     The swap is instant and has no animation of its own.

     Focus is hover's twin, so nothing the pointer reveals is unreachable by
     keyboard. The pointer half is gated on a real hover capability: touch
     has no hover, so the resting state simply stays and WORK navigates. The
     preview is an enhancement, never the only route.
     --------------------------------------------------------------------- */

  function setSwap(showWork) {
    overlay.classList.toggle('show-work', showWork);
  }

  function onNavPointer(event) {
    var item = event.target.closest('.menu-nav__item');
    if (item) {
      setSwap(item.hasAttribute('data-menu-work'));
      return;
    }
    /* Moving from WORK into the panel keeps the panel — that is the path a
       pointer actually takes to reach a thumbnail. */
    if (event.target.closest('[data-menu-preview]')) return;
  }

  if (window.matchMedia('(hover: hover)').matches) {
    overlay.addEventListener('mouseover', onNavPointer);
    overlay.addEventListener('mouseleave', function () {
      setSwap(false);
    });
  }

  overlay.addEventListener('focusin', function (event) {
    var item = event.target.closest('.menu-nav__item');
    if (item) {
      setSwap(item.hasAttribute('data-menu-work'));
      return;
    }
    if (event.target.closest('[data-menu-preview]')) return;
    setSwap(false);
  });
})();
