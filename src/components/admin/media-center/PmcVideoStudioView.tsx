"use client";

import React, { useState } from "react";
import {
  Video,
  Film,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sliders,
  Sparkles,
  Volume2,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Maximize2,
  Tv,
  Smartphone,
} from "lucide-react";

interface StoryboardScene {
  sceneNumber: number;
  timeRange: string;
  durationSeconds: number;
  sceneType: string;
  voiceoverTextAr: string;
  subtitlesBilingual: {
    ar: string;
    en?: string;
    goldenKeywords: string[];
    trapKeywords: string[];
  };
  visualCues: {
    cameraMove: string;
    transition: string;
    bRollSuggestion: string;
    onScreenGraphics: string;
  };
  branding: {
    showAcademyLogo: boolean;
    showHabibLowerThird: boolean;
  };
}

interface PmcVideoStudioViewProps {
  lang?: "ar" | "en";
}

export const PmcVideoStudioView: React.FC<PmcVideoStudioViewProps> = ({
  lang = "ar",
}) => {
  const isAr = lang === "ar";
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);

  // Pre-configured official storyboard sample
  const sampleScenes: StoryboardScene[] = [
    {
      sceneNumber: 1,
      timeRange: "00:00 - 00:03",
      durationSeconds: 3,
      sceneType: "hook",
      voiceoverTextAr: "أوعى تختار الإجابة دي في امتحان الثانوية العامة! فخ بيضيع درجاتك في ثانية.",
      subtitlesBilingual: {
        ar: "أوعى تختار الإجابة دي في امتحان الثانوية! ❌",
        en: "Avoid this common Thanawya trap!",
        goldenKeywords: ["امتحان الثانوية", "درجاتك"],
        trapKeywords: ["أوعى تختار", "فخ"],
      },
      visualCues: {
        cameraMove: "Zoom In Rapid (1.25x)",
        transition: "Hard Cut",
        bRollSuggestion: "ورقة امتحان ثانوية عامة وبابل شيت وقلم أحمر يحدد خطأ",
        onScreenGraphics: "⚠️ تحذير امتحاني: قاعدة Used to vs Would",
      },
      branding: {
        showAcademyLogo: true,
        showHabibLowerThird: true,
      },
    },
    {
      sceneNumber: 2,
      timeRange: "00:03 - 00:18",
      durationSeconds: 15,
      sceneType: "concept",
      voiceoverTextAr: "ليه؟ لأن Used to بتيجي مع أفعال الحالة وعادات الماضي، لكن Would مينفعش تيجي مع أفعال الحالة أبداً!",
      subtitlesBilingual: {
        ar: "القاعدة الذهبية: أفعال الحالة تأتي مع Used to فقط",
        en: "Stative verbs take 'Used to' ONLY!",
        goldenKeywords: ["القاعدة الذهبية", "Used to فقط"],
        trapKeywords: ["أفعال الحالة"],
      },
      visualCues: {
        cameraMove: "Static Tight Shot",
        transition: "Slide Up",
        bRollSuggestion: "مستر حبيب يشرح على الشاشة التفاعلية مع شريط الاسم الفخم",
        onScreenGraphics: "📌 Used to vs Would: Rule Breakdown",
      },
      branding: {
        showAcademyLogo: false,
        showHabibLowerThird: true,
      },
    },
    {
      sceneNumber: 3,
      timeRange: "00:18 - 00:30",
      durationSeconds: 12,
      sceneType: "trap_warning",
      voiceoverTextAr: "شوف معايا السؤال ده من نماذج الوزارة.. أول ما تلاقي have أو live اختار Used to فوراً واضمن درجتك.",
      subtitlesBilingual: {
        ar: "نموذج وزارة رسمي: الحل الصح في ثانية واحدة",
        en: "Official Ministry Question: Instant Solution",
        goldenKeywords: ["نموذج وزارة رسمي", "الحل الصح"],
        trapKeywords: [],
      },
      visualCues: {
        cameraMove: "Zoom Out Slow",
        transition: "Whip Pan",
        bRollSuggestion: "طالب يحل السؤال على التابلت وتظهر علامة الصح الخضراء",
        onScreenGraphics: "💯 الإجابة المعتمدة تضمن لك الدرجة النهائية",
      },
      branding: {
        showAcademyLogo: false,
        showHabibLowerThird: false,
      },
    },
    {
      sceneNumber: 4,
      timeRange: "00:30 - 00:38",
      durationSeconds: 8,
      sceneType: "cta",
      voiceoverTextAr: "حل امتحان الحصة التفاعلي المجاني من الرابط في البايو، واشترك في منصة مستر حبيب الرحمن!",
      subtitlesBilingual: {
        ar: "ادخل على اللينك وحل امتحان الحصة مجاناً 🚀",
        en: "Join Professional Academy & Test Yourself Free!",
        goldenKeywords: ["امتحان الحصة مجاناً", "مستر حبيب الرحمن"],
        trapKeywords: [],
      },
      visualCues: {
        cameraMove: "Zoom In Rapid",
        transition: "Fade to Black",
        bRollSuggestion: "شعار منصة Professional Academy وشعار مستر حبيب الذهبي الفخم",
        onScreenGraphics: "Professional Academy — Mr. Habib El Rahman",
      },
      branding: {
        showAcademyLogo: true,
        showHabibLowerThird: true,
      },
    },
  ];

  const currentScene = sampleScenes[currentSceneIndex];

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-500" />
              {isAr ? "استوديو الإخراج والستوري بورد" : "Storyboard & Motion Director"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
              {isAr ? "تسريع الرندر عبر الـ GPU" : "NVENC GPU Ready"}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "إعداد وإخراج الفيديوهات التعليمية (AI Video Studio)" : "AI Educational Video Director"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? "تحويل نصوص الشرح إلى مشاهد تفاعلية (Storyboard)، وتوليد الترجمة المتزامنة مع تمييز الكلمات الذهبية والحمراء، وتطبيق شعار الأكاديمية وشريط اسم مستر حبيب الرحمن."
              : "Transform scripts into structured scenes with bilingual subtitles, B-roll cues, and academy branding."}
          </p>
        </div>

        {/* Aspect Ratio Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setAspectRatio("9:16")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              aspectRatio === "9:16"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16 (TikTok & Reels)</span>
          </button>

          <button
            onClick={() => setAspectRatio("16:9")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              aspectRatio === "16:9"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>16:9 (YouTube)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Preview Monitor */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            className={`bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between p-6 transition-all duration-300 ${
              aspectRatio === "9:16" ? "w-[300px] h-[533px]" : "w-full aspect-video"
            }`}
          >
            {/* Top Branding Overlay */}
            {currentScene.branding.showAcademyLogo && (
              <div className="flex items-center justify-between text-white/90">
                <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-amber-500/40 text-[10px] font-black text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Professional Academy
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentScene.timeRange}
                </span>
              </div>
            )}

            {/* Center Visual Mockup */}
            <div className="my-auto text-center space-y-3 px-2">
              <div className="inline-block px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black shadow-lg">
                {currentScene.visualCues.onScreenGraphics}
              </div>

              {/* Bilingual Subtitle Simulation with Highlights */}
              <div className="p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-white space-y-1">
                <p className="text-xs font-black leading-snug">
                  {currentScene.subtitlesBilingual.ar.split(" ").map((word, i) => {
                    const isGolden = currentScene.subtitlesBilingual.goldenKeywords.some((k) =>
                      k.includes(word)
                    );
                    const isTrap = currentScene.subtitlesBilingual.trapKeywords.some((k) =>
                      k.includes(word)
                    );

                    return (
                      <span
                        key={i}
                        className={
                          isGolden
                            ? "text-amber-400 font-extrabold underline underline-offset-2"
                            : isTrap
                            ? "text-rose-500 font-extrabold"
                            : "text-white"
                        }
                      >
                        {word}{" "}
                      </span>
                    );
                  })}
                </p>
                {currentScene.subtitlesBilingual.en && (
                  <p className="text-[10px] font-mono text-slate-300 italic">
                    {currentScene.subtitlesBilingual.en}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Lower Third (Mr. Habib El Rahman) */}
            {currentScene.branding.showHabibLowerThird && (
              <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900/90 p-2.5 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h5 className="text-[11px] font-black text-white">Mr. Habib El Rahman</h5>
                  <p className="text-[9px] text-amber-300 font-bold">خبير لغة إنجليزية — ثانوية عامة 2027</p>
                </div>
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  PRO
                </div>
              </div>
            )}
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center gap-3 mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm">
            <button
              onClick={() => setCurrentSceneIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSceneIndex === 0}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 disabled:opacity-40"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setCurrentSceneIndex((prev) => Math.min(sampleScenes.length - 1, prev + 1))}
              disabled={currentSceneIndex === sampleScenes.length - 1}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 disabled:opacity-40"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
              مشهد {currentScene.sceneNumber} / {sampleScenes.length}
            </span>
          </div>
        </div>

        {/* Right: Scene Breakdown & Director Cues */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>تفاصيل المشهد الحالي والمؤثرات البصرية</span>
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
              {currentScene.timeRange} ({currentScene.durationSeconds} ثوانٍ)
            </span>
          </div>

          {/* Voiceover Text */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">نص الإلقاء الصوتي:</span>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
              "{currentScene.voiceoverTextAr}"
            </p>
          </div>

          {/* Visual Cues Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">حركة الكاميرا (Camera Move):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentScene.visualCues.cameraMove}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">الانتقال (Transition):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentScene.visualCues.transition}</span>
            </div>

            <div className="col-span-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">اقتراح الـ B-Roll المناسب:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentScene.visualCues.bRollSuggestion}</span>
            </div>
          </div>

          {/* Audio Profile Indicator */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Volume2 className="w-4 h-4" />
              <span className="font-bold">معايير ميكسر الصوت:</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-blue-800 dark:text-blue-200">
              <span>Voice: -14 LUFS</span>
              <span>Ducking: 80%</span>
            </div>
          </div>

          {/* File Upload / Import Ready Video Dropzone */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
              استيراد فيديو جاهز من الجهاز للربط مع المشهد:
            </label>
            <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center hover:border-blue-500 transition cursor-pointer">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {uploadedVideoName ? `تم اختيار: ${uploadedVideoName}` : "اسحب ملف الفيديو هنا (MP4 / MOV) أو اضغط للتصفح"}
              </p>
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedVideoName(file.name);
                }}
                className="hidden"
                id="video_file_input"
              />
              <label
                htmlFor="video_file_input"
                className="mt-2 inline-block px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-blue-600 cursor-pointer"
              >
                تصفح الجهاز
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
