import { applyBps, assertPositiveMoney, roundMad } from "@/lib/money";

export const PLATFORM_FEE_BPS = 125;
export const SELLER_FEE_BPS = 0;
export const CANCELLATION_PENALTY_BPS = 1500;
export const REGISTRATION_TAX_BPS = 400;
export const LAND_REGISTRY_BPS = 150;
export const NOTARY_VAT_RATE = 0.2;

export type ExitCalculatorInput = {
  totalContractPrice: number;
  amountPaid: number;
};

export type ExitFinancials = {
  currency: "MAD";
  totalContractPrice: number;
  amountPaid: number;
  remainingBalance: number;
  sellerFeeBps: typeof SELLER_FEE_BPS;
  sellerNetRefund: number;
  buyerPlatformFeeBps: typeof PLATFORM_FEE_BPS;
  buyerPlatformFee: number;
  cancellationPenaltyRateBps: typeof CANCELLATION_PENALTY_BPS;
  cancellationPenaltyAmount: number;
  sellerSavingsVsDirectCancellation: number;
  notaryHonorairesHt: number;
  notaryVat: number;
  registrationTax: number;
  landRegistryFee: number;
  estimatedNotaryAndRegistration: number;
  buyerPaysSellerAtCost: number;
  buyerTotalAcquisitionCost: number;
};

/**
 * Progressive Moroccan notary honoraires estimate (HT) commonly used for
 * immovable-property acts. Indicative only — not a notarial quotation.
 */
export function estimateNotaryHonorairesHt(propertyValue: number): number {
  const bands: { upTo: number; rate: number }[] = [
    { upTo: 300_000, rate: 0.015 },
    { upTo: 1_000_000, rate: 0.01 },
    { upTo: 5_000_000, rate: 0.0075 },
    { upTo: Number.POSITIVE_INFINITY, rate: 0.005 },
  ];

  let remaining = propertyValue;
  let lastCap = 0;
  let fees = 0;

  for (const band of bands) {
    const slice = Math.min(remaining, band.upTo - lastCap);
    if (slice > 0) {
      fees += slice * band.rate;
      remaining -= slice;
    }
    lastCap = band.upTo;
    if (remaining <= 0) {
      break;
    }
  }

  return roundMad(fees);
}

export function calculateExitFinancials(input: ExitCalculatorInput): ExitFinancials {
  assertPositiveMoney("totalContractPrice", input.totalContractPrice);
  assertPositiveMoney("amountPaid", input.amountPaid);

  const totalContractPrice = roundMad(input.totalContractPrice);
  const amountPaid = roundMad(input.amountPaid);

  if (amountPaid > totalContractPrice) {
    throw new Error("amountPaid cannot exceed totalContractPrice");
  }

  const remainingBalance = roundMad(totalContractPrice - amountPaid);
  const sellerNetRefund = roundMad(amountPaid);
  const buyerPlatformFee = applyBps(totalContractPrice, PLATFORM_FEE_BPS);
  const cancellationPenaltyAmount = applyBps(totalContractPrice, CANCELLATION_PENALTY_BPS);
  const notaryHonorairesHt = estimateNotaryHonorairesHt(totalContractPrice);
  const notaryVat = roundMad(notaryHonorairesHt * NOTARY_VAT_RATE);
  const registrationTax = applyBps(totalContractPrice, REGISTRATION_TAX_BPS);
  const landRegistryFee = applyBps(totalContractPrice, LAND_REGISTRY_BPS);
  const estimatedNotaryAndRegistration = roundMad(
    notaryHonorairesHt + notaryVat + registrationTax + landRegistryFee,
  );

  return {
    currency: "MAD",
    totalContractPrice,
    amountPaid,
    remainingBalance,
    sellerFeeBps: SELLER_FEE_BPS,
    sellerNetRefund,
    buyerPlatformFeeBps: PLATFORM_FEE_BPS,
    buyerPlatformFee,
    cancellationPenaltyRateBps: CANCELLATION_PENALTY_BPS,
    cancellationPenaltyAmount,
    sellerSavingsVsDirectCancellation: cancellationPenaltyAmount,
    notaryHonorairesHt,
    notaryVat,
    registrationTax,
    landRegistryFee,
    estimatedNotaryAndRegistration,
    buyerPaysSellerAtCost: sellerNetRefund,
    buyerTotalAcquisitionCost: roundMad(
      sellerNetRefund + remainingBalance + buyerPlatformFee + estimatedNotaryAndRegistration,
    ),
  };
}
