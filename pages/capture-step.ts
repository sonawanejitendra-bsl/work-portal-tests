import { test, type Page } from "@playwright/test";

/** Saves the current screen on the test so the report can show every step. */
export async function captureStep(page: Page, name: string): Promise<void> {
  const info = test.info();
  const taken = info.attachments.filter((item) => item.contentType?.startsWith("image/")).length + 1;
  const label = `${String(taken).padStart(2, "0")} ${name}`;
  await info.attach(label, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
}
