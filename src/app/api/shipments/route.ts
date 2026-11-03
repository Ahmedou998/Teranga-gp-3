import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAllowedLocalWrite } from "@/lib/local-mvp";
import { localShipmentSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const shipments = await prisma.shipment.findMany({
    where: { status: "SEARCHING" },
    select: {
      id: true,
      origin: true,
      destination: true,
      weightKg: true,
      desiredDate: true,
      budgetXof: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ data: shipments });
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

  const parsed = localShipmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez les informations du colis." }, { status: 400 });
  }

  try {
    const sender = await prisma.user.upsert({
      where: { email: "local-mvp@teranga.invalid" },
      update: {},
      create: { email: "local-mvp@teranga.invalid", fullName: "Compte de démonstration local" },
      select: { id: true },
    });
    const shipment = await prisma.shipment.create({
      data: {
        ...parsed.data,
        senderId: sender.id,
        trackingEvents: {
          create: {
            status: "SEARCHING",
            note: "Demande enregistrée en mode local. Aucun transporteur n’est confirmé.",
          },
        },
      },
      select: {
        id: true,
        origin: true,
        destination: true,
        status: true,
        trackingCode: true,
      },
    });
    return NextResponse.json({ data: shipment }, { status: 201 });
  } catch (error) {
    console.error("Local shipment creation failed.", error);
    return NextResponse.json({ error: "Impossible d’enregistrer cette demande pour le moment." }, { status: 500 });
  }
}
