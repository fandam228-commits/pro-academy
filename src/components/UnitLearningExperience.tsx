"use client";

import React from "react";
import { FileText, Lock, Play, CheckCircle2, Circle, BookOpen, Award } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PdfViewer } from "@/components/PdfViewer";

export interface LearningLesson {
  id: string;
  unitId: string;
  title: string;
  description?: string | null;
  videoUrl?: string;
  duration?: string | null;
  pdfUrl?: string | null;
  orderIndex?: number;
  isFree?: boolean;
}

export interface LearningUnit {
  id: string;
  title: string;
  description?: string | null;
  orderIndex?: number;
  lessons: LearningLesson[];
}

export interface LearningQuiz {
  id: string;
  unitId?: string | null;
  lessonId?: string | null;
  title: string;
  durationMinutes?: number | null;
}

interface UnitLearningExperienceProps {
  units: LearningUnit[];
  selectedLesson: LearningLesson | null;
  completedLessonIds: string[];
  isEnrolled: boolean;
  isPrivileged: boolean;
  lang: "ar" | "en";
  showPdf: boolean;
  onSelectLesson: (lesson: LearningLesson) => void;
  onTogglePdf: (showPdf: boolean) => void;
  onCompleteLesson: (lesson: LearningLesson) => void;
  completingLessonId: string | null;
  completeError: string | null;
  quizzes: LearningQuiz[];
  onOpenQuiz: (quiz: LearningQuiz) => void;
}

export function UnitLearningExperience({
  units,
  selectedLesson,
  completedLessonIds,
  isEnrolled,
  isPrivileged,
  lang,
  showPdf,
  onSelectLesson,
  onTogglePdf,
  onCompleteLesson,
  completingLessonId,
  completeError,
  quizzes,
  onOpenQuiz,
}: UnitLearningExperienceProps) {
  const ar = lang === "ar";
  const sortedUnits = [...units].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const activeUnit = sortedUnits.find((unit) => unit.lessons.some((lesson) => lesson.id === selectedLesson?.id));
  const allLessons = sortedUnits.flatMap((unit) => unit.lessons);
  const completedCount = allLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const progress = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const completed = selectedLesson ? completedLessonIds.includes(selectedLesson.id) : false;
  const canAccess = Boolean(selectedLesson && (selectedLesson.isFree || isEnrolled || isPrivileged));

  return (
    <section className="space-y-5" aria-label={ar ? "تجربة تعلم الوحدات" : "Unit learning experience"}>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"><BookOpen className="h-5 w-5" /></span>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white">{ar ? "رحلة التعلم" : "Your learning path"}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ar ? `${completedCount} من ${allLessons.length} دروس مكتملة` : `${completedCount} of ${allLessons.length} lessons complete`}</p>
            </div>
          </div>
          <span className="text-sm font-black text-blue-700 dark:text-blue-300">{progress}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label={ar ? "نسبة إكمال الكورس" : "Course completion"} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-amber-500 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <div className="min-w-0 space-y-4">
          {selectedLesson && canAccess ? (
            <>
              {showPdf && selectedLesson.pdfUrl ? (
                <PdfViewer pdfUrl={selectedLesson.pdfUrl} title={`${selectedLesson.title} - Notes`} />
              ) : selectedLesson.videoUrl ? (
                <VideoPlayer videoUrl={selectedLesson.videoUrl} title={selectedLesson.title} lessonId={selectedLesson.id} />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
                  {ar ? "لا يوجد فيديو أو ملف مرفق لهذا الدرس حتى الآن." : "This lesson does not have a video or PDF attached yet."}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedLesson.videoUrl && (
                  <button type="button" aria-pressed={!showPdf} onClick={() => onTogglePdf(false)} className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${!showPdf ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
                    <Play className="h-4 w-4" />{ar ? "مشاهدة الفيديو" : "Lesson video"}
                  </button>
                )}
                {selectedLesson.pdfUrl && (
                  <button type="button" aria-pressed={showPdf} onClick={() => onTogglePdf(true)} className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${showPdf ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
                    <FileText className="h-4 w-4" />{ar ? "مذكرة الدرس" : "Lesson notes"}
                  </button>
                )}
              </div>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">{activeUnit?.title}</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{selectedLesson.title}</h2>
                    {selectedLesson.duration && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{selectedLesson.duration}</p>}
                  </div>
                  {completed && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" />{ar ? "مكتمل" : "Completed"}</span>}
                </div>
                {activeUnit?.description && <p className="mt-4 rounded-2xl bg-blue-50/70 p-4 text-sm leading-7 text-slate-700 dark:bg-blue-950/30 dark:text-slate-200">{activeUnit.description}</p>}
                {selectedLesson.description && <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{selectedLesson.description}</p>}
                {!selectedLesson.description && !activeUnit?.description && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{ar ? "تابع محتوى الدرس والفيديو أو المذكرة المرفقة." : "Follow the lesson content in the video or attached notes."}</p>}
                {completeError && <p role="alert" className="mt-4 text-sm font-semibold text-rose-700 dark:text-rose-300">{completeError}</p>}
                {isEnrolled && !isPrivileged && !completed && (
                  <button type="button" onClick={() => onCompleteLesson(selectedLesson)} disabled={completingLessonId === selectedLesson.id} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60">
                    <CheckCircle2 className="h-4 w-4" />{completingLessonId === selectedLesson.id ? (ar ? "جارٍ الحفظ..." : "Saving...") : (ar ? "إكمال الدرس" : "Mark lesson complete")}
                  </button>
                )}
              </article>
            </>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <div><Lock className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-bold text-slate-700 dark:text-slate-200">{ar ? "اختر درساً متاحاً لبدء التعلم" : "Choose an available lesson to begin"}</p></div>
            </div>
          )}
        </div>

        <aside className="space-y-4" aria-label={ar ? "قائمة الوحدات والدروس" : "Units and lessons"}>
          <h2 className="px-1 text-sm font-black text-slate-900 dark:text-white">{ar ? "الوحدات والدروس" : "Units & lessons"}</h2>
          {sortedUnits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">{ar ? "لا توجد وحدات منشورة في هذا الكورس بعد." : "No units have been added to this course yet."}</div>
          ) : sortedUnits.map((unit) => {
            const lessons = [...unit.lessons].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
            const unitDone = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
            return (
              <section key={unit.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div><h3 className="text-sm font-black text-slate-900 dark:text-white">{unit.title}</h3>{unit.description && <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{unit.description}</p>}</div>
                  {lessons.length > 0 && unitDone === lessons.length && <Award className="h-4 w-4 shrink-0 text-amber-500" aria-label={ar ? "اكتملت الوحدة" : "Unit complete"} />}
                </div>
                {lessons.length === 0 ? <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800">{ar ? "لا توجد دروس في هذه الوحدة بعد." : "No lessons in this unit yet."}</p> : <div className="space-y-2">
                  {lessons.map((lesson) => {
                    const selected = selectedLesson?.id === lesson.id;
                    const accessible = Boolean(lesson.isFree || isEnrolled || isPrivileged);
                    const lessonDone = completedLessonIds.includes(lesson.id);
                    return <button key={lesson.id} type="button" disabled={!accessible} aria-current={selected ? "page" : undefined} onClick={() => onSelectLesson(lesson)} className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-2xl border p-3 text-start text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed ${selected ? "border-blue-600 bg-blue-50 font-bold text-blue-800 dark:bg-blue-950/50 dark:text-blue-200" : accessible ? "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" : "border-slate-200 bg-slate-100/50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"}`}>
                      <span className="flex min-w-0 items-center gap-2">{!accessible ? <Lock className="h-4 w-4 shrink-0" /> : lessonDone ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0 text-slate-400" />}<span className="truncate">{lesson.title}</span></span>
                      <span className="shrink-0 text-[10px] text-slate-400">{lesson.duration}</span>
                    </button>;
                  })}
                </div>}
                {isEnrolled && !isPrivileged && quizzes.filter((quiz) => quiz.unitId === unit.id || lessons.some((lesson) => lesson.id === quiz.lessonId)).map((quiz) => (
                  <button key={quiz.id} type="button" onClick={() => onOpenQuiz(quiz)} className="mt-3 flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-start text-xs font-bold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    <span className="flex items-center gap-2"><Award className="h-4 w-4 shrink-0" />{quiz.title}</span><span className="shrink-0 text-[10px] opacity-70">{quiz.durationMinutes ? `${quiz.durationMinutes} min` : ""}</span>
                  </button>
                ))}
              </section>
            );
          })}
        </aside>
      </div>
    </section>
  );
}

