import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthenticatorAssurance, SessionProfile } from "@/lib/auth/types";

function toAssurance(aal: unknown): AuthenticatorAssurance {
  return aal === "aal2" ? "aal2" : "aal1";
}

export async function getVerifiedAuthUserId(): Promise<{
  userId: string;
  aal: AuthenticatorAssurance;
} | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub || typeof data.claims.sub !== "string") {
    return null;
  }

  return {
    userId: data.claims.sub,
    aal: toAssurance(data.claims.aal),
  };
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const auth = await getVerifiedAuthUserId();
  if (!auth) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      role: true,
      locale: true,
      displayName: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    ...user,
    aal: auth.aal,
  };
}

export async function getSessionUser(): Promise<User | null> {
  const auth = await getVerifiedAuthUserId();
  if (!auth) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: auth.userId },
  });
}
