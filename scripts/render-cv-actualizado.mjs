import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const root = path.resolve("public");
const htmlName = "CV_Abel_Gonzalez_2026_Actualizado.html";
const pdfPath = path.join(root, "CV_Abel_Gonzalez_2026_Actualizado.pdf");

const types = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".css": "text/css",
  ".js": "text/javascript",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
    res.end(data);
  });
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const url = `http://127.0.0.1:${port}/${htmlName}`;

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
});
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.emulateMediaType("print");
  const metrics = await page.evaluate(() => {
    const el = document.querySelector(".cv-wrapper");
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      wrapperHeight: Math.round(r.height),
      wrapperWidth: Math.round(r.width),
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      overflow: style.overflow,
      bodyScroll: document.documentElement.scrollHeight,
    };
  });
  console.log("metrics", JSON.stringify(metrics));

  await page.pdf({
    path: pdfPath,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  console.log("pdf", pdfPath);
} finally {
  await browser.close();
  server.close();
}
