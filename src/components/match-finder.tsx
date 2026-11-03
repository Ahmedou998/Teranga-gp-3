"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

type TripMatch = {
  id: string;
  origin: string;
  destination: string;
  via: string[];
  departureAt: string;
  availableWeightKg: number;
  pricePerKgXof: number;
};

export function MatchFinder({ initialOrigin = "", initialDestination = "" }: {
  initialOrigin?: string;
  initialDestination?: string;
}) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [weightKg, setWeightKg] = useState("1");
  const [matches, setMatches] = useState<TripMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function findMatches(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMatches(null);
    const query = new URLSearchParams({ origin, destination, weightKg });
    try {
      const response = await fetch(`/api/matching?${query.toString()}`, { cache: "no-store" });
      const result = await response.json() as { data?: TripMatch[]; error?: string };
      if (!response.ok || !result.data) {
        setError(result.error || "La recherche de correspondances a échoué.");
        return;
      }
      setMatches(result.data);
    } catch {
      setError("Impossible de joindre le service de recherche. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="match-section">
      <div className="match-heading">
        <span className="eyebrow"><Sparkles size={14}/> SUGGESTIONS DE TRAJETS</span>
        <h2>Un itinéraire adapté à votre colis</h2>
        <p>Les suggestions utilisent les trajets réels publiés, leur itinéraire et leur capacité disponible.</p>
      </div>
      <form className="surface match-form" onSubmit={findMatches}>
        <div className="field"><label htmlFor="match-origin">Départ</label><input id="match-origin" value={origin} onChange={(event) => setOrigin(event.target.value)} minLength={2} maxLength={80} required placeholder="Ville, pays"/></div>
        <div className="field"><label htmlFor="match-destination">Destination</label><input id="match-destination" value={destination} onChange={(event) => setDestination(event.target.value)} minLength={2} maxLength={80} required placeholder="Ville, pays"/></div>
        <div className="field"><label htmlFor="match-weight">Poids (kg)</label><input id="match-weight" type="number" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} min="0.1" max="100" step="0.1" required/></div>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Recherche…" : <>Trouver des trajets <ArrowRight size={16}/></>}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {matches && (
        <div className="match-results" aria-live="polite">
          <h3>{matches.length ? `${matches.length} trajet${matches.length > 1 ? "s" : ""} correspondant${matches.length > 1 ? "s" : ""}` : "Aucun trajet disponible pour le moment"}</h3>
          {matches.length === 0 && <p>Essayez un autre itinéraire ou revenez plus tard. Les trajets de démonstration ne sont pas inclus dans ces suggestions.</p>}
          {matches.map((trip) => (
            <article className="surface match-card" key={trip.id}>
              <MapPin size={17} aria-hidden="true"/>
              <div className="match-route"><strong>{trip.origin} → {trip.destination}</strong><span>{trip.via.length ? `Via ${trip.via.join(", ")} · ` : ""}{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(trip.departureAt))}</span></div>
              <div className="match-capacity">{trip.availableWeightKg} kg disponibles</div>
              <strong className="match-price">{new Intl.NumberFormat("fr-FR").format(trip.pricePerKgXof)} XOF/kg</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
