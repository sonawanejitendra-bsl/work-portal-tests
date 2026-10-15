import { expect, test } from "@playwright/test";
import { runFlow } from "../flows/run-flow.js";

test("KAN-6 summary availability shows the updated on-hand quantity", async ({ page }) => {
  test.setTimeout(300_000);
  const result = await runFlow(page, "kan6-adjust");
  expect(result.passed).toBe(true);
});
