/* =========================================================================
   Menu overlay — authored fresh for R2.

   Replaces v1's js/nav.js, which was not carried: R2's chrome is a
   different object. The v1.3 E13 amendments govern what this has to do —
   the permanent-field trigger, the overlay's own type roles on the dark
   ground, and the fact that the overlay is the site's only navigation
   surface rather than a mobile fallback for a desktop bar.

   Behavioural requirements that are already settled and must hold:

     - The trigger is present on every page at every width. There is no
       width at which navigation lives somewhere else.
     - Opening traps focus inside the overlay; Escape closes; closing
       returns focus to the trigger.
     - The overlay is inert to assistive tech when closed, not merely
       invisible.
     - Under prefers-reduced-motion the overlay still opens and closes,
       it just does not animate.
     - No scroll behind the open overlay, and no layout shift from the
       scrollbar disappearing.

   Left as a stub deliberately: the chrome is the first thing R2 Phase 1
   builds, against the screen specs rather than against a guess made
   during the repo move.
   ========================================================================= */
