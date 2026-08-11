import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { QuotePdfModel } from "@/lib/commerce/buildQuotePdfModel";
import {
  formatDatePdf,
  formatEurPdf,
  formatEurPdfWithTaxNote,
  formatPercentPdf,
} from "@/lib/pdf/format";

const C = {
  ink: "#070b13",
  bone: "#F3F1EB",
  muted: "#5a5f6b",
  line: "#d8d6d0",
  violet: "#3a2d6b",
  soft: "#EDEBE6",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.ink,
    backgroundColor: C.bone,
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 42,
  },
  brand: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: C.violet,
    marginBottom: 6,
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 22,
    color: C.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 18,
    maxWidth: 420,
    lineHeight: 1.45,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  metaBlock: {
    maxWidth: "48%",
  },
  metaLabel: {
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    color: C.ink,
    lineHeight: 1.4,
  },
  h2: {
    fontFamily: "Times-Roman",
    fontSize: 13,
    marginTop: 14,
    marginBottom: 8,
    color: C.ink,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  rowName: {
    flexGrow: 1,
    paddingRight: 12,
    maxWidth: "72%",
  },
  rowTitle: {
    fontSize: 9.5,
    color: C.ink,
  },
  rowDesc: {
    fontSize: 8,
    color: C.muted,
    marginTop: 2,
    lineHeight: 1.35,
  },
  rowPrice: {
    fontSize: 9.5,
    color: C.ink,
    textAlign: "right",
  },
  note: {
    fontSize: 8,
    color: C.muted,
    marginTop: 6,
    lineHeight: 1.4,
  },
  summaryBox: {
    backgroundColor: C.soft,
    padding: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryStrong: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  strongText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  chip: {
    fontSize: 8,
    color: C.violet,
    marginTop: 2,
  },
  listItem: {
    fontSize: 9,
    color: C.ink,
    marginBottom: 3,
    paddingLeft: 8,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: C.muted,
    borderTopWidth: 0.5,
    borderTopColor: C.line,
    paddingTop: 8,
  },
  twoCol: {
    flexDirection: "row",
    gap: 18,
  },
  col: {
    flex: 1,
  },
});

function Money({
  value,
  withVat,
}: {
  value: number | null | undefined;
  withVat?: boolean;
}) {
  return <Text style={styles.rowPrice}>{formatEurPdfWithTaxNote(value, { withVat })}</Text>;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.h2}>{children}</Text>;
}

function LineRow({
  name,
  description,
  priceEur,
}: {
  name: string;
  description?: string;
  priceEur: number | null;
}) {
  return (
    <View style={styles.row} wrap={false}>
      <View style={styles.rowName}>
        <Text style={styles.rowTitle}>{name}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      <Money value={priceEur} />
    </View>
  );
}

export function QuotePdfDocument({ model }: { model: QuotePdfModel }) {
  const packBase =
    model.product.packPriceEur != null
      ? model.product.packPriceEur
      : model.totals.subtotalEur - model.extrasTotalEur;

  return (
    <Document
      title={`${model.documentTitle} · ${model.product.name}`}
      author={model.brand.name}
      subject={`Presupuesto ${model.product.name}`}
      creator={model.brand.name}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{model.brand.name}</Text>
        <Text style={styles.title}>{model.documentTitle}</Text>
        <Text style={styles.subtitle}>{model.product.summary}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Cliente</Text>
            <Text style={styles.metaValue}>{model.client.name}</Text>
            {model.client.company ? (
              <Text style={styles.metaValue}>{model.client.company}</Text>
            ) : null}
            <Text style={styles.metaValue}>{model.client.email}</Text>
            <Text style={styles.metaValue}>{model.client.phone}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Proyecto</Text>
            <Text style={styles.metaValue}>{model.product.name}</Text>
            <Text style={[styles.metaValue, { marginTop: 8 }]}>
              Fecha: {formatDatePdf(model.issuedAt)}
            </Text>
            <Text style={styles.metaValue}>
              Válido hasta: {formatDatePdf(model.validUntil)}
            </Text>
            <Text style={styles.chip}>Ref. {model.quoteId}</Text>
          </View>
        </View>

        <SectionTitle>Resumen</SectionTitle>
        <View style={styles.summaryBox}>
          <View style={styles.summaryLine}>
            <Text>Producto</Text>
            <Text>{model.product.name}</Text>
          </View>
          {model.product.packPriceEur != null ? (
            <View style={styles.summaryLine}>
              <Text>Precio del pack (sin IVA)</Text>
              <Text>{formatEurPdf(model.product.packPriceEur)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryLine}>
            <Text>Extras (sin IVA)</Text>
            <Text>{formatEurPdf(model.extrasTotalEur)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Mantenimiento</Text>
            <Text>
              {model.maintenance.selected && model.maintenance.monthlyEur != null
                ? `${formatEurPdf(model.maintenance.monthlyEur)}/mes + IVA`
                : "No incluido ahora"}
            </Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Subtotal (sin IVA)</Text>
            <Text>{formatEurPdf(model.totals.subtotalEur)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>IVA ({formatPercentPdf(model.totals.vatRate)})</Text>
            <Text>{formatEurPdf(model.totals.vatEur)}</Text>
          </View>
          <View style={styles.summaryStrong}>
            <Text style={styles.strongText}>Total (con IVA)</Text>
            <Text style={styles.strongText}>{formatEurPdf(model.totals.totalEur)}</Text>
          </View>
        </View>
        <Text style={styles.note}>{model.orientativeNote}</Text>

        {model.includedLines.length > 0 ? (
          <>
            <SectionTitle>Qué incluye el pack</SectionTitle>
            {model.includedLines.map((line) => (
              <LineRow
                key={line.id}
                name={line.name}
                description={line.description}
                priceEur={line.priceEur}
              />
            ))}
            {model.bundleValueEur > 0 ? (
              <Text style={styles.note}>
                Valor de referencia de las partidas:{" "}
                {formatEurPdfWithTaxNote(model.bundleValueEur)}.{" "}
                {model.packValueNote}
              </Text>
            ) : null}
          </>
        ) : null}

        {model.extras.length > 0 ? (
          <>
            <SectionTitle>Extras seleccionados</SectionTitle>
            {model.extras.map((line) => (
              <LineRow
                key={line.id}
                name={line.name}
                description={line.description}
                priceEur={line.priceEur}
              />
            ))}
          </>
        ) : null}

        <SectionTitle>Valor del proyecto</SectionTitle>
        <View style={styles.summaryBox}>
          {model.bundleValueEur > 0 ? (
            <View style={styles.summaryLine}>
              <Text>Valor de referencia de las partidas (sin IVA)</Text>
              <Text>{formatEurPdf(model.bundleValueEur)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryLine}>
            <Text>Extras (sin IVA)</Text>
            <Text>{formatEurPdf(model.extrasTotalEur)}</Text>
          </View>
          {model.bundleValueEur > 0 ? (
            <View style={styles.summaryLine}>
              <Text>Valor de referencia total (sin IVA)</Text>
              <Text>
                {formatEurPdf(model.bundleValueEur + model.extrasTotalEur)}
              </Text>
            </View>
          ) : null}
          {model.product.packPriceEur != null ? (
            <View style={styles.summaryLine}>
              <Text>Precio del pack (sin IVA)</Text>
              <Text>{formatEurPdf(model.product.packPriceEur)}</Text>
            </View>
          ) : packBase > 0 ? (
            <View style={styles.summaryLine}>
              <Text>Base del proyecto (sin IVA)</Text>
              <Text>{formatEurPdf(packBase)}</Text>
            </View>
          ) : null}
          {model.packSavingsEur != null && model.packSavingsEur > 0 ? (
            <View style={styles.summaryLine}>
              <Text>Ahorro por contratación conjunta (sin IVA)</Text>
              <Text>{formatEurPdf(model.packSavingsEur)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryLine}>
            <Text>Subtotal (sin IVA)</Text>
            <Text>{formatEurPdf(model.totals.subtotalEur)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>IVA ({formatPercentPdf(model.totals.vatRate)})</Text>
            <Text>{formatEurPdf(model.totals.vatEur)}</Text>
          </View>
          <View style={styles.summaryStrong}>
            <Text style={styles.strongText}>Total (con IVA)</Text>
            <Text style={styles.strongText}>{formatEurPdf(model.totals.totalEur)}</Text>
          </View>
        </View>

        <SectionTitle>Mantenimiento</SectionTitle>
        {model.maintenance.selected && model.maintenance.monthlyEur != null ? (
          <>
            <View style={styles.row}>
              <View style={styles.rowName}>
                <Text style={styles.rowTitle}>{model.maintenance.name}</Text>
                <Text style={styles.rowDesc}>{model.maintenance.summary}</Text>
              </View>
              <Text style={styles.rowPrice}>
                {formatEurPdf(model.maintenance.monthlyEur)}/mes + IVA
              </Text>
            </View>
            {model.maintenance.includes.map((item) => (
              <Text key={item} style={styles.listItem}>
                · {item}
              </Text>
            ))}
          </>
        ) : (
          <Text style={styles.note}>{model.maintenance.noteWhenNotSelected}</Text>
        )}

        {(model.product.includes.length > 0 ||
          model.product.doesNotInclude.length > 0) && (
          <>
            <SectionTitle>Alcance</SectionTitle>
            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.metaLabel}>Suele incluir</Text>
                {model.product.includes.map((item) => (
                  <Text key={item} style={styles.listItem}>
                    · {item}
                  </Text>
                ))}
              </View>
              <View style={styles.col}>
                <Text style={styles.metaLabel}>No incluye</Text>
                {model.product.doesNotInclude.map((item) => (
                  <Text key={item} style={styles.listItem}>
                    · {item}
                  </Text>
                ))}
              </View>
            </View>
          </>
        )}

        <SectionTitle>Contexto del proyecto</SectionTitle>
        <View style={styles.summaryBox}>
          <View style={styles.summaryLine}>
            <Text>Negocio</Text>
            <Text>{model.context.business}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Objetivo</Text>
            <Text>{model.context.goal}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Situación actual</Text>
            <Text>{model.context.situation}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Principal freno</Text>
            <Text>{model.context.blocker}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text>Plazo</Text>
            <Text>{model.context.timeline}</Text>
          </View>
        </View>

        <SectionTitle>Condiciones</SectionTitle>
        {model.terms.map((term) => (
          <Text key={term} style={styles.listItem}>
            · {term}
          </Text>
        ))}

        <View style={styles.footer} fixed>
          <Text>
            {model.brand.name} · {model.brand.siteUrl}
          </Text>
          <Text>
            {model.brand.email} · {model.brand.location}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
