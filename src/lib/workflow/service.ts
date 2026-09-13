import type { DocumentType, Listing, ListingStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit/logger";
import { notifyListingStatus } from "@/lib/notifications/whatsapp";
import {
  assertCessionTransition,
  hasRequiredSellerDocuments,
} from "@/lib/workflow/cession";

async function loadSellerPhone(sellerId: string): Promise<string | null> {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { phoneE164: true },
  });
  return seller?.phoneE164 ?? null;
}

export async function transitionListing(input: {
  listing: Listing;
  to: ListingStatus;
  role: UserRole;
  actorId: string;
  reason: string;
}): Promise<Listing> {
  assertCessionTransition({ from: input.listing.status, to: input.to, role: input.role });

  const updated = await prisma.listing.update({
    where: { id: input.listing.id },
    data: {
      status: input.to,
      completedAt: input.to === "COMPLETED" ? new Date() : input.listing.completedAt,
      rejectionReason: input.to === "REJECTED" ? input.reason : null,
    },
  });

  await writeAuditLog({
    actorId: input.actorId,
    action: "STATUS_CHANGE",
    resourceType: "listing",
    resourceId: input.listing.id,
    reason: input.reason,
    metadata: { from: input.listing.status, to: input.to },
  });

  const phone = await loadSellerPhone(input.listing.sellerId);
  await notifyListingStatus({
    phoneE164: phone,
    listingId: input.listing.id,
    status: input.to,
  });

  return updated;
}

export async function assertSellerDocuments(listingId: string): Promise<void> {
  const documents = await prisma.document.findMany({
    where: { listingId },
    select: { type: true },
  });
  const types = documents.map((document) => document.type as DocumentType);
  if (!hasRequiredSellerDocuments(types)) {
    throw new Error("missing_required_documents");
  }
}
