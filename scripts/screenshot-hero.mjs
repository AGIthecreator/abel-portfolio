import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const base = process.env.HERO_URL ?? "http://localhost:3000";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "screenshots");

await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

for (const { name, width, height } of [
  { name: "hero-mobile", width: 390, height: 844 },
  { name: "hero-tablet", width: 768, height: 1024 },
  { name: "hero-desktop", width: 1440, height: 900 },
]) {
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(base, { waitUntil: "networkidle2", timeout: 60_000 });
  await page.waitForSelector(".hero-desk-stack", { timeout: 15_000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(() => {
    document.querySelector(".hero-desk-stack")?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await new Promise((r) => setTimeout(r, 400));
  const hasScroll =
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`${name}: scrollX=${hasScroll} -> ${file}`);
}

await browser.close();
