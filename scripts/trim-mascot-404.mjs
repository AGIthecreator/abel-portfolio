/** Recorta transparencia sobrante de mascot-404.webp (mismo nombre). */
import sharp from "sharp";
import path from "path";
import { copyFile, unlink } from "fs/promises";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "public/logos/mascot-404.webp");
const temp = path.join(root, "public/logos/mascot-404.trim.webp");

const before = await sharp(input).metadata();

await sharp(input)
  .trim({ threshold: 10 })
  .webp({ quality: 95, effort: 6, alphaQuality: 100 })
  .toFile(temp);

await copyFile(temp, input);
await unlink(temp);

const after = await sharp(input).metadata();
console.log(
  `mascot-404: ${before.width}x${before.height} → ${after.width}x${after.height} (alpha=${after.hasAlpha})`,
);
console.log(
  `Actualiza en not-found-mascot-preset.ts → naturalWidth: ${after.width}, naturalHeight: ${after.height}`,
);
