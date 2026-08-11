/**
 * Sistema comercial AGI TheCreator: fuente de verdad.
 * UI (/precios, /presupuesto) y futuros PDF/diagnóstico consumen este módulo.
 */

export * from "./lineItems";
export * from "./products";
export * from "./bundles";
export * from "./maintenance";
export * from "./quote";
export * from "./rules";
export * from "./copy";
export * from "./diagnostic";
export * from "./snapshot";
export * from "./quotePdfCopy";
export * from "./buildQuotePdfModel";
export {
  quoteSubmitSchema,
  quoteDiagnosticSchema,
  quoteContactSchema,
  quotePdfRequestSchema,
  validateAndBuildQuoteSubmission,
  validateAndBuildQuotePdfRequest,
  runQuoteSchemaSelfChecks,
} from "./quoteSchema";
