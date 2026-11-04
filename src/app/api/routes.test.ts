import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    trip: { findMany: vi.fn(), create: vi.fn() },
    shipment: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { POST as createTrip } from "./trips/route";
import { POST as createShipment } from "./shipments/route";

function request(path: string, body: unknown, origin = "http://localhost:3000") {
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("authenticated announcement endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.api.getSession).mockResolvedValue(null as never);
  });

  it("requires an authenticated account to create a trip", async () => {
    const response = await createTrip(request("/api/trips", {}));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toHaveProperty("error");
    expect(prisma.trip.create).not.toHaveBeenCalled();
  });

  it("requires an authenticated account to create a shipment", async () => {
    const response = await createShipment(request("/api/shipments", {}));

    expect(response.status).toBe(401);
    expect(prisma.shipment.create).not.toHaveBeenCalled();
  });

  it("rejects sessions with an unverified email", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "account-user", emailVerified: false },
    } as never);
    const response = await createTrip(request("/api/trips", {
      origin: "Dakar, Sénégal",
      destination: "Paris, France",
      departureAt: "2030-01-01T10:00:00Z",
      availableWeightKg: 4,
      pricePerKgXof: 1500,
    }));

    expect(response.status).toBe(401);
    expect(prisma.trip.create).not.toHaveBeenCalled();
  });

  it("creates a trip owned by the authenticated user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "account-user", emailVerified: true },
    } as never);
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
      data: expect.objectContaining({ travelerId: "account-user" }),
    }));
    await expect(response.json()).resolves.toMatchObject({ data: { id: "trip-1" } });
  });

  it("creates a shipment owned by the authenticated user", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "account-user", emailVerified: true },
    } as never);
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
        senderId: "account-user",
        trackingEvents: { create: expect.objectContaining({ status: "SEARCHING" }) },
      }),
    }));
    await expect(response.json()).resolves.toMatchObject({
      data: { id: "shipment-1", trackingCode: `trk_${"a".repeat(32)}` },
    });
  });

  it("rejects invalid trip input without writing", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "account-user", emailVerified: true },
    } as never);
    const response = await createTrip(request("/api/trips", { origin: "Dakar" }));

    expect(response.status).toBe(400);
    expect(prisma.trip.create).not.toHaveBeenCalled();
  });
});
