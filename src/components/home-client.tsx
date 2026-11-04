"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Clock3, MapPin, PackageCheck, ShieldCheck, Sparkles, Truck, Wallet, Waypoints } from "lucide-react";

export function HomeClient() {
  const [origin, setOrigin] = useState("Dakar, Sénégal");
  const [destination, setDestination] = useState("Paris, France");
  return (
    <>
      <section className="home-hero" style={{ padding: "76px 0 64px", overflow: "hidden" }}>
        <div className="container hero-layout" style={{ display: "grid", alignItems: "center", gap: 54 }}>
          <div className="reveal">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 13px", borderRadius: 99, background: "#eaf3e9", color: "#087f5b", fontSize: 12, fontWeight: 800, letterSpacing: ".04em" }}>
              <Sparkles size={14}/> LE TRANSPORT COLLABORATIF, AFRIQUE ↔ EUROPE
            </div>
            <h1 className="display" style={{ fontSize: "clamp(44px,6vw,72px)", lineHeight: 1.04, margin: "24px 0 20px", maxWidth: 650 }}>
              Votre colis a déjà <span style={{ color: "#087f5b" }}>un voyage</span> à faire.
            </h1>
            <p style={{ color: "#66766f", fontSize: 18, lineHeight: 1.7, maxWidth: 540, margin: "0 0 28px" }}>
              Publiez de vraies annonces de colis ou de trajet entre le Sénégal et la France. Les annonces sont visibles publiquement après confirmation de l’adresse email.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="btn btn-primary" href="/publier">Envoyer un colis <ArrowUpRight size={17}/></Link>
              <Link className="btn btn-light" href="/trajets">Je voyage, je transporte <ArrowRight size={17}/></Link>
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 34, color: "#64736b", fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ display: "flex", gap: 7, alignItems: "center" }}><ShieldCheck size={16} color="#087f5b"/> Confiance au cœur du service</span>
              <span style={{ display: "flex", gap: 7, alignItems: "center" }}><MapPin size={16} color="#087f5b"/> Afrique et Europe, dans les deux sens</span>
            </div>
          </div>
          <div style={{ position: "relative", minHeight: 440 }} className="hero-art float reveal reveal-delay">
            <div className="soft-grid" style={{ position: "absolute", inset: "10px 0 0 20px", borderRadius: 36, backgroundColor: "#eaf0e7" }}/>
            <div className="surface hero-demo-card" style={{ position: "absolute", top: 45, left: 10, right: 25, padding: 24, transform: "rotate(-2deg)" }}>
              <div className="hero-demo-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <div><div className="hero-demo-kicker" style={{ color: "#718078", fontSize: 12, fontWeight: 700 }}>ZONE DU PILOTE</div><strong className="hero-route-title" style={{ fontSize: 20 }}>Sénégal <span style={{ color: "#087f5b" }}>↔</span> France</strong></div>
                <span className="hero-demo-badge" style={{ background: "#eaf5e9", color: "#087f5b", borderRadius: 99, padding: "7px 10px", fontSize: 11, fontWeight: 800 }}>PILOTE</span>
              </div>
              <div className="hero-route-art" style={{ height: 150, borderRadius: 18, background: "linear-gradient(135deg,#e5efe4,#f5f5e9)", position: "relative", overflow: "hidden", display: "grid", placeItems: "center" }}>
                <svg viewBox="0 0 420 150" width="100%" height="100%" aria-label="Illustration stylisée d'un itinéraire">
                  <path d="M0 112 C70 100 72 36 145 58 S250 132 315 70 S370 35 420 44" stroke="#b6cbb5" strokeWidth="2" fill="none" strokeDasharray="5 7"/>
                  <path className="route-line" d="M35 100 C100 80 100 50 160 61 S255 117 310 71 S360 48 390 48" stroke="#087f5b" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <circle cx="35" cy="100" r="7" fill="#087f5b"/><circle cx="390" cy="48" r="7" fill="#d7f36a" stroke="#087f5b" strokeWidth="3"/>
                  <circle className="route-pulse" cx="35" cy="100" r="15" fill="#087f5b" opacity=".12"/><circle className="route-pulse" cx="390" cy="48" r="15" fill="#087f5b" opacity=".12"/>
                  <text x="24" y="132" fill="#43554c" fontSize="11">Dakar</text><text x="365" y="26" fill="#43554c" fontSize="11">Paris</text>
                </svg>
                <div className="hero-route-caption" style={{ position: "absolute", bottom: 12, right: 12, background: "white", borderRadius: 10, padding: "7px 10px", fontSize: 11, fontWeight: 700 }}>Zone couverte par le pilote</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldCheck size={28} color="#087f5b"/>
                  <div><strong style={{ fontSize: 13 }}>Email confirmé</strong><div style={{ color: "#78867e", fontSize: 11 }}>Identité non vérifiée</div></div>
                </div>
                <div style={{ textAlign: "right" }}><strong style={{ fontSize: 13 }}>Sans paiement</strong><div style={{ fontSize: 10, color: "#78867e" }}>ni réservation intégrée</div></div>
              </div>
            </div>
            <div className="hero-callout" style={{ position: "absolute", bottom: 5, right: 0, background: "#d7f36a", borderRadius: 18, padding: "16px 19px", boxShadow: "0 14px 30px #183b2420" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#52632d" }}>UN COLIS, UN BON TRAJET</div><div style={{ fontSize: 18, fontWeight: 800 }}>Simplement. Ensemble.</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 76px" }}>
        <form action="/trajets" method="get" className="container surface search-panel" style={{ padding: 24, display: "grid", gap: 14, alignItems: "end" }}>
          <div className="field"><label htmlFor="from">Départ — ville et pays</label><input id="from" name="origin" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Ex. Dakar, Sénégal" /></div>
          <div className="field"><label htmlFor="to">Destination — ville et pays</label><input id="to" name="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Ex. Paris, France" /></div>
          <button className="btn btn-primary" type="submit">Rechercher <ArrowRight size={16}/></button>
        </form>
      </section>

      <section id="fonctionnement" style={{ padding: "76px 0", background: "#eef2eb" }}>
        <div className="container">
          <div style={{ maxWidth: 620, marginBottom: 36 }}><div style={{ color: "#087f5b", fontWeight: 800, fontSize: 12, letterSpacing: ".1em" }}>LE PILOTE</div><h2 style={{ fontSize: 42, margin: "12px 0" }}>Des annonces réelles, sans promesse fictive.</h2><p style={{ color: "#66766f", lineHeight: 1.7 }}>Les membres confirment leur adresse email pour publier. Les annonces sont consultables ; l’identité, les trajets et les colis ne sont pas vérifiés. La prise de contact, les réservations, le paiement et la livraison restent hors service.</p></div>
          <div className="steps-grid" style={{ display: "grid", gap: 18 }}>
            {[{n:"01",icon:<PackageCheck/>,title:"Créez un compte",desc:"Confirmez votre adresse email et publiez en votre nom."},{n:"02",icon:<Waypoints/>,title:"Publiez une annonce",desc:"Décrivez un trajet ou une demande réelle entre Sénégal et France."},{n:"03",icon:<BadgeCheck/>,title:"Consultez les annonces",desc:"Parcourez les trajets et demandes publiés par les membres."}].map(x=><div className="surface step-card" key={x.n} style={{ padding: 25 }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><div style={{ width:46,height:46,borderRadius:15,background:"#eaf5e9",color:"#087f5b",display:"grid",placeItems:"center" }}>{x.icon}</div><span style={{ color:"#a4b0a6",fontWeight:800 }}>{x.n}</span></div><h3 style={{ fontSize:20,margin:"22px 0 8px" }}>{x.title}</h3><p style={{ color:"#718078",fontSize:14,lineHeight:1.7,margin:0 }}>{x.desc}</p></div>)}
          </div>
        </div>
      </section>

      <section id="avantages" style={{ padding: "76px 0" }}>
        <div className="container benefits-layout" style={{ display:"grid",gap:54,alignItems:"center" }}>
          <div><div style={{ color:"#087f5b",fontWeight:800,fontSize:12,letterSpacing:".1em" }}>UN PILOTE TRANSPARENT</div><h2 style={{ fontSize:42,lineHeight:1.1,margin:"12px 0 18px" }}>La confiance ne se promet pas. Elle se construit.</h2><p style={{ color:"#66766f",lineHeight:1.8 }}>Une adresse email confirmée est le seul contrôle de compte à ce stade. Aucune vérification d’identité, assurance, prise de contact, réservation ou paiement n’est proposée.</p></div>
          <div className="benefit-grid" style={{ display:"grid",gap:14 }}>
            {[{icon:<ShieldCheck/>,title:"Email confirmé",desc:"La confirmation d’email ne vérifie pas l’identité."},{icon:<Clock3/>,title:"Annonces publiques",desc:"Les trajets et demandes réels sont consultables."},{icon:<Wallet/>,title:"Prix indicatifs",desc:"Aucun paiement n’est traité par la plateforme."},{icon:<Truck/>,title:"Pilote limité",desc:"Zone de lancement : Sénégal ↔ France."}].map(x=><div key={x.title} style={{ background:"#f1f5ef",borderRadius:18,padding:20 }}><div style={{ color:"#087f5b" }}>{x.icon}</div><strong style={{display:"block",margin:"13px 0 6px"}}>{x.title}</strong><span style={{fontSize:12,color:"#718078",lineHeight:1.6}}>{x.desc}</span></div>)}
          </div>
        </div>
      </section>
      <section style={{ padding:"0 0 80px" }}>
        <div className="container cta-panel" style={{ background:"#123c2e",color:"white",borderRadius:28,padding:"44px 42px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,flexWrap:"wrap" }}>
          <div><div style={{ color:"#d7f36a",fontSize:12,fontWeight:800,letterSpacing:".1em" }}>PRÊT À FAIRE LE PREMIER PAS ?</div><h2 style={{ fontSize:36,margin:"10px 0 0" }}>Votre prochain trajet peut aider quelqu&apos;un.</h2></div>
          <Link className="btn" style={{ background:"#d7f36a",color:"#123c2e" }} href="/publier">Publier une annonce <ArrowUpRight size={17}/></Link>
        </div>
      </section>
      <footer style={{ borderTop:"1px solid #e5ebe3",padding:"25px 0",color:"#718078",fontSize:12 }}><div className="container" style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><span>© {new Date().getFullYear()} Teranga GP. Pilote d’annonces réelles Sénégal ↔ France.</span><span>Pas de prise de contact, réservation, paiement ou livraison via le site.</span></div></footer>
    </>
  );
}
