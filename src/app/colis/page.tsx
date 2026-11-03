import Link from "next/link";
import { ArrowLeft, ArrowRight, PackageSearch } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  let shipments: {
    id: string;
    origin: string;
    destination: string;
    weightKg: number;
    desiredDate: Date | null;
    budgetXof: number | null;
  }[] = [];
  let databaseUnavailable = false;

  try {
    shipments = await prisma.shipment.findMany({
      where: { status: "SEARCHING" },
      select: {
        id: true,
        origin: true,
        destination: true,
        weightKg: true,
        desiredDate: true,
        budgetXof: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.error("Could not load shipment requests page.", error);
    databaseUnavailable = true;
  }

  return <><SiteHeader/><main className="container" style={{padding:"54px 0 90px"}}>
    <Link href="/" style={{display:"inline-flex",alignItems:"center",gap:8,color:"#607168",fontSize:13,fontWeight:700}}><ArrowLeft size={15}/> Accueil</Link>
    <div style={{marginTop:25,display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,flexWrap:"wrap"}}>
      <div><div style={{color:"#087f5b",fontWeight:800,fontSize:12,letterSpacing:".1em"}}>DEMANDES DE COLIS</div><h1 className="page-title" style={{margin:"8px 0"}}>Des colis à accompagner.</h1><p style={{color:"#718078",lineHeight:1.6}}>Demandes enregistrées dans la démonstration locale ; aucune réservation ou prise de contact n’est disponible.</p></div>
      <Link className="btn btn-primary" href="/publier/colis">Décrire un colis <ArrowRight size={16}/></Link>
    </div>
    <div className="trip-grid" style={{display:"grid",gap:16,marginTop:30}}>
      {databaseUnavailable ? <p role="alert">La base de données est indisponible. Démarrez PostgreSQL pour consulter les demandes.</p> : shipments?.length ? shipments.map((shipment)=><article className="surface trip-card" key={shipment.id} style={{padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#718078"}}><span><PackageSearch size={14} style={{display:"inline",verticalAlign:"middle"}}/> DEMANDE LOCALE</span><span style={{color:"#a06a23"}}>RECHERCHE EN COURS</span></div>
        <h2 style={{fontSize:22,margin:"18px 0 10px",overflowWrap:"anywhere"}}>{shipment.origin} <span style={{color:"#087f5b"}}>→</span> {shipment.destination}</h2>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",color:"#718078",fontSize:13}}>
          <span>{shipment.weightKg} kg{shipment.desiredDate ? ` · souhaité le ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(shipment.desiredDate)}` : ""}</span>
          <strong style={{color:"#132b25"}}>{shipment.budgetXof ? `${new Intl.NumberFormat("fr-FR").format(shipment.budgetXof)} XOF · indicatif` : "Budget non précisé"}</strong>
        </div>
      </article>) : <p>Aucune demande de démonstration en cours. <Link href="/publier/colis" style={{color:"#087f5b",fontWeight:700}}>Créer une demande</Link>.</p>}
    </div>
  </main></>;
}
