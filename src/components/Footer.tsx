"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PLATFORM_CONFIG, buildWhatsAppLink } from "@/config/platform";
import { GraduationCap, Phone, Mail, MapPin, ShieldCheck, Heart, Globe, MessageCircle } from "lucide-react";

export const Footer: React.FC<{ setActiveTab?: (tab: string) => void }> = ({ setActiveTab }) => {
  const { lang } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* BRAND COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-lg text-white">
                {lang === "ar" ? "أكاديمية المستر أونلاين" : "Professional Academy"}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === "ar"
                ? "منصة مستر حبيب الرحمن المتخصصة في تدريس واستيعاب اللغة الإنجليزية للمراحل الإعدادية والثانوية (الشهادة الثانوية العامة) بطرق حديثة وتفاعلية."
                : "Professional English Learning Platform tailored for Egyptian Prep & Secondary stage students (Thanawya Amma). Adaptive assessments & AI tutoring."}
            </p>

            <div className="text-xs text-slate-400 space-y-1.5 font-mono">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" /> {PLATFORM_CONFIG.whatsappDisplay}
              </p>
              <a
                href={buildWhatsAppLink(
                  lang === "ar"
                    ? "مرحباً مستر حبيب الرحمن، لدي استفسار عن منصة Professional Academy."
                    : "Hello Mr. Habib El Rahman, I have an inquiry about Professional Academy."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "تواصل واتساب: 01006468384" : "WhatsApp: 01006468384"}</span>
              </a>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> support@proacademy.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> Cairo, Egypt
              </p>
            </div>
          </div>

          {/* STAGES COLUMN */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">
              {lang === "ar" ? "المراحل الدراسية" : "Curriculum Stages"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveTab && setActiveTab("courses")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "الشهادة الثانوية العامة (الصف الثالث الثانوي)" : "Third Secondary (Baccalaureate)"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("courses")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "الصف الثاني الثانوي" : "Second Secondary"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("courses")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "الصف الأول الثانوي" : "First Secondary"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("courses")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "الشهادة الإعدادية (الصف الثالث الإعدادي)" : "Third Prep"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("courses")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "الصف الأول والثاني الإعدادي" : "First & Second Prep"}
                </button>
              </li>
            </ul>
          </div>

          {/* QUICK FEATURES */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">
              {lang === "ar" ? "أدوات المنصة" : "Platform Features"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveTab && setActiveTab("download")} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {lang === "ar" ? "📱 تحميل تطبيق الموبايل" : "📱 Install Mobile App"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("pdfs")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "مكتبة ملفات PDF المحمية" : "Protected PDF Library"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("question_bank")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "بنك الأسئلة ومولد الامتحانات" : "Question Bank & Exam Generator"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("placement")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "اختبار تحديد المستوى التكيفي" : "Adaptive Placement Test"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("ai_assistant")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "مساعد الذكاء الاصطناعي (Habib AI)" : "Habib AI Tutor"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("chat")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "شات ومجتمع الطلاب" : "Community Live Q&A"}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab && setActiveTab("blog")} className="hover:text-blue-400 transition-colors">
                  {lang === "ar" ? "مدونة القواعد والنصائح" : "Blog & Exam Tips"}
                </button>
              </li>
            </ul>
          </div>

          {/* SECURITY & PAYMENTS */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">
              {lang === "ar" ? "طرق الدفع والتأمين" : "Payment & Security"}
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              {lang === "ar"
                ? "تدعم المنصة فودافون كاش، انستاباي، فوري، وأكواد التفعيل المطبوعة مع نظام حماية الفيديوهات من السرقة."
                : "Vodafone Cash, InstaPay, Fawry & Activation Code redemptions with DRM watermark protection."}
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Vodafone Cash</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">InstaPay</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Fawry</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Codes</span>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Professional Academy - Mr. Habib El Rahman. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => setActiveTab && setActiveTab("about")} className="hover:text-slate-300 transition-colors">
              {lang === "ar" ? "عن المنصة" : "About"}
            </button>
            <button onClick={() => setActiveTab && setActiveTab("faq")} className="hover:text-slate-300 transition-colors">
              {lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}
            </button>
            <button onClick={() => setActiveTab && setActiveTab("contact")} className="hover:text-slate-300 transition-colors">
              {lang === "ar" ? "اتصل بنا" : "Contact Us"}
            </button>
            <button onClick={() => setActiveTab && setActiveTab("privacy")} className="hover:text-slate-300 transition-colors">
              {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </button>
            <button onClick={() => setActiveTab && setActiveTab("terms")} className="hover:text-slate-300 transition-colors">
              {lang === "ar" ? "شروط الاستخدام" : "Terms of Service"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
