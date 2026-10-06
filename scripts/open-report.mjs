import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
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

console.log(file);
