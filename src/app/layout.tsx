import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teranga GP — Le colis voyage avec vous",
  description: "La plateforme collaborative en préparation pour envoyer et transporter des colis entre les pays d’Afrique et d’Europe, dans les deux sens.",
  applicationName: "Teranga GP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
