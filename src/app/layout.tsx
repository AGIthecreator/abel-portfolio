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
title: "Abel | Arquitecto Digital y Experto en Automatización",
description: "Portfolio de Abel: Especialista en crear ecosistemas digitales escalables y seguros mediante automatizaciones con Make, Airtable y Supabase.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030014]`}>
        {children}
      </body>
    </html>
  );
}
