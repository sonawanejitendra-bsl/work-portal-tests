# lynx-style-actions

Generated KAN-1 is scored with KAN-1-EXPECTED.md before anyone changes the generated files.

This branch is a complete framework and test tree. It does not import `@core/playwright-framework` and it does not use the files from the other style branches.

## Shape

- There are no page classes and no `new`.
- A screen step is a function in `actions/`. The first argument is `page`.
- Locators are functions at the top of the action file.
- A healed click uses `clickOrHeal` from `support/click-or-heal.ts`.
- Actions return a value. They do not assert. Every `expect` stays in the spec.
- The spec does not use `test.step`.
- Item and quantities for a case sit at the top of that spec. There is no data folder.

## KAN-6 reference

`specs/kan6-summary-availability.spec.ts` is the finished flow. Copy it for the next flow, and add a function under `actions/` if the screen is new.

## Run

`npm install`, then `npm run kan`.

