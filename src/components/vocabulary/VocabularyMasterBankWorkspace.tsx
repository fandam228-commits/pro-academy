"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Volume2,
  Bookmark,
  Sparkles,
  Trophy,
  Filter,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Download,
  Share2,
  Layers,
  ArrowRight,
  HelpCircle,
  Award,
  Star,
  Settings,
  Eye,
  RotateCcw,
  Compass,
} from "lucide-react";
import {
  TableType,
  queryVocabularyBank,
  generateInteractiveVocabularyQuiz,
  VOCABULARY_GRADES,
  CORE_VOCABULARY_TABLE,
  EXTRA_VOCABULARY_TABLE,
  SYNONYMS_ANTONYMS_TABLE,
  PREPOSITIONS_EXPRESSIONS_TABLE,
  CoreVocabularyItem,
  ExtraVocabularyItem,
  SynonymAntonymItem,
  PrepositionExpressionItem,
  TrainingQuizQuestion,
} from "@/data/vocabulary-master-bank";

interface VocabularyWorkspaceProps {
  user?: any;
  onNavigateHome?: () => void;
}

export function VocabularyMasterBankWorkspace({ user, onNavigateHome }: VocabularyWorkspaceProps) {
  // Navigation Filters
  const [selectedGrade, setSelectedGrade] = useState<string>("sec_1");
  const [selectedTerm, setSelectedTerm] = useState<string>("first");
  const [selectedUnit, setSelectedUnit] = useState<number | undefined>(undefined);
  const [activeTableType, setActiveTableType] = useState<TableType>("core");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Views & Modals
  const [viewMode, setViewMode] = useState<"table" | "flashcards">("table");
  const [showTrainingModal, setShowTrainingModal] = useState<boolean>(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [activeSpeakingWord, setActiveSpeakingWord] = useState<string | null>(null);

  // Favorites (persisted in localStorage)
  const [favoriteWordIds, setFavoriteWordIds] = useState<string[]>([]);

  // Flashcard Deck State
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  // Training Quiz State
  const [quizQuestions, setQuizQuestions] = useState<TrainingQuizQuestion[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  // Load favorites from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pro_vocab_favorites");
      if (saved) {
        try {
          setFavoriteWordIds(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavoriteWordIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (typeof window !== "undefined") {
        localStorage.setItem("pro_vocab_favorites", JSON.stringify(next));
      }
      return next;
    });
  };

  // Web Speech API
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setActiveSpeakingWord(text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => setActiveSpeakingWord(null);
      utterance.onerror = () => setActiveSpeakingWord(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Query Active Table Data
  const filteredItems = useMemo(() => {
    const raw = queryVocabularyBank({
      tableType: activeTableType,
      gradeCode: selectedGrade,
      term: selectedTerm,
      unitNumber: selectedUnit,
      searchQuery: searchQuery,
    });

    if (showFavoritesOnly) {
      return raw.filter((item: any) => favoriteWordIds.includes(item.id));
    }
    return raw;
  }, [activeTableType, selectedGrade, selectedTerm, selectedUnit, searchQuery, showFavoritesOnly, favoriteWordIds]);

  // Start Interactive Quiz
  const handleStartQuiz = () => {
    const qList = generateInteractiveVocabularyQuiz(selectedGrade);
    setQuizQuestions(qList);
    setActiveQuestionIdx(0);
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setShowTrainingModal(true);
  };

  // Calculate Quiz Score
  const quizScore = useMemo(() => {
    if (!isQuizSubmitted || quizQuestions.length === 0) return 0;
    const correctCount = quizQuestions.reduce((acc, q) => {
      return selectedAnswers[q.id] === q.correctAnswer ? acc + 1 : acc;
    }, 0);
    return Math.round((correctCount / quizQuestions.length) * 100);
  }, [isQuizSubmitted, quizQuestions, selectedAnswers]);

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ID,Word,Arabic Meaning,Part of Speech,Definition,Source,Page\n";
    filteredItems.forEach((item: any) => {
      const word = item.word || item.mainWord || item.expression || "";
      const ar = item.meaningAr || "";
      const pos = item.pos || item.expressionType || "";
      const def = (item.definitionEn || "").replace(/,/g, ";");
      const src = (item.sourceFile || item.sourceBook || "").replace(/,/g, " ");
      const page = item.sourcePage || "";
      csvContent += `"${item.id}","${word}","${ar}","${pos}","${def}","${src}","${page}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Professional_Vocabulary_${selectedGrade}_${activeTableType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6" dir="rtl">
      {/* ========================================================================= */}
      {/* 1. MASTER HEADER & STATS BAR */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#4F46E5] text-white flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#E8F3FF] text-[#2563EB]">
                  Professional Vocabulary Master Bank
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706]">
                  مناهج 2026 / 2027
                </span>
              </div>
              <h1 className="text-xl md:text-3xl font-black text-[#1E293B] mt-1">
                بنك المفردات والتعبيرات الأكاديمي الشامل
              </h1>
              <p className="text-xs md:text-sm text-[#64748B]">
                المكتبة المعتمدة لمستر حبيب الرحمن: الكلمات الأساسية، التوسعية، المترادفات، وحروف الجر بدقة موثقة
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleStartQuiz}
              className="px-4 py-2.5 rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>بدء التدريب التفاعلي (10 أنماط)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-white text-[#475569] text-xs font-bold transition flex items-center gap-1.5"
              title="تصدير إلى ملف CSV / Excel"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تصدير Excel</span>
            </button>
          </div>
        </div>

        {/* 4 Quantitative Overview Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#F1F5F9]">
          <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white font-black flex items-center justify-center text-sm">
              📘
            </div>
            <div>
              <div className="text-lg font-black text-[#1E3A8A]">{CORE_VOCABULARY_TABLE.length}</div>
              <div className="text-[11px] font-bold text-[#3B82F6]">مفردات أساسية مقررة (Core)</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D97706] text-white font-black flex items-center justify-center text-sm">
              📙
            </div>
            <div>
              <div className="text-lg font-black text-[#78350F]">{EXTRA_VOCABULARY_TABLE.length}+</div>
              <div className="text-[11px] font-bold text-[#D97706]">مفردات إضافية وتوسعية (Extra)</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10B981] text-white font-black flex items-center justify-center text-sm">
              🔄
            </div>
            <div>
              <div className="text-lg font-black text-[#065F46]">{SYNONYMS_ANTONYMS_TABLE.length}</div>
              <div className="text-[11px] font-bold text-[#059669]">مترادفات ومتضادات وزارية</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6] text-white font-black flex items-center justify-center text-sm">
              🔗
            </div>
            <div>
              <div className="text-lg font-black text-[#581C87]">{PREPOSITIONS_EXPRESSIONS_TABLE.length}</div>
              <div className="text-[11px] font-bold text-[#7C3AED]">حروف جر ومتلازمات وتعبيرات</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 4 MASTER TABLES TABS SELECTOR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          {
            id: "core",
            labelAr: "1. الكلمات الأساسية المقررة",
            labelEn: "Table 1: Core Vocabulary",
            icon: "📘",
            count: CORE_VOCABULARY_TABLE.length,
          },
          {
            id: "extra",
            labelAr: "2. المفردات التوسعية والإضافية",
            labelEn: "Table 2: Extra Vocabulary",
            icon: "📙",
            count: EXTRA_VOCABULARY_TABLE.length,
          },
          {
            id: "synonyms_antonyms",
            labelAr: "3. المترادفات والمتضادات",
            labelEn: "Table 3: Synonyms & Antonyms",
            icon: "🔄",
            count: SYNONYMS_ANTONYMS_TABLE.length,
          },
          {
            id: "prepositions_expressions",
            labelAr: "4. حروف الجر والتعبيرات",
            labelEn: "Table 4: Prepositions & Idioms",
            icon: "🔗",
            count: PREPOSITIONS_EXPRESSIONS_TABLE.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTableType(tab.id as TableType)}
            className={`p-4 rounded-3xl border text-right transition flex items-start justify-between ${
              activeTableType === tab.id
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-blue-500/20"
                : "bg-white border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                <span className="text-xs md:text-sm font-black">{tab.labelAr}</span>
              </div>
              <div className={`text-[11px] font-serif ${activeTableType === tab.id ? "text-blue-100" : "text-[#64748B]"}`}>
                {tab.labelEn}
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                activeTableType === tab.id ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 3. MULTI-LEVEL FILTERING & SEARCH CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Grade Selector */}
          <div>
            <label className="text-[11px] font-black text-[#64748B] block mb-1">الصف الدراسي:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#1E293B] bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] outline-none"
            >
              <option value="all">جميع الصفوف الدراسية</option>
              {VOCABULARY_GRADES.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.labelAr} ({g.labelEn})
                </option>
              ))}
            </select>
          </div>

          {/* Term Selector */}
          <div>
            <label className="text-[11px] font-black text-[#64748B] block mb-1">الفصل الدراسي (الترم):</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#1E293B] bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] outline-none"
            >
              <option value="all">جميع الفصول الدراسية</option>
              <option value="first">الترم الأول (First Term)</option>
              <option value="second">الترم الثاني (Second Term)</option>
            </select>
          </div>

          {/* Unit Selector */}
          <div>
            <label className="text-[11px] font-black text-[#64748B] block mb-1">الوحدة المقررة:</label>
            <select
              value={selectedUnit !== undefined ? selectedUnit.toString() : "all"}
              onChange={(e) => setSelectedUnit(e.target.value === "all" ? undefined : parseInt(e.target.value, 10))}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#1E293B] bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] outline-none"
            >
              <option value="all">جميع الوحدات</option>
              <option value="1">الوحدة 1 (Unit 1)</option>
              <option value="2">الوحدة 2 (Unit 2)</option>
              <option value="3">الوحدة 3 (Unit 3)</option>
              <option value="4">الوحدة 4 (Unit 4)</option>
              <option value="5">الوحدة 5 (Unit 5)</option>
              <option value="6">الوحدة 6 (Unit 6)</option>
            </select>
          </div>

          {/* View Mode & Favorites */}
          <div>
            <label className="text-[11px] font-black text-[#64748B] block mb-1">العرض والتفضيلات:</label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewMode(viewMode === "table" ? "flashcards" : "table")}
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#334155] bg-[#F8FAFC] hover:bg-white transition flex items-center justify-center gap-1.5"
              >
                <span>{viewMode === "table" ? "بطاقات تعليمية 🗂️" : "جدول تقليدي 📋"}</span>
              </button>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-2.5 rounded-xl border transition ${
                  showFavoritesOnly
                    ? "bg-amber-100 border-amber-300 text-amber-800"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-amber-600"
                }`}
                title="عرض الكلمات المفضلة فقط"
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? "fill-amber-500 text-amber-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالإنجليزية أو بالمعنى العربي أو نوع التعبير (مثال: heritage، حضارة، phrasal verb)..."
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-[#E2E8F0] text-xs md:text-sm font-medium bg-[#F8FAFC] focus:bg-white focus:border-[#2563EB] outline-none"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT DISPLAY (TABLE VIEW VS FLASHCARDS) */}
      {/* ========================================================================= */}
      {viewMode === "table" ? (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm">
          {/* TABLE 1: CORE VOCABULARY */}
          {activeTableType === "core" && (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-black">
                  <tr>
                    <th className="p-3.5">الكلمة الإنجليزية (Word)</th>
                    <th className="p-3.5">النوع</th>
                    <th className="p-3.5">المعنى العربي</th>
                    <th className="p-3.5 hidden md:table-cell">التعريف الإنجليزي المعتمد (Definition)</th>
                    <th className="p-3.5 hidden lg:table-cell">مثال سياقي (Example)</th>
                    <th className="p-3.5">الصف والوحدة</th>
                    <th className="p-3.5">المصدر الموثق</th>
                    <th className="p-3.5 text-center">استماع / حفظ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition">
                      <td className="p-3.5 font-bold font-serif text-sm text-[#1E293B]" dir="ltr">
                        {item.word}
                      </td>
                      <td className="p-3.5 font-mono text-[#2563EB] font-bold">({item.pos})</td>
                      <td className="p-3.5 font-bold text-[#1E293B]">{item.meaningAr}</td>
                      <td className="p-3.5 text-[#475569] font-serif hidden md:table-cell" dir="ltr">
                        {item.definitionEn || "—"}
                      </td>
                      <td className="p-3.5 text-[#64748B] font-serif italic hidden lg:table-cell" dir="ltr">
                        "{item.exampleEn || "—"}"
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3FF] text-[#2563EB]">
                          {item.gradeLabelAr} • و{item.unitNumber}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-[#64748B] text-[11px]">
                        صفحة {item.sourcePage}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => speakText(item.word)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#E8F3FF] text-[#64748B] hover:text-[#2563EB] transition"
                            title="استمع للنطق"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              favoriteWordIds.includes(item.id)
                                ? "bg-amber-50 border-amber-300 text-amber-500"
                                : "border-[#E2E8F0] text-[#94A3B8] hover:text-amber-500"
                            }`}
                            title="إضافة للمفضلة"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${favoriteWordIds.includes(item.id) ? "fill-amber-500" : ""}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLE 2: EXTRA VOCABULARY */}
          {activeTableType === "extra" && (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#FFFBEB] border-b border-[#FDE68A] text-[#78350F] font-black">
                  <tr>
                    <th className="p-3.5">الكلمة التوسعية (Extra Word)</th>
                    <th className="p-3.5">النوع</th>
                    <th className="p-3.5">المعنى العربي</th>
                    <th className="p-3.5 hidden md:table-cell">التعريف الأكاديمي</th>
                    <th className="p-3.5 hidden lg:table-cell">مثال الاستخدام</th>
                    <th className="p-3.5">كتاب المصدر</th>
                    <th className="p-3.5">الصفحة</th>
                    <th className="p-3.5 text-center">استماع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[#FFFBEB]/40 transition">
                      <td className="p-3.5 font-bold font-serif text-sm text-[#1E293B]" dir="ltr">
                        {item.word}
                      </td>
                      <td className="p-3.5 font-mono text-[#D97706] font-bold">({item.pos})</td>
                      <td className="p-3.5 font-bold text-[#1E293B]">{item.meaningAr}</td>
                      <td className="p-3.5 text-[#475569] font-serif hidden md:table-cell" dir="ltr">
                        {item.definitionEn || "—"}
                      </td>
                      <td className="p-3.5 text-[#64748B] font-serif italic hidden lg:table-cell" dir="ltr">
                        "{item.exampleEn || "—"}"
                      </td>
                      <td className="p-3.5 text-[#64748B] font-medium text-[11px]">{item.sourceBook}</td>
                      <td className="p-3.5 text-[#64748B] text-[11px]">ص {item.sourcePage}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => speakText(item.word)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-amber-100 text-[#64748B] hover:text-[#D97706] transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLE 3: SYNONYMS & ANTONYMS */}
          {activeTableType === "synonyms_antonyms" && (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F0FDF4] border-b border-[#BBF7D0] text-[#065F46] font-black">
                  <tr>
                    <th className="p-3.5">الكلمة الرئيسية (Main Word)</th>
                    <th className="p-3.5">المعنى العربي</th>
                    <th className="p-3.5">المترادفات المعتمدة (Synonyms)</th>
                    <th className="p-3.5">المتضادات المعتمدة (Antonyms)</th>
                    <th className="p-3.5 hidden lg:table-cell">مشتقات الكلمة (Related)</th>
                    <th className="p-3.5">المصدر والصفحة</th>
                    <th className="p-3.5 text-center">استماع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[#F0FDF4]/30 transition">
                      <td className="p-3.5 font-bold font-serif text-sm text-[#1E293B]" dir="ltr">
                        {item.mainWord}
                      </td>
                      <td className="p-3.5 font-bold text-[#1E293B]">{item.meaningAr}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 flex-wrap" dir="ltr">
                          {item.synonyms.map((s: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 flex-wrap" dir="ltr">
                          {item.antonyms.map((a: string, aIdx: number) => (
                            <span
                              key={aIdx}
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 text-[#64748B] font-mono hidden lg:table-cell" dir="ltr">
                        {(item.relatedWords || []).join(", ") || "—"}
                      </td>
                      <td className="p-3.5 text-[#64748B] text-[11px]">
                        {item.sourceFile} (ص {item.sourcePage})
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => speakText(item.mainWord)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-emerald-100 text-[#64748B] hover:text-emerald-700 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLE 4: PREPOSITIONS & EXPRESSIONS */}
          {activeTableType === "prepositions_expressions" && (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#FAF5FF] border-b border-[#E9D5FF] text-[#581C87] font-black">
                  <tr>
                    <th className="p-3.5">التعبير / حرف الجر (Expression)</th>
                    <th className="p-3.5">نوع التعبير اللغوي</th>
                    <th className="p-3.5">المعنى العربي</th>
                    <th className="p-3.5 hidden md:table-cell">مثال سياقي من المنهج</th>
                    <th className="p-3.5">المصدر والصفحة</th>
                    <th className="p-3.5 text-center">استماع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[#FAF5FF]/30 transition">
                      <td className="p-3.5 font-bold font-serif text-sm text-[#1E293B]" dir="ltr">
                        {item.expression}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                          {item.expressionType}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#1E293B]">{item.meaningAr}</td>
                      <td className="p-3.5 text-[#475569] font-serif italic hidden md:table-cell" dir="ltr">
                        "{item.exampleEn || "—"}"
                      </td>
                      <td className="p-3.5 text-[#64748B] text-[11px]">
                        {item.sourceBook} (ص {item.sourcePage})
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => speakText(item.expression)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-purple-100 text-[#64748B] hover:text-purple-700 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-[#64748B] space-y-2">
              <Search className="w-8 h-8 mx-auto text-[#CBD5E1]" />
              <p className="font-bold">لم يتم العثور على نتائج مطابقة لخيارات البحث المحددة</p>
              <p className="text-xs">جرب تغيير كلمات البحث أو اختيار صف دراسي مختلف</p>
            </div>
          )}
        </div>
      ) : (
        /* FLASHCARD DECK VIEW */
        <div className="max-w-xl mx-auto space-y-4">
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="cursor-pointer min-h-[260px] rounded-3xl border-2 border-dashed border-[#CBD5E1] bg-gradient-to-tr from-[#F8FAFC] to-[#EFF6FF] p-8 flex flex-col items-center justify-center text-center shadow-md transition transform hover:scale-[1.01]"
              >
                {!isCardFlipped ? (
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-[#2563EB]">
                      انقر لقلب البطاقة ومعرفة المعنى والمثال
                    </span>
                    <h3 className="text-3xl font-black text-[#1E293B] font-serif" dir="ltr">
                      {(filteredItems[activeCardIndex] as any)?.word ||
                        (filteredItems[activeCardIndex] as any)?.mainWord ||
                        (filteredItems[activeCardIndex] as any)?.expression}
                    </h3>
                    <span className="text-xs text-[#2563EB] font-mono font-bold block">
                      ({(filteredItems[activeCardIndex] as any)?.pos || (filteredItems[activeCardIndex] as any)?.expressionType})
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                      المعنى العربي والمثال
                    </span>
                    <h3 className="text-2xl font-black text-emerald-900">
                      {(filteredItems[activeCardIndex] as any)?.meaningAr}
                    </h3>
                    {(filteredItems[activeCardIndex] as any)?.definitionEn && (
                      <p className="text-xs text-[#475569] font-serif" dir="ltr">
                        {(filteredItems[activeCardIndex] as any).definitionEn}
                      </p>
                    )}
                    {(filteredItems[activeCardIndex] as any)?.exampleEn && (
                      <p className="text-xs text-[#64748B] font-serif italic" dir="ltr">
                        "{(filteredItems[activeCardIndex] as any).exampleEn}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Flashcard Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setActiveCardIndex((idx) => Math.max(0, idx - 1));
                  }}
                  disabled={activeCardIndex <= 0}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold disabled:opacity-40"
                >
                  السابق
                </button>
                <button
                  onClick={() =>
                    speakText(
                      (filteredItems[activeCardIndex] as any)?.word ||
                        (filteredItems[activeCardIndex] as any)?.mainWord ||
                        (filteredItems[activeCardIndex] as any)?.expression ||
                        ""
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>استمع</span>
                </button>
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setActiveCardIndex((idx) => Math.min(filteredItems.length - 1, idx + 1));
                  }}
                  disabled={activeCardIndex >= filteredItems.length - 1}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-[#64748B]">لا توجد بطاقات للمفردات المحددة</p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE TRAINING QUIZ MODAL (10 TRAINING MODES) */}
      {/* ========================================================================= */}
      {showTrainingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                  🏆
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1E293B]">
                    التدريب التفاعلي على المفردات والتعبيرات
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    10 أسئلة متدرجة تقيس المعنى، المترادفات، المتضادات، وحروف الجر
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrainingModal(false)}
                className="w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {quizQuestions.map((q, qIdx) => {
                const selectedOpt = selectedAnswers[q.id];
                const isCorrect = selectedOpt === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#2563EB] mb-1 inline-block">
                          سؤال {qIdx + 1} • {q.mode.replace("_", " ")}
                        </span>
                        <h4 className="text-sm font-bold font-serif text-[#1E293B] leading-relaxed" dir="ltr">
                          {q.promptEn}
                        </h4>
                        {q.promptAr && <p className="text-xs text-[#64748B] mt-0.5">{q.promptAr}</p>}
                      </div>
                      {isQuizSubmitted && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 ${
                            isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isCorrect ? "صحيح ✓" : "خطأ ✗"}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === opt;
                        const isRightAnswer = isQuizSubmitted && opt === q.correctAnswer;
                        const isWrongChoice = isQuizSubmitted && isChosen && !isRightAnswer;

                        return (
                          <button
                            key={optIdx}
                            disabled={isQuizSubmitted}
                            onClick={() =>
                              setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))
                            }
                            className={`p-3 rounded-xl border text-right transition flex items-center justify-between text-xs ${
                              isRightAnswer
                                ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                                : isWrongChoice
                                ? "bg-red-50 border-red-500 text-red-900"
                                : isChosen
                                ? "bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold"
                                : "bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]"
                            }`}
                          >
                            <span>{opt}</span>
                            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-sans">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {isQuizSubmitted && (
                      <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs space-y-1">
                        <div className="text-[#2563EB]">
                          💡 <strong>التوضيح:</strong> {q.explanationAr}
                        </div>
                        <div className="text-[#94A3B8] text-[10px]">
                          📖 <strong>المصدر:</strong> {q.sourceReference}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Footer & Submission */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#F1F5F9]">
              {!isQuizSubmitted ? (
                <button
                  onClick={() => setIsQuizSubmitted(true)}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="px-6 py-2.5 rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition shadow-md shadow-blue-500/20"
                >
                  تصحيح إجاباتي الآن
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-[#1E293B]">
                    النتيجة: {quizScore}%
                  </span>
                  <button
                    onClick={handleStartQuiz}
                    className="px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold hover:bg-white transition"
                  >
                    إعادة الاختبار
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowTrainingModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:underline"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
