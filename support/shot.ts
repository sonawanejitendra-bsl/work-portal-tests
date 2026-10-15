import { test, type Page } from "@playwright/test";

/** Attaches a numbered screenshot to the current test. */
export async function shot(page: Page, name: string): Promise<void> {
  const info = test.info();
  const taken = info.attachments.filter((item) => item.contentType?.startsWith("image/")).length + 1;
  await info.attach(`${String(taken).padStart(2, "0")} ${name}`, {
    body: await page.screenshot(),
    contentType: "image/png",
  });
}
