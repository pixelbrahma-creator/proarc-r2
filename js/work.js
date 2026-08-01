/* =========================================================================
   The Work surfaces' one script — enhancement only.

   Spec: _bmad/wds/D-UX-Design/03-work.md §4–§5. Every page it loads on is
   complete without it: the ledger renders all rows in Proarc's order, the
   sector catalogues carry their thumbnails below 1024px, and the search
   field simply does nothing until this file arrives. Controls that need
   the script (chips, sort) ship [hidden] and are revealed here, so a
   no-JS reader never sees a dead control.

   What it owns:

     the standing/floating photograph frame — row hover AND keyboard focus
     (never hover alone), instant swap, no transition
     the ledger's chips (aria-pressed), sort and search, composed
     the arrival's search over the build-generated index island
     ?q= — state, never a route: read on load, written via replaceState

   Chip tallies are data furniture and stay live under search (§4.3).
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
   * The ledger — chips · sort · search, composed
   * ---------------------------------------------------------------- */

  var tbody = document.querySelector('[data-tbody]');
  if (tbody) {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.wk-table__row'));
    var chipsBox = document.querySelector('[data-chips]');
    var sortBox = document.querySelector('[data-sort]');
    var select = sortBox ? sortBox.querySelector('select') : null;
    var field = document.querySelector('[data-search] input');
    var tally = document.querySelector('[data-tally]');

    var state = { sector: 'all', q: '', sort: 'proarc' };

    if (chipsBox) chipsBox.removeAttribute('hidden');
    if (sortBox) sortBox.removeAttribute('hidden');

    var rowMatchesSearch = function (row, searchTerms) {
      return !searchTerms.length || matches(row.getAttribute('data-search') || '', searchTerms);
    };

    var apply = function () {
      var searchTerms = terms(state.q);
      var shown = 0;

      rows.forEach(function (row) {
        var sectorOk = state.sector === 'all' || row.getAttribute('data-sector') === state.sector;
        var searchOk = rowMatchesSearch(row, searchTerms);
        var show = sectorOk && searchOk;
        row.hidden = !show;
        if (show) shown++;
      });

      // Chip tallies stay live under search — each counts its own sector
      // inside the current query, independent of which chip is pressed.
      if (chipsBox) {
        Array.prototype.forEach.call(chipsBox.querySelectorAll('[data-chip]'), function (chip) {
          var key = chip.getAttribute('data-chip');
          var n = rows.filter(function (row) {
            return (key === 'all' || row.getAttribute('data-sector') === key) && rowMatchesSearch(row, searchTerms);
          }).length;
          chip.querySelector('.wk-chip__tally').textContent = String(n);
        });
      }

      if (tally) tally.textContent = searchTerms.length ? shown + ' of ' + rows.length : '';

      sort();
    };

    var sort = function () {
      // Remove any previous group head before reordering.
      var oldHead = tbody.querySelector('.wk-table__grouphead');
      if (oldHead) oldHead.parentNode.removeChild(oldHead);

      var sorted = rows.slice();
      if (state.sort === 'az') {
        sorted.sort(function (a, b) {
          return a.getAttribute('data-title') < b.getAttribute('data-title') ? -1 : 1;
        });
      } else if (state.sort === 'newest') {
        // §3.2: in-progress first, then parseable years descending, then
        // the year-to-be-confirmed group — each group stable in D1 order.
        var rank = function (row) {
          if (row.hasAttribute('data-inprogress')) return 0;
          return row.hasAttribute('data-year') ? 1 : 2;
        };
        sorted.sort(function (a, b) {
          var r = rank(a) - rank(b);
          if (r) return r;
          if (rank(a) === 1) {
            var y = Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            if (y) return y;
          }
          return Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order'));
        });
      } else {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order'));
        });
      }

      sorted.forEach(function (row) {
        tbody.appendChild(row);
      });

      // The plainly-headed TBC group (§3.2) — only under newest-first, and
      // only when the group has a visible member.
      if (state.sort === 'newest') {
        var firstTbc = sorted.filter(function (row) {
          return !row.hasAttribute('data-inprogress') && !row.hasAttribute('data-year') && !row.hidden;
        })[0];
        if (firstTbc) {
          var head = document.createElement('tr');
          head.className = 'wk-table__grouphead';
          var th = document.createElement('th');
          th.setAttribute('colspan', '4');
          th.setAttribute('scope', 'colgroup');
          th.className = 't-meta-label';
          th.textContent = 'Year to be confirmed';
          head.appendChild(th);
          tbody.insertBefore(head, firstTbc);
        }
      }
    };

    if (chipsBox) {
      chipsBox.addEventListener('click', function (e) {
        var chip = e.target.closest ? e.target.closest('[data-chip]') : null;
        if (!chip) return;
        state.sector = chip.getAttribute('data-chip');
        Array.prototype.forEach.call(chipsBox.querySelectorAll('[data-chip]'), function (c) {
          c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
        });
        apply();
      });
    }

    if (select) {
      select.addEventListener('change', function () {
        state.sort = select.value;
        apply();
      });
    }

    if (field) {
      field.addEventListener('input', function () {
        state.q = field.value.trim();
        writeQuery(state.q);
        apply();
      });
      var initial = readQuery();
      if (initial) {
        field.value = initial;
        state.q = initial;
      }
    }

    apply();
    return; // the ledger never carries the arrival's island
  }

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

    var total = records.length;

    var renderResults = function (q) {
      var searchTerms = terms(q);

      if (!searchTerms.length) {
        results.hidden = true;
        results.textContent = '';
        if (arrivalTally) arrivalTally.textContent = total + ' projects';
        return;
      }

      var hits = records.filter(function (r) {
        return matches(r.text, searchTerms);
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
      if (arrivalTally) arrivalTally.textContent = hits.length + ' of ' + total;
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
