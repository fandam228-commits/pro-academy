"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PdfViewer } from "@/components/PdfViewer";
import { QuizPlayer } from "@/components/QuizPlayer";
import { PaymentModal } from "@/components/PaymentModal";
import {
  BookOpen,
  Play,
  FileText,
  Lock,
  Unlock,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowLeft,
  Clock,
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
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [attachedPdfs, setAttachedPdfs] = useState<any[]>([]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses?id=${courseId}&studentId=${user?.id || "usr_student_1"}`);
      const json = await res.json();
      setData(json);

      // Auto-select first lesson
      if (json.units && json.units.length > 0 && json.units[0].lessons.length > 0) {
        setSelectedLesson(json.units[0].lessons[0]);
      }

      // Fetch PDF documents linked to this course
      try {
        const pdfRes = await fetch(`/api/pdfs?courseId=${courseId}`);
        const pdfJson = await pdfRes.json();
        setAttachedPdfs(pdfJson.documents || []);
      } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [courseId]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 font-medium">Loading course contents...</div>;
  }

  const { course, units: unitsList, isEnrolled } = data || {};

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

        {!isEnrolled && (
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
            
            {isEnrolled ? (
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE VIDEO PLAYER OR PDF READER */}
        <div className="lg:col-span-2 space-y-6">
          {selectedLesson ? (
            <div>
              {!showPdf ? (
                <VideoPlayer
                  videoUrl={selectedLesson.videoUrl}
                  title={selectedLesson.title}
                  lessonId={selectedLesson.id}
                />
              ) : (
                <PdfViewer pdfUrl={selectedLesson.pdfUrl || ""} title={`${selectedLesson.title} - Notes`} />
              )}

              {/* TOGGLE VIDEO / PDF */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setShowPdf(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    !showPdf ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>{lang === "ar" ? "مشاهدة الفيديو" : "Watch Lecture Video"}</span>
                </button>

                <button
                  onClick={() => setShowPdf(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    showPdf ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{lang === "ar" ? "عرض شيت PDF المرفق" : "View PDF Material"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              {lang === "ar" ? "اختر درساً من القائمة لبدء التعلم" : "Select a lesson from curriculum to begin watching."}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: UNITS & LESSONS LIST */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            {lang === "ar" ? "محتويات ومنهج الكورس:" : "Course Curriculum Units:"}
          </h3>

          <div className="space-y-4">
            {unitsList?.map((u: any) => (
              <div key={u.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-md">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-3 text-blue-600 dark:text-blue-400">
                  {u.title}
                </h4>

                <div className="space-y-2">
                  {u.lessons?.map((lsn: any) => {
                    const isSelected = selectedLesson?.id === lsn.id;
                    const canAccess = lsn.isFree || isEnrolled;

                    return (
                      <button
                        key={lsn.id}
                        disabled={!canAccess}
                        onClick={() => {
                          setSelectedLesson(lsn);
                          setShowPdf(false);
                        }}
                        className={`w-full text-start p-3 rounded-2xl transition-all border flex items-center justify-between text-xs font-medium ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 font-bold"
                            : canAccess
                            ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                            : "bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 text-slate-400 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {canAccess ? <Play className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                          <span>{lsn.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{lsn.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

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
      </div>

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
