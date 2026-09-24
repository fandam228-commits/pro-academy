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
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"bank" | "smart_generator" | "ai_generator" | "importer">("bank");

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
  const [importStatus, setImportStatus] = useState<any>(null);

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
      url.searchParams.set("limit", "200");
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
          grade: aiGrade,
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
    if (!newQText || !newCorrect) {
      setAddError("Please fill in question text and correct answer.");
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

  const handleImportText = async () => {
    if (!importRawText.trim()) return;

    // Parse CSV or plain text line format: QuestionText | Option1,Option2,Option3,Option4 | CorrectAnswer
    const lines = importRawText.split("\n").filter((l) => l.trim().length > 0);
    const parsedItems: any[] = [];

    for (const l of lines) {
      const parts = l.split("|");
      if (parts.length >= 2) {
        const qText = parts[0].trim();
        const opts = parts[1] ? parts[1].split(",").map((o) => o.trim()) : [];
        const corr = parts[2] ? parts[2].trim() : opts[0] || "A";

        parsedItems.push({
          questionText: qText,
          options: opts,
          correctAnswer: corr,
          domainCategory: qText.toLowerCase().includes("had") ? "Grammar" : "Vocabulary",
          grammarTopic: "Tense",
          difficulty: difficultyFilter === "All" ? "Medium" : difficultyFilter,
          stage: stageFilter === "All" ? "Secondary" : stageFilter,
          grade: gradeFilter === "All" ? "Third Secondary (Baccalaureate)" : gradeFilter,
          curriculum: curriculumFilter === "All" ? "Ministry" : curriculumFilter,
          term: termFilter === "All" ? "First" : termFilter,
          unit: unitFilter === "All" ? "Unit 1" : unitFilter,
          source: sourceFilter === "All" ? "External Source" : sourceFilter,
          lesson: lessonFilter === "All" ? "Lesson 1" : lessonFilter,
          section: sectionFilter === "All" ? null : sectionFilter,
        });
      }
    }

    try {
      const res = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import_questions", items: parsedItems }),
      });
      const json = await res.json();
      setImportStatus(json);
      setImportRawText("");
      fetchQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black">
              {lang === "ar" ? "بنك الأسئلة الذكي والإنشاء التلقائي" : "Intelligent Question Bank Engine"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-xl leading-relaxed">
            {lang === "ar"
              ? "إدارة أكثر من 100,000 سؤال مفهرس، توليد الامتحانات الذكية بدون تكرار الأسئلة، الكشف التلقائي عن التطابق، ومولد الذكاء الاصطناعي."
              : "High-scale indexed vocabulary & grammar repository, anti-repetition smart exam generator, and AI auto-item authoring."}
          </p>
        </div>

        {/* STATS BADGES */}
        <div className="flex gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
          <div className="text-center px-3">
            <span className="text-2xl font-black text-amber-300">{stats.total}</span>
            <span className="text-[10px] block opacity-80 uppercase">{lang === "ar" ? "إجمالي الأسئلة" : "Total Items"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-3">
            <span className="text-2xl font-black text-blue-300">{stats.grammarCount}</span>
            <span className="text-[10px] block opacity-80 uppercase">{lang === "ar" ? "بنك القواعد" : "Grammar"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-3">
            <span className="text-2xl font-black text-emerald-300">{stats.vocabularyCount}</span>
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
              activeTab === "bank" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Database className="w-4 h-4" />
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
              activeTab === "ai_generator" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>{lang === "ar" ? "توليد بالذكاء الاصطناعي" : "AI Question Authoring"}</span>
          </button>

          <button
            onClick={() => setActiveTab("importer")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "importer" ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>{lang === "ar" ? "استيراد CSV / Excel" : "Bulk Import"}</span>
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all"
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
              <option value="All">كل الوحدات</option>{Array.from({length:12},(_,i)=><option key={i}>Unit {i+1}</option>)}
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
                        const isCorrect = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-xl text-xs font-medium border ${
                              isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {opt} {isCorrect && "✓"}
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
              <div><label className="block mb-1">Grade</label><select value={examGrade} onChange={e=>setAiExamGrade(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"><option>Third Prep</option><option>First Secondary</option><option>Second Secondary</option><option>Third Secondary (Baccalaureate)</option></select></div>
              <div><label className="block mb-1">Curriculum</label><select value={examCurriculum} onChange={e=>setExamCurriculum(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"><option>Connect</option><option>Connect Plus</option><option>Ministry</option><option>M High</option><option>Baccalaureate</option><option>Thanaweya Amma</option></select></div>
              <div><label className="block mb-1">Term</label><select value={examTerm} onChange={e=>setExamTerm(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"><option>First</option><option>Second</option></select></div>
              <div><label className="block mb-1">Unit</label><select value={examUnit} onChange={e=>setExamUnit(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white col-span-2"><option>All</option>{Array.from({length:12},(_,i)=><option key={i}>Unit {i+1}</option>)}<option>All My Sons</option></select></div>
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
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl mx-auto space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {lang === "ar" ? "استيراد أسئلة من CSV / Excel / Word" : "Bulk Questions Importer"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste line-separated items in format: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Question Text | Option1,Option2,Option3,Option4 | CorrectAnswer</code>
          </p>

          <textarea
            rows={8}
            value={importRawText}
            onChange={(e) => setImportRawText(e.target.value)}
            placeholder="Hardly had he arrived | had he,did he,he had,has he | had he"
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
          />

          <button
            onClick={handleImportText}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all"
          >
            {lang === "ar" ? "معالجة واستيراد الأسئلة" : "Process & Import Questions"}
          </button>

          {importStatus && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 rounded-2xl text-xs font-bold border border-blue-200">
              {importStatus.message}
            </div>
          )}
        </div>
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
              <select value={newUnit} onChange={e=>setNewUnit(e.target.value)} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"><option>Unit 1</option><option>Unit 2</option><option>Unit 3</option><option>Unit 4</option><option>Unit 5</option><option>Unit 6</option><option>Unit 7</option><option>Unit 8</option><option>Unit 9</option><option>Unit 10</option><option>Unit 11</option><option>Unit 12</option></select>
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
