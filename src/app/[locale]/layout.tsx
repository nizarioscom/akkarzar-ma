import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AkkarZarAIAgent } from "@/components/ai/AkkarZarAIAgent";
import { Footer } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n/dictionary";
import { isAppLocale } from "@/lib/i18n/paths";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "fr" }];
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    notFound();
  }

  const copy = getDictionary(locale);

  return (
    <>
      <SiteHeader locale={locale} copy={copy} />
      <main>{children}</main>
      <Footer locale={locale} copy={copy} />
      <AkkarZarAIAgent locale={locale} copy={copy} />
    </>
  );
}
