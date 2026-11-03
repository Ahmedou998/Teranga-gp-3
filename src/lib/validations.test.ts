import { describe, expect, it } from "vitest";
import { shipmentSchema, tripSchema } from "./validations";

const future = new Date(Date.now() + 86_400_000).toISOString();

describe("tripSchema", () => {
  it("accepts a valid trip", () => {
    expect(tripSchema.safeParse({
      travelerId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      origin: "Dakar",
      destination: "Thiès",
      departureAt: future,
      availableWeightKg: 10,
      pricePerKgXof: 1500,
    }).success).toBe(true);
  });

  it("rejects identical cities", () => {
    expect(tripSchema.safeParse({
      travelerId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      origin: "Dakar",
      destination: "dakar",
      departureAt: future,
      availableWeightKg: 10,
      pricePerKgXof: 1500,
    }).success).toBe(false);
  });
});

describe("shipmentSchema", () => {
  it("rejects zero or negative weight", () => {
    expect(shipmentSchema.safeParse({
      senderId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      origin: "Dakar",
      destination: "Saint-Louis",
      description: "Documents administratifs",
      weightKg: 0,
    }).success).toBe(false);
  });

  it("requires a useful description", () => {
    expect(shipmentSchema.safeParse({
      senderId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      origin: "Dakar",
      destination: "Saint-Louis",
      description: "abc",
      weightKg: 1,
    }).success).toBe(false);
  });
});
