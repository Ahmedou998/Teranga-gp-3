import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { shipment: { findUnique: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "./[code]/route";

describe("GET /api/tracking/:code", () => {
  beforeEach(() => vi.mocked(prisma.shipment.findUnique).mockReset());

  it("rejects malformed tracking codes without querying the database", async () => {
    const response = await GET(new Request("http://localhost/api/tracking/guessable"), {
      params: Promise.resolve({ code: "guessable" }),
    });

    expect(response.status).toBe(400);
    expect(prisma.shipment.findUnique).not.toHaveBeenCalled();
  });

  it("returns only shipment route, current status, and tracking events", async () => {
    const data = {
      origin: "Dakar, Sénégal",
      destination: "Paris, France",
      status: "IN_TRANSIT",
      createdAt: new Date("2026-10-01T10:00:00Z"),
      trackingEvents: [{
        status: "IN_TRANSIT",
        location: "Casablanca",
        note: "Colis en transit",
        createdAt: new Date("2026-10-02T10:00:00Z"),
      }],
    };
    vi.mocked(prisma.shipment.findUnique).mockResolvedValue(data as never);

    const response = await GET(new Request("http://localhost/api/tracking"), {
      params: Promise.resolve({ code: `trk_${"a".repeat(32)}` }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ data: { status: "IN_TRANSIT", trackingEvents: [{ location: "Casablanca" }] } });
    expect(prisma.shipment.findUnique).toHaveBeenCalledOnce();
  });
});
