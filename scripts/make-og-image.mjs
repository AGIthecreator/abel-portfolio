import sharp from "sharp";
import { writeFileSync } from "fs";

const W = 1200;
const H = 630;
const OUT = "public/og-image.png";

// Franjas del fondo de página (mismas que el sitio / portada LinkedIn).
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#070b13"/>
  <polygon points="${W * 0.28},0 ${W},0 ${W},${H} ${W * 0.55},${H}" fill="#12151f"/>
  <polygon points="${W * 0.43},0 ${W},0 ${W},${H} ${W * 0.70},${H}" fill="#251c49"/>
  <polygon points="${W * 0.43},0 ${W * 0.46},0 ${W * 0.73},${H} ${W * 0.70},${H}" fill="#3a2d6b" fill-opacity="0.55"/>
</svg>`;

const base = await sharp(Buffer.from(svg)).png().toBuffer();

const logoH = 220;
const logo = await sharp("public/logos/NavbarAGI.webp")
  .resize({ height: logoH, fit: "inside" })
  .png()
  .toBuffer();
const logoMeta = await sharp(logo).metadata();
const logoW = logoMeta.width ?? 650;

const mascotH = 500;
const mascot = await sharp("public/logos/mascot-faqs-hero.webp")
  .resize({ height: mascotH, fit: "inside" })
  .png()
  .toBuffer();
const mascotMeta = await sharp(mascot).metadata();
const mascotW = mascotMeta.width ?? 580;
const mascotX = W - mascotW - 24;
const mascotY = H - mascotH + 18;

const lineSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="48">
  <text
    x="0"
    y="32"
    font-family="Consolas, 'Cascadia Mono', 'Courier New', monospace"
    font-size="22"
    font-weight="600"
    letter-spacing="6"
    fill="#a1a1aa"
  >WEBS <tspan fill="#c4b5fd" fill-opacity="0.88">·</tspan> SISTEMAS <tspan fill="#c4b5fd" fill-opacity="0.88">·</tspan> AUTOMATIZACIÓN</text>
</svg>`;
const line = await sharp(Buffer.from(lineSvg)).trim().png().toBuffer();
const lineMeta = await sharp(line).metadata();
const lineW = lineMeta.width ?? 600;
const lineH = lineMeta.height ?? 22;

const gap = 36;
const blockH = logoH + gap + lineH;
const blockY = Math.round((H - blockH) / 2);
const brandCenter = Math.round((48 + mascotX) / 2);
const logoX = Math.max(48, Math.round(brandCenter - logoW / 2));
const logoY = blockY;
const lineX = Math.round(logoX + logoW / 2 - lineW / 2);
const lineY = logoY + logoH + gap;

const out = await sharp(base)
  .composite([
    { input: logo, left: logoX, top: logoY },
    { input: line, left: lineX, top: lineY },
    { input: mascot, left: mascotX, top: mascotY },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(OUT, out);
const meta = await sharp(out).metadata();
console.log("written", OUT, meta.width, "x", meta.height, "bytes", out.length);
console.log("logo", logoW, "x", logoH, "at", logoX, logoY);
console.log("line", lineW, "x", lineH, "at", lineX, lineY);
console.log("mascot", mascotW, "x", mascotH, "at", mascotX, mascotY);
