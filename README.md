# Work portal tests (app repo)

GitHub: https://github.com/sonawanejitendra-bsl/work-portal-tests
Core: https://github.com/sonawanejitendra-bsl/core-playwright-framework

This folder is an **application test repo**. It consumes `@core/playwright-framework`. Page objects, left-menu actions, party search, and this product's API live here — not in the core package.

You can keep it next to the core while you work, then move it to its own GitHub repo.

```
core-playwright-framework/     ← shared library
app-tests/                     ← this product (work-portal)
  pages/                       locators
  actions/                     reusable functions for this app
  api/                         PortalApi on top of the core client
  healing/                     intents for healedClick
  tests/
  dummy-portal/                local website so the suite runs without QA
  .github/workflows/           shards + merged report + optional Teams
  ci/teamcity.md
```

## Missing architecture pieces this repo adds

| Architecture item | Where it lives now |
| --- | --- |
| Page objects | `pages/` |
| Left menu, search party, save party | `actions/portal-actions.ts` |
| App API (me, parties, vendor) | `api/portal-api.ts` |
| Healing intents next to locators | `healing/intents.ts` |
| Two roles, login once each | `tests/auth.setup.ts` (operator + reviewer) |
| GitHub Actions shards | `.github/workflows/playwright.yml` |
| Merged HTML report | `npm run report:merge` |
| TeamCity | `ci/teamcity.md` |
| Teams ping | `scripts/notify-teams.mjs` if `TEAMS_WEBHOOK` is set |
| MCP authoring | `.cursor/mcp.json`, `.vscode/mcp.json` |
| Own portal under test | `dummy-portal/` on port **4174** |

Still not in this repo (and not faked): an AI pull-request reviewer, and a live Guidewire app. Point `environments.qa` at real QA when you have it and stop the dummy `webServer`.

## JD Edwards login and logout

The app URL is `environments.qa` in `playwright.config.ts`:

`https://mirajde-dvtrweb.birlasoft.com`

`tests/jde-login.spec.ts` opens `/jde/E1Menu.maf?`, signs in as **TESTT02**, and a second test signs out. The browser is Microsoft Edge (`BROWSERS=msedge`), so Playwright's Chromium download is not required.

```powershell
npm install
npm test
```

If `npm install` stops with `SELF_SIGNED_CERT_IN_CHAIN`, the company network certificate blocked GitHub. This folder's `.npmrc` sets `strict-ssl=false` for that. Pull the latest repo, then install again. `playwright is not recognized` only means the install did not finish.

## From scratch on another computer

You need Node 20+ and Git. No JDK. Sign in to GitHub first, because both repos are private.

```powershell
git clone https://github.com/sonawanejitendra-bsl/work-portal-tests.git
cd work-portal-tests
copy .env.example .env
npm install
npx playwright install chromium
npm run validate
```

`npm install` pulls `@core/playwright-framework` from https://github.com/sonawanejitendra-bsl/core-playwright-framework.

Open `playwright-report/dynamic/index.html`. Filter by tag (`@smoke`, `@heal`, `@api`, `@ui`). The Self-healing table should list the stale `save-party` suggestion.

Store passwords as GitHub secrets if you turn on Actions: `TEST_PASSWORD_OPERATOR`, `TEST_PASSWORD_REVIEWER`, optional `TEAMS_WEBHOOK`. Actions also needs access to the private core repo.

## Daily commands

| Command | What it does |
| --- | --- |
| `npm run validate` | typecheck, lint, MCP check, all tests |
| `npm test` | Playwright |
| `npm run test:smoke` | `@smoke` only |
| `npm run mcp:check` | Playwright MCP is installed |
| `npx playwright test --shard=1/2` | CI-style shard |

Specs import `{ test, expect }` from `@core/playwright-framework`.
