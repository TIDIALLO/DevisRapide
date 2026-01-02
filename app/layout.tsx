import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { LoadingBar } from "@/components/ui/loading-bar";
import { OfflineIndicator } from "@/components/offline/offline-indicator";
import { RegisterServiceWorker } from "@/components/offline/register-sw";

// Utilisation d'une police système pour éviter les problèmes de build avec Turbopack
// Les polices Google Fonts peuvent causer des erreurs lors du build sur Vercel
const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const metadata: Metadata = {
  title: "DevisRapide - Devis professionnels en 3 minutes",
  description: "Application de création de devis pour artisans sénégalais",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body style={{ fontFamily }}>
        <RegisterServiceWorker />
        <LoadingBar />
        <OfflineIndicator />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
