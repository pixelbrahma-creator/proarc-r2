/* =========================================================================
   Contact's one script — enhancement only, and it does exactly one thing.

   Spec: _bmad/wds/D-UX-Design/08-contact.md §6. `?project={slug}` pre-fills
   Subject and the field stays editable. The page is complete without this
   file: every field, the button and the form's route are in the markup, and
   without the script Subject simply starts empty.

   IT READS A BUILD-MADE MAP, IT DOES NOT GUESS. The slug-to-title island at
   the foot of the page is built from the records, so "seasidehills" resolves
   to the building's own title instead of a runtime title-casing that would
   invent one. An unknown slug finds no entry and nothing happens, which is
   §6's stated behaviour arrived at by construction rather than by a check.

   WHAT IT NEVER DOES: overwrite something the reader has already typed.
   This is a form, and back-navigation and bfcache both restore field values
   before a deferred script runs.

   Validation, error strings, focus management and the success state are the
   forms phase's (§6) and are deliberately absent here.
   ========================================================================= */

(function () {
  'use strict';

  var subject = document.getElementById('ct-subject');
  var island = document.getElementById('ct-project-index');
  if (!subject || !island) return;

  /* ?project= is state, never a route — read on load and never written
     back. Same hand-rolled read as the Work surfaces' ?q=: one regex
     against location.search, no URL parsing to get wrong. */
  var match = /[?&]project=([^&]*)/.exec(window.location.search);
  if (!match) return;

  var slug;
  try {
    slug = decodeURIComponent(match[1].replace(/\+/g, ' ')).trim();
  } catch (err) {
    return; // a malformed escape sequence is an unknown slug like any other
  }
  if (!slug) return;

  var index;
  try {
    index = JSON.parse(island.textContent);
  } catch (err) {
    return;
  }

  /* hasOwnProperty, not a truthiness test: ?project=constructor would
     otherwise resolve against Object.prototype and put a function's source
     in a field a client is about to read. */
  if (!Object.prototype.hasOwnProperty.call(index, slug)) return;

  var title = index[slug];
  if (typeof title !== 'string' || !title) return;

  if (subject.value) return;
  subject.value = title;
})();
