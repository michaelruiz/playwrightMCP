import { spawn } from "node:child_process";
import path from "node:path";

const args = process.argv.slice(2);
const forwardedArgs: string[] = [];
const env: NodeJS.ProcessEnv = { ...process.env };

for (const arg of args) {
  if (arg === "--cross-browser") {
    env.PW_CROSS_BROWSER = "1";
    continue;
  }

  if (arg === "--mobile") {
    env.PW_MOBILE = "1";
    continue;
  }

  if (arg === "--report-demo") {
    env.RUN_REPORT_DEMO = "1";
    continue;
  }

  forwardedArgs.push(arg);
}

const playwrightBin = path.resolve(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "playwright.cmd" : "playwright",
);

const child = spawn(playwrightBin, ["test", ...forwardedArgs], {
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
