import { describe, expect, it } from "vitest";
import { matchesTrip, scoreTrip } from "./matching";

const future = new Date(Date.now() + 86_400_000);
const trip = {
  origin: "Dakar, Sénégal",
  destination: "Paris, France",
  via: ["Casablanca, Maroc"],
  departureAt: future,
  availableWeightKg: 8,
};

describe("trip matching", () => {
  it("matches an itinerary with accents normalized and enough capacity", () => {
    expect(matchesTrip(trip, {
      origin: "Dakar",
      destination: "Paris",
      weightKg: 2,
    })).toBe(true);
  });

  it("matches a valid segment through a stopover", () => {
    expect(matchesTrip(trip, {
      origin: "Casablanca",
      destination: "Paris",
      weightKg: 8,
    })).toBe(true);
  });

  it("rejects insufficient capacity, reversed routes, and past trips", () => {
    expect(matchesTrip(trip, { origin: "Dakar", destination: "Paris", weightKg: 9 })).toBe(false);
    expect(matchesTrip(trip, { origin: "Paris", destination: "Dakar", weightKg: 1 })).toBe(false);
    expect(matchesTrip({ ...trip, departureAt: new Date(Date.now() - 1) }, {
      origin: "Dakar",
      destination: "Paris",
      weightKg: 1,
    })).toBe(false);
  });

  it("ranks direct endpoints above segments", () => {
    expect(scoreTrip(trip, { origin: "Dakar", destination: "Paris" })).toBe(4);
    expect(scoreTrip(trip, { origin: "Casablanca", destination: "Paris" })).toBe(2);
  });
});
