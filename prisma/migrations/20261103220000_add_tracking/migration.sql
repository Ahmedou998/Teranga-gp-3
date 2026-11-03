ALTER TABLE "public"."Shipment"
ADD COLUMN "trackingCode" TEXT;

UPDATE "public"."Shipment"
SET "trackingCode" = 'trk_' || replace(gen_random_uuid()::text, '-', '');

ALTER TABLE "public"."Shipment"
ALTER COLUMN "trackingCode" SET NOT NULL,
ALTER COLUMN "trackingCode" SET DEFAULT ('trk_' || replace(gen_random_uuid()::text, '-', ''));

CREATE UNIQUE INDEX "Shipment_trackingCode_key"
ON "public"."Shipment"("trackingCode");

CREATE TABLE "public"."ShipmentTrackingEvent" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" "public"."ShipmentStatus" NOT NULL,
    "location" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentTrackingEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShipmentTrackingEvent_shipmentId_createdAt_idx"
ON "public"."ShipmentTrackingEvent"("shipmentId", "createdAt");

ALTER TABLE "public"."ShipmentTrackingEvent"
ADD CONSTRAINT "ShipmentTrackingEvent_shipmentId_fkey"
FOREIGN KEY ("shipmentId") REFERENCES "public"."Shipment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
