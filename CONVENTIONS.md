# lynx-style-fixtures

This branch is a complete framework and test tree. It does not import `@core/playwright-framework` and it does not use the files from the other style branches.

## Shape

- A spec imports `test` from `fixtures/jde-test.ts` only.
- Pages arrive as arguments: `jdeLogin`, `summaryAvailability`, `inventoryAdjustments`.
- A spec must not import a page class and must not call `new`.
- File names are kebab-case.
- Tags sit on the test options.
- Screenshots go through `stepShot`.
- The healed sign-in is `jdeLogin.signInWithHeal()`. The stale Login locator stays inside that method.

## KAN-6 reference

`tests/jde/kan-6-summary-availability.spec.ts` is the finished flow. Copy that file for the next flow. Register any new page in `fixtures/jde-test.ts`, then use it as an argument.

## Run

`npm install`, then `npm run kan`.
