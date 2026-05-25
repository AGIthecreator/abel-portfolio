/**
 * ─── Ajuste del pavo en la página 404 ─────────────────────────────────────
 * Edita solo este archivo. Guarda y recarga la ruta 404 para ver el cambio.
 *
 * Nitidez: el .webp debe medir al menos widthPx × 2 de ancho (retina).
 * Ejemplo: widthPx 280 → sube una imagen de ~560px de ancho o más.
 * Si se ve borroso, baja widthPx o usa un archivo más grande (no es el preset).
 *
 * Tras sustituir `public/logos/mascot-404.webp`:
 *   node scripts/trim-mascot-404.mjs
 * y actualiza naturalWidth / naturalHeight con la salida del script.
 */

export const NOT_FOUND_MASCOT_ASSET = {
  src: "/logos/mascot-404.webp",
  /** Dimensiones reales del .webp (salida de trim-mascot-404.mjs). */
  naturalWidth: 233,
  naturalHeight: 193,
} as const;

export const NOT_FOUND_MASCOT_PRESET = {
  /** Ancho visible del pavo (px). No superar naturalWidth salvo que el asset sea más grande. */
  widthPx: 233,

  offsetXPx: 0,
  offsetYPx: 0,
  gapBelowPx: 48,

  /**
   * true = sirve el .webp de /public sin pasar por el optimizador de Next
   * (evita doble compresión y tamaños raros). Recomendado para mascotas.
   * false = optimización Next; usa imageQuality (máx. 100 en next.config).
   */
  useOriginalFile: true,

  /** Solo si useOriginalFile es false. Valores permitidos: 70, 75, 80, 92, 95, 100 */
  imageQuality: 100,
} as const;
