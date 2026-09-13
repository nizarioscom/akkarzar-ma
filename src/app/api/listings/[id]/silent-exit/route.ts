import { NextResponse } from "next/server";
import { z } from "zod";
import { ok } from "@/lib/api/response";
import { fromApiFailure, fromZodError, jsonError } from "@/lib/api/http";
import { isApiFailure, requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { uuidSchema } from "@/lib/validation/common";

const bodySchema = z.object({ silentExit: z.boolean() });

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const profile = await requireRole(["SELLER", "ADMIN"]);
  if (isApiFailure(profile)) {
    return fromApiFailure(profile);
  }

  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return jsonError("invalid_listing_id", 400);
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    return jsonError("listing_not_found", 404);
  }
  if (listing.sellerId !== profile.id && profile.role !== "ADMIN") {
    return jsonError("forbidden", 403);
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: { silentExit: parsed.data.silentExit },
    select: { id: true, silentExit: true },
  });

  return NextResponse.json(ok(updated));
}
