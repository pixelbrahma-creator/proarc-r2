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

/**
 * Blocks resolve INNERMOST FIRST.
 *
 * A single non-greedy pass closes an outer block on the first `{{/if}}` it
 * meets, which is the inner block's — so `{{#if a}}…{{#if b}}…{{/if}}…{{/if}}`
 * left three stray tags in the output and rendered the wrong branch. The
 * pattern below refuses to match a block whose body contains another opener,
 * so only the innermost resolves; repeating until nothing changes then works
 * outwards. Cheap, and it means the templates can nest.
 */
function resolveBlocks(text, tag, replace) {
  const inner = new RegExp(`{{#${tag} (\\w+)}}((?:(?!{{#${tag} )[\\s\\S])*?){{\\/${tag}}}`);
  let out = text;
  // Bounded rather than while(true): a malformed template should fail
  // visibly, not spin.
  for (let depth = 0; depth < 32; depth++) {
    const next = out.replace(inner, (_m, key, body) => replace(key, body));
    if (next === out) return out;
    out = next;
  }
  throw new Error(`render: {{#${tag}}} nesting deeper than 32 — the template is almost certainly missing a {{/${tag}}}.`);
}

function render(template, data) {
  let out = template;

  out = resolveBlocks(out, 'each', (key, body) => {
    const arr = data[key];
    if (!Array.isArray(arr)) return '';
    return arr
      .map((item) => {
        const itemData =
          item && typeof item === 'object' ? Object.assign({}, data, item) : Object.assign({}, data, { this: item });
        return render(body, itemData);
      })
      .join('');
  });

  out = resolveBlocks(out, 'if', (key, body) => (data[key] ? render(body, data) : ''));

  out = out.replace(/{{([\w.]+)}}/g, (_m, path) => {
    const val = getPath(data, path);
    return val === undefined || val === null ? '' : String(val);
  });

  return out;
}

module.exports = { render, getPath };
