import { defineConfig, devices } from "@playwright/test";

const screenshotDir = "test-results/screenshots";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "test-results/playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
    screenshot: "on",
    trace: "retain-on-failure",
    video: "off",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  outputDir: "test-results/playwright-artifacts",
  projects: [
    {
      name: "desktop-chrome",
      testMatch: "**/biblioteca-visual.spec.js",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "desktop-exemplares",
      testMatch: "**/biblioteca-exemplares.spec.js",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "desktop-ajustes-finais",
      testMatch: "**/biblioteca-ajustes-finais.spec.js",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "desktop-correcao-final",
      testMatch: "**/biblioteca-correcao-final.spec.js",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "desktop-css-catalogo-final",
      testMatch: "**/biblioteca-css-catalogo-final.spec.js",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "desktop-registrar-emprestimo-sticky",
      testMatch: "**/biblioteca-registrar-emprestimo-sticky.spec.js",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile-chrome",
      testMatch: "**/biblioteca-mobile.spec.js",
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "mobile-ngrok-local",
      testMatch: "**/biblioteca-ngrok-mobile.spec.js",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
      },
    },
    ...(process.env.RUN_NGROK_E2E === "1"
      ? [
          {
            name: "mobile-ngrok-external",
            testMatch: "**/biblioteca-ngrok-mobile.spec.js",
            use: {
              ...devices["Pixel 5"],
              viewport: { width: 390, height: 844 },
              baseURL:
                process.env.PLAYWRIGHT_NGROK_URL ||
                "https://zoraida-prejuvenile-hyperflexibly.ngrok-free.dev",
              extraHTTPHeaders: {
                "ngrok-skip-browser-warning": "true",
              },
            },
          },
        ]
      : []),
  ],
  metadata: {
    screenshotDir,
  },
});
