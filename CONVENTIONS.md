# lynx-style-robot

Generated KAN-1 and KAN-2 are scored with `KAN-1-EXPECTED.md` and `KAN-2-EXPECTED.md` before anyone changes the generated files.

This branch is a complete framework and test tree. It does not import `@core/playwright-framework` and it does not use the files from the other style branches.

The pattern is the common Robot Framework layout: a `.robot` test, SeleniumLibrary, page keywords in `.resource` files, and test data in `variables/`.

## Shape

- A case is a `.robot` file under `tests/`. The test calls keywords. It has no selector, no XPath, and no CSS.
- Item, branch, quantities, dates, and explanation sit in `variables/`.
- Page keywords live in `resources/*_page.resource`. A new screen gets a new resource file. Locators stay in that file.
- Browser actions come from SeleniumLibrary: `Click Element`, `Input Text`, `Input Password`, `Press Keys`, `Select Checkbox`, `Get Text`.
- `libraries/JdeSupport.py` only switches into the JD Edwards frame that holds a locator. A new story does not add a Python library.
- Sign-in is the keyword `Sign In`. That keyword clicks Sign In even when the screen still says Login.
- `npm run kan` runs the KAN-6 robot file. Do not add a `tests/*.spec.ts` or a `.feature` file for this case.

## KAN-6 reference

`tests/kan6_summary_availability.robot` is the finished flow. Copy that file when you add the next flow. Add a keyword only when the page resource does not already have it, and keep the new selector in the resource.

## Run

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Set `JDE_USER` and `JDE_PASSWORD` in `.env`. Then `npm run kan`. Microsoft Edge is the browser. `HEADLESS=1` hides the window.

The log and screenshots are written to `results/`. Open `results/log.html`.
