import { Check, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function ComparisonTable({ copy }: { copy: Dictionary }) {
  const rows = [
    [copy.compareOverprice, copy.traditionalOverprice, copy.aqarOverprice],
    [copy.compareDocs, copy.traditionalDocs, copy.aqarDocs],
    [copy.compareFees, copy.traditionalFees, copy.aqarFees],
    [copy.compareRisk, copy.traditionalRisk, copy.aqarRisk],
    [copy.comparePrivacy, copy.traditionalPrivacy, copy.aqarPrivacy],
  ] as const;

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <h2 className="text-2xl font-semibold">{copy.compareTitle}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-[var(--bg)]">
            <tr>
              <th className="px-4 py-3 text-start font-medium text-[var(--muted)]"> </th>
              <th className="px-4 py-3 text-start">{copy.compareTraditional}</th>
              <th className="px-4 py-3 text-start text-[var(--accent)]">{copy.compareAqar}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, traditional, aqar]) => (
              <tr key={label} className="border-t border-[var(--line)]">
                <th className="px-4 py-3 text-start font-medium">{label}</th>
                <td className="px-4 py-3 text-[var(--muted)]">
                  <span className="inline-flex items-start gap-2">
                    <X className="mt-0.5 size-4 shrink-0 text-[var(--danger)]" aria-hidden />
                    {traditional}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--success)]" aria-hidden />
                    {aqar}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
