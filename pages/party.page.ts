import type { Page } from "@playwright/test";

export class PartyPage {
  constructor(private readonly page: Page) {}

  fullName() {
    return this.page.getByTestId("party-full-name");
  }

  province() {
    return this.page.getByTestId("party-province");
  }

  save() {
    return this.page.getByTestId("save-party");
  }

  status() {
    return this.page.getByTestId("party-status");
  }

  async fill(name: string, province: string): Promise<void> {
    await this.fullName().fill(name);
    await this.province().fill(province);
  }
}
