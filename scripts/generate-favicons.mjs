/**
 * Genera favicons desde el isotipo (sin texto).
 * Fuente: public/logos/FaviconAGI.png — NO usar logos horizontales con texto.
 * Margen ~17.5% por lado para que el símbolo se lea bien a 32×32.
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const PADDING = 0.175; // 15–20% margen por lado

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "public/logos/FaviconAGI.png");
const iconOut = path.join(root, "src/app/icon.png");
const appleOut = path.join(root, "src/app/apple-icon.png");
const publicIcons = [
  { file: "favicon.ico", size: 32 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "android-chrome-192.png", size: 192 },
  { file: "android-chrome-512.png", size: 512 },
];

async function backgroundFromCorner(input) {
  const { data } = await sharp(input)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [r, g, b, a = 255] = data;
  return { r, g, b, alpha: a / 255 };
}

/** Isotipo centrado con margen; nunca estira el logo horizontal completo. */
async function writeSquare(input, size, output) {
  const background = await backgroundFromCorner(input);
  const inner = Math.max(1, Math.round(size * (1 - 2 * PADDING)));

  const symbol = await sharp(input)
    .resize(inner, inner, {
      fit: "contain",
      background,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: symbol, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(output);
}

const source = await sharp(src).toBuffer();

await writeSquare(source, 512, iconOut);
console.log(`OK 512x512 (isotipo + margen) -> ${path.relative(root, iconOut)}`);

await writeSquare(source, 180, appleOut);
console.log(`OK 180x180 -> ${path.relative(root, appleOut)}`);

for (const { file, size } of publicIcons) {
  const out = path.join(root, "public", file);
  await writeSquare(source, size, out);
  console.log(`OK ${size}x${size} -> public/${file}`);
}
