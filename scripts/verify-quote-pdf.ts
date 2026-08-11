/**
 * Verificación del modelo PDF + anti-manipulación + generación.
 * Uso: npx tsx scripts/verify-quote-pdf.ts
 */
import { calculateQuote } from "../src/lib/commerce/rules";
import { buildQuotePdfModel } from "../src/lib/commerce/buildQuotePdfModel";
import { sumBundleValue } from "../src/lib/commerce/bundles";
import { validateAndBuildQuotePdfRequest } from "../src/lib/commerce/quoteSchema";
import { renderQuotePdfBuffer } from "../src/lib/pdf/renderQuotePdf";
import type { QuoteDiagnostic, QuoteContact } from "../src/lib/commerce/diagnostic";
import type { QuoteInput } from "../src/lib/commerce/quote";

const diagnostic: QuoteDiagnostic = {
  businessType: "comercio",
  goal: "web_profesional",
  currentSituation: "sin_web",
  blocker: "percepcion",
  timeline: "semanas",
};

const contact: QuoteContact = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "600 000 000",
  company: "Ejemplo SL",
  consent: true,
};

function assert(cond: boolean, label: string, failed: string[], passed: { n: number }) {
  if (cond) passed.n += 1;
  else failed.push(label);
}

async function main() {
  const failed: string[] = [];
  const passed = { n: 0 };

  // 1. Web de entrada
  const entradaInput: QuoteInput = {
    productId: "entrada",
    extras: {},
    maintenance: "later",
  };
  const entrada = calculateQuote(entradaInput);
  assert(entrada.subtotalEur === 510, "1 entrada base 510", failed, passed);

  // 2. Web profesional
  const proInput: QuoteInput = {
    productId: "profesional",
    extras: {},
    maintenance: "later",
  };
  const pro = calculateQuote(proInput);
  assert(pro.subtotalEur === 1190, "2 profesional base 1190", failed, passed);

  // 3. Proyecto a medida
  const customInput: QuoteInput = {
    productId: "a-medida",
    extras: {},
    maintenance: "later",
  };
  const custom = calculateQuote(customInput);
  assert(custom.subtotalEur === 2490, "3 a-medida base 2490", failed, passed);
  assert(
    sumBundleValue("a-medida") > 2490,
    "3b a-medida bundle > pack",
    failed,
    passed,
  );

  // 4. Automatización
  const sysInput: QuoteInput = {
    productId: "sistemas",
    extras: { automation_flow: 1 },
    maintenance: "later",
  };
  const sys = calculateQuote(sysInput);
  assert(sys.productId === "sistemas" && sys.subtotalEur > 0, "4 sistemas con flujo", failed, passed);

  const sysEmpty = calculateQuote({
    productId: "sistemas",
    extras: {},
    maintenance: "later",
  });
  assert(sysEmpty.subtotalEur === 0, "4b sistemas sin módulos = 0", failed, passed);

  const bulk = calculateQuote({
    productId: "a-medida",
    extras: { catalog_bulk: 1 },
    maintenance: "later",
  });
  assert(bulk.extrasTotalEur === 120, "4c catalog_bulk minEur 120", failed, passed);

  // 5. Extras
  const withExtras = calculateQuote({
    productId: "profesional",
    extras: { booking: 1 },
    maintenance: "later",
  });
  assert(
    withExtras.extrasTotalEur > 0 && withExtras.subtotalEur > 1190,
    "5 extras suman al subtotal",
    failed,
    passed,
  );

  // 6. Mantenimiento
  const withMaint = calculateQuote({
    productId: "profesional",
    extras: {},
    maintenance: "yes",
  });
  assert(withMaint.maintenanceMonthlyEur === 99, "6 mantenimiento 99", failed, passed);

  // 7. IVA
  assert(
    Math.abs(pro.vatEur - Math.round(1190 * 0.21 * 100) / 100) < 0.01,
    "7 IVA 21%",
    failed,
    passed,
  );

  // 8. Descuento de pack
  const bundle = sumBundleValue("profesional");
  const modelPro = buildQuotePdfModel({
    quoteId: "q_test_pro",
    timestamp: new Date().toISOString(),
    input: proInput,
    result: pro,
    diagnostic,
    contact,
  });
  assert(bundle > 1190, "8a bundle > pack", failed, passed);
  assert(
    modelPro.packSavingsEur != null &&
      Math.abs(modelPro.packSavingsEur - (bundle - 1190)) < 0.01,
    "8b ahorro pack en modelo PDF",
    failed,
    passed,
  );

  // 9. Snapshot manipulado (total falso ignorado)
  const manipulated = validateAndBuildQuotePdfRequest({
    quote: {
      input: proInput,
      result: { ...pro, subtotalEur: 1, totalEur: 1 },
    },
    diagnostic,
    contact,
  });
  assert(
    manipulated.ok && manipulated.result.subtotalEur === 1190,
    "9 anti-manipulación total",
    failed,
    passed,
  );

  // 10. Snapshot incompleto
  const incomplete = validateAndBuildQuotePdfRequest({
    quote: { input: { productId: "profesional", extras: {}, maintenance: "later" } },
    diagnostic: { ...diagnostic, blocker: "" },
    contact,
  });
  assert(!incomplete.ok, "10 snapshot incompleto rechazado", failed, passed);

  // 11. Generación PDF real
  const pdf = await renderQuotePdfBuffer(modelPro);
  assert(pdf.length > 1000 && pdf.subarray(0, 4).toString() === "%PDF", "11 PDF bytes", failed, passed);

  // Extra: entrada / a-medida / sistemas modelos
  for (const [label, input] of [
    ["entrada", entradaInput],
    ["a-medida", customInput],
    ["sistemas", sysInput],
  ] as const) {
    const result = calculateQuote(input);
    const model = buildQuotePdfModel({
      quoteId: `q_${label}`,
      timestamp: new Date().toISOString(),
      input: {
        ...input,
        businessType: diagnostic.businessType,
        goal: label === "sistemas" ? "automatizar" : diagnostic.goal,
        currentSituation: diagnostic.currentSituation,
      },
      result,
      diagnostic: {
        ...diagnostic,
        goal: label === "sistemas" ? "automatizar" : diagnostic.goal,
      },
      contact,
    });
    const buf = await renderQuotePdfBuffer(model);
    assert(buf.subarray(0, 4).toString() === "%PDF", `11b PDF ${label}`, failed, passed);
  }

  console.log(`Quote PDF checks: ${passed.n} passed`);
  if (failed.length) {
    console.error("Failed:", failed.join(", "));
    process.exit(1);
  }
  console.log("All quote PDF self-checks OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
