import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const sample = [
  {from:"Dakar, Sénégal",to:"Paris, France",date:"Exemple de démonstration",price:"—",name:"Trajet fictif",tag:"Non vérifié"},
  {from:"Paris, France",to:"Abidjan, Côte d’Ivoire",date:"Exemple de démonstration",price:"—",name:"Trajet fictif",tag:"Non vérifié"},
  {from:"Casablanca, Maroc",to:"Dakar, Sénégal",date:"Exemple de démonstration",price:"—",name:"Trajet fictif",tag:"Non vérifié"},
  {from:"Dakar, Sénégal",to:"Lisbonne, Portugal",date:"Exemple de démonstration",price:"—",name:"Trajet fictif",tag:"Non vérifié"},
  {from:"Lyon, France",to:"Tunis, Tunisie",date:"Exemple de démonstration",price:"—",name:"Trajet fictif",tag:"Non vérifié"},
  {from:"Accra, Ghana",to:"Bruxelles, Belgique",date:"Exemple de démonstration",price:"—",name:"Trajet fictif",tag:"Non vérifié"},
];

export default async function TripsPage({ searchParams }: { searchParams: Promise<{origin?:string;destination?:string}> }) {
  const params = await searchParams;
  const rows = sample.filter(x => (!params.origin || x.from.toLowerCase().includes(params.origin.toLowerCase())) && (!params.destination || x.to.toLowerCase().includes(params.destination.toLowerCase())));
  return <><SiteHeader/><main className="container" style={{padding:"54px 0 90px"}}>
    <Link href="/" style={{display:"inline-flex",alignItems:"center",gap:8,color:"#607168",fontSize:13,fontWeight:700}}><ArrowLeft size={15}/> Accueil</Link>
    <div style={{marginTop:25,display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,flexWrap:"wrap"}}><div><div style={{color:"#087f5b",fontWeight:800,fontSize:12,letterSpacing:".1em"}}>TRAJETS</div><h1 style={{fontSize:44,margin:"8px 0"}}>Des trajets entre pays, dans les deux sens.</h1><p style={{color:"#718078"}}>Exemples fictifs Afrique ↔ Europe. Le filtre accepte toute ville et tout pays ; aucune annonce affichée ici n’est réelle ou réservable.</p></div><Link className="btn btn-primary" href="/publier/trajet">Publier mon trajet <ArrowRight size={16}/></Link></div>
    <div className="trip-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:30}}>
      {rows.length ? rows.map((x,i)=><article className="surface" key={i} style={{padding:22}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#718078"}}><span>TRAJET EXEMPLE</span><span style={{color:"#a06a23"}}>DÉMO</span></div><h2 style={{fontSize:22,margin:"18px 0 10px"}}>{x.from} <span style={{color:"#087f5b"}}>→</span> {x.to}</h2><div style={{color:"#718078",fontSize:13,display:"flex",gap:7,alignItems:"center"}}><MapPin size={14}/>{x.date}</div><div style={{borderTop:"1px solid #edf0eb",marginTop:18,paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><strong>{x.name}</strong><div style={{fontSize:11,color:"#9a7b48",marginTop:4}}><ShieldCheck size={11} style={{display:"inline",verticalAlign:"middle"}}/> {x.tag}</div></div><strong>{x.price} prix à définir</strong></div></article>) : <p>Aucun exemple ne correspond. Essayez une autre ville ou un autre pays.</p>}
    </div>
  </main></>;
}
