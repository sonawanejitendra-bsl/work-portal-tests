import { HealingRegistry } from "@core/playwright-framework";

/**
 * Intents sit next to page objects in the app repo, not in the core package.
 * healedClick scores live elements against these fields.
 */
export const portalIntents = new HealingRegistry();

portalIntents.register({
  id: "save-party",
  role: "button",
  name: "Save party",
  testId: "save-party",
});

portalIntents.register({
  id: "search",
  role: "button",
  name: "Search",
  testId: "search-submit",
});
