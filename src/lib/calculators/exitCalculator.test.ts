import { describe, expect, it } from "vitest";
import { calculateExitFinancials, estimateNotaryHonorairesHt } from "@/lib/calculators/exitCalculator";

describe("calculateExitFinancials", () => {
  it("refunds 100% to the seller and charges 1.25% to the buyer", () => {
    const result = calculateExitFinancials({
      totalContractPrice: 1_000_000,
      amountPaid: 250_000,
    });

    expect(result.sellerNetRefund).toBe(250_000);
    expect(result.sellerFeeBps).toBe(0);
    expect(result.buyerPlatformFee).toBe(12_500);
    expect(result.remainingBalance).toBe(750_000);
    expect(result.cancellationPenaltyAmount).toBe(150_000);
    expect(result.sellerSavingsVsDirectCancellation).toBe(150_000);
  });

  it("rejects paid amounts above the contract price", () => {
    expect(() =>
      calculateExitFinancials({
        totalContractPrice: 100,
        amountPaid: 120,
      }),
    ).toThrow(/amountPaid/);
  });

  it("estimates progressive notary honoraires", () => {
    expect(estimateNotaryHonorairesHt(300_000)).toBe(4_500);
    expect(estimateNotaryHonorairesHt(1_000_000)).toBe(11_500);
  });
});
