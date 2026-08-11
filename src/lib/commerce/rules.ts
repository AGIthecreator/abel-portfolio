import { sumBundleValue } from "./bundles";
import { computeLineTotal, LINE_ITEMS } from "./lineItems";
import { MAINTENANCE_OFFER, type MaintenanceChoice } from "./maintenance";
import { getProduct, type ProductId } from "./products";
import type { QuoteInput, QuoteLine, QuoteResult, QuoteWarning } from "./quote";

export const VAT_RATE = 0.21;

/** Extras que suelen superar el alcance de Web de entrada. */
const ENTRADA_HEAVY_EXTRAS = new Set([
  "booking",
  "private_area",
  "integration_complex",
  "database",
  "automation_flow",
  "bot_basic",
  "ai_feature",
  "catalog_bulk",
  "ui_system",
  "dev_custom",
]);

/** Extras que amplían el alcance de Entrada hacia un proyecto más completo. */
const ENTRADA_SCOPE_EXTRAS = new Set([
  "creative_extended",
  "form_advanced",
  "copy_page",
  "copy_pack",
  "content_research",
  "migration_web",
  "section_extra",
  "ui_system",
  "seo_tech_extended",
  "project_consulting",
]);

/**
 * Si Entrada + extras se acerca a un alcance de Profesional,
 * el total no puede quedar por debajo del pack principal.
 */
function applyEntradaProfesionalFloor(
  input: QuoteInput,
  subtotalEur: number,
  lines: QuoteLine[],
  warnings: QuoteWarning[],
): number {
  if (input.productId !== "entrada") return subtotalEur;

  const profesionalFrom = getProduct("profesional")?.priceFromEur;
  if (profesionalFrom == null || subtotalEur >= profesionalFrom) return subtotalEur;

  let expandingCount = 0;
  let expandingSum = 0;
  for (const [id, quantity] of Object.entries(input.extras)) {
    if (!quantity || quantity <= 0) continue;
    if (!ENTRADA_SCOPE_EXTRAS.has(id)) continue;
    const item = LINE_ITEMS[id];
    if (!item) continue;
    const total = computeLineTotal(item.priceEur, quantity, item.minEur);
    if (typeof total !== "number") continue;
    expandingCount += 1;
    expandingSum += total;
  }

  // 1 extra pequeño no activa el suelo.
  // 2+ extras de ampliación o >= 250 € en ampliación: alinear con Profesional.
  const shouldFloor = expandingCount >= 2 || expandingSum >= 250;
  if (!shouldFloor) return subtotalEur;

  const bump = Math.round((profesionalFrom - subtotalEur) * 100) / 100;
  if (bump <= 0) return subtotalEur;

  lines.push({
    id: "scope_floor_profesional",
    kind: "note",
    name: "Ajuste de alcance (Web profesional)",
    description:
      "Con estos extras el proyecto ya no encaja como Web de entrada. El total se alinea con la opción principal.",
    quantity: 1,
    unitPriceEur: bump,
    lineTotalEur: bump,
  });

  if (!warnings.some((w) => w.code === "entrada_floor_profesional")) {
    warnings.push({
      code: "entrada_floor_profesional",
      severity: "suggest_upgrade",
      suggestedProductId: "profesional",
      message:
        "Con estos extras el alcance se acerca a Web profesional. El total se alinea con esa opción. Puedes cambiar al pack principal.",
    });
  }

  return profesionalFrom;
}

function buildWarnings(
  productId: ProductId | null,
  extras: Record<string, number>,
): QuoteWarning[] {
  const warnings: QuoteWarning[] = [];
  if (!productId) return warnings;

  const active = (id: string) => (extras[id] ?? 0) > 0;

  const activeHeavy = Object.entries(extras).filter(
    ([id, qty]) => qty > 0 && ENTRADA_HEAVY_EXTRAS.has(id),
  );

  if (productId === "entrada" && activeHeavy.length > 0) {
    const names = activeHeavy
      .map(([id]) => LINE_ITEMS[id]?.name)
      .filter(Boolean)
      .join(", ");
    warnings.push({
      code: "entrada_scope",
      severity: "suggest_upgrade",
      suggestedProductId: activeHeavy.some(([id]) =>
        ["private_area", "database", "automation_flow", "dev_custom"].includes(id),
      )
        ? "a-medida"
        : "profesional",
      message: `Con ${names} suele encajar mejor una Web profesional o un Proyecto a medida que una Web de entrada.`,
    });
  }

  if (productId === "profesional") {
    const needsCustom = ["private_area", "database", "automation_flow", "bot_basic"].some(
      (id) => active(id),
    );
    if (needsCustom) {
      warnings.push({
        code: "profesional_to_amedida",
        severity: "suggest_upgrade",
        suggestedProductId: "a-medida",
        message:
          "Esta combinación se acerca a un Proyecto a medida. Puedes seguir o cambiar de producto.",
      });
    }
  }

  if (productId === "sistemas") {
    const hasModule = Object.values(extras).some((q) => q > 0);
    if (!hasModule) {
      warnings.push({
        code: "sistemas_empty",
        severity: "info",
        message:
          "Selecciona al menos un flujo o módulo para obtener una orientación de precio.",
      });
    }
  }

  // Combos que suelen ser redundantes (aviso, no bloqueo).
  if (active("copy_page") && active("copy_pack")) {
    warnings.push({
      code: "combo_copy_overlap",
      severity: "info",
      message:
        "Tienes copy por página y pack de copy a la vez. Suele bastar con una de las dos opciones.",
    });
  }
  if (active("catalog_light") && active("catalog_bulk")) {
    warnings.push({
      code: "combo_catalog_overlap",
      severity: "info",
      message:
        "Catálogo ligero y carga masiva a la vez: revisa si necesitas las dos o solo la carga por volumen.",
    });
  }
  if (active("integration_simple") && active("integration_complex")) {
    warnings.push({
      code: "combo_integration_overlap",
      severity: "info",
      message:
        "Integración simple y compleja a la vez: normalmente se elige el nivel que encaja con el sistema externo.",
    });
  }

  return warnings;
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const product = input.productId ? getProduct(input.productId) : undefined;
  const lines: QuoteLine[] = [];
  let bundleValueEur = 0;
  let extrasTotalEur = 0;

  if (product) {
    for (const id of product.bundleLineIds) {
      const item = LINE_ITEMS[id];
      if (!item) continue;
      const total = computeLineTotal(item.priceEur, 1, item.minEur);
      if (typeof total === "number") bundleValueEur += total;
      lines.push({
        id: item.id,
        kind: "bundle",
        name: item.name,
        description: item.description,
        quantity: 1,
        unitPriceEur: item.priceEur,
        lineTotalEur: total,
        includedInPack: true,
      });
    }
  } else {
    bundleValueEur = 0;
  }

  for (const [id, quantity] of Object.entries(input.extras)) {
    if (!quantity || quantity <= 0) continue;
    const item = LINE_ITEMS[id];
    if (!item) continue;
    // No cobrar de nuevo nada que ya esté en el pack (cualquier unidad).
    if (product?.bundleLineIds.includes(id)) continue;

    const total = computeLineTotal(item.priceEur, quantity, item.minEur);
    if (typeof total === "number") extrasTotalEur += total;
    lines.push({
      id: `${item.id}:${quantity}`,
      kind: "extra",
      name: item.name,
      description: item.description,
      quantity,
      unitPriceEur: item.priceEur,
      lineTotalEur: total,
      includedInPack: false,
    });
  }

  const packPriceEur =
    product?.priceFromEur != null
      ? product.priceFromEur
      : null;

  let subtotalEur = 0;
  if (product?.id === "sistemas") {
    // Sin módulos: 0 (no filtrar internalFromEur al cliente).
    subtotalEur = extrasTotalEur;
  } else if (packPriceEur != null) {
    subtotalEur = packPriceEur + extrasTotalEur;
  } else {
    subtotalEur = extrasTotalEur;
  }

  const warnings = buildWarnings(input.productId, input.extras);
  subtotalEur = applyEntradaProfesionalFloor(input, subtotalEur, lines, warnings);

  const vatEur = Math.round(subtotalEur * VAT_RATE * 100) / 100;
  const totalEur = Math.round((subtotalEur + vatEur) * 100) / 100;

  const maintenance: MaintenanceChoice = input.maintenance;
  const maintenanceMonthlyEur =
    maintenance === "yes" ? MAINTENANCE_OFFER.priceFromEur : null;

  if (maintenance === "yes") {
    lines.push({
      id: "maint_base",
      kind: "maintenance",
      name: MAINTENANCE_OFFER.name,
      description: MAINTENANCE_OFFER.scopeClarification,
      quantity: 1,
      unitPriceEur: MAINTENANCE_OFFER.priceFromEur,
      lineTotalEur: MAINTENANCE_OFFER.priceFromEur,
    });
  }

  if (product && product.bundleLineIds.length > 0) {
    bundleValueEur = sumBundleValue(product.id);
  } else {
    bundleValueEur = 0;
  }

  return {
    productId: input.productId,
    productName: product?.name ?? null,
    packPriceEur,
    bundleValueEur,
    extrasTotalEur,
    lines,
    subtotalEur,
    vatRate: VAT_RATE,
    vatEur,
    totalEur,
    maintenance,
    maintenanceMonthlyEur,
    warnings,
    isOrientative: true,
  };
}

/** Extras disponibles para un producto (sugeridos + seleccionables no incluidos). */
export function getExtrasForProduct(productId: ProductId): string[] {
  const product = getProduct(productId);
  if (!product) return [];
  const set = new Set(product.suggestedExtraIds);
  return [...set];
}
