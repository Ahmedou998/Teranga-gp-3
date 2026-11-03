import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TrackingClient } from "@/components/tracking-client";

export default function TrackingPage() {
  return (
    <>
      <SiteHeader/>
      <main className="container feature-page tracking-page">
        <Link href="/" className="back-link"><ArrowLeft size={15}/> Accueil</Link>
        <div className="feature-heading">
          <span className="eyebrow"><PackageCheck size={15}/> SUIVI DU COLIS</span>
          <h1 className="page-title">Chaque étape, en toute clarté.</h1>
          <p>Entrez le code de suivi qui vous a été communiqué pour consulter les étapes enregistrées de votre colis.</p>
        </div>
        <TrackingClient/>
        <p className="tracking-privacy">Le code de suivi donne accès aux informations de progression de votre colis. Ne le partagez qu’avec les personnes concernées.</p>
      </main>
    </>
  );
}
