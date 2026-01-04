import "@/lib/ssr-polyfill";
import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import dynamic from "next/dynamic";

// Dynamically import PWARegister with SSR disabled to prevent server-side errors
const PWARegister = dynamic(
  () => import("@/components/pwa-register").then((mod) => mod.PWARegister),
  { ssr: false }
);

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "APIMENTADAS 🌶️",
  description: "Cartas que aquecem. Decisões que mudam o clima. Momentos que não se repetem.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "APIMENTADAS",
  },
  applicationName: "APIMENTADAS",
  keywords: ["apimentadas", "jogo adulto", "casais", "trios", "grupos", "gamificado", "pwa", "picante"],
  authors: [{ name: "APIMENTADAS" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#dc2626" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="APIMENTADAS" />

        {/* Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Prevent zooming on iOS inputs */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="font-sans">
        <PWARegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
