import type { Page } from "@playwright/test";

/** Locators for the signed-in chrome that every screen shares. */
export class HomePage {
  constructor(private readonly page: Page) {}

  ready() {
    return this.page.getByTestId("app-ready");
  }

  heading() {
    return this.page.getByRole("heading", { name: /Welcome/ });
  }

  async open(): Promise<void> {
    await this.page.goto("/home");
  }
}
