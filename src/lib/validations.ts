import { z } from "zod";

const city = z.string().trim().min(2).max(80);
const futureDate = z.coerce.date().refine((date) => date.getTime() > Date.now(), {
  message: "La date doit être dans le futur.",
});

export const tripSchema = z.object({
  travelerId: z.string().cuid(),
  origin: city,
  destination: city,
  via: z.array(city).max(8).default([]),
  departureAt: futureDate,
  availableWeightKg: z.number().positive().max(100),
  availableVolumeL: z.number().positive().max(500).optional(),
  pricePerKgXof: z.number().int().positive().max(2_000_000),
  notes: z.string().trim().max(500).optional(),
}).refine((data) => data.origin.toLocaleLowerCase() !== data.destination.toLocaleLowerCase(), {
  message: "Le départ et la destination doivent être différents.",
  path: ["destination"],
});

export const shipmentSchema = z.object({
  senderId: z.string().cuid(),
  origin: city,
  destination: city,
  description: z.string().trim().min(5).max(500),
  weightKg: z.number().positive().max(100),
  declaredValueXof: z.number().int().nonnegative().max(100_000_000).optional(),
  desiredDate: z.coerce.date().optional(),
  budgetXof: z.number().int().positive().max(10_000_000).optional(),
}).refine((data) => data.origin.toLocaleLowerCase() !== data.destination.toLocaleLowerCase(), {
  message: "Le départ et la destination doivent être différents.",
  path: ["destination"],
});
