import type { Listing, ListingStatus, User, UserRole } from "@prisma/client";

const SELLER_REVEAL_STATUSES: readonly ListingStatus[] = ["NOTARY_REVIEW", "COMPLETED"];

export type SellerIdentity = {
  id: string;
  displayName: string | null;
  phoneE164: string | null;
};

export type PublicListing = {
  id: string;
  status: ListingStatus;
  title: string;
  city: string;
  district: string | null;
  propertyType: Listing["propertyType"];
  unitReference: string | null;
  totalContractPrice: string;
  amountPaid: string;
  currency: string;
  silentExit: boolean;
  developerCompanyId: string;
  reservationExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  seller: SellerIdentity | null;
};

export type ListingViewer = {
  id: string;
  role: UserRole;
  developerCompanyId: string | null;
  notaryOfficeId: string | null;
};

export function canRevealSellerIdentity(
  listing: Pick<
    Listing,
    | "sellerId"
    | "silentExit"
    | "status"
    | "developerCompanyId"
    | "assignedNotaryOfficeId"
    | "reservedByBuyerId"
  >,
  viewer: ListingViewer | null,
): boolean {
  if (!viewer) {
    return false;
  }

  if (viewer.role === "ADMIN" || viewer.id === listing.sellerId) {
    return true;
  }

  if (
    viewer.role === "DEVELOPER_PROMOTER" &&
    viewer.developerCompanyId !== null &&
    viewer.developerCompanyId === listing.developerCompanyId
  ) {
    return true;
  }

  if (
    viewer.role === "NOTARY_PARTNER" &&
    viewer.notaryOfficeId !== null &&
    viewer.notaryOfficeId === listing.assignedNotaryOfficeId
  ) {
    return true;
  }

  const isReservedBuyer = listing.reservedByBuyerId === viewer.id;
  const atNotaryStage = SELLER_REVEAL_STATUSES.includes(listing.status);

  if (isReservedBuyer && atNotaryStage) {
    return true;
  }

  // Confidentiality toggle off: authenticated counterparties may see display identity, never CIN.
  return !listing.silentExit;
}

export function toPublicListing(
  listing: Listing,
  seller: Pick<User, "id" | "displayName" | "phoneE164"> | null,
  viewer: ListingViewer | null,
): PublicListing {
  const reveal = canRevealSellerIdentity(listing, viewer);

  return {
    id: listing.id,
    status: listing.status,
    title: listing.title,
    city: listing.city,
    district: listing.district,
    propertyType: listing.propertyType,
    unitReference: listing.unitReference,
    totalContractPrice: listing.totalContractPrice.toString(),
    amountPaid: listing.amountPaid.toString(),
    currency: listing.currency,
    silentExit: listing.silentExit,
    developerCompanyId: listing.developerCompanyId,
    reservationExpiresAt: listing.reservationExpiresAt,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    seller:
      reveal && seller
        ? {
            id: seller.id,
            displayName: seller.displayName,
            phoneE164: seller.phoneE164,
          }
        : null,
  };
}
