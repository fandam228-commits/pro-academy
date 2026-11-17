import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Professional Academy — Progressive Web App (PWA) & Custom Install Prompt Suite", () => {
  const manifestTsFile = path.join(rootDir, "src", "app", "manifest.ts");
  const manifestJsonFile = path.join(rootDir, "public", "manifest.json");
  const swFile = path.join(rootDir, "public", "sw.js");
  const offlineFile = path.join(rootDir, "public", "offline.html");
  const installPromptFile = path.join(rootDir, "src", "components", "InstallAppPrompt.tsx");
  const layoutFile = path.join(rootDir, "src", "app", "layout.tsx");

  test("1. manifest.ts exports complete required PWA metadata", () => {
    assert.ok(fs.existsSync(manifestTsFile), "manifest.ts must exist");
    const content = fs.readFileSync(manifestTsFile, "utf-8");
    assert.match(content, /Professional Academy — منصة مستر حبيب الرحمن/, "name must match specs");
    assert.match(content, /Pro Academy/, "short_name must match specs");
    assert.match(content, /بوابتك الرسمية للتميز والتفوق في اللغة الإنجليزية - للمرحلتين الإعدادية والثانوية/, "description must match specs");
    assert.match(content, /display:\s*["']standalone["']/, "display must be standalone");
    assert.match(content, /orientation:\s*["']portrait["']/, "orientation must be portrait");
    assert.match(content, /dir:\s*["']rtl["']/, "dir must be rtl");
    assert.match(content, /lang:\s*["']ar["']/, "lang must be ar");
    assert.match(content, /#0E1E38/, "theme_color / background_color must match dark navy");
    assert.match(content, /192x192/, "icons must include 192x192");
    assert.match(content, /512x512/, "icons must include 512x512");
    assert.match(content, /maskable/, "icons must include maskable purpose");
  });

  test("2. public/manifest.json exists and is valid JSON with matching fields", () => {
    assert.ok(fs.existsSync(manifestJsonFile), "public/manifest.json must exist");
    const raw = fs.readFileSync(manifestJsonFile, "utf-8");
    const data = JSON.parse(raw);
    assert.equal(data.name, "Professional Academy — منصة مستر حبيب الرحمن");
    assert.equal(data.short_name, "Pro Academy");
    assert.equal(data.display, "standalone");
    assert.equal(data.orientation, "portrait");
    assert.equal(data.dir, "rtl");
    assert.equal(data.lang, "ar");
    assert.ok(Array.isArray(data.icons) && data.icons.length >= 4, "Must have comprehensive icons");
  });

  test("3. public/offline.html contains exact required Arabic fallback copy", () => {
    assert.ok(fs.existsSync(offlineFile), "offline.html must exist");
    const content = fs.readFileSync(offlineFile, "utf-8");
    assert.match(content, /أنت غير متصل بالإنترنت حالياً/, "Offline heading must match specs");
    assert.match(content, /يرجى التحقق من الاتصال لمتابعة دروسك في Professional Academy/, "Offline body must match specs");
    assert.match(content, /dir=["']rtl["']/, "offline.html must have RTL direction");
  });

  test("4. Service Worker (public/sw.js) caches static assets and falls back to offline.html on navigation failure", () => {
    assert.ok(fs.existsSync(swFile), "sw.js must exist");
    const content = fs.readFileSync(swFile, "utf-8");
    assert.match(content, /PRECACHE_URLS/, "Must declare PRECACHE_URLS");
    assert.match(content, /\/offline\.html/, "Must precache /offline.html");
    assert.match(content, /navigate/, "Must handle navigation requests");
    assert.match(content, /caches\.match\(["']\/offline\.html["']\)/, "Must fall back to offline.html when network fails");
    assert.match(content, /request\.method !== ["']GET["']/, "Must bypass non-GET requests");
    assert.match(content, /\/api\//, "Must handle API requests with Network-First strategy");
  });

  test("5. InstallAppPrompt component contains required copy, 7-day dismissal, and iOS detection", () => {
    assert.ok(fs.existsSync(installPromptFile), "InstallAppPrompt.tsx must exist");
    const content = fs.readFileSync(installPromptFile, "utf-8");
    assert.match(content, /ثبّت تطبيق المنصة على هاتفك لسهولة الوصول السريع بدون متصفح/, "Banner text must match specs");
    assert.match(content, /تثبيت التطبيق الآن/, "Primary install button text must match specs");
    assert.match(content, /7 \* 24 \* 60 \* 60 \* 1000|SEVEN_DAYS_MS/, "Must implement 7-day dismissal logic");
    assert.match(content, /لتثبيت التطبيق على آيفون: اضغط على أيقونة المشاركة \(Share\) بالأسفل ثم اختر/, "iOS instructions must match specs");
    assert.match(content, /display-mode: standalone/, "Must automatically hide in standalone mode");
  });

  test("6. layout.tsx contains PWA meta tags, apple-touch-icon, and viewport-fit=cover", () => {
    assert.ok(fs.existsSync(layoutFile), "layout.tsx must exist");
    const content = fs.readFileSync(layoutFile, "utf-8");
    assert.match(content, /InstallAppPrompt/, "layout.tsx must mount InstallAppPrompt");
    assert.match(content, /apple-mobile-web-app-capable/, "Must specify apple-mobile-web-app-capable");
    assert.match(content, /apple-mobile-web-app-status-bar-style/, "Must specify status bar style");
    assert.match(content, /Pro Academy/, "apple-mobile-web-app-title must be Pro Academy");
    assert.match(content, /apple-touch-icon/, "Must have apple-touch-icon");
    assert.match(content, /viewportFit:\s*["']cover["']/, "Viewport must specify viewportFit cover");
  });

  test("7. PWA icon files exist in /public/icons", () => {
    const icon192 = path.join(rootDir, "public", "icons", "icon-192.png");
    const icon512 = path.join(rootDir, "public", "icons", "icon-512.png");
    const icon192x192 = path.join(rootDir, "public", "icons", "icon-192x192.png");
    const icon512x512 = path.join(rootDir, "public", "icons", "icon-512x512.png");
    assert.ok(fs.existsSync(icon192), "icon-192.png must exist");
    assert.ok(fs.existsSync(icon512), "icon-512.png must exist");
    assert.ok(fs.existsSync(icon192x192), "icon-192x192.png must exist");
    assert.ok(fs.existsSync(icon512x512), "icon-512x512.png must exist");
  });
});
