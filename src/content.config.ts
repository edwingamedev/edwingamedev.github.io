import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    description: z.string(),

    project_type: z.string(),
    role: z.string(),
    company: z.string().optional(),

    focus: z.array(z.string()).default([]),
    technical_highlights: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),

    featured_order: z.number().optional(),

    header: z.string(),
    thumbnail: z.string(),
    images: z.array(z.string()).default([]),

    instagram: z
      .union([z.string(), z.array(z.string())])
      .transform((value) => (Array.isArray(value) ? value : [value]))
      .optional(),

    youtube: z.string().optional(),

    primary_action: z
      .object({
        label: z.string().min(1),
        url: z.string().url(),
        icon: z.enum(["external-link", "gamepad-2", "play", "code-2", "download"]),
      })
      .optional(),
  }),
});

export const collections = { projects };
