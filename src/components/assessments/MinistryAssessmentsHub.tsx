"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Edit,
  History,
  ShieldCheck,
  Eye,
  Clock,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface MinistryAssessmentsHubProps {
  onBack?: () => void;
  initialGradeCode?: string;
}

export const MinistryAssessmentsHub: React.FC<MinistryAssessmentsHubProps> = ({
  onBack,
  initialGradeCode,
}) => {
  const { lang, user } = useApp();
  const isStaff = user?.role === "admin" || user?.role === "teacher";

  // State
  const [selectedStage, setSelectedStage] = useState<"Preparatory" | "Secondary">("Secondary");
  const [selectedGradeCode, setSelectedGradeCode] = useState<string>(initialGradeCode || "sec_3");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [assessments, setAssessments] = useState<any[]>([]);
  const [countsByType, setCountsByType] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [recentlyAdded, setRecentlyAdded] = useState<any[]>([]);

  // Modals
  const [viewingPdfUrl, setViewingPdfUrl] = useState<{ url: string; title: string; sourceUrl: string } | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch assessments from API
  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/ministry-assessments", window.location.origin);
      url.searchParams.set("stage", selectedStage);
      url.searchParams.set("gradeCode", selectedGradeCode);
      if (selectedCategory !== "all") url.searchParams.set("type", selectedCategory);
      if (selectedTerm !== "all") url.searchParams.set("term", selectedTerm);
      if (selectedWeek !== "all") url.searchParams.set("week", selectedWeek);
      if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setAssessments(data.assessments || []);
        setCountsByType(data.countsByType || {});
        setRecentlyAdded(data.recentlyAdded || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [selectedStage, selectedGradeCode, selectedCategory, selectedTerm, selectedWeek, searchQuery]);

  // Fetch student download history
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/ministry-assessments?historyOnly=true");
      const data = await res.json();
      if (data.success) {
        setDownloadHistory(data.history || []);
      }
    } catch {}
  };

  const handleDownload = async (item: any) => {
    try {
      // Record download in API
      fetch("/api/ministry-assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_download",
          assessmentId: item.id,
        }),
      });

      // If direct fileUrl exists and is not just the portal link, trigger file download
      if (item.fileUrl && !item.fileUrl.endsWith("/")) {
        const link = document.createElement("a");
        link.href = item.fileUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = `${item.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Open official MOE portal directly
        window.open(item.officialSourceUrl, "_blank", "noopener,noreferrer");
      }

      showNotice(
        lang === "ar"
          ? "جاري تحميل الملف وتوثيقه في سجل تنزيلاتك."
          : "Opening file and logged to your download history."
      );
    } catch {
      window.open(item.officialSourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  // Grade lists for stage selection
  const prepGrades = [
    { code: "prep_1", labelAr: "الصف الأول الإعدادي", labelEn: "First Preparatory" },
    { code: "prep_2", labelAr: "الصف الثاني الإعدادي", labelEn: "Second Preparatory" },
    { code: "prep_3", labelAr: "الصف الثالث الإعدادي (الشهادة الإعدادية)", labelEn: "Third Preparatory" },
  ];

  const secGrades = [
    { code: "sec_1", labelAr: "الصف الأول الثانوي", labelEn: "First Secondary" },
    { code: "sec_2", labelAr: "الصف الثاني الثانوي", labelEn: "Second Secondary" },
    { code: "sec_3", labelAr: "الصف الثالث الثانوي (ثانوية عامة)", labelEn: "Third Secondary" },
  ];

  const currentGrades = selectedStage === "Preparatory" ? prepGrades : secGrades;

  // Categories mapping
  const categoryDefs = [
    { key: "all", labelAr: "جميع التقييمات", labelEn: "All Assessments" },
    { key: "weekly", labelAr: "التقييمات الأسبوعية", labelEn: "Weekly Assessments" },
    { key: "classroom_performance", labelAr: "الأداءات الصفية", labelEn: "Classroom Performance" },
    { key: "homework_performance", labelAr: "الأداءات المنزلية", labelEn: "Homework Performance" },
    { key: "monthly", labelAr: "التقييمات الشهرية", labelEn: "Monthly Assessments" },
    { key: "other", labelAr: "تقييمات أخرى", labelEn: "Other" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* TOP HEADER */}
      <div className="bg-gradient-to-r from-[#0c1427] via-[#151f38] to-[#0a1020] text-white p-6 sm:p-8 rounded-3xl border border-sky-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black shadow-sm">
                وزارة التربية والتعليم والتعليم الفني
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-sky-200 border border-white/10">
                العام الدراسي 2026/2027
              </span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مصدر رسمي موثق</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-amber-400" />
              <span>
                {lang === "ar"
                  ? "تقييمات الوزارة الرسمية (Ministry Assessments)"
                  : "Official Ministry Assessments Library"}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === "ar"
                ? "الوصول المباشر للتقييمات الأسبوعية والأداءات الصفية والمنزلية والتقييمات الشهرية الصادرة من وزارة التربية والتعليم، مع روابط التحقق والمعاينة المباشرة."
                : "Official weekly assessments, classroom & homework drills, and monthly exams published by the Egyptian Ministry of Education."}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* OFFICIAL PORTAL 1 */}
            <a
              href="https://studentbooks.moe.gov.eg/Performance_Assessments/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="بوابة تقييمات الوزارة الرئيسية"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>{lang === "ar" ? "بوابة التقييمات الرسمية ↗" : "Official MOE Portal ↗"}</span>
            </a>

            {/* OFFICIAL PORTAL 2 */}
            <a
              href="https://moe.gov.eg/elearningenterypage/e-learning/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="بوابة التعليم الإلكتروني"
            >
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span>{lang === "ar" ? "بوابة التعليم الإلكتروني ↗" : "E-Learning Portal ↗"}</span>
            </a>

            {/* DOWNLOAD HISTORY BUTTON */}
            {user && (
              <button
                onClick={() => {
                  fetchHistory();
                  setIsHistoryOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
              >
                <History className="w-4 h-4" />
                <span>{lang === "ar" ? "سجل تنزيلاتي" : "My Downloads"}</span>
              </button>
            )}

            {/* TEACHER / ADMIN MANAGEMENT BUTTON */}
            {isStaff && (
              <button
                onClick={() => {
                  setEditingAssessment(null);
                  setIsAdminModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === "ar" ? "إضافة تقييم رسمي (+)" : "Add Assessment"}</span>
              </button>
            )}

            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                {lang === "ar" ? "العودة للمنصة" : "Back to Academy"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notice && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            notice.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
              : "bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* STAGE & GRADE SELECTION BAR */}
      <div className="bg-white dark:bg-[#0f172a] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        {/* STAGES SELECTOR TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setSelectedStage("Preparatory");
                setSelectedGradeCode("prep_1");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedStage === "Preparatory"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {lang === "ar" ? "المرحلة الإعدادية (Preparatory)" : "Preparatory Stage"}
            </button>
            <button
              onClick={() => {
                setSelectedStage("Secondary");
                setSelectedGradeCode("sec_3");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedStage === "Secondary"
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {lang === "ar" ? "المرحلة الثانوية (Secondary)" : "Secondary Stage"}
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {lang === "ar" ? "اختر الصف الدراسي لاستعراض تقييمات الوزارة المعتمدة" : "Select grade to view official MOE assessments"}
          </span>
        </div>

        {/* GRADES PILLS */}
        <div className="flex flex-wrap gap-2">
          {currentGrades.map((g) => {
            const isSelected = selectedGradeCode === g.code;
            return (
              <button
                key={g.code}
                onClick={() => setSelectedGradeCode(g.code)}
                className={`flex-1 min-w-[170px] py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-600/25"
                    : "bg-slate-50 dark:bg-[#1a233b] hover:bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{lang === "ar" ? g.labelAr : g.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CATEGORIES & FILTERS TOOLBAR */}
      <div className="space-y-4">
        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-2">
          {categoryDefs.map((cat) => {
            const count = cat.key === "all" ? assessments.length : countsByType[cat.key] || 0;
            // Rule: Do not display a category as available if no official files exist for it (except "all")
            if (cat.key !== "all" && count === 0) return null;

            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md"
                    : "bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <span>{lang === "ar" ? cat.labelAr : cat.labelEn}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected ? "bg-slate-950 text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH & FILTERS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* SEARCH */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ar" ? "بحث في تقييمات الوزارة..." : "Search official assessments..."}
              className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* TERM FILTER */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="all">{lang === "ar" ? "جميع الفصول الدراسية" : "All Terms"}</option>
            <option value="First">{lang === "ar" ? "الفصل الدراسي الأول" : "First Term"}</option>
            <option value="Second">{lang === "ar" ? "الفصل الدراسي الثاني" : "Second Term"}</option>
          </select>

          {/* WEEK FILTER */}
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="all">{lang === "ar" ? "جميع الأسابيع" : "All Weeks"}</option>
            {Array.from({ length: 18 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {lang === "ar" ? `الأسبوع ${i + 1}` : `Week ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ASSESSMENTS DOWNLOAD CENTER GRID */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400">
          {lang === "ar" ? "جاري تحميل تقييمات الوزارة الرسمية..." : "Loading official assessments..."}
        </div>
      ) : assessments.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {lang === "ar" ? "لا توجد ملفات متوفرة حالياً لهذا التحديد" : "No official files currently registered"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === "ar"
              ? "يتم رفع ونشر التقييمات تباعاً فور صدورها من وزارة التربية والتعليم. يمكنك فتح بوابة الوزارة مباشرة للتحقق."
              : "Assessments are published continuously as released by the MOE. You can check the official portal directly."}
          </p>
          <a
            href="https://studentbooks.moe.gov.eg/Performance_Assessments/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md mt-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{lang === "ar" ? "فتح بوابة التقييمات بوزارة التربية والتعليم ↗" : "Open MOE Assessments Portal ↗"}</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assessments.map((item) => {
            const isWeekly = item.assessmentType === "weekly";
            const isClass = item.assessmentType === "classroom_performance";
            const isHw = item.assessmentType === "homework_performance";
            const isMonthly = item.assessmentType === "monthly";

            const badgeBg = isWeekly
              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
              : isClass
              ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
              : isHw
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";

            const typeLabelAr = isWeekly
              ? "تقييم أسبوعي"
              : isClass
              ? "أداء صفي"
              : isHw
              ? "واجب منزلي"
              : isMonthly
              ? "تقييم شهري"
              : "تقييم رسمي";

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  {/* TOP BADGES */}
                  <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-black">
                    <span className={`px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeBg}`}>
                      {typeLabelAr}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {lang === "ar" ? `الأسبوع ${item.weekNumber}` : `Week ${item.weekNumber}`}
                    </span>
                    <span className="text-slate-400 font-mono">{item.fileSize || "1.8 MB"}</span>
                  </div>

                  {/* TITLE */}
                  <div>
                    <h4 className="text-base font-black text-slate-950 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </h4>
                    {item.titleEn && (
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{item.titleEn}</p>
                    )}
                  </div>

                  {/* METADATA */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-[#1a233b]/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span>{lang === "ar" ? "الصف الدراسي:" : "Grade:"}</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.grade}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{lang === "ar" ? "المادة والترم:" : "Subject & Term:"}</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.subject} • {item.term} Term</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "موثق رسمي:" : "Verified:"}</span>
                      </span>
                      <span>{new Date(item.verifiedDate).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* DOWNLOAD BUTTON */}
                    <button
                      onClick={() => handleDownload(item)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === "ar" ? "تنزيل PDF 📥" : "Download PDF"}</span>
                    </button>

                    {/* VIEW BUTTON */}
                    <button
                      onClick={() => {
                        setViewingPdfUrl({
                          url: item.fileUrl,
                          title: item.title,
                          sourceUrl: item.officialSourceUrl,
                        });
                      }}
                      className="py-2.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title={lang === "ar" ? "معاينة الملف" : "View Assessment"}
                    >
                      <Eye className="w-4 h-4" />
                      <span>{lang === "ar" ? "معاينة" : "View"}</span>
                    </button>
                  </div>

                  {/* OFFICIAL SOURCE LINK */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <a
                      href={item.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{lang === "ar" ? "رابط موقع الوزارة الرسمي ↗" : "Official MOE Source ↗"}</span>
                    </a>

                    <span>{item.downloadCount || 0} {lang === "ar" ? "تنزيل" : "downloads"}</span>
                  </div>

                  {/* STAFF CONTROLS (EDIT / DELETE) */}
                  {isStaff && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-xs">
                      <button
                        onClick={() => {
                          setEditingAssessment(item);
                          setIsAdminModalOpen(true);
                        }}
                        className="text-purple-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`هل أنت متأكد من حذف ${item.title}؟`)) return;
                          await fetch("/api/ministry-assessments", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "delete_assessment", id: item.id }),
                          });
                          fetchAssessments();
                        }}
                        className="text-rose-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: VIEW PDF / GUIDED OFFICIAL SOURCE MODAL
         ========================================================================= */}
      {viewingPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-purple-900/50 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {viewingPdfUrl.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingPdfUrl(null)}
                className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* VIEWER CONTENT */}
            <div className="flex-1 bg-slate-50 dark:bg-[#080d1a] rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div className="space-y-1 max-w-lg">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {lang === "ar" ? "معاينة التقييم الرسمي من بوابة الوزارة" : "Official MOE Assessment Document"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lang === "ar"
                    ? "نظراً لسياسات الحماية في بوابة وزارة التربية والتعليم، يمكنك فتح ملف الـ PDF مباشرة أو الانتقال لصفحة التقييم المعتمدة مع الحفاظ على جلستك بالأكاديمية."
                    : "Access the verified PDF file directly or open the official Ministry assessments portal in a safe window."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={viewingPdfUrl.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{lang === "ar" ? "فتح الملف في بوابة الوزارة الرسمية ↗" : "Open in Official Portal ↗"}</span>
                </a>

                {viewingPdfUrl.url && !viewingPdfUrl.url.endsWith("/") && (
                  <a
                    href={viewingPdfUrl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === "ar" ? "تحميل نسخة الـ PDF مباشرة" : "Download PDF"}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: STUDENT DOWNLOAD HISTORY
         ========================================================================= */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-purple-900/50 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-sky-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {lang === "ar" ? "سجل تنزيلاتي للتقييمات الرسمية" : "My Assessment Downloads History"}
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {downloadHistory.length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-slate-400">
                  {lang === "ar" ? "لم تقم بتنزيل أي تقييمات رسمية بعد." : "No download history found."}
                </div>
              ) : (
                downloadHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a233b] border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white">{item.assessment?.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {item.assessment?.grade} • {item.assessment?.assessmentType} • {new Date(item.downloadedAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(item.assessment)}
                      className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors"
                      title="إعادة التنزيل"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: TEACHER / ADMIN MANAGEMENT MODAL
         ========================================================================= */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-purple-900/50 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {editingAssessment
                    ? lang === "ar" ? "تعديل بيانات التقييم الرسمي" : "Edit Assessment"
                    : lang === "ar" ? "إضافة تقييم رسمي جديد لمكتبة الوزارة" : "Add Official Ministry Assessment"}
                </h3>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = {
                  action: editingAssessment ? "update_assessment" : "create_assessment",
                  id: editingAssessment?.id,
                  title: formData.get("title"),
                  titleEn: formData.get("titleEn"),
                  stage: formData.get("stage"),
                  grade: formData.get("grade"),
                  gradeCode: formData.get("gradeCode"),
                  term: formData.get("term"),
                  subject: formData.get("subject") || "English",
                  assessmentType: formData.get("assessmentType"),
                  weekNumber: Number(formData.get("weekNumber")) || 1,
                  fileUrl: formData.get("fileUrl"),
                  fileSize: formData.get("fileSize") || "1.8 MB",
                  officialSourceUrl: formData.get("officialSourceUrl") || "https://studentbooks.moe.gov.eg/Performance_Assessments/",
                };

                const res = await fetch("/api/ministry-assessments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (data.success) {
                  showNotice(data.message || "Saved successfully");
                  setIsAdminModalOpen(false);
                  fetchAssessments();
                } else {
                  alert(data.error || "Failed to save assessment");
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === "ar" ? "عنوان التقييم بالعربية (مثال: التقييم الأسبوعي - الأسبوع الأول)" : "Assessment Title (Arabic)"}
                </label>
                <input
                  name="title"
                  defaultValue={editingAssessment?.title || ""}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === "ar" ? "العنوان بالإنجليزية (اختياري)" : "Title (English)"}
                </label>
                <input
                  name="titleEn"
                  defaultValue={editingAssessment?.titleEn || ""}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المرحلة</label>
                  <select
                    name="stage"
                    defaultValue={editingAssessment?.stage || "Secondary"}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Preparatory">المرحلة الإعدادية</option>
                    <option value="Secondary">المرحلة الثانوية</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">كود الصف</label>
                  <select
                    name="gradeCode"
                    defaultValue={editingAssessment?.gradeCode || "sec_3"}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="prep_1">أولى إعدادي (prep_1)</option>
                    <option value="prep_2">ثانية إعدادي (prep_2)</option>
                    <option value="prep_3">ثالثة إعدادي (prep_3)</option>
                    <option value="sec_1">أولى ثانوي (sec_1)</option>
                    <option value="sec_2">ثانية ثانوي (sec_2)</option>
                    <option value="sec_3">ثالثة ثانوي (sec_3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الصف الدراسي (الاسم)</label>
                  <select
                    name="grade"
                    defaultValue={editingAssessment?.grade || "Third Secondary"}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="First Prep">First Prep</option>
                    <option value="Second Prep">Second Prep</option>
                    <option value="Third Prep">Third Prep</option>
                    <option value="First Secondary">First Secondary</option>
                    <option value="Second Secondary">Second Secondary</option>
                    <option value="Third Secondary">Third Secondary</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">نوع التقييم</label>
                  <select
                    name="assessmentType"
                    defaultValue={editingAssessment?.assessmentType || "weekly"}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="weekly">تقييم أسبوعي (Weekly)</option>
                    <option value="classroom_performance">أداء صفي (Classroom)</option>
                    <option value="homework_performance">أداء منزلي (Homework)</option>
                    <option value="monthly">تقييم شهري (Monthly)</option>
                    <option value="other">تقييم رسمي آخر</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الفصل الدراسي</label>
                  <select
                    name="term"
                    defaultValue={editingAssessment?.term || "First"}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="First">الترم الأول</option>
                    <option value="Second">الترم الثاني</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">رقم الأسبوع</label>
                  <input
                    type="number"
                    name="weekNumber"
                    min={1}
                    max={20}
                    defaultValue={editingAssessment?.weekNumber || 1}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-center"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">حجم الملف</label>
                  <input
                    name="fileSize"
                    defaultValue={editingAssessment?.fileSize || "1.8 MB"}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === "ar" ? "رابط ملف الـ PDF المباشر (أو مسار الملف المرفوع)" : "Direct PDF Link / Uploaded URL"}
                </label>
                <input
                  name="fileUrl"
                  defaultValue={editingAssessment?.fileUrl || "https://studentbooks.moe.gov.eg/Performance_Assessments/"}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {lang === "ar" ? "رابط بوابة الوزارة الرسمية للتحقق" : "Official MOE Source Portal Link"}
                </label>
                <input
                  name="officialSourceUrl"
                  defaultValue={editingAssessment?.officialSourceUrl || "https://studentbooks.moe.gov.eg/Performance_Assessments/"}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25"
                >
                  {editingAssessment ? "حفظ التعديلات" : "إضافة التقييم للمكتبة الآن"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
