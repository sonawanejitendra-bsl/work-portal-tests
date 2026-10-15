# lynx-style-catalog

Generated KAN-1 is scored with KAN-1-EXPECTED.md before anyone changes the generated files.

This branch is a complete framework and test tree. It does not import `@core/playwright-framework` and it does not use the files from the other style branches.

## Shape

- Every selector lives in `catalog/jde.catalog.ts`. A flow and a test must not call `getByRole` or use a CSS string.
- A test only starts a flow: `runFlow(page, "flow-name")`. The test file ends in `.test.ts`.
- Case numbers live in `data/*.json`. The flow reads that file.
- A healed click is `catalog.heal(staleKey, liveKey)`. Both keys already exist in the catalog.
- Browser, healing mode, and the host default live in `config/qa.json`. `playwright.config.ts` only reads that file.

## KAN-6 reference

`tests/kan6-adjust.test.ts`, `flows/kan6-adjust.flow.ts`, and `data/kan6.json` are the finished flow. For the next flow, add catalog keys first, add a JSON file, add a flow, register it in `flows/run-flow.ts`, and add a test that only calls `runFlow`.

## Run

`npm install`, then `npm run kan`.

