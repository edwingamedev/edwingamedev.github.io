// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import yaml from "@rollup/plugin-yaml";

// https://astro.build/config
export default defineConfig({
  site: "https://edwingamedev.github.io",

  server: {
    port: 4321,
  },

  vite: {
    server: {
      strictPort: true,
    },
    plugins: [tailwindcss(), yaml()],
  },
});
