import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
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
  title: "Sistemas para negocios | Webs y automatización que ahorran tiempo",

  description:
    "Diseño webs y sistemas para negocios que quieren vender más y perder menos tiempo. Reservas, automatización, formularios, facturación y procesos conectados.",

  keywords: [
    // Servicios principales
    "diseño web para negocios",
    "crear página web negocio",
    "crear web empresa",
    "desarrollo web profesional",
    "página web para tienda",
    "página web para clínica",
    "página web para restaurante",
    "programador web",

    // Automatización
    "automatización de negocios",
    "automatizar tareas",
    "automatización de procesos",
    "eliminar trabajo manual",
    "ahorrar tiempo negocio",
    "sistema para reservas",
    "automatizar citas",
    "automatizar formularios",
    "automatizar clientes",
    "software para negocios",

    // Casos reales
    "software para clínicas",
    "software para restaurantes",
    "software para gestorías",
    "software para tiendas",
    "software a medida",

    // Intención de búsqueda real
    "cómo conseguir más clientes",
    "cómo ahorrar tiempo negocio",
    "cómo automatizar un negocio",
    "cómo conseguir reservas online",
    "cómo digitalizar una empresa",
    "negocio online",

    // Local
    "programador Valladolid",
    "desarrollo web Valladolid",
    "automatización Valladolid",
    "diseño web Valladolid",
    "software Valladolid",

    // España
    "programador España",
    "automatización España",
    "desarrollo software España",
    "web para empresas España"
  ],

  openGraph: {
    title: "Webs y sistemas que trabajan por tu negocio",

    description:
      "Menos tiempo persiguiendo tareas. Más tiempo haciendo crecer el negocio.",

    url: "https://agithecreator.com",

    siteName: "AGI",

    locale: "es_ES",

    type: "website",
  },

  icons: {
    icon: {
      url: "/logos/FaviconAGI.png",
      type: "image/png",
      sizes: "512x512",
    },

    shortcut: {
      url: "/logos/FaviconAGI.png",
      type: "image/png",
      sizes: "512x512",
    },

    apple: {
      url: "/apple-icon.png",
      type: "image/png",
      sizes: "180x180",
    },
  },

  metadataBase: new URL("https://agithecreator.com"),

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
