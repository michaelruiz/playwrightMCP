import { existsSync, readFileSync } from "node:fs";

const PROJECT_ENV_FILES = [".env", ".env.local"] as const;
const loadedEnvKeys = new Set<string>();
let envLoaded = false;

export const PRACTICE_PLAN_VALUES = ["Starter", "Team", "Studio"] as const;

export type PracticePlan = (typeof PRACTICE_PLAN_VALUES)[number];

export interface LoginCredentials {
  email: string;
  password: string;
  plan: PracticePlan;
}

export interface RuntimeSettings {
  host: string;
  port: number;
  baseURL: string;
  crossBrowser: boolean;
  mobile: boolean;
}

function parseBoolean(value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function loadEnvFileIfPresent(
  filename: string,
  { overrideFileValues = false }: { overrideFileValues?: boolean } = {},
): void {
  if (!existsSync(filename)) {
    return;
  }

  const source = readFileSync(filename, "utf8");
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    const hasShellValue = process.env[key] !== undefined && !loadedEnvKeys.has(key);
    const hasFileValue = loadedEnvKeys.has(key);

    if (hasShellValue || (hasFileValue && !overrideFileValues)) {
      continue;
    }

    process.env[key] = value;
    loadedEnvKeys.add(key);
  }
}

export function loadProjectEnv(): void {
  if (envLoaded) {
    return;
  }

  loadEnvFileIfPresent(PROJECT_ENV_FILES[0]);
  loadEnvFileIfPresent(PROJECT_ENV_FILES[1], { overrideFileValues: true });
  envLoaded = true;
}

function getValidatedPort(rawPort: string | undefined): number {
  const port = Number(rawPort || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT value "${rawPort}". Expected an integer between 1 and 65535.`,
    );
  }

  return port;
}

function isPracticePlan(value: string): value is PracticePlan {
  return PRACTICE_PLAN_VALUES.includes(value as PracticePlan);
}

export function getLoginCredentials(): LoginCredentials {
  loadProjectEnv();

  const email = (process.env.PRACTICE_LOGIN_EMAIL || "demo@example.com").trim();
  const password = process.env.PRACTICE_LOGIN_PASSWORD || "orbit123";
  const plan = (process.env.PRACTICE_LOGIN_PLAN || "Team").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(
      `Invalid PRACTICE_LOGIN_EMAIL value "${email}". Expected an email-like value.`,
    );
  }

  if (!password.trim()) {
    throw new Error("Invalid PRACTICE_LOGIN_PASSWORD value. It must not be empty.");
  }

  if (!isPracticePlan(plan)) {
    throw new Error(
      `Invalid PRACTICE_LOGIN_PLAN value "${plan}". Expected one of: ${PRACTICE_PLAN_VALUES.join(", ")}.`,
    );
  }

  return {
    email,
    password,
    plan,
  };
}

export function getRuntimeSettings(): RuntimeSettings {
  loadProjectEnv();

  const host = (process.env.HOST || "127.0.0.1").trim();
  if (!host) {
    throw new Error("Invalid HOST value. It must not be empty.");
  }

  const port = getValidatedPort(process.env.PORT);
  const crossBrowser = parseBoolean(process.env.PW_CROSS_BROWSER) || !!process.env.CI;
  const mobile = parseBoolean(process.env.PW_MOBILE);

  return {
    host,
    port,
    baseURL: `http://${host}:${port}`,
    crossBrowser,
    mobile,
  };
}
