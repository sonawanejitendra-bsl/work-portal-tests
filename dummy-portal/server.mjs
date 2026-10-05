/**
 * Standalone work portal used by this app test repo.
 * When you point tests at real QA, delete this folder and change baseURL.
 */
import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORTAL_PORT ?? 4174);
const parties = new Map([
  ["P-1001", { id: "P-1001", name: "Jordan Lee", province: "SK", status: "Active" }],
  ["P-2002", { id: "P-2002", name: "Alex Patel", province: "MB", status: "Active" }],
]);
const workItems = [
  { id: "WI-1001", title: "Review file", status: "Open" },
  { id: "WI-2002", title: "Close file", status: "Done" },
];
const records = new Map();

function shell(title, user, body) {
  const who = user ?? "guest";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { margin: 0; font-family: Segoe UI, Arial, sans-serif; display: flex; min-height: 100vh; color: #14233C; }
    nav { width: 200px; background: #14233C; color: #fff; padding: 16px; }
    nav a, nav button { display: block; color: #fff; background: none; border: 0; text-align: left; padding: 8px 0; cursor: pointer; text-decoration: none; font: inherit; }
    main { padding: 24px; flex: 1; }
    table { border-collapse: collapse; }
    td, th { border: 1px solid #D7E1EC; padding: 6px 10px; }
    label { display: block; margin: 8px 0; }
  </style>
</head>
<body>
  <nav data-testid="left-nav">
    <strong>Work portal</strong>
    <a data-testid="nav-home" href="/home">Home</a>
    <a data-testid="nav-search" href="/search">Search</a>
    <a data-testid="nav-queue" href="/queue">Work queue</a>
    <a data-testid="nav-party" href="/party">Party</a>
    <a data-testid="nav-documents" href="/documents">Documents</a>
    <button type="button" id="nav-help" data-testid="nav-help">Help</button>
  </nav>
  <main>
    <div id="app-ready" data-testid="app-ready">Ready</div>
    ${body}
  </main>
  <script>
    const help = document.getElementById("nav-help");
    if (help) help.onclick = () => window.open("/help", "help");
  </script>
</body>
</html>`;
}

function html(title, body) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>${title}</title></head><body>${body}</body></html>`;
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...rest] = part.split("=");
        return [key, rest.join("=")];
      }),
  );
}

function send(res, status, body, headers = {}) {
  const isHtml = typeof body === "string" && body.startsWith("<");
  res.writeHead(status, { "content-type": isHtml ? "text/html" : "application/json", ...headers });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function readJson(req) {
  return new Promise(async (resolve) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    resolve(raw ? JSON.parse(raw) : {});
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  const user = parseCookies(req.headers.cookie).session;

  if (req.method === "GET" && url.pathname === "/login") {
    return send(
      res,
      200,
      html(
        "Login",
        `<h1>Work portal login</h1>
         <form method="post" action="/login">
           <label for="username">Username</label>
           <input id="username" name="username" />
           <label for="password">Password</label>
           <input id="password" name="password" type="password" />
           <label for="mfa">MFA code</label>
           <input id="mfa" name="mfa" />
           <button type="submit">Sign in</button>
         </form>`,
      ),
    );
  }

  if (req.method === "POST" && url.pathname === "/login") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const params = new URLSearchParams(Buffer.concat(chunks).toString());
    const username = params.get("username") ?? "";
    const password = params.get("password") ?? "";
    if (!username || !password) return send(res, 401, html("Login", "<p>Missing credentials</p>"));
    res.writeHead(302, {
      location: "/home",
      "set-cookie": `session=${username}; Path=/; HttpOnly`,
    });
    return res.end();
  }

  if (url.pathname === "/api/me") {
    if (!user) return send(res, 401, { error: "no session" });
    return send(res, 200, {
      username: user,
      role: user.includes("reviewer") ? "reviewer" : "operator",
    });
  }

  if (req.method === "GET" && url.pathname === "/api/parties") {
    return send(res, 200, [...parties.values()]);
  }

  if (req.method === "GET" && url.pathname === "/api/vendor/status") {
    return send(res, 200, { status: "live" });
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/")) {
    const type = url.pathname.replace("/api/", "");
    const payload = await readJson(req);
    const id = payload.id ?? payload.name ?? `${type}-${Date.now()}`;
    records.set(`${type}:${id}`, payload);
    if (type === "party") parties.set(id, { id, name: payload.name, province: payload.province, status: "Active" });
    return send(res, 201, { id, ...payload });
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/")) {
    const parts = url.pathname.split("/").filter(Boolean);
    records.delete(`${parts[1]}:${parts[2]}`);
    parties.delete(parts[2]);
    return send(res, 204, "");
  }

  if (url.pathname === "/home") {
    return send(
      res,
      200,
      shell(
        "Home",
        user,
        `<h1>Welcome ${user ?? "guest"}</h1>
         <p data-testid="home-copy">Search a party, open the work queue, or add a document.</p>`,
      ),
    );
  }

  if (url.pathname === "/search") {
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const rows = [...parties.values()].filter((row) => !q || row.name.toLowerCase().includes(q));
    const table = rows.map((row) => `<tr data-testid="party-row"><td>${row.id}</td><td>${row.name}</td><td>${row.province}</td></tr>`).join("");
    return send(
      res,
      200,
      shell(
        "Search",
        user,
        `<h1>Search party</h1>
         <form method="get" action="/search">
           <label for="party-name">Party name</label>
           <input id="party-name" name="q" data-testid="party-name" value="${url.searchParams.get("q") ?? ""}" />
           <button type="submit" data-testid="search-submit">Search</button>
         </form>
         <table data-testid="search-results"><thead><tr><th>Id</th><th>Name</th><th>Province</th></tr></thead><tbody>${table}</tbody></table>`,
      ),
    );
  }

  if (url.pathname === "/queue") {
    const rows = workItems.map((row) => `<tr><td>${row.id}</td><td>${row.title}</td><td>${row.status}</td></tr>`).join("");
    return send(
      res,
      200,
      shell(
        "Queue",
        user,
        `<h1>Work queue</h1>
         <div data-testid="data-grid">
           <label>Filter <input data-testid="queue-filter" /></label>
           <button type="button">Sort Id</button>
           <button type="button">Page 2</button>
           <table><thead><tr><th>Id</th><th>Title</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
         </div>`,
      ),
    );
  }

  if (url.pathname === "/party") {
    return send(
      res,
      200,
      shell(
        "Party",
        user,
        `<h1>Party</h1>
         <label>Full name <input data-testid="party-full-name" /></label>
         <label>Province <input data-testid="party-province" /></label>
         <button type="button" data-testid="save-party" role="button" aria-label="Save party">Save party</button>
         <p data-testid="party-status"></p>
         <script>
           document.querySelector('[data-testid="save-party"]').addEventListener("click", () => {
             document.querySelector('[data-testid="party-status"]').textContent = "Party saved";
           });
         </script>`,
      ),
    );
  }

  if (url.pathname === "/healing") {
    return send(
      res,
      200,
      shell(
        "Healing",
        user,
        `<h1>Stale locator demo</h1>
         <p>The old test id old-save is gone. The live button is save-party.</p>
         <button type="button" data-testid="save-party" role="button" aria-label="Save party">Save party</button>`,
      ),
    );
  }

  if (url.pathname === "/documents") {
    return send(
      res,
      200,
      shell(
        "Documents",
        user,
        `<h1>Documents</h1>
         <input data-testid="upload-doc" type="file" />
         <a href="/download" download="note.txt"><button type="button">Download file</button></a>
         <p data-testid="upload-hint">Choose a file to attach.</p>`,
      ),
    );
  }

  if (url.pathname === "/download") {
    res.writeHead(200, { "content-type": "text/plain", "content-disposition": "attachment; filename=note.txt" });
    return res.end("portal document");
  }

  if (url.pathname === "/help") {
    return send(res, 200, html("Help", `<h1>Help window</h1><p data-testid="help-copy">Left menu, search, queue, party, documents.</p>`));
  }

  if (url.pathname === "/embed") {
    return send(res, 200, shell("Embed", user, `<h1>Nested screens</h1><iframe id="main" src="/embed-mid"></iframe>`));
  }
  if (url.pathname === "/embed-mid") {
    return send(res, 200, html("Mid", `<iframe id="content" src="/embed-inner"></iframe>`));
  }
  if (url.pathname === "/embed-inner") {
    return send(res, 200, html("Inner", `<p data-testid="inside-frame">Inside nested frame</p>`));
  }

  if (url.pathname === "/overlay") {
    return send(
      res,
      200,
      shell(
        "Overlay",
        user,
        `<div data-testid="loader">Loading</div>
         <p data-testid="result" hidden>Done</p>
         <script>
           setTimeout(() => {
             document.querySelector('[data-testid="loader"]').style.display = "none";
             document.querySelector('[data-testid="result"]').hidden = false;
           }, 200);
         </script>`,
      ),
    );
  }

  if (url.pathname === "/vendor-status") {
    return send(
      res,
      200,
      shell(
        "Vendor",
        user,
        `<h1>Vendor status</h1>
         <p data-testid="vendor">waiting</p>
         <script>fetch("/api/vendor/status").then((r)=>r.json()).then((d)=>{document.querySelector('[data-testid="vendor"]').textContent=d.status})</script>`,
      ),
    );
  }

  send(res, 404, { error: "not found", path: url.pathname });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`work portal on http://127.0.0.1:${PORT}`);
});
