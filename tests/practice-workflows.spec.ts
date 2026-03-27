import { expect, test } from "./fixtures/practice.fixture.js";

test.describe("Signal Lab practice workflows", { tag: ["@ui", "@regression"] }, () => {
  test("filtering cards narrows the results and updates the visible count", { tag: "@smoke" }, async ({
    practicePage,
    reportStep,
  }) => {
    await reportStep("Filter cards by roadmap", async () => {
      await practicePage.filterCards("roadmap");
    });

    await reportStep("Verify filtered card results", async () => {
      await expect(practicePage.visibleCardCount).toHaveText("1");
      await expect(practicePage.cardHeading("Launch Outline")).toBeVisible();
      await expect(practicePage.cardHeading("Trend Review")).toHaveCount(0);
      await expect(practicePage.cardHeading("Interview Notes")).toHaveCount(0);
    });
  });

  test("adding a task updates the task count and task list", { tag: "@smoke" }, async ({
    practicePage,
    reportStep,
  }) => {
    await reportStep("Verify the starting task count", async () => {
      await expect(practicePage.taskCount).toHaveText("2");
    });

    await reportStep("Add a new task", async () => {
      await practicePage.addTask("Ship notes");
    });

    await reportStep("Verify the task board update", async () => {
      await expect(practicePage.taskCount).toHaveText("3");
      await expect(practicePage.taskItems).toHaveCount(3);
      await expect(practicePage.taskItems.nth(2)).toHaveText("Ship notes");
    });
  });

  test("preferences update the status panel and mode label", async ({
    practicePage,
    reportStep,
  }) => {
    await reportStep("Verify the initial preference state", async () => {
      await expect(practicePage.modeLabel).toHaveText("Calm");
    });

    await reportStep("Enable focus mode and auto archive", async () => {
      await practicePage.setCheckbox("Focus mode", true);
      await practicePage.setCheckbox("Auto archive", true);
    });

    await reportStep("Verify the updated preference state", async () => {
      await expect(practicePage.modeLabel).toHaveText("Focus");
      await expect(practicePage.preferencesStatus).toHaveText(
        "Daily digest is enabled. Focus mode is on. Auto archive is on.",
      );
    });
  });

  test("release notes opens as a dialog and can be dismissed", async ({
    practicePage,
    reportStep,
  }) => {
    await reportStep("Open the release notes dialog", async () => {
      await practicePage.openReleaseNotes();
    });

    await reportStep("Verify the dialog contents", async () => {
      await expect(practicePage.releaseDialog).toBeVisible();
      await expect(
        practicePage.releaseDialogText(
          "The latest update improves card filtering, makes status messages clearer, and adds a local practice flow for browser automation demos.",
        ),
      ).toBeVisible();
      await expect(
        practicePage.releaseDialogText(
          "Task creation updates the board without a page refresh.",
        ),
      ).toBeVisible();
    });

    await reportStep("Close the release notes dialog", async () => {
      await practicePage.closeReleaseNotes();
      await expect(practicePage.releaseDialog).toBeHidden();
    });
  });
});
