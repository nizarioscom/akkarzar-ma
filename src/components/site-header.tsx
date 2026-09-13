"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Scale } from "lucide-react";
import type { AppLocale, Dictionary } from "@/lib/i18n/dictionary";
import { localePath, swapLocalePath } from "@/lib/i18n/paths";

export function SiteHeader({ locale, copy }: { locale: AppLocale; copy: Dictionary }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: AppLocale) {
    router.push(swapLocalePath(pathname, next));
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--card)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href={localePath(locale)} className="flex items-center gap-2 font-bold">
          <Building2 className="size-5 text-[var(--accent)]" aria-hidden />
          {copy.brand}
        </Link>
        <nav className="flex flex-wrap gap-3 text-sm font-medium text-[#1a1712]">
          <Link href={localePath(locale, "/marketplace")}>{copy.navMarket}</Link>
          <Link href={`${localePath(locale)}#calculator`}>{copy.navCalc}</Link>
          <Link href={localePath(locale, "/seller")}>{copy.navSeller}</Link>
          <Link href={localePath(locale, "/buyer")}>{copy.navBuyer}</Link>
          <Link href={localePath(locale, "/promoter")} className="inline-flex items-center gap-1">
            <Building2 className="size-3.5" aria-hidden />
            {copy.navPromoter}
          </Link>
          <Link href={localePath(locale, "/notary")} className="inline-flex items-center gap-1">
            <Scale className="size-3.5" aria-hidden />
            {copy.navNotary}
          </Link>
        </nav>
        <div className="flex overflow-hidden rounded-full border border-[#c4b8a4] text-sm">
          <button
            type="button"
            className={`px-3 py-1 ${locale === "ar" ? "bg-[var(--flag-green)] text-white" : "bg-white text-[#1a1712]"}`}
            onClick={() => switchLocale("ar")}
            aria-pressed={locale === "ar"}
          >
            ع
          </button>
          <button
            type="button"
            className={`px-3 py-1 ${locale === "fr" ? "bg-[var(--flag-red)] text-white" : "bg-white text-[#1a1712]"}`}
            onClick={() => switchLocale("fr")}
            aria-pressed={locale === "fr"}
          >
            FR
          </button>
        </div>
      </div>
    </header>
  );
}
