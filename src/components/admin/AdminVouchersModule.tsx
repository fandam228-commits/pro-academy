"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Plus,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  Scissors,
  Calendar,
  Layers,
  Search,
} from "lucide-react";

export const AdminVouchersModule: React.FC = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, usedCount: 0, availableCount: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [batchCount, setBatchCount] = useState(12);
  const [batchGrade, setBatchGrade] = useState("3rd_sec");
  const [batchScope, setBatchScope] = useState("full_month");
  const [batchDays, setBatchDays] = useState(30);
  const [batchLabel, setBatchLabel] = useState("دفعة سنتر كفر الزيات — كروت الشحن");
  const [printMode, setPrintMode] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vouchers/admin");
      const data = await res.json();
      if (data.success) {
        setVouchers(data.vouchers || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error("Fetch vouchers error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await fetch("/api/vouchers/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: batchCount,
          gradeLevel: batchGrade,
          accessScope: batchScope,
          durationDays: batchDays,
          batchLabel,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.vouchers)) {
        setVouchers((prev) => [...data.vouchers, ...prev]);
        setStats((prev) => ({
          ...prev,
          total: prev.total + data.vouchers.length,
          availableCount: prev.availableCount + data.vouchers.length,
        }));
      }
    } catch (err) {
      console.error("Batch generate error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exportCSV = () => {
    const headers = "Code,GradeLevel,Scope,DurationDays,IsUsed,BatchLabel,CreatedAt\n";
    const rows = vouchers
      .map(
        (v) =>
          `"${v.code}","${v.gradeLevel}","${v.accessScope}",${v.durationDays},${v.isUsed},"${v.batchLabel || ""}","${v.createdAt || ""}"`
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pro_academy_vouchers_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      (v.batchLabel && v.batchLabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. TOP HEADER & STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <span>إدارة كروت الشحن وأكواد التفعيل (Prepaid Vouchers)</span>
          </h2>
          <p className="text-xs text-slate-500">
            توليد كروت الوصول وطباعتها وتصديرها بصيغة جاهزة للقص في السناتر أو المبيعات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrintMode(!printMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              printMode
                ? "bg-amber-400 text-slate-950 font-black"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{printMode ? "إغلاق وضع الطباعة" : "معاينة الطباعة (Print Cards)"}</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">إجمالي الكروت المولدة</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">الكروت المفعلة (المستخدمة)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.usedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold">الكروت المتاحة للشحن</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{stats.availableCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center font-black">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. PRINTABLE VIEW OR NORMAL MANAGEMENT */}
      {printMode ? (
        /* PRINTABLE 3-COLUMN CARD GRID */
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-300 dark:border-amber-800/60 text-xs flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
              <Scissors className="w-4 h-4" />
              <span>جاهز للطباعة: شبكة بطاقات مقسمة بخطوط قص أنيقة مع باركود المنصة الرسمي.</span>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>أمر الطباعة الآن (Ctrl + P)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3 print:p-0">
            {filteredVouchers
              .filter((v) => !v.isUsed)
              .map((v) => (
                <div
                  key={v.id}
                  className="bg-white dark:bg-slate-950 rounded-2xl p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between h-56 print:h-52 print:border-slate-400 print:shadow-none print:break-inside-avoid"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                        PROFESSIONAL ACADEMY
                      </p>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        مستر حبيب الرحمن — إنجليزي
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200">
                      {v.durationDays} يوم
                    </span>
                  </div>

                  {/* VOUCHER CODE */}
                  <div className="my-auto text-center space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold">كود التفعيل الفوري للمنصة:</p>
                    <div className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-base font-black tracking-widest text-blue-600 dark:text-blue-400" dir="ltr">
                      {v.code}
                    </div>
                    <p className="text-[9px] text-slate-400">{v.batchLabel || "دفعة معتمدة"}</p>
                  </div>

                  {/* CARD FOOTER */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-bold">
                    <span>pro-academy.com</span>
                    <span>صالحة للاستخدام مرة واحدة</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* NORMAL MANAGEMENT MODE: BATCH GENERATOR + TABLE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BATCH GENERATOR FORM */}
          <form
            onSubmit={handleGenerateBatch}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>توليد دفعة كروت جديدة (Batch Generator)</span>
            </h3>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500">عدد الكروت المطلوب توليدها:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={batchCount}
                onChange={(e) => setBatchCount(parseInt(e.target.value, 10) || 1)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500">المرحلة الدراسية:</label>
              <select
                value={batchGrade}
                onChange={(e) => setBatchGrade(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-bold text-xs"
              >
                <option value="3rd_sec">الثالث الثانوي (Baccalaureate)</option>
                <option value="2nd_sec">الثاني الثانوي</option>
                <option value="1st_sec">الأول الثانوي</option>
                <option value="3rd_prep">الثالث الإعدادي</option>
                <option value="2nd_prep">الثاني الإعدادي</option>
                <option value="1st_prep">الأول الإعدادي</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500">نطاق الوصول (Scope):</label>
              <select
                value={batchScope}
                onChange={(e) => setBatchScope(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-bold text-xs"
              >
                <option value="full_month">اشتراك شهري شامل (Full Month)</option>
                <option value="single_unit">وحدة دراسية محددة (Single Unit)</option>
                <option value="exam_pack">باقة الامتحانات الشاملة (Exam Pack)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500">مدة الصلاحية بالشهور/الأيام:</label>
              <input
                type="number"
                value={batchDays}
                onChange={(e) => setBatchDays(parseInt(e.target.value, 10) || 30)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500">اسم الدفعة / المركز:</label>
              <input
                type="text"
                value={batchLabel}
                onChange={(e) => setBatchLabel(e.target.value)}
                placeholder="مثال: سنتر كفر الزيات - دفعة أكتوبر"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-bold text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {generating ? "جاري التوليد..." : `توليد ${batchCount} كارت شحن الآن ✨`}
            </button>
          </form>

          {/* VOUCHERS TABLE */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">قائمة الأكواد الصادرة</h3>
              <div className="relative w-48 sm:w-64">
                <input
                  type="text"
                  placeholder="بحث بالكود أو المركز..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-2 pr-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-2.5 px-3">الكود</th>
                    <th className="py-2.5 px-3">الدفعة</th>
                    <th className="py-2.5 px-3">المدة</th>
                    <th className="py-2.5 px-3">الحالة</th>
                    <th className="py-2.5 px-3">نسخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                  {filteredVouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-black text-blue-600 dark:text-blue-400" dir="ltr">
                        {v.code}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{v.batchLabel || "عام"}</td>
                      <td className="py-2.5 px-3">{v.durationDays} يوم</td>
                      <td className="py-2.5 px-3">
                        {v.isUsed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-600 border border-rose-200">
                            مُفعل
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200">
                            متاح
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => copyToClipboard(v.code)}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition"
                          title="نسخ الكود"
                        >
                          {copiedCode === v.code ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
