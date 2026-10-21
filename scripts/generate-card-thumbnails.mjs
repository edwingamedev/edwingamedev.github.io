/* global console, process */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import YAML from "yaml";

const CONTENT_DIR = path.resolve("src/content/projects");
const PUBLIC_DIR = path.resolve("public");

const WIDTH = 560;
const QUALITY = 85;
const OVERWRITE = process.argv.includes("--overwrite");

const files = await fs.readdir(CONTENT_DIR);
const processed = new Set();

let generated = 0;
let skipped = 0;

for (const file of files) {
  if (!file.endsWith(".md")) continue;

  const content = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    console.warn(`Missing frontmatter: ${file}`);
    continue;
  }

  const data = YAML.parse(match[1]);
  const thumbnail = data?.thumbnail;

  if (typeof thumbnail !== "string") continue;

  if (/\.(webm|mp4)$/i.test(thumbnail)) {
    skipped++;
    continue;
  }

  if (!/\.(png|jpe?g|webp)$/i.test(thumbnail)) {
    console.warn(`Unsupported thumbnail: ${thumbnail}`);
    continue;
  }

  if (!thumbnail.startsWith("/assets/images/projects/")) {
    console.warn(`Unexpected thumbnail path: ${thumbnail}`);
    continue;
  }

  const sourcePath = path.resolve(PUBLIC_DIR, thumbnail.replace(/^\/+/, ""));

  const outputPath = sourcePath.replace(/\.[^.]+$/, "-card.webp");

  if (processed.has(sourcePath)) {
    skipped++;
    continue;
  }

  processed.add(sourcePath);

  try {
    await fs.access(sourcePath);

    if (!OVERWRITE) {
      try {
        await fs.access(outputPath);
        console.log(`Exists: ${path.relative(PUBLIC_DIR, outputPath)}`);
        skipped++;
        continue;
      } catch {
        // Output doesn't exist yet.
      }
    }

    await sharp(sourcePath)
      .resize({
        width: WIDTH,
        withoutEnlargement: true,
      })
      .webp({
        quality: QUALITY,
        effort: 6,
      })
      .toFile(outputPath);

    console.log(`Generated: ${path.relative(PUBLIC_DIR, outputPath)}`);
    generated++;
  } catch (error) {
    console.error(`Failed: ${thumbnail}`, error);
    process.exitCode = 1;
  }
}

console.log(`\nGenerated: ${generated} | Skipped: ${skipped}`);
