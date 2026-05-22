import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ContactModal } from "@/components/contact/ContactModal";
import { ContactModalProvider } from "@/components/contact/ContactModalContext";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "AGI TheCreator",
  url: "https://agithecreator.com",
  email: "contacto@agithecreator.com",
  description: "Webs y sistemas para negocios",
  areaServed: "España",
};

export const metadata: Metadata = {
  title: "AGI TheCreator | Páginas web y sistemas para negocios",

  description:
    "Creo páginas web y herramientas para negocios que quieren trabajar mejor, atender más rápido y dejar de perder tiempo con tareas que se repiten.",

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
    "web para empresas España",
  ],

  openGraph: {
    title: "AGI TheCreator | Webs y sistemas para negocios",
    description:
      "Desarrollo webs y sistemas que eliminan trabajo manual y ahorran tiempo a negocios.",
    url: "https://agithecreator.com",
    siteName: "AGI TheCreator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator",
      },
    ],
    locale: "es_ES",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AGI TheCreator",
    description: "Webs y sistemas para negocios",
    images: ["/og-image.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/android-chrome-192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070b13]`}
      >
        <ContactModalProvider>
          {children}
          <ContactModal />
          <FloatingWhatsApp />
        </ContactModalProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
