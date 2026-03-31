import { defineConfig } from '@playwright/test';

import { createPlaywrightConfig, createProductionProjects } from './config/playwright-shared.js';

export default defineConfig(
  createPlaywrightConfig({
    testDir: './tests',
    projects: createProductionProjects(),
  }),
);
