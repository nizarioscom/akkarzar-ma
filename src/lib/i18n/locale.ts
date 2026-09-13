import { cookies } from "next/headers";
import type { AppLocale } from "@/lib/i18n/dictionary";
import { DEFAULT_LOCALE, isAppLocale, LOCALE_COOKIE } from "@/lib/i18n/paths";

export { LOCALE_COOKIE };

export async function readLocale(): Promise<AppLocale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value && isAppLocale(value) ? value : DEFAULT_LOCALE;
}
