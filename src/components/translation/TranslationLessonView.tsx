"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PdfViewer } from "@/components/PdfViewer";
import {
  Video,
  FileText,
  BookOpen,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Play,
  Layers,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface TranslationLessonViewProps {
  lesson: any;
  module: any;
  onStartPractice: () => void;
  onStartExam: () => void;
  onBack: () => void;
}

export const TranslationLessonView: React.FC<TranslationLessonViewProps> = ({
  lesson,
  module,
  onStartPractice,
  onStartExam,
  onBack,
}) => {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState<"content" | "video" | "pdf">("content");

  const rules = Array.isArray(lesson.rules) ? lesson.rules : [];
  const vocabulary = Array.isArray(lesson.vocabulary) ? lesson.vocabulary : [];
  const solvedExamples = Array.isArray(lesson.solvedExamples) ? lesson.solvedExamples : [];
  const commonMistakes = Array.isArray(lesson.commonMistakes) ? lesson.commonMistakes : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* LESSON TOP BAR & BREADCRUMB */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
            <span>العودة إلى مسارات أكاديمية الترجمة</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {module.titleAr}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {lesson.titleAr}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lesson.summaryAr}
          </p>
        </div>

        {/* CTA BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onStartPractice}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>تدريب تفاعلي (Practice)</span>
          </button>
          <button
            onClick={onStartExam}
            className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs border border-purple-500/30 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>اختبار الدرس (Exam)</span>
          </button>
        </div>
      </div>

      {/* MEDIA TABS */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "content"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>القواعد والأمثلة</span>
        </button>

        {lesson.videoUrl && (
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "video"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>فيديو الشرح ({lesson.videoDuration || "15 mins"})</span>
          </button>
        )}

        {lesson.pdfUrl && (
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "pdf"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>مذكرة الـ PDF</span>
          </button>
        )}
      </div>

      {/* VIDEO PLAYER VIEW */}
      {activeTab === "video" && lesson.videoUrl && (
        <div className="animate-fadeIn">
          <VideoPlayer
            videoUrl={lesson.videoUrl}
            title={`${lesson.titleAr} — مستر حبيب الرحمن`}
            lessonId={lesson.id}
          />
        </div>
      )}

      {/* PDF VIEWER VIEW */}
      {activeTab === "pdf" && lesson.pdfUrl && (
        <div className="animate-fadeIn">
          <PdfViewer
            pdfUrl={lesson.pdfUrl}
            title={`${lesson.titleAr} — ملخص وقواعد الترجمة`}
          />
        </div>
      )}

      {/* DETAILED CONTENT VIEW */}
      {activeTab === "content" && (
        <div className="space-y-8 animate-fadeIn">
          {/* SECTION 1: TRANSLATION RULES */}
          {rules.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Layers className="w-5 h-5" />
                <h3 className="text-lg font-black">أهم قواعد وأصول الترجمة في هذا الدرس:</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        {rule.titleEn}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {rule.titleAr}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rule.ruleAr}
                    </p>

                    {Array.isArray(rule.examples) && rule.examples.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        {rule.examples.map((ex: any, eIdx: number) => (
                          <div
                            key={eIdx}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs space-y-1"
                          >
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              🇸🇦 {ex.ar}
                            </div>
                            <div className="font-bold text-purple-700 dark:text-purple-300 font-mono">
                              🇬🇧 {ex.en}
                            </div>
                            {ex.note && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                                💡 {ex.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: VOCABULARY & COLLOCATIONS */}
          {vocabulary.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-lg font-black">المفردات والمتلازمات الرئيسية بالدرس:</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vocabulary.map((voc: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {voc.en}
                      </span>
                      {voc.ipa && (
                        <span className="text-[10px] text-slate-400 font-mono">{voc.ipa}</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {voc.ar}
                    </div>
                    {voc.exampleEn && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                        "{voc.exampleEn}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: SOLVED EXAMPLES */}
          {solvedExamples.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-black">أمثلة محلولة خطوة بخطوة (Solved Models):</h3>
              </div>

              <div className="space-y-3">
                {solvedExamples.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        مثال تطبيقي {idx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {ex.direction === "ar_to_en" ? "من العربية إلى الإنجليزية" : "من الإنجليزية إلى العربية"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 space-y-1">
                      <div className="text-xs text-slate-400 font-bold">النص الأصلي:</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {ex.sourceText}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 space-y-1">
                      <div className="text-xs text-purple-600 dark:text-purple-300 font-bold">
                        الترجمة النموذجية:
                      </div>
                      <div className="text-sm font-black text-purple-950 dark:text-purple-100 font-mono">
                        {ex.targetText}
                      </div>
                    </div>

                    {Array.isArray(ex.steps) && ex.steps.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          خطوات التفكير والتحليل:
                        </span>
                        {ex.steps.map((st: string, sIdx: number) => (
                          <div key={sIdx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-purple-500 font-black">•</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: COMMON MISTAKES */}
          {commonMistakes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="text-lg font-black">أخطاء شائعة يحذر منها مستر حبيب:</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commonMistakes.map((cm: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 block">
                        ❌ خطأ شائع:
                      </span>
                      <p className="text-xs font-mono font-bold text-rose-800 dark:text-rose-200 line-through">
                        {cm.wrongSentence}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-rose-200/50 dark:border-rose-900/40">
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 block">
                        ✅ الصياغة الصحيحة:
                      </span>
                      <p className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-200">
                        {cm.correctSentence}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                      💡 {cm.explanationAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTTOM FLOATING CTA */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white text-center space-y-4 shadow-2xl">
            <h4 className="text-xl font-black">هل أنت جاهز لتطبيق ما تعلمته في هذا الدرس؟</h4>
            <p className="text-xs text-purple-200 max-w-xl mx-auto leading-relaxed">
              اختر وضع التدريب الفوري للحصول على تقييم ذكي فوري بالروبوت التعليمي، أو خوض اختبار الدرس لقياس درجتك بدقة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onStartPractice}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-sky-500 hover:from-purple-400 hover:to-sky-400 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ابدأ التدريب التفاعلي الآن</span>
              </button>
              <button
                onClick={onStartExam}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>خوض اختبار الدرس الرسمي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
