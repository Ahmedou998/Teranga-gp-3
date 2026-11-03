import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!/^trk_[a-f0-9]{32}$/i.test(code)) {
    return NextResponse.json({ error: "Code de suivi invalide." }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({
    where: { trackingCode: code },
    select: {
      origin: true,
      destination: true,
      status: true,
      createdAt: true,
      trackingEvents: {
        select: { status: true, location: true, note: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!shipment) {
    return NextResponse.json({ error: "Aucun colis trouvé pour ce code." }, { status: 404 });
  }

  return NextResponse.json({ data: shipment }, { headers: { "Cache-Control": "no-store" } });
}
