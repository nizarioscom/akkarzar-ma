import { z } from "zod";
import { moneySchema, propertyTypeSchema, uuidSchema } from "@/lib/validation/common";

const listingFieldsSchema = z.object({
  title: z.string().trim().min(8).max(160),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().max(80).optional(),
  propertyType: propertyTypeSchema,
  unitReference: z.string().trim().max(80).optional(),
  developerCompanyId: uuidSchema,
  totalContractPrice: moneySchema,
  amountPaid: moneySchema,
  silentExit: z.boolean().default(true),
});

export const createListingSchema = listingFieldsSchema.refine(
  (value) => value.amountPaid <= value.totalContractPrice,
  {
    message: "amountPaid cannot exceed totalContractPrice",
    path: ["amountPaid"],
  },
);

export const updateListingSchema = listingFieldsSchema.partial().extend({
  assignedNotaryOfficeId: uuidSchema.nullable().optional(),
});

export const reserveListingSchema = z.object({
  listingId: uuidSchema,
  holdHours: z.number().int().min(1).max(72).default(24),
});
