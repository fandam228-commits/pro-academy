# 🚀 دليل النشر الفوري — Professional Academy

## ✅ اللي اتعمل بالفعل
- الكود كامل ومرفوع على GitHub
- ثغرة الشات الأمنية اتحلت
- كل المميزات شغالة محلياً

## ❌ اللي ناقص (خطوة واحدة بس)
Vercel محتاج `DATABASE_URL` عشان يبني المشروع.

---

# 🔥 الخطوة 1: انسخ رابط قاعدة البيانات من Neon

1. افتح التبويب **Neon Console** (موجود عندك في المتصفح)
2. اختار مشروعك
3. اضغط **Dashboard** أو **Connection Details**
4. هتلاقي حاجة اسمها:
   ```
   Connection string
   ```
5. اختار **URI** (مش PSQL)
6. اضغط **Copy** (هيبقى شكله كده):

```
postgresql://neondb_owner:npg_xxxxxxxx@ep-xxxx-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

# 🔥 الخطوة 2: أضف المتغير في Vercel

1. افتح التبويب **pro-academy-sfl3 - Overview** (موجود عندك)
2. من القائمة الجانبية اضغط **Settings**
3. من القائمة الفرعية اضغط **Environment Variables**
4. اضغط الزر **Add New** أو **Create new**
5. املأ البيانات كالتالي:

| الحقل | القيمة |
|------|--------|
| **Key** | `DATABASE_URL` |
| **Value** | الصق الرابط اللي نسخته من Neon |
| **Environments** | ✅ Production ✅ Preview ✅ Development |

6. اضغط **Save**

---

# 🔥 الخطوة 3: أعد النشر (Redeploy)

1. من القائمة الجانبية اضغط **Deployments**
2. هتلاقي آخر Deployment (الفاشل)
3. اضغط على الـ **⋯** (ثلاث نقاط) جنبه
4. اختار **Redeploy**
5. تأكد إن **Use existing Build Cache** مش متعلم (أو سيبه عادي)
6. اضغط **Redeploy**

---

# ⏱️ استنى دقيقتين

Vercel هيبني المشروع. لو نجح هتلاقي:

```
✅ Ready
```

وهيديك رابط زي:
```
https://pro-academy-sfl3.vercel.app
```

---

# 🎉 بعد ما ينجح

1. افتح الرابط من الموبايل
2. سجّل دخول بأي حساب تجريبي:
   - الطالب: `omar.student@gmail.com` / `student123password`
3. روح لصفحة **تحميل التطبيق** وثبّته على تليفونك

---

# 🆘 لو حصل خطأ تاني

انسخ لي سطر الخطأ الأحمر من اللوج وهحله فوراً.
