import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function PublishPage() {
  return <><SiteHeader/><main className="container" style={{padding:"54px 0 90px",maxWidth:760}}>
    <Link href="/" style={{display:"inline-flex",alignItems:"center",gap:8,color:"#607168",fontSize:13,fontWeight:700}}><ArrowLeft size={15}/> Retour à l&apos;accueil</Link>
    <div style={{marginTop:28}}><div style={{color:"#087f5b",fontWeight:800,fontSize:12,letterSpacing:".1em"}}>PUBLIER UNE ANNONCE</div><h1 className="page-title" style={{margin:"10px 0"}}>Quel est votre besoin ?</h1><p style={{color:"#718078",lineHeight:1.7}}>Choisissez votre parcours. La publication en base de données sera activée après mise en place de l&apos;authentification sécurisée.</p></div>
    <div className="choice-grid" style={{display:"grid",gap:16,marginTop:28}}>
      <Link href="/publier/colis" className="surface choice-card" style={{padding:24}}><PackagePlus color="#087f5b" size={28}/><h2 style={{fontSize:22,margin:"18px 0 8px"}}>Envoyer un colis</h2><p style={{color:"#718078",fontSize:14,lineHeight:1.6}}>Décrivez votre colis et recherchez un voyageur.</p><strong style={{color:"#087f5b",fontSize:13}}>Créer une demande →</strong></Link>
      <Link href="/publier/trajet" className="surface choice-card" style={{padding:24}}><div style={{fontSize:28}}>↗</div><h2 style={{fontSize:22,margin:"18px 0 8px"}}>Publier un trajet</h2><p style={{color:"#718078",fontSize:14,lineHeight:1.6}}>Vous voyagez ? Déclarez votre itinéraire et votre capacité disponible.</p><strong style={{color:"#087f5b",fontSize:13}}>Proposer un trajet →</strong></Link>
    </div>
    <p style={{fontSize:12,color:"#8a968f",marginTop:22}}>Note : aucune réservation, collecte de fonds ou vérification d&apos;identité n&apos;est actuellement activée.</p>
  </main></>;
}
