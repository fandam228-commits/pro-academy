"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Database,
  Search,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Shuffle,
  BarChart2,
  CheckCircle2,
  XCircle,
  BookOpen,
  Filter,
  Brain,
  Layers,
  Award,
  Clock,
  AlertTriangle,
  Upload,
  RefreshCw,
  Send,
  Play,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Trash2,
} from "lucide-react";
import { isOptionCorrect } from "@/lib/question-grading.mjs";
import { getCurriculumUnits } from "@/config/curriculum-2026";
import { parseQuestions } from "@/lib/question-importer";
import { AiCurriculumAnalyzerWorkspace } from "@/components/AiCurriculumAnalyzerWorkspace";

export const QuestionBankWorkspace: React.FC<{ onExamGenerated?: (exam: any) => void }> = ({ onExamGenerated }) => {
  const { lang, user } = useApp();
  const [questions, setQuestions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, vocabularyCount: 0, grammarCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filter state
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [curriculumFilter, setCurriculumFilter] = useState<string>("All");
  const [termFilter, setTermFilter] = useState<string>("All");
  const [unitFilter, setUnitFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [domainFilter, setDomainFilter] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [lessonFilter, setLessonFilter] = useState<string>("All");
  const [sectionFilter, setSectionFilter] = useState<string>("All");
  const [grammarTopicFilter, setGrammarTopicFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"bank" | "smart_generator" | "ai_generator" | "importer" | "curriculum_analyzer">("bank");

  // AI Generator state
  const [aiDomain, setAiDomain] = useState("Grammar");
  const [aiGrade, setAiGrade] = useState("Third Secondary (Baccalaureate)");
  const [aiGrammarTopic, setAiGrammarTopic] = useState("Conditionals");
  const [aiTopic, setAiTopic] = useState("Academic English");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultMsg, setAiResultMsg] = useState("");

  // Smart Exam Generator state
  const [examStage, setExamStage] = useState("Secondary");
  const [examGrade, setAiExamGrade] = useState("Third Secondary (Baccalaureate)");
  const [examCurriculum, setExamCurriculum] = useState("Baccalaureate");
  const [examTerm, setExamTerm] = useState("First");
  const [examUnit, setExamUnit] = useState("All");
  const [examCount, setExamCount] = useState(15);
  const [easyPercent, setEasyPercent] = useState(30);
  const [mediumPercent, setMediumPercent] = useState(50);
  const [hardPercent, setHardPercent] = useState(20);
  const [grammarRatio, setGrammarRatio] = useState(50);
  const [examGenerating, setExamGenerating] = useState(false);

  // Question Importer state
  const [importRawText, setImportRawText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "warning";
    message: string;
    count?: number;
    duplicates?: number;
    errors?: string[];
  } | null>(null);
  const [importStage, setImportStage] = useState("Secondary");
  const [importGrade, setImportGrade] = useState("Third Secondary (Baccalaureate)");
  const [importUnit, setImportUnit] = useState("Unit 1");
  const [importDifficulty, setImportDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [importDomain, setImportDomain] = useState<"Vocabulary" | "Grammar">("Vocabulary");

  // New Question Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQText, setNewQText] = useState("");
  const [newDomain, setNewDomain] = useState("Grammar");
  const [newDifficulty, setNewDifficulty] = useState("Medium");
  const [newGrammarTopic, setNewGrammarTopic] = useState("Tense");
  const [newCorrect, setNewCorrect] = useState("");
  const [newOption1, setNewOption1] = useState("");
  const [newOption2, setNewOption2] = useState("");
  const [newOption3, setNewOption3] = useState("");
  const [newOption4, setNewOption4] = useState("");
  const [addError, setAddError] = useState("");
  const [newStage, setNewStage] = useState("Preparatory");
  const [newGrade, setNewGrade] = useState("Third Prep");
  const [newCurriculum, setNewCurriculum] = useState("Ministry");
  const [newTerm, setNewTerm] = useState("First");
  const [newUnit, setNewUnit] = useState("Unit 1");
  const [newQuestionType, setNewQuestionType] = useState("mcq");
  const [newSource, setNewSource] = useState("Ministry Book");
  const [newLesson, setNewLesson] = useState("Lesson 1");
  const [newSection, setNewSection] = useState("");

  // Deep-link support: Grammar Library can open this workspace with an exact academic scope.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("stage")) setStageFilter(params.get("stage")!);
      if (params.get("grade")) setGradeFilter(params.get("grade")!);
      if (params.get("curriculum")) setCurriculumFilter(params.get("curriculum")!);
      if (params.get("term")) setTermFilter(params.get("term")!);
      if (params.get("unit")) setUnitFilter(params.get("unit")!);
      if (params.get("domainCategory")) setDomainFilter(params.get("domainCategory")!);
      if (params.get("questionType")) setTypeFilter(params.get("questionType")!);
      if (params.get("difficulty")) setDifficultyFilter(params.get("difficulty")!);
      if (params.get("source")) setSourceFilter(params.get("source")!);
      if (params.get("lesson")) setLessonFilter(params.get("lesson")!);
      if (params.get("section")) setSectionFilter(params.get("section")!);
      if (params.get("grammarTopic")) setGrammarTopicFilter(params.get("grammarTopic")!);
    } catch {}
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/question-bank", window.location.origin);
      if (stageFilter !== "All") url.searchParams.set("stage", stageFilter);
      if (gradeFilter !== "All") url.searchParams.set("grade", gradeFilter);
      if (curriculumFilter !== "All") url.searchParams.set("curriculum", curriculumFilter);
      if (termFilter !== "All") url.searchParams.set("term", termFilter);
      if (unitFilter !== "All") url.searchParams.set("unit", unitFilter);
      if (typeFilter !== "All") url.searchParams.set("questionType", typeFilter);
      if (domainFilter !== "All") url.searchParams.set("domainCategory", domainFilter);
      if (difficultyFilter !== "All") url.searchParams.set("difficulty", difficultyFilter);
      if (sourceFilter !== "All") url.searchParams.set("source", sourceFilter);
      if (lessonFilter !== "All") url.searchParams.set("lesson", lessonFilter);
      if (sectionFilter !== "All") url.searchParams.set("section", sectionFilter);
      if (grammarTopicFilter) url.searchParams.set("grammarTopic", grammarTopicFilter);
      url.searchParams.set("limit", "500");
      if (searchQuery) url.searchParams.set("search", searchQuery);

      const res = await fetch(url.toString());
      const json = await res.json();
      setQuestions(json.questions || []);
      setStats(json.stats || { total: 0, vocabularyCount: 0, grammarCount: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [stageFilter, gradeFilter, curriculumFilter, termFilter, unitFilter, typeFilter, domainFilter, difficultyFilter, sourceFilter, lessonFilter, sectionFilter, grammarTopicFilter, searchQuery]);

  const handleAiGenerate = async () => {
    setAiLoading(true);
    setAiResultMsg("");
    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ai_generate_questions",
          domain: aiDomain,
          grammarTopic: aiGrammarTopic,
          topic: aiTopic,
          difficulty: aiDifficulty,
          count: aiCount,
          stage: stageFilter === "All" ? "Secondary" : stageFilter,
          grade: gradeFilter === "All" ? aiGrade : gradeFilter,
          curriculum: curriculumFilter === "All" ? "Ministry" : curriculumFilter,
          term: termFilter === "All" ? "First" : termFilter,
          source: sourceFilter === "All" ? "AI Generated" : sourceFilter,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAiResultMsg(`🎉 Generated ${json.count} non-duplicate high-yield questions into Question Bank!`);
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSmartExam = async () => {
    setExamGenerating(true);
    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_smart_exam",
          studentId: user?.id || "usr_student_1",
          stage: examStage,
          grade: examGrade,
          curriculum: examCurriculum,
          term: examTerm,
          unit: examUnit === "All" ? undefined : examUnit,
          questionCount: examCount,
          easyPercent,
          mediumPercent,
          hardPercent,
          grammarRatio,
        }),
      });
      const json = await res.json();
      if (json.success && json.exam) {
        if (onExamGenerated) {
          onExamGenerated(json.exam);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExamGenerating(false);
    }
  };

  const handleAddQuestion = async () => {
    setAddError("");
    if (!newQText?.trim() || !newCorrect?.trim()) {
      setAddError(lang === "ar" ? "يرجى كتابة نص السؤال والإجابة الصحيحة." : "Please fill in question text and correct answer.");
      return;
    }

    const optionsList = [newOption1, newOption2, newOption3, newOption4].filter(Boolean);

    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_question",
          question: {
            domainCategory: newDomain,
            questionText: newQText,
            stage: newStage,
            grade: newGrade,
            curriculum: newCurriculum,
            term: newTerm,
            unit: newUnit,
            questionType: newQuestionType,
            source: newSource,
            lesson: newLesson,
            section: newSection || null,
            difficulty: newDifficulty,
            grammarTopic: newDomain === "Grammar" ? newGrammarTopic : null,
            topic: newDomain === "Grammar" ? newGrammarTopic : "Vocabulary Core",
            options: optionsList,
            correctAnswer: newCorrect,
          },
        }),
      });

      const json = await res.json();
      if (json.error) {
        setAddError(json.error);
      } else {
        setShowAddModal(false);
        setNewQText("");
        setNewCorrect("");
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadTemplate = (type: "pipe" | "csv" | "excel" | "word" | "five") => {
    setImportStatus(null);
    if (type === "pipe") {
      setImportRawText(
        "Hardly had he arrived | had he, did he, he had, has he | had he\n" +
        "No sooner had she started | than, when, that, then | than"
      );
    } else if (type === "excel") {
      setImportRawText(
        "What is the antonym of abundant?\tscarce\tplentiful\tample\thuge\tscarce\n" +
        "Which planet is closest to the sun?\tMercury\tVenus\tMars\tEarth\tMercury"
      );
    } else if (type === "csv") {
      setImportRawText(
        "\"The weather is nice\", sunny, rainy, cold, windy, sunny\n" +
        "\"He succeeded ______ his effort\", because of, despite, although, in spite of, because of"
      );
    } else if (type === "word") {
      setImportRawText(
        "1. Which planet is known as the Red Planet?\n" +
        "A) Venus\n" +
        "B) Mars\n" +
        "C) Jupiter\n" +
        "D) Saturn\n" +
        "Answer: B\n\n" +
        "2. What is the synonym of enormous?\n" +
        "A) tiny\n" +
        "B) huge\n" +
        "C) narrow\n" +
        "D) weak\n" +
        "Answer: huge"
      );
    } else if (type === "five") {
      setImportRawText(
        "Question 1: If he had trained hard, he ______ won. | would have, will have, had, has | would have\n" +
        "Question 2: She apologized ______ being late. | for, about, on, with | for\n" +
        "Question 3: By next month, they ______ the project. | will have finished, finished, finish, have finished | will have finished\n" +
        "Question 4: Neither the teacher nor the students ______ present. | were, was, is, be | were\n" +
        "Question 5: I wish I ______ that car yesterday. | had bought, bought, have bought, buy | had bought"
      );
    }
  };

  const handleImportText = async () => {
    setImportStatus(null);

    // 1. Validation: check empty input
    const cleanRaw = importRawText.trim();
    if (!cleanRaw) {
      setImportStatus({
        type: "error",
        message: lang === "ar"
          ? "حقل الأسئلة فارغ! يرجى إدخال أو لصق الأسئلة أولاً أو استخدام أحد النماذج التجريبية أدناه."
          : "The questions input is empty. Please paste your questions or click one of the quick templates below.",
      });
      return;
    }

    // 2. Authorization check: Require teacher or admin session
    const isTeacherOrAdmin = user && (user.role === "admin" || user.role === "teacher");
    if (!isTeacherOrAdmin) {
      setImportStatus({
        type: "error",
        message: lang === "ar"
          ? "تنبيه صلاحيات: استيراد وتعديل الأسئلة متاح فقط لحسابات المعلمين والمسؤولين. يرجى تسجيل الدخول بحساب معلم أو مسؤول أولاً."
          : "Permission Denied: Importing questions into the Question Bank requires a Teacher or Admin account. Please sign in first.",
      });
      return;
    }

    // 3. Multi-format parsing
    const parseResult = parseQuestions(cleanRaw, {
      stage: importStage,
      grade: importGrade,
      unit: importUnit,
      difficulty: importDifficulty,
      domainCategory: importDomain,
    });

    if (parseResult.items.length === 0) {
      setImportStatus({
        type: "error",
        message: lang === "ar"
          ? "تعذر التعرف على أي أسئلة صالحة من النص المدخل. يرجى مراجعة التنسيق (سؤال | خيارات | إجابة)."
          : "No valid questions could be detected. Please verify the format.",
        errors: parseResult.errors.length > 0 ? parseResult.errors : undefined,
      });
      return;
    }

    // 4. API Request with Loading feedback
    setImportLoading(true);
    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import_questions", items: parseResult.items }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setImportStatus({
          type: "success",
          message: json.message || (lang === "ar"
            ? `🎉 تم بنجاح استيراد وحفظ ${json.importedCount} سؤال جديد في بنك الأسئلة!`
            : `Successfully imported ${json.importedCount} questions!`),
          count: json.importedCount,
          duplicates: json.duplicateCount,
          errors: parseResult.errors.length > 0 ? parseResult.errors : undefined,
        });
        setImportRawText("");
        fetchQuestions();
      } else {
        setImportStatus({
          type: "error",
          message: json.error || (lang === "ar" ? "فشلت عملية الاستيراد من الخادم." : "Import failed on server."),
          errors: parseResult.errors.length > 0 ? parseResult.errors : undefined,
        });
      }
    } catch (e: any) {
      setImportStatus({
        type: "error",
        message: lang === "ar" ? `حدث خطأ في الاتصال بالخادم: ${e?.message || ""}` : `Network error: ${e?.message || ""}`,
      });
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-900 via-[#1e113a] to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-purple-950/40 border border-purple-500/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black">
              {lang === "ar" ? "بنك الأسئلة الذكي والإنشاء التلقائي" : "Intelligent Question Bank Engine"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-sky-200 mt-2 max-w-xl leading-relaxed">
            {lang === "ar"
              ? "إدارة أكثر من 100,000 سؤال مفهرس، توليد الامتحانات الذكية بدون تكرار الأسئلة، الكشف التلقائي عن التطابق، ومولد الذكاء الاصطناعي."
              : "High-scale indexed vocabulary & grammar repository, anti-repetition smart exam generator, and AI auto-item authoring."}
          </p>
        </div>

        {/* STATS BADGES */}
        <div className="flex gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-purple-400/20 shrink-0">
          <div className="text-center px-3">
            <span className="text-2xl font-black text-amber-300">{stats.total}</span>
            <span className="text-[10px] block opacity-80 uppercase">{lang === "ar" ? "إجمالي الأسئلة" : "Total Items"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-3">
            <span className="text-2xl font-black text-purple-300">{stats.grammarCount}</span>
            <span className="text-[10px] block opacity-80 uppercase">{lang === "ar" ? "بنك القواعد" : "Grammar"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-3">
            <span className="text-2xl font-black text-sky-300">{stats.vocabularyCount}</span>
            <span className="text-[10px] block opacity-80 uppercase">{lang === "ar" ? "بنك الكلمات" : "Vocabulary"}</span>
          </div>
        </div>
      </div>

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab("bank")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "bank" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Database className="w-4 h-4 text-purple-500" />
            <span>{lang === "ar" ? "تصفح بنك الأسئلة" : "Question Bank"}</span>
          </button>

          <button
            onClick={() => setActiveTab("smart_generator")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "smart_generator" ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Shuffle className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "مولد الامتحانات الذكي" : "Smart Exam Generator"}</span>
          </button>

          <button
            onClick={() => setActiveTab("ai_generator")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "ai_generator" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>{lang === "ar" ? "توليد بالذكاء الاصطناعي" : "AI Question Authoring"}</span>
          </button>

          <button
            onClick={() => setActiveTab("importer")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "importer" ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-md" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Upload className="w-4 h-4 text-sky-500" />
            <span>{lang === "ar" ? "استيراد CSV / Excel" : "Bulk Import"}</span>
          </button>

          <button
            onClick={() => setActiveTab("curriculum_analyzer")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "curriculum_analyzer"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-black"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Brain className="w-4 h-4 text-amber-400" />
            <span>{lang === "ar" ? "محلل المناهج والمذكرات AI" : "Curriculum Analyzer"}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-purple-950">PRO</span>
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === "ar" ? "إضافة سؤال يدوي" : "Add Question"}</span>
        </button>
      </div>

      {/* TAB 1: QUESTION BANK BROWSER & FILTER */}
      {activeTab === "bank" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 p-4 rounded-3xl border border-emerald-200 dark:border-emerald-900">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <strong className="text-sm text-slate-900 dark:text-white">التقسيم الأكاديمي المستقل</strong>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              إعدادي: Connect و Connect Plus منفصلان تمامًا • أولى ثانوي: Ministry و M High منفصلان •
              All My Sons يُصنّف داخل M High / Literature • تانية وثالثة ثانوي: Baccalaureate/Thanaweya Amma مع تحديد المصدر.
            </p>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ar" ? "بحث عن أي سؤال أو موضوع..." : "Search question text or topic..."}
                className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">المرحلة كلها</option><option value="Preparatory">إعدادي</option><option value="Secondary">ثانوي</option>
            </select>
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">الصف كله</option><option>First Prep</option><option>Second Prep</option><option>Third Prep</option><option>First Secondary</option><option>Second Secondary</option><option>Third Secondary (Baccalaureate)</option>
            </select>
            <select value={curriculumFilter} onChange={(e) => setCurriculumFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">كل المناهج</option>
              <option>Connect</option><option>Connect Plus</option>
              <option>Ministry</option><option>M High</option>
              <option>Baccalaureate</option><option>Thanaweya Amma</option>
            </select>
            <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">الترم كله</option><option>First</option><option>Second</option>
            </select>
            <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">كل الوحدات</option>
              {gradeFilter !== "All" ? (
                getCurriculumUnits(gradeFilter).map((u, i) => (
                  <option key={i} value={u.type === "review" ? `Review ${u.orderIndex === 4 ? 1 : 2}` : `Unit ${u.unitNumber}`}>
                    {u.type === "review" ? (lang === "ar" ? u.titleAr : u.titleEn) : `Unit ${u.unitNumber}: ${u.titleEn.replace(/^Unit \d+:\s*/, "")}`}
                  </option>
                ))
              ) : (
                <>
                  <option value="Units 1-2">مراجعة الوحدتين 1-2</option>
                  {Array.from({ length: 6 }, (_, i) => <option key={i}>Unit {i + 1}</option>)}
                  <option value="Review 1">Review 1 (Units 1-3)</option>
                  <option value="Review 2">Review 2 (Units 4-6)</option>
                </>
              )}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">كل أنواع السؤال</option><option value="mcq">MCQ</option><option value="fill_blank">Complete</option><option value="correction">Correct</option><option value="rewrite">Rewrite</option><option value="comprehension">Reading</option><option value="writing">Writing</option>
            </select>
            <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">كل الأقسام</option><option value="Grammar">Grammar</option><option value="Vocabulary">Vocabulary</option><option value="Reading">Reading</option><option value="Writing">Writing</option>
            </select>
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">كل الصعوبة</option><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option><option value="Tricky">Tricky</option>
            </select>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">كل المصادر</option><option>Ministry Book</option><option>External Source</option><option>Teacher Created</option><option>Revision</option><option>AI Generated</option>
            </select>
            <select value={lessonFilter} onChange={(e) => setLessonFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">كل الدروس</option>{Array.from({length:8},(_,i)=><option key={i}>Lesson {i+1}</option>)}<option>All My Sons</option>
            </select>
            <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white">
              <option value="All">كل الأقسام</option><option>Grammar</option><option>Vocabulary</option><option>Reading</option><option>Writing</option><option>Literature</option><option>Story</option>
            </select>
            <input value={grammarTopicFilter} onChange={(e) => setGrammarTopicFilter(e.target.value)} placeholder="قاعدة محددة..." className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white" />
          </div>

          {/* QUESTIONS LIST */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-500 font-medium">Loading indexed items...</div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-medium">No matching questions found in bank.</div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${q.domainCategory === "Grammar" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {q.domainCategory}
                      </span>
                      <span className="font-bold text-slate-500">{q.grade}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{q.curriculum || "Ministry"} · {q.term || "First"} · {q.unit || "Unit 1"} · {q.source || "Ministry Book"}{q.lesson ? ` · ${q.lesson}` : ""}{q.section ? ` · ${q.section}` : ""}</span>
                      {q.grammarTopic && <span className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">{q.grammarTopic}</span>}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-slate-400">
                      <span>Difficulty: <strong className="text-slate-700 dark:text-slate-300">{q.difficulty}</strong></span>
                      <span>Used: <strong className="text-blue-600">{q.timesUsed || 0}x</strong></span>
                    </div>
                    {(user?.role === "admin" || user?.role === "teacher") && (
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const next = window.prompt("Edit question text:", q.questionText);
                          if (next && next.trim() !== q.questionText) fetch("/api/question-bank",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"update_question",id:q.id,question:{questionText:next.trim()}})}).then(() => fetchQuestions());
                        }} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">تعديل</button>
                        <button onClick={() => {
                          if (window.confirm("حذف السؤال نهائياً؟")) fetch("/api/question-bank",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"delete_question",id:q.id})}).then(() => fetchQuestions());
                        }} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold">حذف</button>
                      </div>
                    )}
                  </div>

                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                    {idx + 1}. {q.questionText}
                  </p>

                  {/* OPTIONS LIST */}
                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {q.options.map((opt: string, i: number) => {
                        const optText = String(opt || "").trim();
                        const isAuthorized = user?.role === "admin" || user?.role === "teacher";
                        const isCorrect = isAuthorized && isOptionCorrect(optText, q.correctAnswer, q.questionType);
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-xl text-xs font-medium border ${
                              isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {optText} {isCorrect && "✓"}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SMART EXAM GENERATOR */}
      {activeTab === "smart_generator" && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <Shuffle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {lang === "ar" ? "إنشاء امتحان ذكي مخصص بدون تكرار" : "Anti-Repetition Smart Exam Generator"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === "ar"
                  ? "يضمن النظام عدم تكرار الأسئلة، خلط خيارات الإجابات، وموازنة القواعد والكلمات تلقائياً."
                  : "Generates fresh customized exams, shuffles answer order, and balances grammar/vocab ratios."}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block mb-1">Stage</label><select value={examStage} onChange={e=>setExamStage(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"><option>Preparatory</option><option>Secondary</option></select></div>
              <div>
                <label className="block mb-1">Grade</label>
                <select value={examGrade} onChange={e=>setAiExamGrade(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <option>First Prep</option>
                  <option>Second Prep</option>
                  <option>Third Prep</option>
                  <option>First Secondary</option>
                  <option>Second Secondary</option>
                  <option>Third Secondary (Baccalaureate)</option>
                </select>
              </div>
              <div><label className="block mb-1">Curriculum</label><select value={examCurriculum} onChange={e=>setExamCurriculum(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"><option>Connect</option><option>Connect Plus</option><option>Ministry</option><option>M High</option><option>Baccalaureate</option><option>Thanaweya Amma</option></select></div>
              <div><label className="block mb-1">Term</label><select value={examTerm} onChange={e=>setExamTerm(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"><option>First</option><option>Second</option></select></div>
              <div>
                <label className="block mb-1">Unit</label>
                <select value={examUnit} onChange={e=>setExamUnit(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white col-span-2">
                  <option>All</option>
                  <option>Units 1-3</option>
                  <option>Units 4-6</option>
                  {getCurriculumUnits(examGrade).map((u, i) => (
                    <option key={i} value={u.type === "review" ? `Review ${u.orderIndex === 4 ? 1 : 2}` : `Unit ${u.unitNumber}`}>
                      {u.type === "review" ? u.titleEn : `Unit ${u.unitNumber}: ${u.titleEn.replace(/^Unit \d+:\s*/, "")}`}
                    </option>
                  ))}
                  <option>Story Chapters</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Number of Questions ({examCount})</label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={examCount}
                  onChange={(e) => setExamCount(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-1">Grammar vs Vocab Mix ({grammarRatio}% Grammar)</label>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={grammarRatio}
                  onChange={(e) => setGrammarRatio(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateSmartExam}
              disabled={examGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              <span>{examGenerating ? "Building Fresh Exam..." : "Generate Unique Exam Now"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AI QUESTION AUTHORING */}
      {activeTab === "ai_generator" && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {lang === "ar" ? "توليد أسئلة غير محدودة بالذكاء الاصطناعي مع الكشف عن التكرار" : "AI Item Authoring & Duplicate Rejection"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === "ar"
                  ? "يولد أسئلة جديدة طبقاً لمعايير وزارة التربية والتعليم ويضمن عدم إدخال أسئلة مكررة."
                  : "Produces new curriculum questions and automatically checks for exact or near duplicate match."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div>
              <label className="block mb-1">Domain</label>
              <select
                value={aiDomain}
                onChange={(e) => setAiDomain(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Grammar">Grammar</option>
                <option value="Vocabulary">Vocabulary</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Difficulty</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {aiDomain === "Grammar" ? (
            <div>
              <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">Grammar Category</label>
              <select
                value={aiGrammarTopic}
                onChange={(e) => setAiGrammarTopic(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="Conditionals">Conditionals</option>
                <option value="Inversion Structures">Inversion Structures</option>
                <option value="Reported Speech">Reported Speech</option>
                <option value="Passive Voice">Passive Voice</option>
                <option value="Relative Clauses">Relative Clauses</option>
                <option value="Modal Verbs">Modal Verbs</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">Vocabulary Topic</label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. Media Piracy / Technology"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
          )}

          <button
            onClick={handleAiGenerate}
            disabled={aiLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-black text-xs shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aiLoading ? "Authoring & Checking Duplicates..." : "Author AI Questions Now"}</span>
          </button>

          {aiResultMsg && (
            <p className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold text-center border border-emerald-300">
              {aiResultMsg}
            </p>
          )}
        </div>
      )}

      {/* TAB 4: BULK IMPORTER */}
      {activeTab === "importer" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl mx-auto space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                <span>{lang === "ar" ? "استيراد أسئلة من CSV / Excel / Word" : "Bulk Questions Importer"}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === "ar"
                  ? "يدعم استيراد الأسئلة بعدة صيغ: الفاصل العمودي (|)، جداول الإكسل (Tab)، ملفات CSV، وصيغة أسئلة الوورد المرقمة (A/B/C/D)."
                  : "Supports Pipe (|), Excel (Tab), CSV commas, and multi-line Word exam question papers."}
              </p>
            </div>

            {/* Quick clean button */}
            {importRawText && (
              <button
                type="button"
                onClick={() => {
                  setImportRawText("");
                  setImportStatus(null);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 text-xs font-bold text-slate-600 dark:text-slate-400 transition-all self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "مسح الحقل" : "Clear"}</span>
              </button>
            )}
          </div>

          {/* Teacher/Admin Role Guard Notification */}
          {!user || (user.role !== "admin" && user.role !== "teacher") ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">
                  {lang === "ar" ? "تنبيه الصلاحيات (معلم / مسؤول)" : "Staff Permission Notice"}
                </p>
                <p className="mt-1 leading-relaxed text-amber-800 dark:text-amber-300">
                  {lang === "ar"
                    ? "أنت غير مسجل حالياً بحساب معلم أو مسؤول. يمكنك تجربة وتفقد الواجهة وتحميل النماذج، ولكن لحفظ الأسئلة في قاعدة البيانات يجب تسجيل الدخول بحساب المعلم (Sarah Ahmed أو Mr. Habib)."
                    : "You are not logged in with a teacher or admin session. To save questions directly to the database, please sign in with your staff account."}
                </p>
              </div>
            </div>
          ) : null}

          {/* TARGET METADATA SELECTORS */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {lang === "ar" ? "البيانات الأكاديمية المستهدفة للأسئلة المستوردة:" : "Target Academic Scope for Imported Questions:"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-bold">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">{lang === "ar" ? "المرحلة الدراسية" : "Stage"}</label>
                <select
                  value={importStage}
                  onChange={(e) => setImportStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Preparatory">{lang === "ar" ? "المرحلة الإعدادية" : "Preparatory"}</option>
                  <option value="Secondary">{lang === "ar" ? "المرحلة الثانوية" : "Secondary"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">{lang === "ar" ? "الصف الدراسي" : "Grade"}</label>
                <select
                  value={importGrade}
                  onChange={(e) => setImportGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Third Secondary (Baccalaureate)">Third Secondary (Baccalaureate)</option>
                  <option value="Second Year Egyptian Baccalaureate">Second Year Egyptian Baccalaureate 2026/2027</option>
                  <option value="Second Secondary">Second Secondary</option>
                  <option value="First Secondary">First Secondary</option>
                  <option value="Third Prep">Third Prep</option>
                  <option value="Second Prep">Second Prep</option>
                  <option value="First Prep">First Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">{lang === "ar" ? "الوحدة" : "Unit"}</label>
                <select
                  value={importUnit}
                  onChange={(e) => setImportUnit(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Unit 1">Unit 1</option>
                  <option value="Unit 2">Unit 2</option>
                  <option value="Unit 3">Unit 3</option>
                  <option value="Unit 4">Unit 4</option>
                  <option value="Unit 5">Unit 5</option>
                  <option value="Unit 6">Unit 6</option>
                  <option value="Review 1">Review 1</option>
                  <option value="Review 2">Review 2</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">{lang === "ar" ? "مستوى الصعوبة" : "Difficulty"}</label>
                <select
                  value={importDifficulty}
                  onChange={(e) => setImportDifficulty(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Easy">{lang === "ar" ? "سهل (Easy)" : "Easy"}</option>
                  <option value="Medium">{lang === "ar" ? "متوسط (Medium)" : "Medium"}</option>
                  <option value="Hard">{lang === "ar" ? "صعب وتحدي (Hard)" : "Hard"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* QUICK TEMPLATE PILLS */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === "ar" ? "نماذج اختبار سريعة للاستيراد:" : "Quick Test Templates:"}</span>
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => loadTemplate("pipe")}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-purple-700 dark:bg-slate-800 dark:hover:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
              >
                {lang === "ar" ? "نموذج 1: فاصل عمودي (Pipe |)" : "Template 1: Pipe (|)"}
              </button>
              <button
                type="button"
                onClick={() => loadTemplate("excel")}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-emerald-700 dark:bg-slate-800 dark:hover:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
              >
                {lang === "ar" ? "نموذج 2: جدول إكسل (Tab)" : "Template 2: Excel (Tab)"}
              </button>
              <button
                type="button"
                onClick={() => loadTemplate("word")}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-100 text-sky-700 dark:bg-slate-800 dark:hover:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
              >
                {lang === "ar" ? "نموذج 3: ملف وورد (Word Q&A)" : "Template 3: Word Exam"}
              </button>
              <button
                type="button"
                onClick={() => loadTemplate("five")}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-amber-700 dark:bg-slate-800 dark:hover:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer"
              >
                {lang === "ar" ? "نموذج 4: دفعة 5 أسئلة" : "Template 4: 5 Questions"}
              </button>
            </div>
          </div>

          {/* TEXTAREA INPUT */}
          <div>
            <textarea
              rows={8}
              value={importRawText}
              onChange={(e) => {
                setImportRawText(e.target.value);
                if (importStatus?.type === "error") setImportStatus(null);
              }}
              placeholder={
                lang === "ar"
                  ? "ألصق الأسئلة هنا بأي صيغة:\n• مثال Pipe: سؤال | خيار1, خيار2, خيار3, خيار4 | الإجابة الصحيحة\n• مثال Excel: انسخ من عمود السؤال والخيارات والإجابة والصق مباشرة\n• مثال Word:\n1. Question text here?\nA) Option 1\nB) Option 2\nAnswer: A"
                  : "Paste your questions here in any format (Pipe, Excel Tab, CSV, or Word Q&A)..."
              }
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all leading-relaxed"
            />
          </div>

          {/* MAIN IMPORT BUTTON */}
          <button
            type="button"
            onClick={handleImportText}
            disabled={importLoading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {importLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{lang === "ar" ? "جاري معالجة وفحص وحفظ الأسئلة..." : "Processing & Saving Questions..."}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{lang === "ar" ? "معالجة واستيراد الأسئلة" : "Process & Import Questions"}</span>
              </>
            )}
          </button>

          {/* FEEDBACK BANNER */}
          {importStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold space-y-2 transition-all ${
                importStatus.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                  : importStatus.type === "warning"
                  ? "bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                  : "bg-red-50 dark:bg-red-950/80 text-red-900 dark:text-red-200 border-red-300 dark:border-red-700"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {importStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-extrabold text-sm leading-snug">{importStatus.message}</p>

                  {/* Summary badges */}
                  {importStatus.count !== undefined && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                        {lang === "ar" ? `تم حفظ ${importStatus.count} سؤال جديد` : `Saved ${importStatus.count} new questions`}
                      </span>
                      {importStatus.duplicates ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                          {lang === "ar" ? `تم تخطي ${importStatus.duplicates} سؤال مكرر` : `Skipped ${importStatus.duplicates} duplicates`}
                        </span>
                      ) : null}
                    </div>
                  )}

                  {/* Line errors if any */}
                  {importStatus.errors && importStatus.errors.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-red-200 dark:border-red-800 text-[11px] font-normal space-y-1">
                      <p className="font-bold text-red-800 dark:text-red-300">
                        {lang === "ar" ? "تفاصيل الأسطر التي تم تخطيها:" : "Details of skipped lines:"}
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 max-h-36 overflow-y-auto">
                        {importStatus.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AI FULL CURRICULUM ANALYZER */}
      {activeTab === "curriculum_analyzer" && (
        <AiCurriculumAnalyzerWorkspace />
      )}

      {/* ADD QUESTION MANUAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Add Question to Bank</h3>
            {addError && <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded">{addError}</p>}

            <input
              type="text"
              placeholder="Question Text..."
              value={newQText}
              onChange={(e) => setNewQText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />

            <div className="grid grid-cols-2 gap-2">
              <select value={newStage} onChange={e=>setNewStage(e.target.value)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"><option>Preparatory</option><option>Secondary</option></select>
              <select value={newGrade} onChange={e=>setNewGrade(e.target.value)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"><option>First Prep</option><option>Second Prep</option><option>Third Prep</option><option>First Secondary</option><option>Second Secondary</option><option>Third Secondary (Baccalaureate)</option></select>
              <select value={newCurriculum} onChange={e=>setNewCurriculum(e.target.value)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"><option>Connect</option><option>Connect Plus</option><option>Ministry</option><option>M High</option><option>Baccalaureate</option><option>Thanaweya Amma</option></select>
              <select value={newTerm} onChange={e=>setNewTerm(e.target.value)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"><option>First</option><option>Second</option></select>
              <select value={newUnit} onChange={e=>setNewUnit(e.target.value)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                {getCurriculumUnits(newGrade).map((u, i) => (
                  <option key={i} value={u.type === "review" ? `Review ${u.orderIndex === 4 ? 1 : 2}` : `Unit ${u.unitNumber}`}>
                    {u.type === "review" ? u.titleEn : `Unit ${u.unitNumber}: ${u.titleEn.replace(/^Unit \d+:\s*/, "")}`}
                  </option>
                ))}
                <option value="Story Corner">Story Corner</option>
              </select>
              <select value={newSource} onChange={e=>setNewSource(e.target.value)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"><option>Ministry Book</option><option>External Source</option><option>Teacher Created</option><option>Revision</option></select>
              <input value={newLesson} onChange={e=>setNewLesson(e.target.value)} placeholder="Lesson / All My Sons" className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs" />
              <input value={newSection} onChange={e=>setNewSection(e.target.value)} placeholder="Section: Grammar / Literature / Story..." className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs" />
              <select value={newQuestionType} onChange={e=>setNewQuestionType(e.target.value)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"><option value="mcq">MCQ</option><option value="fill_blank">Complete</option><option value="correction">Correct</option><option value="rewrite">Rewrite</option><option value="comprehension">Reading</option><option value="writing">Writing</option></select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Option 1"
                value={newOption1}
                onChange={(e) => setNewOption1(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Option 2"
                value={newOption2}
                onChange={(e) => setNewOption2(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Option 3"
                value={newOption3}
                onChange={(e) => setNewOption3(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Option 4"
                value={newOption4}
                onChange={(e) => setNewOption4(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <input
              type="text"
              placeholder="Exact Correct Answer..."
              value={newCorrect}
              onChange={(e) => setNewCorrect(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddQuestion}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Save Question
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
