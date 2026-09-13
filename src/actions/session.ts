"use server";

import { fail, ok, type ApiResult } from "@/lib/api/response";
import { getSessionProfile } from "@/lib/auth/session";
import type { SessionProfile } from "@/lib/auth/types";

export async function getCurrentProfile(): Promise<ApiResult<SessionProfile>> {
  const profile = await getSessionProfile();
  if (!profile) {
    return fail("unauthenticated");
  }
  return ok(profile);
}
