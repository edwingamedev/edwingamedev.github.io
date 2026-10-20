/* global console, process */

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const projectsDirectory = "public/assets/images/projects";
const args = process.argv.slice(2);

const project = args[0];
const lossless = args.includes("--lossless");
const overwrite = args.includes("--overwrite");

const qualityArg = args.find((arg) => arg.startsWith("--quality="));
const quality = qualityArg ? Number(qualityArg.split("=")[1]) : 85;

if (!project || !/^[a-zA-Z0-9_-]+$/.test(project)) {
  console.error(
    "Usage: npm run images:optimize -- <project-folder> [--quality=85] [--lossless] [--overwrite]"
  );
  process.exit(1);
}

if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
  console.error("Quality must be an integer between 1 and 100.");
  process.exit(1);
}

if (lossless && qualityArg) {
  console.error("Use either --quality or --lossless, not both.");
  process.exit(1);
}

const directory = path.join(projectsDirectory, project);
const files = (await readdir(directory)).filter((file) => /\.png$/i.test(file));

if (files.length === 0) {
  console.log(`No PNG images found in ${directory}`);
  process.exit(0);
}

const options = lossless ? { lossless: true, effort: 6 } : { quality, effort: 6 };

console.log(`Optimizing ${project}: ${lossless ? "lossless" : `quality ${quality}`}`);

let originalTotal = 0;
let optimizedTotal = 0;

for (const file of files) {
  const input = path.join(directory, file);
  const output = input.replace(/\.png$/i, ".webp");

  const existing = await stat(output).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });

  if (existing && !overwrite) {
    console.log(`Skipping ${file}: WebP already exists`);
    continue;
  }

  const outputPath = existing ? `${output}.tmp` : output;

  try {
    await sharp(input).webp(options).toFile(outputPath);

    if (existing) {
      const { rename } = await import("node:fs/promises");
      await rename(outputPath, output);
    }
  } catch (error) {
    if (existing) {
      const { unlink } = await import("node:fs/promises");
      await unlink(outputPath).catch(() => {});
    }

    throw error;
  }

  const originalSize = (await stat(input)).size;
  const optimizedSize = (await stat(output)).size;

  originalTotal += originalSize;
  optimizedTotal += optimizedSize;

  const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

  console.log(
    `${file}: ${(originalSize / 1048576).toFixed(2)} MB → ${(optimizedSize / 1048576).toFixed(2)} MB (${reduction}% smaller)`
  );
}

if (originalTotal > 0) {
  const reduction = ((1 - optimizedTotal / originalTotal) * 100).toFixed(1);

  console.log(
    `Total: ${(originalTotal / 1048576).toFixed(2)} MB → ${(optimizedTotal / 1048576).toFixed(2)} MB (${reduction}% smaller)`
  );
}
