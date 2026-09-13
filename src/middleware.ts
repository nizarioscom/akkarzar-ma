import { NextResponse, type NextRequest } from "next/server";
import { matchProtectedRoute, roleRequiresMfa } from "@/lib/auth/roles";
import { DEFAULT_LOCALE, isAppLocale, localePath, LOCALE_COOKIE, stripLocalePrefix } from "@/lib/i18n/paths";
import { updateSession } from "@/lib/supabase/middleware";

function isSkippedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

function redirectWithReason(request: NextRequest, reason: "required" | "forbidden" | "mfa") {
  const first = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  const locale = first && isAppLocale(first) ? first : DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = localePath(locale);
  url.searchParams.set("auth", reason);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isSkippedPath(pathname)) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.next({ request });
    }
    const session = await updateSession(request);
    return session.response;
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment || !isAppLocale(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = localePath(DEFAULT_LOCALE, pathname === "/" ? "/" : pathname);
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return redirect;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const response = NextResponse.next({ request });
    response.cookies.set(LOCALE_COOKIE, firstSegment, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const { response, userId, aal, role } = await updateSession(request);
  response.cookies.set(LOCALE_COOKIE, firstSegment, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  const rule = matchProtectedRoute(stripLocalePrefix(pathname));
  if (!rule) {
    return response;
  }

  if (!userId) {
    return redirectWithReason(request, "required");
  }

  if (rule.prefix !== "/dashboard") {
    if (!role || !rule.roles.includes(role)) {
      return redirectWithReason(request, "forbidden");
    }
    if (roleRequiresMfa(role) && aal !== "aal2") {
      return redirectWithReason(request, "mfa");
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
