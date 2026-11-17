"use client";

import React, { useState, useEffect } from "react";
import { authHeaders } from "@/lib/client-auth";
import {
  BookOpen,
  Video,
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export const AdminCurriculumModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"lessons" | "stories">("lessons");
  const [selectedGrade, setSelectedGrade] = useState("Third Secondary");
  const [units, setUnits] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Unit State
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [grammarTopic, setGrammarTopic] = useState("");
  const [vocabTheme, setVocabTheme] = useState("");
  const [savingNotice, setSavingNotice] = useState("");

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/curriculum?grade=${encodeURIComponent(selectedGrade)}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUnits(data.units || []);
        setStories(data.stories || []);
        if (data.units?.length > 0 && !selectedUnit) {
          setSelectedUnit(data.units[0]);
          setVideoUrl(data.units[0].videoUrl || "");
          setGrammarTopic(data.units[0].grammarTopic || "");
          setVocabTheme(data.units[0].vocabularyTheme || "");
        }
      }
    } catch (e) {
      console.error("Failed to load curriculum:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  const handleSelectUnit = (u: any) => {
    setSelectedUnit(u);
    setVideoUrl(u.videoUrl || "");
    setGrammarTopic(u.grammarTopic || "");
    setVocabTheme(u.vocabularyTheme || "");
    setSavingNotice("");
  };

  const handleSaveUnit = async () => {
    if (!selectedUnit) return;
    setSavingNotice("جاري الحفظ...");

    try {
      const res = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "update_unit",
          unitId: selectedUnit.id,
          videoUrl,
          grammarTopic,
          vocabularyTheme: vocabTheme,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavingNotice("تم حفظ التعديلات بنجاح! ✅");
        setTimeout(() => setSavingNotice(""), 3000);
      }
    } catch (e) {
      setSavingNotice("خطأ في الحفظ");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. HEADER & SUB-TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>إدارة المناهج والقصص الأدبية (Lessons & Literature CMS)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            إدارة روابط الشرح، مذكرات PDF، وقصص الوزارة المقررة وفق منهج 2026/2027.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveSubTab("lessons")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === "lessons"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            الوحدات والشروحات
          </button>
          <button
            onClick={() => setActiveSubTab("stories")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeSubTab === "stories"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            القصص الأدبية والروايات
          </button>
        </div>
      </div>

      {/* 2. LESSONS VIEW */}
      {activeSubTab === "lessons" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* UNITS LIST */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              قائمة وحدات المنهج:
            </h4>

            <div className="space-y-2">
              {units.map((u, idx) => (
                <button
                  key={u.id || idx}
                  onClick={() => handleSelectUnit(u)}
                  className={`w-full text-right p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    selectedUnit?.id === u.id
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-bold"
                      : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black block">{u.titleAr}</span>
                    <span className="text-[10px] text-slate-400 block" dir="ltr">{u.titleEn}</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* UNIT DETAIL & EDIT FORM */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {selectedUnit ? (
              <>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                    {selectedUnit.grade || "Third Secondary"}
                  </span>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                    {selectedUnit.titleAr} — {selectedUnit.titleEn}
                  </h4>
                </div>

                {savingNotice && (
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    {savingNotice}
                  </p>
                )}

                <div className="space-y-4 text-xs font-bold">
                  <div>
                    <label className="block text-slate-500 mb-1 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-rose-500" />
                      <span>رابط فيديو شرح الدرس (YouTube أو رابط مباشر):</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      dir="ltr"
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">موضوع القواعد (Grammar Topic):</label>
                    <input
                      type="text"
                      placeholder="مثال: Past Simple vs Past Continuous"
                      value={grammarTopic}
                      onChange={(e) => setGrammarTopic(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">محور المفردات اللغوية (Vocabulary Theme):</label>
                    <input
                      type="text"
                      placeholder="مثال: Protecting the Environment & Eco-tourism"
                      value={vocabTheme}
                      onChange={(e) => setVocabTheme(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end">
                    <button
                      onClick={handleSaveUnit}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ تعديلات الوحدة</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">اختر وحدة لعرض وتعديل تفاصيلها.</p>
            )}
          </div>
        </div>
      )}

      {/* 3. STORIES VIEW */}
      {activeSubTab === "stories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((st, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                    {st.grade}
                  </span>
                  <span className="text-xs text-slate-400">{st.totalChapters} فصول</span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {st.storyTitle}
                </h4>
                <p className="text-xs text-slate-500">المؤلف: {st.author}</p>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 block">فصول القصة:</span>
                  {st.chapters?.slice(0, 3).map((ch: any, cIdx: number) => (
                    <div key={cIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>{ch.titleAr} ({ch.titleEn})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
