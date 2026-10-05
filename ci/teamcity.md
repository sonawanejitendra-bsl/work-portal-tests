# TeamCity for this app test repo

The architecture deck showed TeamCity shards, PR status, and Teams. Those belong in the **app** pipeline, not in the core npm package.

## Build parameters (secure)

| Name | Example |
| --- | --- |
| `PROFILE` | `ci` |
| `HEALING_MODE` | `report` |
| `BROWSERS` | `chromium` |
| `TEST_USER_OPERATOR` | vault |
| `TEST_PASSWORD_OPERATOR` | vault |
| `TEST_USER_REVIEWER` | vault |
| `TEST_PASSWORD_REVIEWER` | vault |
| `TEAMS_WEBHOOK` | optional Incoming Webhook |

## Steps

1. Node 20
2. Install the core package (GitHub Packages, or `npm pack` from the core repo then `npm install path/to/tgz`)
3. `npm install`
4. `npx playwright install chromium`
5. `npm run typecheck && npm run lint && npm run mcp:check`
6. Two (or more) parallel build configurations:

```text
npx playwright test --shard=1/2
npx playwright test --shard=2/2
```

7. Artifact paths: `blob-report/**`, `playwright-report/dynamic/**`, `test-results/junit.xml`
8. A follow-up build downloads blob artifacts into `all-blob-reports/` and runs `npm run report:merge`
9. Optional: `node scripts/notify-teams.mjs` when `TEAMS_WEBHOOK` is set
10. Publish `test-results/junit.xml` as service messages / XML report

PowerShell equivalent of the test step:

```powershell
$env:CI = "true"
$env:PROFILE = "ci"
$env:HEALING_MODE = "report"
npx playwright test --shard=%shard.index%/%shard.total%
```
