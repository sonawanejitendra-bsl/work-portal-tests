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

const cursorCfg = path.join(root, ".cursor", "mcp.json");
const vscodeCfg = path.join(root, ".vscode", "mcp.json");
if (!existsSync(cursorCfg) || !existsSync(vscodeCfg)) {
  fail("Missing .cursor/mcp.json or .vscode/mcp.json");
}

const cursor = JSON.parse(readFileSync(cursorCfg, "utf8"));
if (!cursor.mcpServers?.playwright?.args?.includes("@playwright/mcp")) {
  fail("Cursor MCP config does not point at @playwright/mcp");
}

console.log("[mcp:check] Playwright MCP is installed and config files are valid.");
console.log("[mcp:check] AI tools use this server to author tests. npm test does not start MCP.");
