"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CircleCheck, CircleDot, Package, Search } from "lucide-react";

type TrackingEvent = {
  status: string;
  location: string | null;
  note: string | null;
  createdAt: string;
};

type TrackingResult = {
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
  trackingEvents: TrackingEvent[];
};

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  SEARCHING: "Recherche d’un voyageur",
  MATCHED: "Voyageur trouvé",
  HANDED_OVER: "Colis pris en charge",
  IN_TRANSIT: "En transit",
  ARRIVED: "Arrivé à destination",
  DELIVERED: "Remis au destinataire",
  DISPUTED: "En cours de résolution",
  CANCELLED: "Annulé",
};

export function TrackingClient() {
  const [code, setCode] = useState("");
  const [tracking, setTracking] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setTracking(null);
    try {
      const response = await fetch(`/api/tracking/${encodeURIComponent(code.trim())}`, { cache: "no-store" });
      const result = await response.json() as { data?: TrackingResult; error?: string };
      if (!response.ok || !result.data) {
        setError(result.error || "Le suivi est indisponible.");
        return;
      }
      setTracking(result.data);
    } catch {
      setError("Impossible de joindre le service de suivi. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="surface tracking-form" onSubmit={lookup}>
        <div className="field">
          <label htmlFor="tracking-code">Code de suivi</label>
          <input id="tracking-code" value={code} onChange={(event) => setCode(event.target.value)} minLength={20} maxLength={40} required autoComplete="off" placeholder="Saisissez le code reçu lors de la prise en charge"/>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Recherche…" : <>Suivre mon colis <ArrowRight size={16}/></>}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {tracking && (
        <section className="surface tracking-result" aria-live="polite">
          <div className="tracking-route"><span><Package size={18}/>{tracking.origin}</span><ArrowRight size={17}/><span>{tracking.destination}</span></div>
          <p className="tracking-current">État actuel : <strong>{statusLabels[tracking.status] || tracking.status}</strong></p>
          {tracking.trackingEvents.length ? (
            <ol className="tracking-timeline">
              {tracking.trackingEvents.map((item, index) => (
                <li key={`${item.createdAt}-${index}`} className="tracking-event">
                  <span className="timeline-icon">{index === tracking.trackingEvents.length - 1 ? <CircleDot size={18}/> : <CircleCheck size={18}/>}</span>
                  <div><strong>{statusLabels[item.status] || item.status}</strong>{item.location && <span className="event-location">{item.location}</span>}{item.note && <p>{item.note}</p>}<time dateTime={item.createdAt}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time></div>
                </li>
              ))}
            </ol>
          ) : <p className="tracking-empty"><Search size={17}/> Aucun événement de suivi n’a encore été publié pour ce colis.</p>}
          <p className="tracking-disclaimer">Ce suivi reflète les dernières étapes enregistrées; ce n’est pas une géolocalisation GPS en temps réel.</p>
        </section>
      )}
    </>
  );
}
