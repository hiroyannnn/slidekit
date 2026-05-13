import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PORT = 3456;
const BASE = `http://localhost:${PORT}`;

async function waitForServer(url: string, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await wait(500);
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`);
}

function listDeckIds(): string[] {
  // lib/decks/index.ts を AST 評価せず文字列で読んで、import 行から deck ファイル名を拾う。
  // tsx の JSX transform 問題を回避するため、コンポーネント import を経由しない。
  const indexPath = resolve(__dirname, "../lib/decks/index.ts");
  const source = readFileSync(indexPath, "utf8");
  const ids: string[] = [];
  for (const m of source.matchAll(/from\s+"\.\/([^"]+)"/g)) {
    if (m[1] !== "example") ids.push(m[1]);
  }
  return ids;
}

async function main() {
  const onlyArg = process.argv.slice(2).find((a) => !a.startsWith("-"));
  const allIds = listDeckIds();
  const targets = onlyArg ? [onlyArg] : allIds;

  if (onlyArg && !allIds.includes(onlyArg)) {
    console.error(`Deck not found in index.ts: ${onlyArg}`);
    console.error(`Available: ${allIds.join(", ")}`);
    process.exit(1);
  }

  console.log("→ Starting Next.js production server...");
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      DECK_DIST_DIR: ".next-build",
    },
  });

  try {
    await waitForServer(BASE);
    console.log("→ Server ready, launching browser...");

    const browser = await chromium.launch();
    const context = await browser.newContext({ deviceScaleFactor: 2 });
    const page = await context.newPage();

    for (const deckId of targets) {
      const url = `${BASE}/d/${deckId}?print=1`;
      const out = `slides-${deckId}.pdf`;
      console.log(`→ ${deckId}: ${url}`);

      const res = await page.goto(url, { waitUntil: "networkidle" });
      if (!res || !res.ok()) {
        console.error(`  ✗ ${deckId}: HTTP ${res?.status() ?? "no response"}`);
        continue;
      }
      // Ensure all webfonts are loaded before snapshot
      await page.evaluate(() => document.fonts.ready);

      await page.pdf({
        path: out,
        width: "1280px",
        height: "720px",
        printBackground: true,
        preferCSSPageSize: true,
        pageRanges: "1-",
      });
      console.log(`  ✓ ${out}`);
    }

    await browser.close();
    console.log(`✓ Done (${targets.length} deck${targets.length === 1 ? "" : "s"})`);
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
