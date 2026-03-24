import { expect, test } from "./fixtures/practice.fixture.js";

test.describe("Playwright report demo", () => {
  test.skip(
    !process.env.RUN_REPORT_DEMO,
    "This example is intentionally failing and only runs through the report demo command.",
  );

  test("intentionally fails so the report shows screenshots, console, and network diagnostics", async ({
    page,
    practicePage,
    reportStep,
  }) => {
    await reportStep("Confirm the practice page is loaded", async () => {
      await expect(practicePage.heading).toBeVisible();
      await expect(practicePage.visibleCardCount).toHaveText("3");
    });

    await reportStep("Trigger console and network errors for the report", async () => {
      await page.evaluate(async () => {
        console.error("Intentional console error for the Playwright report demo.");
        await fetch("/missing-report-demo.json");
      });
    });

    await reportStep("Fail on purpose so the report captures the diagnostics", async () => {
      await expect(practicePage.visibleCardCount).toHaveText("99");
    });
  });
});
