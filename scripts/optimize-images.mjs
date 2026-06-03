/**
 * Exporta WebP a resolución original (sin resize).
 * Navbar: quality 100 · resto: 92
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const JOBS = [
  { in: "public/logos/NavbarAGI.png", out: "public/logos/NavbarAGI.webp", quality: 100 },
  { in: "public/hero_stats.png", out: "public/hero_stats.webp", quality: 92 },
  { in: "public/notificacion.png", out: "public/notificacion.webp", quality: 92 },
  { in: "public/restaurante.png", out: "public/restaurante.webp", quality: 92 },
  { in: "public/factura.png", out: "public/factura.webp", quality: 92 },
  { in: "public/programador.png", out: "public/programador.webp", quality: 92 },
  { in: "public/tienda.png", out: "public/tienda.webp", quality: 92 },
  { in: "public/gestoria.png", out: "public/gestoria.webp", quality: 92 },
  { in: "public/commerce.PNG", out: "public/templates/commerce.webp", quality: 88, width: 640, height: 400 },
  { in: "public/clinic.PNG", out: "public/templates/clinic.webp", quality: 88, width: 640, height: 400 },
  { in: "public/restaurant.PNG", out: "public/templates/restaurant.webp", quality: 88, width: 640, height: 400 },
  { in: "public/legal.PNG", out: "public/templates/legal.webp", quality: 88, width: 640, height: 400 },
  {
    in: "public/logos/LogoAGItheCreator.png",
    out: "public/logos/LogoAGItheCreator.webp",
    quality: 82,
    width: 320,
  },
];

for (const job of JOBS) {
  const input = path.join(root, job.in);
  const output = path.join(root, job.out);
  const meta = await sharp(input).metadata();

  let pipeline = sharp(input);
  if (job.width) {
    pipeline = pipeline.resize(job.width, job.height ?? null, {
      fit: job.height ? "cover" : "inside",
      position: job.height ? "top" : "center",
      withoutEnlargement: !job.height,
    });
  }

  await pipeline
    .webp({ quality: job.quality, effort: 6, alphaQuality: 100 })
    .toFile(output);

  const outMeta = await sharp(output).metadata();
  const { size } = await import("fs/promises").then((fs) => fs.stat(output));
  console.log(
    `OK ${path.basename(job.in)} ${meta.width}x${meta.height} → ${path.basename(job.out)} ${outMeta.width}x${outMeta.height} (${Math.round(size / 1024)} KB, q${job.quality})`,
  );
}
