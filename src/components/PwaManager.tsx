"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { initInstallCapture, subscribeInstall, promptInstall, isStandalone } from "@/lib/pwa-install";
import { Smartphone, Download, X, WifiOff, GraduationCap, CheckCircle } from "lucide-react";

export const PwaManager: React.FC = () => {
  const { lang, user } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Shared install-prompt capture (also powers the Download page)
    initInstallCapture();
    const unsub = subscribeInstall((available) => {
      setDeferredPrompt(available ? true : null);
      const dismissed = localStorage.getItem("pa_pwa_dismissed");
      if (available && !dismissed && !isStandalone()) {
        setTimeout(() => setShowBanner(true), 6000);
      }
    });

    const onInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);

    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    if (isStandalone()) setInstalled(true);

    return () => {
      unsub();
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setShowBanner(false);
      setInstalled(true);
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
                  {lang === "ar" ? "ثبّت تطبيق Professional Academy" : "Install Professional Academy App"}
                </h4>
                <p className="text-[11px] text-blue-200 mt-1 leading-relaxed">
                  {lang === "ar"
                    ? "وصول أسرع من شاشة الموبايل + المحتوى المحفوظ للمذاكرة بدون إنترنت + إشعارات الحصص المباشرة."
                    : "Faster access from your homescreen, offline cached study content, and live class notifications."}
                </p>
                <button
                  onClick={handleInstall}
                  className="mt-3 w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 text-white text-xs font-extrabold shadow-lg shadow-blue-500/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  {lang === "ar" ? "تثبيت التطبيق الآن" : "Install Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSTALLED CONFIRMATION */}
      {installed && (
        <div className="hidden items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3 h-3" />
          {lang === "ar" ? "التطبيق مثبّت" : "App Installed"}
        </div>
      )}
    </>
  );
};
