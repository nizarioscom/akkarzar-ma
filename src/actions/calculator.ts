"use server";

import { fail, ok, type ApiResult } from "@/lib/api/response";
import { calculateExitFinancials, type ExitFinancials } from "@/lib/calculators/exitCalculator";

export async function calculateExitFinancialsAction(input: {
  totalContractPrice: number;
  amountPaid: number;
}): Promise<ApiResult<ExitFinancials>> {
  try {
    return ok(calculateExitFinancials(input));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "calculation_failed");
  }
}
