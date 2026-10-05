/**
 * Posts a short Adaptive Card if TEAMS_WEBHOOK is set. Otherwise exits 0.
 */
const webhook = process.env.TEAMS_WEBHOOK;
if (!webhook) {
  console.log("[teams] TEAMS_WEBHOOK is not set. Skipping.");
  process.exit(0);
}

const body = {
  type: "message",
  attachments: [
    {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: {
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        type: "AdaptiveCard",
        version: "1.4",
        body: [
          { type: "TextBlock", weight: "Bolder", text: "Work portal Playwright" },
          { type: "TextBlock", wrap: true, text: `Run finished in ${process.env.GITHUB_REPOSITORY ?? "local"} ${process.env.GITHUB_SHA ?? ""}` },
        ],
      },
    },
  ],
};

const response = await fetch(webhook, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
if (!response.ok) {
  console.error("[teams] webhook failed", response.status, await response.text());
  process.exit(1);
}
console.log("[teams] posted");
