import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { tripCreationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.searchParams.get("origin")?.trim().slice(0, 80);
    const destination = request.nextUrl.searchParams.get("destination")?.trim().slice(0, 80);
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
  } catch (error) {
    console.error("Could not load trips.", error);
    return NextResponse.json({ error: "Les trajets sont momentanément indisponibles." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    console.error("Could not verify trip publisher session.", error);
    return NextResponse.json({ error: "Le service de compte est momentanément indisponible." }, { status: 503 });
  }
  if (!session?.user.emailVerified) {
    return NextResponse.json({ error: "Connectez-vous avec une adresse email confirmée pour publier." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  const parsed = tripCreationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez les informations du trajet." }, { status: 400 });
  }

  try {
    const trip = await prisma.trip.create({
      data: { ...parsed.data, travelerId: session.user.id },
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
    console.error("Trip creation failed.", error);
    return NextResponse.json({ error: "Impossible d’enregistrer ce trajet pour le moment." }, { status: 500 });
  }
}
