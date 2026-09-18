import { CONTACT_EMAIL } from "@/lib/contact/info";
import {
  LAB_CONTACT_RETENTION_DEFAULT_DAYS,
  getLabContactRetentionDays,
} from "@/lib/lab/config";

/** Nombre comercial ya publicado en el sitio. No sustituye la identificación legal. */
export const LEGAL_TRADE_NAME = "AGI TheCreator";
export const LEGAL_OPERATOR_PUBLIC_NAME = "Abel";
export const LEGAL_PUBLIC_LOCATION = "Valladolid (España)";
export const LEGAL_SITE_HOST = "agithecreator.com";
export const LEGAL_SITE_URL = "https://agithecreator.com";
export const LEGAL_CONTACT_EMAIL = CONTACT_EMAIL;

/**
 * Identificación del titular: pendientes de completar. No inventar NIF ni domicilio.
 * Valladolid es la ubicación comunicada en el sitio, no un domicilio legal verificado.
 */
export const LEGAL_HOLDER_FULL_NAME = "[NOMBRE COMPLETO DEL TITULAR PENDIENTE]";
export const LEGAL_HOLDER_NIF = "[NIF/DNI PENDIENTE]";
export const LEGAL_HOLDER_ADDRESS =
  "[DOMICILIO A EFECTOS LEGALES PENDIENTE]";
export const LEGAL_HOLDER_PENDING = "[DATOS DEL TITULAR PENDIENTES]";
export const LEGAL_BASIS_PENDING = "[BASE JURÍDICA PENDIENTE DE CONFIRMAR]";
export const LEGAL_TRANSFERS_PENDING =
  "[TRANSFERENCIAS INTERNACIONALES PENDIENTES DE CONFIRMAR]";
export const LEGAL_RETENTION_PENDING =
  "[PLAZO DE CONSERVACIÓN LEGAL PENDIENTE DE CONFIRMAR]";

export const LAB_RUN_TTL_HOURS = 2;

export {
  getLabContactRetentionDays,
  LAB_CONTACT_RETENTION_DEFAULT_DAYS,
};
