"use client";

import React, { useState, useEffect } from "react";
import { authHeaders } from "@/lib/client-auth";
import {
  Languages,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  Lightbulb,
  Sparkles,
  Layers,
  X,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface KeyVocabRow {
  term: string;
  meaning_ar: string;
  synonyms: string;
  weight: number;
}

export const AdminTranslationModule: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [gradeLevel, setGradeLevel] = useState("3rd_sec");
  const [direction, setDirection] = useState<"en_to_ar" | "ar_to_en">("en_to_ar");
  const [exerciseType, setExerciseType] = useState<"written" | "mcq">("written");
  const [difficulty, setDifficulty] = useState("exam_past");
  const [sourceText, setSourceText] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [alternativeAnswersText, setAlternativeAnswersText] = useState("");
  const [grammarTip, setGrammarTip] = useState("");

  // Dynamic Key Vocabulary Builder State
  const [vocabRows, setVocabRows] = useState<KeyVocabRow[]>([
    { term: "", meaning_ar: "", synonyms: "", weight: 2 },
  ]);

  // MCQ Specific State
  const [mcqOptions, setMcqOptions] = useState<string[]>(["", "", "", ""]);
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState(0);
  const [mcqTrap0, setMcqTrap0] = useState("الترجمة الدقيقة والصحيحة تماماً.");
  const [mcqTrap1, setMcqTrap1] = useState("فخ الكلمات المتضادة أو المعنى العكسي.");
  const [mcqTrap2, setMcqTrap2] = useState("فخ الأزمنة وتغيير زمن الفعل.");
  const [mcqTrap3, setMcqTrap3] = useState("فخ الكلمات المتشابهة (False Friends).");

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/translation", { headers: authHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.exercises)) {
        setExercises(data.exercises);
      }
    } catch (e) {
      console.error("Failed to fetch translation exercises:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAddVocabRow = () => {
    setVocabRows([...vocabRows, { term: "", meaning_ar: "", synonyms: "", weight: 2 }]);
  };

  const handleRemoveVocabRow = (index: number) => {
    setVocabRows(vocabRows.filter((_, i) => i !== index));
  };

  const handleVocabChange = (index: number, field: keyof KeyVocabRow, value: any) => {
    const updated = [...vocabRows];
    updated[index] = { ...updated[index], [field]: value };
    setVocabRows(updated);
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim() || !modelAnswer.trim()) {
      setNotice({ type: "error", text: "النص الأصلي والترجمة النموذجية مطلوبان." });
      return;
    }

    setSaving(true);
    setNotice(null);

    // Format alternative answers
    const altAnswers = alternativeAnswersText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Format key vocabulary
    const keyVocabulary = vocabRows
      .filter((r) => r.term.trim().length > 0)
      .map((r) => ({
        term: r.term.trim(),
        meaning_ar: r.meaning_ar.trim() || r.term.trim(),
        synonyms: r.synonyms
          .split(/[,،]/)
          .map((s) => s.trim())
          .filter(Boolean),
        weight: Number(r.weight) || 2,
      }));

    // Format MCQ options if type is mcq
    let formattedMcq: any = null;
    if (exerciseType === "mcq") {
      formattedMcq = {
        options: mcqOptions.map((o) => o.trim()),
        correct_index: mcqCorrectIndex,
        trap_explanations: {
          "0": mcqTrap0.trim(),
          "1": mcqTrap1.trim(),
          "2": mcqTrap2.trim(),
          "3": mcqTrap3.trim(),
        },
      };
    }

    try {
      const res = await fetch("/api/admin/translation", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          gradeLevel,
          direction,
          exerciseType,
          difficulty,
          sourceText: sourceText.trim(),
          modelAnswer: modelAnswer.trim(),
          alternativeAnswers: altAnswers,
          keyVocabulary,
          mcqOptions: formattedMcq,
          grammarTip: grammarTip.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotice({ type: "success", text: "تمت إضافة تمرين الترجمة بنجاح إلى الأكاديمية!" });
        setSourceText("");
        setModelAnswer("");
        setAlternativeAnswersText("");
        setGrammarTip("");
        setVocabRows([{ term: "", meaning_ar: "", synonyms: "", weight: 2 }]);
        fetchExercises();
      } else {
        setNotice({ type: "error", text: data.error || "تعذر حفظ التمرين." });
      }
    } catch (err: any) {
      setNotice({ type: "error", text: "حدث خطأ أثناء حفظ التمرين." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التمرين من أكاديمية الترجمة؟")) return;
    try {
      const res = await fetch(`/api/admin/translation?id=${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setExercises((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (e) {
      console.error("Delete exercise error:", e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Languages className="w-5 h-5 text-amber-500" />
            <span>إدارة أكاديمية الترجمة الذكية (Translation Academy CMS)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            إضافة تدريبات التحريري و MCQ مع ضبط أوزان المفردات المفتاحية والفخاخ اللغوية للمصحح الذكي.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "إغلاق النموذج" : "إضافة تمرين ترجمة جديد"}</span>
        </button>
      </div>

      {/* 2. ADD EXERCISE FORM */}
      {showAddForm && (
        <form
          onSubmit={handleSaveExercise}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-900/60 shadow-xl space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-black text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>إعداد وتخصيص تمرين ترجمة ذكي جديد</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {notice && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {notice.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{notice.text}</span>
            </div>
          )}

          {/* META CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-500 mb-1">المرحلة والصف:</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="3rd_sec">الثالث الثانوي (شهادة عامة)</option>
                <option value="2nd_sec">الصف الثاني الثانوي</option>
                <option value="1st_sec">الصف الأول الثانوي</option>
                <option value="3rd_prep">الصف الثالث الإعدادي</option>
                <option value="2nd_prep">الصف الثاني الإعدادي</option>
                <option value="1st_prep">الصف الأول الإعدادي</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">اتجاه الترجمة:</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="en_to_ar">من الإنجليزية إلى العربية (En ⬅️ Ar)</option>
                <option value="ar_to_en">من العربية إلى الإنجليزية (Ar ⬅️ En)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">نمط التمرين:</label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="written">ترجمة تحريرية ذكية (Smart Written)</option>
                <option value="mcq">اختيار من متعدد (MCQ Drills)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">مستوى الصعوبة:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="exam_past">امتحانات ثانوية عامة سابقة 🏛️</option>
                <option value="advanced">مستوى متقدم 🔥</option>
                <option value="standard">قياسي معتمد ⭐</option>
              </select>
            </div>
          </div>

          {/* SOURCE AND MODEL ANSWER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                النص الأصلي المراد ترجمته (Source Text):
              </label>
              <textarea
                rows={3}
                required
                placeholder="اكتب النص هنا باللغة المصدر..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                dir={direction === "en_to_ar" ? "ltr" : "rtl"}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                الترجمة النموذجية المعتمدة (Official Model Answer):
              </label>
              <textarea
                rows={3}
                required
                placeholder="اكتب الترجمة النموذجية الدقيقة..."
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                dir={direction === "en_to_ar" ? "rtl" : "ltr"}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* ALTERNATIVE ANSWERS */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              بدائل وصيغ أخرى مقبولة تحسب صحيحة 100% (سطر لكل بديل):
            </label>
            <textarea
              rows={2}
              placeholder="اكتب كل صياغة بديلة في سطر منفصل..."
              value={alternativeAnswersText}
              onChange={(e) => setAlternativeAnswersText(e.target.value)}
              dir={direction === "en_to_ar" ? "rtl" : "ltr"}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* DYNAMIC KEY VOCABULARY BUILDER */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-black text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>مُنشئ المفردات المحورية والمرادفات المقبولة (Key Vocabulary Builder)</span>
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  هذه الكلمات تمثل 70% من تقييم الطالب، ويتم التحقق من ورودها أو مرادفاتها تلقائياً.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVocabRow}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مفردة جديدة</span>
              </button>
            </div>

            <div className="space-y-2">
              {vocabRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="المصطلح بالإنجليزية (e.g. vital role)"
                      value={row.term}
                      onChange={(e) => handleVocabChange(idx, "term", e.target.value)}
                      dir="ltr"
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="المعنى بالعربية (دوراً حيوياً)"
                      value={row.meaning_ar}
                      onChange={(e) => handleVocabChange(idx, "meaning_ar", e.target.value)}
                      dir="rtl"
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="مرادفات مقبولة مفصولة بفواصل (crucial role, key role)"
                      value={row.synonyms}
                      onChange={(e) => handleVocabChange(idx, "synonyms", e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <select
                      value={row.weight}
                      onChange={(e) => handleVocabChange(idx, "weight", Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center font-bold"
                      title="الوزن النسبي"
                    >
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={3}>3x</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveVocabRow(idx)}
                      disabled={vocabRows.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MCQ OPTIONS BUILDER (IF MCQ MODE) */}
          {exerciseType === "mcq" && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h5 className="font-black text-xs text-slate-800 dark:text-slate-200">
                  خيارات البوكليت وتفسيرات الفخاخ الأربعة (MCQ Traps):
                </h5>
              </div>

              <div className="space-y-3 text-xs">
                {mcqOptions.map((opt, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mcqCorrectIndex"
                        checked={mcqCorrectIndex === i}
                        onChange={() => setMcqCorrectIndex(i)}
                        className="cursor-pointer"
                      />
                      <span className="font-black text-blue-600">خيار ({String.fromCharCode(65 + i)}):</span>
                      <input
                        type="text"
                        placeholder={`نص الخيار ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...mcqOptions];
                          updated[i] = e.target.value;
                          setMcqOptions(updated);
                        }}
                        dir={direction === "en_to_ar" ? "rtl" : "ltr"}
                        className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>

                    <div className="flex items-center gap-2 pr-6">
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">كشف الفخ:</span>
                      <input
                        type="text"
                        placeholder="سبب استبعاد هذا الخيار (أو تأكيد صحته)"
                        value={i === 0 ? mcqTrap0 : i === 1 ? mcqTrap1 : i === 2 ? mcqTrap2 : mcqTrap3}
                        onChange={(e) => {
                          if (i === 0) setMcqTrap0(e.target.value);
                          if (i === 1) setMcqTrap1(e.target.value);
                          if (i === 2) setMcqTrap2(e.target.value);
                          if (i === 3) setMcqTrap3(e.target.value);
                        }}
                        className="flex-1 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEACHER GRAMMAR TIP */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>نصيحة وملاحظة مستر حبيب الرحمن النحوية (Grammar & Structure Tip):</span>
            </label>
            <textarea
              rows={2}
              placeholder="مثال: لاحظ استخدام المضارع التام (has launched) للتعبير عن إنجاز تم بالفعل، وترجمة combat بـ يكافح..."
              value={grammarTip}
              onChange={(e) => setGrammarTip(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "حفظ التمرين في الأكاديمية"}
            </button>
          </div>
        </form>
      )}

      {/* 3. EXERCISES LIST TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>إجمالي تدريبات أكاديمية الترجمة: {exercises.length} تدريب</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">جاري تحميل تدريبات الترجمة...</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="font-bold text-xs">لا توجد تمارين حالياً. اضغط على &ldquo;إضافة تمرين ترجمة جديد&rdquo; للبدء.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">النص الأصلي</th>
                  <th className="p-3.5">الترجمة النموذجية</th>
                  <th className="p-3.5">الاتجاه والنوع</th>
                  <th className="p-3.5">الصعوبة</th>
                  <th className="p-3.5 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exercises.map((ex, idx) => (
                  <tr key={ex.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 max-w-sm">
                      <p className="font-bold text-slate-900 dark:text-white truncate" dir={ex.direction === "en_to_ar" ? "ltr" : "rtl"}>
                        {ex.sourceText}
                      </p>
                      {ex.grammarTip && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 truncate mt-0.5">
                          💡 {ex.grammarTip}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 max-w-sm">
                      <p className="text-slate-700 dark:text-slate-300 truncate" dir={ex.direction === "en_to_ar" ? "rtl" : "ltr"}>
                        {ex.modelAnswer}
                      </p>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-blue-600 block">
                        {ex.direction === "en_to_ar" ? "En ⬅️ Ar" : "Ar ⬅️ En"}
                      </span>
                      <span className="text-[10px] text-purple-600 uppercase">{ex.exerciseType}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                        {ex.difficulty}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                        title="حذف التمرين"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
