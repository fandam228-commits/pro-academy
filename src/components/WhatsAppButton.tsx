"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PLATFORM_CONFIG, buildWhatsAppLink } from "@/config/platform";
import { MessageCircle, X, Phone } from "lucide-react";

export const WhatsAppButton: React.FC = () => {
  const { lang, user } = useApp();
  const [open, setOpen] = useState(false);

  const defaultMessage =
    lang === "ar"
      ? `مرحباً مستر حبيب الرحمن، أنا ${user?.name || "طالب جديد"}. لدي استفسار عن الكورسات أو الاشتراك في منصة Professional Academy.`
      : `Hello Mr. Habib El Rahman, I'm ${user?.name || "a new student"}. I have an inquiry about the courses on Professional Academy.`;

  return (
    <div className="fixed bottom-5 left-5 rtl:left-auto rtl:right-5 z-40 flex flex-col items-start gap-2">
      {/* POPUP CARD */}
      {open && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-4 w-72 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {lang === "ar" ? "دعم المنصة عبر واتساب" : "WhatsApp Support"}
                </p>
                <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                  {PLATFORM_CONFIG.whatsappLocal}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {lang === "ar"
              ? "للاستفسار عن الكورسات، إثبات التحويلات (فودافون كاش / انستاباي)، أو الدعم الفني — راسلنا مباشرة على واتساب."
              : "For course inquiries, payment proofs (Vodafone Cash / InstaPay), or tech support — message us directly."}
          </p>

          <a
            href={buildWhatsAppLink(defaultMessage)}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{lang === "ar" ? "ابدأ المحادثة الآن" : "Start Chat Now"}</span>
          </a>
        </div>
      )}

      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-xl shadow-emerald-500/40 flex items-center justify-center transition-all hover:scale-110"
        title={lang === "ar" ? "تواصل معنا عبر واتساب" : "Chat with us on WhatsApp"}
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-950 animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-950" />
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};
