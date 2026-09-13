import { NextResponse } from "next/server";
import { z } from "zod";
import { ok } from "@/lib/api/response";
import { fromZodError, jsonError } from "@/lib/api/http";
import { calculateExitFinancials } from "@/lib/calculators/exitCalculator";
import { moneySchema } from "@/lib/validation/common";

const schema = z
  .object({
    totalContractPrice: moneySchema,
    amountPaid: moneySchema,
  })
  .refine((value) => value.amountPaid <= value.totalContractPrice, {
    message: "amountPaid cannot exceed totalContractPrice",
    path: ["amountPaid"],
  });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  try {
    return NextResponse.json(ok(calculateExitFinancials(parsed.data)));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "calculation_failed", 400);
  }
}
