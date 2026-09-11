/**
 * Fetch same-origin del laboratorio.
 *
 * `credentials: "include"` envía la cookie httpOnly `agi_lab_at`. El token
 * nunca vive en sessionStorage: falsificar el runId no basta para leer otra
 * ejecución.
 */
export function labFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}

/** Progreso del participante. Sin PII; falla en silencio para no romper la demo. */
export function reportLabProgress(
  body: { event: "experience"; experience: "decisions" | "builder" } | {
    event: "demo_completed" | "cta_clicked";
  },
): void {
  void labFetch("/api/laboratorio/progreso", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {
    /* la experiencia no depende de este registro */
  });
}
