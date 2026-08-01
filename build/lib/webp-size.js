'use strict';

/**
 * Intrinsic dimensions of a .webp, read from its header.
 *
 * The project page shows every photograph at its OWN aspect ratio (E3.6),
 * so the layout is driven by the file rather than by a CSS ratio — which
 * means the markup has to carry width/height or forty-seven pages reflow as
 * their hero decodes.
 *
 * This reads 30 bytes rather than pulling sharp into the page build: sharp
 * is a devDependency behind an optional native binary, and a page build that
 * cannot run without it is a page build that breaks on someone else's
 * machine. Three container shapes exist and all three are handled:
 *
 *   VP8   lossy      — 14-byte frame header, 14-bit dimensions
 *   VP8L  lossless   — 5-byte header, 14-bit dimensions packed across bytes
 *   VP8X  extended   — 24-bit canvas size, minus one
 *
 * Returns { width, height }, or null if the file is not a webp we can read —
 * never a guess, because a wrong dimension is worse than an absent one.
 */

const fs = require('fs');

function webpSize(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(32);
    const read = fs.readSync(fd, buf, 0, 32, 0);
    if (read < 30) return null;
    if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;

    const chunk = buf.toString('ascii', 12, 16);

    if (chunk === 'VP8 ') {
      // 12..16 tag, 16..20 size, 20..23 start code, then 16-bit w/h with the
      // top two bits as a scaling field.
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    }

    if (chunk === 'VP8L') {
      // 21..25 hold 14 bits of width-1 then 14 bits of height-1.
      const b = buf.readUInt32LE(21);
      return {
        width: (b & 0x3fff) + 1,
        height: ((b >> 14) & 0x3fff) + 1,
      };
    }

    if (chunk === 'VP8X') {
      return {
        width: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1,
        height: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1,
      };
    }

    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

module.exports = { webpSize };
