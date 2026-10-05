import type { Page } from "@playwright/test";
import { healedClick, openPopup } from "@core/playwright-framework";
import { DocumentsPage } from "../pages/documents.page.js";
import { HomePage } from "../pages/home.page.js";
import { LeftNav, type NavItem } from "../pages/nav.page.js";
import { PartyPage } from "../pages/party.page.js";
import { SearchPage } from "../pages/search.page.js";
import { portalIntents } from "../healing/intents.js";

/**
 * App-level reusable functions (left menu, party search, save party).
 * The core package only has loginAs / openPath. Domain steps belong here.
 */
export const portal = {
  home: (page: Page) => new HomePage(page),
  nav: (page: Page) => new LeftNav(page),
  search: (page: Page) => new SearchPage(page),
  party: (page: Page) => new PartyPage(page),
  documents: (page: Page) => new DocumentsPage(page),

  async openMenu(page: Page, item: NavItem): Promise<void> {
    await new HomePage(page).open();
    await new LeftNav(page).goto(item);
  },

  async searchParty(page: Page, name: string): Promise<void> {
    await this.openMenu(page, "search");
    await new SearchPage(page).search(name);
  },

  async savePartyOnScreen(page: Page, name: string, province: string): Promise<void> {
    const party = new PartyPage(page);
    await this.openMenu(page, "party");
    await party.fill(name, province);
    await healedClick(page, party.save(), portalIntents.get("save-party"));
  },

  async openHelpWindow(page: Page): Promise<Page> {
    await new HomePage(page).open();
    return openPopup(page, () => new LeftNav(page).openHelp());
  },
};
