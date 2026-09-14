import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import Footer from "@/components/layout/Footer";
import { siteUrl } from "@/lib/site";
import { getSocialCards } from "@/lib/queries";

/**
 * Script anti-flash: imposta data-theme PRIMA del rendering React,
 * leggendo localStorage "pa-theme" oppure prefers-color-scheme.
 * 100% blocking, inline, no dipendenze, no hydration mismatch.
 */
const themeInitScript = `
(function(){
  try {
    var k = 'pa-theme';
    var t = localStorage.getItem(k);
    if (t !== 'day' && t !== 'night') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'day');
  }
})();
`;

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const BASE = siteUrl();
const DESCRIPTION =
  "Princess Academy trasforma feste ed eventi in esperienze magiche e indimenticabili.";

export const metadata: Metadata = {
  title: {
    default: "Princess Academy | Magical Party Experience",
    template: "%s | Princess Academy",
  },
  description: DESCRIPTION,
  keywords: [
    "princess party",
    "feste bambini",
    "principesse feste",
    "compleanni bambini",
    "animazione matrimoni",
    "eventi aziendali famiglie",
    "meet and greet principesse",
    "spettacoli bambini",
    "Princess Academy",
  ],
  authors: [{ name: "Princess Academy" }],
  creator: "Princess Academy",
  metadataBase: new URL(BASE),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Princess Academy | Magical Party Experience",
    description: DESCRIPTION,
    url: BASE,
    siteName: "Princess Academy",
    locale: "it_IT",
    type: "website",
    images: [{ url: "/logo.png", width: 352, height: 372, alt: "Logo Princess Academy — Magical Party Experience" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Princess Academy | Magical Party Experience",
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const socialCards = await getSocialCards();
  const socialUrls = {
    instagram: socialCards.find((c) => c.icon === "instagram")?.url,
    facebook: socialCards.find((c) => c.icon === "facebook")?.url,
  };

  return (
    <html lang="it" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-page font-body text-body">
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-princess-700"
        >
          Salta al contenuto
        </a>
        <AppShell footer={<Footer />} socialUrls={socialUrls}>{children}</AppShell>
      </body>
    </html>
  );
}
