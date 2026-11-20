/**
 * PRO MEDIA COMMAND CENTER (PMC) — Authentication & Server-Side RBAC Guard
 * Professional Academy — Mr. Habib El Rahman
 */

import { getAuthContext } from "@/lib/security";
import { NextResponse } from "next/server";
import {
  PMCRole,
  PMCAuthUser,
  resolvePMCRole,
  hasRequiredPMCRole,
} from "./auth-core";

export * from "./auth-core";

export interface PMCAuthResult {
  user: PMCAuthUser | null;
  denied: NextResponse | null;
}

/**
 * Enforces PMC authentication and role level on API routes.
 */
export async function requirePMCAuth(
  req: Request,
  requiredRole: PMCRole = "analyst"
): Promise<PMCAuthResult> {
  const authCtx = await getAuthContext(req);
  if (!authCtx?.user) {
    return {
      user: null,
      denied: NextResponse.json(
        { error: "Unauthorized. Authentication session required to access Pro Media Command Center." },
        { status: 401 }
      ),
    };
  }

  const pmcRole = resolvePMCRole(authCtx.user);
  if (!pmcRole) {
    return {
      user: null,
      denied: NextResponse.json(
        { error: "Forbidden. Access restricted to Professional Academy administration." },
        { status: 403 }
      ),
    };
  }

  if (!hasRequiredPMCRole(pmcRole, requiredRole)) {
    return {
      user: null,
      denied: NextResponse.json(
        {
          error: `Forbidden. This operation requires '${requiredRole}' privileges. Your level: '${pmcRole}'.`,
          requiredRole,
          currentRole: pmcRole,
        },
        { status: 403 }
      ),
    };
  }

  const pmcUser: PMCAuthUser = {
    id: authCtx.user.id,
    name: authCtx.user.name,
    email: authCtx.user.email,
    role: authCtx.user.role,
    pmcRole,
    isSuperAdmin: pmcRole === "super_admin",
  };

  return { user: pmcUser, denied: null };
}
