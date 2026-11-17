import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("1. Admin Route Protection & Security Guards", () => {
  const routes = [
    "src/app/api/admin/overview/route.ts",
    "src/app/api/admin/questions/route.ts",
    "src/app/api/admin/translation/route.ts",
    "src/app/api/admin/curriculum/route.ts",
    "src/app/api/admin/students/route.ts",
  ];

  for (const r of routes) {
    const fullPath = path.resolve(process.cwd(), r);
    assert.ok(fs.existsSync(fullPath), `Route file should exist: ${r}`);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert.match(content, /requireRoles/i, `Route ${r} must enforce requireRoles`);
    assert.match(content, /admin/i, `Route ${r} must require admin role`);
  }
});

test("2. Dedicated /admin Route Page & Navigation", () => {
  const pagePath = path.resolve(process.cwd(), "src/app/admin/page.tsx");
  assert.ok(fs.existsSync(pagePath), "src/app/admin/page.tsx must exist");
  const pageContent = fs.readFileSync(pagePath, "utf-8");
  assert.match(pageContent, /HabibAdminControlPanel/i);
  assert.match(pageContent, /403/i);
  assert.match(pageContent, /isAdminOrTeacher/i);

  const navbarPath = path.resolve(process.cwd(), "src/components/Navbar.tsx");
  const navbarContent = fs.readFileSync(navbarPath, "utf-8");
  assert.match(navbarContent, /href="\/admin"/i, "Navbar must include link to /admin for staff");
  assert.match(navbarContent, /لوحة التحكم/i);
});

test("3. Master HabibAdminControlPanel Layout & 5 Tabs", () => {
  const panelPath = path.resolve(process.cwd(), "src/components/admin/HabibAdminControlPanel.tsx");
  assert.ok(fs.existsSync(panelPath), "HabibAdminControlPanel.tsx must exist");
  const content = fs.readFileSync(panelPath, "utf-8");
  assert.match(content, /لوحة التحكم/i);
  assert.match(content, /معاينة المنصة كطالب/i);
  assert.match(content, /AdminOverviewModule/i);
  assert.match(content, /AdminQuestionBankModule/i);
  assert.match(content, /AdminTranslationModule/i);
  assert.match(content, /AdminCurriculumModule/i);
  assert.match(content, /AdminStudentsModule/i);
});

test("4. Question Bank CMS: Single Entry & Bulk Importer", () => {
  const qbPath = path.resolve(process.cwd(), "src/components/admin/AdminQuestionBankModule.tsx");
  assert.ok(fs.existsSync(qbPath), "AdminQuestionBankModule.tsx must exist");
  const content = fs.readFileSync(qbPath, "utf-8");
  assert.match(content, /إضافة سؤال فردي سريع/i);
  assert.match(content, /استيراد مجموعة أسئلة دفعة واحدة/i);
  assert.match(content, /Bulk Importer/i);
  assert.match(content, /handleDeleteQuestion/i);
  assert.match(content, /handleSaveEdit/i);
});

test("5. Translation Academy CMS: Key Vocabulary Builder & MCQ Traps", () => {
  const transPath = path.resolve(process.cwd(), "src/components/admin/AdminTranslationModule.tsx");
  assert.ok(fs.existsSync(transPath), "AdminTranslationModule.tsx must exist");
  const content = fs.readFileSync(transPath, "utf-8");
  assert.match(content, /Key Vocabulary Builder/i);
  assert.match(content, /handleAddVocabRow/i);
  assert.match(content, /mcqOptions/i);
  assert.match(content, /trap_explanations/i);
  assert.match(content, /نصيحة وملاحظة مستر حبيب الرحمن النحوية/i);
});

test("6. Students CMS & WhatsApp Parent Report Generator", () => {
  const stPath = path.resolve(process.cwd(), "src/components/admin/AdminStudentsModule.tsx");
  assert.ok(fs.existsSync(stPath), "AdminStudentsModule.tsx must exist");
  const content = fs.readFileSync(stPath, "utf-8");
  assert.match(content, /تقرير ولي الأمر/i);
  assert.match(content, /whatsappUrl/i);
  assert.match(content, /handleOpenParentReport/i);

  const apiPath = path.resolve(process.cwd(), "src/app/api/admin/students/route.ts");
  const apiContent = fs.readFileSync(apiPath, "utf-8");
  assert.match(apiContent, /generate_parent_report/i);
  assert.match(apiContent, /wa\.me/i);
  assert.match(apiContent, /سلسلة الالتزام اليومي/i);
});

test("7. Overview API Response Structure & Most-Missed Analytics", () => {
  const ovPath = path.resolve(process.cwd(), "src/app/api/admin/overview/route.ts");
  const content = fs.readFileSync(ovPath, "utf-8");
  assert.match(content, /totalStudents/i);
  assert.match(content, /totalQuestions/i);
  assert.match(content, /averageAccuracy/i);
  assert.match(content, /mostMissedQuestions/i);
  assert.match(content, /userMistakes/i);
});
