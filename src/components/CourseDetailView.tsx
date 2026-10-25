"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { QuizPlayer } from "@/components/QuizPlayer";
import { PaymentModal } from "@/components/PaymentModal";
import { UnitLearningExperience, type LearningLesson, type LearningQuiz, type LearningUnit } from "@/components/UnitLearningExperience";
import { authHeaders } from "@/lib/client-auth";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Award,
  ArrowLeft,
  ShieldAlert,
  Database,
} from "lucide-react";

interface CourseDetailProps {
  courseId: string;
  onBack?: () => void;
}

export const CourseDetailView: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const { lang, user } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<LearningQuiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<LearningQuiz[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [attachedPdfs, setAttachedPdfs] = useState<any[]>([]);

  const fetchDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses?id=${encodeURIComponent(courseId)}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to load course.");
      setLoadError(null);
      setData(json);
      const completed = Array.isArray(json.enrollment?.completedLessonIds) ? json.enrollment.completedLessonIds : [];
      setCompletedLessonIds(completed);

      const unitRows: LearningUnit[] = Array.isArray(json.units) ? json.units : [];
      const lessons = unitRows.flatMap((unit) => Array.isArray(unit.lessons) ? unit.lessons : []);
      const canView = (lesson: LearningLesson) => Boolean(lesson.isFree || json.isEnrolled || user?.role === "admin" || user?.role === "teacher");
      setSelectedLesson((current) => lessons.find((lesson) => lesson.id === current?.id) || lessons.find(canView) || lessons[0] || null);

      const pdfRes = await fetch(`/api/pdfs?courseId=${encodeURIComponent(courseId)}`);
      if (pdfRes.ok) {
        const pdfJson = await pdfRes.json();
        setAttachedPdfs(Array.isArray(pdfJson.documents) ? pdfJson.documents : []);
      }
      if (user && ["student", "teacher", "admin"].includes(user.role)) {
        const quizRes = await fetch(`/api/quizzes?courseId=${encodeURIComponent(courseId)}`);
        if (quizRes.ok) {
          const quizJson = await quizRes.json();
          setQuizzes(Array.isArray(quizJson.quizzes) ? quizJson.quizzes : []);
        } else {
          setQuizzes([]);
        }
      } else {
        setQuizzes([]);
      }
    } catch (e) {
      console.error(e);
      setLoadError(e instanceof Error ? e.message : (lang === "ar" ? "تعذر تحميل محتوى الكورس." : "Could not load course content."));
    } finally {
      setLoading(false);
    }
  }, [courseId, user, lang]);

  useEffect(() => {
    // This starts an async request; all state updates happen after fetchDetails awaits network I/O.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDetails();
  }, [fetchDetails]);

  const handleCompleteLesson = async (lesson: LearningLesson) => {
    if (!user || user.role !== "student") return;
    setCompletingLessonId(lesson.id);
    setCompleteError(null);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "complete_lesson", courseId, lessonId: lesson.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not save lesson completion.");
      setCompletedLessonIds((current) => current.includes(lesson.id) ? current : [...current, lesson.id]);
      setData((current: any) => current ? { ...current, enrollment: { ...current.enrollment, progress: json.progress } } : current);
    } catch (error) {
      setCompleteError(error instanceof Error ? error.message : (lang === "ar" ? "تعذر حفظ التقدم." : "Could not save progress."));
    } finally {
      setCompletingLessonId(null);
    }
  };

  const handleOpenQuiz = async (quiz: LearningQuiz) => {
    setActiveQuiz(quiz);
    setQuizLoading(true);
    setQuizError(null);
    setShowQuiz(true);
    try {
      const res = await fetch(`/api/quizzes?id=${encodeURIComponent(quiz.id)}&studentId=${encodeURIComponent(user?.id || "")}`);
      const json = await res.json();
      if (!res.ok || !Array.isArray(json.questions)) throw new Error(json.error || "Failed to load assessment.");
      setQuizQuestions(json.questions);
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : (lang === "ar" ? "تعذر تحميل الاختبار." : "Could not load assessment."));
      setQuizQuestions([]);
    } finally {
      setQuizLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 font-medium">Loading course contents...</div>;
  }

  if (loadError || !data?.course) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center" role="alert"><p className="font-bold text-rose-700 dark:text-rose-300">{loadError || (lang === "ar" ? "الكورس غير متاح." : "Course unavailable.")}</p><button type="button" onClick={() => { setLoading(true); setLoadError(null); void fetchDetails(); }} className="mt-4 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white">{lang === "ar" ? "إعادة المحاولة" : "Try again"}</button></div>;
  }

  const { course, units: unitsList, isEnrolled } = data;
  const isPrivileged = user?.role === "admin" || user?.role === "teacher";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* TOP NAVIGATION BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{lang === "ar" ? "العودة للكورسات" : "Back to Courses"}</span>
        </button>

        {!isEnrolled && !isPrivileged && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all"
          >
            {lang === "ar" ? `تفعيل الكورس الان (${course?.price} EGP)` : `Enroll Now (${course?.price} EGP)`}
          </button>
        )}
      </div>

      {/* COURSE HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-blue-300">
              {course?.grade}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 leading-snug">{course?.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">{course?.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Instructor: {course?.teacherName}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Anti-Download Protected Content</span>
              </span>
            </div>
          </div>

          <div className="w-full md:w-72 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-slate-300 block mb-1">{lang === "ar" ? "سعر الاشتراك الرسمي" : "Course Price"}</span>
            <div className="text-3xl font-black text-amber-300">{course?.price} EGP</div>
            
            {isEnrolled || isPrivileged ? (
              <div className="mt-4 p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === "ar" ? "الكورس مفعل بحسابك" : "Course Unlocked"}</span>
              </div>
            ) : (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 text-white font-extrabold text-xs shadow-lg transition-all"
              >
                {lang === "ar" ? "اشترك ورخص محتواك" : "Unlock Course Access"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BACCALAUREATE MODEL A 2027 QUESTION BANK */}
      {courseId === "crs_sec_3" && (
        <button
          onClick={() => {
            window.location.href = "/?tab=question_bank&stage=Secondary&grade=Second%20Secondary&curriculum=Baccalaureate&term=First&domainCategory=Vocabulary%2CGrammar&unit=Unit%201&source=Giants%20Exam%20%E2%80%94%20Second%20Secondary%20Model%20A%202027";
          }}
          className="w-full rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 p-[1px] shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <div className="rounded-[23px] bg-white dark:bg-slate-950 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-start">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-black text-sm text-slate-900 dark:text-white">بنك البكالوريا — نموذج A 2027</div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">Unit 1 • Vocabulary + Grammar • 113 سؤالًا</div>
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black">فتح البنك</span>
          </div>
        </button>
      )}

      {/* FIRST SECONDARY VOCABULARY + GRAMMAR QUESTION BANK */}
      {courseId === "crs_sec_1" && (
        <button
          onClick={() => {
            window.location.href = "/?tab=question_bank&stage=Secondary&grade=First%20Secondary&curriculum=Ministry&term=First&domainCategory=Vocabulary%2CGrammar&unit=Units%201-2";
          }}
          className="w-full rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 p-[1px] shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <div className="rounded-[23px] bg-white dark:bg-slate-950 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-start">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="font-black text-sm text-slate-900 dark:text-white">بنك أسئلة أولى ثانوي — كلمات + Grammar</div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">وحدتا 1 و2 • كل أسئلة الكلمات والجرامر الموجودة في بنك أولى ثانوي</div>
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black">فتح بنك الأسئلة →</span>
          </div>
        </button>
      )}

      {/* WORKSPACE: VIDEO PLAYER & CURRICULUM ACCORDION */}
      {showQuiz && activeQuiz ? (
        <section className="space-y-4">
          <button type="button" onClick={() => setShowQuiz(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{lang === "ar" ? "العودة إلى الوحدة" : "Back to unit"}</button>
          {quizLoading ? <div className="py-16 text-center text-slate-500">{lang === "ar" ? "جارٍ تحميل الاختبار..." : "Loading assessment..."}</div> : quizError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{quizError}</div> : <QuizPlayer quizId={activeQuiz.id} title={activeQuiz.title} durationMinutes={activeQuiz.durationMinutes || 30} questions={quizQuestions} onExit={() => setShowQuiz(false)} />}
        </section>
      ) : (
        <UnitLearningExperience
          units={(unitsList || []) as LearningUnit[]}
          selectedLesson={selectedLesson}
          completedLessonIds={completedLessonIds}
          isEnrolled={Boolean(isEnrolled)}
          isPrivileged={isPrivileged}
          lang={lang}
          showPdf={showPdf}
          onSelectLesson={(lesson) => { setSelectedLesson(lesson); setShowPdf(false); setCompleteError(null); }}
          onTogglePdf={setShowPdf}
          onCompleteLesson={handleCompleteLesson}
          completingLessonId={completingLessonId}
          completeError={completeError}
          quizzes={quizzes}
          onOpenQuiz={handleOpenQuiz}
        />
      )}

      {!showQuiz && (
        <div className="space-y-4">

          {/* ============ LINKED PDF ATTACHMENTS ============ */}
          {attachedPdfs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-md">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-3 text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {lang === "ar" ? "مذكرات PDF المرفقة بهذا الكورس" : "Attached Course PDFs"}
              </h4>
              <div className="space-y-2">
                {attachedPdfs.map((pdf) => (
                  <a
                    key={pdf.id}
                    href={`/api/pdfs/file/${pdf.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/60 dark:bg-slate-800/70 border border-sky-200 dark:border-slate-700 hover:border-sky-500 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{pdf.title}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">{pdf.topic} • 👁 {pdf.views || 0}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAYMENT MODAL TRIGGER */}
      {showPaymentModal && (
        <PaymentModal
          courseId={courseId}
          courseTitle={course?.title || "English Course"}
          price={course?.price || "250.00"}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchDetails();
          }}
        />
      )}
    </div>
  );
};

