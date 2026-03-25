import {
  test as base,
  expect,
  type ConsoleMessage,
  type Request,
  type Response,
} from "@playwright/test";

import { getLoginCredentials, type LoginCredentials } from "../../config/environment.js";
import { PracticePage, type SignInOptions } from "../../pages/practice-page.js";

export interface PracticeFixtures {
  practicePage: PracticePage;
  loginCredentials: LoginCredentials;
  signInWithConfiguredCredentials: (
    overrides?: Partial<SignInOptions>,
  ) => Promise<void>;
  reportStep: <T>(title: string, body: () => Promise<T>) => Promise<T>;
}

type PracticeWorkerFixtures = {
  captureConsoleOnFailure: void;
  captureNetworkOnFailure: void;
};

function slugifyTitle(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "step"
  );
}

function formatConsoleMessage(message: ConsoleMessage): string {
  const location = message.location();
  const locationText = location.url
    ? ` @ ${location.url}:${location.lineNumber}:${location.columnNumber}`
    : "";

  return `[console:${message.type()}] ${message.text()}${locationText}`;
}

function formatPageError(error: Error): string {
  return `[pageerror] ${error.stack ?? error.message}`;
}

interface NetworkFailureEntry {
  kind: "requestfailed" | "http-error";
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  resourceType: string;
  failureText?: string;
}

export const test = base.extend<PracticeFixtures & PracticeWorkerFixtures>({
  captureConsoleOnFailure: [
    async ({ page }, use, testInfo) => {
      const entries: string[] = [];
      const handleConsole = (message: ConsoleMessage): void => {
        entries.push(formatConsoleMessage(message));
      };
      const handlePageError = (error: Error): void => {
        entries.push(formatPageError(error));
      };

      page.on("console", handleConsole);
      page.on("pageerror", handlePageError);

      await use();

      if (testInfo.status !== testInfo.expectedStatus && entries.length > 0) {
        await testInfo.attach("console-output", {
          body: entries.join("\n"),
          contentType: "text/plain",
        });
      }
    },
    { auto: true },
  ],

  captureNetworkOnFailure: [
    async ({ page }, use, testInfo) => {
      const entries: NetworkFailureEntry[] = [];

      const handleRequestFailed = (request: Request): void => {
        const failureText = request.failure()?.errorText;

        entries.push({
          kind: "requestfailed",
          method: request.method(),
          url: request.url(),
          resourceType: request.resourceType(),
          ...(failureText ? { failureText } : {}),
        });
      };

      const handleResponse = (response: Response): void => {
        if (response.status() < 400) {
          return;
        }

        const request = response.request();
        entries.push({
          kind: "http-error",
          method: request.method(),
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          resourceType: request.resourceType(),
        });
      };

      page.on("requestfailed", handleRequestFailed);
      page.on("response", handleResponse);

      await use();

      if (testInfo.status !== testInfo.expectedStatus && entries.length > 0) {
        await testInfo.attach("network-diagnostics", {
          body: JSON.stringify(entries, null, 2),
          contentType: "application/json",
        });
      }
    },
    { auto: true },
  ],

  practicePage: async ({ page }, use) => {
    const practicePage = new PracticePage(page);
    await practicePage.goto();
    await use(practicePage);
  },

  // Playwright fixtures require destructured args in this position.
  // eslint-disable-next-line no-empty-pattern
  loginCredentials: async ({}, use) => {
    await use(getLoginCredentials());
  },

  signInWithConfiguredCredentials: async ({ practicePage, loginCredentials }, use) => {
    await use(async (overrides = {}) => {
      await practicePage.signIn({
        ...loginCredentials,
        ...overrides,
      });
    });
  },

  reportStep: async ({ page }, use, testInfo) => {
    let stepIndex = 0;

    await use(async <T>(title: string, body: () => Promise<T>): Promise<T> => {
      stepIndex += 1;

      return base.step(title, async () => {
        try {
          return await body();
        } finally {
          if (!page.isClosed()) {
            const screenshot = await page.screenshot({
              animations: "disabled",
              fullPage: true,
            });

            await testInfo.attach(
              `step-${String(stepIndex).padStart(2, "0")}-${slugifyTitle(title)}`,
              {
                body: screenshot,
                contentType: "image/png",
              },
            );
          }
        }
      });
    });
  },
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === "skipped" || page.isClosed()) {
    return;
  }

  const screenshot = await page.screenshot({
    animations: "disabled",
    fullPage: true,
  });

  await testInfo.attach("final-page-state", {
    body: screenshot,
    contentType: "image/png",
  });
});

export { expect };
