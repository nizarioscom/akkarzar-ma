import { prisma } from "@/lib/prisma";
import { listPublicOpportunities } from "@/lib/listings/queries";

function canQueryDatabase(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.length > 0 && !url.includes("127.0.0.1") && !url.includes("localhost");
}

export async function safePublicListings() {
  if (!canQueryDatabase()) {
    return [];
  }
  try {
    return await listPublicOpportunities();
  } catch {
    return [];
  }
}

export async function sellerListings(sellerId: string) {
  if (!canQueryDatabase()) {
    return [];
  }
  try {
    return await prisma.listing.findMany({
      where: { sellerId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, status: true, silentExit: true, city: true },
    });
  } catch {
    return [];
  }
}

export async function promoterQueue(companyId: string | null) {
  if (!canQueryDatabase()) {
    return [];
  }
  try {
    return await prisma.listing.findMany({
      where: {
        status: "PROMOTER_APPROVAL_PENDING",
        ...(companyId ? { developerCompanyId: companyId } : {}),
      },
      select: { id: true, title: true, city: true, status: true },
    });
  } catch {
    return [];
  }
}

export async function notaryQueue(officeId: string | null) {
  if (!canQueryDatabase()) {
    return [];
  }
  try {
    return await prisma.listing.findMany({
      where: {
        status: "NOTARY_REVIEW",
        ...(officeId ? { assignedNotaryOfficeId: officeId } : {}),
      },
      select: { id: true, title: true, city: true, status: true },
    });
  } catch {
    return [];
  }
}
