import type { DocumentType, ListingStatus, UserRole } from "@prisma/client";

export const CESSION_TRANSITIONS: Record<ListingStatus, readonly ListingStatus[]> = {
  DRAFT: ["PENDING_DOCS_VERIFICATION"],
  PENDING_DOCS_VERIFICATION: ["PROMOTER_APPROVAL_PENDING", "REJECTED"],
  PROMOTER_APPROVAL_PENDING: ["NOTARY_REVIEW", "REJECTED"],
  NOTARY_REVIEW: ["LIVE", "REJECTED"],
  LIVE: ["RESERVED", "REJECTED"],
  RESERVED: ["COMPLETED", "LIVE", "REJECTED"],
  COMPLETED: [],
  REJECTED: ["DRAFT"],
};

export const REQUIRED_SELLER_DOCS: readonly DocumentType[] = [
  "CONTRACT_RESERVATION",
  "BANK_PAYMENT_RECEIPT",
];

const ROLE_TRANSITIONS: Partial<Record<UserRole, Partial<Record<ListingStatus, ListingStatus[]>>>> = {
  SELLER: {
    DRAFT: ["PENDING_DOCS_VERIFICATION"],
    REJECTED: ["DRAFT"],
  },
  ADMIN: {
    DRAFT: ["PENDING_DOCS_VERIFICATION"],
    PENDING_DOCS_VERIFICATION: ["PROMOTER_APPROVAL_PENDING", "REJECTED"],
    PROMOTER_APPROVAL_PENDING: ["NOTARY_REVIEW", "REJECTED"],
    NOTARY_REVIEW: ["LIVE", "REJECTED"],
    LIVE: ["RESERVED", "REJECTED"],
    RESERVED: ["COMPLETED", "LIVE", "REJECTED"],
    REJECTED: ["DRAFT"],
  },
  DEVELOPER_PROMOTER: {
    PROMOTER_APPROVAL_PENDING: ["NOTARY_REVIEW", "REJECTED"],
  },
  NOTARY_PARTNER: {
    NOTARY_REVIEW: ["LIVE", "REJECTED"],
  },
  BUYER: {
    LIVE: ["RESERVED"],
  },
};

export function canTransition(from: ListingStatus, to: ListingStatus): boolean {
  return CESSION_TRANSITIONS[from].includes(to);
}

export function assertCessionTransition(input: {
  from: ListingStatus;
  to: ListingStatus;
  role: UserRole;
}): void {
  if (!canTransition(input.from, input.to)) {
    throw new Error(`illegal_transition:${input.from}->${input.to}`);
  }

  const allowedForRole = ROLE_TRANSITIONS[input.role]?.[input.from] ?? [];
  if (!allowedForRole.includes(input.to) && input.role !== "ADMIN") {
    throw new Error(`forbidden_transition_for_role:${input.role}`);
  }
}

export function hasRequiredSellerDocuments(types: readonly DocumentType[]): boolean {
  return REQUIRED_SELLER_DOCS.every((required) => types.includes(required));
}
