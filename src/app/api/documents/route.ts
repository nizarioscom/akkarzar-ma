import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma, type DocumentType } from "@prisma/client";
import { ok } from "@/lib/api/response";
import { fromApiFailure, fromZodError, jsonError } from "@/lib/api/http";
import { writeAuditLog } from "@/lib/audit/logger";
import { isApiFailure, requireRole } from "@/lib/auth/guards";
import { runDocumentPipeline } from "@/lib/documents/ocrPipeline";
import { prisma } from "@/lib/prisma";
import { encryptObjectBuffer, uploadEncryptedObject } from "@/lib/storage/encryptedObjectStore";
import { documentUploadMetaSchema } from "@/lib/validation/document";

const ALLOWED_TYPES = new Set(["CONTRACT_RESERVATION", "BANK_PAYMENT_RECEIPT", "CIN", "OTHER"]);

export async function POST(request: Request) {
  const profile = await requireRole(["SELLER", "ADMIN"]);
  if (isApiFailure(profile)) {
    return fromApiFailure(profile);
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("file_required", 400);
  }

  const parsed = documentUploadMetaSchema.safeParse({
    listingId: form.get("listingId"),
    type: form.get("type"),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
  });
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }
  if (!ALLOWED_TYPES.has(parsed.data.type)) {
    return jsonError("unsupported_document_type", 400);
  }

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) {
    return jsonError("listing_not_found", 404);
  }
  if (listing.sellerId !== profile.id && profile.role !== "ADMIN") {
    return jsonError("forbidden", 403);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength > 12 * 1024 * 1024) {
    return jsonError("file_too_large", 413);
  }

  const report = await runDocumentPipeline({
    bytes,
    mimeType: parsed.data.mimeType,
    documentType: parsed.data.type as DocumentType,
    claims: {
      totalContractPrice: Number(listing.totalContractPrice),
      amountPaid: Number(listing.amountPaid),
    },
  });

  const storageKey = `listings/${listing.id}/${parsed.data.type}/${randomUUID()}`;
  let upload;
  if (process.env.S3_BUCKET) {
    upload = await uploadEncryptedObject({
      storageKey,
      plaintext: bytes,
      contentType: parsed.data.mimeType,
    });
  } else {
    const encrypted = encryptObjectBuffer(bytes);
    upload = {
      storageKey,
      sha256Ciphertext: createHash("sha256").update(encrypted.ciphertext).digest("hex"),
      encryptionIv: encrypted.iv,
      encryptionAuthTag: encrypted.authTag,
      byteSize: encrypted.ciphertext.length,
    };
  }

  const document = await prisma.document.create({
    data: {
      listingId: listing.id,
      uploadedById: profile.id,
      type: parsed.data.type,
      storageKey: upload.storageKey,
      sha256Ciphertext: upload.sha256Ciphertext,
      encryptionIv: Uint8Array.from(upload.encryptionIv),
      encryptionAuthTag: Uint8Array.from(upload.encryptionAuthTag),
      mimeType: parsed.data.mimeType,
      byteSize: upload.byteSize,
      isVerified: report.accepted,
      verifiedAt: report.accepted ? new Date() : null,
      ocrExtractedJson: report as unknown as Prisma.InputJsonValue,
      ocrConfidence: new Prisma.Decimal(report.overallConfidence),
    },
  });

  await writeAuditLog({
    actorId: profile.id,
    action: "DOCUMENT_UPLOAD",
    resourceType: "document",
    resourceId: document.id,
    reason: parsed.data.type,
    metadata: { listingId: listing.id, accepted: report.accepted },
  });

  return NextResponse.json(
    ok({
      id: document.id,
      listingId: listing.id,
      type: document.type,
      ocrAccepted: report.accepted,
      overallConfidence: report.overallConfidence,
    }),
    { status: 201 },
  );
}
