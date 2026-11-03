import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function POST() {
  return NextResponse.json(
    { error: "La création de colis est désactivée jusqu’à la mise en place de l’authentification." },
    { status: 503 },
  );
}
