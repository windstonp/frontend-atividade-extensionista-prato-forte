import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Providers } from "@/lib/query-client";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prato Forte",
  description:
    "Guia nutricional para quem treina na Zfit: cardápio montado com a comida que você já come.",
  icons: { apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Prato Forte", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#eceee7",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${bricolage.variable} ${instrument.variable} h-full`}
    >
      {/* Extensões do navegador (ColorZilla, Grammarly...) escrevem atributos no body antes da hidratação. */}
      <body className="min-h-dvh bg-papel" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
