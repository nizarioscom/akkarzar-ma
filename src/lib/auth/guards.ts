import type { UserRole } from "@prisma/client";
import { fail, type ApiFailure } from "@/lib/api/response";
import { roleRequiresMfa } from "@/lib/auth/roles";
import { getSessionProfile } from "@/lib/auth/session";
import type { SessionProfile } from "@/lib/auth/types";

export function isApiFailure(value: SessionProfile | ApiFailure): value is ApiFailure {
  return "success" in value && value.success === false;
}

export async function requireAuth(): Promise<SessionProfile | ApiFailure> {
  const profile = await getSessionProfile();
  if (!profile) {
    return fail("unauthenticated");
  }
  return profile;
}

export async function requireRole(allowed: readonly UserRole[]): Promise<SessionProfile | ApiFailure> {
  const profile = await requireAuth();
  if (isApiFailure(profile)) {
    return profile;
  }

  if (!allowed.includes(profile.role)) {
    return fail("forbidden");
  }

  if (roleRequiresMfa(profile.role) && profile.aal !== "aal2") {
    return fail("mfa_required");
  }

  return profile;
}
