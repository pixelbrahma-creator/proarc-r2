'use strict';

/**
 * The district layer — one derivation, three surfaces.
 *
 * The menu overlay's constellation (09-menu §6), Home's map beat and
 * /ajman's standing map all draw the same marks. They read them from here
 * so they cannot drift apart, and so a data fix reaches all three at once.
 *
 * What is derived and what is authored:
 *
 *   derived  which records earn a mark, and how many each district holds.
 *            Straight out of data/projects.json every build. A resolved O5
 *            duplicate or a landed district changes the output; no design
 *            decision and no hand-edit is involved (09-menu §6).
 *
 *   authored the cluster centres, in data/districts.json. Placeholder until
 *            the map commission lands, and labelled as such at every
 *            surface that draws them (E7.1 — the commission supplies
 *            coastline and boundaries; the marks are the page's).
 *
 * E7.2, no mark is placed by inference: a record earns a mark only when its
 * own location string names a district. Today 28 of 47 do. The 18 that say
 * only "Ajman" and the one in Umm Al Quwain are reported by name below, so
 * the gap stays visible rather than quietly rounding to 47.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

/**
 * The data carries at least one HTML entity in a location string
 * ("Marina &amp; Creek, Ajman") — an X1/X3-class fault that dies with the
 * prose pass. Decoding here means the normaliser matches on the text a
 * reader would see, not on the markup accident.
 */
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

/**
 * An `M … C … C …` path as a dense polyline. Only the two commands the
 * shoreline uses are handled, and ANYTHING ELSE THROWS rather than returning
 * a plausible answer — a short length silently under-draws the coast and
 * leaves a stub on the page, which looks like a design decision rather than a
 * parse failure. Same doctrine as services.js refusing an unrecognised level
 * (E3.7): a parser that shrugs draws the wrong thing.
 *
 * 240 samples per curve is far past the point where the polyline stops
 * getting longer at 0.1-unit resolution on a path this size.
 *
 * TWO CALLERS, ONE PARSER, and that is the point: the draw needs the path's
 * LENGTH and the scatter needs its POSITION, and a second walker written for
 * the second question is how a mark ends up cleared against a shoreline that
 * is not the one being drawn.
 */
function samplePathSubpaths(d) {
  const tokens = String(d).trim().split(/[\s,]+/);
  let i = 0;
  let cur = null;
  const subpaths = [];
  let points = null;

  const num = () => {
    const v = parseFloat(tokens[i++]);
    if (!isFinite(v)) throw new Error('districts: coast path has a non-numeric coordinate near token ' + i);
    return v;
  };

  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M') {
      /* 🔴 EVERY `M` STARTS A NEW SUBPATH, AND A SUBPATH BOUNDARY IS NOT A
         DRAWN LINE. A moveto is a pen lift: SVG strokes nothing across it.
         Collected flat, the gap between two subpaths gets summed into the
         path's length like any other step, and the length is what the dash
         is cut to — so a shoreline in two pieces would arm its draw with a
         dash longer than the ink and animate through a pause that looks like
         a stall. Same doctrine as this parser refusing an unknown command:
         a measurement taken against the wrong artefact is worse than none. */
      cur = [num(), num()];
      points = [cur];
      subpaths.push(points);
    } else if (cmd === 'C') {
      if (!cur) throw new Error('districts: coast path begins with a curve and no M');
      const p0 = cur;
      const p1 = [num(), num()];
      const p2 = [num(), num()];
      const p3 = [num(), num()];
      for (let s = 1; s <= 240; s++) {
        const t = s / 240;
        const u = 1 - t;
        points.push([
          u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
          u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
        ]);
      }
      cur = p3;
    } else {
      throw new Error(
        'districts: coast path uses the command "' + cmd + '", which this measurer does not handle. ' +
          'Only M and C are supported — add the command here rather than letting the draw be mis-timed.'
      );
    }
  }
  return subpaths;
}

/** Every sampled point, flat — what the SCATTER wants: it asks "how far is
 *  this dot from the water", and the water is every piece of the drawing. */
function samplePath(d) {
  return [].concat.apply([], samplePathSubpaths(d));
}

function pathLength(d) {
  const subpaths = samplePathSubpaths(d);
  let total = 0;
  for (const points of subpaths) {
    for (let i = 1; i < points.length; i++) {
      total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    }
  }
  /* 🔴 A MARGIN, AND IT IS NOT SLACK. `vector-effect: non-scaling-stroke`
     makes the dash pattern resolve in SCREEN pixels while this number is in
     USER units, and the two are equal only at scale 1 — which the 640–820px
     band is, exactly (the svg is authored 560 wide there for a 560-unit
     viewBox). Measured across twelve widths the screen length runs 297 · 371 ·
     445 · and 520 against a 520 dash: every band has room except that one,
     which sits on the knife-edge with 0.46 units to spare.

     A dash shorter than the path draws PART of the line and leaves the rest
     as a gap — a coastline that stops halfway, at one band only, looking like
     a deliberate shape rather than a fault. The fine-tune pass this shoreline
     is explicitly waiting for will LENGTHEN the path, so the failure is not
     hypothetical; it is queued. The margin costs nothing: a dash longer than
     the path draws the whole path, and the armed offset moves the whole thing
     clear either way. */
  return Math.ceil(total) + 24;
}

/**
 * X3 normalisation. A location is a comma-separated string running from the
 * most specific place to the least ("Eastern Sector, Aamra, Ajman"), so the
 * FIRST token that resolves to a known district is the record's district.
 *
 * That single rule handles every shape in the file today:
 *   "Jurf, Hamidiya, Al Zohrah, Ajman"   -> Al Jurf       (first wins; one record, one mark)
 *   "Marina Boardwalk, Al Zorah, Ajman"  -> Al Zorah      (a development inside a district)
 *   "Emirates City, Aamra, Ajman"        -> Emirates City (the more specific of the two)
 *   "Global City, Aalia, Ajman"          -> Aalia
 *   "Ajman, U.A.E"                       -> unplaced      (names no district)
 */
function resolveDistrict(location, districts, outsideEmirate) {
  if (!location) return { district: null, reason: 'no-location' };

  const tokens = decodeEntities(location)
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    const hit = districts.find((d) => d.aliases.includes(token));
    if (hit) return { district: hit.name, reason: 'district' };
  }

  const outside = tokens.some((t) => outsideEmirate.includes(t));
  return { district: null, reason: outside ? 'outside-emirate' : 'no-district' };
}

/**
 * Deterministic scatter. Math.random() would make every build differ, which
 * turns a meaningless diff into noise and a meaningful one into camouflage.
 * mulberry32 off the authored seed: same data in, same pixels out.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* How far a mark must stay from the edge of the field, in user units. The
   mark is a true 5px radius and the narrowest band draws a unit at 0.571px,
   so 5px is 8.75 units there — a mark inside 8.75 of the edge is CLIPPED at
   that band and whole everywhere else, which reads as a design decision
   rather than as a fault. 10 covers it with room. */
const EDGE_PAD = 10;

/* Rejection sampling, and the two constants that make it terminate.
   The authored jitter box holds most clusters at the authored separation;
   Al Jurf's six marks do not fit in 60×52 at 20 units apart, so after
   TRIES_PER_BOX failures the box grows by GROWTH_STEP and the search widens.
   Growth is per-ATTEMPT and never persisted: a one-mark district never grows,
   and a crowded one grows only as far as its own crowding demands (Al Jurf
   reaches ×1.10 today, nothing else leaves ×1.00). */
const TRIES_PER_BOX = 60;
const GROWTH_STEP = 0.05;
const MAX_TRIES = 20000;

/**
 * One mark's position — jittered off its district's centre, then REJECTED and
 * re-drawn until it is at least `minSeparation` from every mark already down.
 *
 * 🔴 THE TEST IS ON THE ROUNDED COORDINATES, which is not a detail. Positions
 * ship as integers, so a pair accepted at 20.01 and then rounded can land at
 * 19.4 — the check has to run on the numbers that reach the page, not on the
 * ones that were sampled. Same doctrine as pathLength refusing to guess: a
 * measurement taken against the wrong artefact is worse than none.
 *
 * Separation is checked against EVERY mark, not just the district's own. A
 * reader sees dots, not districts; two marks from neighbouring clusters that
 * overlap are exactly as uncountable as two from the same one.
 *
 * THROWS rather than placing an overlapping mark. A build that quietly gives
 * up puts the blob back on the page and takes the explanation away with it.
 */
function placeMark(district, rand, scatter, placed, vbWidth, vbHeight, coastPoints) {
  const min = scatter.minSeparation;
  let last = null;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const grow = 1 + Math.floor(attempt / TRIES_PER_BOX) * GROWTH_STEP;
    const x = Math.round(district.centre[0] + (rand() * 2 - 1) * scatter.jitterX * grow);
    const y = Math.round(district.centre[1] + (rand() * 2 - 1) * scatter.jitterY * grow);
    last = { x, y, grow };

    if (x < EDGE_PAD || x > vbWidth - EDGE_PAD || y < EDGE_PAD || y > vbHeight - EDGE_PAD) continue;
    if (coastPoints.some((p) => Math.hypot(p[0] - x, p[1] - y) < min)) continue;
    if (placed.every((m) => Math.hypot(m.x - x, m.y - y) >= min)) return { x, y };
  }

  throw new Error(
    'districts: could not place a mark for "' + district.name + '" at least ' + min +
      ' units clear of the ' + placed.length + ' already down, after ' + MAX_TRIES +
      ' attempts (the search box had grown to ×' + last.grow.toFixed(2) + '). ' +
      'Either scatter.minSeparation is too large for this many records, or two authored ' +
      'centres in data/districts.json are too close to hold their clusters apart. ' +
      'Do NOT lower minSeparation without re-reading why it is 20 — the note is in that file.'
  );
}

/**
 * A cluster's label box, in user units, at the band where it is widest.
 *
 * THE ANCHOR RULE IS THE ONE ajman.js ALREADY USED — centred on the cluster's
 * mean x, dropped below its LOWEST mark — and it lives here now rather than
 * there for the reason sweepOrder lives here: the constraint and the render
 * have to be the same geometry, and a label derived twice is how a name ends
 * up cleared in the generator and drawn somewhere else.
 */
function labelBox(name, clusterMarks, label) {
  const cx = Math.round(clusterMarks.reduce((s, m) => s + m.x, 0) / clusterMarks.length);
  const cy = Math.max.apply(null, clusterMarks.map((m) => m.y));
  const y = cy + label.dropUnits;
  const width =
    label.widthUnits && label.widthUnits[name] != null
      ? label.widthUnits[name]
      : name.length * label.advanceEm * label.emUnits;
  const half = width / 2;
  return { name, x: cx, y, x0: cx - half, x1: cx + half, y0: y - label.ascUnits, y1: y + label.descUnits };
}

/** Closest approach from an axis-aligned box to a sampled path. 0 = crossing. */
function boxToPath(box, points) {
  let best = Infinity;
  for (const p of points) {
    const dx = Math.max(box.x0 - p[0], 0, p[0] - box.x1);
    const dy = Math.max(box.y0 - p[1], 0, p[1] - box.y1);
    const d = Math.hypot(dx, dy);
    if (d < best) best = d;
  }
  return best;
}

/* A whole cluster is re-drawn when its LABEL fouls the water, not just the
   offending mark: the label hangs off the cluster's mean and its lowest mark,
   so moving one dot moves the name by a fraction of one dot's travel. Redraws
   are per-attempt and consume the seeded stream, so the output stays
   byte-stable and a diff still means the data moved. */
const CLUSTER_TRIES = 400;

function buildDistrictMarks() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const geo = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'districts.json'), 'utf8'));

  const counts = new Map(geo.districts.map((d) => [d.name, []]));
  const plainAjman = [];
  const outside = [];

  db.projects.forEach((project) => {
    const { district, reason } = resolveDistrict(project.location, geo.districts, geo.outsideEmirate);
    if (district) counts.get(district).push(project.slug);
    else if (reason === 'outside-emirate') outside.push(project.slug);
    else plainAjman.push(project.slug);
  });

  // Marks are laid down in the authored district order, then in record order
  // inside a district, so the sequence the dots animate in is stable too.
  const rand = mulberry32(geo.scatter.seed);
  const [, , vbWidth, vbHeight] = geo.viewBox.split(/\s+/).map(Number);

  /* THE COAST IS A CONSTRAINT, NOT ONLY A BACKDROP. Marks are cleared of it
     by the same distance they are cleared of each other, and the reason is
     the one that kept a TRUE coastline off this map in the first place: a
     dot sitting ON the shoreline is a dot claiming to be AT the shoreline,
     and every one of these centres is a placeholder. It caught a real fault
     the day the separation rule landed — Al Zorah's cluster was pushed to
     7.1 units off the water, and a mark's own radius is 8.75 units at the
     narrowest band, so the dot would have crossed the line it was measured
     against. A map with no coast in its data still builds; the constraint
     is simply empty. */
  const coastPoints = geo.coast ? samplePath(geo.coast.path) : [];

  /* AND THE NAME IS CLEARED TOO, not only the dot (5 Aug). The label is not
     a second drawing to be constrained — it is the same object's other half,
     and until now the scatter governed one half of a coupled pair. The creek
     proved it in one build: cleared of the new water, Marina & Creek's mark
     moved 20 units and carried its own name into the sea. The floor and the
     box are declared in data/districts.json, measured on the rendered page. */
  const label = geo.label;
  const labelBoxes = [];
  const marks = [];

  geo.districts.forEach((d) => {
    const slugs = counts.get(d.name);
    if (!slugs.length) return;

    let cluster = null;
    for (let attempt = 0; attempt < CLUSTER_TRIES; attempt++) {
      const trial = [];
      slugs.forEach((slug) => {
        const p = placeMark(d, rand, geo.scatter, marks.concat(trial), vbWidth, vbHeight, coastPoints);
        trial.push({ district: d.name, slug, x: p.x, y: p.y });
      });
      /* No label metrics in the data means no label constraint, exactly as no
         coast in the data means no coast constraint: the drawing is an
         addition to this file, never a precondition for it. */
      if (!label) { cluster = trial; break; }
      const box = labelBox(d.name, trial, label);
      if (boxToPath(box, coastPoints) >= label.clearance) { cluster = trial; box.clearance = boxToPath(box, coastPoints); labelBoxes.push(box); break; }
    }

    if (!cluster) {
      throw new Error(
        'districts: placed every mark for "' + d.name + '" but could not get its LABEL ' +
          label.clearance + ' units clear of the shoreline in ' + CLUSTER_TRIES + ' cluster re-draws. ' +
          'The name hangs ' + label.dropUnits + ' units below the cluster and is ' +
          (label.widthUnits[d.name] != null ? label.widthUnits[d.name] + ' units wide (measured)' :
            'sized by the advanceEm fallback') + ', so the district\'s centre may simply be too close ' +
          'to the water to hold a name of that length. Move the centre in data/districts.json, or ' +
          'shorten the reach of the shoreline near it. Do NOT lower label.clearance to make this pass — ' +
          'the note in that file says what the number is for.'
      );
    }
    marks.push.apply(marks, cluster);
  });

  return {
    /* The label boxes travel with the marks they were cleared against, so
       ajman.js draws the geometry the generator actually tested rather than
       re-deriving its own and hoping the two agree. */
    labels: labelBoxes,
    viewBox: geo.viewBox,
    radius: geo.scatter.radius,
    /* The shoreline travels with the geometry it belongs to, and its LENGTH
       travels with it — the draw is a dash offset, so the stylesheet needs
       the path's own length and there is no getTotalLength() in a build. It
       is measured here rather than typed for the same reason --mark-count is
       emitted rather than typed: an edited path must re-time its own draw. */
    coast: geo.coast ? { path: geo.coast.path, length: pathLength(geo.coast.path) } : null,
    marks,
    districts: geo.districts.map((d) => ({
      name: d.name,
      centre: d.centre,
      count: counts.get(d.name).length,
      slugs: counts.get(d.name),
    })),
    unplaced: { plainAjman, outsideEmirate: outside },
    total: db.projects.length,
  };
}

/**
 * E7.3 — the spatial sweep, west to east.
 *
 * buildDistrictMarks lays marks down in AUTHORED district order, which is by
 * size: a sweep in that order animates the biggest district first and reads
 * as a ranking of places, which is the one thing E7.3 exists to prevent.
 * Sorting by x claims nothing about time or importance.
 *
 * This lives here rather than on a page because Home and /ajman both sweep,
 * and a second implementation is how two surfaces start disagreeing about
 * one map. The menu is deliberately not a caller: its constellation is
 * ornament, so its sequence carries no meaning to get wrong (09-menu §6).
 *
 * `source` is the mark's position in the authored order, kept as the final
 * tiebreak so two marks at identical coordinates still sweep deterministically.
 */
function sweepOrder(marks) {
  return marks
    .map((m, i) => Object.assign({}, m, { source: i }))
    .sort((a, b) => a.x - b.x || a.y - b.y || a.source - b.source);
}

/**
 * THE HIT REGIONS — one target per district, and that is the whole permission.
 *
 * E7 rule 3 says marks are not hit targets, and the arithmetic behind it is
 * real: forty-seven 44×44px targets do not fit 375px. **A district REGION is
 * not a mark.** There are ten of them, not forty-seven, and the smallest one
 * renders 68.7px at the narrowest of the field's four widths — so the rule's
 * own objection does not reach this construction. A mark stays a fact; the
 * region beside it is the control. Anyone reading rule 3 against this file
 * should stop here rather than assume it was worked around.
 *
 * WHY A PARTITION AND NOT A BOX PER CLUSTER. Measured before it was built:
 * padded bounding boxes around the ten clusters TOUCH at 10 units of padding
 * (Aamra/Aalia) and overlap at anything larger, and even at that padding the
 * smallest box is 30×30 units — 17.1px at the 320 width. Overlapping targets
 * make the district under the pointer a question of DOM order, which is not
 * something a reader can see. A nearest-cluster partition has neither
 * problem: the cells tile the field exactly (their areas sum to 560×440 with
 * no residual), so every point belongs to exactly one district and no point
 * belongs to none.
 *
 * THE SEED IS THE CLUSTER CENTROID, NOT THE AUTHORED CENTRE. The centroid is
 * what the reader can see — it is where the label is anchored too — and a
 * region seeded on an invisible authored point would answer for territory
 * that has no mark in it. This also means the regions move when the data
 * moves, which is the property the whole file is built on.
 *
 * 🔴 THE PARTITION CLAIMS NO TERRITORY. It is invisible and carries no fill,
 * no stroke and no label. It answers one question only — "which drawn cluster
 * is nearest the pointer" — and that is not a cartographic claim, which
 * matters because `data/districts.json`'s centres are placeholders. If those
 * centres are ever replaced with sourced points, this geometry follows them
 * automatically and nothing here needs revisiting.
 */

/**
 * Sutherland–Hodgman clip of `poly` to the half-plane nearer `si` than `sj`.
 * The bisector is the set where the two distances are equal; a point is on
 * the near side when (p − mid) · (sj − si) ≤ 0.
 */
function clipHalfPlane(poly, si, sj) {
  const mx = (si[0] + sj[0]) / 2;
  const my = (si[1] + sj[1]) / 2;
  const dx = sj[0] - si[0];
  const dy = sj[1] - si[1];
  const side = (p) => (p[0] - mx) * dx + (p[1] - my) * dy;

  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa <= 0) out.push(a);
    if (sa <= 0 !== sb <= 0) {
      const t = sa / (sa - sb);
      out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return out;
}

/**
 * One region per district that holds at least a mark, clipped to the viewBox.
 * Returns `{ name, centroid, points }` with points rounded to 0.1 of a user
 * unit — enough to keep the tiling exact at every rendered width, short
 * enough that the emitted path stays readable in the built HTML.
 */
function districtRegions(data) {
  const [, , w, h] = data.viewBox.split(/\s+/).map(Number);

  const byDistrict = new Map();
  data.marks.forEach((m) => {
    if (!byDistrict.has(m.district)) byDistrict.set(m.district, []);
    byDistrict.get(m.district).push(m);
  });

  const named = data.districts.filter((d) => byDistrict.has(d.name));
  const sites = named.map((d) => {
    const ks = byDistrict.get(d.name);
    return [
      ks.reduce((s, k) => s + k.x, 0) / ks.length,
      ks.reduce((s, k) => s + k.y, 0) / ks.length,
    ];
  });

  return named.map((d, i) => {
    let poly = [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ];
    sites.forEach((other, j) => {
      if (i !== j) poly = clipHalfPlane(poly, sites[i], other);
    });
    return {
      name: d.name,
      centroid: sites[i],
      points: poly.map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]),
    };
  });
}

/**
 * One region per MARK, clipped to the viewBox — the ≥ 1024 partition.
 *
 * The same construction and the same clipper as districtRegions, seeded on
 * each mark's own drawn position rather than on its cluster's centroid, so
 * "which building is the pointer nearest" has an exact answer and the cells
 * tile the field with no gap to fall into.
 *
 * 🔴 IT IS A DESKTOP PARTITION, AND THAT IS A MEASURED LIMIT RATHER THAN A
 * PREFERENCE. Below 1024 the band uses districtRegions instead. Measured on
 * the shipped marks, these cells' inscribed diameters at the 320px render run
 * 12.4px at worst and 39.7px at the median against a 44px minimum target —
 * 17 of 28 fail it, and 21 of the 28 marks sit in the four crowded districts
 * where a finger spans three cells. The cause is in data/districts.json's own
 * note: scatter.minSeparation is 20 units because two marks must be COUNTABLE
 * ("20 buys a 1.6px gap at the narrowest band"), and a floor chosen for
 * countability is 3.9x under a floor chosen for targeting. The district cells
 * clear 44px at every width (58.4px at worst); these cannot at any width the
 * drawing actually ships at, so the two partitions are not interchangeable
 * and the breakpoint is not a style choice.
 */
function markRegions(data) {
  const [, , w, h] = data.viewBox.split(/\s+/).map(Number);
  const sites = data.marks.map((m) => [m.x, m.y]);

  return data.marks.map((m, i) => {
    let poly = [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ];
    sites.forEach((other, j) => {
      if (i !== j) poly = clipHalfPlane(poly, sites[i], other);
    });
    return {
      slug: m.slug,
      district: m.district,
      site: sites[i],
      points: poly.map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]),
    };
  });
}

/**
 * The constellation, as the menu overlay draws it (09-menu §6).
 *
 * It is ornament and nothing else: no labels, no links, no hit areas, no
 * counts anywhere near it (E12 — the stars are never a tally). So it is
 * hidden from assistive technology outright rather than given a label that
 * would have to state a number to be useful.
 *
 * `--dot-index` carries each mark's position in the sequence; the 34ms
 * stagger is applied in CSS (09-menu §9), so the delay arithmetic lives with
 * the rest of the motion rather than baked into the markup.
 */
function renderConstellation(data, className) {
  const circles = data.marks
    .map(
      (m, i) =>
        `<circle class="menu-dot" style="--dot-index:${i}" cx="${m.x}" cy="${m.y}" r="${data.radius}"></circle>`
    )
    .join('');

  return (
    `<svg class="${className}" viewBox="${data.viewBox}" aria-hidden="true" focusable="false" ` +
    `preserveAspectRatio="xMidYMid meet">${circles}</svg>`
  );
}

module.exports = {
  buildDistrictMarks,
  renderConstellation,
  resolveDistrict,
  decodeEntities,
  sweepOrder,
  districtRegions,
  markRegions,
};
