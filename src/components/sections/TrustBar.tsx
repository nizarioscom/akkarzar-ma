import { Lock, EyeOff, ScrollText } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function TrustBar({ copy }: { copy: Dictionary }) {
  const items = [
    { icon: Lock, text: copy.trust1 },
    { icon: EyeOff, text: copy.trust2 },
    { icon: ScrollText, text: copy.trust3 },
  ];

  return (
    <section className="rounded-3xl bg-[var(--flag-green)] p-6 text-white">
      <h2 className="text-2xl font-semibold">{copy.trustTitle}</h2>
      <p className="mt-1 text-sm text-emerald-50">{copy.citiesTitle}: {copy.citiesBody}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.text} className="flex gap-3 rounded-2xl bg-white/10 p-3 text-sm leading-6 text-white">
            <item.icon className="mt-0.5 size-5 shrink-0 text-emerald-100" aria-hidden />
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
