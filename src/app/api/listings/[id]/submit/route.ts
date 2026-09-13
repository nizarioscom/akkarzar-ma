import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { fromApiFailure, jsonError } from "@/lib/api/http";
import { isApiFailure, requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { uuidSchema } from "@/lib/validation/common";
import { assertSellerDocuments, transitionListing } from "@/lib/workflow/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const profile = await requireRole(["SELLER", "ADMIN"]);
  if (isApiFailure(profile)) {
    return fromApiFailure(profile);
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return jsonError("invalid_listing_id", 400);
  }

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    return jsonError("listing_not_found", 404);
  }
  if (listing.sellerId !== profile.id && profile.role !== "ADMIN") {
    return jsonError("forbidden", 403);
  }

  try {
    await assertSellerDocuments(id);
    const updated = await transitionListing({
      listing,
      to: "PENDING_DOCS_VERIFICATION",
      role: profile.role,
      actorId: profile.id,
      reason: "seller_submitted_documents",
    });
    return NextResponse.json(ok({ id: updated.id, status: updated.status }));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "submit_failed", 400);
  }
}
