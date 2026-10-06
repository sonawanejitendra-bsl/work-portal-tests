# Demo script

Run from this folder:

```powershell
npm test
```

Then open `playwright-report\dynamic\index.html`.

## 1. Auto-heal

Test: `healed sign-in opens Incident Case Inquiry`.

The test asks for a button named **Login**. JD Edwards only has **Sign In**. Recover mode clicks Sign In, then opens Health & Safety Incidents and Incident Case Inquiry. The grid shows no records and nothing is saved.

In the report, the Self-healing panel says the step was healed, names the old locator, the control that was clicked, and the score.

## 2. Playwright MCP

MCP is for writing a test, not for `npm test`.

1. In Cursor, confirm the playwright server in `.cursor/mcp.json` is connected.
2. Paste the prompt at the top of `tests/jde-mcp-example.spec.ts`.
3. MCP opens the real portal and reads the page. The file `tests/jde-mcp-example.spec.ts` is the test that comes back. It uses the same Sign In, Health & Safety Incidents, and Incident Case Inquiry names.

## 3. Dynamic report

Click a test row. The row opens the screenshot, the video, the trace file, and the log. The healing panel stays above the table.
