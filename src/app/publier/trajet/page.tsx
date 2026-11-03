import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LocalPublishForm } from "@/components/local-publish-form";
import { isLocalMvpEnabled } from "@/lib/local-mvp";

export default function TripFormPage() {
  return <><SiteHeader/><main className="container" style={{padding:"50px 0 90px",maxWidth:720}}><Link href="/publier" style={{display:"inline-flex",gap:8,alignItems:"center",color:"#607168",fontSize:13,fontWeight:700}}><ArrowLeft size={15}/> Retour</Link><h1 className="page-title" style={{margin:"22px 0 8px"}}>Proposer un trajet</h1><p style={{color:"#718078",lineHeight:1.7}}>Indiquez un itinéraire, une date, votre capacité et un prix indicatif en XOF. Les annonces sont enregistrées uniquement dans la base locale de démonstration ; elles ne sont ni réservables ni visibles sur un déploiement public.</p><LocalPublishForm kind="trip" enabled={isLocalMvpEnabled()}/></main></>;
}
