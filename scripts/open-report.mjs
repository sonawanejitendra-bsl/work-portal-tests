import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const file = path.resolve("playwright-report", "dynamic", "index.html");
if (!existsSync(file)) {
  console.error("No dynamic report yet. Run npm run demo first.");
  process.exit(1);
}

if (process.platform === "win32") {
  spawn("cmd", ["/c", "start", "", file], { detached: true, stdio: "ignore" }).unref();
} else {
  spawn(process.platform === "darwin" ? "open" : "xdg-open", [file], { detached: true, stdio: "ignore" }).unref();
}

const html = readFileSync(file, "utf8");
if (html.includes('data-layout="execution-summary"')) {
  console.log("Opened the execution summary report.");
  console.log(file);
} else {
  console.log("This file is still the old report. It was written by the previous framework package.");
  console.log("In this folder run:");
  console.log("  rmdir /s /q node_modules\\@core");
  console.log("  npm install");
  console.log("  npm run demo");
  console.log("  npm run report");
  console.log(file);
}
