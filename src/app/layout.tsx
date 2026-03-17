import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Abel | Arquitecto Digital y Experto en Automatización",
  description:
    "Portfolio de Abel: Especialista en crear ecosistemas digitales escalables y seguros mediante automatizaciones con Make, Airtable y Supabase.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Abel | Arquitecto Digital y Experto en Automatización",
    description: "Portfolio de Abel: Especialista en crear ecosistemas digitales escalables y seguros mediante automatizaciones con Make, Airtable y Supabase.",
    url: "https://agithecreator.com",
    siteName: "Abel Portfolio",
    images: [
      {
        url: "/QRPaginaweb.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
