/* =========================================================================
   THE FORMS PHASE — the one script both forms share.

   Spec: _bmad/wds/D-UX-Design/10-forms.md. Screens: 08 Contact §6 (the
   enquiry) and 07 About §8 (the /careers application).

   ONE SCRIPT, TWO FORMS. Two implementations of one validation grammar is
   how two surfaces start disagreeing about what a valid email address is —
   the same reason records.js, districts.js and work.js are each derived
   once. It binds to form[data-form] and to nothing else, so the Work
   surfaces' <form role="search"> is untouched by it.

   IT ARMS A FINISHED FORM. Without this file both pages still work: the
   markup carries every field, its label, its required attribute and its
   route, and the browser does its own native validation. That is why the
   script sets noValidate ITSELF rather than the markup carrying it — a
   reader with no script gets the browser's checks instead of none.

   THE WORDS ARE NOT IN HERE. Every reader-facing string lives in
   pages-src/, on the field it describes (data-missing / data-invalid /
   data-oversize) or in the outcome panels the markup ships [hidden]. A
   field with no data-missing is simply not checked, which makes the
   validation matrix a property of the page rather than a list inside a
   script no designer opens. js/contact.js states the same division.

   THE OUTCOME IS READ, NEVER GUESSED (§0). There is no wired/unwired flag
   anywhere in the data, because a flag and a value can contradict each
   other and one of them is then a lie — data/contact.json's own doctrine.
   The script posts and reads the answer: ok renders the success panel,
   anything else renders the failure panel. That is correct today on a
   static host where nothing is listening, correct the day an endpoint is
   set, and correct at a proarc.ae cutover that restores a server route.
   Wiring is one data edit.
   ========================================================================= */

(function () {
  'use strict';

  var forms = document.querySelectorAll('form[data-form]');
  if (!forms.length) return;

  /* A submission that arrives sooner than this did not come from someone
     typing. The floor is deliberately set BELOW any path a human can take
     rather than at a plausible-looking threshold: these forms require a
     typed subject and a typed message, so no autofill, no paste and no
     returning reader gets from load to submit inside it — while a script
     posting the moment it parses the page does.

     That margin matters more here than elsewhere. A trip renders the
     success panel WITHOUT sending, which for a false positive would be
     exactly the silent discard of a real enquiry that this site refuses
     everywhere else. So the trap is set where a false positive is not a
     judgement call. */
  var HUMAN_FLOOR_MS = 800;

  function isEmail(value) {
    // Deliberately loose. A form is not the place to adjudicate whether an
    // address exists, and a check that rejects a real client's real address
    // is worse than one that lets a typo through — the endpoint bounces
    // what it cannot deliver. One @ with something either side, and a dot
    // somewhere after it.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function hasDigit(value) {
    return /\d/.test(value);
  }

  function extensionAllowed(file, accept) {
    if (!accept) return true;
    var name = String(file.name || '').toLowerCase();
    return accept.split(',').some(function (token) {
      var t = token.trim().toLowerCase();
      if (!t) return false;
      if (t.charAt(0) === '.') return name.slice(-t.length) === t;
      // A MIME token (application/pdf, image/*) is the browser's own filter
      // and the file picker has already applied it; nothing to re-check.
      return true;
    });
  }

  /* The one quantity in this file, and it is code rather than copy — E12
     bars the number from the string, not from the check. The string says
     "too large to send" and names nothing. */
  var MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

  function setup(form) {
    var fields = [];
    var wrappers = form.querySelectorAll('.form-field');

    Array.prototype.forEach.call(wrappers, function (wrapper) {
      var control = wrapper.querySelector('.form-field__input, .form-field__file');
      if (!control || !control.id) return;
      if (!control.hasAttribute('data-missing') && !control.hasAttribute('data-invalid')) return;
      fields.push({ wrapper: wrapper, control: control, errorNode: null, flagged: false });
    });
    if (!fields.length) return;

    var button = form.querySelector('.form-submit');
    var section = form.parentNode;
    var successPanel = section.querySelector('[data-form-success]');
    var failurePanel = section.querySelector('[data-form-failure]');
    var honeypot = form.querySelector('.form-honeypot');
    var armedAt = Date.now();

    // The browser's own bubbles would fight this site's strings, so they are
    // turned off HERE — never in the markup, where a no-script reader would
    // inherit a form with no validation at all.
    form.noValidate = true;

    /* --------------------------------------------------------------
       One field: check it, and say so
       -------------------------------------------------------------- */

    function problem(field) {
      var control = field.control;
      var required = control.hasAttribute('required');

      if (control.type === 'file') {
        var file = control.files && control.files[0];
        if (!file) return required ? control.getAttribute('data-missing') : null;
        if (!extensionAllowed(file, control.getAttribute('accept'))) {
          return control.getAttribute('data-invalid');
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          return control.getAttribute('data-oversize') || control.getAttribute('data-invalid');
        }
        return null;
      }

      var value = String(control.value || '').trim();
      if (!value) return required ? control.getAttribute('data-missing') : null;

      if (control.type === 'email' && !isEmail(value)) return control.getAttribute('data-invalid');
      if (control.type === 'tel' && !hasDigit(value)) return control.getAttribute('data-invalid');
      return null;
    }

    function clear(field) {
      field.flagged = false;
      field.wrapper.classList.remove('field-invalid');
      field.control.removeAttribute('aria-invalid');
      field.control.removeAttribute('aria-describedby');
      if (field.errorNode && field.errorNode.parentNode) {
        field.errorNode.parentNode.removeChild(field.errorNode);
      }
      field.errorNode = null;
    }

    function flag(field, message) {
      field.flagged = true;
      field.wrapper.classList.add('field-invalid');
      field.control.setAttribute('aria-invalid', 'true');

      if (!field.errorNode) {
        var node = document.createElement('p');
        node.className = 'field-error';
        node.id = field.control.id + '-error';
        field.errorNode = node;
        // After the control, inside its own wrapper — so the string sits
        // under the field it is about and moves with it at every width.
        field.control.parentNode.insertBefore(node, field.control.nextSibling);
      }
      field.errorNode.textContent = message;

      // Set on the control, not announced by a live region: focus lands on
      // the first invalid field, and a screen reader then reads label,
      // state and error together on arrival. That is also why there is no
      // error summary — a summary's natural sentence counts the errors,
      // and E12 bars the count.
      field.control.setAttribute('aria-describedby', field.errorNode.id);
    }

    function check(field) {
      var message = problem(field);
      if (message) flag(field, message);
      else clear(field);
      return !message;
    }

    /* Punish late, reward early: nothing is checked until the first submit,
       and after that a flagged field re-checks as it is typed so the error
       clears the moment it is fixed. An unflagged field is never checked on
       blur — tabbing through a form is not an error. */
    fields.forEach(function (field) {
      field.control.addEventListener('input', function () {
        if (field.flagged) check(field);
      });
      field.control.addEventListener('change', function () {
        if (field.flagged) check(field);
      });
      field.control.addEventListener('blur', function () {
        if (field.flagged) check(field);
      });
    });

    /* --------------------------------------------------------------
       The outcome
       -------------------------------------------------------------- */

    function show(panel) {
      if (!panel) return;
      panel.hidden = false;
      // Moved to, not merely announced: the reader is taken to the answer
      // rather than left at a button that has just gone away.
      panel.focus();
    }

    function succeed() {
      if (failurePanel) failurePanel.hidden = true;
      form.hidden = true;
      show(successPanel);
    }

    function fail() {
      // The form is NOT hidden and NOT cleared. Every word the reader typed
      // stays where they typed it — the failure panel says so, and it is
      // the whole reason the form may stay visible while the route is
      // unwired.
      show(failurePanel);
    }

    function busy(state) {
      if (state) form.setAttribute('aria-busy', 'true');
      else form.removeAttribute('aria-busy');
      if (button) button.disabled = !!state;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // The two spam traps, before anything else. Either renders the
      // success panel without sending: telling a bot it was caught is
      // telling the next bot how.
      if ((honeypot && String(honeypot.value || '').trim()) || Date.now() - armedAt < HUMAN_FLOOR_MS) {
        succeed();
        return;
      }

      var firstBad = null;
      fields.forEach(function (field) {
        if (!check(field) && !firstBad) firstBad = field;
      });
      if (firstBad) {
        if (failurePanel) failurePanel.hidden = true;
        firstBad.control.focus();
        return;
      }

      busy(true);

      var action = form.getAttribute('action');
      var method = (form.getAttribute('method') || 'post').toUpperCase();

      window
        .fetch(action, {
          method: method,
          // Accept JSON so an endpoint that would otherwise answer with its
          // own thank-you page answers this script instead. The day a route
          // is chosen, this line and the ok test below are the only two the
          // wiring may need to touch.
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        })
        .then(function (response) {
          busy(false);
          if (response && response.ok) succeed();
          else fail();
        })
        .catch(function () {
          // A network error, a CORS refusal and a host that answers a POST
          // to a static path all land here, and all mean the same thing to
          // the reader.
          busy(false);
          fail();
        });
    });
  }

  // window.fetch is the one modern API this depends on. Without it the
  // listener is never attached and the form submits natively to its named
  // route, which is precisely the no-script behaviour — a browser that old
  // gets the old form rather than a broken one.
  if (!window.fetch || !window.FormData) return;

  Array.prototype.forEach.call(forms, setup);
})();
