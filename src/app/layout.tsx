import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abel González | Ingeniería de Sistemas y Eficiencia Operativa",
  description:
    "Desarrollo software propio para eliminar tareas manuales en negocios. Recupera tu tiempo y mejora tus márgenes con sistemas que funcionan solos y sin cuotas mensuales.",
  keywords: [
    "automatización de negocios",
    "desarrollo de software a medida",
    "ingeniería de sistemas",
    "ahorro de tiempo operativa",
    "eliminar tareas manuales",
    "sistemas de pago Stripe",
    "SaaS Valladolid",
    "programador Valladolid",
    "consultoría tecnológica España",
    "software para clínicas",
    "automatización para gestorías",
    "AGI theCreator",
  ],
  openGraph: {
    title: "Abel González | Sistemas que trabajan por ti",
    description:
      "Programo el motor que devuelve el tiempo a tu negocio. Tecnología de autor en Valladolid.",
    url: "https://agithecreator.com",
    siteName: "Abel González - AGI",
    locale: "es_ES",
    type: "website",
  },
  icons: {
    icon: { url: "/logos/FaviconAGI.png", type: "image/png", sizes: "512x512" },
    shortcut: { url: "/logos/FaviconAGI.png", type: "image/png", sizes: "512x512" },
    apple: { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070b13]`}>
        {children}
      </body>
    </html>
  );
}
