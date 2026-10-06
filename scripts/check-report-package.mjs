import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve("node_modules", "@core", "playwright-framework");
const candidates = [
  path.join(root, "dist", "report", "render-html.js"),
  path.join(root, "src", "report", "render-html.ts"),
];
const file = candidates.find((item) => existsSync(item));
const marker = 'data-layout="execution-summary"';
const text = file ? readFileSync(file, "utf8") : "";

if (!file || !text.includes(marker)) {
  console.error("The installed Core Playwright package still has the old report.");
  console.error("In this folder run these commands, then run the demo again:");
  console.error("  rmdir /s /q node_modules\\@core");
  console.error("  npm install");
  process.exit(1);
}

console.log("Framework package includes the execution summary report.");
