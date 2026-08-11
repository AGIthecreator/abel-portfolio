/**
 * Autocomprobaciones del schema Zod de /api/quote.
 * Uso: npx tsx scripts/verify-quote-schema.ts
 */
import { runQuoteSchemaSelfChecks } from "../src/lib/commerce/quoteSchema";

const { passed, failed } = runQuoteSchemaSelfChecks();
console.log(`Quote schema checks: ${passed} passed`);
if (failed.length) {
  console.error("Failed:", failed.join(", "));
  process.exit(1);
}
console.log("All quote schema self-checks OK");
