import { spawn } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";

const dir = path.resolve("playwright-report", "dynamic");
const file = path.join(dir, "index.html");
if (!existsSync(file)) {
  console.error("No report yet. Run npm run demo first.");
  process.exit(1);
}

const html = readFileSync(file, "utf8");
if (!html.includes('data-layout="execution-summary"') || !html.includes("Core Playwright · Execution summary")) {
  console.error("playwright-report\\dynamic\\index.html is still the old page.");
  console.error("git pull, then npm run demo, then npm run report.");
  process.exit(1);
}

for (const name of readdirSync(dir)) {
  if (name.startsWith("open-") && name.endsWith(".html")) unlinkSync(path.join(dir, name));
}
const opened = path.join(dir, `open-${Date.now()}.html`);
copyFileSync(file, opened);

const command = `Start-Process -LiteralPath ${JSON.stringify(opened)}`;
spawn("powershell.exe", ["-NoProfile", "-Command", command], { detached: true, stdio: "ignore" }).unref();
console.log("Opened a new browser window. The page has a yellow header that says Execution summary.");
console.log(opened);
