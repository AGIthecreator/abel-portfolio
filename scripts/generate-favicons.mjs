import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "public/logos/FaviconAGI.png");

async function backgroundFromCorner(input) {
  const { data, info } = await sharp(input)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [r, g, b, a = 255] = data;
  return { r, g, b, alpha: a / 255 };
}

const source = await sharp(src).toBuffer();
const background = await backgroundFromCorner(source);

const outputs = [
  [512, path.join(root, "public/logos/FaviconAGI.png")],
  [512, path.join(root, "src/app/icon.png")],
  [180, path.join(root, "src/app/apple-icon.png")],
];

for (const [size, output] of outputs) {
  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background,
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toFile(output);
  console.log(`OK ${size}x${size} -> ${path.relative(root, output)}`);
}
