'use strict';

/**
 * Rebuild images/manifest.json from the COMMITTED derivatives, without the
 * original sources.
 *
 * Why this exists: `images/manifest.json` is gitignored and the raw sources
 * (images/_raw/, the legacy site's images/folio/) live only on the machine that
 * first processed them. A fresh clone therefore has all 370 derivative .webp
 * files but no manifest — and `npm run build:pages` does NOT fail in that state,
 * it silently emits an empty project-data island. This script reconstructs the
 * manifest by reading what is actually on disk, so a clone can build.
 *
 * It is a READER, never a writer of images: it does not resize, convert or
 * touch anything under images/. Where sources are available, the real pipeline
 * (build/process-images.js) remains authoritative and its output is identical
 * in shape.
 *
 * Usage: node build/manifest-from-outputs.js [--check]
 *   --check  compare against the existing manifest and report differences;
 *            exit 1 if they differ. Writes nothing.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT, 'images', 'projects');
const LOGOS_DIR = path.join(ROOT, 'images', 'logos');
const MANIFEST_PATH = path.join(ROOT, 'images', 'manifest.json');
const DATA_PATH = path.join(ROOT, 'data', 'projects.json');

const { galleryIndices } = require('./lib/images');

const GALLERY_RE = /^gallery-(\d+)\.webp$/;

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function buildProjectEntry(project) {
  const slug = project.slug;
  const dir = path.join(PROJECTS_DIR, slug);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir);
  const onDisk = files
    .filter((f) => GALLERY_RE.test(f))
    .sort(naturalSort)
    .map((f) => `images/projects/${slug}/${f}`);

  // The manifest carries what SHIPS, not what is on disk: the hero is
  // de-duplicated out of the gallery, and a record may curate its set down
  // (build/lib/images.js). Dropped files stay on disk — a curation call is
  // reversible, a deleted derivative is not.
  const gallery = galleryIndices(project, onDisk.length).map((i) => onDisk[i]);

  const has = (f) => files.includes(f);
  const entry = {
    hero: has('hero.webp') ? `images/projects/${slug}/hero.webp` : '',
    heroMd: has('hero-md.webp') ? `images/projects/${slug}/hero-md.webp` : '',
    thumb: has('thumb.webp') ? `images/projects/${slug}/thumb.webp` : '',
    gallery,
  };

  // A record with no usable image is worse than absent: generate-projects.js
  // skips slugs that are missing from the manifest, but a slug present with an
  // empty hero renders a broken page. Treat it as missing.
  if (!entry.hero && !onDisk.length) return null;
  return entry;
}

function buildLogos() {
  if (!fs.existsSync(LOGOS_DIR)) return {};
  return fs
    .readdirSync(LOGOS_DIR)
    .filter((f) => f.endsWith('.webp'))
    .sort(naturalSort)
    .reduce((acc, f) => {
      acc[f.replace(/\.webp$/, '')] = `images/logos/${f}`;
      return acc;
    }, {});
}

function main() {
  const check = process.argv.includes('--check');
  const db = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const manifest = {
    generatedFrom: 'build/manifest-from-outputs.js',
    projects: {},
    logos: buildLogos(),
  };

  const missing = [];
  const partial = [];

  // Iterate the DATA, not the directory, so the manifest's key order matches
  // the pipeline's and an orphan image directory can never invent a project.
  for (const project of db.projects) {
    const entry = buildProjectEntry(project);
    if (!entry) {
      missing.push(project.slug);
      continue;
    }
    if (!entry.hero || !entry.thumb || !entry.heroMd) partial.push(project.slug);
    manifest.projects[project.slug] = entry;
  }

  const orphans = fs.existsSync(PROJECTS_DIR)
    ? fs
        .readdirSync(PROJECTS_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !db.projects.some((p) => p.slug === e.name))
        .map((e) => e.name)
    : [];

  const count = Object.keys(manifest.projects).length;
  const galleryTotal = Object.values(manifest.projects).reduce((s, e) => s + e.gallery.length, 0);

  console.log(`Projects in data:        ${db.projects.length}`);
  console.log(`Projects with images:    ${count}`);
  console.log(`Gallery images:          ${galleryTotal}`);
  console.log(`Logos:                   ${Object.keys(manifest.logos).length}`);
  if (missing.length) console.warn(`! No images on disk for:  ${missing.join(', ')}`);
  if (partial.length) console.warn(`! Incomplete image set:   ${partial.join(', ')}`);
  if (orphans.length) console.warn(`! Image dirs with no record: ${orphans.join(', ')}`);

  const serialised = JSON.stringify(manifest, null, 2) + '\n';

  if (check) {
    if (!fs.existsSync(MANIFEST_PATH)) {
      console.error('\n--check: no manifest on disk to compare against.');
      process.exit(1);
    }
    const current = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const a = JSON.parse(current);
    const b = JSON.parse(serialised);
    const slugsA = Object.keys(a.projects || {});
    const slugsB = Object.keys(b.projects || {});
    const onlyA = slugsA.filter((s) => !slugsB.includes(s));
    const onlyB = slugsB.filter((s) => !slugsA.includes(s));
    const changed = slugsB.filter(
      (s) => slugsA.includes(s) && JSON.stringify(a.projects[s]) !== JSON.stringify(b.projects[s])
    );
    if (!onlyA.length && !onlyB.length && !changed.length) {
      console.log('\n--check: manifest matches what is on disk.');
      return;
    }
    if (onlyA.length) console.error(`--check: in manifest, not on disk: ${onlyA.join(', ')}`);
    if (onlyB.length) console.error(`--check: on disk, not in manifest: ${onlyB.join(', ')}`);
    if (changed.length) console.error(`--check: entries differ: ${changed.join(', ')}`);
    process.exit(1);
  }

  fs.writeFileSync(MANIFEST_PATH, serialised, 'utf8');
  console.log(`\nManifest written to images/manifest.json`);
}

main();
