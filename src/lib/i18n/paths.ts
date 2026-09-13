import type { AppLocale } from "@/lib/i18n/dictionary";

export const APP_LOCALES = ["ar", "fr"] as const;
export const DEFAULT_LOCALE: AppLocale = "ar";
export const LOCALE_COOKIE = "aqar_locale";

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

export function localePath(locale: AppLocale, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(ar|fr)(?=\/|$)/);
  if (!match) {
    return pathname;
  }
  const rest = pathname.slice(match[0].length);
  return rest.length === 0 ? "/" : rest;
}

export function swapLocalePath(pathname: string, next: AppLocale): string {
  const rest = stripLocalePrefix(pathname);
  return localePath(next, rest);
}
