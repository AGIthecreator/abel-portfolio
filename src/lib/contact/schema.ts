import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_NAME_LENGTH = 120;
export const MAX_COMPANY_LENGTH = 120;

export const contactFormSchema = z.object({
  name: z
    .string()
    .max(MAX_NAME_LENGTH)
    .optional()
    .transform((v) => (v ?? "").trim()),
  email: z
    .string()
    .trim()
    .min(1, "Email requerido")
    .max(254)
    .email("Email inválido"),
  company: z
    .string()
    .max(MAX_COMPANY_LENGTH)
    .optional()
    .transform((v) => (v ?? "").trim()),
  message: z
    .string()
    .trim()
    .min(1, "Mensaje requerido")
    .max(MAX_MESSAGE_LENGTH, `Máximo ${MAX_MESSAGE_LENGTH} caracteres`),
  website: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim()),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
