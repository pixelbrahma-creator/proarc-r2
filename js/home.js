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
   * THE MAP ANSWERS BACK WITH A BUILDING (Mahesh, 8 Aug).
   *
   * Two partitions ship and CSS decides which one is live: above 1024 the
   * pointer resolves to a MARK and one card names one building; below it the
   * pointer resolves to a DISTRICT and the cards name that district's
   * buildings. This file does not pick — it reads whichever region the event
   * actually reached, so the breakpoint lives in exactly one place.
   *
   * 🔴 EVERY CARD IS BUILT WITH createElement AND textContent, NEVER
   * innerHTML. The strings are project titles out of data/projects.json and
   * they are the client's own copy; one apostrophe or ampersand in a building
   * name is all it takes for a markup-assembled card to stop being markup.
   *
   * 🔴 THE TOUCH GATE IS `event.pointerType`, NOT A MEDIA QUERY, AND THE
   * DIFFERENCE IS A REAL DEVICE. A Windows touch laptop reports
   * `(hover: hover)` while its finger is still coarse, so a media-query gate
   * would hand that machine the desktop path and its first tap would leave the
   * page — which is precisely the fault this rewrite exists to remove. The
   * per-event type is populated correctly on both, measured on a real touch
   * harness at 375 and a real mouse at 1440.
   *
   * WHAT IS NOT HERE: navigation. Every region and every card is a real
   * `<a href>`, so travelling is the browser's own job — it survives this file
   * failing, it middle-clicks, it opens in a new tab and it puts the
   * destination on the status bar. With no script at all a district region
   * still reaches its filtered set on /projects and a mark region still
   * reaches its own record page. What this adds is the CARD, which is the part
   * that genuinely cannot exist without a script.
   */
  function selection() {
    var field = document.querySelector('[data-map]');
    var cards = document.querySelector('[data-cards]');
    if (!field || !cards) return;

    var marks = field.querySelectorAll('.hm-mark[data-slug]');
    if (!marks.length) return;

    /* Grouped once. The map is generated and does not change after load, so
       re-querying per pointer move would be work done 60 times a second to
       get the same answer. */
    var byDistrict = {};
    var bySlug = {};
    for (var i = 0; i < marks.length; i++) {
      var key = marks[i].getAttribute('data-district');
      (byDistrict[key] || (byDistrict[key] = [])).push(marks[i]);
      bySlug[marks[i].getAttribute('data-slug')] = marks[i];
    }

    var place = document.querySelector('[data-cards-place]');
    var applied = null;
    var lit = [];

    function light(nodes) {
      for (var a = 0; a < lit.length; a++) lit[a].classList.remove('is-current');
      lit = nodes || [];
      for (var b = 0; b < lit.length; b++) lit[b].classList.add('is-current');
      if (lit.length) field.setAttribute('data-current', '');
      else field.removeAttribute('data-current');
    }

    function card(hit, withPlace) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'hm-card';
      a.href = hit.getAttribute('href');

      var img = document.createElement('img');
      img.className = 'hm-card__thumb';
      img.src = hit.getAttribute('data-thumb');
      // Every thumb in images/manifest.json is 800x600 — one ratio, checked.
      img.width = 800;
      img.height = 600;
      img.loading = 'lazy';
      img.decoding = 'async';
      /* The link's own text names the building, so the image is decorative
         here: an alt repeating the name would say it twice to a screen
         reader. It is empty by decision, not by omission. */
      img.alt = '';

      var name = document.createElement('span');
      name.className = 'hm-card__name';
      name.textContent = hit.getAttribute('data-name') || '';

      var meta = document.createElement('span');
      meta.className = 'hm-card__meta';
      /* 🔴 THE DISTRICT RIDES THE CARD ONLY WHEN THE CARD IS ALONE, and that
         is the positional claim being kept honest rather than a tidiness
         rule. A single card answers a point on the drawing, so it must say
         what the record actually holds — a DISTRICT, never a coordinate. A
         district's set already carries that name in its own heading, and
         restating it on all six rows is the "group's own heading restated per
         line" fault build/lib/work.js names in the room tables. */
      meta.textContent = withPlace
        ? [hit.getAttribute('data-noun'), hit.getAttribute('data-place')].filter(Boolean).join(' · ')
        : hit.getAttribute('data-noun') || '';

      a.appendChild(img);
      a.appendChild(name);
      a.appendChild(meta);
      li.appendChild(a);
      return li;
    }

    function clear() {
      if (applied === null) return;
      applied = null;
      cards.textContent = '';
      cards.hidden = true;
      if (place) {
        place.textContent = '';
        place.hidden = true;
      }
      light(null);
    }

    /**
     * `hit` is whichever region the pointer reached. A MARK region carries the
     * card's own data; a DISTRICT region carries none, so its cards are read
     * off the mark regions of that district — one source either way, and no
     * project string is ever duplicated between the two layers.
     */
    function show(hit) {
      var isMark = hit.classList.contains('hm-hit--mark');
      var district = hit.getAttribute('data-district');
      var key = (isMark ? 'm:' : 'd:') + (isMark ? hit.getAttribute('data-slug') : district);
      if (key === applied) return;
      applied = key;

      var sources = isMark
        ? [hit]
        : [].slice.call(field.querySelectorAll('.hm-hit--mark[data-district="' + district + '"]'));

      cards.textContent = '';
      for (var c = 0; c < sources.length; c++) cards.appendChild(card(sources[c], isMark));
      cards.hidden = sources.length === 0;

      /* The set's own heading — the district the reader pressed. A single
         card needs none: it names its own district on its own line. */
      if (place) {
        place.textContent = isMark ? '' : hit.getAttribute('data-place') || '';
        place.hidden = isMark || !place.textContent;
      }

      /* A mark lights itself; a district lights its whole cluster. The answer
         and the thing lit are the same object in both cases, which is what
         Mahesh's 6 Aug rule asked for — it read "light the area you are
         pointing at" when the answer was an area, and it reads "light the
         building you are pointing at" now that the answer is a building. */
      /* 🔴 THE MARK, NOT THE REGION. `hit` is the hit-layer anchor; the thing
         that carries the ink is the <circle> with the same slug. Lighting the
         anchor sets the class on an invisible path, so `[data-current]` dims
         all 28 marks and lights none — every dot goes grey and the drawing
         looks broken in exactly the state the card is meant to explain. */
      var current = isMark ? [bySlug[hit.getAttribute('data-slug')]] : byDistrict[district];
      light((current || []).filter(Boolean));
    }

    function hitFrom(node) {
      return node && typeof node.closest === 'function' ? node.closest('.hm-hit') : null;
    }

    /* mouseover BUBBLES where mouseenter does not, so one listener covers
       every region. `closest` rather than the target itself: a region is an
       `<a>` wrapping a `<path>`, and the path is what the pointer lands on.

       The regions TILE the field, but the field's BOX is larger than the
       drawing at every width — the svg is centred in a full-width block — so
       the margin around it resolves to null and clears, which is correct: the
       reader is not pointing at anything. */
    field.addEventListener('mouseover', function (event) {
      var hit = hitFrom(event.target);
      if (hit) show(hit);
      else clear();
    });

    field.addEventListener('mouseleave', clear);

    /* 🔴 THE FIRST CONTACT REVEALS; IT DOES NOT TRAVEL.
     *
     * Before this, a tap fired the compatibility `mouseenter` that filled the
     * answer and the `click` that left the page IN THE SAME EVENT TURN, so the
     * answer was destroyed before it painted and a phone reader could never
     * see it at all. Suppressing that first click is deterministic — the
     * compatibility click arrives after `touchend` — and the second tap lands
     * on the CARD, which is a ~330x250 target rather than a 12px one.
     *
     * A district region suppresses EVERY first click, mouse included: below
     * 1024 the cards open under the drawing, so a hover-driven reveal would
     * grow the band under the pointer, move the drawing, and change which
     * region the cursor is over — /ajman's recorded "clicking Al Zorah lit
     * Emirates City", arriving through layout instead of through scroll.
     * Click-driven growth is asked for by the reader and moves nothing they
     * are still pointing at. */
    field.addEventListener(
      'click',
      function (event) {
        var hit = hitFrom(event.target);
        if (!hit) return;

        var coarse = event.pointerType === 'touch' || event.pointerType === 'pen';
        var isDistrict = hit.classList.contains('hm-hit--district');
        var first = applied === null || (isDistrict
          ? applied !== 'd:' + hit.getAttribute('data-district')
          : applied !== 'm:' + hit.getAttribute('data-slug'));

        if (isDistrict || (coarse && first)) {
          event.preventDefault();
          show(hit);
        }
      },
      true
    );
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
