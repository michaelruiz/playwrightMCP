# Playwright MCP Lab

<img width="1365" height="1024" alt="ChatGPT Image Mar 24, 2026 at 04_25_29 PM" src="https://github.com/user-attachments/assets/6acebfb0-3d01-46b4-b984-43afabcd3542" />

Using MCP-driven browser exploration to build structured Playwright tests.

![Playwright](https://img.shields.io/badge/playwright-automation-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-strong-blue.svg)
![Status](https://img.shields.io/badge/status-ready-green.svg)
![GitHub Actions](https://github.com/michaelruiz/playwrightMCP/actions/workflows/playwright.yml/badge.svg)

## Overview

Using MCP-driven browser exploration to build structured Playwright tests.

- Includes a local practice app for safe UI exploration and repeatable automation exercises.
- Demonstrates a clean test structure with page objects, fixtures, typed config, API coverage, accessibility checks, and visual regression.
- Publishes Playwright artifacts in CI and deploys the latest HTML report from `main` to GitHub Pages.
- Shows how MCP discovery can turn into stable Playwright assertions, reports, and workflows.

## Supported versions

- Node.js: 18+ supported, 20.x or newer recommended
- npm: 10.x or 11.x
- Playwright: `1.58.2` (pinned in `package.json`)

## Quick Start

### 1) Install dependencies

```bash
npm install
npx playwright install chromium
```

### 2) Start local practice app

```bash
npm run serve:practice
```

Open browser:

- http://127.0.0.1:4173/practice/

### 3) Run tests

```bash
npm test
```

Useful runs:

```bash
npm run test:cross-browser
npm run test:mobile
npm run test:smoke
npm run test:regression
npm run test:api
npm run test:a11y
npm run test:visual
npm run test:visual:update
npm run test:report-demo
npm run test:headed
npm run test:debug
```

### 4) Inspect report

```bash
npx playwright show-report
```

> If badge shows 404, run `npm test` once and re-open this README or GitHub page.

Generate an Allure report from the latest test run:

```bash
npm run report:allure
npm run report:allure:open
```

## What is in this repo

- `pages/practice-page.ts`: page object for reusable actions
- `tests/fixtures/practice.fixture.ts`: login fixtures, API resets, and report attachments
- `tests/practice-sign-in.spec.ts`: sign-in happy path tests
- `tests/practice-workflows.spec.ts`: task filtering, creation, and UI workflow tests
- `tests/practice-api.spec.ts`: API-layer coverage using Playwright's `request` fixture
- `tests/practice-accessibility.spec.ts`: accessibility checks powered by `axe-core`
- `tests/practice-visual.spec.ts`: Chromium visual regression coverage
- `tests/practice-visual.spec.ts-snapshots/`: committed macOS and Linux baseline snapshots for visual assertions
- `tests-demo/report-demo.failure.spec.ts`: isolated intentional-failure suite for report exploration
- `config/environment.ts`: runtime environment variables + validation
- `config/practice-data.ts`: shared practice data and state builders used by UI + API
- `config/playwright-shared.ts`: shared Playwright config factory used by the production and demo suites
- `scripts/serve-practice.ts`: local practice server with both static pages and JSON endpoints
- `scripts/run-playwright.ts`: custom test runner wrapper for local iteration
- `playwright.config.ts`: vitals for test projects, timeout, server setup
- `playwright.report-demo.config.ts`: dedicated Playwright config for the report demo suite
- `.github/workflows/playwright.yml`: CI workflow, PR artifact comments, and GitHub Pages deployment
- `tsconfig.json`: strict TypeScript config

## Why this repo exists

- To practice the workflow from MCP browser exploration to durable Playwright tests.
- To show a small but opinionated QA repo structure with TypeScript, fixtures, POM, CI, reporting, accessibility, and visual testing.
- To share a reviewable project that other QA engineers can inspect, critique, and build on.

## How the lab evolved

1. Created `practice/index.html` and local UI flows (task cards, filters, dialogs).
2. Added TypeScript + Playwright config and project scripts.
3. Built MCP prompts and test translation examples in README.
4. Implemented page object + fixtures (sign-in, workflow, assertions).
5. Configured `playwright.config.ts` to run a local server automatically in CI.
6. Added environment validation and docs for safe local secrets.
7. Added API endpoints to the practice server so UI flows can be reset and verified through Playwright.
8. Layered in test tagging, accessibility checks, and visual regression with committed baselines.
9. Published CI artifacts on PRs and deployed the latest HTML report from `main`.

## Test layers

- `@smoke`: critical workflows that should stay fast and high-signal
- `@regression`: broader feature coverage across the practice app
- `@api`: request-level coverage for health, state, and task creation endpoints
- `@a11y`: axe-powered accessibility audits for the page shell and dialog
- `@visual`: screenshot-based regression checks for the board and modal
- `@demo` / `@reporting`: intentional failure coverage in the isolated demo suite only

## Reporting and CI

- Local runs generate Playwright HTML and JSON reports in `playwright-report/` and `test-results/report.json`.
- Failed tests attach step screenshots, a final page screenshot, console diagnostics, network diagnostics, video, and trace data.
- Pull requests get downloadable artifact links through the `Playwright` GitHub Actions workflow.
- Pushes to `main` publish the latest HTML report to GitHub Pages automatically.
- The default suite is kept free of intentional skips; the report demo runs only through its dedicated config and command.

## Add a new test (recommended workflow)

1. Create a new spec in `tests/` (e.g., `tests/practice-<feature>.spec.ts`).
2. Add a supporting page object method in `pages/practice-page.ts` if needed.
3. Run locally:
   - `npm test -- --grep "<feature>"`
   - `npm run typecheck`
4. Confirm `npx playwright show-report` builds and passes.

Suggested flow:

1. Explore the behavior with MCP.
2. Add or extend a page-object method in `pages/practice-page.ts`.
3. Decide whether the coverage belongs in `@smoke`, `@regression`, `@api`, `@a11y`, or `@visual`.
4. Add assertions that verify user-visible state, not just DOM plumbing.

## Recommended robustness checks

- Use `getByRole`, `getByLabelText`, and visible text for stable selectors.
- Avoid `nth-child` selectors or fixed DOM positions.
- Assert on visible state changes that matter:

```ts
await practicePage.signIn({
  email: 'demo@example.com',
  password: 'orbit123',
  plan: 'Team',
});
await expect(practicePage.signInStatus).toHaveText(
  'Signed in as demo@example.com on the Team plan.',
);
```

- CI-friendly run:

```bash
npx playwright test --retries=2 --workers=1
```

## Local env configuration

Optionally define in `.env` (not committed):

```bash
PRACTICE_LOGIN_EMAIL=demo@example.com
PRACTICE_LOGIN_PASSWORD=orbit123
PRACTICE_LOGIN_PLAN=Team
PW_CROSS_BROWSER=0
PW_MOBILE=0
```

Load order:

1. Shell env
2. `.env.local`
3. `.env`

> `.env` and `.env.local` are ignored by git. Keep secrets local.

## Key usage notes

- Prefer `getByRole`, `getByLabelText`, and visible text for stable automation.
- Capture checkpoints with screenshots in report steps.
- Assert state after each action, then continue flow.

## Example test scenario

```ts
await practicePage.goto();
await practicePage.signIn({
  email: 'demo@example.com',
  password: 'orbit123',
  plan: 'Team',
});
await expect(practicePage.signInStatus).toHaveText(
  'Signed in as demo@example.com on the Team plan.',
);
await practicePage.addTask('Ship notes');
await expect(practicePage.taskCount).toHaveText('3');
```

## Scripts

- `npm run serve:practice`: serve practice page locally
- `npm run test`: run full test suite
- `npm run test:smoke`: run the smoke subset
- `npm run test:regression`: run the regression-tagged suite
- `npm run test:api`: run request-level API coverage
- `npm run test:a11y`: run Chromium accessibility checks
- `npm run test:visual`: verify committed visual baselines
- `npm run test:visual:update`: update visual baselines intentionally
- `npm run test:report-demo`: run the isolated intentional-failure report demo
- `npm run lint`: run the ESLint 9 flat-config lint pass
- `npm run lint:fix`: apply ESLint auto-fixes
- `npm run typecheck`: TS type check
- `npm run test:cross-browser`: execute all browser projects
- `npm run test:mobile`: execute mobile emulation tests
- `npm run report:allure`: generate a local Allure HTML report from `allure-results`
- `npm run report:allure:open`: open the generated Allure report

## Pre-PR checklist

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npx playwright show-report`

## Contributing

1. Fork repository
2. Create feature branch
3. Add tests and verify `npm test`
4. Open PR

## License

MIT
