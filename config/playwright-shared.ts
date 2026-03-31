import {
  devices,
  type PlaywrightTestConfig,
  type Project,
  type ReporterDescription,
} from '@playwright/test';

import { getRuntimeSettings } from './environment.js';

const runtime = getRuntimeSettings();
const visualSpecPattern = '**/practice-visual.spec.ts';

function createReporter(): ReporterDescription[] {
  const reporter: ReporterDescription[] = [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/report.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ];

  if (process.env.GITHUB_ACTIONS) {
    reporter.push(['github']);
  }

  return reporter;
}

export function createProductionProjects(): Project[] {
  const projects: Project[] = [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ];

  if (runtime.crossBrowser) {
    projects.push(
      {
        name: 'firefox',
        testIgnore: visualSpecPattern,
        use: {
          ...devices['Desktop Firefox'],
        },
      },
      {
        name: 'webkit',
        testIgnore: visualSpecPattern,
        use: {
          ...devices['Desktop Safari'],
        },
      },
    );
  }

  if (runtime.mobile) {
    projects.push(
      {
        name: 'mobile-chrome',
        testIgnore: visualSpecPattern,
        use: {
          ...devices['Pixel 5'],
        },
      },
      {
        name: 'mobile-safari',
        testIgnore: visualSpecPattern,
        use: {
          ...devices['iPhone 13'],
        },
      },
    );
  }

  return projects;
}

export function createReportDemoProjects(): Project[] {
  return [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ];
}

export function createPlaywrightConfig({
  projects,
  testDir,
}: {
  projects: Project[];
  testDir: string;
}): PlaywrightTestConfig {
  return {
    testDir,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    ...(process.env.CI ? { workers: 2 } : {}),
    reporter: createReporter(),
    expect: {
      toHaveScreenshot: {
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
      },
    },
    use: {
      baseURL: runtime.baseURL,
      trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
    webServer: {
      command: 'npm run serve:practice',
      url: `${runtime.baseURL}/practice/`,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    projects,
  };
}
