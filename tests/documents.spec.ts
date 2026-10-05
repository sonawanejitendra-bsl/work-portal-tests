import { downloadFile, expect, test, uploadFile, writeTempFile } from "@core/playwright-framework";
import { portal } from "../actions/portal-actions.js";

test("document upload and download work", { tag: "@ui" }, async ({ page }) => {
  const file = await writeTempFile("note.txt", "portal attachment");
  await portal.openMenu(page, "documents");
  await uploadFile(page, "upload-doc", file);
  const download = await downloadFile(page, "Download file");
  expect(download.suggestedFilename()).toContain("note");
});
