import { NextRequest, NextResponse } from "next/server";
import { matchesTrip, scoreTrip } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { matchingQuerySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const parsed = matchingQuerySchema.safeParse({
    origin: request.nextUrl.searchParams.get("origin"),
    destination: request.nextUrl.searchParams.get("destination"),
    weightKg: request.nextUrl.searchParams.get("weightKg"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Indiquez un départ, une destination et un poids valides." },
      { status: 400 },
    );
  }

  const now = new Date();
  const trips = await prisma.trip.findMany({
    where: {
      status: "OPEN",
      departureAt: { gte: now },
      availableWeightKg: { gte: parsed.data.weightKg },
    },
    select: {
      id: true,
      origin: true,
      destination: true,
      via: true,
      departureAt: true,
      availableWeightKg: true,
      pricePerKgXof: true,
    },
    orderBy: { departureAt: "asc" },
    take: 250,
  });

  const matches = trips
    .filter((trip) => matchesTrip(trip, parsed.data))
    .map((trip) => ({ ...trip, score: scoreTrip(trip, parsed.data) }))
    .sort((left, right) => right.score - left.score || left.departureAt.getTime() - right.departureAt.getTime())
    .slice(0, 20);

  return NextResponse.json({ data: matches });
}
