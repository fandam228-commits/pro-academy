import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Professional Academy — High-Converting Arabic RTL Landing Page Suite", () => {
  const landingPageFile = path.join(rootDir, "src", "components", "landing", "LandingPage.tsx");
  const authScreenFile = path.join(rootDir, "src", "components", "AuthScreen.tsx");
  const rootPageFile = path.join(rootDir, "src", "app", "page.tsx");
  const layoutFile = path.join(rootDir, "src", "app", "layout.tsx");

  test("1. LandingPage component exists and is populated", () => {
    assert.ok(fs.existsSync(landingPageFile), "LandingPage.tsx must exist");
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.ok(content.length > 1000, "LandingPage.tsx must have full content");
    assert.match(content, /export function LandingPage/, "Must export LandingPage component");
  });

  test("2. Navbar contains Brand, Center Nav Links, and Action Buttons", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /Professional Academy/, "Must have Professional Academy brand");
    assert.match(content, /Mr\. Habib El Rahman/, "Must have subtitle Mr. Habib El Rahman");
    assert.match(content, /الرئيسية/, "Must have الرئيسية link");
    assert.match(content, /مميزات المنصة/, "Must have مميزات المنصة link");
    assert.match(content, /المراحل الدراسية/, "Must have المراحل الدراسية link");
    assert.match(content, /جرّب بنفسك/, "Must have جرّب بنفسك link");
    assert.match(content, /آراء الطلاب/, "Must have آراء الطلاب link");
    assert.match(content, /تسجيل الدخول/, "Must have تسجيل الدخول button");
    assert.match(content, /أنشئ حسابك مجاناً/, "Must have أنشئ حسابك مجاناً button");
  });

  test("3. Hero Section contains exact required Arabic copy and Trust Micro-bar", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /العام الدراسي 2026 \/ 2027 • للمرحلتين الإعدادية والثانوية/, "Top badge must match specs");
    assert.match(content, /اتقن اللغة الإنجليزية واضمن الدرجة النهائية بأحدث نظام تفاعلي/, "H1 Headline must match specs");
    assert.match(content, /مع مستر حبيب الرحمن، ودّع الحفظ التقليدي/, "Subtitle must match specs");
    assert.match(content, /ابدأ رحلة التفوق الآن/, "Primary CTA button must exist");
    assert.match(content, /شاهد جولة داخل المنصة \(دقيقتين\)/, "Secondary video tour button must exist");
    assert.match(content, /شرح مطابق لأحدث مواصفات الوزارة/, "Trust item 1 must exist");
    assert.match(content, /تصحيح فوري وشرح لكل إجابة/, "Trust item 2 must exist");
    assert.match(content, /تقارير متابعة لولي الأمر/, "Trust item 3 must exist");
  });

  test("4. Interactive UI Dashboard Mockup Card contains progress, streak, and grammar badge", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /نسبة الإتقان 94%/, "Mockup must have 94% mastery indicator");
    assert.match(content, /15 يوم متواصل|سلسلة الالتزام/, "Mockup must have commitment streak");
    assert.match(content, /Inversion • متقن ⭐|شعار القواعد/, "Mockup must have grammar mastery badge");
  });

  test("5. Social Proof Stats Bar contains all 4 metrics", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /\+10,000/, "Stat 1 (+10,000) must exist");
    assert.match(content, /سؤال تفاعلي بنظام الامتحان الحديث/, "Stat 1 label must exist");
    assert.match(content, /\+500/, "Stat 2 (+500) must exist");
    assert.match(content, /فيديو شرح عالي الجودة/, "Stat 2 label must exist");
    assert.match(content, /98%/, "Stat 3 (98%) must exist");
    assert.match(content, /نسبة رضا الطلاب وأولياء الأمور/, "Stat 3 label must exist");
    assert.match(content, /24\/7/, "Stat 4 (24/7) must exist");
    assert.match(content, /دعم فني وأكاديمي مستمر/, "Stat 4 label must exist");
  });

  test("6. Core Features Grid ('أركان المنصة') contains 4 required cards", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /كل ما تحتاجه للتفوق في مكان واحد/, "Section title must exist");
    assert.match(content, /بنك الأسئلة الذكي/, "Card 1 title must exist");
    assert.match(content, /آلاف الأسئلة المتدرجة في الصعوبة على كل وحدة/, "Card 1 copy must match");
    assert.match(content, /أكاديمية الترجمة/, "Card 2 title must exist");
    assert.match(content, /تدريبات مكثفة على مهارات الترجمة/, "Card 2 copy must match");
    assert.match(content, /عالم القصص الأدبي/, "Card 3 title must exist");
    assert.match(content, /تحليل شامل للأحداث والشخصيات/, "Card 3 copy must match");
    assert.match(content, /متابعة دقيقة وتقارير/, "Card 4 title must exist");
    assert.match(content, /لوحة تحكم ذكية تقيس مستواك أسبوعياً/, "Card 4 copy must match");
  });

  test("7. Academic Stages ('المراحل الدراسية') contains 2 rich stage cards", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /اختر مرحلتك الدراسية/, "Section title must exist");
    assert.match(content, /المرحلة الإعدادية/, "Prep stage card must exist");
    assert.match(content, /تأسيس قوي في القواعد \(Grammar\) والمفردات/, "Prep stage copy must match");
    assert.match(content, /استكشف مناهج الإعدادي/, "Prep CTA must exist");
    assert.match(content, /المرحلة الثانوية/, "Sec stage card must exist");
    assert.match(content, /نظام الثانوية العامة الحديث، تركيز مكثف على نواتج التعلم/, "Sec stage copy must match");
    assert.match(content, /استكشف مناهج الثانوي/, "Sec CTA must exist");
  });

  test("8. Interactive Mini-Quiz Widget has exact Thanaweya grammar question and inversion explanation", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /جرّب نظام الأسئلة الذكي بنفسك/, "Widget section title must exist");
    assert.match(content, /Hardly _______ the station when the train left/, "Question text must match");
    assert.match(content, /had he reached/, "Correct option B must be present");
    assert.match(content, /Inversion/, "Explanation must mention Inversion rule");
    assert.match(content, /سجل الآن لفتح باقي الاختبار/, "CTA button must be present");
  });

  test("9. Testimonials section contains all 3 success stories", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /قصص نجاح نفخر بها/, "Section title must exist");
    assert.match(content, /أحمد محمود/, "Testimonial 1 author must exist");
    assert.match(content, /الصف الثالث الثانوي/, "Testimonial 1 role must exist");
    assert.match(content, /ولي أمر طالب/, "Testimonial 2 author must exist");
    assert.match(content, /سارة طارق/, "Testimonial 3 author must exist");
    assert.match(content, /الصف الثالث الإعدادي/, "Testimonial 3 role must exist");
  });

  test("10. Final CTA Banner, 3-Column Footer, and scrypt security badge", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.match(content, /جاهز لكتابة قصة تفوقك هذا العام؟/, "Final CTA headline must match");
    assert.match(content, /منصة محمية بأحدث تقنيات تشفير البيانات \(scrypt\)/, "Security reassurance copy must match");
    assert.match(content, /© 2026\/2027 Professional Academy — Mr\. Habib El Rahman\. All Rights Reserved\./, "Copyright must match");
  });

  test("11. AuthScreen supports modal mode, initialMode, and preserves backend authentication logic", () => {
    const authContent = fs.readFileSync(authScreenFile, "utf-8");
    assert.match(authContent, /isModal\?: boolean/, "AuthScreenProps must support isModal");
    assert.match(authContent, /initialMode\?: "login" \| "register"/, "AuthScreenProps must support initialMode");
    assert.match(authContent, /rememberMe/, "Must preserve 30-day remember me");
    assert.match(authContent, /handleLogin/, "Must preserve handleLogin");
    assert.match(authContent, /handleRegister/, "Must preserve handleRegister");
  });

  test("12. Root page integrates LandingPage for unauthenticated visitors", () => {
    const pageContent = fs.readFileSync(rootPageFile, "utf-8");
    assert.match(pageContent, /LandingPage/, "page.tsx must import or use LandingPage");
    assert.match(pageContent, /if \(!user\) \{[\s\S]*?<LandingPage/, "Unauthenticated visitors must see LandingPage");
  });

  test("13. Typography fonts Cairo, Tajawal, and Inter are loaded in layout.tsx", () => {
    const layoutContent = fs.readFileSync(layoutFile, "utf-8");
    assert.match(layoutContent, /family=Cairo/, "layout.tsx must load Cairo font");
    assert.match(layoutContent, /family=Tajawal/, "layout.tsx must load Tajawal font");
    assert.match(layoutContent, /family=Inter/, "layout.tsx must load Inter font");
  });
});
