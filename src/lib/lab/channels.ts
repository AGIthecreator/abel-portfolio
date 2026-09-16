import type { LabBlockId, LabExecutionMode } from "./types";

/**
 * Canales de entrada del Acto 3.
 *
 * Ninguno dispara una integración real. El formulario del Acto 1 sí ejecuta
 * el proceso; aquí solo se representa que el mismo flujo puede nacer en
 * sitios distintos.
 */

export type LabChannelId = "formulario" | "whatsapp" | "email" | "chat";

export interface LabChannel {
  id: LabChannelId;
  label: string;
  badge: string;
  entryBlock: LabBlockId;
  inbound: string;
  executionMode: LabExecutionMode;
}

export const LAB_CHANNELS: readonly LabChannel[] = [
  {
    id: "formulario",
    label: "Formulario",
    badge: "Simulación interactiva",
    entryBlock: "formulario",
    inbound: "Quiero presupuesto para una web.",
    executionMode: "simulated",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    badge: "Simulación",
    entryBlock: "entrada_whatsapp",
    inbound: "Hola, quería información sobre una web para mi negocio.",
    executionMode: "simulated",
  },
  {
    id: "email",
    label: "Email",
    badge: "Simulación",
    entryBlock: "entrada_email",
    inbound: "Solicito información sobre vuestros servicios.",
    executionMode: "simulated",
  },
  {
    id: "chat",
    label: "Web / Chat",
    badge: "Simulación",
    entryBlock: "entrada_chat",
    inbound: "¿Podéis ayudarme a organizar las reservas?",
    executionMode: "simulated",
  },
];

export function getLabChannel(id: LabChannelId): LabChannel {
  return LAB_CHANNELS.find((channel) => channel.id === id) ?? LAB_CHANNELS[0];
}

export function channelFromEntryBlock(blockId: LabBlockId): LabChannel {
  return (
    LAB_CHANNELS.find((channel) => channel.entryBlock === blockId) ??
    LAB_CHANNELS[0]
  );
}
