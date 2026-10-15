# lynx-style-bdd

Generated KAN-1 is scored with KAN-1-EXPECTED.md before anyone changes the generated files.

This branch is a complete framework and test tree. It does not import `@core/playwright-framework` and it does not use the files from the other style branches.

## Shape

- A case is a `.feature` file. The feature has no selectors and no TypeScript import.
- Item, branch, and quantities sit in an Examples table.
- Step sentences are implemented in `steps/jde.steps.ts`. Steps call a page. They do not hold locators.
- Locators live only in `pages/`.
- Heal is the sentence `When I click Sign In even if the screen still says Login`. The feature does not mention a heal function.
- `npm run kan` runs Cucumber, not a Playwright spec. Do not add a `tests/*.spec.ts` for this case.

## KAN-6 reference

`features/kan6-inventory-adjustment.feature` is the finished flow. Copy that feature for the next flow. Add a sentence only if `steps/jde.steps.ts` does not already have it, and keep the new selector in the page file.

## Run

`npm install`, then `npm run kan`.

