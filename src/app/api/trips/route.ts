import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAllowedLocalWrite } from "@/lib/local-mvp";
import { localTripSchema } from "@/lib/validations";

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

export async function POST(request: NextRequest) {
  if (!isAllowedLocalWrite(request)) {
    return NextResponse.json(
      { error: "La publication est désactivée hors du mode local de développement." },
      { status: process.env.NODE_ENV === "production" ? 503 : 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  const parsed = localTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez les informations du trajet." }, { status: 400 });
  }

  try {
    const traveler = await prisma.user.upsert({
      where: { email: "local-mvp@teranga.invalid" },
      update: {},
      create: { email: "local-mvp@teranga.invalid", fullName: "Compte de démonstration local" },
      select: { id: true },
    });
    const trip = await prisma.trip.create({
      data: { ...parsed.data, travelerId: traveler.id },
      select: {
        id: true,
        origin: true,
        destination: true,
        departureAt: true,
        availableWeightKg: true,
        pricePerKgXof: true,
      },
    });
    return NextResponse.json({ data: trip }, { status: 201 });
  } catch (error) {
    console.error("Local trip creation failed.", error);
    return NextResponse.json({ error: "Impossible d’enregistrer ce trajet pour le moment." }, { status: 500 });
  }
}
