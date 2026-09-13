import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { toPublicListing, type ListingViewer, type PublicListing } from "@/lib/listings/silent-exit";

const LIVE_STATUSES = ["LIVE", "RESERVED"] as const;

function toViewer(
  user: Awaited<ReturnType<typeof getSessionUser>>,
): ListingViewer | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    role: user.role,
    developerCompanyId: user.developerCompanyId,
    notaryOfficeId: user.notaryOfficeId,
  };
}

export async function listPublicOpportunities(): Promise<PublicListing[]> {
  const viewer = toViewer(await getSessionUser());

  const listings = await prisma.listing.findMany({
    where: { status: { in: [...LIVE_STATUSES] } },
    include: {
      seller: {
        select: { id: true, displayName: true, phoneE164: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return listings.map((row) => toPublicListing(row, row.seller, viewer));
}

export async function getListingForViewer(listingId: string): Promise<PublicListing | null> {
  const viewer = toViewer(await getSessionUser());

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      seller: {
        select: { id: true, displayName: true, phoneE164: true },
      },
    },
  });

  if (!listing) {
    return null;
  }

  const isPublicStatus = listing.status === "LIVE" || listing.status === "RESERVED";
  if (!viewer && !isPublicStatus) {
    return null;
  }

  if (viewer) {
    const privileged =
      viewer.role === "ADMIN" ||
      listing.sellerId === viewer.id ||
      (viewer.role === "DEVELOPER_PROMOTER" &&
        viewer.developerCompanyId === listing.developerCompanyId) ||
      (viewer.role === "NOTARY_PARTNER" &&
        viewer.notaryOfficeId !== null &&
        viewer.notaryOfficeId === listing.assignedNotaryOfficeId) ||
      listing.reservedByBuyerId === viewer.id;

    if (!privileged && !isPublicStatus) {
      return null;
    }
  }

  return toPublicListing(listing, listing.seller, viewer);
}
