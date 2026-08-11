import { z } from "zod";
import { calculateQuote } from "./rules";
import { PRODUCTS, type ProductId } from "./products";
import {
  DIAGNOSTIC_BLOCKERS,
  DIAGNOSTIC_BUSINESS_TYPES,
  DIAGNOSTIC_GOALS,
  DIAGNOSTIC_SITUATIONS,
  DIAGNOSTIC_TIMELINES,
  getGoalsForProduct,
  type QuoteContact,
  type QuoteDiagnostic,
} from "./diagnostic";
import type { QuoteInput } from "./quote";

/** Normaliza móvil ES: quita +34 / 0034 y deja 9 dígitos. */
export function normalizeEsMobileDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0034")) digits = digits.slice(4);
  else if (digits.startsWith("34") && digits.length >= 11) digits = digits.slice(2);
  return digits.slice(0, 9);
}

export function formatEsMobileGrouped(value: string): string {
  const digits = normalizeEsMobileDigits(value);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 3) parts.push(digits.slice(i, i + 3));
  return parts.join(" ");
}

const PRODUCT_IDS = PRODUCTS.map((p) => p.id) as [ProductId, ...ProductId[]];

const optionId = (allowed: readonly { id: string }[]) =>
  z.string().refine((v) => allowed.some((o) => o.id === v), {
    message: "Opción no válida",
  });

export const quoteInputSchema = z.object({
  productId: z.enum(PRODUCT_IDS),
  extras: z.record(z.string(), z.number().finite().min(0).max(99)),
  maintenance: z.enum(["yes", "no", "later"]),
  businessType: z.string().nullable().optional(),
  goal: z.string().nullable().optional(),
  currentSituation: z.string().nullable().optional(),
});

export const quoteDiagnosticSchema = z
  .object({
    businessType: optionId(DIAGNOSTIC_BUSINESS_TYPES),
    businessTypeOther: z.string().trim().max(120).optional(),
    goal: optionId(DIAGNOSTIC_GOALS),
    goalOther: z.string().trim().max(120).optional(),
    currentSituation: optionId(DIAGNOSTIC_SITUATIONS),
    currentSituationOther: z.string().trim().max(120).optional(),
    blocker: optionId(DIAGNOSTIC_BLOCKERS),
    blockerOther: z.string().trim().max(120).optional(),
    timeline: optionId(DIAGNOSTIC_TIMELINES),
  })
  .superRefine((val, ctx) => {
    const need = (id: string | undefined, other: string | undefined, path: string) => {
      if (id === "otro" && !other?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Especifica la opción",
          path: [path],
        });
      }
    };
    need(val.businessType, val.businessTypeOther, "businessTypeOther");
    need(val.goal, val.goalOther, "goalOther");
    need(val.currentSituation, val.currentSituationOther, "currentSituationOther");
    need(val.blocker, val.blockerOther, "blockerOther");
  });

export const quoteContactSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(120),
  email: z.string().trim().min(1).max(254).email("Email inválido"),
  phone: z
    .string()
    .trim()
    .transform((v) => formatEsMobileGrouped(v))
    .refine((v) => normalizeEsMobileDigits(v).length === 9, {
      message: "Teléfono de 9 dígitos",
    }),
  company: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  consent: z.literal(true, {
    error: "Debes aceptar el contacto",
  }),
});

export const quoteSubmitSchema = z.object({
  quote: z.object({
    input: quoteInputSchema,
  }),
  diagnostic: quoteDiagnosticSchema,
  contact: quoteContactSchema,
  timestamp: z.string().datetime().optional(),
  website: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim()),
});

/** Payload para generar PDF: mismos datos comerciales, sin confiar en result del cliente. */
export const quotePdfRequestSchema = z.object({
  quote: z.object({
    input: quoteInputSchema,
    /** Ignorado en servidor; solo se acepta para no romper clientes antiguos */
    result: z.unknown().optional(),
  }),
  diagnostic: quoteDiagnosticSchema,
  contact: quoteContactSchema,
  quoteId: z.string().min(1).max(80).optional(),
  timestamp: z.string().datetime().optional(),
});

export type QuoteSubmitPayload = z.infer<typeof quoteSubmitSchema>;
export type QuotePdfRequestPayload = z.infer<typeof quotePdfRequestSchema>;

export type ValidQuoteSubmission = {
  ok: true;
  input: QuoteInput;
  result: ReturnType<typeof calculateQuote>;
  diagnostic: QuoteDiagnostic;
  contact: QuoteContact;
  honeypot: boolean;
  timestamp: string;
};

/**
 * Valida payload y recalcula el presupuesto en servidor.
 * No confía en totales enviados por el cliente.
 */
export function validateAndBuildQuoteSubmission(
  body: unknown,
): ValidQuoteSubmission | { ok: false; error: string; status: number } {
  const parsed = quoteSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", status: 400 };
  }

  const { quote, diagnostic, contact, website, timestamp } = parsed.data;

  if (website) {
    return {
      ok: true,
      honeypot: true,
      input: quote.input,
      result: calculateQuote(quote.input),
      diagnostic: diagnostic as QuoteDiagnostic,
      contact: contact as QuoteContact,
      timestamp: timestamp ?? new Date().toISOString(),
    };
  }

  const allowedGoals = new Set(
    getGoalsForProduct(quote.input.productId).map((g) => g.id),
  );
  if (!allowedGoals.has(diagnostic.goal)) {
    return { ok: false, error: "Datos inválidos", status: 400 };
  }

  const input: QuoteInput = {
    ...quote.input,
    businessType: diagnostic.businessType,
    goal: diagnostic.goal,
    currentSituation: diagnostic.currentSituation,
  };

  const result = calculateQuote(input);
  if (!result.productId || result.subtotalEur < 0) {
    return { ok: false, error: "Presupuesto incompleto", status: 400 };
  }

  return {
    ok: true,
    honeypot: false,
    input,
    result,
    diagnostic: diagnostic as QuoteDiagnostic,
    contact: contact as QuoteContact,
    timestamp: timestamp ?? new Date().toISOString(),
  };
}

/**
 * Valida petición de PDF y recalcula totales en servidor.
 * Descarta cualquier `result` enviado por el cliente.
 */
export function validateAndBuildQuotePdfRequest(body: unknown):
  | {
      ok: true;
      input: QuoteInput;
      result: ReturnType<typeof calculateQuote>;
      diagnostic: QuoteDiagnostic;
      contact: QuoteContact;
      timestamp: string;
      quoteId: string;
    }
  | { ok: false; error: string; status: number } {
  const parsed = quotePdfRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", status: 400 };
  }

  const { quote, diagnostic, contact, timestamp, quoteId } = parsed.data;
  const allowedGoals = new Set(
    getGoalsForProduct(quote.input.productId).map((g) => g.id),
  );
  if (!allowedGoals.has(diagnostic.goal)) {
    return { ok: false, error: "Datos inválidos", status: 400 };
  }

  const input: QuoteInput = {
    ...quote.input,
    businessType: diagnostic.businessType,
    goal: diagnostic.goal,
    currentSituation: diagnostic.currentSituation,
  };

  const result = calculateQuote(input);
  if (!result.productId || result.subtotalEur < 0) {
    return { ok: false, error: "Presupuesto incompleto", status: 400 };
  }

  // Si el cliente envía un total manipulado en quote.result, se ignora.
  return {
    ok: true,
    input,
    result,
    diagnostic: diagnostic as QuoteDiagnostic,
    contact: contact as QuoteContact,
    timestamp: timestamp ?? new Date().toISOString(),
    quoteId: quoteId?.trim() || `q_${Date.now().toString(36)}`,
  };
}

/** Autocomprobaciones del schema (sin framework de tests). */
export function runQuoteSchemaSelfChecks(): { passed: number; failed: string[] } {
  const failed: string[] = [];
  let passed = 0;

  const baseInput = {
    productId: "profesional" as const,
    extras: {} as Record<string, number>,
    maintenance: "yes" as const,
  };

  const baseDiagnostic: QuoteDiagnostic = {
    businessType: "comercio",
    goal: "web_profesional",
    currentSituation: "sin_web",
    blocker: "percepcion",
    timeline: "semanas",
  };

  const baseContact: QuoteContact = {
    name: "Ana Pérez",
    email: "ana@example.com",
    phone: "600 000 000",
    consent: true,
  };

  const valid = validateAndBuildQuoteSubmission({
    quote: { input: baseInput },
    diagnostic: baseDiagnostic,
    contact: baseContact,
  });
  if (valid.ok && !valid.honeypot && valid.result.productId === "profesional") {
    passed += 1;
  } else {
    failed.push("configuración válida");
  }

  const badEmail = validateAndBuildQuoteSubmission({
    quote: { input: baseInput },
    diagnostic: baseDiagnostic,
    contact: { ...baseContact, email: "no-email" },
  });
  if (!badEmail.ok) passed += 1;
  else failed.push("email inválido");

  const noConsent = validateAndBuildQuoteSubmission({
    quote: { input: baseInput },
    diagnostic: baseDiagnostic,
    contact: { ...baseContact, consent: false as unknown as true },
  });
  if (!noConsent.ok) passed += 1;
  else failed.push("consentimiento obligatorio");

  const noName = validateAndBuildQuoteSubmission({
    quote: { input: baseInput },
    diagnostic: baseDiagnostic,
    contact: { ...baseContact, name: "" },
  });
  if (!noName.ok) passed += 1;
  else failed.push("nombre obligatorio");

  const badDiag = validateAndBuildQuoteSubmission({
    quote: { input: baseInput },
    diagnostic: { ...baseDiagnostic, blocker: "inventado" },
    contact: baseContact,
  });
  if (!badDiag.ok) passed += 1;
  else failed.push("diagnóstico manipulado");

  const badProduct = validateAndBuildQuoteSubmission({
    quote: { input: { ...baseInput, productId: "fake" as ProductId } },
    diagnostic: baseDiagnostic,
    contact: baseContact,
  });
  if (!badProduct.ok) passed += 1;
  else failed.push("producto manipulado");

  const systemsGoal = validateAndBuildQuoteSubmission({
    quote: { input: { ...baseInput, productId: "sistemas" } },
    diagnostic: { ...baseDiagnostic, goal: "web_profesional" },
    contact: baseContact,
  });
  if (!systemsGoal.ok) passed += 1;
  else failed.push("objetivo incompatible con producto");

  const otherOk = validateAndBuildQuoteSubmission({
    quote: { input: baseInput },
    diagnostic: {
      ...baseDiagnostic,
      businessType: "otro",
      businessTypeOther: "Taller de bicis",
    },
    contact: baseContact,
  });
  if (otherOk.ok) passed += 1;
  else failed.push("otro con texto");

  const otherMissing = validateAndBuildQuoteSubmission({
    quote: { input: baseInput },
    diagnostic: { ...baseDiagnostic, businessType: "otro", businessTypeOther: "" },
    contact: baseContact,
  });
  if (!otherMissing.ok) passed += 1;
  else failed.push("otro sin texto");

  // Anti-trampa: Entrada + extras de ampliación no queda por debajo de Profesional
  const entradaAlone = calculateQuote({
    productId: "entrada",
    extras: {},
    maintenance: "later",
  });
  const entradaStacked = calculateQuote({
    productId: "entrada",
    extras: { creative_extended: 1, form_advanced: 1 },
    maintenance: "later",
  });
  const profesional = calculateQuote({
    productId: "profesional",
    extras: {},
    maintenance: "later",
  });
  if (entradaAlone.subtotalEur < profesional.subtotalEur) passed += 1;
  else failed.push("entrada sola debe ser más barata");
  if (entradaStacked.subtotalEur >= profesional.subtotalEur) passed += 1;
  else failed.push("entrada+extras no debe undercut profesional");
  if (entradaStacked.warnings.some((w) => w.code === "entrada_floor_profesional")) {
    passed += 1;
  } else {
    failed.push("aviso de suelo profesional");
  }

  return { passed, failed };
}
