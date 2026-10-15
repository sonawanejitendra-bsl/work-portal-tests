import type { Page } from "@playwright/test";
import { kan6Adjust } from "./kan6-adjust.flow.js";

const flows = { "kan6-adjust": kan6Adjust };

export async function runFlow(page: Page, name: keyof typeof flows): Promise<{ passed: true }> {
  return flows[name](page);
}
