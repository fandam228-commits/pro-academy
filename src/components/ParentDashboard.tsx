"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { buildWhatsAppLink } from "@/config/platform";
import { authHeaders } from "@/lib/client-auth";
import {
  Users,
  CheckCircle,
  BarChart3,
  Clock,
  MessageSquare,
  Phone,
  ShieldCheck,
  Award,
  DollarSign,
  Receipt,
  Calendar,
  ChevronDown,
  Printer,
  Sparkles,
} from "lucide-react";

export const ParentDashboard: React.FC<{ onOpenReport?: () => void }> = ({ onOpenReport }) => {
  const { lang, user } = useApp();
  const [data, setData] = useState<any>(null);
  const [attendance, setAttendance] = useState<{ rate: number; total: number; records: any[] } | null>(null);
  const [feeSummary, setFeeSummary] = useState<any>(null);
  const [linkedChildren, setLinkedChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchParentData = async (targetStudentId?: string) => {
    setLoading(true);
    try {
      // 1. Fetch parent overview & child links
      const parentParam = user?.id ? `parentId=${user.id}` : "parentId=usr_parent_1";
      const studentParam = targetStudentId ? `&studentId=${targetStudentId}` : "";
      const res = await fetch(`/api/parent?${parentParam}${studentParam}`, { headers: authHeaders() });
      const json = await res.json();
      setData(json);

      const activeStudentId = targetStudentId || json?.student?.id || "";

      // 2. Fetch REAL attendance for the selected student
      const attRes = await fetch(`/api/attendance?studentId=${activeStudentId}`, { headers: authHeaders() });
      if (attRes.ok) {
        const attJson = await attRes.json();
        if (attJson.rate !== undefined) {
          setAttendance({ rate: attJson.rate, total: attJson.records?.length || 0, records: attJson.records || [] });
        }
        if (attJson.linkedChildren && attJson.linkedChildren.length > 0) {
          setLinkedChildren(attJson.linkedChildren);
          if (!selectedChildId) setSelectedChildId(activeStudentId);
        }
      }

      // 3. Fetch Tuition & Invoices for the student
      const feeRes = await fetch(`/api/center-fees?studentId=${activeStudentId}`, { headers: authHeaders() });
      if (feeRes.ok) {
        const feeJson = await feeRes.json();
        setFeeSummary(feeJson);
      }
    } catch (e) {
      console.error("Parent dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData(selectedChildId);
  }, [selectedChildId]);

  if (loading && !data) {
    return (
      <div className="py-20 text-center text-slate-500 font-bold">
        {lang === "ar" ? "جاري تحميل بيانات الأبناء والنتائج المعتمدة..." : "Loading student metrics..."}
      </div>
    );
  }

  const { student, submissions, averageScore, attendanceRate } = data || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* CHILD SWITCHER (IF MULTIPLE CHILDREN) */}
      {linkedChildren.length > 1 && (
        <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
              الأبناء المرتبطون بحسابك ({linkedChildren.length}):
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {linkedChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  (selectedChildId || student?.id) === child.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                {child.name} ({child.grade || "طالب"})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/25">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {lang === "ar" ? "لوحة متابعة ولي الأمر المعتمدة" : "Parent Monitoring Hub"}
            </span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {lang === "ar" ? `متابعة الطالب: ${student?.name}` : `Student: ${student?.name}`}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {student?.grade} • كود الطالب: {student?.studentCode || `PA-${student?.id?.slice(-4)}`}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{lang === "ar" ? "تقرير الأداء التفصيلي" : "Full Performance Report"}</span>
            </button>
          )}

          {/* DIRECT WHATSAPP ACTION */}
          <a
            href={buildWhatsAppLink(
              `Hello Mr. Habib El Rahman, I am the parent of ${student?.name || "Student"}. I would like to follow up on their academic progress.`
            )}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>{lang === "ar" ? "تواصل مع مستر حبيب (واتساب)" : "Direct WhatsApp"}</span>
          </a>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">
            {lang === "ar" ? "متوسط درجات الامتحانات" : "Average Exam Score"}
          </span>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{averageScore || 85}%</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">مستوى متميز ومنتظم</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">
            {lang === "ar" ? "نسبة الانضباط والحضور الفعلي" : "Real Attendance Rate"}
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {attendance ? `${attendance.rate}%` : attendanceRate || 100}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {attendance
              ? `${attendance.total} حصة مسجلة بالسنتر`
              : "بيانات حضور الحصص المباشرة"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
          <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">
            {lang === "ar" ? "موقف اشتراك السنتر" : "Center Tuition"}
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {feeSummary?.summary?.remainingBalance === "0.00"
              ? "مسدد بالكامل"
              : feeSummary?.summary?.remainingBalance
              ? `${feeSummary.summary.remainingBalance} ج.م متبقي`
              : "مسدد"}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            المدفوع: {feeSummary?.summary?.totalPaid || "0.00"} ج.م
          </p>
        </div>
      </div>

      {/* REAL ATTENDANCE RECENT RECORDS */}
      {attendance && attendance.records && attendance.records.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>سجل حضور الحصص الفعلي بالسنتر</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الحصة</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">طريقة التحضير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {attendance.records.slice(0, 10).map((r: any) => (
                  <tr key={r.id}>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{r.sessionDate}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{r.sessionTitle}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          r.status === "present"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.status === "late"
                            ? "bg-amber-100 text-amber-700"
                            : r.status === "excused"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.status === "present" ? "حاضر" : r.status === "late" ? "متأخر" : r.status === "excused" ? "معذور" : "غائب"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {r.scanMethod === "qr" ? "ماسح QR آمن" : r.scanMethod === "manual" ? "رصد المشرف" : "تحضير سنتر"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PREVIOUS TUITION RECEIPTS */}
      {feeSummary?.collections && feeSummary.collections.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" />
            <span>إيصالات وسندات سداد الاشتراكات السابقة</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeSummary.collections.map((col: any) => (
              <div
                key={col.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-indigo-600 block">{col.receiptNumber}</span>
                  <span className="text-slate-500 text-[11px]">
                    المجموعة: {col.groupName} • شهر {col.billingMonth}
                  </span>
                  <div className="font-black text-emerald-600 text-sm mt-1">{col.amount} ج.م</div>
                </div>
                <button
                  onClick={() => setSelectedReceipt(col)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>عرض وطباعة</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-slate-900 border border-slate-200 space-y-6">
            <div className="text-center border-b border-slate-200 pb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block">
                Official Tuition Receipt
              </span>
              <h2 className="text-xl font-black text-slate-900">Professional Academy</h2>
              <p className="text-xs text-slate-500">سنتر مستر حبيب الرحمن التعليمي</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-100 font-mono text-xs font-black text-slate-700">
                {selectedReceipt.receiptNumber}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">اسم الطالب:</span>
                <span className="font-bold">{student?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">المجموعة:</span>
                <span className="font-semibold">{selectedReceipt.groupName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">المبلغ المدفوع:</span>
                <span className="font-mono text-base font-black text-emerald-600">{selectedReceipt.amount} ج.م</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">طريقة الدفع:</span>
                <span className="font-semibold">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">تاريخ السداد:</span>
                <span className="font-mono text-slate-500">
                  {new Date(selectedReceipt.collectedAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الإيصال</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
