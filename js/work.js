/* =========================================================================
   The Work surfaces' one script — enhancement only.

   Spec: _bmad/wds/D-UX-Design/03-work.md §4–§5. Every page it loads on is
   complete without it: the arrival's four room tables render all 47 records
   in Proarc's order, the sector catalogues carry their thumbnails below
   1024px, and the search field simply does nothing until this file arrives.

   What it owns:

     the standing/floating photograph frame — row hover AND keyboard focus
     (never hover alone), instant swap, no transition
     the arrival's search over the build-generated index island
     ?q= — state, never a route: read on load, written via replaceState

   The ledger's chips and sort were the third thing it owned until Session
   XXI; see the note where they stood.
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------- *
   * The frame — sector catalogue and ledger, pointer and keyboard
   * ---------------------------------------------------------------- */

  var frame = document.querySelector('[data-frame] img');
  if (frame) {
    var links = document.querySelectorAll('a[data-thumb]');
    Array.prototype.forEach.call(links, function (link) {
      var swap = function () {
        var thumb = link.getAttribute('data-thumb');
        if (thumb && frame.getAttribute('src') !== thumb) frame.setAttribute('src', thumb);
      };
      link.addEventListener('mouseenter', swap);
      link.addEventListener('focusin', swap);
    });
  }

  /* ---------------------------------------------------------------- *
   * ?q= — shared by both search surfaces
   * ---------------------------------------------------------------- */

  function readQuery() {
    var m = /[?&]q=([^&]*)/.exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  function writeQuery(q) {
    var base = window.location.pathname;
    var url = q ? base + '?q=' + encodeURIComponent(q) : base;
    window.history.replaceState(null, '', url);
  }

  /** Every whitespace-separated term must match — "school 2016" narrows. */
  function matches(text, terms) {
    for (var i = 0; i < terms.length; i++) {
      if (text.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  function terms(q) {
    return q.toLowerCase().split(/\s+/).filter(Boolean);
  }

  /* ---------------------------------------------------------------- *
   * A BARE NOUN MEANS THE KIND (Session XXII)
   *
   * `text` is one lowercased blob and `matches` looks for a substring in
   * it, which is right for "black square" and wrong for a KIND. Measured
   * on the built index: `mall` returned 13 because every shops record
   * carries the sector's own name "Malls & shops"; `university` returned 5
   * because City School and the two City Lifes say they are "part of the
   * city university campus"; `tower` returned 7 because a substring cannot
   * tell "tower" from "towers". None of those is a Mall, a University or a
   * Tower, and the room tables beside the field say 5, 2 and 4.
   *
   * So when the WHOLE query is exactly one of the twelve building nouns,
   * it reads the record's own `noun` field and ignores the blob. Anything
   * else — a name, a district, a year, a verb, two words — is unchanged,
   * so "learns", "shops", "al zorah" and "black square" all still work.
   *
   * 🔴 It is keyed on the whole query, not on each term, and that is
   * deliberate: "mall 2016" is a reader narrowing by hand and must keep
   * the blob's reach, or the year would have nothing to match against.
   * ---------------------------------------------------------------- */
  function nounSet(records) {
    var set = {};
    for (var i = 0; i < records.length; i++) {
      if (records[i].noun) set[records[i].noun] = true;
    }
    return set;
  }

  /* ---------------------------------------------------------------- *
   * THE LEDGER'S CONTROLLER IS GONE (Session XXI, 6 Aug)
   *
   * ~140 lines stood here driving projects/list.html: the chips
   * (aria-pressed + live tallies), the three-way sort with its
   * newest-first group heads, and a search composed over both. The page
   * they drove retired into the arrival's four room tables — the two
   * surfaces were rendering the same 47 records under the same four-way
   * cut, and the rooms were always the filter (03-work §4.1), so the
   * chips were a second answer to a question the page had answered.
   *
   * Nothing below reads [data-tbody], [data-chips] or [data-sort]. If a
   * surface ever wants a sortable flat run again, it is at
   * 68ab58d:js/work.js — do not re-derive it.
   * ---------------------------------------------------------------- */

  /* ---------------------------------------------------------------- *
   * The arrival — search over the build-generated index island
   * ---------------------------------------------------------------- */

  var island = document.getElementById('wk-search-index');
  if (island) {
    var records;
    try {
      records = JSON.parse(island.textContent);
    } catch (err) {
      return;
    }

    var input = document.querySelector('[data-search] input');
    var results = document.querySelector('[data-results]');
    var arrivalTally = document.querySelector('[data-tally]');
    if (!input || !results) return;

    var NOUNS = nounSet(records);

    var renderResults = function (q) {
      var searchTerms = terms(q);
      var whole = q.toLowerCase().trim();
      var asNoun = NOUNS[whole] ? whole : null;

      if (!searchTerms.length) {
        results.hidden = true;
        results.textContent = '';
        // 🔴 EMPTY AT REST. This read `total + ' projects'` until 6 Aug
        // (Mahesh: "we are not giving number anywhere").
        if (arrivalTally) arrivalTally.textContent = '';
        return;
      }

      var hits = records.filter(function (r) {
        return asNoun ? r.noun === asNoun : matches(r.text, searchTerms);
      });

      results.textContent = '';
      hits.forEach(function (r) {
        var li = document.createElement('li');
        li.className = 'wk-row';
        var a = document.createElement('a');
        a.className = 'wk-row__link';
        a.setAttribute('href', r.href);
        var name = document.createElement('span');
        name.className = 'wk-row__name t-meta-value';
        name.textContent = r.name;
        a.appendChild(name);
        if (r.meta) {
          var meta = document.createElement('span');
          meta.className = 'wk-row__meta t-caption';
          var span = document.createElement('span');
          span.textContent = r.meta;
          meta.appendChild(span);
          a.appendChild(meta);
        }
        li.appendChild(a);
        results.appendChild(li);
      });

      results.hidden = false;
      // The count the reader ASKED FOR by typing, without the portfolio
      // total they did not — this read `hits.length + ' of ' + total`.
      if (arrivalTally) {
        arrivalTally.textContent = hits.length === 1 ? '1 result' : hits.length + ' results';
      }
    };

    input.addEventListener('input', function () {
      var q = input.value.trim();
      writeQuery(q);
      renderResults(q);
    });

    var initialQ = readQuery();
    if (initialQ) input.value = initialQ;
    renderResults(initialQ);
  }
})();
