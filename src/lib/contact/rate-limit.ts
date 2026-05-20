/**
 * Rate limit en memoria por IP (ventana deslizante).
 * En serverless multi-instancia, considera Upstash Redis + @upstash/ratelimit.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = prune(hits.get(ip) ?? [], now);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);
  return false;
}
