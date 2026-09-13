import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { ExitCalculatorWidget } from "@/components/calculator/ExitCalculatorWidget";
import { B2BSpace } from "@/components/sections/B2BSpace";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { FeaturedOpportunities } from "@/components/sections/FeaturedOpportunities";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ServiceAudiences } from "@/components/sections/ServiceAudiences";
import { TrustBar } from "@/components/sections/TrustBar";
import { Container } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isAppLocale, localePath } from "@/lib/i18n/paths";
import { safePublicListings } from "@/lib/listings/dashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "تنازل عن عقد VEFA بسعر التكلفة، تحت رقابة الموثق" : "Cession VEFA au prix coûtant, sous contrôle notarial",
    description: isAr
      ? "AkkarZar.ma — عقار زار: تنازل عقود الحجز VEFA وفق القانون 107.12 مع تحقق الموثق (المادة 4)."
      : "AkkarZar.ma — cession de contrats VEFA (loi 107.12) avec contrôle notarial (article 4), en dirham marocain.",
    alternates: {
      languages: { ar: "/ar", fr: "/fr" },
    },
    openGraph: {
      title: "AkkarZar.ma — عقار زار",
      locale: isAr ? "ar_MA" : "fr_MA",
      type: "website",
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isAppLocale(rawLocale)) {
    return null;
  }
  const locale = rawLocale;
  const copy = getDictionary(locale);
  const listings = await safePublicListings();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <>
      <section className="relative isolate min-h-[420px] overflow-hidden">
        <Image
          src="/images/landing/hero-casablanca-vefa.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0b241c]/85 via-[#0b241c]/75 to-[#3b0a0c]/55" />
        <Container>
          <div className="relative z-10 max-w-3xl py-16 text-white">
            <p className="text-sm font-semibold tracking-wide text-[#f3d2b3]">{copy.landingKicker}</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{copy.tagline}</h1>
            <p className="mt-4 text-base leading-8 text-[#f4f1ea]">{copy.landingLead}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--flag-green)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-2 ring-white/90"
              >
                {copy.ctaCalc}
                <Arrow className="size-4" aria-hidden />
              </a>
              <Link
                href={localePath(locale, "/marketplace")}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--flag-red)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-2 ring-white/90"
              >
                {copy.ctaExplore}
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#e8e2d6]">
              <ShieldCheck className="size-4 text-[#b7e4c7]" aria-hidden />
              {copy.currency} · CNDP 09.08 · 107.12
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <div className="grid gap-12 py-10">
          <ExitCalculatorWidget locale={locale} copy={copy} />
          <HowItWorks copy={copy} />
          <ServiceAudiences copy={copy} />
          <ComparisonTable copy={copy} />
          <FeaturedOpportunities locale={locale} copy={copy} listings={listings} />
          <B2BSpace locale={locale} copy={copy} />
          <TrustBar copy={copy} />
        </div>
      </Container>
    </>
  );
}
