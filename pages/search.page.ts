import type { Page } from "@playwright/test";

export class SearchPage {
  constructor(private readonly page: Page) {}

  nameField() {
    return this.page.getByLabel("Party name");
  }

  submit() {
    return this.page.getByTestId("search-submit");
  }

  results() {
    return this.page.getByTestId("search-results");
  }

  row(name: string) {
    return this.page.getByTestId("party-row").filter({ hasText: name });
  }

  async search(name: string): Promise<void> {
    await this.nameField().fill(name);
    await this.submit().click();
  }
}
