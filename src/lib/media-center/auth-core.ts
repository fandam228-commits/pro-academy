/**
 * PRO MEDIA COMMAND CENTER (PMC) — Core RBAC & Permissions Logic
 * Professional Academy — Mr. Habib El Rahman
 */

export type PMCRole = "super_admin" | "editor" | "analyst";

export interface PMCAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  pmcRole: PMCRole;
  isSuperAdmin: boolean;
}

export const ROLE_HIERARCHY: Record<PMCRole, number> = {
  analyst: 1,
  editor: 2,
  super_admin: 3,
};

/**
 * Resolves the PMC permission role for an authenticated user.
 */
export function resolvePMCRole(user: { id: string; role: string; email: string }): PMCRole | null {
  // Mr. Habib El Rahman is Super Admin
  if (
    user.role === "admin" ||
    user.id === "usr_admin_habib" ||
    user.email === "habib.admin@proacademy.com"
  ) {
    return "super_admin";
  }

  // Teachers operate as content editors
  if (user.role === "teacher") {
    return "editor";
  }

  return null;
}

/**
 * Evaluates whether a role meets or exceeds the required permission level.
 */
export function hasRequiredPMCRole(userRole: PMCRole, requiredRole: PMCRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
