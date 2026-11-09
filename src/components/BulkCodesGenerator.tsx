"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  Ticket,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  QrCode,
  ShieldCheck,
  Building,
  GraduationCap,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  Eye,
  Scissors,
} from "lucide-react";

interface GeneratedCard {
  code: string;
  courseId: string;
  courseTitle: string;
  centerName: string;
  price: string;
  qrDataUrl: string;
  serial: string;
}

export const BulkCodesGenerator: React.FC = () => {
  const { lang } = useApp();

  // Generator Options
  const [targetCourseId, setTargetCourseId] = useState("all_courses");
  const [codePrefix, setCodePrefix] = useState("HABIB-3SEC");
  const [codeCount, setCodeCount] = useState<number>(50);
  const [centerName, setCenterName] = useState("سنتر الأوائل - الزقازيق");
  const [cardPrice, setCardPrice] = useState("250 ج.م");

  // Output State
  const [loading, setLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [activeTab, setActiveTab] = useState<"cards" | "table">("cards");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const courseOptions = [
    { id: "all_courses", title: lang === "ar" ? "⭐ الباقة الشاملة VIP (جميع كورسات المنصة)" : "VIP All-Access Pass" },
    { id: "crs_sec_3", title: lang === "ar" ? "الثانوية العامة - إنجليزي مستر حبيب الرحمن" : "3rd Secondary English Master" },
    { id: "crs_sec_2", title: lang === "ar" ? "الصف الثاني الثانوي - الترم الكامل" : "2nd Secondary Full Term" },
    { id: "crs_sec_1", title: lang === "ar" ? "الصف الأول الثانوي - الترم الكامل" : "1st Secondary Full Term" },
    { id: "crs_prep_3", title: lang === "ar" ? "الشهادة الإعدادية - الثالث الإعدادي" : "3rd Prep English" },
    { id: "monthly_center", title: lang === "ar" ? "اشتراك سنتر ومجموعة شهري" : "Monthly Center Pass" },
  ];

  const getTargetTitle = (cid: string) => {
    const found = courseOptions.find((c) => c.id === cid);
    return found ? found.title : (lang === "ar" ? "كورس منصة بروفيشنال" : "Professional Academy Course");
  };

  // Generate batch
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "generate_codes",
          codeBatch: {
            courseId: targetCourseId,
            count: codeCount,
            prefix: codePrefix,
          },
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.codes)) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const title = getTargetTitle(targetCourseId);

        // Generate QR Code data URLs for each card
        const cards: GeneratedCard[] = [];
        for (let i = 0; i < data.codes.length; i++) {
          const c = data.codes[i];
          const activateUrl = `${origin}/?activate=${encodeURIComponent(c)}`;
          let qrData = "";
          try {
            qrData = await QRCode.toDataURL(activateUrl, {
              width: 180,
              margin: 1,
              color: { dark: "#1e1035", light: "#ffffff" },
              errorCorrectionLevel: "M",
            });
          } catch {}

          cards.push({
            code: c,
            courseId: targetCourseId,
            courseTitle: title,
            centerName: centerName.trim() || (lang === "ar" ? "مجموعة مستر حبيب الرحمن" : "Habib Academy"),
            price: cardPrice.trim() || "250 ج.م",
            qrDataUrl: qrData,
            serial: `SN-${Date.now().toString().slice(-6)}-${(i + 1).toString().padStart(3, "0")}`,
          });
        }
        setGeneratedCards(cards);
      }
    } catch (err) {
      console.error("Batch generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Copy all generated codes to clipboard
  const handleCopyAll = () => {
    if (generatedCards.length === 0) return;
    const text = generatedCards.map((c) => c.code).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy single code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSingle(code);
    setTimeout(() => setCopiedSingle(null), 2000);
  };

  // Export to CSV for bookstores and accounts
  const handleExportCSV = () => {
    if (generatedCards.length === 0) return;
    const headers = ["Serial,Code,Course,Center,Price,ActivationURL,Date"];
    const rows = generatedCards.map((c) => {
      const url = `${typeof window !== "undefined" ? window.location.origin : ""}/?activate=${c.code}`;
      return `"${c.serial}","${c.code}","${c.courseTitle}","${c.centerName}","${c.price}","${url}","${new Date().toISOString()}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `habib-academy-vouchers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  const filteredCards = generatedCards.filter(
    (c) =>
      c.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.centerName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & INTRO */}
      <div className="bg-gradient-to-r from-[#180d38] via-[#12082b] to-[#180d38] rounded-3xl p-6 border border-purple-800/40 shadow-xl print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ar" ? "نظام كروت الشحن والسناتر الذكية" : "Smart Center Recharge Vouchers"}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {lang === "ar"
                ? "توليد كروت الشحن وأكواد التفعيل بالجملة"
                : "Bulk Activation & Recharge Voucher Cards"}
            </h2>
            <p className="text-xs md:text-sm text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
              {lang === "ar"
                ? "ولّد دفعات من كروت الشحن (10 إلى 500 كود) بضغطة زر واحدة، مع شيت طباعة وقص أنيق A4 يحتوي على QR Code لتفعيل الكورس فوراً بمجرد مسحه بكاميرا هاتف الطالب."
                : "Generate batches of recharge cards (10 to 500) with a printable A4 cut-sheet containing instant camera QR activation."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/50 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ar" ? "جاهز للطباعة والقص" : "Print & Cut Ready"}</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "مشفر وغير قابل للتكرار" : "Unique & Nonce Protected"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. GENERATION CONFIGURATION CARD */}
      <div className="bg-white dark:bg-[#100a26] p-6 rounded-3xl border border-slate-200 dark:border-purple-900/40 shadow-lg print:hidden">
        <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{lang === "ar" ? "إعدادات دفعة الكروت الجديدة" : "Batch Generation Settings"}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Target Course / Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === "ar" ? "الكورس أو الباقة المستهدفة:" : "Target Course / Package:"}
            </label>
            <select
              value={targetCourseId}
              onChange={(e) => {
                setTargetCourseId(e.target.value);
                if (e.target.value === "all_courses") setCodePrefix("HABIB-VIP");
                else if (e.target.value === "crs_sec_3") setCodePrefix("HABIB-3SEC");
                else if (e.target.value === "crs_sec_2") setCodePrefix("HABIB-2SEC");
                else if (e.target.value === "crs_sec_1") setCodePrefix("HABIB-1SEC");
                else if (e.target.value === "crs_prep_3") setCodePrefix("HABIB-PREP3");
                else if (e.target.value === "monthly_center") setCodePrefix("CENTER-PASS");
              }}
              className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-800/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            >
              {courseOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Code Prefix */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === "ar" ? "بادئة الكود (Prefix):" : "Code Prefix:"}
            </label>
            <input
              type="text"
              value={codePrefix}
              onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
              placeholder="HABIB-3SEC"
              className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-800/40 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Center or Bookstore Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === "ar" ? "اسم السنتر أو المكتبة الموزعة:" : "Center / Bookstore Name:"}
            </label>
            <input
              type="text"
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              placeholder="سنتر الأوائل - الزقازيق"
              className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-800/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Card Nominal Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === "ar" ? "القيمة المطبوعة على الكارت:" : "Nominal Value on Card:"}
            </label>
            <input
              type="text"
              value={cardPrice}
              onChange={(e) => setCardPrice(e.target.value)}
              placeholder="250 ج.م"
              className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-800/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Number of Cards to generate */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === "ar" ? "عدد الكروت المطلوب توليدها:" : "Number of Cards to Generate:"}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[10, 25, 50, 100, 250, 500].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCodeCount(num)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    codeCount === num
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "bg-slate-100 dark:bg-purple-950/40 text-slate-700 dark:text-purple-300 border border-slate-200 dark:border-purple-800/30 hover:border-purple-500"
                  }`}
                >
                  {num} {lang === "ar" ? "كارت" : "cards"}
                </button>
              ))}
              <span className="text-xs text-slate-400 font-mono font-bold mr-2">({codeCount} Total)</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-purple-900/30 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs md:text-sm shadow-xl shadow-purple-600/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{lang === "ar" ? "جارِ توليد وتشفير الكروت..." : "Generating & Encrypting..."}</span>
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                <span>
                  {lang === "ar"
                    ? `توليد دفعة ${codeCount} كارت تفعيل الآن`
                    : `Generate Batch of ${codeCount} Cards Now`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. GENERATED BATCH TOOLBAR & PREVIEW */}
      {generatedCards.length > 0 && (
        <div className="space-y-4">
          {/* Action Toolbar (hidden during print) */}
          <div className="bg-white dark:bg-[#100a26] p-4 rounded-3xl border border-slate-200 dark:border-purple-900/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  {lang === "ar" ? "تم توليد الدفعة بنجاح" : "Batch Generated Successfully"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {generatedCards.length} {lang === "ar" ? "كارت شحن جاهزة للطباعة والتوزيع" : "cards ready for distribution"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tab Selector */}
              <div className="bg-slate-100 dark:bg-purple-950/60 p-1 rounded-2xl flex items-center text-xs font-bold border border-slate-200 dark:border-purple-800/40">
                <button
                  onClick={() => setActiveTab("cards")}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === "cards"
                      ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "كروت A4 للطباعة" : "Printable A4 Sheet"}</span>
                </button>
                <button
                  onClick={() => setActiveTab("table")}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === "table"
                      ? "bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "جدول الأكواد" : "Table View"}</span>
                </button>
              </div>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === "ar" ? "طباعة الكروت الفورية (A4)" : "Print Cards (A4)"}</span>
              </button>

              {/* CSV Export Button */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 text-slate-800 dark:text-purple-200 border border-slate-300 dark:border-purple-700/50 text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>{lang === "ar" ? "تصدير Excel / CSV" : "Export CSV"}</span>
              </button>

              {/* Copy All Codes Button */}
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 text-slate-800 dark:text-purple-200 border border-slate-300 dark:border-purple-700/50 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAll ? (lang === "ar" ? "تم النسخ!" : "Copied!") : (lang === "ar" ? "نسخ الكل" : "Copy All")}</span>
              </button>
            </div>
          </div>

          {/* Search bar when in table mode */}
          {activeTab === "table" && (
            <div className="relative print:hidden">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={lang === "ar" ? "بحث برقم الكود أو اسم السنتر..." : "Filter by code or center..."}
                className="w-full bg-white dark:bg-[#100a26] border border-slate-200 dark:border-purple-900/40 rounded-2xl py-2.5 px-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* TAB 1: PRINTABLE CARDS SHEET (A4 CUT-GRID) */}
          {activeTab === "cards" && (
            <div className="print-sheet">
              {/* PRINT ONLY HEADER */}
              <div className="hidden print:block mb-4 text-center border-b border-slate-300 pb-2">
                <h1 className="text-xl font-black text-slate-900">
                  منصة مستر حبيب الرحمن للغة الإنجليزية — كروت الشحن والتفعيل
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  الدفعة: {generatedCards[0]?.courseTitle} • الموزع: {generatedCards[0]?.centerName} • إجمالي: {generatedCards.length} كارت
                </p>
              </div>

              {/* GRID OF CARDS (Optimized for 2-column or 3-column A4 printing) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
                {filteredCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="relative bg-gradient-to-br from-[#1a0e38] via-[#12072b] to-[#1e1040] text-white rounded-2xl border-2 border-dashed border-amber-400/50 p-4 shadow-xl overflow-hidden print:border-slate-800 print:text-black print:bg-white print:shadow-none break-inside-avoid"
                  >
                    {/* Top Watermark & Serial */}
                    <div className="flex items-center justify-between border-b border-purple-800/40 print:border-slate-300 pb-2 mb-2.5 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="font-extrabold tracking-wide uppercase text-amber-300 print:text-slate-900">
                          Professional Academy
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-purple-300 print:text-slate-600">
                        {card.serial}
                      </span>
                    </div>

                    {/* Teacher Branding & Center */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-black text-xs md:text-sm text-slate-100 print:text-slate-900">
                          {lang === "ar" ? "مستر حبيب الرحمن" : "Mr. Habib El Rahman"}
                        </h4>
                        <p className="text-[10px] text-amber-300/90 font-bold print:text-slate-700">
                          {card.courseTitle}
                        </p>
                        <p className="text-[9px] text-purple-200/80 print:text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building className="w-2.5 h-2.5 text-sky-400 print:text-slate-600" />
                          <span>{card.centerName}</span>
                        </p>
                      </div>

                      {/* Price Badge */}
                      <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 print:bg-slate-100 print:text-slate-900 print:border-slate-400 text-[11px] font-black shrink-0">
                        {card.price}
                      </div>
                    </div>

                    {/* Code & QR Section */}
                    <div className="bg-black/40 print:bg-slate-50 border border-purple-700/40 print:border-slate-300 rounded-xl p-2.5 flex items-center justify-between gap-3 my-2">
                      {/* Code Scratch Box */}
                      <div className="flex-1">
                        <span className="text-[9px] text-slate-400 print:text-slate-600 font-bold uppercase tracking-wider block mb-0.5">
                          {lang === "ar" ? "كود التفعيل (Scratch Code):" : "Activation Code:"}
                        </span>
                        <div className="bg-[#0b051c] print:bg-white border-2 border-amber-400/60 print:border-slate-700 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                          <span className="font-mono font-black text-sm md:text-base text-amber-300 print:text-slate-950 tracking-wider">
                            {card.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(card.code)}
                            className="print:hidden text-slate-400 hover:text-white p-1"
                            title="Copy code"
                          >
                            {copiedSingle === card.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* QR Code */}
                      {card.qrDataUrl && (
                        <div className="shrink-0 bg-white p-1 rounded-lg shadow-md border border-slate-300">
                          <img
                            src={card.qrDataUrl}
                            alt="Scan to Activate"
                            className="w-14 h-14 md:w-16 md:h-16 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Footer Instructions & Scissor line indicator */}
                    <div className="flex items-center justify-between text-[9px] text-purple-200/70 print:text-slate-600 pt-1 border-t border-purple-900/30 print:border-slate-300">
                      <span className="flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-sky-400 print:text-slate-600" />
                        <span>
                          {lang === "ar"
                            ? "امسح الـ QR بكاميرا الموبايل للتفعيل الفوري"
                            : "Scan QR with mobile camera for 1-click unlock"}
                        </span>
                      </span>
                      <span className="font-bold text-amber-400 print:text-slate-900">
                        {lang === "ar" ? "صالح لطالب واحد" : "Single Student"}
                      </span>
                    </div>

                    {/* Scissor cut guide mark */}
                    <div className="absolute -bottom-2 -left-2 text-slate-400 print:text-slate-600 print:block hidden">
                      <Scissors className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DATA TABLE VIEW */}
          {activeTab === "table" && (
            <div className="bg-white dark:bg-[#100a26] rounded-3xl border border-slate-200 dark:border-purple-900/40 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-purple-950/50 text-slate-700 dark:text-purple-300 uppercase text-[10px] font-black border-b border-slate-200 dark:border-purple-900/40">
                    <tr>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">Serial</th>
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Course</th>
                      <th className="p-3.5">Center</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/20 text-slate-800 dark:text-slate-200">
                    {filteredCards.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-purple-950/30">
                        <td className="p-3.5 font-bold text-slate-400">{i + 1}</td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{c.serial}</td>
                        <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{c.code}</td>
                        <td className="p-3.5 font-semibold">{c.courseTitle}</td>
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">{c.centerName}</td>
                        <td className="p-3.5 font-bold">{c.price}</td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-purple-900/40 hover:bg-purple-600 hover:text-white transition-all"
                            title="Copy Code"
                          >
                            {copiedSingle === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
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
          )}
        </div>
      )}
    </div>
  );
};
