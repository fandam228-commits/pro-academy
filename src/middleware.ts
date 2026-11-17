import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that never require a login session
const PUBLIC_PAGE_PATHS = ["/", "/login"];
const PUBLIC_PAGE_PREFIXES = ["/dashboard/challenge"];
const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/health",
  "/api/google/oauth",
  "/api/webhooks",
  "/api/challenges",
];

// Assets and static files to ignore
const STATIC_FILE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|woff|woff2|ttf)$/i;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip static assets, Next.js internal files and metadata files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/pdfs/file/") || // handled with inline download security
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/apple-icon" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    STATIC_FILE_EXTENSIONS.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Check for session token (HttpOnly cookie or Authorization header)
  const sessionCookie = request.cookies.get("pa_session")?.value;
  const authHeader = request.headers.get("authorization");
  const hasToken = Boolean(
    (sessionCookie && sessionCookie.trim().length > 0) ||
    (authHeader && authHeader.toLowerCase().startsWith("bearer ") && authHeader.slice(7).trim().length > 0)
  );

  // 3. Handle public pages (e.g. /, /login, and viral 1v1 challenge pages)
  const isPublicPage =
    PUBLIC_PAGE_PATHS.includes(pathname) ||
    PUBLIC_PAGE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
  if (isPublicPage) {
    // If user is already authenticated and visits /login, redirect to returnUrl or home
    if (pathname === "/login" && hasToken) {
      const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/";
      const redirectUrl = new URL(returnUrl, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 4. Handle public API routes
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublicApi) {
    return NextResponse.next();
  }

  // 5. Block unauthenticated access to internal API endpoints
  if (pathname.startsWith("/api/")) {
    if (!hasToken) {
      return NextResponse.json(
        { error: "Unauthorized. A valid login session is required to access Professional Academy APIs." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 6. Block unauthenticated access to all internal pages & redirect to /login with returnUrl
  if (!hasToken) {
    const returnUrl = pathname + search;
    const loginUrl = new URL("/login", request.url);
    if (returnUrl && returnUrl !== "/" && returnUrl !== "/login") {
      loginUrl.searchParams.set("returnUrl", returnUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
