import { z } from "zod";
import { documentTypeSchema, uuidSchema } from "@/lib/validation/common";

export const documentUploadMetaSchema = z.object({
  listingId: uuidSchema,
  type: documentTypeSchema,
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.string().trim().min(3).max(120),
});

export const reviewDecisionSchema = z.object({
  listingId: uuidSchema,
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().trim().max(1000).optional(),
});
