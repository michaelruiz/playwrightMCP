import { AxeBuilder } from '@axe-core/playwright';
import type { AxeResults } from 'axe-core';

import { expect, test } from './fixtures/practice.fixture.js';

function formatViolations(violations: AxeResults['violations']): string {
  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(' ')).join(', ');

      return `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.help}\nTargets: ${targets}`;
    })
    .join('\n\n');
}

function getBlockingViolations(violations: AxeResults['violations']): AxeResults['violations'] {
  return violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
}

test.describe('Signal Lab accessibility', { tag: ['@a11y', '@regression'] }, () => {
  test(
    'the full practice page has no serious or critical accessibility violations',
    { tag: '@smoke' },
    async ({ page, practicePage, reportStep }, testInfo) => {
      await reportStep('Confirm the page is ready for scanning', async () => {
        await expect(practicePage.shell).toHaveAttribute('data-practice-ready', 'true');
      });

      await reportStep('Run the full-page axe audit', async () => {
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

        await testInfo.attach('axe-results-page', {
          body: JSON.stringify(results, null, 2),
          contentType: 'application/json',
        });

        const blockingViolations = getBlockingViolations(results.violations);
        expect(blockingViolations, formatViolations(blockingViolations)).toEqual([]);
      });
    },
  );

  test('the release notes dialog has no serious or critical accessibility violations', async ({
    page,
    practicePage,
    reportStep,
  }, testInfo) => {
    await reportStep('Open the release notes dialog', async () => {
      await practicePage.openReleaseNotes();
      await expect(practicePage.releaseDialog).toBeVisible();
    });

    await reportStep('Run an axe audit on the dialog', async () => {
      const results = await new AxeBuilder({ page })
        .include('#release-dialog')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      await testInfo.attach('axe-results-dialog', {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      });

      const blockingViolations = getBlockingViolations(results.violations);
      expect(blockingViolations, formatViolations(blockingViolations)).toEqual([]);
    });
  });
});
