import type { Page } from "@playwright/test";

export class DocumentsPage {
  constructor(private readonly page: Page) {}

  upload() {
    return this.page.getByTestId("upload-doc");
  }
}
