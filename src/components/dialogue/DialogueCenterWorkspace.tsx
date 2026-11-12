"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MessageSquare,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Send,
  Eye,
  EyeOff,
  Flame,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Volume2,
  Lock,
  Unlock,
  GraduationCap,
  ShieldCheck,
  FileText,
  User,
  Lightbulb,
} from "lucide-react";
import {
  ALL_DIALOGUES,
  DialogueItem,
  DialogueGrade,
  getDialoguesByGrade,
  getRevisionStrategy,
  DialogueRevisionStrategy,
  evaluateStudentAnswer,
} from "@/data/dialogue-center";

interface DialogueCenterWorkspaceProps {
  user?: any;
  onBack?: () => void;
  initialGrade?: DialogueGrade;
  initialMode?: "learn" | "practice" | "exam" | "challenge";
}

export function DialogueCenterWorkspace({
  user,
  onBack,
  initialGrade = "prep_3",
  initialMode = "practice",
}: DialogueCenterWorkspaceProps) {
  // State
  const [activeGrade, setActiveGrade] = useState<DialogueGrade>(initialGrade);
  const [activeMode, setActiveMode] = useState<"learn" | "practice" | "exam" | "challenge">(initialMode);
  const [selectedDialogueId, setSelectedDialogueId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Student inputs for 5 gaps: { "1": "", "2": "", ... }
  const [inputs, setInputs] = useState<Record<string, string>>({
    "1": "",
    "2": "",
    "3": "",
    "4": "",
    "5": "",
  });
  
  // Evaluation state
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [showModelAnswers, setShowModelAnswers] = useState(false);
  const [evalResults, setEvalResults] = useState<Record<string, any>>({});
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Gamification & Streak
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  
  // Exam timer
  const [examTimeLeft, setExamTimeLeft] = useState(600); // 10 minutes
  const [examActive, setExamActive] = useState(false);
  
  // Challenge timer
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(90); // 90 seconds
  const [challengeActive, setChallengeActive] = useState(false);

  // Strategy data
  const strategy: DialogueRevisionStrategy = useMemo(() => getRevisionStrategy(), []);

  // Filter dialogues for active grade
  const gradeDialogues = useMemo(() => {
    return getDialoguesByGrade(activeGrade);
  }, [activeGrade]);

  // Filtered by search
  const filteredDialogues = useMemo(() => {
    if (!searchQuery.trim()) return gradeDialogues;
    const q = searchQuery.toLowerCase();
    return gradeDialogues.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.governorate && d.governorate.toLowerCase().includes(q)) ||
        (d.governorateAr && d.governorateAr.includes(q)) ||
        d.speakers.some((s) => s.toLowerCase().includes(q))
    );
  }, [gradeDialogues, searchQuery]);

  // Current active dialogue
  const currentDialogue = useMemo(() => {
    if (selectedDialogueId) {
      const found = gradeDialogues.find((d) => d.id === selectedDialogueId);
      if (found) return found;
    }
    return gradeDialogues[0] || ALL_DIALOGUES[0];
  }, [gradeDialogues, selectedDialogueId]);

  // Reset inputs when switching dialogue
  useEffect(() => {
    if (currentDialogue) {
      setSelectedDialogueId(currentDialogue.id);
      setInputs({ "1": "", "2": "", "3": "", "4": "", "5": "" });
      setIsEvaluated(false);
      setShowModelAnswers(false);
      setEvalResults({});
      setScore(0);
    }
  }, [currentDialogue?.id, activeGrade]);

  // Exam timer countdown
  useEffect(() => {
    let interval: any;
    if (activeMode === "exam" && examActive && examTimeLeft > 0 && !isEvaluated) {
      interval = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            handleEvaluate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMode, examActive, examTimeLeft, isEvaluated]);

  // Challenge timer countdown
  useEffect(() => {
    let interval: any;
    if (activeMode === "challenge" && challengeActive && challengeTimeLeft > 0 && !isEvaluated) {
      interval = setInterval(() => {
        setChallengeTimeLeft((prev) => {
          if (prev <= 1) {
            handleEvaluate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMode, challengeActive, challengeTimeLeft, isEvaluated]);

  // Handle Input Change
  const handleInputChange = (gap: string, val: string) => {
    setInputs((prev) => ({ ...prev, [gap]: val }));
  };

  // Evaluate Student Answers
  const handleEvaluate = async () => {
    if (!currentDialogue) return;
    setSubmitting(true);

    try {
      // Local evaluation with fallback
      let total = 0;
      const results: Record<string, any> = {};

      for (let g = 1; g <= 5; g++) {
        const gapKey = String(g);
        const approved = currentDialogue.approvedAnswers[gapKey] || {
          primary: "Model answer",
          alternatives: [],
          isTeacherApproved: true,
        };
        const res = evaluateStudentAnswer(inputs[gapKey] || "", approved);
        total += res.score;
        results[gapKey] = {
          ...res,
          approvedPrimary: approved.primary,
          approvedAlternatives: approved.alternatives,
          studentInput: inputs[gapKey] || "",
        };
      }

      setScore(total);
      setEvalResults(results);
      setIsEvaluated(true);
      setShowModelAnswers(true);

      // Points & Streak
      const earnedPoints = activeMode === "challenge" ? total * 20 : total * 10;
      setPoints((prev) => prev + earnedPoints);
      if (total >= 4) {
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }

      if (!completedIds.includes(currentDialogue.id)) {
        setCompletedIds((prev) => [...prev, currentDialogue.id]);
      }

      // Try sending to API
      try {
        await fetch("/api/dialogues/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: user?.id || "guest_student",
            dialogueId: currentDialogue.id,
            mode: activeMode,
            answers: inputs,
            timeTakenSeconds: activeMode === "exam" ? 600 - examTimeLeft : 90 - challengeTimeLeft,
          }),
        });
      } catch (apiErr) {
        // Safe to ignore if offline or preview
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reset current dialogue
  const handleReset = () => {
    setInputs({ "1": "", "2": "", "3": "", "4": "", "5": "" });
    setIsEvaluated(false);
    setShowModelAnswers(false);
    setEvalResults({});
    setScore(0);
    if (activeMode === "exam") {
      setExamTimeLeft(600);
      setExamActive(true);
    }
    if (activeMode === "challenge") {
      setChallengeTimeLeft(90);
      setChallengeActive(true);
    }
  };

  // Navigate to Next Dialogue
  const handleNextDialogue = () => {
    const currentIndex = gradeDialogues.findIndex((d) => d.id === currentDialogue.id);
    if (currentIndex < gradeDialogues.length - 1) {
      setSelectedDialogueId(gradeDialogues[currentIndex + 1].id);
    } else {
      setSelectedDialogueId(gradeDialogues[0].id);
    }
  };

  // Navigate to Previous Dialogue
  const handlePrevDialogue = () => {
    const currentIndex = gradeDialogues.findIndex((d) => d.id === currentDialogue.id);
    if (currentIndex > 0) {
      setSelectedDialogueId(gradeDialogues[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#243247] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP NAVIGATION & HEADER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-[#E8F3FF] text-[#2563EB] transition-colors border border-slate-100"
                title="العودة"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E8F3FF] text-[#2563EB] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  منظومة المحادثة الذكية 2025/2026
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                  مستر حبيب الرحمن
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#243247] tracking-tight">
                مركز المحادثة الإنجليزية التفاعلي
              </h1>
              <p className="text-sm text-[#718096] mt-1 font-medium">
                بنك محادثات متكامل (94 محادثة وزارية) من كتب التدريب والامتحانات الرسمية لمستر حبيب الرحمن
              </p>
            </div>
          </div>

          {/* Gamification Bar */}
          <div className="flex items-center gap-3 sm:gap-4 bg-[#F7F9FC] p-3 rounded-2xl border border-slate-200/60 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-xs border border-slate-100">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold">الحماس</div>
                <div className="text-sm font-black text-slate-800">{streak} أيام</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-xs border border-slate-100">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold">النقاط</div>
                <div className="text-sm font-black text-[#2563EB]">{points} XP</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-xs border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold">المكتمل</div>
                <div className="text-sm font-black text-emerald-600">{completedIds.length} / 94</div>
              </div>
            </div>
          </div>
        </div>

        {/* GRADE SELECTOR TABS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: "prep_1" as DialogueGrade,
              titleAr: "الصف الأول الإعدادي",
              sub: "25 محادثة نموذجية (prep111)",
              count: 25,
            },
            {
              id: "prep_2" as DialogueGrade,
              titleAr: "الصف الثاني الإعدادي",
              sub: "27 محادثة تدريبية (prep 2)",
              count: 27,
            },
            {
              id: "prep_3" as DialogueGrade,
              titleAr: "الصف الثالث الإعدادي",
              sub: "32 محادثة وزارية (prep 3)",
              count: 32,
            },
            {
              id: "prep_3_revision" as DialogueGrade,
              titleAr: "مراجعة الشهادة الإعدادية 2025",
              sub: "استراتيجية الحل + 10 امتحانات محافظات",
              count: 10,
              highlight: true,
            },
          ].map((grade) => {
            const isSelected = activeGrade === grade.id;
            return (
              <button
                key={grade.id}
                onClick={() => setActiveGrade(grade.id)}
                className={`p-4 rounded-2xl text-right transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20"
                    : "bg-white text-[#243247] border-slate-200/80 hover:border-blue-200 hover:bg-[#E8F3FF]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : grade.highlight
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {grade.count} محادثة
                  </span>
                  <GraduationCap className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#2563EB]"}`} />
                </div>
                <div className="text-base font-black mt-2">{grade.titleAr}</div>
                <div className={`text-xs mt-1 ${isSelected ? "text-blue-100" : "text-[#718096]"}`}>
                  {grade.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* MODE SELECTOR */}
        <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-xs flex flex-wrap gap-2">
          {[
            { id: "learn", label: "🎓 استراتيجية الحل 2025 (Learn)", icon: BookOpen },
            { id: "practice", label: "💬 تدريب تفاعلي (Practice)", icon: MessageSquare },
            { id: "exam", label: "📝 محاكاة الامتحان الوزاري (Exam)", icon: FileText },
            { id: "challenge", label: "⚡ تحدي المحادثة والسرعة (Timed)", icon: Zap },
          ].map((mode) => {
            const active = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id as any);
                  if (mode.id === "exam") {
                    setExamActive(true);
                    setExamTimeLeft(600);
                  }
                  if (mode.id === "challenge") {
                    setChallengeActive(true);
                    setChallengeTimeLeft(90);
                  }
                }}
                className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  active
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-transparent text-[#718096] hover:bg-slate-50 hover:text-[#243247]"
                }`}
              >
                <mode.icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* MODE A: LEARN & STRATEGY VIEW                             */}
        {/* ========================================================= */}
        {activeMode === "learn" && (
          <div className="space-y-6">
            {/* Exam Specification Banner */}
            <div className="bg-gradient-to-l from-blue-700 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    مواصفات الورقة الامتحانية 2025 الرسمية
                  </span>
                  <h2 className="text-2xl font-black mt-2">
                    السؤال الأول: إكمال المحادثة (Finish the following dialogue)
                  </h2>
                  <p className="text-blue-100 text-sm mt-1 max-w-2xl leading-relaxed">
                    {strategy.examSpecs?.gapRequirement || "مطلوب ملء 5 فراغات بجمل كاملة وصحيحة نحوياً وسياقياً."}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[140px]">
                  <div className="text-3xl font-black text-amber-300">
                    {strategy.examSpecs?.dialogueMarks || 5} / {strategy.examSpecs?.totalExamMarks || 30}
                  </div>
                  <div className="text-xs text-blue-100 mt-1 font-bold">درجات السؤال الأول</div>
                </div>
              </div>
            </div>

            {/* Golden Rules */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#243247]">القواعد الذهبية لحل المحادثة لمستر حبيب الرحمن</h3>
                  <p className="text-xs text-[#718096]">خطوات منهجية تضمن لك الدرجة النهائية الكاملة (5 من 5)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(strategy.goldenRules || []).map((rule: any, rIdx: number) => (
                  <div
                    key={rIdx}
                    className="p-5 rounded-2xl bg-[#F7F9FC] border border-slate-200/70 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-black">
                        {rule.step || rIdx + 1}
                      </span>
                      <h4 className="text-sm font-black text-[#243247]">{rule.ruleEn || `Rule ${rIdx+1}`}</h4>
                    </div>
                    <p className="text-xs text-[#243247] font-bold leading-relaxed mr-10">{rule.ruleAr}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Auxiliary Verbs Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-[#2563EB]">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#243247]">جدول الأفعال المساعدة (Auxiliary Verbs)</h3>
                  <p className="text-xs text-[#718096]">حجر الأساس لتكوين أي سؤال في اللغة الإنجليزية بطريقة المقص</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Verb to BE",
                    verbs: strategy.questionTypes?.closedQuestions?.auxiliaryVerbs?.verbToBe || ["am", "is", "are", "was", "were"],
                    note: "يُستخدم مع الصفات والأسماء وزمن المضارع/الماضي المستمر",
                  },
                  {
                    title: "Verb to DO",
                    verbs: strategy.questionTypes?.closedQuestions?.auxiliaryVerbs?.verbToDo || ["do", "does", "did"],
                    note: "يُستخدم إذا لم يوجد فعل مساعد في الجملة ويعاد الفعل لمصدره",
                  },
                  {
                    title: "Verb to HAVE",
                    verbs: strategy.questionTypes?.closedQuestions?.auxiliaryVerbs?.verbToHave || ["have", "has", "had"],
                    note: "يُستخدم مع أزمنة المضارع والماضي التام (يأتي بعده p.p)",
                  },
                  {
                    title: "Modal Verbs",
                    verbs: strategy.questionTypes?.closedQuestions?.auxiliaryVerbs?.modalVerbs || ["can", "could", "will", "would", "shall", "should", "must"],
                    note: "أفعال ناقصة يأتي بعدها دائماً مصدر الفعل (Infinitive)",
                  },
                ].map((cat, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F7F9FC] border border-slate-200/80">
                    <div className="text-sm font-black text-[#2563EB] mb-2">{cat.title}</div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {cat.verbs.map((v: string, vIdx: number) => (
                        <span
                          key={vIdx}
                          className="px-2.5 py-1 rounded-lg bg-white text-slate-800 text-xs font-extrabold border border-slate-200 shadow-2xs font-mono"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-[#718096] leading-relaxed border-t border-slate-200 pt-2 font-medium">
                      {cat.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wh-Questions Formula */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#243247]">معادلة تكوين سؤال أداة الاستفهام (Wh-Questions)</h3>
                  <p className="text-xs text-[#718096]">احفظ المعادلة وطبقها مباشرة على أي فراغ سؤال</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 text-center my-4">
                <div className="text-sm sm:text-base font-black text-[#2563EB] font-mono tracking-wide" dir="ltr">
                  {strategy.questionTypes?.openQuestions?.formula || "Wh-word + Auxiliary + Subject + Main Verb + Complement + ?"}
                </div>
                <div className="text-xs text-indigo-700 mt-2 font-bold">
                  مثال: What are you doing now? / Where does she live?
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                {(strategy.questionTypes?.openQuestions?.primaryWhWords || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F7F9FC] border border-slate-200/80">
                    <div className="text-base font-black text-[#2563EB] font-mono" dir="ltr">{item.word}</div>
                    <div className="text-xs font-bold text-[#243247] mt-1">{item.meaningAr}</div>
                    {item.exampleQ && (
                      <div className="text-[11px] text-[#718096] mt-1 font-mono font-medium" dir="ltr">
                        {item.exampleQ}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Common Phrases */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#243247]">أشهر 26 سؤالاً وموقفاً في امتحانات المحادثة</h3>
                  <p className="text-xs text-[#718096]">أسئلة امتحانية متكررة نصاً ومضموناً من ملزمة المراجعة النهائية لمستر حبيب الرحمن</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(strategy.questionTypes?.openQuestions?.commonDialogueQuestions || []).map((phrase: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F7F9FC] border border-slate-200/70 hover:border-blue-300 transition-all">
                    <div className="text-sm font-black text-[#2563EB] font-mono" dir="ltr">{phrase.en}</div>
                    <div className="text-xs font-bold text-slate-700 mt-1">{phrase.ar}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODES B, C, D: INTERACTIVE DIALOGUE PLAYER               */}
        {/* ========================================================= */}
        {activeMode !== "learn" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SIDEBAR: DIALOGUES LIST (4 COLS) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-[#243247] flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-[#2563EB]" />
                    قائمة محادثات {activeGrade === "prep_1" ? "أولى إعدادي" : activeGrade === "prep_2" ? "تانية إعدادي" : activeGrade === "prep_3" ? "تالتة إعدادي" : "مراجعة 2025"}
                  </h3>
                  <span className="text-xs font-extrabold text-[#718096]">
                    {filteredDialogues.length} محادثة
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالعنوان، المحافظة، الأشخاص..."
                    className="w-full pr-9 pl-3 py-2 bg-[#F7F9FC] border border-slate-200 rounded-xl text-xs text-[#243247] placeholder-slate-400 focus:outline-hidden focus:border-[#2563EB]"
                  />
                </div>

                {/* Scrollable list */}
                <div className="max-h-[540px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredDialogues.map((dlg) => {
                    const isCurrent = dlg.id === currentDialogue.id;
                    const isDone = completedIds.includes(dlg.id);
                    return (
                      <button
                        key={dlg.id}
                        onClick={() => setSelectedDialogueId(dlg.id)}
                        className={`w-full text-right p-3 rounded-2xl transition-all cursor-pointer border text-xs ${
                          isCurrent
                            ? "bg-[#E8F3FF] border-[#2563EB] text-[#2563EB] shadow-xs ring-1 ring-[#2563EB]/30 font-black"
                            : "bg-[#F7F9FC] border-slate-200/60 hover:bg-slate-100 text-[#243247]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700">
                            #{dlg.dialogueNumber}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {dlg.governorateAr && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
                                {dlg.governorateAr} {dlg.year || ""}
                              </span>
                            )}
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        </div>
                        <div className="line-clamp-2 font-medium leading-relaxed">{dlg.title}</div>
                        <div className="text-[10px] text-[#718096] mt-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {dlg.speakers.join(" & ")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MAIN PLAYER (8 COLS) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* DIALOGUE CARD HEADER */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                
                {/* Top Badges & Timers */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E8F3FF] text-[#2563EB]">
                      المحادثة رقم {currentDialogue.dialogueNumber}
                    </span>
                    {currentDialogue.governorateAr && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {currentDialogue.governorateAr} {currentDialogue.year || ""}
                      </span>
                    )}
                    <span className="text-xs font-medium text-[#718096]">
                      {currentDialogue.gradeLabelAr}
                    </span>
                  </div>

                  {/* Mode-specific Badge / Countdown */}
                  {activeMode === "exam" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-mono font-black text-sm border border-rose-200 animate-pulse">
                      <Clock className="w-4 h-4" />
                      الوقت المتبقي: {Math.floor(examTimeLeft / 60)}:{(examTimeLeft % 60).toString().padStart(2, "0")}
                    </div>
                  )}

                  {activeMode === "challenge" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-mono font-black text-sm border border-amber-200 animate-bounce">
                      <Zap className="w-4 h-4 text-amber-500" />
                      تحدي السرعة: {challengeTimeLeft} ثانية!
                    </div>
                  )}
                </div>

                {/* Scenario Title */}
                <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-slate-200/80 mb-6">
                  <div className="text-[11px] font-black text-[#2563EB] uppercase tracking-wider mb-1">
                    سياق وموضوع المحادثة (Conversation Scenario)
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[#243247] leading-relaxed">
                    {currentDialogue.title}
                  </h2>
                </div>

                {/* CONVERSATION BUBBLES */}
                <div className="space-y-4 mb-6">
                  {currentDialogue.lines.map((line, idx) => {
                    const isFirstSpeaker = line.speaker === currentDialogue.speakers[0];
                    const gapNum = line.gapNumber;

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 ${
                          isFirstSpeaker ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        {/* Speaker Avatar */}
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-black shadow-xs ${
                            isFirstSpeaker
                              ? "bg-[#2563EB] text-white"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {line.speaker.slice(0, 2).toUpperCase()}
                        </div>

                        {/* Speech Bubble */}
                        <div
                          className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed ${
                            isFirstSpeaker
                              ? "bg-white border border-slate-200 text-[#243247] rounded-tr-xs shadow-xs"
                              : "bg-[#E8F3FF] border border-blue-200/80 text-[#243247] rounded-tl-xs shadow-xs"
                          }`}
                        >
                          <div className="text-[11px] font-black text-slate-400 mb-1">
                            {line.speaker}
                          </div>

                          {/* Line text with interactive input if gap exists */}
                          {gapNum ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-black">
                                  {gapNum}
                                </span>
                                {line.isQuestion ? (
                                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                    تكوين سؤال (Question ?)
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    إجابة جملة (Response Statement)
                                  </span>
                                )}
                              </div>

                              {/* Interactive Answer Input Field */}
                              <div className="relative">
                                <input
                                  type="text"
                                  value={inputs[String(gapNum)] || ""}
                                  onChange={(e) => handleInputChange(String(gapNum), e.target.value)}
                                  disabled={isEvaluated}
                                  placeholder={
                                    line.isQuestion
                                      ? "اكتب السؤال هنا بالإنجليزية... (مثال: What is your favorite hobby?)"
                                      : "اكتب الرد هنا بالإنجليزية... (مثال: Yes, of course. / I went by bus.)"
                                  }
                                  className={`w-full p-3 rounded-xl border text-sm font-semibold transition-all focus:outline-hidden ${
                                    isEvaluated
                                      ? evalResults[String(gapNum)]?.isCorrect
                                        ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                                        : "bg-rose-50 border-rose-400 text-rose-900"
                                      : "bg-white border-slate-300 text-slate-900 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                                  }`}
                                  dir="ltr"
                                />
                                {isEvaluated && (
                                  <div className="absolute right-3 top-3">
                                    {evalResults[String(gapNum)]?.isCorrect ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-rose-600" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Evaluation Feedback and Approved Model Answer Reveal */}
                              {isEvaluated && (
                                <div className="mt-2 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`font-black ${
                                        evalResults[String(gapNum)]?.isCorrect
                                          ? "text-emerald-700"
                                          : "text-rose-700"
                                      }`}
                                    >
                                      {evalResults[String(gapNum)]?.feedbackAr}
                                    </span>
                                    <span className="font-bold text-slate-500">
                                      {evalResults[String(gapNum)]?.score} / 1 درجة
                                    </span>
                                  </div>

                                  <div className="pt-2 border-t border-slate-200">
                                    <div className="text-[11px] font-bold text-slate-500">
                                      الإجابة النموذجية المعتمدة وزارياً:
                                    </div>
                                    <div className="font-black text-[#2563EB] font-mono mt-0.5 text-sm" dir="ltr">
                                      {evalResults[String(gapNum)]?.approvedPrimary}
                                    </div>
                                  </div>

                                  {evalResults[String(gapNum)]?.approvedAlternatives?.length > 0 && (
                                    <div className="pt-1">
                                      <div className="text-[10px] text-slate-400">
                                        بدائل صحيحة مقبولة في التصحيح:
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1" dir="ltr">
                                        {evalResults[String(gapNum)]?.approvedAlternatives.map(
                                          (alt: string, altIdx: number) => (
                                            <span
                                              key={altIdx}
                                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-mono font-medium"
                                            >
                                              {alt}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="font-medium text-slate-800" dir="ltr">
                              {line.text}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SCORE BANNER (When evaluated) */}
                {isEvaluated && (
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 mb-6 text-center animate-in fade-in zoom-in-95">
                    <div className="text-xs font-black text-[#2563EB] uppercase tracking-wider">
                      نتيجة تقييم المحادثة الرسمية
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-[#243247] my-2">
                      {score} / 5 درجات
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-600 max-w-md mx-auto">
                      {score === 5 ? (
                        <span className="text-emerald-600 flex items-center justify-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          ممتاز! إجابة كاملة مطابقة لمواصفات وزارة التربية والتعليم
                        </span>
                      ) : score >= 3 ? (
                        <span className="text-blue-600">
                          أداء جيد جداً! راجع البدائل النموذجية لتصل إلى 5 من 5 دائماً.
                        </span>
                      ) : (
                        <span className="text-amber-600">
                          حاول مرة أخرى وركز في قاعدة تكوين السؤال وطريقة المقص.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevDialogue}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                      المحادثة السابقة
                    </button>
                    <button
                      onClick={handleNextDialogue}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      المحادثة التالية
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEvaluated ? (
                      <button
                        onClick={handleReset}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        إعادة المحاولة
                      </button>
                    ) : (
                      <button
                        onClick={handleEvaluate}
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-black flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        {submitting ? "جاري التقييم..." : "فحص الإجابات وتصحيحها"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
