import type { Page } from "@playwright/test";

export type NavItem = "home" | "search" | "queue" | "party" | "documents";

/**
 * Left menu. Architecture called this a reusable function — it lives in the app repo.
 */
export class LeftNav {
  constructor(private readonly page: Page) {}

  menu() {
    return this.page.getByTestId("left-nav");
  }

  async goto(item: NavItem): Promise<void> {
    await this.page.getByTestId(`nav-${item}`).click();
  }

  async openHelp(): Promise<void> {
    await this.page.getByTestId("nav-help").click();
  }
}
