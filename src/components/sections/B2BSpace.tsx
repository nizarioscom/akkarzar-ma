import Image from "next/image";
import Link from "next/link";
import type { AppLocale, Dictionary } from "@/lib/i18n/dictionary";
import { localePath } from "@/lib/i18n/paths";

export function B2BSpace({ locale, copy }: { locale: AppLocale; copy: Dictionary }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold text-[var(--ink)]">{copy.b2bTitle}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]">
          <div className="relative h-40">
            <Image src="/images/landing/listing-rabat-residence.png" alt="" fill className="object-cover" sizes="50vw" />
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold">{copy.b2bPromoterTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-[#3f3a33]">{copy.b2bPromoterBody}</p>
            <Link
              href={localePath(locale, "/promoter")}
              className="mt-4 inline-flex rounded-full bg-[var(--flag-green)] px-4 py-2 text-sm font-semibold text-white"
            >
              {copy.b2bOpen}
            </Link>
          </div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]">
          <div className="relative h-40">
            <Image src="/images/landing/service-notary.png" alt="" fill className="object-cover" sizes="50vw" />
          </div>
          <div className="p-5">
            <h3 className="text-xl font-semibold">{copy.b2bNotaryTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-[#3f3a33]">{copy.b2bNotaryBody}</p>
            <Link
              href={localePath(locale, "/notary")}
              className="mt-4 inline-flex rounded-full bg-[#1a1712] px-4 py-2 text-sm font-semibold text-white"
            >
              {copy.b2bOpen}
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
