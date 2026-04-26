import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

const PORT = 3456;
const URL = `http://localhost:${PORT}/?print=1`;
const OUTPUT = "slides.pdf";

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
  console.log("→ Starting Next.js production server...");
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });

  try {
    await waitForServer(URL);
    console.log("→ Server ready, launching browser...");

    const browser = await chromium.launch();
    const context = await browser.newContext({
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await page.goto(URL, { waitUntil: "networkidle" });
    // Ensure all webfonts are loaded before snapshot
    await page.evaluate(() => document.fonts.ready);

    console.log(`→ Generating PDF: ${OUTPUT}`);
    await page.pdf({
      path: OUTPUT,
      width: "1280px",
      height: "720px",
      printBackground: true,
      pageRanges: "1-",
    });

    await browser.close();
    console.log(`✓ Done: ${OUTPUT}`);
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
