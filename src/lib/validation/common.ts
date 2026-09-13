import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const moneySchema = z.number().finite().nonnegative().max(1_000_000_000);

export const listingStatusSchema = z.enum([
  "DRAFT",
  "PENDING_DOCS_VERIFICATION",
  "PROMOTER_APPROVAL_PENDING",
  "NOTARY_REVIEW",
  "LIVE",
  "RESERVED",
  "COMPLETED",
  "REJECTED",
]);

export const propertyTypeSchema = z.enum(["APARTMENT", "VILLA", "LAND", "COMMERCIAL", "OFFICE"]);

export const documentTypeSchema = z.enum([
  "CIN",
  "CONTRACT_RESERVATION",
  "BANK_PAYMENT_RECEIPT",
  "PROMOTER_AUTHORIZATION",
  "NOTARY_ATTESTATION",
  "OTHER",
]);
