import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { POST as createTrip } from "./trips/route";
import { POST as createShipment } from "./shipments/route";

describe("public creation endpoints", () => {
  it("keeps trip creation disabled until authentication is available", async () => {
    const response = await createTrip();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toHaveProperty("error");
  });

  it("keeps shipment creation disabled until authentication is available", async () => {
    const response = await createShipment();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toHaveProperty("error");
  });
});
