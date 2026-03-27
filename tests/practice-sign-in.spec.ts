import { expect, test } from "./fixtures/practice.fixture.js";

test.describe("Signal Lab practice page", { tag: ["@forms", "@regression"] }, () => {
  test("sign-in shows a success message for the configured login plan", { tag: "@smoke" }, async ({
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
  test("sign-in defaults to the Starter plan when no plan is provided", async ({
    practicePage,
  }) => {
    await practicePage.goto();
    await practicePage.signIn({
      email: "wrong@example.com",
      password: "badpassword",
    });
    await expect(practicePage.signInStatus).toHaveText(
      "Signed in as wrong@example.com on the Starter plan.",
    );
  });
});
