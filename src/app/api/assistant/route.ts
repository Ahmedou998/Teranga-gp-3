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
            content: "Tu es l’assistant d’information de Teranga GP. Réponds en français, avec concision et sans inventer d’annonces, de prix, de vérifications ou de statuts de colis. Tu peux expliquer le fonctionnement général et guider vers la recherche de trajets ou le suivi. Précise que les paiements, réservations et publications réelles ne sont pas encore activés. Ne demande jamais de données personnelles, coordonnées bancaires, codes de suivi ou secrets.",
          },
          ...parsed.data.messages,
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
