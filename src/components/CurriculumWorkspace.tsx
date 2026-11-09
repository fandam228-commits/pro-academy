"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { VideoPlayer } from "@/components/VideoPlayer";
import { QuizPlayer } from "@/components/QuizPlayer";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Volume2,
  Award,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  BookMarked,
  Layers,
  HelpCircle,
  Lightbulb,
  FileCheck,
  Check,
  Star,
  Quote,
  Users,
  Compass,
  Trophy,
  Filter,
  RefreshCw,
  Clock,
  AlertTriangle,
  ExternalLink,
  Mic,
} from "lucide-react";

export const CurriculumWorkspace: React.FC<{
  initialGradeCode?: string;
  onOpenExam?: (exam: any) => void;
}> = ({ initialGradeCode = "sec_3", onOpenExam }) => {
  const { lang, user } = useApp();

  // State
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeCode, setSelectedGradeCode] = useState<string>(initialGradeCode);
  const [gradeData, setGradeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active view: 'main' (Curriculum Units) vs 'story' (Story Corner)
  const [curriculumTab, setCurriculumTab] = useState<"main" | "story">("main");

  // Selected Unit & Section
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [unitDetails, setUnitDetails] = useState<any>(null);
  const [activeUnitSectionType, setActiveUnitSectionType] = useState<"vocabulary" | "grammar" | "writing" | "mixed_review" | "comprehensive_test">("vocabulary");

  // Selected Story Chapter
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [chapterDetails, setChapterDetails] = useState<any>(null);

  // Audio pronunciation helper
  const speakWord = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fetch Grades List
  const fetchGrades = async () => {
    try {
      const res = await fetch("/api/curriculum");
      const json = await res.json();
      if (json.success && json.grades) {
        setGrades(json.grades);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Full Grade Tree
  const fetchGradeData = async (code: string) => {
    setLoading(true);
    try {
      const studentParam = user ? `&studentId=${user.id}` : "";
      const res = await fetch(`/api/curriculum?grade=${code}${studentParam}`);
      const json = await res.json();
      if (json.success) {
        setGradeData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific Unit with its sections
  const fetchUnit = async (uId: string) => {
    try {
      const studentParam = user ? `&studentId=${user.id}` : "";
      const res = await fetch(`/api/curriculum?unitId=${uId}${studentParam}`);
      const json = await res.json();
      if (json.success) {
        setUnitDetails(json);
        // Default to first section type
        if (json.sections && json.sections.length > 0) {
          setActiveUnitSectionType(json.sections[0].sectionType);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch specific Chapter
  const fetchChapter = async (cId: string) => {
    try {
      const studentParam = user ? `&studentId=${user.id}` : "";
      const res = await fetch(`/api/curriculum?chapterId=${cId}${studentParam}`);
      const json = await res.json();
      if (json.success) {
        setChapterDetails(json.chapter);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Completion
  const toggleItemCompletion = async (sectionId?: string, chapterId?: string, isCompleted: boolean = true) => {
    if (!user) return;
    try {
      await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_progress",
          studentId: user.id,
          gradeId: gradeData?.grade?.id,
          unitId: selectedUnitId,
          sectionId,
          chapterId,
          isCompleted,
        }),
      });

      // Refresh current data quietly
      fetchGradeData(selectedGradeCode);
      if (selectedUnitId) fetchUnit(selectedUnitId);
      if (selectedChapterId) fetchChapter(selectedChapterId);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGradeCode) {
      setSelectedUnitId(null);
      setSelectedChapterId(null);
      setUnitDetails(null);
      setChapterDetails(null);
      fetchGradeData(selectedGradeCode);
    }
  }, [selectedGradeCode]);

  useEffect(() => {
    if (selectedUnitId) {
      fetchUnit(selectedUnitId);
    }
  }, [selectedUnitId]);

  useEffect(() => {
    if (selectedChapterId) {
      fetchChapter(selectedChapterId);
    }
  }, [selectedChapterId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* =========================================================================
          TOP BANNER: BRANDING & OVERALL PROGRESS
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c071a] via-[#1b0d38] to-[#0d1629] p-6 sm:p-8 text-white shadow-2xl border border-purple-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-900/40 px-3.5 py-1.5 text-xs font-bold text-sky-200 backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ar" ? "نظام تنظيم المناهج الدراسية الذكي" : "Smart Curriculum Organization System"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              {lang === "ar" ? "المناهج الدراسية والقصة المقررة" : "Comprehensive Curriculum & Story Corner"}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              {lang === "ar"
                ? "تنظيم أكاديمي متكامل: 6 وحدات، مراجعتين شاملتين، وركن القصة المستقل لكل صف دراسي مع مستر حبيب الرحمن."
                : "Six core units, two comprehensive reviews, and dedicated Story Corner for every academic grade."}
            </p>
          </div>

          {/* OVERALL PROGRESS BADGE */}
          {gradeData?.progress && (
            <div className="bg-white/10 dark:bg-purple-950/60 border border-purple-400/30 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[200px] text-center backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-purple-200">
                  {lang === "ar" ? "إنجاز المنهج الدراسي" : "Curriculum Completion"}
                </span>
              </div>
              <span className="text-3xl font-black text-amber-300">
                {gradeData.progress.overallPercentage}%
              </span>
              <div className="w-full bg-white/20 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${gradeData.progress.overallPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-purple-200/70 mt-1">
                {gradeData.progress.completedItems} / {gradeData.progress.totalTrackableItems} {lang === "ar" ? "دروس مكتملة" : "lessons completed"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          GRADE SELECTOR CARDS (6 GRADES)
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{lang === "ar" ? "اختر الصف الدراسي" : "Select Academic Grade"}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {grades.length} {lang === "ar" ? "صفوف دراسية متاحة" : "Grades Available"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {grades.map((g) => {
            const isSelected = selectedGradeCode === g.code;
            const isBac = g.code === "sec_2_bac";
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGradeCode(g.code)}
                className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isBac
                      ? "bg-gradient-to-br from-amber-600 via-amber-700 to-indigo-950 border-amber-300 text-white shadow-xl shadow-amber-900/40 scale-[1.02]"
                      : "bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 border-purple-400 text-white shadow-xl shadow-purple-900/30 scale-[1.02]"
                    : "bg-white dark:bg-[#120a24] border-slate-200 dark:border-purple-950/60 hover:border-purple-400 text-slate-700 dark:text-slate-300 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-sky-200" : "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300"
                    }`}>
                      {g.stage}
                    </span>
                    {isBac && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                        Baccalaureate
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm mt-2 leading-snug line-clamp-2">
                    {lang === "ar" ? g.titleAr : g.titleEn}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 dark:border-purple-900/40 flex items-center justify-between text-[11px] font-bold">
                  <span>{isBac ? 10 : 6} {lang === "ar" ? "وحدات" : "Units"}</span>
                  <span className={isSelected ? "text-amber-300" : "text-purple-600 dark:text-sky-400"}>
                    {isBac ? 5 : (g.reviewsCount || 2)} {lang === "ar" ? "مراجعات" : "Revs"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* OFFICIAL VERIFICATION BANNER FOR BACCALAUREATE */}
      {selectedGradeCode === "sec_2_bac" && (
        <div className="bg-gradient-to-r from-[#1c1204] via-[#24133d] to-[#0c081f] border border-amber-400/40 rounded-3xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                Official MOE Curriculum 2026/2027
              </span>
              <span className="text-xs text-amber-200 font-bold">منهج البكالوريا المصرية الرسمي المعتمد</span>
            </div>
            <h3 className="font-black text-base sm:text-lg text-amber-100">
              Second Year Egyptian Baccalaureate – تانية بكالوريا
            </h3>
            <p className="text-xs text-slate-300">
              المقرر الرسمي: Part One (Units 1–5) + Part Two (Units 6–10) + 5 Consolidation Reviews + رواية The Lost World
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://ellibrary.moe.gov.eg/EgyptianBaccalaureate/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>بوابة البكالوريا الرسمية</span>
            </a>
            <a
              href="https://egyptianbaccalaureate.blob.core.windows.net/egyptianbaccalaureate/Eng-L1-EB-Part1.pdf"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-300" />
              <span>كتاب الطالب (Part 1 PDF)</span>
            </a>
            <a
              href="https://egyptianbaccalaureate.blob.core.windows.net/egyptianbaccalaureate/Story-En-EB-L1.pdf"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>كتاب القصة (Story PDF)</span>
            </a>
          </div>
        </div>
      )}

      {/* =========================================================================
          BRANCH SWITCHER TABS: MAIN CURRICULUM vs STORY CORNER
         ========================================================================= */}
      <div className="flex border-b border-slate-200 dark:border-purple-950/80 gap-2 sm:gap-4">
        <button
          onClick={() => {
            setCurriculumTab("main");
            setSelectedChapterId(null);
          }}
          className={`pb-3 px-4 font-black text-sm sm:text-base flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            curriculumTab === "main"
              ? "border-purple-600 text-purple-600 dark:text-sky-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>
            {lang === "ar"
              ? selectedGradeCode === "sec_2_bac"
                ? "المنهج الدراسي (10 وحدات + 5 مراجعات)"
                : "المنهج الأساسي (6 وحدات + مراجعتين)"
              : selectedGradeCode === "sec_2_bac"
              ? "Main Curriculum (10 Units & 5 Reviews)"
              : "Main Curriculum (6 Units & 2 Reviews)"}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 font-bold">
            {selectedGradeCode === "sec_2_bac"
              ? "10 وحدات + 5 مراجعات"
              : "6 وحدات + مراجعتين"}
          </span>
        </button>

        <button
          onClick={() => {
            setCurriculumTab("story");
            setSelectedUnitId(null);
          }}
          className={`pb-3 px-4 font-black text-sm sm:text-base flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            curriculumTab === "story"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BookMarked className="w-5 h-5 text-amber-500" />
          <span>{lang === "ar" ? "فرع القصة المقررة (Story Corner)" : "Story Corner"}</span>
          {gradeData?.storyCorner?.storyTitleEn && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold hidden sm:inline">
              {gradeData.storyCorner.storyTitleEn}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">{lang === "ar" ? "جاري تحميل محتوى الصف الدراسي..." : "Loading curriculum..."}</p>
        </div>
      ) : curriculumTab === "main" ? (
        
        /* =========================================================================
            TAB 1: MAIN CURRICULUM (6 UNITS + 2 REVIEWS)
           ========================================================================= */
        <div>
          {selectedUnitId && unitDetails ? (
            
            /* ==================== UNIT DETAIL VIEW ==================== */
            <div className="space-y-6">
              {/* BACK BUTTON */}
              <button
                onClick={() => {
                  setSelectedUnitId(null);
                  setUnitDetails(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{lang === "ar" ? "العودة لقائمة الوحدات" : "Back to Units List"}</span>
              </button>

              {/* UNIT HEADER */}
              <div className={`p-6 rounded-3xl border shadow-xl ${
                unitDetails.unit.type === "review"
                  ? "bg-gradient-to-r from-amber-950/40 via-[#1a0f38] to-purple-950/40 border-amber-500/40"
                  : "bg-white dark:bg-[#120a24] border-slate-200 dark:border-purple-950/60"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full ${
                      unitDetails.unit.type === "review"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-purple-600 text-white"
                    }`}>
                      {unitDetails.unit.type === "review" ? (lang === "ar" ? "مراجعة شاملة" : "Comprehensive Review") : `Unit ${unitDetails.unit.unitNumber}`}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black mt-2 text-slate-900 dark:text-white">
                      {lang === "ar" ? unitDetails.unit.titleAr : unitDetails.unit.titleEn}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                      {lang === "ar" ? unitDetails.unit.descriptionAr : unitDetails.unit.descriptionEn}
                    </p>
                  </div>

                  {/* SECTIONS COUNT */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-500">
                      {unitDetails.sections.length} {lang === "ar" ? "أقسام تعليمية" : "Subsections"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION TABS (Vocabulary, Grammar, Writing Skills) */}
              <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-purple-950/40 p-1.5 rounded-2xl border border-slate-200 dark:border-purple-900/40">
                {unitDetails.sections.map((sec: any) => {
                  const isActive = activeUnitSectionType === sec.sectionType;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveUnitSectionType(sec.sectionType)}
                      className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {sec.sectionType === "vocabulary" && <BookOpen className="w-4 h-4 text-purple-400" />}
                      {sec.sectionType === "grammar" && <Compass className="w-4 h-4 text-sky-400" />}
                      {sec.sectionType === "section_a" && <Layers className="w-4 h-4 text-indigo-400" />}
                      {sec.sectionType === "section_b" && <Lightbulb className="w-4 h-4 text-amber-400" />}
                      {sec.sectionType === "reading" && <BookMarked className="w-4 h-4 text-emerald-400" />}
                      {sec.sectionType === "listening" && <Volume2 className="w-4 h-4 text-blue-400" />}
                      {sec.sectionType === "speaking" && <Mic className="w-4 h-4 text-rose-400" />}
                      {sec.sectionType === "writing" && <FileText className="w-4 h-4 text-amber-300" />}
                      {sec.sectionType === "exercises" && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                      {sec.sectionType === "interactive_test" && <Trophy className="w-4 h-4 text-amber-400" />}
                      {sec.sectionType === "video_lessons" && <Play className="w-4 h-4 text-red-400 fill-current" />}
                      {sec.sectionType === "mixed_review" && <Sparkles className="w-4 h-4 text-amber-400" />}
                      {sec.sectionType === "comprehensive_test" && <Trophy className="w-4 h-4 text-amber-400" />}
                      <span>{lang === "ar" ? sec.titleAr : sec.titleEn}</span>
                      {sec.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {/* RENDER CURRENT SUBSECTION */}
              {(() => {
                const currentSec = unitDetails.sections.find((s: any) => s.sectionType === activeUnitSectionType) || unitDetails.sections[0];
                if (!currentSec) return null;

                const content = currentSec.contentData || {};

                return (
                  <div className="space-y-6">
                    {/* VIDEO OR PDF RESOURCE BAR */}
                    {(currentSec.videoUrl || currentSec.pdfUrl) && (
                      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-600/50 flex items-center justify-center">
                            <Play className="w-5 h-5 text-sky-300 fill-current" />
                          </div>
                          <div>
                            <p className="text-xs font-black">{lang === "ar" ? "شرح فيديو تفاعلي مع مستر حبيب الرحمن" : "Video Lecture with Mr. Habib El Rahman"}</p>
                            <p className="text-[11px] text-purple-200/70">{currentSec.videoDuration || "25 mins"} • {lang === "ar" ? "مشمول بحماية العلامة المائية الذكية" : "Anti-leak watermarked"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {currentSec.pdfUrl && (
                            <a
                              href={currentSec.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-sky-200 flex items-center gap-1.5 transition-all"
                            >
                              <FileText className="w-4 h-4" />
                              <span>{lang === "ar" ? "تحميل مذكرة الدرس (PDF)" : "Download Notes"}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUBSECTION 1: VOCABULARY */}
                    {currentSec.sectionType === "vocabulary" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <span>{lang === "ar" ? "كلمات ومصطلحات الوحدة المقررة" : "Target Vocabulary & Idioms"}</span>
                          </h3>
                          <span className="text-xs text-slate-500">
                            {content.words?.length || 0} {lang === "ar" ? "كلمات رئيسية" : "Core Words"}
                          </span>
                        </div>

                        {/* WORDS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(content.words || []).map((w: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-white dark:bg-[#120a24] p-5 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md hover:border-purple-500/50 transition-all space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-lg font-black text-purple-700 dark:text-sky-300">{w.word}</h4>
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                    {w.partOfSpeech}
                                  </span>
                                  <button
                                    onClick={() => speakWord(w.word)}
                                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 transition-colors"
                                    title="Listen pronunciation"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{w.arabicMeaning}</span>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                                "{w.definitionEn}"
                              </p>

                              {/* SYNONYMS & ANTONYMS */}
                              {w.synonyms && w.synonyms.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  <span className="font-bold text-slate-400">{lang === "ar" ? "المرادفات:" : "Synonyms:"}</span>
                                  {w.synonyms.map((s: string, sIdx: number) => (
                                    <span key={sIdx} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* COLLOCATIONS */}
                              {w.collocations && w.collocations.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  <span className="font-bold text-slate-400">{lang === "ar" ? "متلازمات لفظية:" : "Collocations:"}</span>
                                  {w.collocations.map((c: string, cIdx: number) => (
                                    <span key={cIdx} className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* EXAMPLES */}
                              {w.exampleSentences && w.exampleSentences.length > 0 && (
                                <div className="border-t border-slate-100 dark:border-purple-900/40 pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                  {w.exampleSentences.map((ex: string, eIdx: number) => (
                                    <p key={eIdx}>• {ex}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* INTERACTIVE VOCAB EXERCISES */}
                        {content.interactiveExercises && content.interactiveExercises.length > 0 && (
                          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-3xl p-6 space-y-4">
                            <h4 className="font-black text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>{lang === "ar" ? "تدريب سريع على كلمات الوحدة" : "Interactive Vocabulary Drills"}</span>
                            </h4>
                            <div className="space-y-3">
                              {content.interactiveExercises.map((ex: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-[#120a24] p-4 rounded-2xl border border-purple-100 dark:border-purple-900/50">
                                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mb-2">
                                    {idx + 1}. {ex.prompt}
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(ex.options || []).map((opt: string, optIdx: number) => (
                                      <button
                                        key={optIdx}
                                        onClick={() => {
                                          if (opt === ex.correctAnswer) {
                                            alert(lang === "ar" ? `✅ إجابة صحيحة ممتاز! ${ex.explanation}` : `✅ Correct! ${ex.explanation}`);
                                          } else {
                                            alert(lang === "ar" ? `❌ إجابة غير صحيحة، الإجابة الصحيحة هي: ${ex.correctAnswer}` : `❌ Incorrect! Correct answer is: ${ex.correctAnswer}`);
                                          }
                                        }}
                                        className="py-2 px-3 rounded-xl border border-slate-200 dark:border-purple-900 hover:bg-purple-600 hover:text-white text-xs font-bold transition-all text-center"
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBSECTION 2: GRAMMAR */}
                    {currentSec.sectionType === "grammar" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-3">
                          <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                            {lang === "ar" ? "شرح القاعدة الأساسية" : "Core Grammar Rule"}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">
                            {content.ruleTitleAr || currentSec.titleAr}
                          </h3>
                          <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                            {content.detailedExplanationAr}
                          </p>
                        </div>

                        {/* SENTENCE STRUCTURES */}
                        {content.sentenceStructures && content.sentenceStructures.length > 0 && (
                          <div className="bg-white dark:bg-[#120a24] p-6 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md space-y-4">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <Compass className="w-4 h-4 text-purple-600" />
                              <span>{lang === "ar" ? "تكوين الجمل والصيغ الرياضية للقاعدة" : "Sentence Formations & Formulas"}</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {content.sentenceStructures.map((st: any, sIdx: number) => (
                                <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-purple-950/30 border border-slate-200 dark:border-purple-900/40 space-y-1">
                                  <span className="text-xs font-black text-purple-600 dark:text-sky-300">{st.form}</span>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">{st.rule}</p>
                                  <p className="text-[11px] text-slate-500 italic mt-1">Ex: {st.example}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* COMMON MISTAKES TABLE */}
                        {content.commonMistakes && content.commonMistakes.length > 0 && (
                          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/40 rounded-3xl p-6 space-y-3">
                            <h4 className="font-black text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span>{lang === "ar" ? "أخطاء شائعة يقع فيها الطلاب في الامتحان" : "Common Examination Pitfalls"}</span>
                            </h4>
                            <div className="space-y-2">
                              {content.commonMistakes.map((cm: any, cmIdx: number) => (
                                <div key={cmIdx} className="bg-white dark:bg-[#120a24] p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <span className="text-rose-600 font-bold line-through">❌ {cm.incorrect}</span>
                                  <span className="text-emerald-600 font-bold">✅ {cm.correct}</span>
                                  <span className="text-slate-500 dark:text-slate-400">💡 {cm.why}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBSECTION 3: WRITING SKILLS */}
                    {currentSec.sectionType === "writing" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-2">
                          <span className="text-[11px] font-black uppercase text-sky-300">
                            {lang === "ar" ? "فنون الكتابة والتعبير" : "Writing & Composition"}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">
                            {content.titleAr || currentSec.titleAr}
                          </h3>
                        </div>

                        {/* TEMPLATES */}
                        {content.templates && content.templates.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">
                              {lang === "ar" ? "قوالب كتابة جاهزة ومطابقة لمواصفات الوزارة" : "Standard Writing Templates"}
                            </h4>
                            {content.templates.map((tpl: any, tIdx: number) => (
                              <div key={tIdx} className="bg-white dark:bg-[#120a24] p-5 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md space-y-3">
                                <h5 className="font-black text-xs text-purple-700 dark:text-sky-300">{tpl.title}</h5>
                                <div className="bg-slate-50 dark:bg-purple-950/30 p-4 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed border">
                                  {tpl.templateText}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBSECTION: SECTION A */}
                    {currentSec.sectionType === "section_a" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-2 border border-indigo-500/30">
                          <span className="text-[11px] font-black uppercase text-indigo-300">
                            Section A: Explorations & Context
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">{currentSec.titleAr}</h3>
                          {content.concept && (
                            <p className="text-xs text-indigo-200">
                              Core Concept: <span className="font-bold text-amber-300">{content.concept}</span> • {content.part || "Part One"}
                            </p>
                          )}
                        </div>
                        {content.explorationPassages && (
                          <div className="space-y-4">
                            {content.explorationPassages.map((p: any, pIdx: number) => (
                              <div key={pIdx} className="bg-white dark:bg-[#120a24] p-5 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md space-y-2">
                                <h4 className="font-black text-sm text-indigo-600 dark:text-sky-300">{p.subtitle}</h4>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{p.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBSECTION: SECTION B */}
                    {currentSec.sectionType === "section_b" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-[#120a24] text-white rounded-3xl p-6 shadow-xl space-y-2 border border-amber-500/30">
                          <span className="text-[11px] font-black uppercase text-amber-400">
                            Section B: Critical Engagement & In-Use Language
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">{currentSec.titleAr}</h3>
                        </div>
                        {content.discussionPrompts && (
                          <div className="space-y-3">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span>{lang === "ar" ? "محاور التفكير والنقاش النقدي" : "Discussion Prompts"}</span>
                            </h4>
                            {content.discussionPrompts.map((dp: string, dpIdx: number) => (
                              <div key={dpIdx} className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-xs font-bold text-amber-900 dark:text-amber-200">
                                💬 {dp}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBSECTION: READING */}
                    {currentSec.sectionType === "reading" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-2 border border-emerald-500/30">
                          <span className="text-[11px] font-black uppercase text-emerald-400">
                            Reading Comprehension & Analysis
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">{content.passageTitle || currentSec.titleAr}</h3>
                          <span className="text-[11px] text-emerald-200 font-bold">{content.textType || "Authentic Text"}</span>
                        </div>
                        {content.passageContent && (
                          <div className="bg-white dark:bg-[#120a24] p-6 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md">
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                              {content.passageContent}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBSECTION: LISTENING */}
                    {currentSec.sectionType === "listening" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-2 border border-blue-500/30">
                          <span className="text-[11px] font-black uppercase text-blue-400">
                            Listening Skills & Audio Scripts
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">{currentSec.titleAr}</h3>
                        </div>
                        <div className="bg-white dark:bg-[#120a24] p-6 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md space-y-4">
                          <div className="flex items-center gap-3">
                            <Volume2 className="w-8 h-8 text-blue-500 animate-pulse" />
                            <div>
                              <p className="text-xs font-black">{content.audioModule || "Official Audio Drills"}</p>
                              <p className="text-[11px] text-slate-400">{content.audioDuration || "6 mins"}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-purple-950/30 p-4 rounded-2xl border">
                            {content.scriptSummary || "Listening comprehension script summary..."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SUBSECTION: SPEAKING */}
                    {currentSec.sectionType === "speaking" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-rose-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-2 border border-rose-500/30">
                          <span className="text-[11px] font-black uppercase text-rose-400">
                            Speaking & Academic Discussion
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">{currentSec.titleAr}</h3>
                        </div>
                        <div className="bg-white dark:bg-[#120a24] p-6 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md space-y-3">
                          <h4 className="font-black text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            <span>{lang === "ar" ? "نشاط المحادثة الثنائي" : "Paired Speaking Task"}</span>
                          </h4>
                          <p className="text-xs text-slate-700 dark:text-slate-300 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 font-bold">
                            {content.pairedSpeakingTask || "Paired debate topic"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SUBSECTION: EXERCISES */}
                    {currentSec.sectionType === "exercises" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-teal-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-2 border border-teal-500/30">
                          <span className="text-[11px] font-black uppercase text-teal-400">
                            Practice Drills & Applied Exercises
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">{currentSec.titleAr}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(content.exerciseSets || []).map((es: any, esIdx: number) => (
                            <div key={esIdx} className="bg-white dark:bg-[#120a24] p-5 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md space-y-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">Set {esIdx + 1}</span>
                              <h4 className="font-black text-sm text-slate-900 dark:text-white">{es.category}</h4>
                              <p className="text-xs text-slate-500">{es.focus}</p>
                              <p className="text-xs font-bold text-teal-500">{es.totalQuestions} Questions Available</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUBSECTION: INTERACTIVE TEST */}
                    {currentSec.sectionType === "interactive_test" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                          <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-950 text-amber-300">
                            Unit Interactive Assessment
                          </span>
                          <h3 className="text-xl sm:text-3xl font-black">{currentSec.titleAr}</h3>
                          <p className="text-xs font-bold opacity-90">
                            Duration: {content.durationMinutes || 30} mins • Pass: {content.passPercentage || 60}% • Total Points: {content.totalPoints || 50}
                          </p>
                          <button
                            onClick={() => {
                              alert(lang === "ar" ? "جاري تشغيل الامتحان التفاعلي للوحدة..." : "Starting unit interactive assessment...");
                            }}
                            className="px-6 py-3 rounded-2xl bg-slate-950 text-amber-300 font-black text-xs hover:bg-slate-900 transition-all cursor-pointer shadow-lg"
                          >
                            {lang === "ar" ? "بدء الامتحان التفاعلي الآن" : "Start Unit Assessment"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUBSECTION: VIDEO LESSONS */}
                    {currentSec.sectionType === "video_lessons" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-[#120a24] text-white rounded-3xl p-6 shadow-xl space-y-2 border border-red-500/30">
                          <span className="text-[11px] font-black uppercase text-red-400">
                            Video Lessons & Lectures
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black">{currentSec.titleAr}</h3>
                          <p className="text-xs text-slate-300">
                            المحاضر: <span className="font-bold text-amber-300">{content.instructor || "Mr. Habib El Rahman"}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* MARK COMPLETED ACTION BUTTON */}
                    <div className="pt-6 border-t border-slate-200 dark:border-purple-950/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {currentSec.isCompleted ? (lang === "ar" ? "✅ تم إنهاء هذا القسم بنجاح" : "✅ Completed") : (lang === "ar" ? "لم يكتمل بعد" : "Incomplete")}
                      </span>
                      <button
                        onClick={() => toggleItemCompletion(currentSec.id, undefined, !currentSec.isCompleted)}
                        className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                          currentSec.isCompleted
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                            : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {currentSec.isCompleted
                            ? (lang === "ar" ? "إلغاء علامة الإتمام" : "Mark Incomplete")
                            : (lang === "ar" ? "تسجيل إتمام القسم (+25 نقطة)" : "Mark Section Completed (+25 pts)")}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (

            /* ==================== UNITS & REVIEWS GRID ==================== */
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(gradeData?.mainCurriculum?.units || []).map((u: any) => {
                  const isReview = u.type === "review";
                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUnitId(u.id)}
                      className={`rounded-3xl border p-6 flex flex-col justify-between transition-all cursor-pointer group shadow-xl hover:shadow-2xl hover:scale-[1.01] ${
                        isReview
                          ? "bg-gradient-to-b from-[#1a1205] to-[#140b24] border-amber-400/60 hover:border-amber-400"
                          : "bg-white dark:bg-[#120a24] border-slate-200 dark:border-purple-950/60 hover:border-purple-500"
                      }`}
                    >
                      <div>
                        {/* BADGE */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${
                            isReview
                              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black"
                              : "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300"
                          }`}>
                            {isReview ? (lang === "ar" ? "⭐ مراجعة شاملة" : "⭐ Review") : `Unit ${u.unitNumber}`}
                          </span>

                          <span className="text-xs font-bold text-slate-400">
                            {u.completedSectionsCount || 0}/{u.sectionsCount || 3} {lang === "ar" ? "مكتمل" : "done"}
                          </span>
                        </div>

                        {/* TITLE */}
                        <h3 className={`font-black text-base transition-colors leading-snug ${
                          isReview
                            ? "text-amber-300 group-hover:text-amber-200"
                            : "text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-sky-400"
                        }`}>
                          {lang === "ar" ? u.titleAr : u.titleEn}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {lang === "ar" ? u.descriptionAr : u.descriptionEn}
                        </p>
                      </div>

                      {/* BOTTOM PROGRESS & ARROW */}
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-purple-900/40">
                        <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                          <span className={isReview ? "text-amber-400" : "text-purple-600 dark:text-sky-400"}>
                            {u.progressPercentage || 0}%
                          </span>
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 group-hover:translate-x-1 transition-transform">
                            <span>{lang === "ar" ? "عرض الدروس" : "Open Unit"}</span>
                            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-purple-950/60 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isReview ? "bg-amber-400" : "bg-gradient-to-r from-purple-500 to-sky-400"
                            }`}
                            style={{ width: `${u.progressPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (

        /* =========================================================================
            TAB 2: STORY CORNER (NOVEL & CHAPTERS)
           ========================================================================= */
        <div>
          {selectedChapterId && chapterDetails ? (
            
            /* ==================== CHAPTER DETAIL VIEW ==================== */
            <div className="space-y-6">
              {/* BACK BUTTON */}
              <button
                onClick={() => {
                  setSelectedChapterId(null);
                  setChapterDetails(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{lang === "ar" ? "العودة لقائمة فصول القصة" : "Back to Chapters"}</span>
              </button>

              {/* CHAPTER BANNER */}
              <div className="bg-gradient-to-r from-[#1c1204] via-[#24133d] to-[#0c081f] p-6 sm:p-8 rounded-3xl border border-amber-400/40 text-white shadow-xl space-y-3">
                <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950">
                  Chapter {chapterDetails.chapterNumber}
                </span>
                <h2 className="text-xl sm:text-3xl font-black">
                  {lang === "ar" ? chapterDetails.titleAr : chapterDetails.titleEn}
                </h2>
                <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed max-w-4xl">
                  {chapterDetails.explanation}
                </p>
              </div>

              {/* CHARACTERS GALLERY */}
              {chapterDetails.characters && chapterDetails.characters.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span>{lang === "ar" ? "شخصيات الفصل وأدوارهم" : "Key Characters & Personalities"}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {chapterDetails.characters.map((ch: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-[#120a24] p-4 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-md space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm text-purple-700 dark:text-sky-300">{ch.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400">{ch.role}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{ch.descriptionAr}</p>
                        {ch.traits && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {ch.traits.map((t: string, tIdx: number) => (
                              <span key={tIdx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAPTER LITERARY VOCABULARY */}
              {chapterDetails.vocabulary && chapterDetails.vocabulary.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    <span>{lang === "ar" ? "المفردات اللغوية المميزة للفصل" : "Chapter Literary Vocabulary"}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {chapterDetails.vocabulary.map((v: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-[#120a24] p-4 rounded-2xl border border-slate-200 dark:border-purple-950/60 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-purple-700 dark:text-sky-300">{v.word}</span>
                          <span className="text-[11px] font-bold text-amber-500">{v.meaningAr}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{v.definitionEn}</p>
                        {v.example && (
                          <p className="text-[10px] text-slate-400 italic mt-1">"{v.example}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAPTER MAIN EVENTS */}
              {chapterDetails.events && chapterDetails.events.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-sky-500" />
                    <span>{lang === "ar" ? "التسلسل الزمني وأحداث الفصل" : "Chronological Events & Plot Progression"}</span>
                  </h3>
                  <div className="space-y-2">
                    {chapterDetails.events.map((ev: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-[#120a24] p-4 rounded-2xl border border-slate-200 dark:border-purple-950/60 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-black flex items-center justify-center shrink-0">
                          {ev.order || idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{lang === "ar" ? ev.titleAr : ev.titleEn}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IMPORTANT QUOTES */}
              {chapterDetails.importantQuotes && chapterDetails.importantQuotes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Quote className="w-5 h-5 text-amber-500" />
                    <span>{lang === "ar" ? "أهم الاقتباسات وتحليلها في الامتحان" : "Critical Quotes & Context"}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chapterDetails.importantQuotes.map((q: any, idx: number) => (
                      <div key={idx} className="bg-gradient-to-br from-amber-50/60 to-purple-50/40 dark:from-amber-950/20 dark:to-purple-950/30 p-5 rounded-3xl border border-amber-300/40 shadow-md space-y-2">
                        <p className="text-sm font-black text-slate-900 dark:text-amber-200 italic font-serif">
                          "{q.quote}"
                        </p>
                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-amber-200/50 dark:border-amber-900/40">
                          <p><span className="font-bold text-purple-600">{lang === "ar" ? "القائل والمستمع:" : "Speaker/Listener:"}</span> {q.speaker} → {q.listener}</p>
                          <p><span className="font-bold text-purple-600">{lang === "ar" ? "الموقف:" : "Context:"}</span> {q.situation}</p>
                          <p><span className="font-bold text-purple-600">{lang === "ar" ? "الأهمية:" : "Significance:"}</span> {q.significance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUESTIONS & ANSWERS (CRITICAL THINKING) */}
              {chapterDetails.questionsAndAnswers && chapterDetails.questionsAndAnswers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-sky-500" />
                    <span>{lang === "ar" ? "أسئلة التفكير النقدي ونموذج الإجابة" : "Critical Thinking Q&A"}</span>
                  </h3>
                  <div className="space-y-3">
                    {chapterDetails.questionsAndAnswers.map((qa: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-[#120a24] p-5 rounded-2xl border border-slate-200 dark:border-purple-950/60 shadow-sm space-y-2">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-sky-300">
                          س{idx + 1}: {qa.question}
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-purple-950/30 p-3 rounded-xl border border-slate-100 dark:border-purple-900/40 leading-relaxed">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{lang === "ar" ? "الإجابة النموذجية:" : "Model Answer:"} </span>
                          {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAPTER MCQ QUESTIONS */}
              {chapterDetails.mcqQuestions && chapterDetails.mcqQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{lang === "ar" ? "اختبر فهمك للفصل (MCQ Test)" : "Chapter MCQ Practice"}</span>
                  </h3>
                  <div className="space-y-3">
                    {chapterDetails.mcqQuestions.map((mcq: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-[#120a24] p-5 rounded-2xl border border-slate-200 dark:border-purple-950/60 shadow-sm space-y-3">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {idx + 1}. {mcq.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(mcq.options || []).map((opt: string, optIdx: number) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (opt === mcq.correctAnswer) {
                                  alert(lang === "ar" ? `✅ إجابة صحيحة ممتاز! ${mcq.explanation}` : `✅ Correct! ${mcq.explanation}`);
                                } else {
                                  alert(lang === "ar" ? `❌ إجابة خاطئة. الإجابة الصحيحة هي: ${mcq.correctAnswer}` : `❌ Incorrect! Answer is: ${mcq.correctAnswer}`);
                                }
                              }}
                              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-purple-900 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-all text-start"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OPEN-ENDED QUESTIONS (Clean Teacher-Ready Placeholders - No Fake Content) */}
              {chapterDetails.openEndedQuestions && chapterDetails.openEndedQuestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <span>{lang === "ar" ? "الأسئلة المقالية المفتوحة (Open-ended Questions)" : "Open-ended Questions"}</span>
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                      جاهز لإدخال وتصحيح المعلم • لا إجابات مصطنعة
                    </span>
                  </div>
                  <div className="space-y-3">
                    {chapterDetails.openEndedQuestions.map((oq: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-[#120a24] p-5 rounded-2xl border border-slate-200 dark:border-purple-950/60 shadow-sm space-y-3">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-sky-300">
                          Q{idx + 1}: {oq.question}
                        </p>
                        <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs text-amber-200 space-y-1">
                          <span className="font-bold text-amber-300">{lang === "ar" ? "معيار الإجابة وملاحظات التقييم الأكاديمي:" : "Evaluation Guidelines:"}</span>
                          <p className="text-slate-300">{oq.sampleGuideline}</p>
                        </div>
                        <textarea
                          rows={3}
                          placeholder={lang === "ar" ? "مساحة إجابة الطالب (يتم تقييمها وتصحيحها بواسطة المعلم)..." : "Student response input..."}
                          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-900 text-xs font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CRITICAL THINKING QUESTIONS */}
              {chapterDetails.criticalThinkingQuestions && chapterDetails.criticalThinkingQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span>{lang === "ar" ? "أسئلة التفكير النقدي المعمق (Critical Thinking)" : "Critical Thinking Prompts"}</span>
                  </h3>
                  <div className="space-y-3">
                    {chapterDetails.criticalThinkingQuestions.map((ct: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-[#120a24] p-5 rounded-2xl border border-slate-200 dark:border-purple-950/60 shadow-sm space-y-2">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-amber-300">
                          Prompt {idx + 1}: {ct.question}
                        </p>
                        <p className="text-xs text-slate-400 italic">
                          Analytical Focus: {ct.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* JRE EDUCATIONAL ACTIVITIES */}
              {chapterDetails.jreActivities && chapterDetails.jreActivities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>{lang === "ar" ? "أنشطة الصحافة والمحاكاة (JRE Activities)" : "JRE Educational Activities"}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chapterDetails.jreActivities.map((act: any, idx: number) => (
                      <div key={idx} className="bg-gradient-to-br from-[#1c1204] via-[#24133d] to-[#0c081f] p-5 rounded-3xl border border-amber-400/30 text-white space-y-2 shadow-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">Activity {idx + 1}</span>
                          <h4 className="font-black text-sm text-amber-300">{act.title}</h4>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{act.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAPTER INTERACTIVE TEST BANNER */}
              {chapterDetails.interactiveTestQuizId && (
                <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 p-5 rounded-3xl text-slate-950 font-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 shrink-0" />
                    <div>
                      <h4 className="text-base font-black">{lang === "ar" ? "الامتحان التفاعلي لفصل القصة" : "Chapter Interactive Exam"}</h4>
                      <p className="text-xs opacity-90 font-bold">{lang === "ar" ? "اختبر استيعابك الكامل للأحداث والشخصيات والتفكير النقدي" : "Comprehensive assessment of chapter events and critical thinking"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      alert(lang === "ar" ? "جاري تجهيز الاختبار التفاعلي للفصل..." : "Starting chapter exam...");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-950 text-amber-300 font-black text-xs hover:bg-slate-900 transition-all cursor-pointer shadow-lg shrink-0"
                  >
                    {lang === "ar" ? "بدء الامتحان الآن" : "Start Exam"}
                  </button>
                </div>
              )}

              {/* MARK COMPLETED */}
              <div className="pt-6 border-t border-slate-200 dark:border-purple-950/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {chapterDetails.isCompleted ? (lang === "ar" ? "✅ تم إنهاء الفصل بنجاح" : "✅ Chapter Completed") : (lang === "ar" ? "لم يكتمل بعد" : "Incomplete")}
                </span>
                <button
                  onClick={() => toggleItemCompletion(undefined, chapterDetails.id, !chapterDetails.isCompleted)}
                  className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                    chapterDetails.isCompleted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                      : "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {chapterDetails.isCompleted
                      ? (lang === "ar" ? "إلغاء علامة إتمام الفصل" : "Mark Incomplete")
                      : (lang === "ar" ? "تسجيل إتمام الفصل بالكامل (+30 نقطة)" : "Mark Chapter Completed (+30 pts)")}
                  </span>
                </button>
              </div>
            </div>
          ) : (

            /* ==================== STORY OVERVIEW & CHAPTERS LIST ==================== */
            <div className="space-y-8">
              {/* STORY HERO CARD */}
              <div className="bg-gradient-to-r from-[#1c1103] via-[#210c3b] to-[#0c081a] p-6 sm:p-8 rounded-3xl border border-amber-400/40 text-white shadow-2xl flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-44 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/60">
                  <img
                    src={gradeData?.storyCorner?.storyCover || "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800"}
                    alt="Story cover"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 text-center md:text-start flex-1">
                  <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                    {lang === "ar" ? "الرواية والقصة الأدبية المقررة" : "Prescribed Literature"}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black">
                    {lang === "ar" ? gradeData?.storyCorner?.storyTitleAr : gradeData?.storyCorner?.storyTitleEn}
                  </h3>
                  <p className="text-xs font-bold text-purple-200">
                    {lang === "ar" ? "المؤلف:" : "Author:"} {gradeData?.storyCorner?.storyAuthor}
                  </p>
                  <p className="text-xs text-purple-200/80 leading-relaxed max-w-2xl">
                    {lang === "ar" ? gradeData?.storyCorner?.storyDescriptionAr : gradeData?.storyCorner?.storyDescriptionEn}
                  </p>
                </div>
              </div>

              {/* CHAPTERS GRID */}
              <div className="space-y-4">
                <h4 className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {lang === "ar" ? "فصول القصة" : "Story Chapters"} ({gradeData?.storyCorner?.chapters?.length || 0})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(gradeData?.storyCorner?.chapters || []).map((ch: any) => (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedChapterId(ch.id)}
                      className="bg-white dark:bg-[#120a24] p-6 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-lg hover:border-amber-400/80 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            Chapter {ch.chapterNumber}
                          </span>
                          {ch.isCompleted && (
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{lang === "ar" ? "مكتمل" : "Done"}</span>
                            </span>
                          )}
                        </div>

                        <h5 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                          {lang === "ar" ? ch.titleAr : ch.titleEn}
                        </h5>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                          {ch.explanation}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-purple-900/40 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                        <span>{lang === "ar" ? "فتح الفصل والشخصيات" : "Read Chapter"}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
