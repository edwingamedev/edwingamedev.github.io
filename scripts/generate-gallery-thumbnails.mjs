/* global console, process */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import YAML from "yaml";

const CONTENT_DIR = path.resolve("src/content/projects");
const PUBLIC_DIR = path.resolve("public");

const WIDTH = 1920;

const OVERWRITE = process.argv.includes("--overwrite");

const files = await fs.readdir(CONTENT_DIR);
const processed = new Set();

let generated = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  if (!file.endsWith(".md")) continue;

  const content = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    console.warn(`Missing frontmatter: ${file}`);
    continue;
  }

  const data = YAML.parse(match[1]);

  if (!Array.isArray(data?.images)) continue;

  const cover = data.header || data.thumbnail;
  const gallery = [...new Set(data.images)].filter((src) => src !== cover);

  for (const src of gallery) {
    if (typeof src !== "string") continue;

    if (/\.(webm|mp4)$/i.test(src)) {
      skipped++;
      continue;
    }

    if (!/\.(png|jpe?g|webp)$/i.test(src)) {
      console.warn(`Unsupported media: ${src}`);
      skipped++;
      continue;
    }

    if (!src.startsWith("/assets/images/projects/")) {
      console.warn(`Unexpected media path: ${src}`);
      failed++;
      process.exitCode = 1;
      continue;
    }

    const sourcePath = path.resolve(PUBLIC_DIR, src.replace(/^\/+/, ""));
    const outputPath = sourcePath.replace(/\.[^.]+$/, "-gallery.webp");

    if (!sourcePath.startsWith(PUBLIC_DIR + path.sep)) {
      console.error(`Unsafe media path: ${src}`);
      failed++;
      process.exitCode = 1;
      continue;
    }

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
          // Output does not exist yet.
        }
      }

      await sharp(sourcePath)
        .resize({
          width: WIDTH,
          withoutEnlargement: true,
          kernel: "lanczos3",
        })
        .webp({
          lossless: true,
          effort: 6,
        })
        .toFile(outputPath);

      console.log(`Generated: ${path.relative(PUBLIC_DIR, outputPath)}`);
      generated++;
    } catch (error) {
      console.error(`Failed: ${src}`, error);
      failed++;
      process.exitCode = 1;
    }
  }
}

console.log(`\nGenerated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
