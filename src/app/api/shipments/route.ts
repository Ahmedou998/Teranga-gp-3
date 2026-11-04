import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { shipmentCreationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
  } catch (error) {
    console.error("Could not load shipment requests.", error);
    return NextResponse.json({ error: "Les demandes sont momentanément indisponibles." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    console.error("Could not verify shipment publisher session.", error);
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

  const parsed = shipmentCreationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez les informations du colis." }, { status: 400 });
  }

  try {
    const shipment = await prisma.shipment.create({
      data: {
        ...parsed.data,
        senderId: session.user.id,
        trackingEvents: {
          create: {
            status: "SEARCHING",
            note: "Demande publiée. Aucun transporteur n’est confirmé.",
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
    console.error("Shipment creation failed.", error);
    return NextResponse.json({ error: "Impossible d’enregistrer cette demande pour le moment." }, { status: 500 });
  }
}
