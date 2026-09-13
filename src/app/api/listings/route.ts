import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ok } from "@/lib/api/response";
import { fromApiFailure, fromZodError, jsonError } from "@/lib/api/http";
import { isApiFailure, requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { createListingSchema } from "@/lib/validation/listing";

export async function POST(request: Request) {
  const profile = await requireRole(["SELLER", "ADMIN"]);
  if (isApiFailure(profile)) {
    return fromApiFailure(profile);
  }

  const parsed = createListingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: profile.id,
      title: parsed.data.title,
      city: parsed.data.city,
      district: parsed.data.district,
      propertyType: parsed.data.propertyType,
      unitReference: parsed.data.unitReference,
      developerCompanyId: parsed.data.developerCompanyId,
      totalContractPrice: new Prisma.Decimal(parsed.data.totalContractPrice),
      amountPaid: new Prisma.Decimal(parsed.data.amountPaid),
      silentExit: parsed.data.silentExit,
      status: "DRAFT",
    },
  });

  return NextResponse.json(ok({ id: listing.id, status: listing.status }), { status: 201 });
}
