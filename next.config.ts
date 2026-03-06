import type { NextConfig } from "next";

// Nota: `appIsrStatus` no está tipado en `NextConfig` en esta versión.
// Lo mantenemos igualmente (Next lo entiende) y hacemos un cast para evitar error TS.
const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
  } as unknown as NextConfig["devIndicators"],
} satisfies NextConfig;

export default nextConfig;
