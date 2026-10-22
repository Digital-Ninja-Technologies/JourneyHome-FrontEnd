import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../.migration-baseline/screenshots-final");
const baselineDir = path.resolve(__dirname, "../.migration-baseline/screenshots");

fs.mkdirSync(outputDir, { recursive: true });

const pages = [
  { name: "home", path: "/" },
  { name: "how-it-works", path: "/how-it-works" },
  { name: "pricing", path: "/pricing" },
  { name: "about", path: "/about" },
  { name: "faq", path: "/faq" },
  { name: "contact", path: "/contact" },
  { name: "terms", path: "/terms" },
  { name: "privacy", path: "/privacy" },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });
  console.log("Starting Stage 8 final screenshot capture on port 3000...\n");

  for (const p of pages) {
    // Desktop
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`http://localhost:3000${p.path}`, { waitUntil: "networkidle" });
    const desktopFile = `${p.name}-desktop.png`;
    await desktopPage.screenshot({ path: path.join(outputDir, desktopFile), fullPage: true });
    await desktopContext.close();

    // Mobile
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`http://localhost:3000${p.path}`, { waitUntil: "networkidle" });
    const mobileFile = `${p.name}-mobile.png`;
    await mobilePage.screenshot({ path: path.join(outputDir, mobileFile), fullPage: true });
    await mobileContext.close();

    console.log(`Captured ${p.name} (desktop & mobile)`);
  }

  await browser.close();
  console.log("\nAll final screenshots saved to:", outputDir);

  // Compare file sizes
  console.log("\n=== Screenshot Comparison against Baseline Next.js ===");
  for (const p of pages) {
    for (const view of ["desktop", "mobile"]) {
      const filename = `${p.name}-${view}.png`;
      const baseStat = fs.statSync(path.join(baselineDir, filename));
      const finalStat = fs.statSync(path.join(outputDir, filename));
      const diff = finalStat.size - baseStat.size;
      const pct = ((diff / baseStat.size) * 100).toFixed(2);
      console.log(`${filename.padEnd(28)} Baseline: ${baseStat.size.toString().padStart(8)} B | Final: ${finalStat.size.toString().padStart(8)} B | Diff: ${diff >= 0 ? "+" : ""}${diff} B (${pct}%)`);
    }
  }
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
