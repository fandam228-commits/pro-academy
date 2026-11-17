"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  Sparkles,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

const DISMISS_KEY = "pa_pwa_dismiss_until";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running in standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // Register Service Worker in production
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // Check 7-day dismissal
    const dismissUntil = localStorage.getItem(DISMISS_KEY);
    const isDismissed = dismissUntil && Date.now() < parseInt(dismissUntil, 10);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Capture beforeinstallprompt for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        // Show after a gentle 3-second delay so student can view page first
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // For iOS users who haven't dismissed, show install suggestion gently
    if (isIOSDevice && !isDismissed && !isStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 4000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback: prompt not yet fired or unsupported browser
      alert("لتثبيت التطبيق: افتح قائمة خيارات المتصفح (⋮) واختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'.");
      return;
    }

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn("[PWA] Install prompt error:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      const expireTime = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem(DISMISS_KEY, expireTime.toString());
    } catch {}
  };

  // Do not render anything if already installed as standalone app
  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* =========================================================================
          1. FLOATING BOTTOM INSTALL BANNER (RTL & Responsive)
      ========================================================================= */}
      <aside
        role="region"
        aria-label="تثبيت تطبيق المنصة"
        className="fixed bottom-20 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 z-50 max-w-lg bg-[#0E1E38]/95 backdrop-blur-xl border border-blue-500/30 text-white rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-5 duration-300"
        dir="rtl"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* App Icon Badge */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E40AF] to-[#2563EB] flex items-center justify-center shrink-0 border border-blue-400/30 shadow-md">
            <GraduationCap className="w-7 h-7 text-[#EABF58]" />
          </div>

          {/* Copy */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#EABF58]">تطبيق Professional Academy</span>
              <span className="hidden xs:inline-block px-1.5 py-0.2 rounded-md bg-blue-500/20 text-[10px] font-bold text-blue-300">PWA</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug line-clamp-2">
              ثبّت تطبيق المنصة على هاتفك لسهولة الوصول السريع بدون متصفح
            </p>
          </div>

          {/* Close Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        {/* Action Buttons Row */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2 justify-end">
          <button
            onClick={handleDismiss}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            لاحقاً
          </button>
          
          <button
            onClick={handleInstallClick}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#1E40AF] to-[#2563EB] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs sm:text-sm font-black shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>تثبيت التطبيق الآن</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. IOS SAFARI INSTRUCTIONS MODAL
      ========================================================================= */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIOSModal(false);
          }}
          dir="rtl"
        >
          <div className="relative w-full max-w-md bg-[#0E1E38] border border-blue-500/40 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">تثبيت التطبيق على آيفون (iOS)</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-4 text-xs sm:text-sm">
              <p className="text-slate-200 leading-relaxed font-semibold">
                لتثبيت التطبيق على آيفون: اضغط على أيقونة المشاركة (Share) بالأسفل ثم اختر &apos;إضافة إلى الشاشة الرئيسية&apos; (Add to Home Screen).
              </p>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 font-black text-xs">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white block">اضغط على زر المشاركة (Share)</span>
                    <span className="text-[11px] text-slate-400">ستجده في الشريط السفلي لمتصفح Safari (<Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" />)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 font-black text-xs">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white block">اختر &quot;إضافة إلى الشاشة الرئيسية&quot;</span>
                    <span className="text-[11px] text-slate-400">مرر القائمة لأسفل حتى تجد خيار Add to Home Screen (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 font-black text-xs">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-white block">اضغط &quot;إضافة&quot; (Add)</span>
                    <span className="text-[11px] text-slate-400">سيظهر تطبيق الأكاديمية على شاشتك الرئيسية فوراً</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action */}
            <button
              onClick={() => {
                setShowIOSModal(false);
                handleDismiss();
              }}
              className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              فهمت، حسناً
            </button>

          </div>
        </div>
      )}
    </>
  );
}
