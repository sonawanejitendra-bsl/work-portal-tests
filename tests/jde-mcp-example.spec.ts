import { expect, test } from "@core/playwright-framework";
import { JdeLoginPage } from "../pages/jde-login.page.js";

/**
 * A different test from auto-heal, drafted with Playwright MCP.
 *
 * In VS Code, GitHub Copilot uses .vscode/mcp.json, which starts Playwright MCP.
 * Paste this into Copilot chat:
 *   Open https://mirajde-dvtrweb.birlasoft.com/jde/E1Menu.maf?
 *   Sign in. Click View Job Status under Recent Reports.
 *   Write a Playwright test that checks Submitted Job Search opened.
 *   Do not submit, print, or delete a job.
 *
 * MCP opens the portal and reads the page. View Job Status and Submitted Job Search
 * are the names from that snapshot.
 * npm test does not start MCP. It only runs the finished test.
 */
test("MCP example opens View Job Status", { tag: "@mcp" }, async ({ page }) => {
  test.setTimeout(180_000);
  const jde = new JdeLoginPage(page);
  await jde.login();
  await expect(page.getByPlaceholder("Search")).toBeVisible();
  await page.getByRole("link", { name: "View Job Status" }).click();
  await expect(page.getByRole("link", { name: "Submitted Job Search" })).toBeVisible({ timeout: 60_000 });
});
