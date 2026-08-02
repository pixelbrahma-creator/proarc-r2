'use strict';

/**
 * The mark on Home's second beat — GENERATED FROM THE RECORDS.
 *
 * Spec: 01-home.md §5.1a. It exists because the first version of this mark
 * was drawn from an idea about the practice, and every other drawn surface
 * on this site is drawn from the data: the map's marks come from the
 * districts (E7.1/E7.2), Services' range from fifteen real configurations
 * (E3.7). A drawing that is not derived is decoration holding the evidence's
 * pen, and the site has refused that everywhere else.
 *
 * WHAT IT DRAWS. One course per record — forty-seven of them — stacked on a
 * datum line. A course's WIDTH is the size of the set that record belongs
 * to, so the courses group themselves into five bands and the silhouette
 * steps inward as the sets get smaller:
 *
 *     homes    16  ┃████████████████┃  the plinth
 *     schools  15  ┃███████████████ ┃
 *     shops    12  ┃████████████    ┃
 *     works     3  ┃███            ┃  the shaft
 *     mosque    1  ┃█             ┃  the point
 *
 * Nothing about that shape is chosen. The steps are the portfolio's own
 * proportions, the shaft is thin because the works set is thin, and the
 * mark comes to a point because the fifth verb has one building behind it.
 * **If O5 merges the two corroborated school pairs, the mark redraws** —
 * output changes, no copy changes, exactly as /ajman's statement was
 * written to behave.
 *
 * WHAT IS NOT DRAWN, and why. The first version carried an archway at its
 * centre for "approvals navigated". **There is no approvals data on any
 * record**, so the arch does not exist here. A zone with no data does not
 * get drawn from an idea — that is the whole point of this file.
 *
 * NO NUMBER IS PRINTED. E12 governs display prose; this is a drawing, and
 * the Services precedent is explicit — the drawing may show what the prose
 * may not say. There is no legend, no label, no axis and no caption.
 *
 * THE INVENTED VALUES, stated rather than buried (E3.3's convention): the
 * course height and the mark's maximum width are the drawing's own units.
 * Every other dimension is derived from them by a record count.
 */

const R = require('./records');

/* The drawing's own units — the only two numbers here that no record
   decides. Everything else is a count. */
const COURSE_H = 20;   // one record's course
const MARK_W = 320;    // the widest set's width
const GAP = 1.5;       // the joint between two courses
const DATUM_PAD = 14;  // the ground line's overhang past the plinth

/** Sets, largest first — the order is the counts', not an authored list. */
function bands(projects) {
  const by = new Map();
  projects.forEach((p) => {
    const k = R.sectorKey(p);
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(p);
  });

  const out = [];
  by.forEach((records, key) => {
    records.forEach((p) => {
      if (typeof p.order !== 'number') {
        throw new Error(
          `crest: ${p.slug} carries no D1 \`order\`. The mark stacks the sets in Proarc's own ` +
            'order, so an unordered record would be drawn in file order and the drawing would ' +
            'be stable only by accident.'
        );
      }
    });
    records.sort((a, b) => a.order - b.order);
    out.push({ key, records });
  });

  if (!out.length) throw new Error('crest: no records — the mark is the portfolio, so an empty portfolio has no mark.');
  out.sort((a, b) => b.records.length - a.records.length || a.key.localeCompare(b.key));
  return out;
}

/**
 * The courses, bottom-up. Returns plain geometry so the renderer holds no
 * rules and the rules hold no markup.
 */
function courses(projects) {
  const list = bands(projects);
  const max = list[0].records.length;
  const rows = [];
  let i = 0;

  list.forEach((band) => {
    const w = (MARK_W * band.records.length) / max;
    band.records.forEach((record, n) => {
      rows.push({
        band: band.key,
        slug: record.slug,
        /* The set's own D1 lead takes the heavier line: five of the
           forty-seven, and which five is a data fact, not a page one. */
        lead: n === 0,
        w,
        index: i++,
      });
    });
  });
  return rows;
}

function markup(projects) {
  const rows = courses(projects);
  const H = rows.length * COURSE_H;
  const totalW = MARK_W + DATUM_PAD * 2;
  const cx = totalW / 2;
  const bottom = H + 8;

  const parts = [];
  const push = (zone, tag) => parts.push({ zone, tag });

  /* The datum, first — the ground line before what stands on it, which is
     the order js/services.js already draws in. */
  push('datum', `<line x1="0" y1="${bottom}" x2="${totalW}" y2="${bottom}" stroke-width="1.8"/>`);

  rows.forEach((row) => {
    const y = bottom - 8 - row.index * COURSE_H;
    const half = row.w / 2;
    push(
      'course',
      `<line x1="${(cx - half).toFixed(1)}" y1="${y}" x2="${(cx + half).toFixed(1)}" y2="${y}" ` +
        `stroke-width="${row.lead ? 1.8 : 0.6}"/>`
    );
  });

  /* The silhouette: one polyline up each flank, stepping in where a set
     ends. Drawn from the courses rather than authored, so it can never
     disagree with them. */
  ['start', 'end'].forEach((side) => {
    const sign = side === 'start' ? -1 : 1;
    const pts = [];
    let prevW = null;
    rows.forEach((row) => {
      const y = bottom - 8 - row.index * COURSE_H;
      const x = cx + sign * (row.w / 2);
      if (prevW !== null && row.w !== prevW) {
        pts.push([cx + sign * (prevW / 2), y + COURSE_H - GAP]);
        pts.push([x, y + COURSE_H - GAP]);
      }
      if (prevW === null) pts.push([x, bottom - 8 + GAP]);
      prevW = row.w;
    });
    const last = rows[rows.length - 1];
    pts.push([cx + sign * (last.w / 2), bottom - 8 - last.index * COURSE_H]);
    push('flank', `<polyline points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" stroke-width="1.4"/>`);
  });

  /* The point. A set of one has no joint to draw, so the mark closes. */
  const top = rows[rows.length - 1];
  const topY = bottom - 8 - top.index * COURSE_H;
  push(
    'point',
    `<path d="M ${(cx - top.w / 2).toFixed(1)} ${topY} L ${cx} ${(topY - COURSE_H * 2.6).toFixed(1)} L ${(cx + top.w / 2).toFixed(1)} ${topY}" stroke-width="1.4"/>`
  );

  const apex = topY - COURSE_H * 2.6;
  const viewH = bottom + 10 - apex + 10;

  /* The stagger is a pure function of index, so a changed count changes the
     drawing and never the choreography. */
  const total = parts.length;
  const svg = parts
    .map((p, n) => {
      const delay = Math.round(140 + (n / Math.max(1, total - 1)) * 2200);
      return p.tag.replace(/^<(\w+)/, `<$1 pathLength="1" class="hm-crest__ln" style="--d:${delay}ms"`);
    })
    .join('');

  return (
    `<svg class="hm-crest__svg" viewBox="0 ${(apex - 10).toFixed(1)} ${totalW} ${viewH.toFixed(1)}" ` +
    `fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="miter" ` +
    `aria-hidden="true" focusable="false">${svg}</svg>`
  );
}

module.exports = { markup, courses, COURSE_H, MARK_W };
