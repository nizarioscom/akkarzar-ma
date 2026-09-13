import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { fromApiFailure, jsonError } from "@/lib/api/http";
import { isApiFailure, requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { uuidSchema } from "@/lib/validation/common";
import { transitionListing } from "@/lib/workflow/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const profile = await requireRole(["ADMIN"]);
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

  try {
    const updated = await transitionListing({
      listing,
      to: "PROMOTER_APPROVAL_PENDING",
      role: profile.role,
      actorId: profile.id,
      reason: "docs_verified",
    });
    return NextResponse.json(ok({ id: updated.id, status: updated.status }));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "verify_failed", 400);
  }
}
