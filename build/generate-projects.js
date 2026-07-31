'use strict';

/**
 * Renders projects/<slug>.html for every entry in data/projects.json,
 * merged with images/manifest.json (written by process-images.js).
 * Never hand-edit files under projects/ — edit projects.json (content)
 * or re-run process-images.js (images), then re-run this script.
 *
 * Usage: node build/generate-projects.js
 */

const fs = require('fs');
const path = require('path');
const { render } = require('./lib/render');
const { renderShell, loadPartial } = require('./lib/partials');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'projects');

function buildSpecs(project) {
  const specs = [];
  const push = (label, value) => { if (value) specs.push({ label, value }); };
  push('Client', project.client);
  push('Location', project.location);
  push('Sector', project.category);
  push('Built-up Area', project.builtUpArea);
  push('Configuration', project.configuration);
  push('Status', project.status);
  push('Completion / Year', project.year);
  return specs;
}

function pickRelated(project, allProjects) {
  const sameCategory = allProjects.filter((p) => p.slug !== project.slug && p.category === project.category);
  if (sameCategory.length >= 3) return sameCategory.slice(0, 3);
  const fillers = allProjects.filter((p) => p.slug !== project.slug && p.category !== project.category);
  return sameCategory.concat(fillers).slice(0, 3);
}

function toCard(project, manifest) {
  const images = manifest.projects[project.slug] || {};
  return { slug: project.slug, title: project.title, category: project.category, location: project.location, thumb: images.thumb || '' };
}

function main() {
  const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'images', 'manifest.json'), 'utf8'));
  const template = loadPartial('project-detail.template');

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const projects = db.projects;
  let written = 0;
  const warnings = [];

  projects.forEach((project, i) => {
    const images = manifest.projects[project.slug];
    if (!images) {
      warnings.push(`${project.slug}: no images in manifest — skipped`);
      return;
    }

    const related = pickRelated(project, projects).map((p) => toCard(p, manifest));
    const prev = i > 0 ? projects[i - 1] : projects[projects.length - 1];
    const next = i < projects.length - 1 ? projects[i + 1] : projects[0];
    const prevThumb = (manifest.projects[prev.slug] || {}).thumb || '';
    const nextThumb = (manifest.projects[next.slug] || {}).thumb || '';

    const pageData = {
      title: `${project.title} — Proarc | Architecture & Engineering, UAE`,
      description: project.summary || project.description[0],
      canonical: `https://proarc.ae/projects/${project.slug}.html`,
      ogImage: images.heroMd || images.hero,
      activePage: 'projects',
      pageStylesheet: 'project-detail',
      assetPrefix: '../',
    };

    const shell = renderShell(pageData);

    const viewData = Object.assign({}, pageData, {
      title: project.title,
      category: project.category,
      location: project.location,
      hero: images.hero,
      heroMd: images.heroMd,
      specs: buildSpecs(project),
      descriptionParagraphs: project.description,
      galleryItems: images.gallery || [],
      hasGallery: (images.gallery || []).length > 0,
      relatedProjects: related,
      hasRelated: related.length > 0,
      prevProject: { slug: prev.slug, title: prev.title, category: prev.category, thumb: prevThumb },
      nextProject: { slug: next.slug, title: next.title, category: next.category, thumb: nextThumb },
    });

    let page = render(template, viewData);
    page = page
      .replace('<!-- @include head -->', shell.head)
      .replace('<!-- @include header -->', shell.header)
      .replace('<!-- @include footer -->', shell.footer)
      .replace('<!-- @include scripts -->', shell.scripts);

    const leftover = page.match(/{{[^}]+}}/g);
    if (leftover) warnings.push(`${project.slug}: unresolved tokens: ${leftover.join(', ')}`);

    fs.writeFileSync(path.join(OUT_DIR, `${project.slug}.html`), page, 'utf8');
    written++;
  });

  console.log(`Generated ${written}/${projects.length} project page(s).`);
  if (warnings.length) console.warn(warnings.map((w) => '  ! ' + w).join('\n'));
}

main();
