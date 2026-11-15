"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Settings,
  Volume2,
  VolumeX,
  MousePointer,
  Touchpad,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { pronunciationManager, VoiceStatus } from "@/lib/pronunciation-assistant";

interface PronunciationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: (newSettings: any) => void;
}

export const PronunciationSettingsModal: React.FC<PronunciationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
}) => {
  const { lang, user } = useApp();

  const [enabled, setEnabled] = useState(true);
  const [accent, setAccent] = useState<"uk" | "us">("uk");
  const [speed, setSpeed] = useState<"normal" | "slow">("normal");
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const [touchEnabled, setTouchEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setVoiceStatus(pronunciationManager.getVoiceStatus(accent));
    }
  }, [isOpen, accent]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/student/pronunciation-settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setEnabled(data.settings.enabled ?? true);
        setAccent(data.settings.accent || "uk");
        setSpeed(data.settings.speed || "normal");
        setHoverEnabled(data.settings.hoverEnabled ?? true);
        setTouchEnabled(data.settings.touchEnabled ?? true);
      }
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveNotice(null);

    const payload = {
      enabled,
      accent,
      speed,
      hoverEnabled,
      touchEnabled,
    };

    try {
      const res = await fetch("/api/student/pronunciation-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSaveNotice(lang === "ar" ? "تم حفظ إعدادات النطق بنجاح!" : "Pronunciation settings saved!");
        onSettingsSaved?.(payload);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch {
      setSaveNotice(lang === "ar" ? "حدث خطأ أثناء حفظ الإعدادات." : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-fadeIn">
      <div
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-purple-900/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pron-settings-title"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          aria-label={lang === "ar" ? "إغلاق" : "Close"}
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
            Assistant Controls
          </span>
          <h3
            id="pron-settings-title"
            className="text-2xl font-black text-slate-950 dark:text-white mt-1 flex items-center gap-2"
          >
            <Settings className="w-6 h-6 text-purple-600 dark:text-sky-400" />
            <span>{lang === "ar" ? "إعدادات مساعد النطق الذكي" : "Pronunciation Assistant Settings"}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "ar"
              ? "تحكم في اللهجة الافتراضية، السرعة، وطريقة التفاعل عند مرور الماوس أو اللمس."
              : "Customize accent, playback speed, hover triggers, and touch preferences."}
          </p>
        </div>

        {/* SETTING 1: ENABLE / DISABLE */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#1a233b] border border-slate-200 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
              {lang === "ar" ? "تفعيل مساعد النطق الصوتي" : "Enable Pronunciation Assistant"}
            </span>
            <span className="text-xs text-slate-500">
              {enabled
                ? lang === "ar"
                  ? "المساعد مفعل بالكامل"
                  : "Audio playback active"
                : lang === "ar"
                ? "تم تعطيل النطق التلقائي"
                : "Audio playback paused"}
            </span>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
              enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
            aria-label="Toggle pronunciation assistant"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                enabled ? "right-1 rtl:right-auto rtl:left-1" : "left-1 rtl:left-auto rtl:right-1"
              }`}
            />
          </button>
        </div>

        {/* SETTING 2: ACCENT CHOICE */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
            {lang === "ar" ? "اللهجة الإنجليزية المفضلة:" : "Preferred English Accent:"}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAccent("uk")}
              className={`p-3.5 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accent === "uk"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/25"
                  : "bg-slate-50 dark:bg-[#1a233b] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-400"
              }`}
            >
              <span className="text-base">🇬🇧</span>
              <span>British (en-GB)</span>
            </button>
            <button
              onClick={() => setAccent("us")}
              className={`p-3.5 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                accent === "us"
                  ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/25"
                  : "bg-slate-50 dark:bg-[#1a233b] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-400"
              }`}
            >
              <span className="text-base">🇺🇸</span>
              <span>American (en-US)</span>
            </button>
          </div>
        </div>

        {/* VOICE DIAGNOSTICS & NOTICE */}
        {voiceStatus?.isFallback && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{voiceStatus.fallbackNotice}</span>
          </div>
        )}

        {/* SETTING 3: SPEED */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
            {lang === "ar" ? "سرعة النطق:" : "Speech Speed Rate:"}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSpeed("normal")}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                speed === "normal"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-slate-50 dark:bg-[#1a233b] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              1.0x ({lang === "ar" ? "عادية وطبيعية" : "Normal Clarity"})
            </button>
            <button
              onClick={() => setSpeed("slow")}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                speed === "slow"
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black"
                  : "bg-slate-50 dark:bg-[#1a233b] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              0.7x ({lang === "ar" ? "بطيئة للتدريب 🐢" : "Slow Drill 🐢"})
            </button>
          </div>
        </div>

        {/* SETTING 4: HOVER TRIGGER (DESKTOP) */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a233b] border border-slate-200 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-purple-600 dark:text-sky-400" />
              <span>{lang === "ar" ? "النطق التلقائي عند مرور الماوس (Hover)" : "Desktop Hover Pronunciation"}</span>
            </span>
            <span className="text-[11px] text-slate-500 block">
              {lang === "ar"
                ? "يمكن إيقافه إذا كنت تفضل النقر فقط وتجنب النطق مع حركة الماوس السريعة."
                : "Can be disabled to prevent accidental playback during fast mouse movement."}
            </span>
          </div>
          <button
            onClick={() => setHoverEnabled(!hoverEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              hoverEnabled ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
            aria-label="Toggle hover pronunciation"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                hoverEnabled ? "right-1 rtl:right-auto rtl:left-1" : "left-1 rtl:left-auto rtl:right-1"
              }`}
            />
          </button>
        </div>

        {/* SETTING 5: TOUCH TRIGGER (MOBILE) */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a233b] border border-slate-200 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Touchpad className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === "ar" ? "النطق عند لمس الكلمة (Touch/Click)" : "Touch & Tap Pronunciation"}</span>
            </span>
            <span className="text-[11px] text-slate-500 block">
              {lang === "ar" ? "تشغيل النطق فور الضغط على أيقونة السماعة أو الكلمة." : "Play pronunciation upon tapping."}
            </span>
          </div>
          <button
            onClick={() => setTouchEnabled(!touchEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              touchEnabled ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
            aria-label="Toggle touch pronunciation"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                touchEnabled ? "right-1 rtl:right-auto rtl:left-1" : "left-1 rtl:left-auto rtl:right-1"
              }`}
            />
          </button>
        </div>

        {/* SAVE NOTICE */}
        {saveNotice && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
        >
          {saving
            ? lang === "ar"
              ? "جاري الحفظ..."
              : "Saving..."
            : lang === "ar"
            ? "حفظ الإعدادات"
            : "Save Settings"}
        </button>
      </div>
    </div>
  );
};
