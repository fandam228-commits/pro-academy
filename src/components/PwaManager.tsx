"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Smartphone, Download, X, WifiOff, GraduationCap, CheckCircle } from "lucide-react";

export const PwaManager: React.FC = () => {
  const { lang, user } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Detect iOS Safari (no beforeinstallprompt support)
    const ua = navigator.userAgent || "";
    const iosDetected = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsIos(iosDetected && !isStandalone);

    // Register service worker
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // iOS: show guide after delay
    if (iosDetected && !isStandalone) {
      const iosDismissed = localStorage.getItem("pa_ios_dismissed");
      if (!iosDismissed) {
        setTimeout(() => setShowIosGuide(true), 8000);
      }
    }

    // Capture installability event (Chrome/Edge/Android)
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("pa_pwa_dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 6000);
      }
    };

    const onInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstall as any);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall as any);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem("pa_pwa_dismissed", "1");
    } catch {}
  };

  if (!user) return null;

  return (
    <>
      {/* OFFLINE INDICATOR */}
      {isOffline && (
        <div className="fixed top-20 inset-x-0 z-50 flex justify-center px-4 no-print">
          <div className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-extrabold flex items-center gap-2 animate-in slide-in-from-top-2">
            <WifiOff className="w-4 h-4" />
            {lang === "ar"
              ? "أنت الآن في وضع عدم الاتصال — المحتوى المحفوظ متاح للمذاكرة"
              : "You're offline — cached content remains available for study"}
          </div>
        </div>
      )}

      {/* INSTALL APP BANNER */}
      {showBanner && !installed && (
        <div className="fixed bottom-24 right-5 rtl:right-auto rtl:left-5 z-40 w-[calc(100%-2.5rem)] max-w-sm no-print animate-in slide-in-from-bottom-4 fade-in">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border border-blue-500/40 rounded-3xl shadow-2xl p-5 text-white relative">
            <button
              onClick={dismiss}
              className="absolute top-3 left-3 rtl:right-3 rtl:left-auto p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/40">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm">
                  {lang === "ar" ? "نزّل تطبيق المستر على موبايلك!" : "Install the App on Your Phone!"}
                </h4>
                <p className="text-[11px] text-blue-200 mt-1 leading-relaxed">
                  {lang === "ar"
                    ? "🚀 أسرع من فتح المتصفح\n📥 ذاكر بدون نت\n🔔 إشعارات الحصص والواجبات\n📱 بأيقونة على شاشتك"
                    : "🚀 Faster than the browser\n📥 Study offline\n🔔 Class & homework alerts\n📱 App icon on your screen"}
                </p>
                <button
                  onClick={handleInstall}
                  className="mt-3 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 text-white text-sm font-black shadow-lg shadow-blue-500/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-5 h-5" />
                  {lang === "ar" ? "تثبيت التطبيق مجاناً" : "Install App Free"}
                </button>
                <p className="text-[9px] text-blue-300/60 text-center mt-1.5">
                  {lang === "ar" ? "مجاني تماماً — لا يحتاج متجر تطبيقات" : "100% free — no app store needed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS SAFARI INSTALL GUIDE */}
      {showIosGuide && isIos && !installed && (
        <div className="fixed bottom-24 right-5 rtl:right-auto rtl:left-5 z-40 w-[calc(100%-2.5rem)] max-w-sm no-print animate-in slide-in-from-bottom-4 fade-in">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border border-blue-500/40 rounded-3xl shadow-2xl p-5 text-white relative">
            <button
              onClick={() => {
                setShowIosGuide(false);
                try { localStorage.setItem("pa_ios_dismissed", "1"); } catch {}
              }}
              className="absolute top-3 left-3 rtl:right-3 rtl:left-auto p-1.5 rounded-lg bg-white/10 text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/40">
                <Smartphone className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm">
                  {lang === "ar" ? "نزّل التطبيق على الآيفون!" : "Install on iPhone!"}
                </h4>
                <div className="text-[11px] text-blue-200 mt-2 space-y-1.5 leading-relaxed">
                  <p>
                    {lang === "ar" ? "1️⃣ اضغط على زر المشاركة" : "1️⃣ Tap the Share button"}{" "}
                    <span className="inline-block bg-white/20 px-1.5 py-0.5 rounded text-[10px]">⬆️</span>{" "}
                    {lang === "ar" ? "في أسفل الشاشة" : "at the bottom"}
                  </p>
                  <p>
                    {lang === "ar" ? '2️⃣ اختر "إضافة إلى الشاشة الرئيسية"' : '2️⃣ Choose "Add to Home Screen"'}{" "}
                    <span className="inline-block bg-white/20 px-1.5 py-0.5 rounded text-[10px]">➕</span>
                  </p>
                  <p>
                    {lang === "ar" ? '3️⃣ اضغط "إضافة" وخلاص!' : '3️⃣ Tap "Add" and done!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
