"use client";

import { useMemo, useState } from "react";
import { Ban, CircleCheck, Scale } from "lucide-react";
import { calculateExitFinancials } from "@/lib/calculators/exitCalculator";
import { formatMad } from "@/lib/i18n/format";
import type { AppLocale, Dictionary } from "@/lib/i18n/dictionary";
import { Field } from "@/components/ui";

export function ExitCalculatorWidget({ locale, copy }: { locale: AppLocale; copy: Dictionary }) {
  const [totalContractPrice, setTotal] = useState("1200000");
  const [amountPaid, setPaid] = useState("350000");

  const result = useMemo(() => {
    const total = Number(totalContractPrice);
    const paid = Number(amountPaid);
    if (!Number.isFinite(total) || !Number.isFinite(paid) || total <= 0 || paid < 0 || paid > total) {
      return null;
    }
    try {
      return calculateExitFinancials({ totalContractPrice: total, amountPaid: paid });
    } catch {
      return null;
    }
  }, [totalContractPrice, amountPaid]);

  return (
    <section id="calculator" className="zellige-frame rounded-3xl bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Scale className="size-5 text-[var(--accent)]" aria-hidden />
        <div>
          <h2 className="text-xl font-semibold">{copy.calcTitle}</h2>
          <p className="text-sm text-[var(--muted)]">{copy.calcHint}</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label={copy.totalPrice} value={totalContractPrice} onChange={(event) => setTotal(event.target.value)} />
        <Field label={copy.amountPaid} value={amountPaid} onChange={(event) => setPaid(event.target.value)} />
      </div>
      {result ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Ban className="size-4" aria-hidden />
              {copy.cancelLoss}
            </p>
            <p className="mt-2 text-2xl font-bold">{formatMad(result.cancellationPenaltyAmount, locale)}</p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CircleCheck className="size-4" aria-hidden />
              {copy.sellerRefund}
            </p>
            <p className="mt-2 text-2xl font-bold">{formatMad(result.sellerNetRefund, locale)}</p>
          </article>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--warn)]">{copy.calcHint}</p>
      )}
      <p className="mt-4 rounded-xl bg-[#f3efe4] px-3 py-2 text-sm text-[#1a1712]">
        {copy.feeSeller} · {copy.feeBuyer}
      </p>
    </section>
  );
}
