import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { MatchFinder } from "@/components/match-finder";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TripsPage({ searchParams }: {
  searchParams: Promise<{ origin?: string; destination?: string }>;
}) {
  const params = await searchParams;
  const origin = params.origin?.trim().slice(0, 80);
  const destination = params.destination?.trim().slice(0, 80);
  let trips: {
    id: string;
    origin: string;
    destination: string;
    departureAt: Date;
    availableWeightKg: number;
    pricePerKgXof: number;
  }[] = [];
  let databaseUnavailable = false;

  try {
    trips = await prisma.trip.findMany({
      where: {
        status: "OPEN",
        departureAt: { gte: new Date() },
        ...(origin ? { origin: { contains: origin, mode: "insensitive" } } : {}),
        ...(destination ? { destination: { contains: destination, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        origin: true,
        destination: true,
        departureAt: true,
        availableWeightKg: true,
        pricePerKgXof: true,
      },
      orderBy: { departureAt: "asc" },
      take: 50,
    });
  } catch (error) {
    console.error("Could not load trips page.", error);
    databaseUnavailable = true;
  }

  return <><SiteHeader/><main className="container" style={{padding:"54px 0 90px"}}>
    <Link href="/" style={{display:"inline-flex",alignItems:"center",gap:8,color:"#607168",fontSize:13,fontWeight:700}}><ArrowLeft size={15}/> Accueil</Link>
    <div style={{marginTop:25,display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,flexWrap:"wrap"}}><div><div style={{color:"#087f5b",fontWeight:800,fontSize:12,letterSpacing:".1em"}}>TRAJETS</div><h1 className="page-title" style={{margin:"8px 0"}}>Des trajets entre pays, dans les deux sens.</h1><p style={{color:"#718078",lineHeight:1.6}}>Annonces publiées par des comptes à email confirmé. L’identité et l’itinéraire ne sont pas vérifiés ; les prix en XOF sont indicatifs et aucune réservation n’est proposée.</p></div><Link className="btn btn-primary" href="/publier/trajet">Publier mon trajet <ArrowRight size={16}/></Link></div>
    <MatchFinder initialOrigin={origin} initialDestination={destination}/>
    <div className="trip-grid" style={{display:"grid",gap:16,marginTop:30}}>
      {databaseUnavailable ? <p role="alert">La base de données est momentanément indisponible. Réessayez plus tard.</p> : trips?.length ? trips.map((trip)=><article className="surface trip-card" key={trip.id} style={{padding:22}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#718078"}}><span>ANNONCE PUBLIÉE</span><span style={{color:"#a06a23"}}>IDENTITÉ NON VÉRIFIÉE</span></div><h2 style={{fontSize:22,margin:"18px 0 10px",overflowWrap:"anywhere"}}>{trip.origin} <span style={{color:"#087f5b"}}>→</span> {trip.destination}</h2><div style={{color:"#718078",fontSize:13,display:"flex",gap:7,alignItems:"center"}}><MapPin size={14}/>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(trip.departureAt)}</div><div style={{borderTop:"1px solid #edf0eb",marginTop:18,paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}><span>{trip.availableWeightKg} kg disponibles</span><strong>{new Intl.NumberFormat("fr-FR").format(trip.pricePerKgXof)} XOF/kg · indicatif</strong></div></article>) : <p>Aucun trajet disponible pour ces critères. <Link href="/publier/trajet" style={{color:"#087f5b",fontWeight:700}}>Publier le premier trajet</Link>.</p>}
    </div>
  </main></>;
}
