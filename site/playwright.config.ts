import { defineConfig, devices } from "@playwright/test";

// Preview server for a fully-built, prerendered site.
// Tests only run against production output (dev-mode HMR would poison baselines).
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // visual diffs are brittle under parallel CPU pressure
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",

  use: {
    baseURL: BASE,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Deterministic rendering for visual diffs:
    colorScheme: "light",
    locale: "pt-PT",
    timezoneId: "Europe/Lisbon",
  },

  // Full-page screenshot thresholds are tuned empirically — tight enough to
  // catch a color/spacing regression, loose enough to survive font hinting.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: "disabled",
      caret: "hide",
    },
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
      name: "laptop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: "tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
      },
    },
  ],

  webServer: {
    command: `npm run preview -- --port ${PORT}`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
