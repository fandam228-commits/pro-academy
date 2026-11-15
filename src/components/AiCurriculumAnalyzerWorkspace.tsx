"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Brain,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  HelpCircle,
  Check,
  X,
  Edit2,
  Trash2,
  Send,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye,
  Award,
  Clock,
  Settings,
  ListChecks,
  Compass,
} from "lucide-react";

interface DetectedUnit {
  unitNumber: number;
  titleEn: string;
  titleAr: string;
  startPage: number;
  endPage: number;
  sections: Array<{
    type: string;
    title: string;
    startPage: number;
    subLessons: string[];
  }>;
  lessons: string[];
  vocabularyWords: string[];
  grammarTopics: string[];
}

interface AnalyzedQuestion {
  id: string;
  sourceType: "original_extracted" | "ai_generated";
  pageNumber: number;
  unitNumber: number;
  unitTitle: string;
  lessonTitle: string;
  sectionType: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sourceReference: string;
  approvalStatus: "pending" | "approved" | "rejected" | "modified";
  isPublished: boolean;
}

interface AssembledQuiz {
  id: string;
  quizType: "lesson_quiz" | "unit_exam" | "tri_unit_review" | "final_exam";
  titleAr: string;
  titleEn: string;
  unitNumber?: number;
  unitsCovered: number[];
  lessonTitle?: string;
  questionIds: string[];
  durationMinutes: number;
  passPercentage: number;
  totalPoints: number;
  approvalStatus: string;
  isPublished: boolean;
}

interface AnalysisSummary {
  totalUnits: number;
  totalLessons: number;
  totalOriginalQuestions: number;
  totalAiQuestions: number;
  totalQuizzes: number;
  errorsCount: number;
  warnings: string[];
  processingTimeMs: number;
}

export const AiCurriculumAnalyzerWorkspace: React.FC = () => {
  // Input & Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const [gradeCode, setGradeCode] = useState("sec_3");
  const [term, setTerm] = useState("First");
  const [questionsPerLesson, setQuestionsPerLesson] = useState(20);

  // Analysis Lifecycle State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeStepText, setActiveStepText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Results State
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [units, setUnits] = useState<DetectedUnit[]>([]);
  const [questions, setQuestions] = useState<AnalyzedQuestion[]>([]);
  const [quizzes, setQuizzes] = useState<AssembledQuiz[]>([]);

  // Filtering & Review State
  const [activeTab, setActiveTab] = useState<"summary" | "curriculum" | "questions" | "quizzes">("summary");
  const [sourceFilter, setSourceFilter] = useState<"all" | "original_extracted" | "ai_generated">("all");
  const [unitFilter, setUnitFilter] = useState<number | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Editing Modal State
  const [editingQuestion, setEditingQuestion] = useState<AnalyzedQuestion | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Handle document submission & analysis
  const handleStartAnalysis = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (inputMode === "file" && !selectedFile) {
      setErrorMsg("يرجى اختيار ملف المذكرة (PDF أو Word أو TXT) للبدء في التحليل.");
      return;
    }
    if (inputMode === "paste" && pasteText.trim().length < 50) {
      setErrorMsg("يرجى لصق محتوى المذكرة كاملاً (50 حرفاً على الأقل).");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setActiveStepText("قراءة وفك تشفير صفحات المذكرة...");

    try {
      let res: Response;

      if (inputMode === "file" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("gradeCode", gradeCode);
        formData.append("term", term);
        formData.append("questionsPerLesson", String(questionsPerLesson));

        setAnalysisProgress(40);
        setActiveStepText("اكتشاف الوحدات والدروس وتقسيم Vocabulary و Grammar...");

        res = await fetch("/api/curriculum-analyzer", {
          method: "POST",
          body: formData,
        });
      } else {
        setAnalysisProgress(40);
        setActiveStepText("تحليل النص واكتشاف الدروس والأسئلة الأصلية...");

        res = await fetch("/api/curriculum-analyzer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: pasteText,
            fileName: "Pasted_Curriculum_Memo.txt",
            gradeCode,
            term,
            questionsPerLesson,
          }),
        });
      }

      setAnalysisProgress(80);
      setActiveStepText("توليد أسئلة MCQ تربوية وتجميع الاختبارات التفاعلية...");

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل تحليل المذكرة");
      }

      setAnalysisProgress(100);
      setActiveStepText("اكتمل التحليل بنجاح!");
      setCurrentJobId(data.jobId);
      setSummary(data.summary);
      setUnits(data.units || []);

      // Fetch questions and quizzes for this job
      await loadJobDetails(data.jobId);
      setSuccessMsg("تم تحليل المذكرة واستخراج المحتوى والأسئلة وتجميع الاختبارات بنجاح!");
      setActiveTab("summary");
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع أثناء معالجة الملف.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadJobDetails = async (jobId: string) => {
    try {
      const res = await fetch(`/api/curriculum-analyzer/${jobId}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
        setQuizzes(data.quizzes || []);
        if (data.job?.checkpointData?.units) {
          setUnits(data.job.checkpointData.units);
        }
        if (data.job?.summaryReport) {
          setSummary(data.job.summaryReport);
        }
      }
    } catch (err) {
      console.error("Failed to load job details:", err);
    }
  };

  // Approval actions
  const handleApproveAll = async () => {
    if (!currentJobId) return;
    try {
      const res = await fetch(`/api/curriculum-analyzer/${currentJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all" }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.map((q) => ({ ...q, approvalStatus: "approved" })));
        setQuizzes((prev) => prev.map((qz) => ({ ...qz, approvalStatus: "approved" })));
        setSuccessMsg("تم اعتماد جميع الأسئلة والاختبارات بنجاح!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل اعتماد الأسئلة");
    }
  };

  const handleUpdateQuestionStatus = async (qId: string, status: "approved" | "rejected") => {
    if (!currentJobId) return;
    try {
      const res = await fetch(`/api/curriculum-analyzer/${currentJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: qId,
          updates: { approvalStatus: status },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === qId ? { ...q, approvalStatus: status } : q))
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل تحديث حالة السؤال");
    }
  };

  const handleSaveQuestionEdit = async () => {
    if (!currentJobId || !editingQuestion) return;
    try {
      const res = await fetch(`/api/curriculum-analyzer/${currentJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: editingQuestion.id,
          updates: {
            questionText: editingQuestion.questionText,
            correctAnswer: editingQuestion.correctAnswer,
            explanation: editingQuestion.explanation,
            difficulty: editingQuestion.difficulty,
            options: editingQuestion.options,
            approvalStatus: "approved",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingQuestion.id ? { ...editingQuestion, approvalStatus: "approved" } : q))
        );
        setEditingQuestion(null);
        setSuccessMsg("تم حفظ التعديلات واعتماد السؤال!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل حفظ التعديل");
    }
  };

  // Publish to Live Platform
  const handlePublishToLive = async () => {
    if (!currentJobId) return;
    setIsPublishing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/curriculum-analyzer/${currentJobId}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل نشر الأسئلة للطلاب");
      }

      setSuccessMsg(data.message);
      await loadJobDetails(currentJobId);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء النشر المباشر");
    } finally {
      setIsPublishing(false);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (sourceFilter !== "all" && q.sourceType !== sourceFilter) return false;
    if (unitFilter !== "all" && q.unitNumber !== unitFilter) return false;
    if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
    if (statusFilter !== "all" && q.approvalStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-sky-950 text-white border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Brain className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-black">AI Full Curriculum Analyzer — محلل المناهج الذكي</h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/30 text-purple-200 border border-purple-400/30">
                إصدار 2026/2027
              </span>
            </div>
            <p className="text-sm text-purple-200/90 font-medium max-w-3xl leading-relaxed">
              ارفع مذكرة المنهج كاملة (PDF أو Word). يقوم النظام تلقائياً باستخراج الوحدات والدروس، وتصنيف
              المفردات والقواعد والقراءة والكتابة، واستخراج الأسئلة الأصلية نصاً، وتوليد أسئلة MCQ تربوية متدرجة
              مع اختبارات تفاعلية ومراجعات تراكمية — تحت إشراف واعتماد المدرس بالكامل.
            </p>
          </div>

          {currentJobId && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePublishToLive}
                disabled={isPublishing}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isPublishing ? "جارٍ النشر للطلاب..." : "نشر الأسئلة المعتمدة للطلاب"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ALERTS */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-bold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* INPUT / UPLOAD CARD */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/20 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Upload className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white">1. رفع مذكرة المنهج وضبط إعدادات التحليل</h2>
          </div>

          <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setInputMode("file")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                inputMode === "file"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              رفع ملف (PDF / Word)
            </button>
            <button
              onClick={() => setInputMode("paste")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                inputMode === "paste"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              لصق نص المذكرة
            </button>
          </div>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">الصف الدراسي المستهدف</label>
            <select
              value={gradeCode}
              onChange={(e) => setGradeCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="sec_3">الصف الثالث الثانوي (الشهادة الثانوية العامة)</option>
              <option value="sec_2_bac">تانية بكالوريا (Egyptian Baccalaureate 2026/2027)</option>
              <option value="sec_2">الصف الثاني الثانوي</option>
              <option value="sec_1">الصف الأول الثانوي</option>
              <option value="prep_3">الصف الثالث الإعدادي</option>
              <option value="prep_2">الصف الثاني الإعدادي</option>
              <option value="prep_1">الصف الأول الإعدادي</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">الفصل الدراسي</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="First">الفصل الدراسي الأول (Term 1)</option>
              <option value="Second">الفصل الدراسي الثاني (Term 2)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">
              عدد الأسئلة المولدة لكل درس (الافتراضي 20)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={50}
                value={questionsPerLesson}
                onChange={(e) => setQuestionsPerLesson(parseInt(e.target.value, 10) || 20)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-purple-500 text-center"
              />
              <span className="text-xs font-bold text-purple-300 shrink-0">سؤال / درس</span>
            </div>
          </div>
        </div>

        {/* INPUT UPLOAD AREA */}
        {inputMode === "file" ? (
          <div className="border-2 border-dashed border-purple-500/30 rounded-3xl p-8 text-center bg-purple-950/10 hover:bg-purple-950/20 transition-all">
            <input
              type="file"
              id="curriculum-file-input"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="curriculum-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shadow-lg">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-black text-white">
                  {selectedFile ? selectedFile.name : "اضغط لاختيار ملف المذكرة أو اسحبه هنا"}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  يدعم ملفات PDF وملفات Word (.docx) والمستندات النصية (حتى 50 ميجابايت)
                </p>
              </div>
              {selectedFile && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  تم تحديد الملف: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              )}
            </label>
          </div>
        ) : (
          <div>
            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="الصق نصوص المذكرة هنا كاملة... (يمكنك نسخ الفهرس، والكلمات، والقواعد، والتمارين، والأسئلة الأصلية)"
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* PROGRESS STEPPER (IF RUNNING) */}
        {isAnalyzing && (
          <div className="p-4 rounded-2xl bg-purple-900/30 border border-purple-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-200">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>{activeStepText}</span>
              </span>
              <span>{analysisProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-sky-400 transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* START BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-extrabold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isAnalyzing ? "جارٍ تحليل المذكرة..." : "بدء التحليل الشامل واستخراج المحتوى"}</span>
          </button>
        </div>
      </div>

      {/* RESULTS WORKSPACE (TABS) */}
      {summary && (
        <div className="space-y-6">
          {/* NAVIGATION TABS */}
          <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-purple-500/20 shadow-md overflow-x-auto">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
                activeTab === "summary"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>تقرير التحليل الإحصائي ({summary.totalUnits} وحدات)</span>
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
                activeTab === "curriculum"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>هيكل المنهج والدروس المكتشفة ({summary.totalLessons} درس)</span>
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
                activeTab === "questions"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>
                بنك الأسئلة والاعتماد ({summary.totalOriginalQuestions + summary.totalAiQuestions} سؤال)
              </span>
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
                activeTab === "quizzes"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>الاختبارات والمراجعات التراكمية ({summary.totalQuizzes} اختبار)</span>
            </button>
          </div>

          {/* TAB 1: SUMMARY REPORT */}
          {activeTab === "summary" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
                  <span className="text-xs font-bold text-slate-400 block mb-1">عدد الوحدات المكتشفة</span>
                  <span className="text-3xl font-black text-purple-400">{summary.totalUnits}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">تطابق المذكرة دون افتراض</span>
                </div>
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
                  <span className="text-xs font-bold text-slate-400 block mb-1">الدروس الفرعية</span>
                  <span className="text-3xl font-black text-sky-400">{summary.totalLessons}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Vocab, Grammar, Reading, Writing</span>
                </div>
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
                  <span className="text-xs font-bold text-slate-400 block mb-1">أسئلة المذكرة الأصلية</span>
                  <span className="text-3xl font-black text-emerald-400">{summary.totalOriginalQuestions}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">مستخرجة نصاً دون تغيير</span>
                </div>
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
                  <span className="text-xs font-bold text-slate-400 block mb-1">أسئلة MCQ المولدة</span>
                  <span className="text-3xl font-black text-amber-400">{summary.totalAiQuestions}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Easy / Medium / Hard</span>
                </div>
              </div>

              {/* REPORT DETAILS CARD */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/20 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-purple-400" />
                  <span>تقرير التحقق والاعتماد التربوي</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <span className="font-bold text-purple-300 block">ضوابط السلامة الأكاديمية:</span>
                    <ul className="space-y-1.5 text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>عزل الأسئلة الأصلية عن الأسئلة المولدة بالذكاء الاصطناعي.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>منع نشر أي سؤال قبل موافقة واعتماد المدرس.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>توفير تعليل وتفسير تعليمي لكل سؤال لتغذية راجعة فورية.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>فحص التكرار (Deduplication) لضمان عدم وجود أسئلة متطابقة.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <span className="font-bold text-sky-300 block">إحصاءات زمن المعالجة:</span>
                    <p className="text-slate-300">
                      استغرق التحليل الشامل للمذكرة:{" "}
                      <span className="text-amber-300 font-bold">
                        {(summary.processingTimeMs / 1000).toFixed(1)} ثانية
                      </span>
                    </p>
                    <p className="text-slate-400">
                      تم حفظ حالة التحليل بالكامل في قاعدة البيانات، ويمكنك العودة إليها في أي وقت أو
                      استكمالها دون إعادة فحص الملف.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRICULUM TREE */}
          {activeTab === "curriculum" && (
            <div className="space-y-4">
              {units.map((unit) => (
                <div
                  key={unit.unitNumber}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-black text-amber-400">الوحدة {unit.unitNumber}</span>
                      <h3 className="text-lg font-black text-white">{unit.titleAr}</h3>
                      <p className="text-xs text-slate-400 font-mono">{unit.titleEn}</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      الصفحات: {unit.startPage} — {unit.endPage}
                    </span>
                  </div>

                  {/* SECTIONS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {unit.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-1.5"
                      >
                        <span className="text-xs font-black text-purple-300 block">{sec.title}</span>
                        <span className="text-[11px] text-slate-400 block font-medium">
                          بداية من صفحة {sec.startPage}
                        </span>
                        {sec.subLessons && sec.subLessons.length > 0 && (
                          <div className="pt-1 border-t border-slate-700/40 text-[10px] text-slate-300">
                            {sec.subLessons.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* EXTRACTED VOCABULARY & GRAMMAR TAGS */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {unit.vocabularyWords.slice(0, 8).map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        {word}
                      </span>
                    ))}
                    {unit.grammarTopics.slice(0, 4).map((topic, gIdx) => (
                      <span
                        key={gIdx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: QUESTIONS & APPROVAL HUB */}
          {activeTab === "questions" && (
            <div className="space-y-4">
              {/* FILTERS & ACTION BAR */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>تصفية:</span>
                  </span>

                  {/* SOURCE FILTER */}
                  <select
                    value={sourceFilter}
                    onChange={(e: any) => setSourceFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value="all">كل المصادر ({questions.length})</option>
                    <option value="original_extracted">
                      الأسئلة الأصلية ({questions.filter((q) => q.sourceType === "original_extracted").length})
                    </option>
                    <option value="ai_generated">
                      المولدة بالذكاء الاصطناعي ({questions.filter((q) => q.sourceType === "ai_generated").length})
                    </option>
                  </select>

                  {/* UNIT FILTER */}
                  <select
                    value={unitFilter}
                    onChange={(e: any) =>
                      setUnitFilter(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value="all">كل الوحدات</option>
                    {units.map((u) => (
                      <option key={u.unitNumber} value={u.unitNumber}>
                        الوحدة {u.unitNumber}
                      </option>
                    ))}
                  </select>

                  {/* DIFFICULTY FILTER */}
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value="all">كل المستويات</option>
                    <option value="Easy">Easy (سهل)</option>
                    <option value="Medium">Medium (متوسط)</option>
                    <option value="Hard">Hard (صعب / مصايد)</option>
                  </select>

                  {/* STATUS FILTER */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="pending">قيد الانتظار (Pending)</option>
                    <option value="approved">معتمد (Approved)</option>
                    <option value="rejected">مرفوض (Rejected)</option>
                  </select>
                </div>

                {/* BATCH APPROVE BUTTON */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApproveAll}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>اعتماد الكل ({filteredQuestions.length})</span>
                  </button>
                </div>
              </div>

              {/* QUESTIONS LIST */}
              <div className="space-y-3">
                {filteredQuestions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className={`p-5 rounded-3xl bg-slate-900 border transition-all ${
                      q.approvalStatus === "approved"
                        ? "border-emerald-500/30"
                        : q.approvalStatus === "rejected"
                        ? "border-red-500/20 opacity-60"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-400">#{qIndex + 1}</span>
                        {q.sourceType === "original_extracted" ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            مستخرج أصلي من المذكرة (ص {q.pageNumber})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            مولد بالذكاء الاصطناعي
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black ${
                            q.difficulty === "Hard"
                              ? "bg-rose-500/20 text-rose-300"
                              : q.difficulty === "Medium"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {q.difficulty}
                        </span>

                        <span className="text-xs text-slate-400">
                          {q.unitTitle} • {q.lessonTitle} • {q.sectionType}
                        </span>
                      </div>

                      {/* APPROVAL STATUS BADGE & BUTTONS */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateQuestionStatus(q.id, "approved")}
                          className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            q.approvalStatus === "approved"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-emerald-400"
                          }`}
                          title="اعتماد"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateQuestionStatus(q.id, "rejected")}
                          className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            q.approvalStatus === "rejected"
                              ? "bg-red-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-red-400"
                          }`}
                          title="رفض"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-purple-300 cursor-pointer"
                          title="تعديل السؤال"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* QUESTION TEXT */}
                    <p className="text-sm font-bold text-white mb-3 leading-relaxed" dir="ltr">
                      {q.questionText}
                    </p>

                    {/* OPTIONS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3" dir="ltr">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = opt.trim() === q.correctAnswer.trim();
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
                              isCorrect
                                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-bold"
                                : "bg-slate-800/50 border-slate-700/60 text-slate-300"
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </span>
                            {isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* EDUCATIONAL EXPLANATION */}
                    {q.explanation && (
                      <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs text-purple-200/90 leading-relaxed">
                        <span className="font-bold text-amber-300 block mb-1">
                          💡 التفسير والتعليل التربوي:
                        </span>
                        <p className="whitespace-pre-line">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ASSEMBLED QUIZZES */}
          {activeTab === "quizzes" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((qz) => (
                  <div
                    key={qz.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            qz.quizType === "final_exam"
                              ? "bg-rose-500/20 text-rose-300"
                              : qz.quizType === "tri_unit_review"
                              ? "bg-amber-500/20 text-amber-300"
                              : qz.quizType === "unit_exam"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-sky-500/20 text-sky-300"
                          }`}
                        >
                          {qz.quizType.replace("_", " ")}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">{qz.titleAr}</h4>
                        <p className="text-xs text-slate-400 font-mono">{qz.titleEn}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-300 pt-2 border-t border-slate-800">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <HelpCircle className="w-4 h-4" />
                        <span>{qz.questionIds.length} سؤال</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-sky-300">
                        <Clock className="w-4 h-4" />
                        <span>{qz.durationMinutes} دقيقة</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-300">
                        <Award className="w-4 h-4" />
                        <span>نسبة النجاح {qz.passPercentage}%</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">تعديل بيانات السؤال واعتماده</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">نص السؤال</label>
              <textarea
                rows={3}
                value={editingQuestion.questionText}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">الإجابة الصحيحة</label>
                <input
                  type="text"
                  value={editingQuestion.correctAnswer}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">مستوى الصعوبة</label>
                <select
                  value={editingQuestion.difficulty}
                  onChange={(e: any) =>
                    setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="Easy">Easy (سهل)</option>
                  <option value="Medium">Medium (متوسط)</option>
                  <option value="Hard">Hard (صعب / تريكات)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                التفسير والشرح التربوي (Explanation)
              </label>
              <textarea
                rows={3}
                value={editingQuestion.explanation}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveQuestionEdit}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ واعتماد</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
