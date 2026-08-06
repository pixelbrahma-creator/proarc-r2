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

  /* 🔴 THE TWO HALVES ARE SEPARATE AND THE GATES ARE NOT SHARED (6 Aug).
     Everything below this point used to sit behind two early returns — no
     IntersectionObserver, or prefers-reduced-motion — because everything below
     it was the reveal. The map's readout is not motion: a reader who asked for
     less of it still wants to know which district they are pointing at, and a
     browser with no IntersectionObserver has a working pointer. Returning
     early from the whole file would have taken the answer away from both, and
     the fault would have been invisible on every machine that develops it. */
  reveals();
  selection();

  function reveals() {
    // No observer, no animation — and no arming either, so both finished
    // drawings stand.
    if (typeof IntersectionObserver !== 'function') return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce && reduce.matches) return;

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
  }

  /**
   * THE MAP ANSWERS BACK — the district under the pointer, named, with what
   * stands in it (Mahesh, 6 Aug).
   *
   * 🔴 THE CLICK IS NOT HERE, AND ITS ABSENCE IS THE DESIGN. Every region is
   * a real `<a href>` (build/lib/home.js), so travelling to /ajman is the
   * browser's own job: it survives this file failing, it middle-clicks, it
   * opens in a new tab and it puts the destination on the status bar. A
   * cross-document navigation implemented as a click handler is a link
   * pretending not to be one. What this function adds is the READOUT, which
   * is the part that genuinely cannot exist without a script.
   */
  function selection() {
    var field = document.querySelector('[data-map]');
    var readout = document.querySelector('[data-readout]');
    if (!field || !readout) return;

    /* `data-readout-place`, not `data-place`. The regions carry `data-place`
       as their data and sit EARLIER in the document, so an unscoped lookup
       finds a region rather than this span — see the note in pages-src. This
       query is scoped to the readout and would have been safe either way; the
       attribute is renamed so that a probe, or the next person, cannot write
       the unscoped version and get a confident wrong answer. */
    var place = readout.querySelector('[data-readout-place]');
    var of = readout.querySelector('[data-readout-of]');
    if (!place || !of) return;

    // Marks grouped by district, once. The map is generated and does not
    // change after load, so re-querying per pointer move would be work done
    // 60 times a second to get the same answer.
    var byDistrict = {};
    var marks = field.querySelectorAll('.hm-mark[data-district]');
    for (var i = 0; i < marks.length; i++) {
      var key = marks[i].getAttribute('data-district');
      (byDistrict[key] || (byDistrict[key] = [])).push(marks[i]);
    }
    if (!marks.length) return;

    var applied = null;

    function apply(hit) {
      var next = hit ? hit.getAttribute('data-district') : null;
      if (next === applied) return;

      if (applied && byDistrict[applied]) {
        for (var a = 0; a < byDistrict[applied].length; a++) {
          byDistrict[applied][a].classList.remove('is-current');
        }
      }

      if (next && byDistrict[next]) {
        for (var b = 0; b < byDistrict[next].length; b++) {
          byDistrict[next][b].classList.add('is-current');
        }
        field.setAttribute('data-current', next);
        place.textContent = hit.getAttribute('data-place') || '';
        of.textContent = hit.getAttribute('data-of') || '';
      } else {
        field.removeAttribute('data-current');
        place.textContent = '';
        of.textContent = '';
      }

      applied = next;
    }

    /* mouseover BUBBLES where mouseenter does not, so one listener covers all
       ten regions. `closest` rather than the target itself: the region is an
       `<a>` wrapping a `<path>`, and the path is what the pointer actually
       lands on.

       The regions TILE the field, so there are no gaps between them to fall
       into — but the field's box is larger than the drawing at every width
       (the svg is centred in a full-width block), and the margin around it
       resolves to null here and clears, which is correct: the reader is not
       pointing at a district. */
    field.addEventListener('mouseover', function (event) {
      var node = event.target;
      apply(node && typeof node.closest === 'function' ? node.closest('.hm-hit[data-district]') : null);
    });

    field.addEventListener('mouseleave', function () {
      apply(null);
    });
  }

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
})();
