import type { NextRequest } from "next/server";

const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function isLocalMvpEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.LOCAL_MVP_ENABLED === "true";
}

export function isAllowedLocalWrite(request: NextRequest) {
  if (!isLocalMvpEnabled() || !localHosts.has(request.nextUrl.hostname)) return false;

  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.origin === request.nextUrl.origin && localHosts.has(originUrl.hostname);
  } catch {
    return false;
  }
}
