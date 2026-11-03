import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/assistant", () => {
  it("rejects malformed or oversized input before contacting the provider", async () => {
    const request = new NextRequest("http://localhost/api/assistant", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "x".repeat(1201) }] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toHaveProperty("error");
  });

  it("keeps the assistant disabled unless explicitly enabled on the server", async () => {
    vi.stubEnv("OPENAI_API_KEY", "server-secret");
    vi.stubEnv("AI_ASSISTANT_ENABLED", "false");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const request = new NextRequest("http://localhost/api/assistant", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "Comment rechercher un trajet ?" }] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls the provider server-side and returns only the assistant text", async () => {
    vi.stubEnv("OPENAI_API_KEY", "server-secret");
    vi.stubEnv("AI_ASSISTANT_ENABLED", "true");
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ choices: [{ message: { content: "Consultez les trajets disponibles." } }] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);
    const request = new NextRequest("http://localhost/api/assistant", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "Comment rechercher un trajet ?" }] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ answer: "Consultez les trajets disponibles." });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.stringify(body)).not.toContain("server-secret");
  });
});
