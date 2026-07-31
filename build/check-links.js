'use strict';

/**
 * QA sweep (not part of the build pipeline): scans every generated HTML
 * page for local <a href>/<img src>/<link href>/<script src> references
 * and verifies the target file actually exists on disk. Ignores external
 * (http/https/mailto/tel) and in-page (#) links.
 *
 * Usage: node build/check-links.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function findHtmlFiles() {
  const files = [];
  ['.', 'projects'].forEach((dir) => {
    const full = path.join(ROOT, dir);
    fs.readdirSync(full).forEach((f) => {
      if (f.endsWith('.html')) files.push(path.join(full, f));
    });
  });
  return files;
}

function extractRefs(html) {
  const refs = [];
  const patterns = [/href="([^"]+)"/g, /src="([^"]+)"/g];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(html))) refs.push(m[1]);
  });
  return refs;
}

function isSkippable(ref) {
  return (
    !ref ||
    ref.startsWith('http://') ||
    ref.startsWith('https://') ||
    ref.startsWith('mailto:') ||
    ref.startsWith('tel:') ||
    ref.startsWith('#') ||
    ref.startsWith('data:')
  );
}

function main() {
  const files = findHtmlFiles();
  let totalRefs = 0;
  let broken = 0;

  files.forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const fileDir = path.dirname(file);
    const refs = extractRefs(html);

    refs.forEach((ref) => {
      if (isSkippable(ref)) return;
      totalRefs++;
      const cleanRef = ref.split('#')[0].split('?')[0];
      const resolved = path.resolve(fileDir, cleanRef);
      if (!fs.existsSync(resolved)) {
        broken++;
        console.log(`  ✗ ${path.relative(ROOT, file)}  ->  ${ref}`);
      }
    });
  });

  console.log(`\nChecked ${files.length} pages, ${totalRefs} local references, ${broken} broken.`);
  process.exit(broken > 0 ? 1 : 0);
}

main();
