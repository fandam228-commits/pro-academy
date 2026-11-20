"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Copy,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  Search,
  ExternalLink,
  RefreshCw,
  Eye,
  Send,
} from "lucide-react";
import { FacebookIcon, YoutubeIcon, TiktokIcon } from "./icons";
import {
  generateCalendarGrid,
  filterCalendarItems,
  rescheduleCalendarItem,
  duplicateContentForNewSlot,
  getCurriculumInitialSchedule,
  type CalendarItem,
  type CalendarGridMonth,
} from "@/lib/media-center/calendar-engine";

interface PmcCalendarViewProps {
  lang?: "ar" | "en";
  onNavigateToQueue?: () => void;
}

export const PmcCalendarView: React.FC<PmcCalendarViewProps> = ({
  lang = "ar",
  onNavigateToQueue,
}) => {
  const isAr = lang === "ar";

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [platformFilter, setPlatformFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [rescheduleModalItem, setRescheduleModalItem] = useState<CalendarItem | null>(null);
  const [newDateInput, setNewDateInput] = useState("");
  const [duplicateModalItem, setDuplicateModalItem] = useState<CalendarItem | null>(null);
  const [duplicateDateInput, setDuplicateDateInput] = useState("");
  const [duplicateGradeInput, setDuplicateGradeInput] = useState<any>("Third Secondary (Thanawya Amma)");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, [currentYear, currentMonth]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media-center/calendar?year=${currentYear}&month=${currentMonth}`
      );
      if (res.ok) {
        const data = await res.json();
        // Fallback to initial curriculum schedule if empty
        if (data.grid?.days) {
          // Flatten items
          const flat: CalendarItem[] = [];
          data.grid.days.forEach((d: any) => {
            if (d.items) flat.push(...d.items);
          });
          setItems(flat.length > 0 ? flat : getCurriculumInitialSchedule());
        } else {
          setItems(getCurriculumInitialSchedule());
        }
      } else {
        setItems(getCurriculumInitialSchedule());
      }
    } catch {
      setItems(getCurriculumInitialSchedule());
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const filteredItems = filterCalendarItems(items, {
    platform: platformFilter,
    grade: gradeFilter,
    status: statusFilter,
    search: searchQuery,
  });

  const grid: CalendarGridMonth = generateCalendarGrid(currentYear, currentMonth, filteredItems);

  const handleRescheduleSubmit = async () => {
    if (!rescheduleModalItem || !newDateInput) return;
    try {
      const res = await fetch("/api/admin/media-center/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: rescheduleModalItem.id,
          newDate: newDateInput,
        }),
      });

      // Update client state
      const updated = rescheduleCalendarItem(rescheduleModalItem, newDateInput);
      setItems((prev) =>
        prev.map((i) => (i.id === rescheduleModalItem.id ? updated.item : i))
      );
      setNotification(
        isAr
          ? `تم إعادة جدولة "${rescheduleModalItem.title}" إلى ${newDateInput} بنجاح.`
          : `Rescheduled to ${newDateInput} successfully.`
      );
      setRescheduleModalItem(null);
      setNewDateInput("");
    } catch {
      setNotification(isAr ? "فشل تحديث الموعد." : "Failed to reschedule.");
    }
  };

  const handleDuplicateSubmit = async () => {
    if (!duplicateModalItem || !duplicateDateInput) return;
    try {
      const res = await fetch("/api/admin/media-center/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceItemId: duplicateModalItem.id,
          targetDate: duplicateDateInput,
          targetGrade: duplicateGradeInput,
        }),
      });

      const duplicated = duplicateContentForNewSlot(
        duplicateModalItem,
        duplicateDateInput,
        duplicateGradeInput
      );
      setItems((prev) => [duplicated, ...prev]);
      setNotification(
        isAr
          ? "تم استنساخ المحتوى بنجاح! الحالة الآن (بانتظار المراجعة) لضمان اعتماد الأستاذ حبيب."
          : "Content duplicated successfully for teacher review."
      );
      setDuplicateModalItem(null);
      setDuplicateDateInput("");
    } catch {
      setNotification(isAr ? "فشل الاستنساخ." : "Failed to duplicate.");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />;
      case "youtube":
        return <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />;
      case "tiktok":
        return <TiktokIcon className="w-3.5 h-3.5 text-slate-900 dark:text-white" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, approval: string) => {
    if (approval === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-2.5 h-2.5" />
          {isAr ? "معتمد" : "Approved"}
        </span>
      );
    }
    if (status === "queued") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          <Clock className="w-2.5 h-2.5" />
          {isAr ? "في الطابور" : "Queued"}
        </span>
      );
    }
    if (status === "published") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-2.5 h-2.5" />
          {isAr ? "تم النشر" : "Published"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        <Clock className="w-2.5 h-2.5" />
        {isAr ? "بانتظار المراجعة" : "Pending"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-blue-600 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-blue-600/20 animate-fade-in">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-white/80 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Month Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr ? "تقويم النشر الأكاديمي والجدولة الذكية" : "Academic Content Publishing Calendar"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? "إدارة مواعيد نشر الشروحات وتريكات الامتحانات عبر فيسبوك ويوتيوب وتيك توك مع حفظ حق المراجعة الإلزامية."
              : "Manage educational schedule across Facebook, YouTube, and TikTok with mandatory educator review."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
              title={isAr ? "الشهر السابق" : "Previous Month"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="px-4 py-1 text-center min-w-[130px]">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {isAr ? grid.monthNameAr : grid.monthNameEn} {grid.year}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
              title={isAr ? "الشهر القادم" : "Next Month"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {onNavigateToQueue && (
            <button
              onClick={onNavigateToQueue}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAr ? "طابور النشر المعتمد" : "Publishing Queue"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Platform Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setPlatformFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                platformFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {isAr ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setPlatformFilter("facebook")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                platformFilter === "facebook"
                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <FacebookIcon className="w-3 h-3 text-blue-600" />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => setPlatformFilter("youtube")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                platformFilter === "youtube"
                  ? "bg-white dark:bg-slate-900 text-red-600 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <YoutubeIcon className="w-3 h-3 text-red-600" />
              <span>YouTube</span>
            </button>
            <button
              onClick={() => setPlatformFilter("tiktok")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                platformFilter === "tiktok"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <TiktokIcon className="w-3 h-3" />
              <span>TikTok</span>
            </button>
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">{isAr ? "جميع الصفوف الدراسية" : "All Grades"}</option>
            <option value="Third Secondary (Thanawya Amma)">
              {isAr ? "الثانوية العامة (Sec 3)" : "Third Secondary"}
            </option>
            <option value="Second Secondary">{isAr ? "الصف الثاني الثانوي (Sec 2)" : "Second Secondary"}</option>
            <option value="First Secondary">{isAr ? "الصف الأول الثانوي (Sec 1)" : "First Secondary"}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">{isAr ? "كل الحالات" : "All Statuses"}</option>
            <option value="approved">{isAr ? "معتمد فقط" : "Approved Only"}</option>
            <option value="pending">{isAr ? "بانتظار المراجعة" : "Pending Review"}</option>
            <option value="queued">{isAr ? "في طابور النشر" : "Queued"}</option>
            <option value="published">{isAr ? "تم النشر" : "Published"}</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث في الموضوعات والدروس..." : "Search topics..."}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm overflow-x-auto">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 min-w-[700px]">
          {["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map(
            (dayName, i) => (
              <div
                key={i}
                className="text-center py-2 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                {dayName}
              </div>
            )
          )}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">
          {grid.days.map((slot, idx) => (
            <div
              key={idx}
              className={`min-h-[120px] rounded-2xl p-2 border transition flex flex-col justify-between ${
                slot.isCurrentMonth
                  ? slot.isToday
                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-600 shadow-sm"
                    : "bg-slate-50/30 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                  : "bg-slate-100/40 dark:bg-slate-950/40 border-dashed border-slate-200 dark:border-slate-800/60 opacity-60"
              }`}
            >
              {/* Day Cell Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-black ${
                    slot.isToday
                      ? "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {parseInt(slot.date.slice(8, 10), 10)}
                </span>
                {slot.items.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {slot.items.length} {isAr ? "منشور" : "items"}
                  </span>
                )}
              </div>

              {/* Items for this day */}
              <div className="space-y-1.5 flex-1">
                {slot.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer shadow-xs transition group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1">
                        {getPlatformIcon(item.platform)}
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                          {item.title}
                        </span>
                      </div>
                      {item.hasVideoAsset ? (
                        <Video className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                      ) : (
                        <FileText className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(item.status, item.approvalStatus)}
                      <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[70px]">
                        {item.grade.includes("Third") ? "3 ثانوي" : "ثانوي"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getPlatformIcon(selectedItem.platform)}
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {selectedItem.platform} • {selectedItem.format}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                {selectedItem.title}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                {selectedItem.hook}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "الصف الدراسي:" : "Grade:"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "الوحدة والموضوع:" : "Unit / Topic:"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.unitName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "تاريخ النشر المقترح:" : "Scheduled Date:"}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedItem.scheduledDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "حالة الاعتماد:" : "Approval Status:"}</span>
                <span>{getStatusBadge(selectedItem.status, selectedItem.approvalStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? "المسؤول عن المراجعة:" : "Reviewer:"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.reviewer}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">{isAr ? "المرجع المنهجي:" : "Curriculum Source:"}</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2 rounded-xl">
                  {selectedItem.sourceReference}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setRescheduleModalItem(selectedItem);
                  setNewDateInput(selectedItem.scheduledDate);
                  setSelectedItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? "تغيير الموعد" : "Reschedule"}</span>
              </button>

              <button
                onClick={() => {
                  setDuplicateModalItem(selectedItem);
                  setDuplicateDateInput(selectedItem.scheduledDate);
                  setSelectedItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isAr ? "استنساخ وإعادة توظيف" : "Duplicate & Reuse"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {isAr ? "إعادة جدولة المنشور" : "Reschedule Content"}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? `تحديد موعد نشر جديد لـ: "${rescheduleModalItem.title}". إذا كان المنشور معتمداً مسبقاً، سيظل الاعتماد سارياً طالما لم يتم تعديل النص.`
                : `Choose a new date. Approval is preserved if content text is untouched.`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? "تاريخ النشر الجديد:" : "New Date:"}
              </label>
              <input
                type="date"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
              >
                {isAr ? "حفظ الموعد الجديد" : "Save New Date"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate / Reuse Modal */}
      {duplicateModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-600" />
              <span>{isAr ? "استنساخ المحتوى وإعادة نشره" : "Duplicate & Reuse Content"}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? "سيتم إنشاء مسودة جديدة تماماً مبنية على المحتوى الأصلي، وستعاد حالة الموافقة إلى (بانتظار المراجعة) ليقوم مستر حبيب باعتمادها قبل النشر."
                : "Creates a new draft for a different slot. Approval resets to PENDING for teacher review."}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? "تاريخ النشر المستهدف:" : "Target Date:"}
                </label>
                <input
                  type="date"
                  value={duplicateDateInput}
                  onChange={(e) => setDuplicateDateInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? "الصف الدراسي المستهدف:" : "Target Grade:"}
                </label>
                <select
                  value={duplicateGradeInput}
                  onChange={(e) => setDuplicateGradeInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  <option value="Third Secondary (Thanawya Amma)">الثانوية العامة (Sec 3)</option>
                  <option value="Second Secondary">الصف الثاني الثانوي (Sec 2)</option>
                  <option value="First Secondary">الصف الأول الثانوي (Sec 1)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDuplicateModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleDuplicateSubmit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
              >
                {isAr ? "استنساخ المحتوى" : "Confirm Duplicate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
