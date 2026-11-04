import { NextRequest, NextResponse } from "next/server";
import { assistantRequestSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const requestWindows = new Map<string, { startedAt: number; count: number }>();

function isRateLimited(key: string, now: number): boolean {
  for (const [storedKey, window] of requestWindows) {
    if (now - window.startedAt >= WINDOW_MS) requestWindows.delete(storedKey);
  }

  const window = requestWindows.get(key);
  if (!window || now - window.startedAt >= WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return false;
  }
  if (window.count >= MAX_REQUESTS_PER_WINDOW) return true;
  window.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Le message est invalide ou trop long." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (process.env.AI_ASSISTANT_ENABLED !== "true" || !apiKey) {
    return NextResponse.json(
      { error: "L’assistant IA n’est pas encore configuré." },
      { status: 503 },
    );
  }

  const address = request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()
    ?? "unknown";
  if (isRateLimited(address, Date.now())) {
    return NextResponse.json(
      { error: "Limite temporaire atteinte. Réessayez dans une minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const systemPrompt = parsed.data.mode === "shipment-description"
    ? "Tu es l’assistant de rédaction de Teranga GP. Reformule en français la description d’un colis pour une demande de transport, en 1 à 3 phrases courtes. Retourne uniquement la proposition, sans titre ni commentaire. Utilise uniquement les informations explicitement fournies par l’utilisateur : n’invente jamais le contenu, la valeur, les dimensions, le poids, l’emballage, l’origine, la destination, la conformité ou l’acceptation du colis. Ne déduis pas qu’un objet est autorisé au transport; invite à vérifier les règles applicables si nécessaire. Si le texte est vague, reste général plutôt que de compléter les détails. Ne demande et ne reproduis aucune coordonnée, donnée personnelle ou information de paiement."
    : "Tu es l’assistant d’information de Teranga GP, un pilote de publication d’annonces entre expéditeurs et voyageurs au Sénégal et en France. Réponds en français, avec concision et des conseils pratiques sur la préparation d’une demande et la recherche d’un trajet. Les annonces publiées sont réelles mais l’identité, les trajets et les colis ne sont pas vérifiés. Les correspondances calculées ne garantissent pas la disponibilité, la sécurité, l’acceptation du colis ni une réservation. N’invente jamais d’annonces, de prix, de vérifications, de statuts, de règles douanières ou de garanties. La prise de contact intégrée, la réservation, le paiement et la livraison ne sont pas disponibles. Guide vers /publier/colis et /trajets quand c’est utile. Ne demande jamais de données personnelles, codes de suivi, coordonnées bancaires ou secrets.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...(parsed.data.mode === "shipment-description"
            ? [parsed.data.messages[parsed.data.messages.length - 1]]
            : parsed.data.messages),
        ],
        max_tokens: 350,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Le service IA est momentanément indisponible." },
        { status: 502 },
      );
    }

    const result: unknown = await response.json();
    const content = (result as {
      choices?: Array<{ message?: { content?: unknown } }>;
    }).choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Le service IA n’a pas fourni de réponse exploitable." },
        { status: 502 },
      );
    }
    return NextResponse.json({ answer: content.trim() });
  } catch {
    return NextResponse.json(
      { error: "Impossible de joindre le service IA pour le moment." },
      { status: 502 },
    );
  }
}
