import type { NextConfig } from "next";

// Nota: `appIsrStatus` no está tipado en `NextConfig` en esta versión.
// Lo mantenemos igualmente (Next lo entiende) y hacemos un cast para evitar error TS.
const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  } as unknown as NextConfig["devIndicators"],

  /**
   * Reduce imports no utilizados en librerías grandes (mejor tree-shaking / bundling).
   * Muy útil para iconos y paquetes con muchos exports.
   */
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react", "react-icons"],
  },

  /**
   * Separa vendors pesados para acortar cadenas críticas y mejorar cache.
   * (Suma a la estrategia por defecto de Next.)
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      const splitChunks = config.optimization?.splitChunks;
      const cacheGroups =
        splitChunks && typeof splitChunks === "object"
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (splitChunks as any).cacheGroups
          : undefined;

      if (cacheGroups && typeof cacheGroups === "object") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (splitChunks as any).cacheGroups = {
          ...cacheGroups,
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: "framer-motion",
            chunks: "all",
            priority: 40,
          },
          reactIcons: {
            test: /[\\/]node_modules[\\/]react-icons[\\/]/,
            name: "react-icons",
            chunks: "all",
            priority: 35,
          },
          lucideReact: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: "lucide-react",
            chunks: "all",
            priority: 30,
          },
        };
      }
    }

    return config;
  },
};

export default nextConfig;
