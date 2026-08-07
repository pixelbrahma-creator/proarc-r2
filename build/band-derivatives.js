'use strict';

/**
 * `band.webp` — the index band's own derivative.
 *
 * The Work surfaces' band (03-work §4.1.4) renders every record in a room as
 * a photograph. At the sizes the band actually uses — tiles run roughly 200
 * to 680 CSS px — the existing derivatives are the wrong tools: `hero-md` is
 * 1600w and the forty-six of them total **6.79 MB**, against the 1.15 MB the
 * whole arrival weighed before. `thumb` is small enough at 800×600, but it is
 * a 4:3 machine crop (`fit: cover`, `position: attention`) and the band's
 * whole premise is that NOTHING is cropped — the irregularity is the
 * buildings' own proportions. A cropped thumbnail in a justified row is a
 * lie about the building's shape, and it would also make the row arithmetic
 * wrong, since the row's height comes from the aspect ratios in it.
 *
 * So this writes one more derivative: the same frame as the hero, uncropped,
 * at 800w. Measured, that is ~2.1 MB for the set — a third of `hero-md` — and
 * `hero-md` stays in the srcset above it, so a wide tile on a retina screen
 * still has a large candidate to reach for.
 *
 * 🔴 THIS READS THE COMMITTED OUTPUTS, NOT THE RAW SOURCES, AND THAT IS THE
 * WHOLE REASON IT CAN EXIST. `build:images` reads originals that are not in
 * this repository and therefore does nothing on a clone; this reads
 * `images/projects/<slug>/hero-md.webp`, which is tracked, so it runs
 * anywhere the repo is. It is a downscale of an already-lossy file, which is
 * acceptable in exactly this direction: resampling down averages the earlier
 * encoder's artefacts away rather than reproducing them. The reverse — a
 * lossless re-encode, or an upscale — is not, and is why the logo trim work
 * had its own rule.
 *
 * It is NOT part of `npm run build`. The output is committed like every other
 * derivative, so this runs when a record's photography changes, not on every
 * page build. If `band.webp` is absent the manifest simply omits it and the
 * markup falls back to `hero-md` — smaller pages are an optimisation, not a
 * correctness condition.
 *
 *   node build/band-derivatives.js          write any that are missing
 *   node build/band-derivatives.js --force  rewrite all
 *   node build/band-derivatives.js --check  report only, write nothing
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PROJECTS = path.join(ROOT, 'images', 'projects');

/* The two invented values, named as E3.3 requires an invented value to be.
   800 is the widest tile the band renders at a 1120 container (677px) rounded
   up to a round number; 80 is sharp's own default for webp and the quality the
   rest of the pipeline uses for photographs. */
const WIDTH = 800;
const QUALITY = 80;

async function main() {
  const force = process.argv.includes('--force');
  const checkOnly = process.argv.includes('--check');

  if (!fs.existsSync(PROJECTS)) {
    console.error(`No ${path.relative(ROOT, PROJECTS)} — nothing to do.`);
    process.exit(1);
  }

  const slugs = fs
    .readdirSync(PROJECTS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let written = 0;
  let skipped = 0;
  let bytes = 0;
  let sourceBytes = 0;
  const missing = [];

  for (const slug of slugs) {
    const dir = path.join(PROJECTS, slug);
    const out = path.join(dir, 'band.webp');

    /* hero-md before hero: it is already the smaller of the two and carries
       the identical frame, so the downscale starts from fewer generations of
       loss than the 1920w original would give. */
    const src = ['hero-md.webp', 'hero.webp'].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
    if (!src) {
      missing.push(slug);
      continue;
    }

    if (fs.existsSync(out) && !force) {
      skipped++;
      bytes += fs.statSync(out).size;
      sourceBytes += fs.statSync(src).size;
      continue;
    }
    if (checkOnly) {
      missing.push(slug);
      continue;
    }

    const meta = await sharp(src).metadata();
    /* 🔴 NEVER UPSCALE. `withoutEnlargement` keeps a source narrower than 800
       at its own width rather than inventing pixels — the band would rather
       serve a small true image than a large soft one, and the srcset's `w`
       descriptor is written from the file that results, not from the ask. */
    const buf = await sharp(src)
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    fs.writeFileSync(out, buf);
    written++;
    bytes += buf.length;
    sourceBytes += fs.statSync(src).size;
    if (meta.width < WIDTH) console.log(`  ${slug}: source is ${meta.width}w — kept, not enlarged`);
  }

  const mb = (b) => (b / 1024 / 1024).toFixed(2) + ' MB';
  console.log('');
  console.log(`Records:        ${slugs.length}`);
  console.log(`band.webp:      ${written} written, ${skipped} already present`);
  console.log(`Band total:     ${mb(bytes)}   (source hero-md total ${mb(sourceBytes)})`);
  if (missing.length) {
    console.log(`No hero on disk: ${missing.length} — ${missing.join(', ')}`);
    if (checkOnly) process.exit(1);
  }
}

main().catch((e) => {
  console.error('BAND DERIVATIVES FAILED:', e.message);
  process.exit(1);
});
