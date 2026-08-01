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

function slotIndex(slug, name) {
  const m = GALLERY_SLOT.exec(name);
  if (!m) {
    throw new Error(
      `${slug}: images entries name a gallery slot ("gallery-07"); got "${name}".`
    );
  }
  return Number(m[1]) - 1;
}

/** 0-based index of the gallery slot that leads the record. */
function heroIndex(project) {
  const name = (project.images && project.images.hero) || 'gallery-01';
  return slotIndex(project.slug, name);
}

/**
 * 0-based indices of the gallery slots that ship, in order, hero excluded.
 * `count` is how many slots exist on disk / in sources.
 */
function galleryIndices(project, count) {
  const hero = heroIndex(project);
  if (hero < 0 || hero >= count) {
    throw new Error(
      `${project.slug}: images.hero points at slot ${hero + 1} but the record holds ${count} image(s).`
    );
  }

  const explicit = project.images && project.images.gallery;
  if (!explicit) {
    return Array.from({ length: count }, (_, i) => i).filter((i) => i !== hero);
  }

  return explicit.map((name) => {
    const i = slotIndex(project.slug, name);
    if (i < 0 || i >= count) {
      throw new Error(`${project.slug}: images.gallery names ${name}, which the record does not hold.`);
    }
    if (i === hero) {
      throw new Error(
        `${project.slug}: ${name} is the hero and is listed in images.gallery — that is the duplicate the rule exists to remove.`
      );
    }
    return i;
  });
}

module.exports = { heroIndex, galleryIndices };
