import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isUserRole } from "@/lib/auth/roles";
import { getSupabasePublicEnv } from "@/lib/env";
import type { UserRole } from "@prisma/client";

function roleFromAppMetadata(appMetadata: unknown): UserRole | null {
  if (!appMetadata || typeof appMetadata !== "object" || !("role" in appMetadata)) {
    return null;
  }

  const role = (appMetadata as { role?: unknown }).role;
  return typeof role === "string" && isUserRole(role) ? role : null;
}

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  userId: string | null;
  aal: "aal1" | "aal2" | null;
  role: UserRole | null;
}> {
  let response = NextResponse.next({
    request,
  });

  const { url, publishableKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const aal = claims?.aal === "aal2" ? "aal2" : claims?.sub ? "aal1" : null;

  return {
    response,
    userId: typeof claims?.sub === "string" ? claims.sub : null,
    aal,
    role: roleFromAppMetadata(claims?.app_metadata),
  };
}
