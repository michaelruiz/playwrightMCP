import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
  type Project,
  type ReporterDescription,
} from "@playwright/test";

import { getRuntimeSettings } from "./config/environment.js";

const runtime = getRuntimeSettings();
const reporter: ReporterDescription[] = [
  ["list"],
  ["html", { open: "never" }],
  ["json", { outputFile: "test-results/report.json" }],
  ["allure-playwright", { outputFolder: "allure-results" }],
];

if (process.env.GITHUB_ACTIONS) {
  reporter.push(["github"]);
}

function getProjects(): Project[] {
  const projects: Project[] = [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ];

  if (runtime.crossBrowser) {
    projects.push(
      {
        name: "firefox",
        use: {
          ...devices["Desktop Firefox"],
        },
      },
      {
        name: "webkit",
        use: {
          ...devices["Desktop Safari"],
        },
      },
    );
  }

  if (runtime.mobile) {
    projects.push(
      {
        name: "mobile-chrome",
        use: {
          ...devices["Pixel 5"],
        },
      },
      {
        name: "mobile-safari",
        use: {
          ...devices["iPhone 13"],
        },
      },
    );
  }

  return projects;
}

const config: PlaywrightTestConfig = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  reporter,
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      pathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
      scale: "css",
    },
  },
  use: {
    baseURL: runtime.baseURL,
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run serve:practice",
    url: `${runtime.baseURL}/practice/`,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  projects: getProjects(),
});

export default config;
