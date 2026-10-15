# lynx-style-class-pom

This branch is a complete framework and test tree. It does not import `@core/playwright-framework` and it does not use the files from the other style branches.

## Shape

- Page classes are PascalCase and live in `pages/`.
- A spec creates a page with `new`.
- Locators stay inside the class. A spec does not call `getByRole` or use a CSS selector.
- The check that on-hand increased lives on `SummaryAvailabilityPage`.
- Item, branch, and the two quantities live in `test-data/JdeItems.ts`.
- A broken click goes through `BasePage.healClick`. Do not import a heal helper from another repo.
- Each business action in the spec is a `test.step`.

## KAN-6 reference

`tests/e2e/Kan6InventoryAdjustment.spec.ts` is the finished flow. Copy that file when you add the next flow, and add methods on the page classes rather than putting screen detail in the spec.

## Run

`npm install`, then `npm run kan`. Microsoft Edge is the browser. `PROFILE=ci` runs headless. `HEADED=1` shows the window.
