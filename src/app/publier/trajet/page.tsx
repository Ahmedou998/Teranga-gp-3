import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { LocalPublishForm } from "@/components/local-publish-form";
import { auth } from "@/lib/auth";

export default async function TripFormPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <><SiteHeader/><main className="container" style={{padding:"50px 0 90px",maxWidth:720}}><Link href="/publier" style={{display:"inline-flex",gap:8,alignItems:"center",color:"#607168",fontSize:13,fontWeight:700}}><ArrowLeft size={15}/> Retour</Link><h1 className="page-title" style={{margin:"22px 0 8px"}}>Proposer un trajet</h1><p style={{color:"#718078",lineHeight:1.7}}>Proposez un trajet réel entre le Sénégal et la France. Votre annonce est publiée après connexion avec une adresse email confirmée. Les prix sont indicatifs ; aucune réservation ou transaction n’est intégrée.</p><LocalPublishForm kind="trip" enabled={Boolean(session?.user.emailVerified)}/></main></>;
}
