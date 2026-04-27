import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { decks } from "../lib/decks";

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

async function main() {
  if (decks.length === 0) {
    console.error("No decks defined in lib/decks/index.ts");
    process.exit(1);
  }

  const onlyArg = process.argv.slice(2).find((a) => !a.startsWith("-"));
  const targets = onlyArg
    ? decks.filter((d) => d.id === onlyArg)
    : decks;

  if (onlyArg && targets.length === 0) {
    console.error(`Deck not found: ${onlyArg}`);
    console.error(`Available: ${decks.map((d) => d.id).join(", ")}`);
    process.exit(1);
  }

  console.log("→ Starting Next.js production server...");
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });

  try {
    await waitForServer(BASE);
    console.log("→ Server ready, launching browser...");

    const browser = await chromium.launch();
    const context = await browser.newContext({ deviceScaleFactor: 2 });
    const page = await context.newPage();

    for (const deck of targets) {
      const url = `${BASE}/d/${deck.id}?print=1`;
      const out = `slides-${deck.id}.pdf`;
      console.log(`→ ${deck.id}: ${url}`);

      await page.goto(url, { waitUntil: "networkidle" });
      // Ensure all webfonts are loaded before snapshot
      await page.evaluate(() => document.fonts.ready);

      await page.pdf({
        path: out,
        width: "1280px",
        height: "720px",
        printBackground: true,
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
