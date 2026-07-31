'use strict';

/**
 * Minimal string-template engine — no dependency needed for this project's
 * scale (a handful of partials + one project-detail template).
 *
 * Supported syntax:
 *   {{key}}                 simple substitution (supports dotted paths: {{a.b}})
 *   {{#if key}}...{{/if}}   renders inner block only if data[key] is truthy
 *   {{#each key}}...{{/each}}
 *       loops data[key] (array). Inside the block, {{this}} is the item
 *       itself (for string arrays) and {{field}} resolves against the
 *       item first, falling back to the outer data object.
 */

function getPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
}

function render(template, data) {
  let out = template;

  out = out.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (_m, key, inner) => {
    const arr = data[key];
    if (!Array.isArray(arr)) return '';
    return arr
      .map((item) => {
        const itemData =
          item && typeof item === 'object' ? Object.assign({}, data, item) : Object.assign({}, data, { this: item });
        return render(inner, itemData);
      })
      .join('');
  });

  out = out.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_m, key, inner) => (data[key] ? render(inner, data) : ''));

  out = out.replace(/{{([\w.]+)}}/g, (_m, path) => {
    const val = getPath(data, path);
    return val === undefined || val === null ? '' : String(val);
  });

  return out;
}

module.exports = { render, getPath };
