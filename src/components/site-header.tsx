import Link from "next/link";
import { ArrowUpRight, Package2 } from "lucide-react";

export function SiteHeader() {
  return (
    <header style={{ borderBottom: "1px solid #e9eee7", background: "#f7f8f4eF", backdropFilter: "blur(14px)" }}>
      <div className="container" style={{ height: 78, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20 }}>
          <span style={{ width: 38, height: 38, borderRadius: 13, display: "grid", placeItems: "center", background: "#087f5b", color: "white" }}><Package2 size={21}/></span>
          teranga<span style={{ color: "#087f5b" }}>gp</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 26 }} className="desktop-nav">
          <Link className="nav-link" href="#fonctionnement">Comment ça marche</Link>
          <Link className="nav-link" href="#avantages">Pourquoi Teranga GP</Link>
          <Link className="nav-link" href="/trajets">Trouver un trajet</Link>
        </nav>
        <Link className="btn btn-primary" href="/publier">Commencer <ArrowUpRight size={16}/></Link>
      </div>
    </header>
  );
}
