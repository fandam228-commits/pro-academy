import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Global Auth & Edge Middleware Verification", () => {
  const middlewarePath = path.join(rootDir, "src", "middleware.ts");
  assert.ok(fs.existsSync(middlewarePath), "src/middleware.ts must exist");
  const content = fs.readFileSync(middlewarePath, "utf-8");

  // Check public whitelists
  assert.ok(content.includes('"/login"'), "Middleware must whitelist /login");
  assert.ok(content.includes('"/api/auth"'), "Middleware must whitelist /api/auth");
  assert.ok(content.includes('"/api/health"'), "Middleware must whitelist /api/health");

  // Check 401 blocking for unauthenticated internal APIs
  assert.ok(content.includes("401"), "Middleware must return 401 for unauthorized API calls");
  assert.ok(content.includes("Unauthorized"), "Middleware 401 error message must be informative");

  // Check redirect to /login with returnUrl for unauthenticated internal pages
  assert.ok(content.includes("/login"), "Middleware must redirect guests to /login");
  assert.ok(content.includes("returnUrl"), "Middleware must preserve returnUrl in login redirect");

  // Check session token detection via pa_session cookie and Authorization header
  assert.ok(content.includes("pa_session"), "Middleware must check pa_session cookie");
  assert.ok(content.includes("authorization"), "Middleware must check authorization header");
});

test("Dedicated Login Route Verification", () => {
  const loginPagePath = path.join(rootDir, "src", "app", "login", "page.tsx");
  assert.ok(fs.existsSync(loginPagePath), "src/app/login/page.tsx must exist");
  const content = fs.readFileSync(loginPagePath, "utf-8");

  assert.ok(content.includes("useSearchParams"), "Login page must read searchParams");
  assert.ok(content.includes("returnUrl"), "Login page must extract returnUrl parameter");
  assert.ok(content.includes("AuthScreen"), "Login page must render AuthScreen");
  assert.ok(content.includes("router.replace(returnUrl)"), "Login page must redirect to returnUrl upon login success");
});

test("Persistent Login (30-day Session TTL) Verification", () => {
  const securityPath = path.join(rootDir, "src", "lib", "security.ts");
  const authRoutePath = path.join(rootDir, "src", "app", "api", "auth", "route.ts");
  const authScreenPath = path.join(rootDir, "src", "components", "AuthScreen.tsx");

  const secContent = fs.readFileSync(securityPath, "utf-8");
  const authContent = fs.readFileSync(authRoutePath, "utf-8");
  const screenContent = fs.readFileSync(authScreenPath, "utf-8");

  // 30 days = 30 * 24 * 60 * 60 * 1000 = 2592000000 ms
  assert.ok(secContent.includes("30 * 24 * 60 * 60 * 1000"), "Must define 30-day session TTL constant");
  assert.ok(secContent.includes("DEFAULT_PERSISTENT_SESSION_TTL_MS"), "Must export DEFAULT_PERSISTENT_SESSION_TTL_MS");
  assert.ok(secContent.includes("touchSession"), "Must export touchSession for sliding window session renewal");

  // Session cookie Max-Age & Security flags
  assert.ok(secContent.includes("Max-Age="), "Session cookie must dynamically calculate Max-Age");
  assert.ok(secContent.includes("HttpOnly"), "Session cookie must be HttpOnly");
  assert.ok(secContent.includes("SameSite=Lax"), "Session cookie must have SameSite=Lax");
  assert.ok(authContent.includes("sessionCookie(token, expiresAt)"), "Auth route must set session cookie with expiresAt");

  // Remember Me UI in AuthScreen (enabled by default)
  assert.ok(screenContent.includes("rememberMe"), "AuthScreen must support rememberMe state");
  assert.ok(screenContent.includes("useState(true)"), "Remember Me checkbox must default to true");
  assert.ok(screenContent.includes("تذكر تسجيل الدخول"), "AuthScreen must display Remember Me Arabic label");
});

test("Centralized System Settings & Free Courses Persistence", () => {
  const settingsPath = path.join(rootDir, "src", "lib", "system-settings.ts");
  assert.ok(fs.existsSync(settingsPath), "src/lib/system-settings.ts must exist");
  const content = fs.readFileSync(settingsPath, "utf-8");

  assert.ok(content.includes("isFreeUntilEndOfTerm: true"), "Default system setting must have isFreeUntilEndOfTerm: true");
  assert.ok(content.includes("مجانا حتى نهاية الترم"), "Default labelAr must be 'مجانا حتى نهاية الترم'");
  assert.ok(content.includes("FREE UNTIL THE END OF THE TERM"), "Default labelEn must be 'FREE UNTIL THE END OF THE TERM'");
  assert.ok(content.includes("updateFreeCoursesSettings"), "Must export updateFreeCoursesSettings");
  assert.ok(content.includes("isFreeCourseAccessActive"), "Must export isFreeCourseAccessActive");
});

test("Courses API: Free Course Access Unlocking with Price Preservation", () => {
  const coursesRoutePath = path.join(rootDir, "src", "app", "api", "courses", "route.ts");
  const content = fs.readFileSync(coursesRoutePath, "utf-8");

  assert.ok(content.includes("isFreeCourseAccessActive"), "Courses API must check isFreeCourseAccessActive()");
  assert.ok(content.includes("originalPrice: course.price"), "Courses API must preserve original price in originalPrice field");
  assert.ok(content.includes("displayPrice"), "Courses API must output displayPrice");
  assert.ok(content.includes("canSeeProtected"), "Courses API must unlock protected lessons when free access is active");
  assert.ok(content.includes("isFreeUntilEndOfTerm"), "Courses API must communicate promotion status to frontend");
});

test("Admin Control: Free Courses Access Until Configuration", () => {
  const adminRoutePath = path.join(rootDir, "src", "app", "api", "admin", "route.ts");
  const adminDashPath = path.join(rootDir, "src", "components", "SuperAdminDashboard.tsx");

  const routeContent = fs.readFileSync(adminRoutePath, "utf-8");
  const dashContent = fs.readFileSync(adminDashPath, "utf-8");

  // Admin API updates free access setting
  assert.ok(routeContent.includes("update_free_courses_setting"), "Admin API must handle update_free_courses_setting action");
  assert.ok(routeContent.includes("updateFreeCoursesSettings"), "Admin API must persist free courses settings");

  // Admin Dashboard UI tab
  assert.ok(dashContent.includes("free_access"), "SuperAdminDashboard must contain free_access tab");
  assert.ok(dashContent.includes("update_free_courses_setting"), "SuperAdminDashboard must trigger update_free_courses_setting");
  assert.ok(dashContent.includes("Free Courses Access Until"), "SuperAdminDashboard must provide Free Courses Access Until field");
});

test("Frontend UI: Course Cards & Detail View Free Presentation", () => {
  const pagePath = path.join(rootDir, "src", "app", "page.tsx");
  const detailPath = path.join(rootDir, "src", "components", "CourseDetailView.tsx");
  const modernHomePath = path.join(rootDir, "src", "components", "home", "ModernHomePage.tsx");

  const pageContent = fs.readFileSync(pagePath, "utf-8");
  const detailContent = fs.readFileSync(detailPath, "utf-8");
  const homeContent = fs.readFileSync(modernHomePath, "utf-8");

  // Page protection
  assert.ok(pageContent.includes("!user"), "page.tsx must check user authentication state");
  assert.ok(pageContent.includes("AuthScreen"), "page.tsx must display AuthScreen for guests");

  // Pricing labels
  assert.ok(pageContent.includes("مجانا حتى نهاية الترم"), "page.tsx stagesCourses must display free label");
  assert.ok(pageContent.includes("originalPrice"), "page.tsx must retain originalPrice");

  // CourseDetailView unlocks & badges
  assert.ok(detailContent.includes("isFreeUntilEndOfTerm"), "CourseDetailView must check isFreeUntilEndOfTerm");
  assert.ok(detailContent.includes("مجانا حتى نهاية الترم"), "CourseDetailView must show free badge");
  assert.ok(detailContent.includes("originalPrice"), "CourseDetailView must show originalPrice struck-through");

  // ModernHomePage badges
  assert.ok(homeContent.includes("originalPrice"), "ModernHomePage must support originalPrice display");
});
