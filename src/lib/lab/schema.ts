import { z } from "zod";

export const LAB_MAX_NAME_LENGTH = 120;
export const LAB_MAX_MESSAGE_LENGTH = 800;

/** Entrada del Acto 1. `website` es honeypot: siempre debe llegar vacío. */
export const labRunSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nombre demasiado corto")
    .max(LAB_MAX_NAME_LENGTH),
  email: z.string().trim().min(1, "Email requerido").max(254).email("Email inválido"),
  message: z
    .string()
    .trim()
    .min(10, "Escribe algo más concreto")
    .max(LAB_MAX_MESSAGE_LENGTH, `Máximo ${LAB_MAX_MESSAGE_LENGTH} caracteres`),
  website: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim()),
});

export type LabRunInput = z.infer<typeof labRunSchema>;

/**
 * Entrada de las acciones posteriores a una ejecución.
 *
 * El `runId` no basta: el servidor exige también el token de acceso de la
 * cookie httpOnly. Los datos originales se reenvían para comprobar por hash
 * que coinciden con la ejecución; así una acción posterior no puede afirmar
 * cosas sobre una entrada distinta.
 */
export const labFollowupActionSchema = z.object({
  runId: z.string().trim().uuid("Ejecución no válida"),
  name: z.string().trim().min(2).max(LAB_MAX_NAME_LENGTH),
  email: z.string().trim().min(1).max(254).email(),
  message: z.string().trim().min(10).max(LAB_MAX_MESSAGE_LENGTH),
});

export type LabFollowupActionInput = z.infer<typeof labFollowupActionSchema>;

export const labStatusSchema = z.object({
  runId: z.string().trim().uuid("Ejecución no válida"),
});

/** Operaciones sobre el seguimiento programado. */
export const labFollowupOperationSchema = labFollowupActionSchema.extend({
  operation: z.enum(["schedule", "cancel", "reschedule"]),
  /** Desplazamiento solicitado al reprogramar, en minutos. */
  shiftMinutes: z.number().int().min(1).max(24 * 60).optional(),
});

export type LabFollowupOperationInput = z.infer<
  typeof labFollowupOperationSchema
>;

/** Normaliza el email para deduplicar sin depender de mayúsculas o espacios. */
export function normalizeLabEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Eventos de progreso del participante. Sin PII: el servidor resuelve el
 * contacto con la cookie, no con un email enviado por el cliente.
 */
export const labProgressSchema = z.object({
  event: z.enum(["experience", "demo_completed", "cta_clicked"]),
  experience: z.enum(["decisions", "builder"]).optional(),
});

export type LabProgressInput = z.infer<typeof labProgressSchema>;

export function experiencesFromProgress(
  input: LabProgressInput,
): number | undefined {
  if (input.event !== "experience") return undefined;
  if (input.experience === "decisions") return 2;
  if (input.experience === "builder") return 3;
  return undefined;
}
