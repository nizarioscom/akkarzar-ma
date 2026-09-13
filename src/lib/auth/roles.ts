import type { UserRole } from "@prisma/client";
import type { RouteGuardRule } from "@/lib/auth/types";
import { stripLocalePrefix } from "@/lib/i18n/paths";

export const USER_ROLES = [
  "BUYER",
  "SELLER",
  "DEVELOPER_PROMOTER",
  "NOTARY_PARTNER",
  "ADMIN",
] as const satisfies readonly UserRole[];

/** MFA (AAL2) is required for privileged B2B / admin roles. */
export const MFA_REQUIRED_ROLES: readonly UserRole[] = [
  "ADMIN",
  "NOTARY_PARTNER",
  "DEVELOPER_PROMOTER",
];

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function roleRequiresMfa(role: UserRole): boolean {
  return MFA_REQUIRED_ROLES.includes(role);
}

export const PROTECTED_ROUTE_RULES: readonly RouteGuardRule[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/notary", roles: ["NOTARY_PARTNER", "ADMIN"] },
  { prefix: "/promoter", roles: ["DEVELOPER_PROMOTER", "ADMIN"] },
  { prefix: "/seller", roles: ["SELLER", "ADMIN"] },
  { prefix: "/buyer", roles: ["BUYER", "ADMIN"] },
  { prefix: "/dashboard", roles: ["BUYER", "SELLER", "DEVELOPER_PROMOTER", "NOTARY_PARTNER", "ADMIN"] },
];

export function matchProtectedRoute(pathname: string): RouteGuardRule | null {
  const normalized = stripLocalePrefix(pathname);
  return (
    PROTECTED_ROUTE_RULES.find(
      (rule) => normalized === rule.prefix || normalized.startsWith(`${rule.prefix}/`),
    ) ?? null
  );
}
