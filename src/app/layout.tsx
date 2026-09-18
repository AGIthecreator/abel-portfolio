import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ContactChrome } from "@/components/contact/ContactChrome";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentContext";
import { DeferredAnalytics } from "@/components/DeferredAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "AGI TheCreator",
  url: "https://agithecreator.com",
  email: "contacto@agithecreator.com",
  description: "Webs y sistemas para negocios",
  areaServed: {
    "@type": "Country",
    name: "España",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Valladolid",
    addressCountry: "ES",
  },
  founder: {
    "@type": "Person",
    name: "Abel",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://agithecreator.com"),
  title: "AGI TheCreator | Páginas web y sistemas para negocios",
  description:
    "Creo páginas web y herramientas para negocios que quieren trabajar mejor, atender más rápido y dejar de perder tiempo con tareas que se repiten.",
  openGraph: {
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
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
        <CookieConsentProvider>
          {children}
          <ContactChrome />
          <CookieConsentBanner />
          <DeferredAnalytics />
        </CookieConsentProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
