import sharp from "sharp";
import path from "path";
import { copyFile } from "fs/promises";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "public/logos/FaviconAGI.png");
const iconOut = path.join(root, "src/app/icon.png");
const appleOut = path.join(root, "src/app/apple-icon.png");

async function backgroundFromCorner(input) {
  const { data } = await sharp(input)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [r, g, b, a = 255] = data;
  return { r, g, b, alpha: a / 255 };
}

async function writeSquare(input, size, output) {
  const background = await backgroundFromCorner(input);

  await sharp(input)
    .resize(size, size, {
      fit: "contain",
      background,
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toFile(output);
}

const meta = await sharp(src).metadata();
const isSquare512 = meta.width === 512 && meta.height === 512;

if (isSquare512) {
  await copyFile(src, iconOut);
  console.log(`OK 512x512 -> ${path.relative(root, iconOut)} (copia directa)`);
} else {
  const source = await sharp(src).toBuffer();
  await writeSquare(source, 512, src);
  await writeSquare(source, 512, iconOut);
  console.log("OK 512x512 -> public/logos/FaviconAGI.png + src/app/icon.png");
}

await writeSquare(isSquare512 ? src : iconOut, 180, appleOut);
console.log(`OK 180x180 -> ${path.relative(root, appleOut)}`);
