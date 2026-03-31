import path from 'node:path';

import { expect, test } from './fixtures/practice.fixture.js';

const visualStylePath = path.resolve('tests/assets/visual-regression.css');

test.describe('Signal Lab visual regression', { tag: ['@visual', '@regression'] }, () => {
  test.use({
    viewport: {
      width: 1440,
      height: 1600,
    },
  });

  test.beforeEach(async ({ page, practicePage }) => {
    await practicePage.goto();
    await page.addStyleTag({ path: visualStylePath });
  });

  test('the filtered practice board layout remains stable', async ({
    practicePage,
    reportStep,
  }) => {
    await reportStep('Filter the card grid into a stable visual state', async () => {
      await practicePage.filterCards('roadmap');
      await expect(practicePage.visibleCardCount).toHaveText('1');
    });

    await reportStep('Capture the main shell snapshot', async () => {
      await expect(practicePage.shell).toHaveScreenshot('practice-shell.png', {
        maxDiffPixels: 500,
      });
    });
  });

  test('the release notes dialog remains stable', async ({ practicePage, reportStep }) => {
    await reportStep('Open the release dialog', async () => {
      await practicePage.openReleaseNotes();
      await expect(practicePage.releaseDialog).toBeVisible();
    });

    await reportStep('Capture the release dialog snapshot', async () => {
      await expect(practicePage.releaseDialog).toHaveScreenshot('release-dialog.png', {
        maxDiffPixels: 35,
      });
    });
  });
});
