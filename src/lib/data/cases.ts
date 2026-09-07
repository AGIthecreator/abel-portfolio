/**
 * Casos de estudio preparados para publicación futura.
 * Solo los casos con status "published" deben exponerse en UI/rutas públicas.
 * No crear páginas de portfolio hasta tener contenido y permiso reales.
 */

export type CaseStudyStatus = "draft" | "published";

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  status: CaseStudyStatus;
  /** URL pública del caso cuando exista ficha o web cliente resuelta. */
  href?: string;
  tags?: string[];
};

/**
 * Inventario interno. Sonata queda en draft hasta dominio/ficha listos.
 * Aguarrás y PucelaTicketing no deben añadirse aquí.
 */
export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "sonata",
    title: "Sonata",
    summary:
      "Caso de estudio pendiente de publicación: web/proyecto real entregado. Se incorporará cuando el dominio y la ficha pública estén listos.",
    status: "draft",
    tags: ["web", "caso-de-estudio"],
  },
];

export function getPublishedCaseStudies(): CaseStudy[] {
  return CASE_STUDIES.filter((c) => c.status === "published");
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
