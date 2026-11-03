import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { upsert: vi.fn() },
    trip: { create: vi.fn() },
    shipment: { create: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST as createTrip } from "./trips/route";
import { POST as createShipment } from "./shipments/route";

function request(path: string, body: unknown, origin = "http://localhost:3000") {
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("local demo creation endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LOCAL_MVP_ENABLED = "false";
  });

  it("keeps trip creation disabled by default", async () => {
    const response = await createTrip(request("/api/trips", {}));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it("rejects cross-origin local writes", async () => {
    process.env.LOCAL_MVP_ENABLED = "true";
    const response = await createShipment(request("/api/shipments", {}, "http://example.com"));

    expect(response.status).toBe(403);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it("creates a local trip with a server-controlled demo user", async () => {
    process.env.LOCAL_MVP_ENABLED = "true";
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "local-user" } as never);
    vi.mocked(prisma.trip.create).mockResolvedValue({
      id: "trip-1",
      origin: "Dakar, Sénégal",
      destination: "Paris, France",
      departureAt: new Date("2030-01-01T10:00:00Z"),
      availableWeightKg: 4,
      pricePerKgXof: 1500,
    } as never);

    const response = await createTrip(request("/api/trips", {
      travelerId: "attacker-controlled",
      origin: "Dakar, Sénégal",
      destination: "Paris, France",
      departureAt: "2030-01-01T10:00:00Z",
      availableWeightKg: 4,
      pricePerKgXof: 1500,
    }));

    expect(response.status).toBe(201);
    expect(prisma.trip.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ travelerId: "local-user" }),
    }));
    await expect(response.json()).resolves.toMatchObject({ data: { id: "trip-1" } });
  });

  it("creates a shipment with a private tracking code and initial event", async () => {
    process.env.LOCAL_MVP_ENABLED = "true";
    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: "local-user" } as never);
    vi.mocked(prisma.shipment.create).mockResolvedValue({
      id: "shipment-1",
      origin: "Dakar, Sénégal",
      destination: "Paris, France",
      status: "SEARCHING",
      trackingCode: `trk_${"a".repeat(32)}`,
    } as never);

    const response = await createShipment(request("/api/shipments", {
      senderId: "attacker-controlled",
      origin: "Dakar, Sénégal",
      destination: "Paris, France",
      description: "Documents administratifs",
      weightKg: 1.5,
    }));

    expect(response.status).toBe(201);
    expect(prisma.shipment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        senderId: "local-user",
        trackingEvents: { create: expect.objectContaining({ status: "SEARCHING" }) },
      }),
    }));
    await expect(response.json()).resolves.toMatchObject({
      data: { id: "shipment-1", trackingCode: `trk_${"a".repeat(32)}` },
    });
  });

  it("rejects invalid trip input without writing", async () => {
    process.env.LOCAL_MVP_ENABLED = "true";
    const response = await createTrip(request("/api/trips", { origin: "Dakar" }));

    expect(response.status).toBe(400);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });
});
