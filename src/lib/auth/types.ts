import type { Locale, UserRole } from "@prisma/client";

export type AuthenticatorAssurance = "aal1" | "aal2";

export type SessionProfile = {
  id: string;
  role: UserRole;
  locale: Locale;
  displayName: string | null;
  isActive: boolean;
  aal: AuthenticatorAssurance;
};

export type RouteGuardRule = {
  prefix: string;
  roles: readonly UserRole[];
};
