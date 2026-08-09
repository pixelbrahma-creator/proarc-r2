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
   * The frame is GONE (7 Aug), and with it the only pointer-dependent
   * behaviour on these pages.
   *
   * It swapped one standing photograph as the cursor moved down the
   * catalogue — the sector pages' answer to showing more than three
   * records as images, and an answer only a mouse could ask for. The set
   * gives every record its own photograph at every width and on every
   * pointer, so there is nothing left to swap and nothing left that a
   * keyboard reader had to be given a `focusin` equivalent of.
   * ---------------------------------------------------------------- */

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
   * A BARE SECTOR WORD MEANS THE ROOM (Session XXIV)
   *
   * The same move nounSet made for the twelve building nouns, one level
   * up. The blob carries each record's sector name, so a sector word
   * OVER-reaches where a building noun under-reached — measured on the
   * built index: `homes` returned 17 where the Lives room prints 16,
   * because "Homes R Us" is a Showroom whose TITLE contains the word.
   *
   * So when the WHOLE query is one of these four, it reads the record's
   * own `sector` field and ignores the blob. Everything else is
   * unchanged: the VERBS (learns, shops, works, lives) were already
   * exact against the rooms and still go through the blob, and so do
   * names, districts, years and any two-word query.
   *
   * 🔴 The map is word -> sector KEY, not word -> word. The row says
   * Malls and Offices; the data says shops and works. One taxonomy,
   * two registers (03-work §2.1) — the translation lives here, once.
   * ---------------------------------------------------------------- */
  var SECTOR_WORDS = { schools: 'schools', malls: 'shops', offices: 'works', homes: 'homes' };

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

    /* ---------------------------------------------------------------- *
     * The sector row — a SECOND DOOR onto the search, not a second filter.
     *
     * Pressing an item writes its word into the field and into ?q=, so the
     * two halves of the island can never disagree about the page's state,
     * and typing `schools` by hand lights Schools. If the row filtered
     * while the field sat empty, the page would carry two controls telling
     * different stories about what it is showing.
     *
     * It ships `hidden` in the markup and is revealed here: a reader whose
     * script never runs meets no dead control. (E13.2a's shape — the page
     * ships in the safe state and the script arms the behaviour.)
     * ---------------------------------------------------------------- */
    var sectorRow = document.querySelector('[data-sectors]');
    var sectorBtns = sectorRow ? sectorRow.querySelectorAll('[data-sector]') : [];

    /* ---------------------------------------------------------------- *
     * THE FILTERED BODY (Session XXXVII) — the page answers the control
     *
     * 🔴 THIS REVERSES A WRITTEN DECISION, and it is recorded here because
     * the next reader will find the old one. 03-work §4.4 said "the rooms
     * do not move while results show, and that is a decision, not an
     * omission ... put to Mahesh 6 Aug and left as it stands". Mahesh
     * re-ruled it on 9 Aug off the rendered page: pressing Schools gave a
     * fifteen-name LIST and then the whole forty-six-photograph index
     * underneath it, malls and homes included, and the page got LONGER —
     * 7,825px at rest to 8,587 filtered. "have the images come first and
     * then the list ... all the category pages."
     *
     * THE SHAPE IS ONE SPINE: photographs, then the count, then the list.
     * What varies is only whether a TRUE heading can ride above it.
     *
     *   a sector word -> the filtered page IS the room. Its own heading
     *     (still the door to its sector page), its own opener, its own
     *     band — the set this page has ALREADY composed. The other three
     *     rooms and the mosque leave. No new markup and no arithmetic.
     *
     *   free text -> nothing has composed that set. `2016` reaches 5
     *     records across two rooms; `al jurf` reaches 7 across two rooms
     *     AND the mosque. No heading is true of it and no opener describes
     *     it, so it gets the band alone, recomposed into [data-found].
     *
     * 🔴 NOTHING is hidden when the query finds NOTHING. One mistyped
     * character must not empty the page: at zero hits the index stays
     * whole and the tally says so. The index leaves only when something
     * replaces it.
     *
     * 🔴 AND THE ROOM IS FOUND BY ITS OWN KEY, never by position. An index
     * into a NodeList is the `mks[0]` shape Session XXXVI spent its length
     * removing — `[data-room]` carries the same string the search index's
     * `sector` field does, both from `room.key` in build/lib/work.js.
     * ---------------------------------------------------------------- */
    var roomEls = document.querySelectorAll('[data-room]');
    var mosqueEl = document.querySelector('[data-mosque]');
    var foundEl = document.querySelector('[data-found]');

    /* Where the tally and the list live at rest. They are MOVED rather than
       duplicated — a second list built somewhere else is two sources for one
       count — so the page has to remember the slot they came out of. A
       comment node is the only anchor that cannot itself be styled, hidden
       or measured by mistake. */
    var reportHome = document.createComment(' tally + results at rest ');
    if (arrivalTally && arrivalTally.parentNode) {
      arrivalTally.parentNode.insertBefore(reportHome, arrivalTally);
    }

    function report(host) {
      if (host) {
        host.appendChild(arrivalTally);
        host.appendChild(results);
        return;
      }
      var at = reportHome.parentNode;
      at.insertBefore(arrivalTally, reportHome.nextSibling);
      at.insertBefore(results, arrivalTally.nextSibling);
    }

    /* Every tile already on the page, addressed by the href its link
       carries — which is the same string the search index's `href` field
       carries, because build/lib/work.js writes both from the same slug and
       the same prefix. Cloning an existing tile is what keeps the found
       band's photographs, srcsets and captions identical to the room's
       without a second renderer. */
    var TILES = {};
    var tileCount = 0;
    [].forEach.call(document.querySelectorAll('.wk-tile'), function (li) {
      var a = li.querySelector('.wk-tile__link');
      if (!a) return;
      TILES[a.getAttribute('href')] = li;
      tileCount++;
    });

    /* ---------------------------------------------------------------- *
     * THE BAND'S RULE, READ FROM THE BUILD (§ THE BAND in build/lib/work.js)
     *
     * The six numbers are EMITTED, not retyped, because a beat and a clamp
     * written twice drift apart silently at some width nobody photographs.
     * The arithmetic below is still a second copy of `bandGroups()` and
     * that cannot be removed without a module system this site does not
     * ship — so `p27` asserts the two agree: it runs this grouper over a
     * full room and requires the row boundaries to equal the ones the build
     * emitted into the markup. A duplication you cannot delete is one you
     * tripwire.
     * ---------------------------------------------------------------- */
    var bandRuleEl = document.getElementById('wk-band-rule');
    var RULE = null;
    if (bandRuleEl) {
      try {
        RULE = JSON.parse(bandRuleEl.textContent);
      } catch (err) {
        RULE = null;
      }
    }

    function rowHeight(aspects) {
      var sum = 0;
      for (var i = 0; i < aspects.length; i++) sum += aspects[i];
      return (RULE.refColumn - RULE.gap * (aspects.length - 1)) / sum;
    }

    function bandGroups(aspects) {
      var rows = [];
      var i = 0;
      var beat = 0;
      while (i < aspects.length) {
        var remaining = aspects.length - i;
        var n = Math.min(RULE.pattern[beat % RULE.pattern.length], remaining);
        while (n < Math.min(RULE.maxPerRow, remaining) && rowHeight(aspects.slice(i, i + n)) > RULE.maxH) n++;
        while (n > 2 && rowHeight(aspects.slice(i, i + n)) < RULE.minH) n--;
        rows.push([i, i + n]);
        i += n;
        beat++;
      }
      /* A trailing row of one fills the column on its own, so its height is
         the column divided by its aspect and nothing else — 640px for an
         ordinary landscape frame. Merged backwards, exactly as the build
         does it, for exactly the same reason. */
      if (rows.length > 1 && rows[rows.length - 1][1] - rows[rows.length - 1][0] === 1) {
        var tail = rows.pop();
        rows[rows.length - 1][1] = tail[1];
      }
      return rows;
    }

    /* 🔴 THE BAND IS BUILT FROM THE HITS' ORDER, NOT THE DOM'S, and that is
       the fault the first render of this had. Collected by walking the page,
       the tiles come out in the ROOMS' order (all schools, then all shops)
       while the list beneath them is in the index's — so `?q=2016` showed
       the same five records in two different orders on one screen. Both
       halves now read `hits`, so they cannot disagree. */
    function composeFound(hits) {
      if (!RULE) return false;
      var aspects = [];
      for (var i = 0; i < hits.length; i++) {
        var li = TILES[hits[i].href];
        if (!li) return false;
        var a = parseFloat(li.style.getPropertyValue('--a'));
        if (!(a > 0)) return false;
        aspects.push(a);
      }
      var set = document.createElement('div');
      set.className = 'wk-set';
      var rows = bandGroups(aspects);
      for (var r = 0; r < rows.length; r++) {
        var ul = document.createElement('ul');
        /* A set of one is a different object — it is capped rather than
           justified, which is the mosque's own rule and the only reason a
           lone tile does not render 1,440px tall. */
        ul.className = 'wk-set__row' + (hits.length === 1 ? ' wk-set__row--solo' : '');
        ul.setAttribute('role', 'list');
        for (var k = rows[r][0]; k < rows[r][1]; k++) {
          ul.appendChild(TILES[hits[k].href].cloneNode(true));
        }
        set.appendChild(ul);
      }
      foundEl.textContent = '';
      foundEl.appendChild(set);
      return true;
    }

    /** The whole index, exactly as the page shipped it. */
    function showIndex() {
      for (var i = 0; i < roomEls.length; i++) roomEls[i].hidden = false;
      if (mosqueEl) mosqueEl.hidden = false;
      if (foundEl) {
        foundEl.hidden = true;
        foundEl.textContent = '';
      }
      report(null);
    }

    /** One room's set, with the report beneath it. */
    function showRoom(key) {
      var host = null;
      for (var i = 0; i < roomEls.length; i++) {
        var on = roomEls[i].getAttribute('data-room') === key;
        roomEls[i].hidden = !on;
        if (on) host = roomEls[i];
      }
      if (mosqueEl) mosqueEl.hidden = true;
      if (foundEl) {
        foundEl.hidden = true;
        foundEl.textContent = '';
      }
      report(host);
      return host;
    }

    /** A set nothing composed: photographs, then the report. */
    function showFound(hits) {
      if (!foundEl || !composeFound(hits)) return false;
      for (var i = 0; i < roomEls.length; i++) roomEls[i].hidden = true;
      if (mosqueEl) mosqueEl.hidden = true;
      foundEl.hidden = false;
      report(foundEl);
      return true;
    }

    /* Pressed reflects the QUERY, which is the single source of truth.
       "All" is pressed only at rest; a query that is neither empty nor a
       sector word — a name, a district, a year — presses nothing, because
       nothing on the row describes it. */
    function syncSectors(activeKey, isRest) {
      for (var i = 0; i < sectorBtns.length; i++) {
        var key = sectorBtns[i].getAttribute('data-sector');
        var on = key ? key === activeKey : isRest;
        sectorBtns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }

    var renderResults = function (q) {
      var searchTerms = terms(q);
      var whole = q.toLowerCase().trim();
      var asNoun = NOUNS[whole] ? whole : null;
      var asSector = SECTOR_WORDS[whole] || null;

      syncSectors(asSector, searchTerms.length === 0);

      if (!searchTerms.length) {
        results.hidden = true;
        results.textContent = '';
        // 🔴 EMPTY AT REST. This read `total + ' projects'` until 6 Aug
        // (Mahesh: "we are not giving number anywhere").
        if (arrivalTally) arrivalTally.textContent = '';
        showIndex();
        return;
      }

      var hits = records.filter(function (r) {
        if (asSector) return r.sector === asSector;
        return asNoun ? r.noun === asNoun : matches(r.text, searchTerms);
      });

      /* 🔴 A QUERY THAT FINDS NOTHING LEAVES THE INDEX ALONE. Hiding the
         rooms here would let one mistyped character empty the page — the
         reader would be looking at a blank surface holding a portfolio.
         The index leaves only when something replaces it. */
      if (!hits.length) {
        results.hidden = true;
        results.textContent = '';
        if (arrivalTally) arrivalTally.textContent = '0 results';
        showIndex();
        return;
      }

      /* The body answers the control. A sector word names a set the page
         has already composed, so the filtered page IS that room; anything
         else is a set nothing composed, and it is recomposed. If the
         recomposition cannot be done — no rule island, a tile the index
         names and the page does not — the whole index stays rather than
         half a page shipping: the list below is still correct, and this is
         an enhancement over a page that was already complete. */
      if (asSector) {
        showRoom(asSector);
      } else if (!showFound(hits)) {
        showIndex();
      }

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

    if (sectorRow) {
      sectorRow.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('[data-sector]') : null;
        if (!btn || !sectorRow.contains(btn)) return;
        /* "All" is a RESET, not a query: it clears the field, drops ?q= and
           returns the page to rest — which is also the only state that
           reaches the mosque, since Al Ghala is a name rather than a set
           (03-work §2.1) and belongs to no room. The four items reach 46;
           rest reaches all 47. */
        var word = btn.getAttribute('data-sector') ? btn.getAttribute('data-label').toLowerCase() : '';
        input.value = word;
        writeQuery(word);
        renderResults(word);
      });
      sectorRow.hidden = false;
    }

    var initialQ = readQuery();
    if (initialQ) input.value = initialQ;
    renderResults(initialQ);
  }
})();
