"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Props = {
  kind: "trip" | "shipment";
  enabled: boolean;
};

type CreateResult = {
  data?: { trackingCode?: string };
  error?: string;
};

export function LocalPublishForm({ kind, enabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [description, setDescription] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [published, setPublished] = useState(false);
  const isTrip = kind === "trip";

  async function improveDescription() {
    const text = description.trim();
    if (!text || aiLoading) return;

    setAiLoading(true);
    setAiError("");
    setAiSuggestion("");
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "shipment-description",
          messages: [{ role: "user", content: text }],
        }),
      });
      const result = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !result.answer) {
        setAiError(result.error || "La proposition IA n’a pas pu être générée.");
        return;
      }

      const suggestion = result.answer.trim();
      if (suggestion.length > 500) {
        setAiError("La proposition dépasse la limite de 500 caractères. Raccourcissez votre demande puis réessayez.");
        return;
      }
      setAiSuggestion(suggestion);
    } catch {
      setAiError("Impossible de joindre l’assistant. Vérifiez votre connexion puis réessayez.");
    } finally {
      setAiLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const origin = String(formData.get("origin") ?? "");
    const destination = String(formData.get("destination") ?? "");
    const date = String(formData.get(isTrip ? "departureAt" : "desiredDate") ?? "");
    const parsedDate = date ? new Date(date) : undefined;
    if (parsedDate && !Number.isFinite(parsedDate.getTime())) {
      setError("Indiquez une date valide.");
      return;
    }

    const payload = isTrip
      ? {
          origin,
          destination,
          departureAt: parsedDate?.toISOString(),
          availableWeightKg: Number(formData.get("availableWeightKg")),
          pricePerKgXof: Number(formData.get("pricePerKgXof")),
          notes: String(formData.get("notes") ?? ""),
        }
      : {
          origin,
          destination,
          description: String(formData.get("description") ?? ""),
          weightKg: Number(formData.get("weightKg")),
          desiredDate: parsedDate?.toISOString(),
          budgetXof: formData.get("budgetXof") ? Number(formData.get("budgetXof")) : undefined,
        };

    setLoading(true);
    try {
      const response = await fetch(isTrip ? "/api/trips" : "/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as CreateResult;
      if (!response.ok || !result.data) {
        setError(result.error || "La publication a échoué. Réessayez.");
        return;
      }

      setTrackingCode(result.data.trackingCode ?? "");
      setPublished(true);
      setDescription("");
      setAiSuggestion("");
      form.reset();
    } catch {
      setError("Impossible de joindre le service. Vérifiez la connexion puis réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return (
      <div className="surface" style={{ padding: 22 }}>
        <p style={{ margin: "0 0 16px", color: "#66766f", lineHeight: 1.7 }}>
          Connectez-vous avec une adresse email confirmée pour publier une annonce réelle.
        </p>
        <Link className="btn btn-primary" href={`/connexion?redirect=%2Fpublier%2F${isTrip ? "trajet" : "colis"}`}>
          Créer un compte ou se connecter
        </Link>
      </div>
    );
  }

  return (
    <div>
      <form className="surface local-publish-form" onSubmit={submit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor={`${kind}-origin`}>Ville et pays de départ</label>
            <input id={`${kind}-origin`} name="origin" required minLength={2} maxLength={80} placeholder="Ex. Dakar, Sénégal"/>
          </div>
          <div className="field">
            <label htmlFor={`${kind}-destination`}>Ville et pays d’arrivée</label>
            <input id={`${kind}-destination`} name="destination" required minLength={2} maxLength={80} placeholder="Ex. Paris, France"/>
          </div>
        </div>

        {isTrip ? (
          <>
            <div className="field">
              <label htmlFor="trip-departure">Date et heure du départ</label>
              <input id="trip-departure" name="departureAt" type="datetime-local" required/>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="trip-weight">Capacité disponible (kg)</label>
                <input id="trip-weight" name="availableWeightKg" type="number" min="0.1" max="100" step="0.1" required/>
              </div>
              <div className="field">
                <label htmlFor="trip-price">Prix indicatif (XOF/kg)</label>
                <input id="trip-price" name="pricePerKgXof" type="number" min="1" max="2000000" step="1" required/>
              </div>
            </div>
            <div className="field">
              <label htmlFor="trip-notes">Informations complémentaires (facultatif)</label>
              <textarea id="trip-notes" name="notes" maxLength={500} rows={3} placeholder="Précisez les détails utiles, sans coordonnées personnelles."/>
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="shipment-description">Description du colis</label>
              <textarea id="shipment-description" name="description" value={description} onChange={(event) => {
                setDescription(event.target.value);
                setAiSuggestion("");
                setAiError("");
              }} required minLength={5} maxLength={500} rows={3} placeholder="Décrivez brièvement le contenu, sans donnée personnelle."/>
              <div className="description-ai">
                <button className="btn btn-light" type="button" onClick={improveDescription} disabled={!description.trim() || aiLoading || loading}>
                  {aiLoading ? "Rédaction en cours…" : "Améliorer avec l’IA"}
                </button>
                <span>Si l’IA est activée, seule cette description lui sera transmise. N’ajoutez pas de données personnelles.</span>
              </div>
              {aiSuggestion && <div className="ai-suggestion" aria-live="polite">
                <p>{aiSuggestion}</p>
                <button className="btn btn-light" type="button" onClick={() => {
                  setDescription(aiSuggestion);
                  setAiSuggestion("");
                }}>Utiliser cette proposition</button>
              </div>}
              {aiError && <p className="form-error" role="alert">{aiError}</p>}
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="shipment-weight">Poids estimé (kg)</label>
                <input id="shipment-weight" name="weightKg" type="number" min="0.1" max="100" step="0.1" required/>
              </div>
              <div className="field">
                <label htmlFor="shipment-date">Date souhaitée (facultatif)</label>
                <input id="shipment-date" name="desiredDate" type="date"/>
              </div>
            </div>
            <div className="field">
              <label htmlFor="shipment-budget">Budget indicatif en XOF (facultatif)</label>
              <input id="shipment-budget" name="budgetXof" type="number" min="1" max="10000000" step="1"/>
            </div>
          </>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading || aiLoading}>
          {loading ? "Enregistrement…" : isTrip ? "Publier le trajet" : "Publier la demande"}
        </button>
        <small style={{ color: "#718078", lineHeight: 1.6 }}>
          Cette annonce est publique. Ne saisissez pas de coordonnées personnelles. Les annonces et profils ne sont pas vérifiés ; aucune réservation ou transaction n’est créée.
        </small>
      </form>

      {error && <p className="form-error" role="alert">{error}</p>}
      {published && (
        <section className="surface local-publish-success" aria-live="polite">
          <h2>{isTrip ? "Trajet enregistré" : "Demande enregistrée"}</h2>
          <p>Votre annonce est enregistrée et visible publiquement. Elle ne confirme ni réservation ni transport.</p>
          {trackingCode && <>
            <label htmlFor="created-tracking-code">Code à conserver pour consulter les étapes de suivi</label>
            <input id="created-tracking-code" readOnly value={trackingCode} onFocus={(event) => event.currentTarget.select()}/>
          </>}
        </section>
      )}
    </div>
  );
}
