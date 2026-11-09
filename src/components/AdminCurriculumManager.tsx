"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Layers,
  BookMarked,
  RefreshCw,
  Video,
  FileText,
  AlertCircle,
  HelpCircle,
  Users,
  Quote,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const AdminCurriculumManager: React.FC = () => {
  const { lang, user } = useApp();

  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [gradeData, setGradeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<"units" | "story" | "new_grade">("units");

  // Selected Unit for editing
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitSections, setUnitSections] = useState<any[]>([]);

  // Modal / Form state for New Grade
  const [newGradeForm, setNewGradeForm] = useState({
    code: "",
    titleAr: "",
    titleEn: "",
    stage: "Secondary",
    storyTitleAr: "",
    storyTitleEn: "",
    storyAuthor: "",
  });

  // Form state for New / Editing Chapter
  const [newChapterModal, setNewChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState<any>({
    chapterNumber: 1,
    titleAr: "",
    titleEn: "",
    explanation: "",
    videoUrl: "",
    pdfUrl: "",
  });

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch all grades
  const loadGrades = async () => {
    try {
      const res = await fetch("/api/curriculum");
      const json = await res.json();
      if (json.success && json.grades) {
        setGrades(json.grades);
        if (!selectedGradeId && json.grades.length > 0) {
          setSelectedGradeId(json.grades[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Grade Tree
  const loadGradeTree = async (gId: string) => {
    if (!gId) return;
    setLoading(true);
    try {
      const g = grades.find((item) => item.id === gId);
      const code = g?.code || gId;
      const res = await fetch(`/api/curriculum?grade=${code}`);
      const json = await res.json();
      if (json.success) {
        setGradeData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Auto Generate 6 Units + 2 Reviews
  const handleAutoGenerateUnits = async () => {
    if (!selectedGradeId) return;
    if (!confirm(lang === "ar" ? "هل تريد توليد هيكل المنهج التلقائي (6 وحدات + مراجعتين) لهذا الصف؟" : "Generate 6 Units + 2 Reviews structure?")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_generate_units",
          gradeId: selectedGradeId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotice(lang === "ar" ? "تم توليد الوحدات والمراجعات بنجاح!" : "Structure generated!");
        loadGradeTree(selectedGradeId);
      } else {
        showNotice(json.error || "Generation error", "error");
      }
    } catch {
      showNotice("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Sync 2026/2027 Egyptian Curriculum
  const handleSync2026 = async () => {
    if (!confirm(lang === "ar" ? "هل ترغب في مزامنة وتحديث أسماء جميع المناهج والوحدات وقصص الفصول للعام الدراسي 2026/2027؟ لن يتم حذف أي بيانات أو فيديوهات." : "Sync all curriculum grades, units and story chapters to 2026/2027 syllabus? No videos or questions will be lost.")) return;

    setSaving(true);
    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_curriculum_2026" }),
      });
      const json = await res.json();
      if (json.success) {
        showNotice(lang === "ar" ? "تمت مزامنة منهج 2026/2027 الرسمي بنجاح لجميع الصفوف!" : "2026/2027 curriculum synced successfully!");
        await loadGrades();
        if (selectedGradeId) loadGradeTree(selectedGradeId);
      } else {
        showNotice(json.error || "Sync error", "error");
      }
    } catch {
      showNotice("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  // Create new Grade
  const handleCreateGrade = async () => {
    if (!newGradeForm.titleAr || !newGradeForm.titleEn) {
      showNotice(lang === "ar" ? "أدخل عنوان الصف بالعربية والإنجليزية" : "Fill required title fields", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_grade",
          ...newGradeForm,
          code: newGradeForm.code || `track_${Date.now()}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotice(lang === "ar" ? "تم إنشاء الصف الدراسي بنجاح!" : "Grade created!");
        await loadGrades();
        setAdminTab("units");
      } else {
        showNotice(json.error || "Error", "error");
      }
    } catch {
      showNotice("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save Story Chapter
  const handleSaveChapter = async () => {
    if (!chapterForm.titleAr || !selectedGradeId) {
      showNotice(lang === "ar" ? "أدخل عنوان الفصل" : "Title required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_story_chapter",
          gradeId: selectedGradeId,
          ...chapterForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotice(lang === "ar" ? "تم حفظ فصل القصة بنجاح!" : "Chapter saved!");
        setNewChapterModal(false);
        loadGradeTree(selectedGradeId);
      } else {
        showNotice(json.error || "Error", "error");
      }
    } catch {
      showNotice("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Story Chapter
  const handleDeleteChapter = async (chapId: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الفصل؟" : "Delete chapter?")) return;
    try {
      await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_story_chapter", chapterId: chapId }),
      });
      showNotice(lang === "ar" ? "تم حذف الفصل" : "Deleted");
      loadGradeTree(selectedGradeId);
    } catch {}
  };

  // Delete Unit
  const handleDeleteUnit = async (uId: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذه الوحدة؟" : "Delete unit?")) return;
    try {
      await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_unit", unitId: uId }),
      });
      showNotice(lang === "ar" ? "تم حذف الوحدة" : "Unit deleted");
      loadGradeTree(selectedGradeId);
    } catch {}
  };

  useEffect(() => {
    loadGrades();
  }, []);

  useEffect(() => {
    if (selectedGradeId) {
      loadGradeTree(selectedGradeId);
    }
  }, [selectedGradeId]);

  return (
    <div className="bg-white dark:bg-[#0c071a] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-purple-950/60 shadow-xl space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-purple-900/40 pb-5">
        <div>
          <span className="text-[11px] font-black uppercase text-purple-600 dark:text-sky-400">
            Professional Academy Management Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1 flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600" />
            <span>{lang === "ar" ? "إدارة وتوزيع المناهج والقصة المقررة" : "Smart Curriculum & Story Manager"}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "ar"
              ? "التحكم في الوحدات الست، المراجعات بعد الوحدة 3 و 6، فصول القصة، وربط بنك الأسئلة والفيديوهات."
              : "Manage 6 Units, Reviews 1 & 2, Story Corner chapters, and question bank linkages."}
          </p>
        </div>

        {/* 1-CLICK ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSync2026}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === "ar" ? "مزامنة منهج 2026/2027 الرسمي" : "Sync 2026/2027 Curriculum"}</span>
          </button>
          <button
            onClick={handleAutoGenerateUnits}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>{lang === "ar" ? "توليد وحدات الصف" : "Generate Grade Units"}</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* GRADE SELECTOR & TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* SELECT GRADE */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">{lang === "ar" ? "الصف المستهدف:" : "Target Grade:"}</span>
          <select
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1a0f38] border border-slate-300 dark:border-purple-800 text-xs font-extrabold focus:outline-none"
          >
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {lang === "ar" ? g.titleAr : g.titleEn} ({g.stage})
              </option>
            ))}
          </select>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-100 dark:bg-purple-950/40 p-1 rounded-2xl border border-slate-200 dark:border-purple-900/40">
          <button
            onClick={() => setAdminTab("units")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              adminTab === "units"
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-white"
            }`}
          >
            {lang === "ar" ? "الوحدات والمراجعات" : "Units & Reviews"}
          </button>
          <button
            onClick={() => setAdminTab("story")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              adminTab === "story"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-white"
            }`}
          >
            {lang === "ar" ? "فصول القصة المقررة" : "Story Chapters"}
          </button>
          <button
            onClick={() => setAdminTab("new_grade")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              adminTab === "new_grade"
                ? "bg-sky-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-white"
            }`}
          >
            + {lang === "ar" ? "إضافة صف جديد" : "Add Grade"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500">
          {lang === "ar" ? "جاري تحميل بيانات المنهج..." : "Loading curriculum..."}
        </div>
      ) : adminTab === "units" ? (

        /* =========================================================================
            ADMIN TAB 1: UNITS & REVIEWS LIST
           ========================================================================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
              {lang === "ar" ? "الوحدات والمراجعات المقررة لهذا الصف" : "Configured Units & Reviews"} ({(gradeData?.mainCurriculum?.units || []).length})
            </h3>
          </div>

          <div className="space-y-3">
            {(gradeData?.mainCurriculum?.units || []).map((u: any) => {
              const isReview = u.type === "review";
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isReview
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-900/50"
                      : "bg-slate-50 dark:bg-[#120a24] border-slate-200 dark:border-purple-950/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      isReview ? "bg-amber-400 text-slate-950" : "bg-purple-600 text-white"
                    }`}>
                      {isReview ? "Review" : `Unit ${u.unitNumber}`}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {lang === "ar" ? u.titleAr : u.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {u.sectionsCount || 0} {lang === "ar" ? "أقسام (كلمات، قواعد، مهارات)" : "Sections (Vocab, Grammar, Writing)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteUnit(u.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                      title="Delete unit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : adminTab === "story" ? (

        /* =========================================================================
            ADMIN TAB 2: STORY CORNER CHAPTERS
           ========================================================================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {lang === "ar" ? "فصول القصة المقررة" : "Story Chapters"}
              </h3>
              <p className="text-xs text-amber-500 font-bold">
                {gradeData?.storyCorner?.storyTitleAr || "لم يتم تحديد قصة بعد"} ({gradeData?.storyCorner?.storyAuthor || ""})
              </p>
            </div>

            <button
              onClick={() => {
                setChapterForm({
                  chapterNumber: (gradeData?.storyCorner?.chapters?.length || 0) + 1,
                  titleAr: "",
                  titleEn: "",
                  explanation: "",
                  videoUrl: "",
                  pdfUrl: "",
                });
                setNewChapterModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "ar" ? "إضافة فصل جديد" : "Add Chapter"}</span>
            </button>
          </div>

          <div className="space-y-3">
            {(gradeData?.storyCorner?.chapters || []).map((ch: any) => (
              <div
                key={ch.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#120a24] border border-slate-200 dark:border-purple-950/60 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    Chapter {ch.chapterNumber}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {lang === "ar" ? ch.titleAr : ch.titleEn}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl">
                      {ch.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteChapter(ch.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* NEW CHAPTER MODAL */}
          {newChapterModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#12082b] p-6 rounded-3xl border border-amber-400/60 max-w-lg w-full space-y-4 shadow-2xl">
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  {lang === "ar" ? "إضافة فصل جديد للقصة" : "Add New Story Chapter"}
                </h4>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "رقم الفصل" : "Chapter #"}</label>
                      <input
                        type="number"
                        value={chapterForm.chapterNumber}
                        onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: parseInt(e.target.value) || 1 })}
                        className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "العنوان بالعربية" : "Arabic Title"}</label>
                      <input
                        type="text"
                        value={chapterForm.titleAr}
                        onChange={(e) => setChapterForm({ ...chapterForm, titleAr: e.target.value })}
                        placeholder="الفصل الأول: المقبرة..."
                        className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "العنوان بالإنجليزية" : "English Title"}</label>
                    <input
                      type="text"
                      value={chapterForm.titleEn}
                      onChange={(e) => setChapterForm({ ...chapterForm, titleEn: e.target.value })}
                      placeholder="Chapter 1: The Churchyard..."
                      className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "ملخص وشرح أحداث الفصل" : "Explanation / Summary"}</label>
                    <textarea
                      rows={3}
                      value={chapterForm.explanation}
                      onChange={(e) => setChapterForm({ ...chapterForm, explanation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs"
                      placeholder="أهم ما دار في هذا الفصل..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setNewChapterModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    onClick={handleSaveChapter}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md"
                  >
                    {lang === "ar" ? "حفظ الفصل" : "Save Chapter"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (

        /* =========================================================================
            ADMIN TAB 3: ADD NEW GRADE
           ========================================================================= */
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="font-black text-base text-slate-900 dark:text-white">
            {lang === "ar" ? "إضافة صف أو مسار دراسي جديد" : "Create New Grade or Track"}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "كود الصف الفريد (Code)" : "Grade Code"}</label>
              <input
                type="text"
                value={newGradeForm.code}
                onChange={(e) => setNewGradeForm({ ...newGradeForm, code: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                placeholder="e.g. sec_igcse_1 or prep_4"
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "اسم الصف بالعربية" : "Title (Arabic)"}</label>
                <input
                  type="text"
                  value={newGradeForm.titleAr}
                  onChange={(e) => setNewGradeForm({ ...newGradeForm, titleAr: e.target.value })}
                  placeholder="مثال: الصف الأول الثانوي الدولي"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "اسم الصف بالإنجليزية" : "Title (English)"}</label>
                <input
                  type="text"
                  value={newGradeForm.titleEn}
                  onChange={(e) => setNewGradeForm({ ...newGradeForm, titleEn: e.target.value })}
                  placeholder="e.g. First Secondary International"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "المرحلة التعليمية" : "Stage"}</label>
              <select
                value={newGradeForm.stage}
                onChange={(e) => setNewGradeForm({ ...newGradeForm, stage: e.target.value })}
                className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs font-bold"
              >
                <option value="Preparatory">{lang === "ar" ? "المرحلة الإعدادية" : "Preparatory"}</option>
                <option value="Secondary">{lang === "ar" ? "المرحلة الثانوية" : "Secondary"}</option>
                <option value="General">{lang === "ar" ? "مسار عام / لغات" : "General"}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "عنوان القصة المقررة بالعربية" : "Story Title (Arabic)"}</label>
                <input
                  type="text"
                  value={newGradeForm.storyTitleAr}
                  onChange={(e) => setNewGradeForm({ ...newGradeForm, storyTitleAr: e.target.value })}
                  placeholder="مثال: جزيرة الكنز"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">{lang === "ar" ? "مؤلف القصة" : "Author"}</label>
                <input
                  type="text"
                  value={newGradeForm.storyAuthor}
                  onChange={(e) => setNewGradeForm({ ...newGradeForm, storyAuthor: e.target.value })}
                  placeholder="e.g. Charles Dickens"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleCreateGrade}
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition-all cursor-pointer"
            >
              {saving ? (lang === "ar" ? "جاري الإنشاء..." : "Saving...") : (lang === "ar" ? "تأكيد إضافة الصف الجديد" : "Create Grade")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
