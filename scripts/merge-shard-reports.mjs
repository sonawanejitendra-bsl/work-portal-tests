/**
 * After sharded CI jobs, merge blob reports and stitch dynamic JSON if present.
 * Usage: node scripts/merge-shard-reports.mjs
 */
import { mkdir, readdir, readFile, writeFile, cp } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const blobDir = path.join(root, "all-blob-reports");
const outDir = path.join(root, "playwright-report");

async function collectHealing() {
  const shards = path.join(root, "all-dynamic-reports");
  let entries = [];
  try {
    entries = await readdir(shards, { withFileTypes: true });
  } catch {
    return;
  }
  const healing = [];
  for (const entry of entries) {
    const file = path.join(shards, entry.name, "healing.json");
    try {
      const rows = JSON.parse(await readFile(file, "utf8"));
      if (Array.isArray(rows)) healing.push(...rows);
    } catch {
      /* shard had no healing file */
    }
  }
  await mkdir(path.join(outDir, "dynamic"), { recursive: true });
  await writeFile(path.join(outDir, "dynamic", "healing.json"), JSON.stringify(healing, null, 2), "utf8");
  console.log(`[report:merge] combined ${healing.length} healing events`);
}

const merge = spawnSync("npx", ["playwright", "merge-reports", blobDir, "--reporter", "html"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, PLAYWRIGHT_HTML_REPORT: outDir },
});
if (merge.status !== 0) {
  console.error("[report:merge] playwright merge-reports failed. Ensure blob-report artifacts were downloaded into all-blob-reports/");
  process.exit(merge.status ?? 1);
}

await collectHealing();
try {
  await cp(path.join(root, "all-dynamic-reports"), path.join(outDir, "dynamic-shards"), { recursive: true });
} catch {
  /* optional */
}
console.log("[report:merge] HTML report is under playwright-report/");
