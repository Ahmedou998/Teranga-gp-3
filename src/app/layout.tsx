import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teranga GP — Le colis voyage avec vous",
  description: "Publiez des demandes de colis et des trajets entre le Sénégal et la France.",
  applicationName: "Teranga GP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
