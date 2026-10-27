"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, BookOpenCheck, CheckCircle2, Clock3, FileQuestion, GraduationCap, Settings2, ShieldCheck, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AdaptivePlacementTest } from "@/components/AdaptivePlacementTest";
import { QuizPlayer } from "@/components/QuizPlayer";
import { getPlacementGrade, PLACEMENT_GRADES, type PlacementGrade } from "@/data/placement-grades";

interface PlacementSettings {
  grade: PlacementGrade;
  stage: string;
  academicYear: string;
  term: string;
  curriculum: string | null;
  curriculumVersion: string;
  verificationStatus: "needs_review" | "verified";
  sourceNote: string;
  questionCount: number;
  durationMinutes: number;
  marksPerQuestion: number;
  passPercentage: number;
  proficiencyThresholds: { developing: number; good: number; veryGood: number; excellent: number };
  topicDistribution: Array<{ topic: string; percent: number }>;
  difficultyDistribution: { Easy: number; Medium: number; Hard: number };
  isPublished: boolean;
  availableQuestionCount: number;
  topics: Array<{ topic: string; count: number }>;
  difficultyCounts: Record<string, number>;
}

interface PlacementAttempt {
  attemptId: string;
  examId: string;
  grade: string;
  academicYear: string;
  term: string;
  curriculumVersion: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

const emptyDistribution = "";

function displayTopicDistribution(value: PlacementSettings["topicDistribution"]) {
  return value.map((item) => `${item.topic}: ${item.percent}`).join("\n");
}

function parseTopicDistribution(value: string): PlacementSettings["topicDistribution"] | null {
  if (!value.trim()) return [];
  const rows = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsed = rows.map((line) => {
    const split = line.lastIndexOf(":");
    if (split < 1) return null;
    const topic = line.slice(0, split).trim();
    const percent = Number(line.slice(split + 1).trim());
    if (!topic || !Number.isFinite(percent)) return null;
    return { topic, percent };
  });
  if (parsed.some((item) => item === null)) return null;
  const topicTotal = (parsed as Array<{ topic: string; percent: number }>).reduce((sum, item) => sum + item.percent, 0);
  if (Math.round(topicTotal) !== 100) return null;
  return parsed as Array<{ topic: string; percent: number }>;
}

export const PlacementTestHub: React.FC = () => {
  const { user, lang } = useApp();
  const ar = lang === "ar";
  const [settings, setSettings] = useState<PlacementSettings[]>([]);
  const [history, setHistory] = useState<PlacementAttempt[]>([]);
  const [activeExam, setActiveExam] = useState<any>(null);
  const [activeSubmission, setActiveSubmission] = useState<any>(null);
  const [cefrOpen, setCefrOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingGrade, setStartingGrade] = useState<PlacementGrade | null>(null);
  const [openingAttemptId, setOpeningAttemptId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingGrade, setEditingGrade] = useState<PlacementGrade | "">("");
  const [topicDistributionText, setTopicDistributionText] = useState(emptyDistribution);
  const [draft, setDraft] = useState<Partial<PlacementSettings>>({});
  const currentUserId = user?.id;
  const currentUserRole = user?.role;

  const refresh = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const response = await fetch("/api/placement-settings", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load placement tests.");
      setSettings(Array.isArray(data.settings) ? data.settings : []);
      if (currentUserRole === "student") {
        const historyResponse = await fetch("/api/placement-settings?history=1", { cache: "no-store" });
        const historyData = await historyResponse.json();
        if (historyResponse.ok) setHistory(Array.isArray(historyData.history) ? historyData.history : []);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load placement tests.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentUserRole]);

  useEffect(() => {
    // Load authenticated assessment configuration from the API after account state resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (user?.role !== "student" || !user.id) return;
    let active = true;
    const storageKey = `pa-placement-active:${user.id}`;
    let savedExamId = "";
    try { savedExamId = window.localStorage.getItem(storageKey) || ""; } catch {}
    if (!savedExamId) return;
    fetch("/api/question-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_placement_test", examId: savedExamId }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.success || !data.exam) throw new Error("Saved assessment is no longer available.");
      if (active) {
        setActiveExam(data.exam);
        setActiveSubmission(data.submission || null);
      }
    }).catch(() => {
      try { window.localStorage.removeItem(storageKey); } catch {}
    });
    return () => { active = false; };
  }, [user?.id, user?.role]);

  const beginEdit = (item: PlacementSettings) => {
    setEditingGrade(item.grade);
    setDraft({ ...item });
    setTopicDistributionText(displayTopicDistribution(item.topicDistribution));
    setError("");
  };

  const updateDraft = (field: keyof PlacementSettings, value: unknown) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = async () => {
    if (!editingGrade) return;
    const topicDistribution = parseTopicDistribution(topicDistributionText);
    if (!topicDistribution) {
      setError(ar ? "اكتب توزيع الموضوعات بهذا الشكل: اسم الموضوع: النسبة، ويجب أن يكون المجموع 100%." : "Enter topic weights as Topic: percent, adding up to 100%.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/placement-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, grade: editingGrade, topicDistribution }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save settings.");
      setEditingGrade("");
      setNotice(ar ? "تم حفظ إعدادات الاختبار." : "Assessment settings saved.");
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const reviewHistoryAttempt = async (attempt: PlacementAttempt) => {
    setOpeningAttemptId(attempt.attemptId);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_placement_test", examId: attempt.examId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.exam || !data.submission) {
        throw new Error(data.error || (ar ? "تعذر فتح تقرير المحاولة." : "Could not open this attempt report."));
      }
      setActiveExam(data.exam);
      setActiveSubmission(data.submission);
      try { window.localStorage.setItem("pa-placement-active:" + currentUserId, data.exam.id); } catch {}
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : (ar ? "تعذر فتح تقرير المحاولة." : "Could not open this attempt report."));
    } finally {
      setOpeningAttemptId(null);
    }
  };

  const startGradeTest = async (grade: PlacementGrade) => {
    setStartingGrade(grade);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_placement_test", grade }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.exam) throw new Error(data.error || "Could not prepare this assessment.");
      setActiveExam(data.exam);
      setActiveSubmission(null);
      try { window.localStorage.setItem(`pa-placement-active:${currentUserId}`, data.exam.id); } catch {}
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not prepare this assessment.");
      await refresh();
    } finally {
      setStartingGrade(null);
    }
  };

  const gradeNames = useMemo(() => new Map(PLACEMENT_GRADES.map((grade) => [grade.grade, grade])), []);

  if (user?.role === "student" && activeExam) {
    return (
      <main className="mx-auto my-8 max-w-5xl space-y-4 px-4" dir={ar ? "rtl" : "ltr"}>
        <button type="button" onClick={() => { setActiveExam(null); setActiveSubmission(null); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">
          <ArrowLeft className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} />{ar ? "العودة لاختيار الصف" : "Back to grade selection"}
        </button>
        <div className={`rounded-2xl border p-4 text-xs leading-6 ${activeExam.config?.verificationStatus === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100" : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"}`}>
          {activeExam.config?.verificationStatus === "verified"
            ? (ar ? "محتوى هذا التقييم معلّم بأنه تمت مراجعته مقابل المصدر الدراسي الموضح." : "This assessment is marked as checked against its listed curriculum source.")
            : (ar ? "هذا نموذج تدريبي من بنك الأسئلة الحالي، ولم يتم توثيق مطابقته رسميًا للمنهج بعد." : "This is a practice sample from the current question bank; its curriculum alignment has not been verified yet.")}
        </div>
        <QuizPlayer
          key={activeExam.id}
          quizId={activeExam.id}
          title={activeExam.title}
          durationMinutes={activeExam.durationMinutes}
          questions={activeExam.questionsData}
          submissionTarget="smart_exam"
          assessmentMode="placement"
          assessmentConfig={activeExam.config}
          initialSubmission={activeSubmission}
          onComplete={() => { void refresh(); }}
        />
      </main>
    );
  }

  if (cefrOpen && user?.role === "student") {
    return <div dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto mt-6 max-w-4xl px-4"><button type="button" onClick={() => setCefrOpen(false)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"><ArrowLeft className={`h-4 w-4 ${ar ? "rotate-180" : ""}`} />{ar ? "العودة لاختيار نوع الاختبار" : "Back to test selection"}</button></div>
      <AdaptivePlacementTest />
    </div>;
  }

  if (!user || !["student", "admin", "teacher"].includes(user.role)) {
    return <main className="mx-auto my-10 max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-7 text-center text-sm font-bold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100" dir={ar ? "rtl" : "ltr"}>
      {ar ? "سجّل الدخول بحساب طالب لتبدأ اختبار تحديد المستوى." : "Sign in with a student account to take a placement test."}
    </main>;
  }

  return (
    <main className="mx-auto my-8 max-w-7xl space-y-7 px-4 sm:px-6" dir={ar ? "rtl" : "ltr"}>
      <header className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-2xl sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black text-blue-100"><GraduationCap className="h-4 w-4 text-sky-300" />{ar ? "تقييم مخصص للمرحلة الدراسية" : "School-grade assessment"}</div>
            <h1 className="mt-4 text-2xl font-black sm:text-3xl">{ar ? "اختبار تحديد المستوى الإنجليزي" : "English Placement Test"}</h1>
            <p className="mt-3 text-sm leading-7 text-blue-100/90">{ar ? "اختَر صفك لقياس أدائك في أسئلة بنك المنصة المخصصة له. أو استخدم اختبار CEFR المستقل من A1 إلى C2." : "Choose your grade to assess questions scoped to its question bank, or take the separate A1–C2 CEFR diagnostic."}</p>
          </div>
          {user.role === "admin" && <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold"><ShieldCheck className="h-4 w-4 text-emerald-300" />{ar ? "إدارة إعدادات التقييم" : "Assessment administration"}</span>}
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold text-blue-100">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2"><BookOpenCheck className="h-3.5 w-3.5" />{ar ? "اختبار مستقل لكل صف" : "Separate test per grade"}</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2"><Clock3 className="h-3.5 w-3.5" />{ar ? "إعدادات قابلة للتعديل" : "Configurable settings"}</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2"><ShieldCheck className="h-3.5 w-3.5" />{ar ? "لا تظهر الإجابات الصحيحة قبل التسليم" : "Answer keys stay private until submission"}</span>
        </div>
      </header>

      {error && <div role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold leading-6 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100"><AlertCircle className="mt-1 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"><CheckCircle2 className="h-4 w-4" />{notice}</div>}

      {user.role === "student" && (
        <section aria-labelledby="grade-assessments-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><h2 id="grade-assessments-title" className="text-lg font-black text-slate-900 dark:text-white">{ar ? "اختَر صفك الدراسي" : "Choose your school grade"}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ar ? "لا تختلط أسئلة صف بآخر. مستوى الصعوبة والتوزيع يحددهما إعداد الاختبار." : "Questions are scoped to one grade; each assessment has its own settings."}</p></div>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{ar ? "النتيجة تشخيصية وليست درجة امتحان رسمي" : "Diagnostic only, not an official exam grade"}</span>
          </div>
          {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900">{ar ? "بنحمّل اختبارات الصفوف..." : "Loading grade assessments..."}</div> : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {PLACEMENT_GRADES.map((grade, index) => {
                const item = settings.find((config) => config.grade === grade.grade);
                const available = item?.availableQuestionCount || 0;
                const ready = Boolean(item?.isPublished && item.questionCount > 0 && available >= item.questionCount);
                const recommended = user.grade === grade.grade;
                return (
                  <article key={grade.grade} className={`flex flex-col rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 ${recommended ? "border-blue-400 ring-2 ring-blue-100 dark:border-blue-700 dark:ring-blue-950" : "border-slate-200 dark:border-slate-800"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white"><GraduationCap className="h-5 w-5" /></div>
                      {recommended && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-800 dark:bg-blue-950/60 dark:text-blue-200">{ar ? "صفك المسجل" : "Your registered grade"}</span>}
                    </div>
                    <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">{ar ? grade.ar : grade.en}</h3>
                    <p className="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400" dir="ltr">{grade.en}</p>
                    <div className="mt-4 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between gap-2"><span>{ar ? "المدة" : "Duration"}</span><strong>{item?.durationMinutes ? `${item.durationMinutes} ${ar ? "دقيقة" : "min"}` : (ar ? "بدون توقيت" : "Untimed")}</strong></div>
                      <div className="flex items-center justify-between gap-2"><span>{ar ? "الأسئلة المطلوبة" : "Configured questions"}</span><strong>{item?.questionCount ?? 30}</strong></div>
                      <div className="flex items-center justify-between gap-2"><span>{ar ? "المتاح في البنك" : "Available in bank"}</span><strong className={available >= (item?.questionCount || 30) ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}>{available}</strong></div>
                    </div>
                    {item?.topics?.length ? <div className="mt-4"><p className="text-[9px] font-black uppercase tracking-wide text-slate-400">{ar ? "موضوعات موجودة في البنك" : "Topics in the bank"}</p><div className="mt-2 flex flex-wrap gap-1.5">{item.topics.slice(0, 4).map((topic) => <span key={topic.topic} className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{topic.topic}</span>)}</div></div> : null}
                    <div className={`mt-4 rounded-xl px-3 py-2 text-[10px] font-bold leading-5 ${item?.verificationStatus === "verified" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200" : "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"}`}>
                      {item?.verificationStatus === "verified" ? (ar ? "المصدر معلّم بأنه تمت مراجعته" : "Source marked as reviewed") : (ar ? "نموذج تدريبي؛ لم يتم توثيق مطابقته رسميًا" : "Practice sample; curriculum alignment not yet verified")}
                    </div>
                    <button type="button" disabled={!ready || startingGrade !== null} onClick={() => void startGradeTest(grade.grade)} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none">
                      <FileQuestion className="h-4 w-4" />{startingGrade === grade.grade ? (ar ? "بنجهز الاختبار..." : "Preparing test...") : !item?.isPublished ? (ar ? "غير منشور" : "Not published") : !ready ? (ar ? "استكمال بنك الأسئلة مطلوب" : "Question bank needs more items") : (ar ? "ابدأ الاختبار" : "Start test")}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {user.role === "student" && (
        <section className="rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50 p-5 dark:border-violet-900/50 dark:from-violet-950/25 dark:to-blue-950/25 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div><div className="inline-flex items-center gap-2 text-xs font-black text-violet-900 dark:text-violet-100"><Sparkles className="h-4 w-4 text-violet-600" />CEFR · A1–C2</div><p className="mt-2 text-[11px] leading-5 text-slate-600 dark:text-slate-300">{ar ? "اختبار مستوى عام مستقل عن الصف الدراسي؛ يغطي القواعد والمفردات والوظائف اللغوية والقراءة." : "A separate general-level test across grammar, vocabulary, functional English and reading."}</p></div>
          <button type="button" onClick={() => setCefrOpen(true)} className="mt-4 min-h-11 shrink-0 rounded-xl bg-violet-700 px-5 py-3 text-xs font-black text-white hover:bg-violet-600 sm:mt-0">{ar ? "اختبار A1–C2" : "Take CEFR test"}</button>
        </section>
      )}

      {user.role === "student" && (
        <section aria-labelledby="placement-history-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3"><div><h2 id="placement-history-title" className="text-sm font-black text-slate-900 dark:text-white">{ar ? "سجل اختبارات الصف" : "School assessment history"}</h2><p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{ar ? "محاولاتك مرتبطة بحسابك ولا يراها طالب آخر." : "Your attempts are linked to your account and are not visible to other students."}</p></div><button type="button" onClick={() => void refresh()} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold dark:border-slate-700">{ar ? "تحديث" : "Refresh"}</button></div>
          {history.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {history.slice(0, 6).map((attempt, attemptIndex) => {
                const previousAttempt = history.slice(attemptIndex + 1).find((candidate) =>
                  candidate.grade === attempt.grade &&
                  candidate.academicYear === attempt.academicYear &&
                  candidate.term === attempt.term &&
                  candidate.curriculumVersion === attempt.curriculumVersion &&
                  candidate.totalQuestions === attempt.totalQuestions
                );
                const scoreChange = previousAttempt ? attempt.percentage - previousAttempt.percentage : null;
                const comparisonClass = scoreChange === null ? "text-slate-500 dark:text-slate-400" : scoreChange > 0 ? "text-emerald-700 dark:text-emerald-300" : scoreChange < 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-600 dark:text-slate-300";
                const comparisonText = scoreChange === null
                  ? (ar ? "لا توجد محاولة سابقة مماثلة للمقارنة" : "No comparable earlier attempt")
                  : scoreChange > 0
                    ? (ar ? `تحسن ${scoreChange} نقطة مئوية عن محاولة مماثلة` : `Up ${scoreChange} percentage points vs a comparable attempt`)
                    : scoreChange < 0
                      ? (ar ? `أقل بـ ${Math.abs(scoreChange)} نقطة مئوية عن محاولة مماثلة` : `Down ${Math.abs(scoreChange)} percentage points vs a comparable attempt`)
                      : (ar ? "نفس النسبة في المحاولة المماثلة" : "Same score as the comparable attempt");
                return (
                  <article key={attempt.attemptId} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-xs text-slate-800 dark:text-white">{ar ? (gradeNames.get(attempt.grade as PlacementGrade)?.ar || attempt.grade) : (gradeNames.get(attempt.grade as PlacementGrade)?.en || attempt.grade)}</strong>
                      <span className="text-sm font-black text-blue-700 dark:text-blue-300">{attempt.percentage}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{attempt.score} / {attempt.totalQuestions} · {attempt.academicYear || (ar ? "سنة غير محددة" : "Year not set")}</p>
                    <p className="mt-1 text-[9px] text-slate-400">{new Date(attempt.completedAt).toLocaleDateString(ar ? "ar-EG" : "en-GB")}</p>
                    <p className={`mt-2 text-[9px] font-bold leading-5 ${comparisonClass}`}>{comparisonText}</p>
                    <button type="button" onClick={() => void reviewHistoryAttempt(attempt)} disabled={openingAttemptId !== null} className="mt-2 min-h-9 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black text-blue-800 transition hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200 dark:hover:bg-blue-950/50">{openingAttemptId === attempt.attemptId ? (ar ? "جارٍ فتح التقرير..." : "Opening report...") : (ar ? "راجع التقرير" : "Review report")}</button>
                  </article>
                );
              })}
            </div>
          ) : <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{ar ? "ستظهر نتائجك هنا بعد أول اختبار." : "Your results will appear here after your first test."}</p>}
        </section>
      )}

      {user.role === "admin" && <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"><Settings2 className="h-5 w-5" /></div><div><h2 className="text-sm font-black text-slate-900 dark:text-white">{ar ? "إعدادات اختبارات الصفوف" : "Grade assessment settings"}</h2><p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">{ar ? "إعدادات التطوير ليست مواصفات رسمية. راجع مصدر المحتوى وتوزيعه قبل تعليم التقييم بأنه موثق." : "Development defaults are not official specifications. Verify sources and coverage before marking an assessment as checked."}</p></div></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{settings.map((item) => <article key={item.grade} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex items-start justify-between gap-2"><div><h3 className="text-xs font-black text-slate-900 dark:text-white">{ar ? (gradeNames.get(item.grade)?.ar || item.grade) : (gradeNames.get(item.grade)?.en || item.grade)}</h3><p className="mt-1 text-[10px] text-slate-500">{item.availableQuestionCount}/{item.questionCount} {ar ? "سؤال صالح" : "valid questions"} · {item.verificationStatus === "verified" ? (ar ? "موثق" : "Checked") : (ar ? "قيد المراجعة" : "Needs review")}</p></div><button type="button" onClick={() => beginEdit(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold dark:border-slate-700">{ar ? "تعديل" : "Edit"}</button></div></article>)}</div>
        {editingGrade && <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-black text-slate-900 dark:text-white">{ar ? `تعديل إعدادات: ${gradeNames.get(editingGrade)?.ar}` : `Edit: ${gradeNames.get(editingGrade)?.en}`}</h3><button type="button" onClick={() => setEditingGrade("")} className="text-[10px] font-bold text-slate-500">{ar ? "إلغاء" : "Cancel"}</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([["academicYear", ar ? "السنة الدراسية" : "Academic year", "text"], ["term", ar ? "الفصل الدراسي" : "Term", "text"], ["curriculum", ar ? "اسم المنهج" : "Curriculum", "text"], ["curriculumVersion", ar ? "إصدار المنهج" : "Curriculum version", "text"], ["questionCount", ar ? "عدد الأسئلة" : "Question count", "number"], ["durationMinutes", ar ? "المدة (0 بلا توقيت)" : "Duration (0 = untimed)", "number"], ["marksPerQuestion", ar ? "درجة السؤال" : "Marks per question", "number"], ["passPercentage", ar ? "حد الاجتياز %" : "Pass threshold %", "number"]] as Array<[keyof PlacementSettings, string, string]>).map(([field, label, type]) => <label key={field} className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{label}<input type={type} value={String(draft[field] ?? "")} onChange={(event) => updateDraft(field, type === "number" ? Number(event.target.value) : event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>)}
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{ar ? "المصدر / ملاحظة المراجعة" : "Source / review note"}<textarea value={String(draft.sourceNote ?? "")} onChange={(event) => updateDraft("sourceNote", event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{ar ? "حالة التحقق" : "Verification status"}<select value={draft.verificationStatus || "needs_review"} onChange={(event) => updateDraft("verificationStatus", event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-900"><option value="needs_review">{ar ? "تحتاج مراجعة" : "Needs review"}</option><option value="verified">{ar ? "تمت المراجعة" : "Checked"}</option></select></label>
            <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-3 py-3 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-900"><input type="checkbox" checked={draft.isPublished !== false} onChange={(event) => updateDraft("isPublished", event.target.checked)} />{ar ? "منشور للطلاب" : "Published to students"}</label>
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-200 sm:col-span-2">{ar ? "توزيع الصعوبة (النسب يجب أن تساوي 100)" : "Difficulty split (must total 100%)"}<div className="mt-1 grid grid-cols-3 gap-2">{(["Easy", "Medium", "Hard"] as const).map((difficulty) => <input key={difficulty} type="number" aria-label={difficulty} min={0} max={100} value={draft.difficultyDistribution?.[difficulty] ?? 0} onChange={(event) => updateDraft("difficultyDistribution", { ...(draft.difficultyDistribution || { Easy: 30, Medium: 50, Hard: 20 }), [difficulty]: Number(event.target.value) })} className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />)}</div><span className="mt-1 flex justify-between font-normal text-slate-400"><span>Easy</span><span>Medium</span><span>Hard</span></span></label>
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-200 sm:col-span-2">{ar ? "توزيع الموضوعات — اسم الموضوع: النسبة (المجموع 100%)" : "Topic distribution — Topic: percent (must total 100%)"}<textarea value={topicDistributionText} onChange={(event) => setTopicDistributionText(event.target.value)} placeholder={ar ? "القواعد: 40\nالمفردات: 40\nالقراءة: 20" : "Grammar: 40\nVocabulary: 40\nReading: 20"} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{ar ? "حدود مستوى الأداء" : "Proficiency bands"}<div className="mt-1 grid grid-cols-4 gap-1">{([["developing", ar ? "تأسيس" : "Developing"], ["good", ar ? "جيد" : "Good"], ["veryGood", ar ? "جيد جدًا" : "Very good"], ["excellent", ar ? "ممتاز" : "Excellent"]] as const).map(([key, label]) => <input key={key} type="number" aria-label={label} min={0} max={100} value={draft.proficiencyThresholds?.[key] ?? 0} onChange={(event) => updateDraft("proficiencyThresholds", { ...(draft.proficiencyThresholds || { developing: 40, good: 60, veryGood: 75, excellent: 90 }), [key]: Number(event.target.value) })} className="min-h-10 w-16 rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900" />)}</div></label>
            <button type="button" onClick={() => void saveSettings()} disabled={saving} className="ms-auto min-h-10 rounded-xl bg-blue-700 px-5 py-2 text-xs font-black text-white disabled:opacity-50">{saving ? (ar ? "جاري الحفظ..." : "Saving...") : (ar ? "حفظ إعدادات الصف" : "Save grade settings")}</button>
          </div>
        </div>}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] leading-5 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">{ar ? <>إدارة الأسئلة والتحقق من مصدرها تتم من <Link className="font-black text-blue-700 underline dark:text-blue-300" href="/?tab=question_bank">مساحة بنك الأسئلة</Link>. لا يتحول الاختبار إلى موثق بمجرد تغيير الإعداد؛ راجع المحتوى والمصدر قبل ذلك.</> : <>Manage and verify question content in the <Link className="font-black text-blue-700 underline dark:text-blue-300" href="/?tab=question_bank">Question Bank workspace</Link>. Review the content and source before marking the assessment verified.</>}</div>
      </section>}

      {user.role === "teacher" && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-6 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-100">{ar ? "إنشاء اختبارات الصفوف ونشرها متاح لمسؤولي المنصة. يمكنك إدارة أسئلة الصف من بنك الأسئلة وفق صلاحياتك." : "Grade assessment settings are managed by platform administrators. You can manage question-bank items within your role permissions."}</div>}
    </main>
  );
};
