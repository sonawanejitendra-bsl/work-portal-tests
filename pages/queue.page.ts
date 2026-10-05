import type { Page } from "@playwright/test";

export class QueuePage {
  constructor(private readonly page: Page) {}

  grid() {
    return this.page.getByTestId("data-grid");
  }
}
