# 🚀 دليل النشر — Professional Academy

## ⚠️ ملاحظة مهمة أولاً

| المنصة | تصلح؟ | السبب |
|--------|-------|--------|
| **GitHub Pages** | ❌ لا | يستضيف ملفات ثابتة فقط، والمشروع يحتوي على API وقاعدة بيانات |
| **Vercel** | ✅ نعم (الأفضل) | صانع Next.js نفسه — مجاني ويربط مع GitHub تلقائياً |
| **Railway / Render** | ✅ نعم | بديل جيد يشمل قاعدة بيانات |

**الخلاصة:** GitHub لتخزين الكود، و **Vercel** للنشر المباشر.

---

## 1️⃣ رفع الكود على GitHub

المستودع مجهّز بالفعل ومعمول له Commit أول. نفّذ الأوامر التالية:

```bash
# أنشئ مستودعاً فارغاً على github.com/new
# ثم اربطه (استبدل USERNAME و REPO):
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

> إن طُلبت كلمة مرور، استخدم **Personal Access Token** من:
> GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (صلاحية `repo`)

### مستودع خاص (موصى به)
لأن المنصة تحتوي محتوى تعليمي خاص، اجعل المستودع **Private** عند إنشائه.

---

## 2️⃣ إنشاء قاعدة بيانات مجانية (Neon)

1. ادخل [neon.tech](https://neon.tech) وسجّل بحساب GitHub (مجاني)
2. اضغط **Create Project** واختر أقرب منطقة (Frankfurt أنسب لمصر)
3. انسخ **Connection String** — ستكون بالشكل:
   ```
   postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

> بديل: [Supabase](https://supabase.com) → Project Settings → Database → Connection String (URI)

---

## 3️⃣ توليد مفاتيح الإشعارات (VAPID)

```bash
npx web-push generate-vapid-keys
```

احتفظ بالمفتاحين (`Public Key` و `Private Key`) للخطوة التالية.

> بدون هذه المفاتيح ستعمل المنصة طبيعياً، لكن اشتراكات Push ستُفقد عند كل إعادة نشر.

---

## 4️⃣ النشر على Vercel

1. ادخل [vercel.com](https://vercel.com) وسجّل بحساب GitHub
2. اضغط **Add New → Project** واختر مستودعك
3. Vercel سيكتشف Next.js تلقائياً — لا تغيّر شيئاً في الإعدادات
4. افتح **Environment Variables** وأضف:

   | الاسم | القيمة |
   |------|--------|
   | `DATABASE_URL` | رابط Neon الذي نسخته |
   | `VAPID_PUBLIC_KEY` | المفتاح العام |
   | `VAPID_PRIVATE_KEY` | المفتاح الخاص |

5. اضغط **Deploy** وانتظر دقيقتين ⏱️
6. ستحصل على رابط مثل: `https://pro-academy.vercel.app`

### إنشاء الجداول لأول مرة
الجداول تُنشأ **تلقائياً** عند أول طلب للموقع (عبر `ensureDbSetup`). في الإنتاج لا تُنشأ حسابات أو بيانات العرض.
للتأكيد يدوياً:

```bash
DATABASE_URL="رابط_نيون_هنا" npx drizzle-kit push
```

---

## 5️⃣ بعد النشر — خطوات إلزامية

### 🔒 إنشاء أول مشرف بأمان
قبل أول طلب للموقع، أضف هذه المتغيرات إلى إعدادات Vercel لبيئة الإنتاج. استخدم اسماً وبريداً فريدين وكلمة مرور عشوائية لا تقل عن 16 حرفاً:

- `INITIAL_ADMIN_NAME`
- `INITIAL_ADMIN_EMAIL`
- `INITIAL_ADMIN_PASSWORD`

إذا لم يوجد مشرف في قاعدة البيانات، ينشئ التطبيق هذا الحساب فقط ويتجاوز بيانات العرض. بعد التأكد من تسجيل الدخول، احذف المتغيرات الثلاثة من إعدادات Vercel وأعد النشر. إذا كانت قاعدة البيانات تحتوي مسبقاً على حسابات من نسخة أقدم، لا يغيّرها التطبيق؛ راجعها وغيّر أو احذف الحسابات التجريبية يدوياً قبل الاستخدام الحقيقي.

### 📱 اختبر تثبيت التطبيق
افتح الرابط من موبايلك → صفحة **تحميل التطبيق** → ثبّت وتأكد من ظهور الأيقونة.

### 🔔 فعّل الإشعارات
من مركز الإشعارات → **تفعيل الإشعارات** → جرّب **إشعار تجريبي**.

---

## ⚠️ تنبيه: تخزين الملفات على Vercel

نظام ملفات Vercel **مؤقت** (Ephemeral) — أي أن ملفات PDF والواجبات المرفوعة **قد تُحذف** عند إعادة النشر أو تغيّر السيرفر.

**الحلول:**
1. **Vercel Blob** (الأسهل): `npm i @vercel/blob` ثم استبدل عمليات `fs.writeFile` في:
   - `src/app/api/pdfs/route.ts`
   - `src/app/api/homework/route.ts`
2. **Cloudflare R2 / AWS S3** للمشاريع الأكبر
3. **الاستضافة على Railway/VPS** حيث القرص دائم

> المستندات المضافة برابط خارجي (`externalUrl`) تعمل دائماً بدون مشاكل.

---

## 🌐 ربط دومين مخصص

في Vercel → Project → **Settings → Domains** → أضف دومينك (مثلاً `habibacademy.com`)
ثم في مزوّد الدومين أضف سجل:

```
Type: CNAME   Name: www   Value: cname.vercel-dns.com
```

بعدها حدّث الرابط في `src/app/layout.tsx` (حقل `metadataBase`) للحصول على SEO مثالي.

---

## 🔁 التحديثات المستقبلية

```bash
git add .
git commit -m "وصف التعديل"
git push
```

Vercel سينشر التحديث **تلقائياً** خلال دقيقة ✅
