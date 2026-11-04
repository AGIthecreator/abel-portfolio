import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ContactChrome } from "@/components/contact/ContactChrome";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentContext";
import { DeferredAnalytics } from "@/components/DeferredAnalytics";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
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
      </body>
    </html>
  );
}
