import type { Prisma } from "@prisma/client";
import { decryptUtf8, type Aes256GcmPayload } from "@/lib/crypto/aes256";
import { prisma } from "@/lib/prisma";

export type AuditAction = "PII_DECRYPT" | "DOCUMENT_READ" | "STATUS_CHANGE" | "DOCUMENT_UPLOAD";

export async function writeAuditLog(input: {
  actorId?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  reason?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      reason: input.reason,
      metadata: input.metadata,
    },
  });
}

export async function decryptUtf8WithAudit(
  payload: Aes256GcmPayload,
  context: {
    actorId?: string | null;
    resourceType: string;
    resourceId: string;
    reason: string;
  },
): Promise<string> {
  await writeAuditLog({
    actorId: context.actorId,
    action: "PII_DECRYPT",
    resourceType: context.resourceType,
    resourceId: context.resourceId,
    reason: context.reason,
  });
  return decryptUtf8(payload);
}
