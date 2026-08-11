import { renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { createElement } from "react";
import type { QuotePdfModel } from "@/lib/commerce/buildQuotePdfModel";
import { QuotePdfDocument } from "@/lib/pdf/QuotePdfDocument";

/** Genera el PDF en memoria (solo servidor). */
export async function renderQuotePdfBuffer(model: QuotePdfModel): Promise<Buffer> {
  const element = createElement(QuotePdfDocument, { model }) as ReactElement;
  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  return Buffer.from(buffer);
}

export function quotePdfFilename(model: QuotePdfModel): string {
  const slug = model.product.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `presupuesto-agi-${slug || "proyecto"}.pdf`;
}
