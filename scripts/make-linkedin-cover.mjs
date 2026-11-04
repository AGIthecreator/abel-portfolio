import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";

const W = 1584;
const H = 396;

mkdirSync("public/social", { recursive: true });

// Franjas del fondo de pagina (WhatIBuild movil / site-wide), NO las del hero.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#070b13"/>
  <polygon points="${W * 0.28},0 ${W},0 ${W},${H} ${W * 0.55},${H}" fill="#12151f"/>
  <polygon points="${W * 0.43},0 ${W},0 ${W},${H} ${W * 0.70},${H}" fill="#251c49"/>
  <polygon points="${W * 0.43},0 ${W * 0.46},0 ${W * 0.73},${H} ${W * 0.70},${H}" fill="#3a2d6b" fill-opacity="0.55"/>
</svg>`;

const base = await sharp(Buffer.from(svg)).png().toBuffer();

const logoH = 148;
const logo = await sharp("public/logos/NavbarAGI.webp")
  .resize({ height: logoH, fit: "inside" })
  .png()
  .toBuffer();
const logoMeta = await sharp(logo).metadata();

const mascotH = 300;
const mascot = await sharp("public/logos/mascot-faqs-hero.webp")
  .resize({ height: mascotH, fit: "inside" })
  .png()
  .toBuffer();
const mascotMeta = await sharp(mascot).metadata();

const mascotX = Math.min(
  1108,
  W - 117 - (mascotMeta.width ?? 340) - 8,
);
const mascotY = H - (mascotMeta.height ?? mascotH) + 6;

// Bloque marca centrado entre el recorte izquierdo y el pavo (la foto de perfil tapa abajo-izquierda).
const logoW = logoMeta.width ?? 439;
const brandCenter = Math.round((117 + mascotX) / 2);
const logoX = Math.round(brandCenter - logoW / 2);
const logoY = 78;

const lineY = logoY + (logoMeta.height ?? logoH) + 28;
const lineSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="780" height="40">
  <text
    x="0"
    y="26"
    font-family="Consolas, 'Cascadia Mono', 'Courier New', monospace"
    font-size="17"
    font-weight="600"
    letter-spacing="5.2"
    fill="#a1a1aa"
  >WEBS <tspan fill="#c4b5fd" fill-opacity="0.88">·</tspan> SISTEMAS <tspan fill="#c4b5fd" fill-opacity="0.88">·</tspan> AUTOMATIZACIÓN</text>
</svg>`;
const line = await sharp(Buffer.from(lineSvg)).trim().png().toBuffer();
const lineMeta = await sharp(line).metadata();
const lineX = Math.round(logoX + logoW / 2 - (lineMeta.width ?? 600) / 2);

const out = await sharp(base)
  .composite([
    { input: logo, left: logoX, top: logoY },
    { input: line, left: lineX, top: lineY },
    { input: mascot, left: mascotX, top: mascotY },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

const meta = await sharp(out).metadata();
writeFileSync("public/social/linkedin-cover-1584x396.png", out);
console.log(
  "written",
  meta.width,
  "x",
  meta.height,
  "bytes",
  out.length,
);
console.log("logo", logoMeta.width, "x", logoMeta.height, "at", logoX, logoY);
console.log("line", lineMeta.width, "x", lineMeta.height, "at", lineX, lineY);
console.log(
  "mascot",
  mascotMeta.width,
  "x",
  mascotMeta.height,
  "at",
  mascotX,
  mascotY,
);
