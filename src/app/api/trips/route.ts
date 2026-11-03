import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get("origin");
  const destination = request.nextUrl.searchParams.get("destination");
  const trips = await prisma.trip.findMany({
    where: {
      status: "OPEN",
      ...(origin ? { origin: { contains: origin, mode: "insensitive" } } : {}),
      ...(destination ? { destination: { contains: destination, mode: "insensitive" } } : {}),
      departureAt: { gte: new Date() },
    },
    select: {
      id: true,
      origin: true,
      destination: true,
      via: true,
      departureAt: true,
      availableWeightKg: true,
      availableVolumeL: true,
      pricePerKgXof: true,
      status: true,
    },
    orderBy: { departureAt: "asc" },
    take: 50,
  });
  return NextResponse.json({ data: trips });
}

export async function POST() {
  return NextResponse.json(
    { error: "La création de trajets est désactivée jusqu’à la mise en place de l’authentification." },
    { status: 503 },
  );
}
