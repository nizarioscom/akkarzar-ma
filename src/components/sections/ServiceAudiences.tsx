import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function ServiceAudiences({ copy }: { copy: Dictionary }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold text-[var(--ink)]">{copy.audiencesTitle}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]">
          <div className="relative h-44">
            <Image src="/images/landing/service-seller-docs.png" alt="" fill className="object-cover" sizes="33vw" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{copy.audienceSellerTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-[#3f3a33]">{copy.audienceSellerBody}</p>
          </div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]">
          <div className="relative h-44">
            <Image src="/images/landing/service-buyer-keys.png" alt="" fill className="object-cover" sizes="33vw" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{copy.audienceBuyerTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-[#3f3a33]">{copy.audienceBuyerBody}</p>
          </div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]">
          <div className="relative h-44">
            <Image src="/images/landing/service-notary.png" alt="" fill className="object-cover" sizes="33vw" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{copy.audienceLegalTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-[#3f3a33]">{copy.audienceLegalBody}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
