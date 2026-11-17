"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  Award,
  ChevronRight,
  Zap,
} from "lucide-react";

interface VoucherActivationProps {
  onNavigateHome?: () => void;
  onSuccess?: (sub: any) => void;
}

export const VoucherActivationWorkspace: React.FC<VoucherActivationProps> = ({
  onNavigateHome,
  onSuccess,
}) => {
  const { user } = useApp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Format code with hyphens: PRO-XXXX-XX
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setCode(raw);
    setError(null);
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("يرجى إدخال كود التفعيل المطبوع على الكارت");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/vouchers/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "فشل تفعيل الكود، يرجى مراجعة الإدارة");
        return;
      }

      setSuccessData(data.subscription);
      if (onSuccess) onSuccess(data.subscription);
    } catch (err: any) {
      setError(err.message || "حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-[#101b33] to-blue-950 p-6 sm:p-8 rounded-3xl text-white border border-blue-500/20 shadow-xl relative overflow-hidden text-center sm:text-right">
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
              <KeyRound className="w-3.5 h-3.5" />
              <span>تفعيل الاشتراك بأكواد السنتر & فودافون كاش</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>تفعيل باقة التفوق</span>
              <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                PRO PASS
              </span>
            </h2>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              أدخل الرمز المكون من 10 خانات المطبوع على بطاقة الشحن لتفعيل الدروس وبنك الأسئلة فوريًا.
            </p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition border border-white/10 shrink-0"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0" />
              <span>الرئيسية</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVATION FORM */}
      {!successData ? (
        <form
          onSubmit={handleActivate}
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5"
        >
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
              كود الشحن والتفعيل (Voucher Code)
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="PRO-XXXX-XX"
                maxLength={14}
                className="w-full text-center text-lg sm:text-xl font-mono font-black tracking-widest uppercase p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900 dark:text-white"
                dir="ltr"
              />
              <KeyRound className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>مثال: PRO-8492-XK أو PRO-2027-EG</span>
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>تفعيل الكود الآن ⚡</span>
              </>
            )}
          </button>

          {/* HELP NOTE */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300">أين أجد كود التفعيل؟</p>
            <p>
              يمكنك الحصول على كروت الشحن من سناتر مستر حبيب الرحمن مباشرة، أو عبر التحويل بفودافون كاش واستلام الكود في رسالة واتساب من الإدارة.
            </p>
          </div>
        </form>
      ) : (
        /* SUCCESS CONFIRMATION BADGE */
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-emerald-500/30 shadow-xl text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              تهانينا! تم تفعيل الاشتراك بنجاح 🎉
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أصبحت جميع الدروس والمراجعات وبنك الأسئلة متاحة في حسابك.
            </p>
          </div>

          {/* SUBSCRIPTION DETAILS */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-right">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">كود التفعيل:</span>
              <span className="font-mono font-black text-blue-600 dark:text-blue-400">{successData.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">نوع الباقة:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {successData.accessScope === "full_month" ? "اشتراك شهري شامل" : successData.accessScope}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">تاريخ انتهاء الصلاحية:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(successData.expiresAt).toLocaleDateString("ar-EG")}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else window.location.href = "/";
            }}
            className="w-full py-3 px-6 rounded-2xl font-black text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition cursor-pointer"
          >
            الانتقال إلى لوحة الدروس والامتحانات
          </button>
        </div>
      )}
    </div>
  );
};
