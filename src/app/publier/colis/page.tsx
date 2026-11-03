import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LocalPublishForm } from "@/components/local-publish-form";
import { isLocalMvpEnabled } from "@/lib/local-mvp";

export default function ShipmentFormPage() {
  return <><SiteHeader/><main className="container" style={{padding:"50px 0 90px",maxWidth:720}}><Link href="/publier" style={{display:"inline-flex",gap:8,alignItems:"center",color:"#607168",fontSize:13,fontWeight:700}}><ArrowLeft size={15}/> Retour</Link><h1 className="page-title" style={{margin:"22px 0 8px"}}>Décrire votre colis</h1><p style={{color:"#718078",lineHeight:1.7}}>Décrivez votre demande et recherchez un trajet correspondant. Le code de suivi est affiché après l’enregistrement ; il ne signifie pas qu’un voyageur a accepté le colis.</p><LocalPublishForm kind="shipment" enabled={isLocalMvpEnabled()}/></main></>;
}
