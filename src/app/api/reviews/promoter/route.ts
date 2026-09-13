import { NextResponse } from "next/server";
import { ok } from "@/lib/api/response";
import { fromApiFailure, fromZodError, jsonError } from "@/lib/api/http";
import { isApiFailure, requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { reviewDecisionSchema } from "@/lib/validation/document";
import { transitionListing } from "@/lib/workflow/service";

export async function POST(request: Request) {
  const profile = await requireRole(["DEVELOPER_PROMOTER", "ADMIN"]);
  if (isApiFailure(profile)) {
    return fromApiFailure(profile);
  }

  const parsed = reviewDecisionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) {
    return jsonError("listing_not_found", 404);
  }

  const actor = await prisma.user.findUnique({
    where: { id: profile.id },
    select: { developerCompanyId: true },
  });

  if (
    profile.role !== "ADMIN" &&
    (actor?.developerCompanyId === null || actor?.developerCompanyId !== listing.developerCompanyId)
  ) {
    return jsonError("forbidden", 403);
  }

  const nextStatus = parsed.data.decision === "APPROVED" ? "NOTARY_REVIEW" : "REJECTED";

  try {
    await prisma.developerApproval.create({
      data: {
        listingId: listing.id,
        companyId: listing.developerCompanyId,
        reviewerUserId: profile.id,
        status: parsed.data.decision,
        note: parsed.data.note,
        decidedAt: new Date(),
      },
    });

    const updated = await transitionListing({
      listing,
      to: nextStatus,
      role: profile.role,
      actorId: profile.id,
      reason: parsed.data.note ?? `promoter_${parsed.data.decision.toLowerCase()}`,
    });

    return NextResponse.json(ok({ id: updated.id, status: updated.status }));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "promoter_review_failed", 400);
  }
}
