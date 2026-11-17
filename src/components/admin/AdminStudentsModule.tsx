"use client";

import React, { useState, useEffect } from "react";
import { authHeaders } from "@/lib/client-auth";
import {
  Users,
  Search,
  Filter,
  Flame,
  Award,
  Send,
  MessageSquare,
  CheckCircle2,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export const AdminStudentsModule: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  // WhatsApp Report Modal State
  const [activeReportStudent, setActiveReportStudent] = useState<any | null>(null);
  const [reportText, setReportText] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [copiedReport, setCopiedReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (gradeFilter !== "all") params.set("grade", gradeFilter);

      const res = await fetch(`/api/admin/students?${params.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error("Failed to load students:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeFilter]);

  const handleOpenParentReport = async (st: any) => {
    setActiveReportStudent(st);
    setGeneratingReport(true);
    setCopiedReport(false);

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "generate_parent_report",
          studentId: st.id,
          studentName: st.name,
          grade: st.grade,
          streak: st.streak,
          totalXp: st.totalXp,
          parentPhone: st.parentPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReportText(data.messageText);
        setWhatsappUrl(data.whatsappUrl);
      }
    } catch (e) {
      console.error("Failed to generate report:", e);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>متابعة الطلاب والاشتراكات وتقارير أولياء الأمور (Students CMS)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            متابعة التزام الطلاب ونقاط التفوق XP، وإرسال تقارير المتابعة لأولياء الأمور بنقرة واحدة عبر واتساب.
          </p>
        </div>
      </div>

      {/* 2. SEARCH & FILTERS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو البريد الإلكتروني أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">كل الصفوف الدراسية</option>
            <option value="Third Secondary (Baccalaureate)">الثالث الثانوي</option>
            <option value="Second Secondary">الثاني الثانوي</option>
            <option value="First Secondary">الأول الثانوي</option>
            <option value="Third Prep">الثالث الإعدادي</option>
            <option value="Second Prep">الثاني الإعدادي</option>
            <option value="First Prep">الأول الإعدادي</option>
          </select>

          <button
            onClick={fetchStudents}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white cursor-pointer"
          >
            تصفية
          </button>
        </div>
      </div>

      {/* 3. STUDENTS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>إجمالي الطلاب المسجلين: {students.length} طالب</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">جاري تحميل بيانات الطلاب...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">اسم الطالب والبيانات</th>
                  <th className="p-3.5">الصف الدراسي</th>
                  <th className="p-3.5">سلسلة الالتزام</th>
                  <th className="p-3.5">نقاط التفوق (XP)</th>
                  <th className="p-3.5">حالة الاشتراك</th>
                  <th className="p-3.5 text-center">تقرير ولي الأمر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((st, idx) => (
                  <tr key={st.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5">
                      <h5 className="font-bold text-slate-900 dark:text-white">{st.name}</h5>
                      <span className="text-[10px] text-slate-400 block" dir="ltr">{st.email}</span>
                      <span className="text-[10px] text-slate-500 block">هاتف: {st.phone} | ولي الأمر: {st.parentPhone}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {st.grade}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-amber-600 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{st.streak} يوم</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-blue-600 font-black">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{st.totalXp} XP</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        اشتراك نشط
                      </span>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenParentReport(st)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>إرسال واتساب</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. WHATSAPP PARENT REPORT MODAL */}
      {activeReportStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  تقرير متابعة ولي الأمر — {activeReportStudent.name}
                </h4>
              </div>
              <button
                onClick={() => setActiveReportStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              تم تجهيز رسالة التقرير تلقائياً من مستر حبيب الرحمن لإرسالها لرقم ولي الأمر:{" "}
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {activeReportStudent.parentPhone}
              </span>
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap select-all">
              {generatingReport ? "جاري صياغة التقرير..." : reportText}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {copiedReport ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReport ? "تم النسخ" : "نسخ نص التقرير"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveReportStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  إغلاق
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>فتح تطبيق واتساب الآن</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
