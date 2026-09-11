import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDatePdf } from "@/lib/pdf/format";
import type { LabReportModel } from "@/lib/lab/report";
import type { LabAction, LabStep } from "@/lib/lab/types";

/**
 * Documento PDF del laboratorio.
 *
 * Solo usa primitivas y fuentes integradas de @react-pdf/renderer, igual que
 * el PDF comercial: sin `Font.register` ni assets, para que el render en
 * servidor no dependa del sistema de ficheros.
 */

const C = {
  ink: "#070b13",
  bone: "#F3F1EB",
  muted: "#4a4f5a",
  line: "#d8d6d0",
  violet: "#3a2d6b",
  soft: "#EDEBE6",
  real: "#1f5d3a",
  sim: "#6b5410",
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 18,
    maxWidth: 430,
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
  metaBlock: { maxWidth: "48%" },
  metaLabel: {
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 3,
  },
  metaValue: { fontSize: 10, lineHeight: 1.4 },
  h2: {
    fontFamily: "Times-Roman",
    fontSize: 13,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: C.soft,
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  quote: {
    fontSize: 10,
    lineHeight: 1.5,
    color: C.ink,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridCell: { width: "50%", paddingRight: 10, marginBottom: 9 },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  stepIndex: {
    width: 22,
    fontSize: 8,
    color: C.muted,
    paddingTop: 1,
  },
  stepBody: { flexGrow: 1, paddingRight: 10, maxWidth: "72%" },
  stepLabel: { fontSize: 10, marginBottom: 2 },
  stepDetail: { fontSize: 8.5, color: C.muted, lineHeight: 1.4 },
  tag: {
    fontSize: 7.5,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    paddingTop: 2,
    textAlign: "right",
    width: 74,
  },
  tagReal: { color: C.real },
  tagSim: { color: C.sim },
  bullet: {
    flexDirection: "row",
    marginBottom: 5,
  },
  bulletDot: { width: 10, fontSize: 9, color: C.muted },
  bulletText: { flexGrow: 1, fontSize: 9.5, lineHeight: 1.45, maxWidth: "94%" },
  note: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.line,
    fontSize: 8.5,
    color: C.muted,
    lineHeight: 1.45,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: C.muted,
  },
});

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  }).format(date);
}

function StepLine({ step, index }: { step: LabStep; index: number }) {
  const real = step.executionMode === "real";
  return (
    <View style={styles.stepRow} wrap={false}>
      <Text style={styles.stepIndex}>
        {String(index + 1).padStart(2, "0")}
      </Text>
      <View style={styles.stepBody}>
        <Text style={styles.stepLabel}>{step.label}</Text>
        <Text style={styles.stepDetail}>{step.detail ?? step.description}</Text>
      </View>
      <Text style={[styles.tag, real ? styles.tagReal : styles.tagSim]}>
        {real ? "Real" : "Simulación"}
      </Text>
    </View>
  );
}

function ActionBullet({ action }: { action: LabAction }) {
  return (
    <View style={styles.bullet} wrap={false}>
      <Text style={styles.bulletDot}>·</Text>
      <Text style={styles.bulletText}>
        {action.label} — {action.detail}
      </Text>
    </View>
  );
}

export function LabReportDocument({ model }: { model: LabReportModel }) {
  const { visitor, classification, route } = model;

  return (
    <Document
      title={`Informe de automatización · ${model.runId.slice(0, 8)}`}
      author="AGI theCreator"
      subject="Traza de una ejecución del laboratorio de automatización"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>AGI theCreator · Laboratorio</Text>
        <Text style={styles.title}>Informe de automatización</Text>
        <Text style={styles.subtitle}>
          Traza de la ejecución que has lanzado. Recoge lo que entró, cómo lo
          clasificó el sistema, qué ruta eligió y qué acciones se ejecutaron de
          verdad frente a las que solo se representan.
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Solicitante</Text>
            <Text style={styles.metaValue}>
              {visitor.name}
              {"\n"}
              {visitor.email}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Ejecución</Text>
            <Text style={styles.metaValue}>
              {formatDatePdf(model.generatedAt)}
              {"\n"}
              Referencia {model.runId.slice(0, 8)}
            </Text>
          </View>
        </View>

        <Text style={styles.h2}>Entrada recibida</Text>
        <View style={styles.card}>
          <Text style={styles.quote}>{visitor.message}</Text>
        </View>

        <Text style={styles.h2}>Clasificación y decisión</Text>
        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <Text style={styles.metaLabel}>Tipo detectado</Text>
            <Text style={styles.metaValue}>{classification.type}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.metaLabel}>Prioridad</Text>
            <Text style={styles.metaValue}>{classification.priority}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.metaLabel}>Ruta seleccionada</Text>
            <Text style={styles.metaValue}>{route.label}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.metaLabel}>Área responsable</Text>
            <Text style={styles.metaValue}>{route.team}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.metaLabel}>Criterio aplicado</Text>
            <Text style={styles.metaValue}>{classification.reason}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.metaLabel}>Compromiso de la ruta</Text>
            <Text style={styles.metaValue}>{route.sla}</Text>
          </View>
        </View>

        <Text style={styles.h2}>Pasos ejecutados</Text>
        {model.steps.map((step, index) => (
          <StepLine key={step.id} step={step} index={index} />
        ))}

        <Text style={styles.h2}>Acciones reales</Text>
        {model.realActions.length > 0 ? (
          model.realActions.map((action) => (
            <ActionBullet key={action.id} action={action} />
          ))
        ) : (
          <Text style={styles.bulletText}>
            Esta ejecución no completó ninguna acción real.
          </Text>
        )}

        <Text style={styles.h2}>Acciones simuladas</Text>
        {model.simulatedActions.length > 0 ? (
          model.simulatedActions.map((action) => (
            <ActionBullet key={action.id} action={action} />
          ))
        ) : (
          <Text style={styles.bulletText}>Ninguna.</Text>
        )}

        <Text style={styles.h2}>Estado del envío</Text>
        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <Text style={styles.metaLabel}>Último estado del proveedor</Text>
            <Text style={styles.metaValue}>
              {model.emailStatus ?? "Sin consultar en el momento del informe"}
            </Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.metaLabel}>Seguimiento programado</Text>
            <Text style={styles.metaValue}>
              {model.followupScheduledAt
                ? formatDateTime(model.followupScheduledAt)
                : "No programado"}
            </Text>
          </View>
        </View>

        <Text style={styles.note}>
          Este informe describe una demostración técnica. Las acciones marcadas
          como simulación no se han ejecutado contra ningún sistema externo. Los
          datos de esta ejecución se conservan de forma temporal y no se usan con
          fines comerciales.
        </Text>

        <View style={styles.footer} fixed>
          <Text>AGI theCreator · Laboratorio de automatización</Text>
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
