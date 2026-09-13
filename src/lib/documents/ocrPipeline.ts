import type { DocumentType } from "@prisma/client";

export type OcrScalar = string | number | null;

export type OcrField<T extends OcrScalar = OcrScalar> = {
  value: T;
  confidence: number;
};

export type DocumentExtraction = {
  documentType: DocumentType;
  totalPrice: OcrField<number | null>;
  amountPaid: OcrField<number | null>;
  partyNames: OcrField<string | null>;
  signedOn: OcrField<string | null>;
  referenceNumber: OcrField<string | null>;
  rawText: string;
  overallConfidence: number;
};

export type SellerDocumentClaims = {
  totalContractPrice: number;
  amountPaid: number;
  partyName?: string;
  referenceNumber?: string;
};

export type FieldMatch = {
  field: "totalPrice" | "amountPaid" | "partyNames" | "referenceNumber";
  matched: boolean;
  confidence: number;
  reason: string;
};

export type DocumentMatchReport = {
  extraction: DocumentExtraction;
  matches: FieldMatch[];
  accepted: boolean;
  overallConfidence: number;
};

const MONEY_PATTERN =
  /(?:(?:prix|montant|total|versé|payé|paiement|عقد|ثمن|مبلغ)\s*[:=]?\s*)?((?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:[.,]\d{2})?)\s*(?:mad|dh|dhs|درهم)?/gi;

const DATE_PATTERN = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/;
const REF_PATTERN = /(?:réf(?:érence)?|ref|n[°o]|عقد)\s*[:.]?\s*([A-Z0-9][A-Z0-9-/_]{3,})/i;

function parseMoneyToken(token: string): number | null {
  const normalized = token.replace(/\s/g, "").replace(/\.(?=\d{3}(?:[.,]|$))/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

function extractMoneyCandidates(text: string): number[] {
  const values: number[] = [];
  for (const match of text.matchAll(MONEY_PATTERN)) {
    const parsed = parseMoneyToken(match[1] ?? "");
    if (parsed !== null && parsed > 0) {
      values.push(parsed);
    }
  }
  return values;
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, Math.round(value * 10_000) / 10_000));
}

export function extractFromDocumentText(text: string, documentType: DocumentType): DocumentExtraction {
  const values = extractMoneyCandidates(text);
  const sorted = [...values].sort((a, b) => b - a);
  const totalPrice = documentType === "CONTRACT_RESERVATION" ? (sorted[0] ?? null) : (sorted[0] ?? null);
  const amountPaid =
    documentType === "BANK_PAYMENT_RECEIPT" ? (sorted[0] ?? null) : (sorted[1] ?? sorted[0] ?? null);

  const dateMatch = text.match(DATE_PATTERN);
  const refMatch = text.match(REF_PATTERN);
  const partyMatch = text.match(/(?:acquéreur|acheteur|promettant|السيد|السيدة)\s*[:.]?\s*([A-Za-zÀ-ÿ\u0600-\u06FF][A-Za-zÀ-ÿ\u0600-\u06FF\s'-]{2,})/i);

  const hasMoney = totalPrice !== null || amountPaid !== null;
  const overallConfidence = clampConfidence(
    (hasMoney ? 0.45 : 0) + (dateMatch ? 0.15 : 0) + (refMatch ? 0.2 : 0) + (partyMatch ? 0.2 : 0),
  );

  return {
    documentType,
    totalPrice: { value: totalPrice, confidence: totalPrice === null ? 0 : 0.7 },
    amountPaid: { value: amountPaid, confidence: amountPaid === null ? 0 : 0.65 },
    partyNames: { value: partyMatch?.[1]?.trim() ?? null, confidence: partyMatch ? 0.55 : 0 },
    signedOn: { value: dateMatch?.[1] ?? null, confidence: dateMatch ? 0.6 : 0 },
    referenceNumber: { value: refMatch?.[1] ?? null, confidence: refMatch ? 0.7 : 0 },
    rawText: text,
    overallConfidence,
  };
}

function amountsClose(extracted: number | null, claimed: number, tolerance = 0.02): boolean {
  if (extracted === null) {
    return false;
  }
  const delta = Math.abs(extracted - claimed);
  return delta <= Math.max(1, claimed * tolerance);
}

export function matchSellerClaims(
  extraction: DocumentExtraction,
  claims: SellerDocumentClaims,
): DocumentMatchReport {
  const matches: FieldMatch[] = [
    {
      field: "totalPrice",
      matched: amountsClose(extraction.totalPrice.value, claims.totalContractPrice),
      confidence: extraction.totalPrice.confidence,
      reason: "total_price_vs_seller_input",
    },
    {
      field: "amountPaid",
      matched: amountsClose(extraction.amountPaid.value, claims.amountPaid),
      confidence: extraction.amountPaid.confidence,
      reason: "amount_paid_vs_seller_input",
    },
  ];

  if (claims.partyName) {
    const extracted = extraction.partyNames.value?.toLocaleLowerCase("fr") ?? "";
    const claimed = claims.partyName.toLocaleLowerCase("fr");
    matches.push({
      field: "partyNames",
      matched: extracted.length > 0 && (extracted.includes(claimed) || claimed.includes(extracted)),
      confidence: extraction.partyNames.confidence,
      reason: "party_name_overlap",
    });
  }

  if (claims.referenceNumber) {
    matches.push({
      field: "referenceNumber",
      matched:
        extraction.referenceNumber.value?.replace(/\s/g, "").toUpperCase() ===
        claims.referenceNumber.replace(/\s/g, "").toUpperCase(),
      confidence: extraction.referenceNumber.confidence,
      reason: "reference_exact",
    });
  }

  const required = matches.filter((item) => item.field === "totalPrice" || item.field === "amountPaid");
  const accepted = required.every((item) => item.matched) && extraction.overallConfidence >= 0.35;
  const overallConfidence = clampConfidence(
    matches.reduce((sum, item) => sum + item.confidence, 0) / Math.max(matches.length, 1),
  );

  return { extraction, matches, accepted, overallConfidence };
}

export async function readDocumentText(payload: Buffer, mimeType: string | null): Promise<string> {
  const textLike =
    mimeType === null ||
    mimeType.startsWith("text/") ||
    mimeType === "application/json";

  if (textLike) {
    return payload.toString("utf8");
  }

  const endpoint = process.env.OCR_EXTRACTOR_URL;
  if (!endpoint) {
    return "";
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": mimeType ?? "application/octet-stream",
      authorization: process.env.OCR_EXTRACTOR_TOKEN ? `Bearer ${process.env.OCR_EXTRACTOR_TOKEN}` : "",
    },
    body: new Uint8Array(payload),
  });

  if (!response.ok) {
    throw new Error("ocr_extractor_failed");
  }

  const body = (await response.json()) as { text?: string };
  return body.text ?? "";
}

export async function runDocumentPipeline(input: {
  bytes: Buffer;
  mimeType: string | null;
  documentType: DocumentType;
  claims: SellerDocumentClaims;
}): Promise<DocumentMatchReport> {
  const text = await readDocumentText(input.bytes, input.mimeType);
  const extraction = extractFromDocumentText(text, input.documentType);
  return matchSellerClaims(extraction, input.claims);
}
