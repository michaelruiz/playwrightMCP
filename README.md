# Playwright MCP Lab

Using MCP-driven browser exploration to build structured Playwright tests.

![Playwright](https://img.shields.io/badge/playwright-automation-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-strong-blue.svg)
![Status](https://img.shields.io/badge/status-ready-green.svg)
![GitHub Actions](https://github.com/michaelruiz/playwrightMCP/actions/workflows/playwright.yml/badge.svg)

## Overview

This repository is a TypeScript Playwright lab for learning how MCP-assisted browser exploration can become maintainable end-to-end tests.

- Includes a local practice app for safe UI exploration and repeatable automation exercises.
- Demonstrates a clean test structure with page objects, fixtures, typed config, and CI.
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
npm run test:headed
npm run test:debug
```

### 4) Inspect report

```bash
npx playwright show-report
```
> If badge shows 404, run `npm test` once and re-open this README or GitHub page.

## What is in this repo

- `pages/practice-page.ts`: page object for reusable actions
- `tests/fixtures/practice.fixture.ts`: login fixtures and shared flows
- `tests/practice-sign-in.spec.ts`: sign-in happy path tests
- `tests/practice-workflows.spec.ts`: task filtering, creation, and UI workflow tests
- `config/environment.ts`: runtime environment variables + validation
- `scripts/serve-practice.ts`: local static server used in CI/test
- `scripts/run-playwright.ts`: custom test runner wrapper for local iteration
- `playwright.config.ts`: vitals for test projects, timeout, server setup
- `tsconfig.json`: strict TypeScript config

## Why this repo exists

- To practice the workflow from MCP browser exploration to durable Playwright tests.
- To show a small but opinionated QA repo structure with TypeScript, fixtures, POM, CI, and reporting.
- To share a reviewable project that other QA engineers can inspect, critique, and build on.

## How the lab evolved

1. Created `practice/index.html` and local UI flows (task cards, filters, dialogs).
2. Added TypeScript + Playwright config and project scripts.
3. Built MCP prompts and test translation examples in README.
4. Implemented page object + fixtures (sign-in, workflow, assertions).
5. Configured `playwright.config.ts` to run a local server automatically in CI.
6. Added environment validation and docs for safe local secrets.


## Add a new test (recommended workflow)

1. Create a new spec in `tests/` (e.g., `tests/practice-<feature>.spec.ts`).
2. Add a supporting page object method in `pages/practice-page.ts` if needed.
3. Run locally:
   - `npm test -- --grep "<feature>"`
   - `npm run typecheck`
4. Confirm `npx playwright show-report` builds and passes.

## Recommended robustness checks

- Use `getByRole`, `getByLabelText`, and visible text for stable selectors.
- Avoid `nth-child` selectors or fixed DOM positions.
- Assert on visible state changes that matter:

```ts
await practicePage.signIn({
  email: "demo@example.com",
  password: "orbit123",
  plan: "Team",
});
await expect(practicePage.signInStatus).toHaveText(
  "Signed in as demo@example.com on the Team plan.",
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
  email: "demo@example.com",
  password: "orbit123",
  plan: "Team",
});
await expect(practicePage.signInStatus).toHaveText(
  "Signed in as demo@example.com on the Team plan.",
);
await practicePage.addTask("Ship notes");
await expect(practicePage.taskCount).toHaveText("3");
``` 

## Scripts

- `npm run serve:practice`: serve practice page locally
- `npm run test`: run full test suite
- `npm run typecheck`: TS type check
- `npm run test:cross-browser`: execute all browser projects
- `npm run test:mobile`: execute mobile emulation tests

## Pre-PR checklist

- `npm test`
- `npm run typecheck`
- `npm run lint` (if available)
- `npx playwright show-report`

## Contributing

1. Fork repository
2. Create feature branch
3. Add tests and verify `npm test`
4. Open PR

## License
MIT
