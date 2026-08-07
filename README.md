# 🎓 Professional Academy — منصة مستر حبيب الرحمن

<div align="center">

**المنصة التعليمية الأولى للإنجليزية لطلاب الثانوية العامة والإعدادية في مصر**

The Premier English Learning Platform for Egyptian Secondary & Preparatory Students

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

</div>

---

## ✨ المميزات الرئيسية

### 🔐 الأمان
- تشفير كلمات المرور بخوارزمية `scrypt` + Salt عشوائي
- جلسات حقيقية بتوكنات آمنة وتاريخ انتهاء (7 أيام)
- قفل الحساب بعد 5 محاولات خاطئة (10 دقائق)
- صلاحيات بالأدوار: أدمن / معلم / طالب / ولي أمر
- Security Headers (X-Frame, XSS, Referrer)

### 📚 المحتوى التعليمي
- 6 كورسات (3 إعدادي + 3 ثانوي) مع وحدات ودروس وفيديوهات
- مشغل فيديو محمي بعلامة مائية متحركة (اسم الطالب + رقمه)
- مكتبة PDF مع رفع وعرض داخل المنصة + حماية من التصوير
- ربط ملفات PDF بالكورسات تلقائياً

### 🧠 بنك الأسئلة الذكي
- آلاف الأسئلة المفهرسة (قواعد + مفردات) مع Bloom's Taxonomy
- مولد امتحانات ذكي بدون تكرار الأسئلة + خلط الإجابات
- توليد أسئلة بالذكاء الاصطناعي مع كشف التكرار التلقائي
- استيراد أسئلة من CSV / Excel
- إحصائيات لكل سؤال (معدل الصعوبة، عدد الاستخدام)

### 🤖 الذكاء الاصطناعي (5 أدوات)
- شرح القواعد | مساعد الواجبات | تصحيح المقالات | تدريب المفردات | مساعد عام

### 📝 نظام الواجبات
- المعلم ينشر واجب → الطالب يسلّم كتابة أو بملف → المعلم يصحح بدرجة وملاحظات
- إشعارات تلقائية للطالب عند كل مرحلة

### ✅ الحضور والغياب
- رصد جماعي من المعلم (حاضر/متأخر/غائب/معذور)
- تسجيل ذاتي للطالب أثناء الحصة المباشرة
- تقويم 30 يوم ملون + نسبة الانضباط الحقيقية

### 📊 التقارير الأسبوعية
- تحليل تلقائي: حضور + واجبات + امتحانات + نقاط قوة/ضعف
- توصية مخصصة من المستر حسب أداء الطالب
- قابل للطباعة كتقرير رسمي

### 💳 المدفوعات
- فودافون كاش (01006468384) + انستاباي + فوري + أكواد التفعيل
- إرسال إثبات التحويل عبر واتساب مباشرة

### 🏆 الجيميفيكيشن
- متصدرون + 8 أوسمة + نظام إحالة (50ج لكل صديق) + مفضلة + مؤقت بومودورو

### 📱 PWA (تطبيق موبايل)
- قابل للتثبيت على Android + iPhone كتطبيق حقيقي
- يعمل بدون إنترنت (محتوى محفوظ)
- إشعارات Push جاهزة
- اختصارات سريعة من أيقونة التطبيق

### 🌐 ثنائي اللغة
- عربي (RTL) + إنجليزي مع تبديل فوري
- وضع ليلي ونهاري

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات:
- Node.js 20+
- PostgreSQL 15+

### الخطوات:
```bash
# 1. استنسخ المشروع
git clone https://github.com/YOUR_USERNAME/pro-academy.git
cd pro-academy

# 2. ثبّت المتطلبات
npm install

# 3. أنشئ ملف البيئة
cp .env.example .env
# عدّل DATABASE_URL في .env

# 4. شغّل التطوير
npm run dev

# 5. افتح http://localhost:3000
```

### حسابات تجريبية جاهزة:
| الدور | البريد | كلمة المرور |
|---|---|---|
| 👑 Super Admin | habib.admin@proacademy.com | admin123password |
| 👨‍🏫 Teacher | sarah.teacher@proacademy.com | teacher123password |
| 🎓 Student | omar.student@gmail.com | student123password |
| 👨‍👦 Parent | mahmoud.parent@gmail.com | parent123password |

---

## 📦 التقنيات المستخدمة

| التقنية | الاستخدام |
|---|---|
| **Next.js 16** (App Router) | Framework |
| **React 19** | UI Library |
| **TypeScript 5.9** | Type Safety |
| **Tailwind CSS 4** | Styling |
| **PostgreSQL** | Database |
| **Drizzle ORM** | Database Client |
| **scrypt** | Password Hashing |
| **Service Worker** | PWA & Offline |
| **Lucide Icons** | UI Icons |

---

## 📄 الرخصة

© 2025 Professional Academy — Mr. Habib El Rahman. All Rights Reserved.
