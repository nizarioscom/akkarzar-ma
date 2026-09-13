"use client";

import { useState } from "react";
import type { ExitFinancials } from "@/lib/calculators/exitCalculator";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { Button, Card, Field } from "@/components/ui";

export function ExitCalculator({ copy }: { copy: Dictionary }) {
  const [totalContractPrice, setTotal] = useState("1200000");
  const [amountPaid, setPaid] = useState("350000");
  const [result, setResult] = useState<ExitFinancials | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/calculator", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        totalContractPrice: Number(totalContractPrice),
        amountPaid: Number(amountPaid),
      }),
    });
    const json = (await response.json()) as { success: boolean; data?: ExitFinancials; error?: string };
    if (!json.success || !json.data) {
      setResult(null);
      setError(json.error ?? "error");
      return;
    }
    setResult(json.data);
  }

  return (
    <Card>
      <h2 className="mb-2 text-xl font-semibold">{copy.calcTitle}</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.calcHint}</p>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
        <Field label={copy.totalPrice} value={totalContractPrice} onChange={(e) => setTotal(e.target.value)} />
        <Field label={copy.amountPaid} value={amountPaid} onChange={(e) => setPaid(e.target.value)} />
        <div className="md:col-span-2">
          <Button type="submit">{copy.ctaCalc}</Button>
        </div>
      </form>
      {error ? <p className="mt-3 text-sm text-[var(--warn)]">{error}</p> : null}
      {result ? (
        <dl className="mt-5 grid gap-2 text-sm md:grid-cols-2">
          <div>
            {copy.sellerRefund}: <strong>{result.sellerNetRefund} MAD</strong>
          </div>
          <div>
            {copy.buyerFee}: <strong>{result.buyerPlatformFee} MAD</strong>
          </div>
          <div>
            {copy.cancelLoss}: <strong>{result.cancellationPenaltyAmount} MAD</strong>
          </div>
          <div>
            {copy.savings}: <strong>{result.sellerSavingsVsDirectCancellation} MAD</strong>
          </div>
          <div>
            {copy.notaryFees}: <strong>{result.estimatedNotaryAndRegistration} MAD</strong>
          </div>
          <div>
            {copy.buyerTotal}: <strong>{result.buyerTotalAcquisitionCost} MAD</strong>
          </div>
        </dl>
      ) : null}
    </Card>
  );
}
