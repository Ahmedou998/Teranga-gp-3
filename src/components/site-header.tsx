"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, Package2, X } from "lucide-react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={closeMenu} aria-label="Teranga GP, accueil">
          <span className="brand-mark"><Package2 size={21}/></span>
          <span>teranga<span className="brand-accent">gp</span></span>
        </Link>
        <nav className={`site-nav${menuOpen ? " is-open" : ""}`} id="primary-navigation" aria-label="Navigation principale">
          <Link className="nav-link" href="/#fonctionnement" onClick={closeMenu}>Comment ça marche</Link>
          <Link className="nav-link" href="/#avantages" onClick={closeMenu}>Pourquoi Teranga GP</Link>
          <Link className="nav-link" href="/trajets" onClick={closeMenu}>Trouver un trajet</Link>
          <Link className="nav-link" href="/colis" onClick={closeMenu}>Demandes de colis</Link>
          <Link className="nav-link" href="/assistant" onClick={closeMenu}>Assistant IA</Link>
          <Link className="nav-link" href="/suivi" onClick={closeMenu}>Suivi colis</Link>
        </nav>
        <div className="header-actions">
          <Link className="btn btn-primary header-cta" href="/publier">Commencer <ArrowUpRight size={16}/></Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21}/> : <Menu size={21}/>}
          </button>
        </div>
      </div>
    </header>
  );
}
