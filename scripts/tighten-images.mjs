// Second-pass image squeeze: re-encode the current webps at quality 72 and
// downsize anything wildly oversized for its actual render size. Targets the
// hottest assets on the home + product pages.

import sharp from "sharp";
import { stat } from "node:fs/promises";
import { existsSync, copyFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] || process.cwd();
const dir = path.resolve(ROOT, "public/images");

// [filename, maxWidth, quality]
const targets = [
  ["jar-green-final.webp", 800, 72],
  ["jar-mixed-final.webp", 800, 72],
  ["jar-red-final.webp", 800, 72],
  ["story-fresh-chillies.webp", 900, 70],
  ["mom-logo-white.webp", 500, 80],
  ["character-1.webp", 800, 72],
  ["character-2.webp", 800, 72],
  ["character-3.webp", 800, 72],
  ["character-1-nobg.webp", 800, 72],
  ["character-2-nobg.webp", 800, 72],
  ["character-3-nobg.webp", 800, 72],
  ["ing-chillies.webp", 700, 70],
  ["ing-coriander.webp", 700, 70],
  ["ing-cumin-salt.webp", 700, 70],
  ["ing-garlic.webp", 700, 70],
  ["ing-lemon.webp", 700, 70],
  ["ing-oil.webp", 700, 70],
  ["ing-sugar.webp", 700, 70],
];

async function bytes(p) {
  try { return (await stat(p)).size; } catch { return 0; }
}

let totalBefore = 0;
let totalAfter = 0;
const tempSuffix = ".tmp-new.webp";

for (const [name, maxW, q] of targets) {
  const src = path.join(dir, name);
  if (!existsSync(src)) { console.log(`  skip (missing): ${name}`); continue; }
  const tmp = src + tempSuffix;

  const before = await bytes(src);
  const meta = await sharp(src).metadata();
  const w = Math.min(meta.width ?? 0, maxW);

  await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: q, effort: 6 }).toFile(tmp);

  const after = await bytes(tmp);
  if (after < before) {
    copyFileSync(tmp, src);
    console.log(`  ${name}  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (-${((before-after)/1024).toFixed(0)}KB, w=${w}, q=${q})`);
    totalBefore += before;
    totalAfter += after;
  } else {
    console.log(`  ${name}  no win (kept original ${(before/1024).toFixed(0)}KB, new=${(after/1024).toFixed(0)}KB)`);
  }
  const { unlink } = await import("node:fs/promises");
  await unlink(tmp);
}

console.log(`\n✓ Saved ${((totalBefore - totalAfter) / 1024).toFixed(0)}KB (${(totalBefore/1024).toFixed(0)}KB → ${(totalAfter/1024).toFixed(0)}KB)`);
