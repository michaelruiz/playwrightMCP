import { expect, test } from "./fixtures/practice.fixture.js";

test.describe("Signal Lab practice page", () => {
  test("sign-in shows a success message for the configured login plan", async ({
    practicePage,
    loginCredentials,
    reportStep,
    signInWithConfiguredCredentials,
  }) => {
    await reportStep("Open the practice page", async () => {
      await expect(practicePage.signInStatus).toHaveText(
        "Waiting for sign-in input.",
      );
    });

    await reportStep("Sign in through the shared fixture flow", async () => {
      await signInWithConfiguredCredentials();
    });

    await reportStep("Verify the result", async () => {
      await expect(practicePage.signInStatus).toHaveText(
        `Signed in as ${loginCredentials.email} on the ${loginCredentials.plan} plan.`,
      );
    });
  });
});
