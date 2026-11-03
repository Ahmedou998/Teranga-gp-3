"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, LoaderCircle, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export function AssistantClient() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour ! Je peux vous expliquer comment fonctionne Teranga GP ou vous aider à chercher un trajet." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const prompts = [
    "Comment décrire mon colis sans oublier les informations utiles ?",
    "Comment savoir si un trajet correspond à mon itinéraire et à mon poids ?",
    "Quelles sont les étapes du suivi d’un colis ?",
  ];

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-8) }),
      });
      const result = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !result.answer) {
        setError(result.error || "L’assistant n’a pas pu répondre.");
        return;
      }
      setMessages((current) => [...current, { role: "assistant", content: result.answer! }]);
    } catch {
      setError("Impossible de joindre l’assistant. Vérifiez votre connexion puis réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface assistant-panel" aria-label="Assistant Teranga GP">
      <div className="assistant-messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
            {message.role === "assistant" && <span className="chat-avatar"><Bot size={17}/></span>}
            <p>{message.content}</p>
          </div>
        ))}
        {loading && <div className="chat-message assistant"><span className="chat-avatar"><Bot size={17}/></span><p><LoaderCircle size={16} className="spin"/> Je prépare une réponse…</p></div>}
      </div>
      <div className="assistant-tools">
        <p>Questions fréquentes</p>
        <div className="assistant-prompts">
          {prompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => setInput(prompt)} disabled={loading}>
              {prompt}
            </button>
          ))}
        </div>
        <nav className="assistant-shortcuts" aria-label="Actions Teranga GP">
          <Link href="/publier/colis">Décrire un colis</Link>
          <Link href="/trajets">Chercher un trajet</Link>
          <Link href="/suivi">Consulter un suivi</Link>
        </nav>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form className="assistant-form" onSubmit={sendMessage}>
        <label className="sr-only" htmlFor="assistant-question">Votre question</label>
        <input id="assistant-question" value={input} onChange={(event) => setInput(event.target.value)} maxLength={1200} placeholder="Ex. Comment trouver un trajet ?" disabled={loading}/>
        <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()} aria-label="Envoyer la question"><ArrowRight size={18}/></button>
      </form>
      <p className="privacy-note"><Sparkles size={14}/> Évitez les informations personnelles, codes de suivi et coordonnées de paiement. Les messages sont envoyés au fournisseur IA configuré pour générer la réponse.</p>
    </section>
  );
}
