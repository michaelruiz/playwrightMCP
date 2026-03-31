import { defineConfig } from '@playwright/test';

import { createPlaywrightConfig, createReportDemoProjects } from './config/playwright-shared.js';

export default defineConfig(
  createPlaywrightConfig({
    testDir: './tests-demo',
    projects: createReportDemoProjects(),
  }),
);
