# Playwright MCP Lab Michael Ruiz

![Playwright](https://img.shields.io/badge/playwright-automation-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-strong-blue.svg)
![Status](https://img.shields.io/badge/status-ready-green.svg)
![GitHub Actions](https://github.com/michaelruiz/playwrightMCP/actions/workflows/playwright.yml/badge.svg)

## Overview

This repository is a self-built AI Playwright framework I built from scratch to explore end-to-end automation with Playwright MCP.

- No templates copied; every script, test, and helper was created here.
- Demonstrates a minimal real-world test repo (local practice page + fixture-driven tests).
- Targets reliable cross-browser regression checks using Playwright with local asset serving.

## Supported versions

- Node.js: 18.x or 20.x recommended
- npm: 10.x or 11.x
- Playwright: `^1.40.0` (see `package.json`)

## Quick Start

### 1) Install dependencies

```bash
npm install
npx playwright install chromium
https://github.com/mcp/microsoft/playwright-mcp
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

- To learn Playwright MCP incremental design: first using MCP prompts, later capturing behaviors as typed tests.
- To maintain browser-agnostic CIs with consistent element selectors (roles/labels over brittle CSS ids).
- To prove a runnable sandbox that can be audited by any clone/fork.

## From-Scratch story (what I built)

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
- Use explicit waits:

\`\`\`ts
await expect(practicePage.snackbar).toHaveText(/success/i);
\`\`\`

- CI-friendly run:

\`\`\`bash
npx playwright test --retries=2 --workers=1
\`\`\`

## Local env configuration

Optionally define in `.env` (not committed):

\`\`\`bash
PRACTICE_LOGIN_EMAIL=demo@example.com
PRACTICE_LOGIN_PASSWORD=orbit123
PRACTICE_LOGIN_PLAN=Team
PW_CROSS_BROWSER=0
PW_MOBILE=0
\`\`\`

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
await practicePage.signIn('demo@example.com', 'orbit123');
await expect(practicePage.notification).toHaveText(/Welcome/i);
await practicePage.addTask('Ship notes');
await expect(practicePage.tasks).toHaveCount(3);
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
