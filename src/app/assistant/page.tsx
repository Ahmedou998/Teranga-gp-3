import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";
import { AssistantClient } from "@/components/assistant-client";
import { SiteHeader } from "@/components/site-header";

export default function AssistantPage() {
  return (
    <>
      <SiteHeader/>
      <main className="container feature-page">
        <Link href="/" className="back-link"><ArrowLeft size={15}/> Accueil</Link>
        <div className="feature-heading">
          <span className="eyebrow"><Bot size={15}/> ASSISTANT TERANGA GP</span>
          <h1 className="page-title">Un coup de main pour votre prochain trajet.</h1>
          <p>Posez vos questions sur le fonctionnement du service ou demandez comment chercher une correspondance. L’assistant n’accède ni aux comptes ni aux statuts privés des colis.</p>
        </div>
        <AssistantClient/>
      </main>
    </>
  );
}
