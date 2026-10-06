# Demo script

Screenshots and traces are saved. Video is off, so ffmpeg is not required. Edge is already used, so Chromium is not required.

```powershell
git pull
npm install
npm run demo
npm run report
```

`npm run report` opens `playwright-report\dynamic\index.html`. It does not use port 9323. Skip `npx playwright show-report` while that port is already taken.

## 1. Auto-heal

Test: `healed sign-in opens Incident Case Inquiry`.

The test asks for a button named **Login**. JD Edwards only has **Sign In**. Recover mode clicks Sign In, then opens Health & Safety Incidents and Incident Case Inquiry. The grid shows no records and nothing is saved.

In the report, the Self-healing panel says the step was healed, names the old locator, the control that was clicked, and the score.

## 2. Playwright MCP

MCP writes a test. It does not run `npm test`.

Show this in VS Code with GitHub Copilot. Copilot starts Playwright MCP from `.vscode/mcp.json`.

1. Open this folder in VS Code and start a Copilot chat.
2. Paste the prompt at the top of `tests/jde-mcp-example.spec.ts`.
3. Copilot calls the MCP browser tools: it opens the sign-in page, reads the snapshot, and clicks **Health & Safety Incidents**, then **Incident Case Inquiry**.
4. The file `tests/jde-mcp-example.spec.ts` is the test that comes back. It signs in with the real Sign In button and opens the same inquiry. Nothing is saved. Auto-heal is the other test, where the old Login button is missing.

## 3. Dynamic report

Click a test row. The row opens the screenshot, the video, the trace file, and the log. The healing panel stays above the table.
