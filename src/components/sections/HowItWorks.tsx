import Image from "next/image";
import { FileCheck2, Landmark, Scale, ArrowLeftRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function HowItWorks({ copy }: { copy: Dictionary }) {
  const steps = [
    { title: copy.howStep1Title, body: copy.howStep1Body, icon: FileCheck2 },
    { title: copy.howStep2Title, body: copy.howStep2Body, icon: Landmark },
    { title: copy.howStep3Title, body: copy.howStep3Body, icon: Scale },
    { title: copy.howStep4Title, body: copy.howStep4Body, icon: ArrowLeftRight },
  ];

  return (
    <section>
      <div className="mb-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--ink)]">{copy.howTitle}</h2>
          <p className="mt-2 text-[var(--muted)]">{copy.howLead}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="/images/landing/service-seller-docs.png"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>
      <ol className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 text-[var(--ink)]">
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--flag-green)]">
              <step.icon className="size-4" aria-hidden />
              {index + 1}. {step.title}
            </p>
            <p className="mt-2 text-sm leading-7 text-[#3f3a33]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
