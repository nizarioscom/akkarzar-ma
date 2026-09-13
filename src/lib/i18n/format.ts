import type { AppLocale } from "@/lib/i18n/dictionary";

export function formatMad(amount: number, locale: AppLocale): string {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 2,
  }).format(amount);
  return locale === "ar" ? `${formatted} د.م.` : `${formatted} MAD`;
}
