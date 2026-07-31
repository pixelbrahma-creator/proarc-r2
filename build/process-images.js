'use strict';

/**
 * Image pipeline — resizes + converts every project/logo image to .webp
 * using sharp (bundles libvips, no external tools needed). Reads from:
 *   - the ORIGINAL site's images/folio/{projects,thumbs}/ for legacy
 *     projects (matched by legacySlug prefix), never mutating it
 *   - images/_raw/<slug>/ for the 6 new projects (staged from the zip/docx)
 *   - images/_raw/_logos/ for client logos
 * Writes into images/projects/<slug>/*.webp, images/logos/*.webp, and
 * emits images/manifest.json (slug -> {hero, thumb, gallery[]}) which
 * generate-projects.js and the projects grid both read at build time.
 *
 * Idempotent: skips a file if its output is newer than its source, so
 * re-runs after adding one new image are cheap. Concurrency is capped
 * (many sources are 8-47MB 8K renders — unbounded parallelism thrashes
 * memory).
 *
 * Usage: node build/process-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SITE_ROOT = path.join(ROOT, '..');
const LEGACY_PROJECTS_DIR = path.join(SITE_ROOT, 'images', 'folio', 'projects');
const LEGACY_THUMBS_DIR = path.join(SITE_ROOT, 'images', 'folio', 'thumbs');
const RAW_DIR = path.join(ROOT, 'images', '_raw');
const OUT_PROJECTS_DIR = path.join(ROOT, 'images', 'projects');
const OUT_LOGOS_DIR = path.join(ROOT, 'images', 'logos');
const MANIFEST_PATH = path.join(ROOT, 'images', 'manifest.json');

const IMAGE_EXT = /\.(jpe?g|png|webp|tiff?)$/i;
const CONCURRENCY = 3;

const ROLES = {
  hero: { width: 2400, quality: 80 },
  heroMd: { width: 1600, quality: 80 },
  gallery: { width: 2000, quality: 80 },
  thumb: { width: 800, height: 600, quality: 78, cover: true },
  logo: { width: 400, quality: 90, keyOutWhite: true },
};

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function listLegacySourceFiles(legacySlug) {
  const files = [];
  if (fs.existsSync(LEGACY_PROJECTS_DIR)) {
    fs.readdirSync(LEGACY_PROJECTS_DIR).forEach((f) => {
      if (IMAGE_EXT.test(f) && f.toLowerCase().startsWith(legacySlug.toLowerCase())) {
        // guard against accidental prefix collisions between similarly-named slugs
        const rest = f.slice(legacySlug.length);
        if (/^[0-9._-]/i.test(rest) || IMAGE_EXT.test(rest)) {
          files.push(path.join(LEGACY_PROJECTS_DIR, f));
        }
      }
    });
  }
  if (fs.existsSync(LEGACY_THUMBS_DIR)) {
    fs.readdirSync(LEGACY_THUMBS_DIR).forEach((f) => {
      const base = f.replace(IMAGE_EXT, '');
      if (base.toLowerCase() === legacySlug.toLowerCase()) {
        files.push(path.join(LEGACY_THUMBS_DIR, f));
      }
    });
  }
  files.sort((a, b) => naturalSort(path.basename(a), path.basename(b)));
  return files;
}

function listRawSourceFiles(slug) {
  const dir = path.join(RAW_DIR, slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort(naturalSort)
    .map((f) => path.join(dir, f));
}

/**
 * The client logos were cropped out of a PDF with an opaque white matte
 * (not real transparency, despite the source PNGs carrying an alpha
 * channel — every pixel's alpha is 255). Sharp correctly drops a
 * constant-255 alpha channel as a lossless optimization, which would
 * otherwise leave every logo sitting in a visible white box on the
 * site's off-white background. This keys white back out to transparent,
 * feathered at the edges to avoid a jagged cutout.
 */
async function whiteToTransparent(sharpInstance) {
  const img = sharpInstance.ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const whiteness = Math.min(data[i], data[i + 1], data[i + 2]);
    let alphaMul;
    if (whiteness >= 250) alphaMul = 0;
    else if (whiteness <= 225) alphaMul = 1;
    else alphaMul = 1 - (whiteness - 225) / (250 - 225);
    data[i + 3] = Math.round(data[i + 3] * alphaMul);
  }
  return sharp(data, { raw: { width, height, channels } });
}

function needsRebuild(srcPath, outPath) {
  if (!fs.existsSync(outPath)) return true;
  return fs.statSync(srcPath).mtimeMs > fs.statSync(outPath).mtimeMs;
}

async function convert(srcPath, outPath, role) {
  if (!needsRebuild(srcPath, outPath)) return { skipped: true, outPath };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  let pipeline = sharp(srcPath, { limitInputPixels: 300000000 }).rotate();

  if (role.cover) {
    pipeline = pipeline.resize(role.width, role.height, { fit: 'cover', position: 'attention' });
  } else {
    pipeline = pipeline.resize({ width: role.width, withoutEnlargement: true });
  }

  if (role.keyOutWhite) {
    pipeline = await whiteToTransparent(pipeline);
  }

  pipeline = pipeline.webp({ quality: role.quality, nearLossless: !!role.nearLossless, effort: 4 });

  await pipeline.toFile(outPath);
  const { size } = fs.statSync(outPath);
  return { skipped: false, outPath, bytes: size };
}

async function runWithConcurrency(tasks, limit) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

async function processProject(project, manifest, stats) {
  const sources = project.legacySlug
    ? listLegacySourceFiles(project.imagePrefix || project.legacySlug)
    : listRawSourceFiles(project.slug);

  if (!sources.length) {
    stats.missing.push(project.slug);
    return;
  }

  const outDir = path.join(OUT_PROJECTS_DIR, project.slug);
  const galleryOut = [];

  const tasks = sources.map((src, i) => async () => {
    const n = String(i + 1).padStart(2, '0');
    const outPath = path.join(outDir, `gallery-${n}.webp`);
    const result = await convert(src, outPath, ROLES.gallery);
    galleryOut.push({ n, rel: `images/projects/${project.slug}/gallery-${n}.webp`, result });
  });
  await runWithConcurrency(tasks, CONCURRENCY);
  galleryOut.sort((a, b) => naturalSort(a.n, b.n));

  const heroSrc = sources[0];
  const heroOut = path.join(outDir, 'hero.webp');
  const heroMdOut = path.join(outDir, 'hero-md.webp');
  const thumbOut = path.join(outDir, 'thumb.webp');

  const heroResult = await convert(heroSrc, heroOut, ROLES.hero);
  await convert(heroSrc, heroMdOut, ROLES.heroMd);
  const thumbResult = await convert(heroSrc, thumbOut, ROLES.thumb);

  manifest.projects[project.slug] = {
    hero: `images/projects/${project.slug}/hero.webp`,
    heroMd: `images/projects/${project.slug}/hero-md.webp`,
    thumb: `images/projects/${project.slug}/thumb.webp`,
    gallery: galleryOut.map((g) => g.rel),
  };

  stats.processed++;
  stats.bytesOut += (heroResult.bytes || 0) + (thumbResult.bytes || 0) + galleryOut.reduce((s, g) => s + (g.result.bytes || 0), 0);
}

async function processLogos(manifest, stats) {
  const logoDir = path.join(RAW_DIR, '_logos');
  if (!fs.existsSync(logoDir)) return;

  const files = fs.readdirSync(logoDir).filter((f) => IMAGE_EXT.test(f));
  const tasks = files.map((f) => async () => {
    const src = path.join(logoDir, f);
    const name = f.replace(IMAGE_EXT, '');
    const outPath = path.join(OUT_LOGOS_DIR, `${name}.webp`);
    const result = await convert(src, outPath, ROLES.logo);
    manifest.logos[name] = `images/logos/${name}.webp`;
    if (!result.skipped) stats.bytesOut += result.bytes || 0;
  });
  await runWithConcurrency(tasks, CONCURRENCY);
  stats.logosProcessed = files.length;
}

async function main() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const manifest = { generatedFrom: 'build/process-images.js', projects: {}, logos: {} };
  const stats = { processed: 0, missing: [], bytesOut: 0, logosProcessed: 0 };

  console.log(`Processing images for ${db.projects.length} projects...`);
  for (const project of db.projects) {
    await processProject(project, manifest, stats);
    process.stdout.write(`  ${stats.processed}/${db.projects.length}\r`);
  }
  console.log(`\nProcessed ${stats.processed} project(s).`);
  if (stats.missing.length) {
    console.warn(`! No source images found for: ${stats.missing.join(', ')}`);
  }

  console.log('Processing client logos...');
  await processLogos(manifest, stats);
  console.log(`Processed ${stats.logosProcessed} logo(s).`);

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`\nTotal output size: ${(stats.bytesOut / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Manifest written to images/manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
