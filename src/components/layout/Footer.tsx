import Link from "next/link";
import { Building2, Lock, Scale, ShieldCheck } from "lucide-react";
import type { AppLocale, Dictionary } from "@/lib/i18n/dictionary";
import { localePath } from "@/lib/i18n/paths";

export function Footer({ locale, copy }: { locale: AppLocale; copy: Dictionary }) {
  return (
    <footer className="mt-16 border-t-4 border-[var(--flag-red)] bg-[#10261c] text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-white">
            <Building2 className="size-5 text-emerald-300" aria-hidden />
            {copy.brand}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{copy.footerMission}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-emerald-100">
              <ShieldCheck className="size-3.5" aria-hidden />
              {copy.cndpBadge}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-emerald-100">
              <Lock className="size-3.5" aria-hidden />
              {copy.securityBadge}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{copy.footerColServices}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-200">
            <li>
              <Link href={`${localePath(locale)}#calculator`}>{copy.navCalc}</Link>
            </li>
            <li>
              <Link href={localePath(locale, "/marketplace")}>{copy.navMarket}</Link>
            </li>
            <li>
              <Link href={localePath(locale, "/seller")}>{copy.navSeller}</Link>
            </li>
            <li>
              <Link href={localePath(locale, "/buyer")}>{copy.navBuyer}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{copy.footerColB2b}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-200">
            <li>
              <Link href={localePath(locale, "/promoter")}>{copy.navPromoter}</Link>
            </li>
            <li>
              <Link href={localePath(locale, "/notary")}>{copy.navNotary}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{copy.footerColLegal}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-200">
            <li>
              <Link href={localePath(locale, "/legal/cgu")}>{copy.legalCgu}</Link>
            </li>
            <li>
              <Link href={localePath(locale, "/legal/privacy")}>{copy.legalPrivacy}</Link>
            </li>
            <li>
              <Link href={localePath(locale, "/legal/vefa")}>{copy.footerVefaGuide}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs leading-6 text-slate-300 md:flex-row md:justify-between">
          <p>{copy.footerCopyright}</p>
          <p className="inline-flex items-start gap-2">
            <Scale className="mt-0.5 size-3.5 shrink-0 text-emerald-300" aria-hidden />
            {copy.footerNotaryAuthority}
          </p>
        </div>
      </div>
    </footer>
  );
}
