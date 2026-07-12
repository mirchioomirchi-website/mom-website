import sharp from "sharp";
import { readdir, stat, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.argv[2];
const dir = path.resolve(ROOT, "public/images");
const ARCHIVE = path.join(dir, "_archive");

// PNGs currently referenced from src/ — only these need .webp + .avif siblings
const USED_PNGS = new Set([
  "character-1-nobg.png",
  "character-1.png",
  "character-2-nobg.png",
  "character-2.png",
  "character-3-nobg.png",
  "character-3.png",
  "ing-sugar.png",
  "mom-logo-white.png",
  "story-fresh-chillies.png",
]);

// PNGs/JPGs definitely unused — move to _archive (not deleted, recoverable)
const UNUSED = [
  "chillies.png", "coriander.png", "cumin-salt.png", "garlic.png",
  "hero-banner.png", "hero-jar.png", "hero-main.png",
  "jar-green-nobg.png", "jar-green.png", "jar-mixed-nobg.png", "jar-orange.png",
  "jar-red-nobg.png",
  "label-green.png", "label-orange.png", "label-red.png",
  "lemon.jpg", "mom-logo.png", "oil.png", "scarf-design.jpeg",
  "food-1.jpg", "food-2.jpg", "food-3.jpg", "food-4.jpg",
];

async function bytes(p) { try { return (await stat(p)).size; } catch { return 0; } }

if (!existsSync(ARCHIVE)) await mkdir(ARCHIVE, { recursive: true });

let savedFromConversion = 0;
let savedFromArchive = 0;

console.log("\n── Converting in-use PNGs to .webp ──");
for (const name of USED_PNGS) {
  const src = path.join(dir, name);
  if (!existsSync(src)) { console.log(`  skip (not found): ${name}`); continue; }
  const base = name.replace(/\.png$/i, "");
  const webp = path.join(dir, `${base}.webp`);
  if (existsSync(webp)) { console.log(`  already exists: ${base}.webp`); continue; }
  const before = await bytes(src);
  await sharp(src).webp({ quality: 82, effort: 6 }).toFile(webp);
  const after = await bytes(webp);
  savedFromConversion += before - after;
  console.log(`  ${name}  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (.webp)  saved ${((before-after)/1024).toFixed(0)}KB`);
}

console.log("\n── Archiving unused images (moved to _archive/) ──");
for (const name of UNUSED) {
  const src = path.join(dir, name);
  if (!existsSync(src)) continue;
  const before = await bytes(src);
  const { rename } = await import("node:fs/promises");
  await rename(src, path.join(ARCHIVE, name));
  savedFromArchive += before;
  console.log(`  archived ${name} (${(before/1024).toFixed(0)}KB)`);
}

console.log(`\n✓ Conversion saved ${(savedFromConversion/1024/1024).toFixed(1)}MB`);
console.log(`✓ Archive moved  ${(savedFromArchive/1024/1024).toFixed(1)}MB out of the build`);
