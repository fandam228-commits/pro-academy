"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useApp } from "@/context/AppContext";
import {
  subscribeInstall,
  promptInstall,
  isStandalone,
  detectDevice,
  type DeviceKind,
} from "@/lib/pwa-install";
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  QrCode,
  Wifi,
  WifiOff,
  BellRing,
  Zap,
  ShieldCheck,
  Apple,
  Globe,
  MonitorSmartphone,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

export const DownloadAppPage: React.FC = () => {
  const { lang } = useApp();
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [device, setDevice] = useState<DeviceKind>("desktop");
  const [qr, setQr] = useState<string>("");
  const [siteUrl, setSiteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [installMsg, setInstallMsg] = useState("");

  useEffect(() => {
    setDevice(detectDevice());
    setInstalled(isStandalone());
    const unsub = subscribeInstall((available) => setCanInstall(available));

    const url = window.location.origin;
    setSiteUrl(url);
    QRCode.toDataURL(url, {
      width: 320,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setQr)
      .catch(() => {});

    return () => unsub();
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setInstalled(true);
      setInstallMsg(lang === "ar" ? "🎉 تم تثبيت التطبيق على جهازك بنجاح!" : "🎉 App installed successfully!");
    } else {
      setInstallMsg(lang === "ar" ? "تم إلغاء التثبيت — يمكنك المحاولة مرة أخرى في أي وقت." : "Install dismissed — you can try again anytime.");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    { icon: Zap, ar: "فتح فوري من شاشة الموبايل بدون متصفح", en: "Instant launch from your home screen" },
    { icon: WifiOff, ar: "مذاكرة المحتوى المحفوظ بدون إنترنت", en: "Study cached content offline" },
    { icon: BellRing, ar: "إشعارات الحصص والواجبات على الجهاز", en: "Live class & homework push alerts" },
    { icon: ShieldCheck, ar: "نفس حسابك وبياناتك بأمان كامل", en: "Same secure account & data" },
  ];

  const androidSteps = [
    { ar: "افتح المنصة من متصفح Chrome على تليفونك", en: "Open the platform in Chrome on your phone" },
    { ar: "اضغط زر «تثبيت التطبيق» بالأسفل، أو افتح قائمة ⋮ واختر (تثبيت التطبيق / Add to Home screen)", en: "Tap Install below, or open ⋮ menu → Install app" },
    { ar: "أكد التثبيت — هتلاقي أيقونة الأكاديمية على شاشة الموبايل 🎓", en: "Confirm — the Academy icon appears on your home screen 🎓" },
  ];

  const iosSteps = [
    { ar: "افتح المنصة من متصفح Safari (مش Chrome) على الآيفون", en: "Open the platform in Safari (not Chrome) on iPhone" },
    { ar: "اضغط زر المشاركة ⬆️ في شريط سفاري السفلي", en: "Tap the Share button ⬆️ in Safari's bottom bar" },
    { ar: "اختر «إضافة إلى الشاشة الرئيسية / Add to Home Screen» ثم اضغط إضافة", en: "Choose 'Add to Home Screen' then tap Add" },
  ];

  const steps = device === "ios" ? iosSteps : androidSteps;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1.5 rounded-full text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {lang === "ar" ? "تطبيق مجاني — بدون متجر تطبيقات" : "Free app — no app store needed"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mt-4 leading-snug">
              {lang === "ar" ? "نزّل تطبيق الأكاديمية على تليفونك 📱" : "Install the Academy App on Your Phone 📱"}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-3 leading-relaxed max-w-lg">
              {lang === "ar"
                ? "خطوة واحدة وهتلاقي المنصة كتطبيق كامل على شاشة موبايلك — فتح أسرع، إشعارات الحصص، ومذاكرة بدون إنترنت."
                : "One tap turns the platform into a full app on your home screen — faster launch, class alerts, and offline study."}
            </p>

            {installed ? (
              <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-5 py-3 rounded-2xl text-sm font-extrabold text-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
                {lang === "ar" ? "التطبيق مثبّت بالفعل على هذا الجهاز ✓" : "App already installed on this device ✓"}
              </div>
            ) : canInstall ? (
              <button
                onClick={handleInstall}
                className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-white font-black text-sm shadow-2xl shadow-emerald-500/30 flex items-center gap-3 transition-all hover:scale-105"
              >
                <Download className="w-5 h-5" />
                {lang === "ar" ? "تثبيت التطبيق الآن" : "Install App Now"}
              </button>
            ) : (
              <div className="mt-6 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-xs font-bold text-blue-100 flex items-center gap-2 max-w-md">
                <MonitorSmartphone className="w-4 h-4 shrink-0" />
                {device === "ios"
                  ? lang === "ar" ? "على الآيفون: اتبع خطوات سفاري بالأسفل ⬇️" : "On iPhone: follow the Safari steps below ⬇️"
                  : lang === "ar" ? "افتح الرابط من موبايلك (امسح كود QR) ليظهر زر التثبيت" : "Open on your phone (scan the QR) to get the install button"}
              </div>
            )}

            {installMsg && <p className="mt-3 text-xs font-bold text-amber-200">{installMsg}</p>}
          </div>

          {/* QR CODE */}
          <div className="bg-white p-4 rounded-3xl shadow-2xl shrink-0">
            {qr ? (
              <img src={qr} alt="QR" className="w-44 h-44" />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-slate-300">
                <QrCode className="w-16 h-16" />
              </div>
            )}
            <p className="text-[10px] font-black text-slate-700 text-center mt-2">
              {lang === "ar" ? "امسح بكاميرا موبايلك" : "Scan with your phone"}
            </p>
          </div>
        </div>
      </div>

      {/* SHARE LINK */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold text-slate-500 shrink-0">{lang === "ar" ? "رابط المنصة:" : "Platform link:"}</span>
        <code className="flex-1 min-w-[200px] text-[11px] font-mono bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 truncate">
          {siteUrl}
        </code>
        <button
          onClick={copyLink}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? (lang === "ar" ? "تم النسخ" : "Copied") : lang === "ar" ? "نسخ الرابط" : "Copy"}
        </button>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                {lang === "ar" ? f.ar : f.en}
              </p>
            </div>
          );
        })}
      </div>

      {/* INSTALL STEPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ANDROID */}
        <div className={`rounded-3xl border shadow-xl p-6 ${device === "android" ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            {lang === "ar" ? "أندرويد (Chrome)" : "Android (Chrome)"}
            {device === "android" && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black">
                {lang === "ar" ? "جهازك" : "YOUR DEVICE"}
              </span>
            )}
          </h3>
          <ol className="space-y-3">
            {androidSteps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">{i + 1}</span>
                <span>{lang === "ar" ? s.ar : s.en}</span>
              </li>
            ))}
          </ol>
          {canInstall && (
            <button onClick={handleInstall} className="mt-4 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              {lang === "ar" ? "تثبيت مباشر الآن" : "Install directly"}
            </button>
          )}
        </div>

        {/* IOS */}
        <div className={`rounded-3xl border shadow-xl p-6 ${device === "ios" ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Apple className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            {lang === "ar" ? "آيفون / آيباد (Safari)" : "iPhone / iPad (Safari)"}
            {device === "ios" && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-black">
                {lang === "ar" ? "جهازك" : "YOUR DEVICE"}
              </span>
            )}
          </h3>
          <ol className="space-y-3">
            {iosSteps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">{i + 1}</span>
                <span>{lang === "ar" ? s.ar : s.en}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
            <Share className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{lang === "ar" ? "ابحث عن أيقونة المشاركة ثم" : "Find the Share icon, then"}</span>
            <PlusSquare className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{lang === "ar" ? "إضافة للشاشة الرئيسية" : "Add to Home Screen"}</span>
          </div>
        </div>
      </div>

      {/* NOTE */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-3xl p-5 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
          {lang === "ar"
            ? "ملاحظة: التطبيق يعمل بنفس حسابك — سجّل دخولك مرة واحدة بعد التثبيت وسيظل محفوظاً. لا يحتاج مساحة تخزين كبيرة ولا تحديثات يدوية، فكل جديد يظهر تلقائياً."
            : "Note: the app uses the same account — sign in once after install and stay logged in. It needs minimal storage and updates automatically."}
        </p>
      </div>
    </div>
  );
};
