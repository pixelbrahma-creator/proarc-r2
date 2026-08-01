'use strict';

/**
 * Which image leads a record, and which of its images ship.
 *
 * The image pipeline derives `hero.webp` from the FIRST source file in
 * natural filename order, and `gallery-01.webp` from that same file. So on
 * every one of the 47 records the hero and the first gallery slot are the
 * same photograph — identical bytes on 41 of them, and only a different
 * derivative width (2400 against 2000) on the six whose sources are 8K.
 *
 * Nothing ever curated that first file. `azha-park-residences` therefore led
 * a twenty-image set with a furnished living room, because `1BR.webp` sorts
 * before `v1.webp`. D1 replaces the accident with a decision:
 *
 *   images.hero      names the gallery slot that leads the record.
 *                    Absent = "gallery-01", which is what 41 records want.
 *   images.gallery   names, in order, the slots that ship beneath it.
 *                    Absent = every slot except the hero's — the "hero
 *                    de-duplicated out of the gallery" rule (04-project §6).
 *
 * The selection is data, not code, so the record is reviewable by someone
 * who does not read JavaScript, and a re-run of the image pipeline honours
 * it instead of silently reverting to filename order.
 */

const GALLERY_SLOT = /^gallery-(\d+)$/;

/**
 * A SLOT NAME IS RESOLVED BY NAME, NEVER BY POSITION.
 *
 * The first version of this file read "gallery-07" as `Number(7) - 1` and
 * used it as an index into whatever list the caller happened to hold. That
 * is correct only while the slots are numbered contiguously from 01 — which
 * every one of the forty-seven records is, today, which is exactly why the
 * fault has never fired.
 *
 * Take one derivative out of a record — a frame that turned out to be
 * another building's, a duplicate, anything — and every curated name after
 * the hole quietly moves onto the next photograph. `images.gallery:
 * ["gallery-05"]` would still resolve, still render, and still be a
 * different picture than the one somebody chose. Nothing throws, no link
 * breaks, no probe fails: the page simply shows the wrong building, and
 * the record still says gallery-05.
 *
 * That is what "deleting a derivative silently re-points a curation" means,
 * and the fix is not to keep the numbering tidy — it is to stop the number
 * being an index at all. A name now means the slot of that name; a name
 * with no slot behind it is an error, loudly.
 */
function resolve(slug, name, slots, where) {
  if (!GALLERY_SLOT.test(name)) {
    throw new Error(`${slug}: images entries name a gallery slot ("gallery-07"); got "${name}".`);
  }
  const i = slots.indexOf(name);
  if (i === -1) {
    throw new Error(
      `${slug}: images.${where} names ${name}, which the record does not hold. ` +
        `It holds ${slots.length ? slots.join(', ') : 'nothing'}. ` +
        `A curation names a photograph, so a missing one stops the build rather than sliding onto its neighbour.`
    );
  }
  return i;
}

/** The slot names a record holds, in order, from its files or its sources. */
function slotNames(paths) {
  return paths.map((p) => String(p).replace(/^.*\//, '').replace(/\.webp$/, ''));
}

/** 0-based index of the gallery slot that leads the record. */
function heroIndex(project, slots) {
  const name = (project.images && project.images.hero) || 'gallery-01';
  return resolve(project.slug, name, slots, 'hero');
}

/**
 * 0-based indices of the gallery slots that ship, in order, hero excluded.
 * `slots` is the list of slot names the record actually holds.
 */
function galleryIndices(project, slots) {
  if (!Array.isArray(slots)) {
    throw new Error(
      `${project.slug}: galleryIndices takes the list of slot NAMES the record holds, not a count. ` +
        `A count is what let a positional index outlive the numbering it assumed.`
    );
  }
  const hero = heroIndex(project, slots);

  const explicit = project.images && project.images.gallery;
  if (!explicit) {
    return slots.map((_, i) => i).filter((i) => i !== hero);
  }

  return explicit.map((name) => {
    const i = resolve(project.slug, name, slots, 'gallery');
    if (i === hero) {
      throw new Error(
        `${project.slug}: ${name} is the hero and is listed in images.gallery — that is the duplicate the rule exists to remove.`
      );
    }
    return i;
  });
}

module.exports = { heroIndex, galleryIndices, slotNames };
