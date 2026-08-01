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

/**
 * {{#each}} resolves OUTERMOST first, by a balanced scan — the opposite of
 * {{#if}}. An each rebinds scope: resolving an inner each first would
 * evaluate it against the OUTER data (where its key is usually undefined)
 * and silently delete it, which is exactly how the arrival's rooms rendered
 * empty. Outermost-first hands the whole body to the item render, and the
 * recursion resolves the inner blocks in their own scope.
 */
function resolveEachOutermost(text, replace) {
  const OPEN = '{{#each ';
  const CLOSE = '{{/each}}';
  let out = '';
  let rest = text;
  for (;;) {
    const start = rest.indexOf(OPEN);
    if (start === -1) return out + rest;
    const keyEnd = rest.indexOf('}}', start);
    if (keyEnd === -1) throw new Error('render: malformed {{#each}} opener');
    const key = rest.slice(start + OPEN.length, keyEnd);
    let depth = 1;
    let i = keyEnd + 2;
    while (depth > 0) {
      const nextOpen = rest.indexOf(OPEN, i);
      const nextClose = rest.indexOf(CLOSE, i);
      if (nextClose === -1) throw new Error(`render: {{#each ${key}}} has no matching {{/each}}`);
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        i = nextOpen + OPEN.length;
      } else {
        depth--;
        i = nextClose + CLOSE.length;
      }
    }
    const body = rest.slice(keyEnd + 2, i - CLOSE.length);
    out += rest.slice(0, start) + replace(key, body);
    rest = rest.slice(i);
  }
}

function render(template, data) {
  let out = template;

  out = resolveEachOutermost(out, (key, body) => {
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
