import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const GET: APIRoute = async () => {
  const projects = await getCollection("projects");
  const publicDir = join(process.cwd(), "public");

  const missingFiles: string[] = [];

  for (const project of projects) {
    const { header, thumbnail, images } = project.data;

    for (const media of [header, thumbnail, ...images]) {
      if (!media.startsWith("/")) continue;

      const filePath = join(publicDir, media.slice(1));

      if (!existsSync(filePath)) {
        missingFiles.push(`${project.id}: ${media}`);
      }
    }
  }

  return new Response(
    JSON.stringify(
      {
        totalProjects: projects.length,
        expectedProjects: 15,
        allMediaFound: missingFiles.length === 0,
        missingFiles,
      },
      null,
      2
    ),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
