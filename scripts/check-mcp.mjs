/**
 * Confirms Playwright MCP is installed for authoring in this app repo.
 */
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function fail(message) {
  console.error(`[mcp:check] ${message}`);
  process.exit(1);
}

try {
  const pkgPath = require.resolve("@playwright/mcp/package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  console.log(`[mcp:check] @playwright/mcp ${pkg.version} at ${pkgPath}`);
} catch {
  fail("Could not resolve @playwright/mcp. Run npm install in the app test repo.");
}

const vscodeCfg = path.join(root, ".vscode", "mcp.json");
if (!existsSync(vscodeCfg)) {
  fail("Missing .vscode/mcp.json");
}

const vscode = JSON.parse(readFileSync(vscodeCfg, "utf8"));
if (!vscode.servers?.playwright?.args?.includes("@playwright/mcp")) {
  fail("VS Code MCP config does not point at @playwright/mcp");
}

console.log("[mcp:check] Playwright MCP is installed and config files are valid.");
console.log("[mcp:check] AI tools use this server to author tests. npm test does not start MCP.");
