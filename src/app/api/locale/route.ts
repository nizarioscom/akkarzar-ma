import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: string };
  const locale = body.locale === "ar" ? "ar" : "fr";
  const response = NextResponse.json({ success: true, data: { locale } });
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
