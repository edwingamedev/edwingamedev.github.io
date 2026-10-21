/* global console, process */

import { readdir, readFile, unlink, stat } from "node:fs/promises";
import path from "node:path";

const project = process.argv[2];
const shouldDelete = process.argv.includes("--delete");

if (!project || !/^[a-zA-Z0-9_-]+$/.test(project)) {
  console.error("Usage: npm run images:cleanup -- <project-folder> [--delete]");
  process.exit(1);
}

const directory = path.join("public/assets/images/projects", project);

const sourceExtensions = new Set([
  ".astro",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".md",
  ".css",
  ".json",
  ".yml",
  ".yaml",
  ".html",
]);

async function getSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getSourceFiles(filePath)));
    } else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(filePath);
    }
  }

  return files;
}

const images = (await readdir(directory)).filter((file) => /\.png$/i.test(file));

if (images.length === 0) {
  console.log("No PNG images found.");
  process.exit(0);
}

const sources = await Promise.all(
  (await getSourceFiles("src")).map(async (file) => ({
    file,
    content: await readFile(file, "utf8"),
  }))
);

const removable = [];
const blocked = [];

for (const image of images) {
  const webp = image.replace(/\.png$/i, ".webp");
  const webpPath = path.join(directory, webp);

  const exists = await stat(webpPath)
    .then((info) => info.isFile())
    .catch((error) => {
      if (error.code === "ENOENT") return false;
      throw error;
    });

  const reference = `${project}/${image}`;

  const usedBy = sources
    .filter(({ content }) => content.includes(reference))
    .map(({ file }) => file);

  if (!exists || usedBy.length > 0) {
    blocked.push({ image, exists, usedBy });
    continue;
  }

  removable.push(image);
}

for (const item of blocked) {
  console.log(`BLOCKED: ${item.image}`);

  if (!item.exists) {
    console.log("  Missing WebP replacement");
  }

  for (const source of item.usedBy) {
    console.log(`  Referenced in ${source}`);
  }
}

if (blocked.length > 0) {
  console.error(`Cleanup cancelled: ${blocked.length} PNG(s) need attention.`);
  process.exit(1);
}

console.log(`\n${removable.length} PNG(s) ready for cleanup.`);

if (!shouldDelete) {
  removable.forEach((file) => console.log(`Would delete: ${file}`));

  console.log("\nDry run only. Add --delete to remove files.");
  process.exit(0);
}

for (const image of removable) {
  await unlink(path.join(directory, image));
  console.log(`Deleted: ${image}`);
}

console.log("\nCleanup completed.");
