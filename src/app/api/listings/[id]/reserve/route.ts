import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { fromApiFailure, fromZodError, jsonError } from "@/lib/api/http";
import { isApiFailure, requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { reserveListingSchema } from "@/lib/validation/listing";
import { uuidSchema } from "@/lib/validation/common";
import { transitionListing } from "@/lib/workflow/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const profile = await requireRole(["BUYER", "ADMIN"]);
  if (isApiFailure(profile)) {
    return fromApiFailure(profile);
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return jsonError("invalid_listing_id", 400);
  }

  const parsed = reserveListingSchema.safeParse({
    ...(await request.json().catch(() => ({}))),
    listingId: id,
  });
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.status !== "LIVE") {
    return jsonError("listing_not_reservable", 409);
  }

  const expires = new Date(Date.now() + parsed.data.holdHours * 60 * 60 * 1000);

  try {
    await prisma.listing.update({
      where: { id },
      data: {
        reservedByBuyerId: profile.id,
        reservationExpiresAt: expires,
      },
    });

    const updated = await transitionListing({
      listing: { ...listing, reservedByBuyerId: profile.id, reservationExpiresAt: expires },
      to: "RESERVED",
      role: profile.role,
      actorId: profile.id,
      reason: "buyer_reservation_hold",
    });

    return NextResponse.json(
      ok({
        id: updated.id,
        status: updated.status,
        reservationExpiresAt: expires.toISOString(),
        paymentHold: "CMI_PLACEHOLDER",
      }),
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "reserve_failed", 400);
  }
}
