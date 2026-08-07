"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PLATFORM_CONFIG, buildWhatsAppLink } from "@/config/platform";
import {
  Info,
  HelpCircle,
  Mail,
  Shield,
  FileText,
  ChevronDown,
  Send,
  Phone,
  MessageCircle,
  GraduationCap,
  Target,
  Users,
  Award,
} from "lucide-react";

export const InfoPages: React.FC<{ initialSection?: string }> = ({ initialSection = "about" }) => {
  const { lang } = useApp();
  const [section, setSection] = useState<string>(initialSection);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactName, setContactName] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const sections = [
    { id: "about", labelAr: "عن المنصة", labelEn: "About", icon: Info },
    { id: "faq", labelAr: "الأسئلة الشائعة", labelEn: "FAQ", icon: HelpCircle },
    { id: "contact", labelAr: "اتصل بنا", labelEn: "Contact", icon: Mail },
    { id: "privacy", labelAr: "سياسة الخصوصية", labelEn: "Privacy", icon: Shield },
    { id: "terms", labelAr: "شروط الاستخدام", labelEn: "Terms", icon: FileText },
  ];

  const faqs = [
    {
      q: lang === "ar" ? "كيفية الاشتراك في الكورسات؟" : "How do I subscribe to courses?",
      a: lang === "ar"
        ? "ادخل على صفحة الكورسات واختر كورسك، ثم ادفع بفودافون كاش على 01006468384 أو انستاباي، وأرسل إثبات التحويل على واتساب ليتم تفعيل حسابك فوراً. متوفر أيضاً أكواد التفعيل من مراكز بيع الكروت."
        : "Open Courses, pick your course, pay via Vodafone Cash to 01006468384 or InstaPay, send proof via WhatsApp to get instantly activated. Activation codes are also available.",
    },
    {
      q: lang === "ar" ? "هل الفيديوهات محمية من التحميل؟" : "Are videos protected from downloading?",
      a: lang === "ar"
        ? "نعم، جميع الفيديوهات والـ PDF معروضة داخل المنصة فقط مع علامة مائية متحركة تحمل اسمك ورقم هاتفك لحماية حقوق المحتوى."
        : "Yes, all videos & PDFs render inside the platform only with a moving watermark showing your name and phone number.",
    },
    {
      q: lang === "ar" ? "كيف يعمل بنك الأسئلة الذكي ومولد الامتحانات؟" : "How does the Smart Exam Generator work?",
      a: lang === "ar"
        ? "منتقطع الأسئلة بنك يحتوي مفردات وقواعد مصنفة حسب الصف والوحدة والصعوبة ومستوى بلوم. عند إنشاء امتحان يتم اختيار الأسئلة عشوائياً بدون تكرار مع موازنة القواعد والكلمات وخلط ترتيب الإجابات."
        : "The bank stores categorized vocabulary & grammar items by grade, unit, difficulty and Bloom's level. Exam generation picks random non-repeating questions with shuffled answer order.",
    },
    {
      q: lang === "ar" ? "هل أنسى كلمة المرور؟ هل يمكن استرجاعها؟" : "I forgot my password. Can I recover it?",
      a: lang === "ar"
        ? "كلمات المرور مشفرة تماماً ولا يمكن استرجاعها كنص. تواصل مع الدعم على واتساب لإعادة تعيين حسابك بشكل آمن."
        : "Passwords are hashed and can't be recovered as text. Contact WhatsApp support to securely reset your account.",
    },
    {
      q: lang === "ar" ? "كيف يتابع ولي الأمر أداء الطالب؟" : "How can parents track student progress?",
      a: lang === "ar"
        ? "حساب ولي الأمر يعرض نسبة الحضور، متوسط الدرجات، سجل الامتحانات، وأيام التتابع، مع زر تواصل مباشر مع المستر عبر واتساب."
        : "The parent account shows attendance rate, average scores, exam history and daily streak, with a direct WhatsApp button to the instructor.",
    },
    {
      q: lang === "ar" ? "ما هو نظام الإحالة وكيف أربح منه؟" : "How does the referral system work?",
      a: lang === "ar"
        ? "من مركز التفوق احصل على كود الإحالة الخاص بك وشاركه. كل صديق يشترك بكودك في كورس مدفوع تحصل على 50 جنيه رصيد، ويحصل هو على خصم 25 جنيه."
        : "Get your referral code from the Gamification center and share it. Every friend joining a paid course with your code earns you 50 EGP credit.",
    },
  ];

  const sendContact = () => {
    if (!contactName || !contactMsg) return;
    window.open(
      buildWhatsAppLink(
        lang === "ar"
          ? `رسالة من نموذج الاتصال — الاسم: ${contactName} — الرسالة: ${contactMsg}`
          : `Contact form message — Name: ${contactName} — Message: ${contactMsg}`
      ),
      "_blank"
    );
    setContactSent(true);
    setContactName("");
    setContactMsg("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* SECTION TABS */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-md w-fit">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                section === s.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              {lang === "ar" ? s.labelAr : s.labelEn}
            </button>
          );
        })}
      </div>

      {/* ABOUT */}
      {section === "about" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Professional Academy</h2>
              <p className="text-xs font-bold text-blue-600">Mr. Habib El Rahman — English Platform</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {lang === "ar"
              ? "Professional Academy هي منصة تعليمية متكاملة أسسها مستر حبيب الرحمن لخدمة طلاب الثانوية العامة والمرحلة الإعدادية في مصر. نجمع بين خبرة تدريس تتجاوز 15 عاماً وأحدث تقنيات التعلم: بنك أسئلة ذكي بآلاف الأسئلة المفهرسة، مولد امتحانات بدون تكرار، اختبار تحديد مستوى تكيفي، مساعد ذكاء اصطناعي لتصحيح المقالات وشرح القواعد، ومكتبة PDF وفيديوهات محمية بعلامات مائية متحركة. هدفنا واحد: التفوق الكامل في اللغة الإنجليزية بأسلوب ممتع وآمن."
              : "Professional Academy is a full learning platform founded by Mr. Habib El Rahman for Egyptian Secondary & Preparatory students. We combine 15+ years of teaching expertise with modern learning technology: an indexed smart question bank, anti-repetition exam generator, adaptive placement tests, an AI essay grader & grammar tutor, and watermark-protected PDF/video libraries — all to deliver complete English mastery safely and enjoyably."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Target, title: lang === "ar" ? "15+ سنة خبرة" : "15+ Years", desc: lang === "ar" ? "خبرة تدريس الثانوية العامة" : "Thanawya Amma expertise" },
              { icon: Users, title: "15,000+", desc: lang === "ar" ? "طالب على المنصة" : "Active students" },
              { icon: Award, title: "98.4%", desc: lang === "ar" ? "نسبة نجاح الطلاب" : "Student pass rate" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-center">
                  <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="font-black text-lg text-slate-900 dark:text-white">{s.title}</p>
                  <p className="text-[11px] text-slate-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAQ */}
      {section === "faq" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-2.5">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            {lang === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h2>
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-start p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 bg-slate-50/60 dark:bg-slate-800/40">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CONTACT */}
      {section === "contact" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              {lang === "ar" ? "أرسل استفسارك" : "Send Your Inquiry"}
            </h2>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder={lang === "ar" ? "الاسم الكامل..." : "Full name..."}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />
            <textarea
              rows={5}
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
              placeholder={lang === "ar" ? "اكتب رسالتك هنا..." : "Type your message..."}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />
            <button
              onClick={sendContact}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              {lang === "ar" ? "إرسال عبر واتساب" : "Send via WhatsApp"}
            </button>
            {contactSent && (
              <p className="text-xs font-bold text-emerald-600 text-center">
                {lang === "ar" ? "تم فتح واتساب — أكمل الإرسال من هناك ✓" : "WhatsApp opened — complete sending there ✓"}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl shadow-xl p-6 text-white space-y-4">
            <h3 className="font-extrabold text-lg">{lang === "ar" ? "بيانات التواصل المباشر" : "Direct Contact Info"}</h3>
            <div className="space-y-3 text-xs font-medium">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-sky-300" /> {PLATFORM_CONFIG.whatsappDisplay}</p>
              <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 font-bold">
                <MessageCircle className="w-4 h-4" /> {lang === "ar" ? "تواصل واتساب: " : "WhatsApp: "}{PLATFORM_CONFIG.whatsappLocal}
              </a>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-sky-300" /> {PLATFORM_CONFIG.supportEmail}</p>
            </div>
            <div className="pt-3 border-t border-white/20 text-[11px] text-blue-100 leading-relaxed">
              {lang === "ar"
                ? "الدعم الفني متاح يومياً من 12 ظهراً حتى 12 منتصف الليل. مدفوعات فودافون كاش تُفعَّل خلال دقائق بعد إرسال إثبات التحويل."
                : "Support is available daily 12PM–12AM. Vodafone Cash payments are activated within minutes of sending proof."}
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY */}
      {section === "privacy" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <p><strong>1. البيانات المجمعة:</strong> نجمع الاسم والبريد الإلكتروني ورقم الهاتف والصف الدراسي فقط لأغراض تشغيل الحساب وتتبع التقدم الدراسي. لا نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية.</p>
            <p><strong>2. تشفير كلمات المرور:</strong> تخزَّن كلمات المرور مشفرة بخوارزمية scrypt مع Salt عشوائي، ولا يمكن لأي شخص — حتى إدارة المنصة — معرفتها كنص واضح.</p>
            <p><strong>3. الجلسات:</strong> تُستخدم جلسات آمنة بتوكنات عشوائية ذات صلاحية محددة، وتُحذف عند تسجيل الخروج.</p>
            <p><strong>4. حماية المحتوى:</strong> توسع علامات مائية ديناميكية تحمل بيانات الطالب أثناء عرض الفيديوهات والـ PDF لحماية حقوق الملكية الفكرية للمنصة.</p>
            <p><strong>5. بيانات القاصرين:</strong> تُربط حسابات الطلاب بأرقام أولياء الأمور، ويمكن لولي الأمر طلب حذف الحساب نهائياً عبر التواصل مع الدعم.</p>
            <p><strong>6. عن تعديلات السياسة:</strong> قد نحدّث هذه السياسة، وتصبح التحديثات سارية فور نشرها على هذه الصفحة.</p>
            <p className="text-[10px] text-slate-400">آخر تحديث: يناير 2026 — Contact: {PLATFORM_CONFIG.supportEmail}</p>
          </div>
        </div>
      )}

      {/* TERMS */}
      {section === "terms" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            {lang === "ar" ? "شروط الاستخدام" : "Terms of Service"}
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
            <p><strong>1. الحساب:</strong> أنت مسؤول أمن بيانات دخولك. الحساب شخصي ولا يجوز مشاركته مع أي شخص آخر. مشاركة الحساب تؤدي للحظر الفوري دون تعويض.</p>
            <p><strong>2. الاشتراكات والمحتوى:</strong> جميع الفيديوهات وملفات الـ PDF والامتحانات ملكية فكرية حصرية لمستر حبيب الرحمن. يمنع التحميل أو التصوير أو إعادة النشر بأي وسيلة.</p>
            <p><strong>3. المدفوعات:</strong> تُعالج المدفوعات يدوياً عبر فودافون كاش أو انستاباي أو أكواد التفعيل. لا تُسترد المبالغ بعد تفعيل الكورس إلا بحالة تقنية موثقة.</p>
            <p><strong>4. السلوك المقبول:</strong> يمنع الإساءة في المحادثات أو انتهاك أنظمة المنصة. محاولات تجاوز أنظمة الحماية أو مشاركة أسئلة الامتحانات تؤدي لإيقاف الحساب.</p>
            <p><strong>5. التوافر:</strong> نحافظ على توافر المنصة 24/7 قدر الإمكان، مع إمكانية فترات صيانة مجدولة يعلن عنها مسبقاً.</p>
            <p><strong>6. حدود المسؤولية:</strong> المحتوى التعليمي مقدم بأقصى جودة ممكنة لأغراض التدريب، ولا نضمان درجات محددة في الامتحانات الرسمية.</p>
            <p className="text-[10px] text-slate-400">آخر تحديث: يناير 2026 — Contact: {PLATFORM_CONFIG.supportEmail}</p>
          </div>
        </div>
      )}
    </div>
  );
};
