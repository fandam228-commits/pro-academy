"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  NotebookPen,
  Plus,
  Clock,
  UploadCloud,
  CheckCircle2,
  FileText,
  X,
  Send,
  Star,
  Trash2,
  Loader2,
  AlertTriangle,
  CalendarDays,
  Users,
} from "lucide-react";

export const HomeworkWorkspace: React.FC = () => {
  const { user, lang } = useApp();
  const isStaff = user?.role === "teacher" || user?.role === "admin";

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null); // teacher: homework + submissions

  // Teacher create form
  const [showCreate, setShowCreate] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cGrade, setCGrade] = useState("Third Secondary (Baccalaureate)");
  const [cUnit, setCUnit] = useState("Unit 1");
  const [cDue, setCDue] = useState("");
  const [cPoints, setCPoints] = useState(50);

  // Student submit modal
  const [submitHw, setSubmitHw] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Grading modal
  const [gradeSub, setGradeSub] = useState<any>(null);
  const [gScore, setGScore] = useState(0);
  const [gFeedback, setGFeedback] = useState("");

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/homework");
      const json = await res.json();
      setList(json.homeworkList || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, [user?.id]);

  const openDetail = async (hw: any) => {
    setDetail(null);
    try {
      const res = await fetch(`/api/homework?homeworkId=${hw.id}`);
      const json = await res.json();
      setDetail(json);
    } catch {}
  };

  const handleCreate = async () => {
    if (!cTitle || !cDue) {
      setMsg({ type: "error", text: lang === "ar" ? "العنوان وتاريخ التسليم مطلوبان" : "Title & due date required" });
      return;
    }
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "create",
          homeworkData: { title: cTitle, description: cDesc, grade: cGrade, unit: cUnit, dueDate: cDue, totalPoints: cPoints },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: "success", text: lang === "ar" ? "تم نشر الواجب وإخطار الطلاب ✓" : "Homework published & students notified ✓" });
        setShowCreate(false);
        setCTitle(""); setCDesc(""); setCDue("");
        fetchList();
      } else setMsg({ type: "error", text: json.error || "Failed" });
    } catch {
      setMsg({ type: "error", text: "Network error" });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText && !answerFile) {
      setMsg({ type: "error", text: lang === "ar" ? "اكتب الإجابة أو ارفع ملفاً" : "Write answer or attach a file" });
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("homeworkId", submitHw.id);
      form.append("answerText", answerText);
      if (answerFile) form.append("file", answerFile);
      const res = await fetch("/api/homework", { method: "POST", headers: { ...authHeaders() }, body: form });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: "success", text: lang === "ar" ? "تم تسليم واجبك بنجاح 📥" : "Homework submitted 📥" });
        setSubmitHw(null);
        setAnswerText(""); setAnswerFile(null);
        fetchList();
      } else setMsg({ type: "error", text: json.error || "Failed" });
    } catch {
      setMsg({ type: "error", text: "Network error" });
    }
    setSubmitting(false);
  };

  const handleGrade = async () => {
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "grade", submissionId: gradeSub.id, score: gScore, feedback: gFeedback }),
      });
      const json = await res.json();
      if (json.success) {
        setGradeSub(null);
        setGScore(0); setGFeedback("");
        if (detail?.homework) openDetail(detail.homework);
        fetchList();
      }
    } catch {}
  };

  const handleDelete = async (hwId: string) => {
    try {
      await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "delete", homeworkId: hwId }),
      });
      setDetail(null);
      fetchList();
    } catch {}
  };

  const isOverdue = (due: string) => new Date(due) < new Date();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <NotebookPen className="w-8 h-8" />
            {lang === "ar" ? "نظام الواجبات والتسليم" : "Homework & Submissions"}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2">
            {isStaff
              ? lang === "ar"
                ? "انزل واجبات جديدة، وتابع تسليمات الطلاب، وصحح بالدرجات والملاحظات."
                : "Assign homework, track submissions, and grade with feedback."
              : lang === "ar"
              ? "سلّم واجباتك كتابة أو بملف مرفق، وتابع درجاتك وملاحظات المدرس."
              : "Submit answers as text or attachments and track grades & feedback."}
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 font-extrabold text-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            {lang === "ar" ? "واجب جديد" : "New Homework"}
          </button>
        )}
      </div>

      {msg && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold border ${msg.type === "success" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300" : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300"}`}>
          {msg.text}
        </div>
      )}

      {/* TEACHER DETAIL VIEW (submissions of one homework) */}
      {isStaff && detail ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <button onClick={() => setDetail(null)} className="text-xs font-bold text-blue-600 hover:underline mb-1">← {lang === "ar" ? "عودة للكل" : "Back to all"}</button>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{detail.homework?.title}</h2>
              <p className="text-xs text-slate-500">{detail.homework?.grade} • {lang === "ar" ? "حتى:" : "Due:"} {detail.homework?.dueDate} • {detail.homework?.totalPoints} {lang === "ar" ? "درجة" : "pts"}</p>
            </div>
            <button onClick={() => handleDelete(detail.homework.id)} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950 text-red-500 border border-red-200 hover:bg-red-100">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            {lang === "ar" ? `التسليمات (${detail.submissions?.length || 0})` : `Submissions (${detail.submissions?.length || 0})`}
          </h3>

          {(detail.submissions || []).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">{lang === "ar" ? "لا تسليمات بعد" : "No submissions yet"}</p>
          ) : (
            <div className="space-y-3">
              {detail.submissions.map((s: any) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white">{s.studentName}</p>
                      <p className="text-[10px] text-slate-500">
                        {lang === "ar" ? "سلّم:" : "Submitted:"} {new Date(s.submittedAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                    {s.status === "graded" ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                        {s.score}/{detail.homework?.totalPoints} ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => { setGradeSub(s); setGScore(s.score || detail.homework?.totalPoints || 50); }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow"
                      >
                        {lang === "ar" ? "صحّح الآن" : "Grade Now"}
                      </button>
                    )}
                  </div>

                  {s.answerText && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">{s.answerText}</p>
                  )}

                  {s.fileName && (
                    <a href={`/api/homework/file/${s.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 px-2.5 py-1.5 rounded-lg">
                      <FileText className="w-3.5 h-3.5" /> {s.fileName}
                    </a>
                  )}

                  {s.feedback && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold">💬 {s.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="py-14 text-center text-slate-500">
          <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
        </div>
      ) : (
        /* LIST VIEW (both roles) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-10 col-span-2">
              {lang === "ar" ? "لا توجد واجبات حالياً 🎉" : "No homework right now 🎉"}
            </p>
          )}
          {list.map((hw) => {
            const mine = hw.mySubmission;
            return (
              <div key={hw.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <NotebookPen className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue(hw.dueDate) && !mine && (
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {lang === "ar" ? "متأخر" : "Overdue"}
                      </span>
                    )}
                    {mine?.status === "graded" ? (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <Star className="w-3 h-3" /> {mine.score}/{hw.totalPoints}
                      </span>
                    ) : mine ? (
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {lang === "ar" ? "تم التسليم" : "Submitted"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lang === "ar" ? "مطلوب" : "Pending"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{hw.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{hw.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{hw.grade}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{hw.unit}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> {hw.dueDate}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{hw.totalPoints} pts</span>
                  </div>
                </div>

                {mine?.feedback && (
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200">
                    💬 {lang === "ar" ? "ملاحظة المدرس:" : "Teacher feedback:"} {mine.feedback}
                  </p>
                )}

                {isStaff ? (
                  <button
                    onClick={() => openDetail(hw)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    {lang === "ar" ? `عرض التسليمات (${hw.submissionsCount || 0})` : `View Submissions (${hw.submissionsCount || 0})`}
                  </button>
                ) : mine?.status === "graded" ? (
                  <div className="text-center text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl py-2.5">
                    {lang === "ar" ? "تم التصحيح ✓" : "Graded ✓"}
                  </div>
                ) : (
                  <button
                    onClick={() => setSubmitHw(hw)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {mine ? (lang === "ar" ? "تعديل تسليمي" : "Edit Submission") : lang === "ar" ? "تسليم الواجب" : "Submit Answer"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============ TEACHER: CREATE MODAL ============ */}
      {showCreate && isStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{lang === "ar" ? "نشر واجب جديد" : "Publish New Homework"}</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <input value={cTitle} onChange={(e) => setCTitle(e.target.value)} placeholder={lang === "ar" ? "عنوان الواجب (مثال: حل تدريبات الماضي التام)..." : "Homework title..."} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white" />
            <textarea rows={3} value={cDesc} onChange={(e) => setCDesc(e.target.value)} placeholder={lang === "ar" ? "المطلوب من الطالب بالتفصيل..." : "Task details..."} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "الصف" : "Grade"}</label>
                <select value={cGrade} onChange={(e) => setCGrade(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold">
                  <option value="Third Secondary (Baccalaureate)">Third Secondary</option>
                  <option value="Second Secondary">Second Secondary</option>
                  <option value="First Secondary">First Secondary</option>
                  <option value="Third Prep">Third Prep</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "الوحدة" : "Unit"}</label>
                <input value={cUnit} onChange={(e) => setCUnit(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "تاريخ التسليم" : "Due Date"}</label>
                <input type="date" value={cDue} onChange={(e) => setCDue(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">{lang === "ar" ? "الدرجة الكلية" : "Total Points"}</label>
                <input type="number" value={cPoints} onChange={(e) => setCPoints(parseInt(e.target.value) || 50)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold" />
              </div>
            </div>
            <button onClick={handleCreate} className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              {lang === "ar" ? "نشر للطلاب وإخطارهم" : "Publish & Notify Students"}
            </button>
          </div>
        </div>
      )}

      {/* ============ STUDENT: SUBMIT MODAL ============ */}
      {submitHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{lang === "ar" ? "تسليم:" : "Submit:"} {submitHw.title}</h3>
              <button onClick={() => setSubmitHw(null)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <textarea rows={6} value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "Type your answer here..."} className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white" />
            <label className="block cursor-pointer border-2 border-dashed border-blue-400/60 rounded-2xl p-4 text-center bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 transition-colors">
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(e) => setAnswerFile(e.target.files?.[0] || null)} />
              <UploadCloud className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {answerFile ? answerFile.name : lang === "ar" ? "أرفق ملف إجابتك (PDF / صورة / Word)" : "Attach answer file (PDF / image / Word)"}
              </p>
              <p className="text-[9px] text-slate-400">{lang === "ar" ? "حد أقصى 20MB" : "Max 20MB"}</p>
            </label>
            <button onClick={handleSubmitAnswer} disabled={submitting} className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {submitting ? (lang === "ar" ? "جاري التسليم..." : "Submitting...") : lang === "ar" ? "تسليم الآن" : "Submit Now"}
            </button>
          </div>
        </div>
      )}

      {/* ============ TEACHER: GRADE MODAL ============ */}
      {gradeSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {lang === "ar" ? "تصحيح تسليم:" : "Grade:"} {gradeSub.studentName}
              </h3>
              <button onClick={() => setGradeSub(null)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">
                {lang === "ar" ? `الدرجة (من ${detail?.homework?.totalPoints || 50})` : `Score (out of ${detail?.homework?.totalPoints || 50})`}
              </label>
              <input type="number" value={gScore} onChange={(e) => setGScore(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white text-center" />
            </div>
            <textarea rows={4} value={gFeedback} onChange={(e) => setGFeedback(e.target.value)} placeholder={lang === "ar" ? "ملاحظات للطالب (نقاط القوة/الضعف/التوجيه)..." : "Feedback for student..."} className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white" />
            <button onClick={handleGrade} className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {lang === "ar" ? "حفظ التصحيح وإخطار الطالب" : "Save Grade & Notify"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
