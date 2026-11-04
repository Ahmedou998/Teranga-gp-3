import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { isEmailConfigured } from "@/lib/email";

const handlers = toNextJsHandler(auth);

function configurationError(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    let secureAppUrl = false;
    try {
      secureAppUrl = Boolean(appUrl && new URL(appUrl).protocol === "https:");
    } catch {
      secureAppUrl = false;
    }
    if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32 || !secureAppUrl) {
      return NextResponse.json({ error: "Le service de compte n’est pas encore configuré." }, { status: 503 });
    }
  }
  if (
    request.method === "POST" &&
    (request.nextUrl.pathname.endsWith("/sign-up/email") ||
      request.nextUrl.pathname.endsWith("/request-password-reset") ||
      request.nextUrl.pathname.endsWith("/send-verification-email")) &&
    !isEmailConfigured()
  ) {
    return NextResponse.json({ error: "L’envoi des emails de compte n’est pas encore configuré." }, { status: 503 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const error = configurationError(request);
  return error ?? handlers.GET(request);
}

export async function POST(request: NextRequest) {
  const error = configurationError(request);
  return error ?? handlers.POST(request);
}
