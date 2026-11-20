"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Share2,
  FileCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Flame,
  Lightbulb,
} from "lucide-react";
import { YoutubeIcon } from "./icons";
import { Radio } from "lucide-react";

interface PmcContentStudioViewProps {
  onNavigateToApproval?: () => void;
  lang?: "ar" | "en";
}

export const PmcContentStudioView: React.FC<PmcContentStudioViewProps> = ({
  onNavigateToApproval,
  lang = "ar",
}) => {
  const isAr = lang === "ar";
  const [selectedTopic, setSelectedTopic] = useState("used_to_vs_would");
  const [customTopic, setCustomTopic] = useState("");
  const [stage, setStage] = useState("Secondary");
  const [grade, setGrade] = useState("Third Secondary (Baccalaureate)");
  const [rawNotes, setRawNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"facebook" | "youtube" | "tiktok">("facebook");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const presetTopics = [
    { id: "used_to_vs_would", labelAr: "Used to vs Would (فخ أفعال الحالة)", unitAr: "الوحدة الأولى" },
    { id: "past_simple_vs_continuous", labelAr: "Past Simple vs Past Continuous", unitAr: "الوحدة الأولى" },
    { id: "inversion", labelAr: "قاعدة الـ Inversion (التقديم والتأخير)", unitAr: "الوحدة الثانية" },
    { id: "passive_voice", labelAr: "Passive Voice وتريكات الأفعال اللازمة", unitAr: "الوحدة الثالثة" },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccessBanner(null);

    const activePreset = presetTopics.find((t) => t.id === selectedTopic);
    const topicTitle = customTopic.trim() || activePreset?.labelAr || "Grammar Review";

    try {
      const res = await fetch("/api/admin/media-center/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "curriculum_lesson",
          stage,
          grade,
          unitTitle: activePreset?.unitAr || "الوحدة التدريبية",
          topicTitle,
          rawText: rawNotes,
          sourceReference: "كتاب الوزارة الرسمي للثانوية العامة 2026/2027",
        }),
      });

      const data = await res.json();
      if (res.ok && data.project) {
        setGeneratedData(data.project);
        setSuccessBanner(
          isAr
            ? "تم توليد وتخصيص المحتوى للمنصات الثلاث بنجاح، وإرسال المسودات تلقائياً لمركز الاعتماد!"
            : "Content successfully generated and sent to Human Approval Center!"
        );
      }
    } catch (err: any) {
      console.warn("Generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCurrent = () => {
    if (!generatedData) return;
    const v = generatedData.variants[activeTab];
    const textToCopy = `${v.hook}\n\n${v.caption || v.description || v.script}\n\n${(v.hashtags || []).join(" ")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isAr ? "محرك الذكاء الاصطناعي الأكاديمي المعتمد" : "Curriculum Grounded AI"}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {isAr ? "ثانوية عامة 2026/2027" : "Thanawya Amma 2027"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {isAr ? "استوديو صناعة المحتوى والتكييف المنصي" : "AI Content Studio & Adaptation Engine"}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {isAr
                ? "أدخل فكرة الدرس أو موضوع الجرامر؛ وسيقوم النظام بتوليد 3 نسخ مختلفة كلياً متوافقة مع خوارزميات فيسبوك ويوتيوب وتيك توك، دون أي اختراع لمعلومات غير منهجية."
                : "Transform educational topics into 3 distinct, platform-optimized formats with guaranteed curriculum alignment."}
            </p>
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successBanner}</span>
          </div>
          {onNavigateToApproval && (
            <button
              onClick={onNavigateToApproval}
              className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1 cursor-pointer"
            >
              <span>{isAr ? "عرض في مركز الاعتماد" : "Open Approvals"}</span>
              <ArrowRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      )}

      {/* Grid: Inputs (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topic Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{isAr ? "1. اختيار موضوع الدرس أو القاعدة" : "1. Select Curriculum Topic"}</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAr ? "اختر من أشهر فخاخ المنهج الوزاري أو اكتب موضوعاً مخصصاً:" : "Select from official curriculum topics:"}
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            {presetTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTopic(t.id);
                  setCustomTopic("");
                }}
                className={`w-full p-3 rounded-2xl text-xs font-bold text-right transition border cursor-pointer flex items-center justify-between ${
                  selectedTopic === t.id && !customTopic
                    ? "bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                }`}
              >
                <span>{t.labelAr}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                  {t.unitAr}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Topic Input */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
              {isAr ? "أو موضوع مخصص / سؤال امتحان محدد:" : "Or Custom Topic / Specific Question:"}
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder={isAr ? "مثال: مراجعة المباشر وغير المباشر Reported Speech" : "e.g. Reported Speech Review"}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Stage & Grade Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {isAr ? "المرحلة:" : "Stage:"}
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Secondary">الثانوية العامة</option>
                <option value="Preparatory">الشهادة الإعدادية</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {isAr ? "الصف الدراسي:" : "Grade:"}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Third Secondary (Baccalaureate)">الصف الثالث الثانوي</option>
                <option value="Second Secondary">الصف الثاني الثانوي</option>
                <option value="First Secondary">الصف الأول الثانوي</option>
                <option value="Third Prep">الصف الثالث الإعدادي</option>
              </select>
            </div>
          </div>

          {/* Raw Text Notes (Optional) */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
              {isAr ? "ملاحظات إضافية أو نص سؤال من بنك الأسئلة (اختياري):" : "Additional Notes (Optional):"}
            </label>
            <textarea
              rows={3}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder={isAr ? "ألصق أي جملة أو ملاحظة خاصة تريد لمستر حبيب التركيز عليها..." : "Paste question snippet..."}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${generating ? "animate-spin" : ""}`} />
            <span>
              {generating
                ? isAr ? "جاري التوليد والتحليل الأكاديمي..." : "Analyzing & Generating..."
                : isAr ? "توليد المحتوى للمنصات الثلاث الآن 🚀" : "Generate Multiplatform Content"}
            </span>
          </button>
        </div>

        {/* Right Column: 3-Platform Adaptation Preview Tabs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {isAr ? "2. مواءمة وتخصيص المحتوى لكل منصة" : "2. Platform-Specific Output"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isAr ? "محتوى مختلف تماماً لكل منصة يراعي جمهورها وطبيعة خوارزميتها" : "Differentiated output crafted for each platform's algorithm"}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab("facebook")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "facebook"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={() => setActiveTab("youtube")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "youtube"
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </button>

                <button
                  onClick={() => setActiveTab("tiktok")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "tiktok"
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-pink-400" />
                  <span>TikTok</span>
                </button>
              </div>
            </div>

            {/* Display Variant Content */}
            {generatedData ? (
              <div className="py-4 space-y-4 animate-fadeIn">
                {/* Variant Hook Banner */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                    {activeTab === "tiktok"
                      ? isAr ? "⚡ Hook سريع (أول 3 ثوانٍ يخطف الانتباه):" : "3-Second Rapid Hook:"
                      : isAr ? "🎯 العنوان الجاذب / الـ Hook:" : "Attention Hook:"}
                  </span>
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {generatedData.variants[activeTab].hook}
                  </p>
                </div>

                {/* Script (for YouTube & TikTok) */}
                {generatedData.variants[activeTab].script && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      {isAr ? "🎙️ سيناريو وسكريبت الإلقاء لمستر حبيب:" : "Script & Delivery Breakdown:"}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {generatedData.variants[activeTab].script}
                    </p>
                  </div>
                )}

                {/* Caption / Description */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {activeTab === "youtube"
                      ? isAr ? "📄 وصف الفيديو المهيأ للـ SEO:" : "Video Description:"
                      : isAr ? "📝 كابشن المنشور النهائي:" : "Post Caption:"}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {generatedData.variants[activeTab].description ||
                      generatedData.variants[activeTab].caption}
                  </p>
                </div>

                {/* Hashtags & CTA Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {generatedData.variants[activeTab].hashtags?.map((h: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-mono"
                    >
                      {h}
                    </span>
                  ))}
                  {generatedData.variants[activeTab].thumbnailText && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-bold">
                      Thumbnail: {generatedData.variants[activeTab].thumbnailText}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {isAr ? "جاهز لتوليد المحتوى" : "Ready to Generate Content"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {isAr
                    ? "اختر موضوع الدرس من القائمة على اليمين ثم اضغط 'توليد المحتوى للمنصات الثلاث' لمعاينة النتيجة فورياً."
                    : "Select a topic on the left and click Generate to produce 3 differentiated platform drafts."}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {generatedData && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleCopyCurrent}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ النص" : "Copy")}</span>
              </button>

              {onNavigateToApproval && (
                <button
                  onClick={onNavigateToApproval}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? "الانتقال لمركز الاعتماد للموافقة" : "Open in Approval Center"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
