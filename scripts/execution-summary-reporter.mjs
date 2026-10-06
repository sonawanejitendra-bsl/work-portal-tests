import { mkdirSync, writeFileSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Writes playwright-report/dynamic/index.html from this test repo.
 * It does not use the report page shipped inside node_modules.
 */
export default class ExecutionSummaryReporter {
  constructor() {
    this.pending = [];
    this.mediaCount = 0;
    this.outputDir = path.resolve(process.cwd(), "playwright-report", "dynamic");
  }

  onBegin() {
    this.pending = [];
    this.mediaCount = 0;
    const file = path.resolve(process.cwd(), "test-results", "healing-events.jsonl");
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, "", "utf8");
  }

  onTestEnd(test, result) {
    const logs = [textOf(result.stdout), textOf(result.stderr)].filter(Boolean).join("\n");
    const error = (result.errors || [])
      .map((item) => item.message ?? item.stack ?? "")
      .filter(Boolean)
      .join("\n\n");
    const files = [];
    for (const attachment of result.attachments || []) {
      const kind = assetKind(attachment.name, attachment.contentType);
      if (!kind) continue;
      files.push({
        kind,
        label: attachment.name,
        source: attachment.path,
        body: attachment.path ? undefined : attachment.body,
        contentType: attachment.contentType,
      });
    }
    this.pending.push({
      row: {
        title: test.title,
        file: test.location?.file ?? "",
        project: test.parent?.project()?.name ?? "default",
        status: result.status,
        tags: test.tags ?? [],
        durationMs: result.duration,
        app: process.env.APP || "jde",
        error,
        logs,
      },
      files,
    });
  }

  async onEnd() {
    const mediaDir = path.join(this.outputDir, "media");
    await mkdir(mediaDir, { recursive: true });
    const tests = [];
    for (const item of this.pending) {
      const assets = [];
      for (const file of item.files) {
        const saved = await copyAsset(mediaDir, file, () => this.mediaCount++);
        if (saved) assets.push(saved);
      }
      tests.push({ ...item.row, assets });
    }
    const healing = await readHealing();
    const payload = {
      generatedAt: new Date().toISOString(),
      app: process.env.APP || "jde",
      profile: process.env.PROFILE || "local",
      environment: process.env.ENV_NAME || "qa",
      healingMode: process.env.HEALING_MODE || "recover",
      tests,
      healing,
      summary: {
        total: tests.length,
        passed: tests.filter((row) => row.status === "passed").length,
        failed: tests.filter((row) => row.status === "failed").length,
        skipped: tests.filter((row) => row.status === "skipped" || row.status === "interrupted").length,
        healed: healing.filter((item) => item.applied).length,
        suggested: healing.filter((item) => !item.applied && (item.suggestions || []).length > 0).length,
      },
    };
    const historyFile = path.join(this.outputDir, "history.json");
    payload.history = await rememberHistory(historyFile, {
      at: payload.generatedAt,
      total: payload.summary.total,
      passed: payload.summary.passed,
      failed: payload.summary.failed,
      healed: payload.summary.healed,
    });
    await mkdir(this.outputDir, { recursive: true });
    const htmlFile = path.join(this.outputDir, "index.html");
    await writeFile(path.join(this.outputDir, "report.json"), JSON.stringify(payload, null, 2), "utf8");
    await writeFile(htmlFile, buildHtml(payload), "utf8");
    await writeFile(path.join(this.outputDir, "healing.json"), JSON.stringify(healing, null, 2), "utf8");
    await writeFile(historyFile, JSON.stringify(payload.history, null, 2), "utf8");
    console.log(`Execution summary report: ${htmlFile}`);
  }
}

function textOf(chunks) {
  return (chunks || [])
    .map((chunk) => (typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8")))
    .join("")
    .trim();
}

function assetKind(name, contentType) {
  const label = String(name || "").toLowerCase();
  const type = String(contentType || "").toLowerCase();
  if (type.startsWith("image/") || label.includes("screenshot")) return "image";
  if (type.startsWith("video/") || label === "video") return "video";
  if (label === "trace" || type.includes("zip")) return "trace";
  if (type.startsWith("text/") || label.includes("error") || label.includes("log")) return "log";
  return null;
}

function extensionFor(contentType, filePath) {
  if (filePath) {
    const ext = path.extname(filePath);
    if (ext && ext.length <= 8) return ext;
  }
  if (String(contentType).includes("png")) return ".png";
  if (String(contentType).includes("jpeg")) return ".jpg";
  if (String(contentType).includes("zip")) return ".zip";
  if (String(contentType).startsWith("text/")) return ".txt";
  return ".bin";
}

async function copyAsset(mediaDir, file, nextCount) {
  if (!file.source && !file.body) return null;
  const ext = extensionFor(file.contentType, file.source);
  const base = `${nextCount()}-${String(file.label).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "file"}`;
  const filename = `${base}${ext}`;
  const dest = path.join(mediaDir, filename);
  if (file.source) await copyFile(file.source, dest);
  else await writeFile(dest, file.body);
  return { kind: file.kind, label: file.label, href: `media/${filename}` };
}

async function readHealing() {
  try {
    const raw = await readFile(path.resolve(process.cwd(), "test-results", "healing-events.jsonl"), "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

async function rememberHistory(file, point) {
  let previous = [];
  try {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    if (Array.isArray(parsed)) previous = parsed;
  } catch {
    previous = [];
  }
  return [...previous, point].slice(-10);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildHtml(payload) {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Execution summary — ${escapeHtml(payload.app)}</title>
  <style>
    :root { --navy:#14233C; --blue:#1B5EA8; --bg:#F4F7FB; --ink:#1C2B3A; --muted:#5C6B7A; --line:#E2E8F0; --pass:#1B7A4A; --fail:#B42318; --gold:#F6C445; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Segoe UI, Arial, sans-serif; background: var(--bg); color: var(--ink); }
    .banner { background: var(--gold); color: var(--navy); padding: 22px 28px 18px; }
    .eyebrow { margin: 0; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; }
    h1 { margin: 6px 0 0; font-size: 32px; }
    .sub { margin: 4px 0 12px; }
    .top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .badge { background: var(--pass); color: #fff; border-radius: 10px; padding: 10px 14px; font-weight: 700; }
    .badge.bad { background: var(--fail); }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { background: rgba(20,35,60,.08); border-radius: 8px; padding: 6px 10px; font-size: 12px; }
    .chip b { display: block; font-size: 13px; }
    main { max-width: 1180px; margin: 0 auto; padding: 18px 20px 48px; }
    .kpis { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-bottom: 14px; }
    .kpi { background: #fff; border: 1px solid var(--line); border-top: 3px solid var(--blue); border-radius: 10px; padding: 12px; }
    .kpi.pass { border-top-color: var(--pass); } .kpi.fail { border-top-color: var(--fail); }
    .kpi span { display: block; color: var(--muted); font-size: 11px; letter-spacing: .04em; text-transform: uppercase; }
    .kpi b { font-size: 26px; } .kpi small { color: var(--muted); }
    .split { display: grid; grid-template-columns: 280px 1fr; gap: 12px; }
    .panel { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; }
    .panel h2 { margin: 0 0 4px; font-size: 18px; }
    .lead { margin: 0 0 12px; color: var(--muted); font-size: 14px; }
    .donut-wrap { display: flex; gap: 14px; align-items: center; }
    .legend { font-size: 13px; color: var(--muted); }
    .legend i { display: inline-block; width: 8px; height: 8px; border-radius: 99px; margin-right: 6px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: top; font-size: 13px; }
    th { font-size: 11px; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); }
    code { font-family: Consolas, monospace; font-size: 12px; word-break: break-word; }
    .ok { color: var(--pass); font-weight: 700; }
    .filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
    label { font-size: 11px; color: var(--muted); display: block; margin-bottom: 4px; }
    select, input { padding: 7px 8px; min-width: 140px; border: 1px solid var(--line); border-radius: 8px; font: inherit; background: #fff; }
    tr.test-row { cursor: pointer; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 12px; font-weight: 650; background: #EEF2F6; }
    .pill.pass { color: var(--pass); background: #E7F6EE; } .pill.fail { color: var(--fail); background: #FDECEC; }
    .thumbs { display: flex; gap: 6px; flex-wrap: wrap; }
    .thumbs img { width: 72px; height: 48px; object-fit: cover; border: 1px solid var(--line); border-radius: 4px; background: #0E1726; }
    .detail td { background: #F8FAFC; }
    img.full, video { max-width: min(720px, 100%); border: 1px solid var(--line); border-radius: 8px; background: #0E1726; }
    pre { white-space: pre-wrap; background: var(--navy); color: #E8EEF4; padding: 12px; border-radius: 8px; max-height: 200px; overflow: auto; }
    .trend { background: #F8FAFC; border: 1px solid var(--line); border-radius: 10px; padding: 8px 8px 0; }
    .runs { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 8px; margin-top: 12px; }
    .run { border: 1px solid var(--line); border-top: 3px solid var(--pass); border-radius: 8px; padding: 8px; background: #fff; }
    .run.fail { border-top-color: var(--fail); }
    .run.mid { border-top-color: #C47B00; }
    .run span, .run small { display: block; color: var(--muted); font-size: 11px; }
    .run b { font-size: 18px; }
    .gates { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .gate { border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
    .gate b { color: var(--pass); }
    .muted { color: var(--muted); }
    a { color: var(--blue); }
    @media (max-width: 980px) { .kpis, .split, .gates { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body data-layout="execution-summary">
  <header class="banner">
    <div class="top">
      <div>
        <p class="eyebrow">Core Playwright · Execution summary</p>
        <h1>Test execution report</h1>
        <p class="sub">${escapeHtml(payload.app)} · rule-based healing, not AI</p>
      </div>
      <div class="badge" id="gate">Quality gate</div>
    </div>
    <div class="chips">
      <div class="chip">Environment<b>${escapeHtml(payload.environment)}</b></div>
      <div class="chip">Profile<b>${escapeHtml(payload.profile)}</b></div>
      <div class="chip">Healing<b>${escapeHtml(payload.healingMode)}</b></div>
      <div class="chip">Generated<b>${escapeHtml(payload.generatedAt)}</b></div>
    </div>
  </header>
  <main>
    <section class="kpis" id="cards"></section>
    <section class="split">
      <article class="panel" id="rate"></article>
      <article class="panel">
        <h2>Self-healing</h2>
        <p class="lead">The test names the control it expected. When that control is missing, recover mode clicks the best match.</p>
        <div id="heal-stories"></div>
      </article>
    </section>
    <section class="panel">
      <h2>Healing detail</h2>
      <table>
        <thead><tr><th>Step</th><th>Looked for</th><th>Clicked instead</th><th>Score</th><th>Result</th></tr></thead>
        <tbody id="heal"></tbody>
      </table>
    </section>
    <section class="panel">
      <h2>Quality gates</h2>
      <div class="gates" id="gates"></div>
    </section>
    <section class="panel">
      <h2>Recent runs</h2>
      <p class="lead">Pass rate for the last 10 runs saved on this machine. Green is 90% or higher.</p>
      <div id="trend"></div>
    </section>
    <section class="panel">
      <h2>Tests</h2>
      <p class="lead">Open a row for the full screenshot, trace, and log. Evidence is listed on each row.</p>
      <div class="filters">
        <div><label for="f-app">App</label><select id="f-app"></select></div>
        <div><label for="f-tag">Tag</label><select id="f-tag"></select></div>
        <div><label for="f-browser">Browser / project</label><select id="f-browser"></select></div>
        <div><label for="f-status">Status</label><select id="f-status"></select></div>
        <div><label for="f-text">Title contains</label><input id="f-text" placeholder="filter text" /></div>
      </div>
      <table>
        <thead><tr><th>Test</th><th>Status</th><th>Browser</th><th>Duration</th><th>Evidence</th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </section>
  </main>
  <script>
    const data = ${json};
    const $ = (id) => document.getElementById(id);
    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }
    function unique(values) { return [...new Set(values)].sort(); }
    function fill(select, values) {
      select.innerHTML = '<option value="">All</option>' + values.map((v) => '<option>' + esc(v) + '</option>').join('');
    }
    function fileName(file) {
      const parts = String(file || '').split(/[/\\\\]/);
      return parts[parts.length - 1] || '';
    }
    function duration(ms) {
      const n = Number(ms) || 0;
      if (n < 1000) return n + ' ms';
      const s = Math.round(n / 1000);
      return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
    }
    function pill(status) {
      const tone = status === 'passed' ? 'pass' : status === 'failed' ? 'fail' : '';
      return '<span class="pill ' + tone + '">' + esc(status) + '</span>';
    }
    fill($('f-app'), unique(data.tests.map((t) => t.app)));
    fill($('f-tag'), unique(data.tests.flatMap((t) => t.tags || [])));
    fill($('f-browser'), unique(data.tests.map((t) => t.project)));
    fill($('f-status'), unique(data.tests.map((t) => t.status)));
    function visible(row) {
      if ($('f-app').value && row.app !== $('f-app').value) return false;
      if ($('f-tag').value && !(row.tags || []).includes($('f-tag').value)) return false;
      if ($('f-browser').value && row.project !== $('f-browser').value) return false;
      if ($('f-status').value && row.status !== $('f-status').value) return false;
      const text = $('f-text').value.toLowerCase();
      if (text && !row.title.toLowerCase().includes(text)) return false;
      return true;
    }
    function shots(row) { return (row.assets || []).filter((a) => a.kind === 'image'); }
    function evidenceLabel(row) {
      const assets = row.assets || [];
      const parts = [];
      if (shots(row).length) parts.push('screenshot');
      if (assets.some((a) => a.kind === 'trace')) parts.push('trace');
      if (row.logs || row.error) parts.push('log');
      return parts.join(' · ') || '—';
    }
    function evidenceHtml(row) {
      const assets = row.assets || [];
      const images = shots(row);
      const videos = assets.filter((a) => a.kind === 'video');
      const traces = assets.filter((a) => a.kind === 'trace');
      const logText = [row.error, row.logs].filter(Boolean).join('\\n\\n');
      if (!images.length && !videos.length && !traces.length && !logText) {
        return '<p class="muted">No screenshot, trace, or log was saved for this test.</p>';
      }
      return '<div class="evidence">' + [
        images.length ? '<div class="block"><h3>Screenshot</h3>' + images.map((a) => '<p><a href="' + esc(a.href) + '" target="_blank"><img class="full" src="' + esc(a.href) + '" alt="' + esc(a.label) + '"></a></p>').join('') + '</div>' : '',
        videos.length ? '<div class="block"><h3>Video</h3>' + videos.map((a) => '<video controls src="' + esc(a.href) + '"></video>').join('') + '</div>' : '',
        traces.length ? '<div class="block"><h3>Trace</h3><p>' + traces.map((a) => '<a href="' + esc(a.href) + '">' + esc(a.label) + '</a>').join(', ') + '</p></div>' : '',
        logText ? '<div class="block"><h3>Log</h3><pre>' + esc(logText) + '</pre></div>' : '',
      ].join('') + '</div>';
    }
    function render() {
      const rows = data.tests.filter(visible);
      const s = data.summary;
      const totalMs = data.tests.reduce((sum, row) => sum + (Number(row.durationMs) || 0), 0);
      const withEvidence = data.tests.filter((row) => (row.assets || []).some((a) => a.kind === 'image' || a.kind === 'trace')).length;
      const evidencePct = s.total ? Math.round((withEvidence / s.total) * 100) : 0;
      const passPct = s.total ? Math.round((s.passed / s.total) * 100) : 0;
      const gate = $('gate');
      gate.textContent = s.failed === 0 ? 'Quality gate passed' : 'Quality gate failed';
      gate.className = 'badge' + (s.failed === 0 ? '' : ' bad');
      $('cards').innerHTML = [
        ['Total', s.total, '', ''],
        ['Passed', s.passed, 'pass', passPct + '%'],
        ['Failed', s.failed, 'fail', ''],
        ['Skipped', s.skipped, '', ''],
        ['Healed', s.healed, '', ''],
        ['Duration', duration(totalMs), '', ''],
        ['Evidence', evidencePct + '%', '', 'screenshot or trace'],
      ].map(([k, v, tone, note]) => '<div class="kpi ' + tone + '"><span>' + k + '</span><b>' + v + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</div>').join('');
      const c = 2 * Math.PI * 42;
      const dash = (passPct / 100) * c;
      $('rate').innerHTML = '<h2>Pass rate</h2><div class="donut-wrap"><svg viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="42" fill="none" stroke="#E4EEF8" stroke-width="12"/><circle cx="60" cy="60" r="42" fill="none" stroke="#1B7A4A" stroke-width="12" stroke-dasharray="' + dash + ' ' + (c - dash) + '" transform="rotate(-90 60 60)"/><text x="60" y="66" text-anchor="middle" font-size="22" font-family="Segoe UI" fill="#14233C">' + passPct + '%</text></svg><div class="legend"><div><i style="background:#1B7A4A"></i>Passed ' + s.passed + '</div><div><i style="background:#B42318"></i>Failed ' + s.failed + '</div><div><i style="background:#E4EEF8"></i>Skipped ' + s.skipped + '</div></div></div>';
      $('heal').innerHTML = (data.healing || []).map((h) => {
        const best = (h.suggestions || [])[0];
        return '<tr><td>' + esc(h.intentId) + '</td><td><code>' + esc(h.missed || '') + '</code></td><td>' +
          esc(best && best.match ? best.match : '') + '</td><td>' + esc(best ? best.score + ' · ' + best.reason : '') +
          '</td><td class="' + (h.applied ? 'ok' : '') + '">' + (h.applied ? 'Healed' : 'Suggestion only') + '</td></tr>';
      }).join('') || '<tr><td colspan="5" class="muted">No locator was replaced in this run.</td></tr>';
      $('heal-stories').innerHTML = (data.healing || []).filter((h) => h.applied).map((h) => {
        const best = (h.suggestions || [])[0] || {};
        return '<p>Healed <b>' + esc(h.intentId) + '</b>. Looked for <code>' + esc(h.missed || 'the old control') +
          '</code> and clicked <b>' + esc(best.match || 'the best match') + '</b> (' + esc(best.score) + ').</p>';
      }).join('') || '<p class="muted">No healed step in this run.</p>';
      const minutes = Math.round(totalMs / 60000);
      $('gates').innerHTML = [
        ['Pass rate', passPct + '%', passPct >= 90],
        ['Failed tests', String(s.failed), s.failed === 0],
        ['Healed steps', String(s.healed), true],
        ['Evidence', evidencePct + '%', evidencePct === 100 || s.failed === 0],
        ['Duration', minutes + ' min', minutes <= 25],
      ].map(([name, actual, ok]) => '<div class="gate"><div>' + name + '</div><b>' + (ok ? 'Passed' : 'Failed') + '</b><div>' + actual + '</div></div>').join('');
      const history = (data.history && data.history.length ? data.history : [{ passed: s.passed, total: s.total, failed: s.failed }]).slice(-10);
      $('trend').innerHTML = trendChart(history);
      $('rows').innerHTML = rows.map((r, index) => {
        const thumbs = shots(r).slice(0, 6).map((a) => '<img src="' + esc(a.href) + '" alt="' + esc(a.label) + '">').join('');
        return '<tr class="test-row" data-i="' + index + '"><td>' + esc(r.title) + '<div class="muted">' + esc(fileName(r.file)) + ' · ' + esc(r.app) + '</div></td><td>' +
          pill(r.status) + '</td><td>' + esc(r.project) + '</td><td>' + duration(r.durationMs) + '</td><td><div class="thumbs">' + thumbs +
          '</div><div class="muted">' + esc(evidenceLabel(r)) + '</div></td></tr><tr class="detail" id="d-' + index + '" hidden><td colspan="5">' + evidenceHtml(r) + '</td></tr>';
      }).join('') || '<tr><td colspan="5" class="muted">No tests match these filters.</td></tr>';
      document.querySelectorAll('.test-row').forEach((tr) => {
        tr.addEventListener('click', () => {
          const detail = document.getElementById('d-' + tr.getAttribute('data-i'));
          detail.hidden = !detail.hidden;
        });
      });
    }
    function trendChart(history) {
      const w = 640, h = 168, padL = 36, padR = 12, padT = 22, padB = 28;
      const innerW = w - padL - padR;
      const innerH = h - padT - padB;
      const n = history.length;
      const rateOf = (point) => point.total ? Math.round((point.passed / point.total) * 100) : 0;
      const rates = history.map(rateOf);
      const x = (i) => n === 1 ? padL + innerW / 2 : padL + (innerW * i) / (n - 1);
      const y = (rate) => padT + innerH - (rate / 100) * innerH;
      const grids = [0, 50, 100].map((mark) => {
        const gy = y(mark);
        return '<line x1="' + padL + '" y1="' + gy + '" x2="' + (w - padR) + '" y2="' + gy + '" stroke="#E2E8F0"/>' +
          '<text x="' + (padL - 6) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11" fill="#5C6B7A">' + mark + '</text>';
      }).join('');
      const line = n > 1 ? '<polyline points="' + rates.map((rate, i) => x(i) + ',' + y(rate)).join(' ') + '" fill="none" stroke="#1F8A70" stroke-width="2.5"/>' : '';
      const area = n > 1
        ? '<path d="M ' + x(0) + ' ' + (padT + innerH) + ' ' + rates.map((rate, i) => 'L ' + x(i) + ' ' + y(rate)).join(' ') + ' L ' + x(n - 1) + ' ' + (padT + innerH) + ' Z" fill="#1F8A70" opacity="0.12"/>'
        : '';
      const dots = rates.map((rate, i) => {
        const color = rate >= 90 ? '#1B7A4A' : rate === 0 ? '#B42318' : '#C47B00';
        return '<circle cx="' + x(i) + '" cy="' + y(rate) + '" r="5" fill="' + color + '" stroke="#fff" stroke-width="2"/>' +
          '<text x="' + x(i) + '" y="' + (y(rate) - 10) + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + color + '">' + rate + '%</text>';
      }).join('');
      const cards = history.map((point, i) => {
        const rate = rates[i];
        const tone = rate >= 90 ? 'pass' : rate === 0 ? 'fail' : 'mid';
        const when = point.at ? String(point.at).slice(5, 16).replace('T', ' ') : '';
        return '<div class="run ' + tone + '"><span>Run ' + (i + 1) + (when ? ' · ' + when : '') + '</span><b>' + rate + '%</b><small>' +
          (Number(point.passed) || 0) + '/' + (Number(point.total) || 0) + ' passed · ' + (Number(point.failed) || 0) + ' failed</small></div>';
      }).join('');
      return '<div class="trend"><svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="180" role="img" aria-label="Pass rate over recent runs">' +
        grids + area + line + dots + '</svg></div><div class="runs">' + cards + '</div>';
    }
    ['f-app','f-tag','f-browser','f-status','f-text'].forEach((id) => $(id).addEventListener('input', render));
    render();
  </script>
</body>
</html>`;
}
