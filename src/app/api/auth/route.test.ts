import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { postHandler } = vi.hoisted(() => ({ postHandler: vi.fn() }));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: () => ({ GET: vi.fn(), POST: postHandler }),
}));

vi.mock("@/lib/auth", () => ({ auth: {} }));

import { POST } from "./[...all]/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("authentication email configuration", () => {
  it("does not accept account signups until SMTP is configured", async () => {
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PORT", "");
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASSWORD", "");
    vi.stubEnv("SMTP_FROM", "");

    const request = new NextRequest("http://localhost:3000/api/auth/sign-up/email", { method: "POST" });
    const response = await POST(request);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("email") });
    expect(postHandler).not.toHaveBeenCalled();
  });
});
