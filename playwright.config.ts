import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4321",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
      },
    },
  ],
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:4321/projects/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
