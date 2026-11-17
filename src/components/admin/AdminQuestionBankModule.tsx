"use client";

import React, { useState, useEffect } from "react";
import { authHeaders } from "@/lib/client-auth";
import {
  Plus,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  HelpCircle,
  FileText,
  Save,
  X,
  FileSpreadsheet,
  AlertCircle,
  Layers,
} from "lucide-react";

export const AdminQuestionBankModule: React.FC = () => {
  // Questions list state
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Single Question Form State
  const [qGrade, setQGrade] = useState("Third Secondary (Baccalaureate)");
  const [qUnit, setQUnit] = useState("Unit 1");
  const [qTopic, setQTopic] = useState("");
  const [qCategory, setQCategory] = useState("Grammar");
  const [qDifficulty, setQDifficulty] = useState("Medium");
  const [qText, setQText] = useState("");
  const [qOptionA, setQOptionA] = useState("");
  const [qOptionB, setQOptionB] = useState("");
  const [qOptionC, setQOptionC] = useState("");
  const [qOptionD, setQOptionD] = useState("");
  const [qCorrectChoice, setQCorrectChoice] = useState<"A" | "B" | "C" | "D">("A");
  const [qExplanation, setQExplanation] = useState("");
  const [submittingSingle, setSubmittingSingle] = useState(false);
  const [singleNotice, setSingleNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bulk Import State
  const [bulkInput, setBulkInput] = useState("");
  const [bulkParsed, setBulkParsed] = useState<any[]>([]);
  const [bulkParsingError, setBulkParsingError] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkSuccessNotice, setBulkSuccessNotice] = useState("");

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editingSaving, setEditingSaving] = useState(false);

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (gradeFilter !== "all") params.set("grade", gradeFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", "40");

      const res = await fetch(`/api/admin/questions?${params.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setTotalCount(data.totalCount || data.questions.length);
      }
    } catch (e) {
      console.error("Failed to fetch questions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeFilter, categoryFilter]);

  // Handle Save Single Question
  const handleSaveSingleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qOptionA.trim() || !qOptionB.trim() || !qOptionC.trim() || !qOptionD.trim()) {
      setSingleNotice({ type: "error", text: "يرجى تعبئة نص السؤال والخيارات الأربعة بالكامل." });
      return;
    }

    setSubmittingSingle(true);
    setSingleNotice(null);

    const options = [qOptionA.trim(), qOptionB.trim(), qOptionC.trim(), qOptionD.trim()];
    let correctAnswer = qOptionA.trim();
    if (qCorrectChoice === "B") correctAnswer = qOptionB.trim();
    if (qCorrectChoice === "C") correctAnswer = qOptionC.trim();
    if (qCorrectChoice === "D") correctAnswer = qOptionD.trim();

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "create_single",
          question: {
            questionText: qText.trim(),
            domainCategory: qCategory,
            stage: qGrade.includes("Prep") ? "Preparatory" : "Secondary",
            grade: qGrade,
            unit: qUnit.trim() || "General Unit",
            topic: qTopic.trim() || qCategory,
            difficulty: qDifficulty,
            options,
            correctAnswer,
            explanation: qExplanation.trim(),
            points: 10,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSingleNotice({ type: "success", text: "تمت إضافة السؤال بنجاح إلى بنك الأسئلة!" });
        setQText("");
        setQOptionA("");
        setQOptionB("");
        setQOptionC("");
        setQOptionD("");
        setQExplanation("");
        fetchQuestions();
      } else {
        setSingleNotice({ type: "error", text: data.error || "فشل حفظ السؤال." });
      }
    } catch (err: any) {
      setSingleNotice({ type: "error", text: "خطأ في الاتصال بالخادم." });
    } finally {
      setSubmittingSingle(false);
    }
  };

  // Handle Parse Bulk Input (JSON or CSV)
  const handleParseBulk = () => {
    setBulkParsingError("");
    setBulkParsed([]);
    const text = bulkInput.trim();
    if (!text) return;

    // 1. Try JSON Parse
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        setBulkParsed(arr);
        return;
      } catch (err: any) {
        // Fall through to CSV parser
      }
    }

    // 2. Try Tab or Pipe or Comma separated CSV
    try {
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const rows: any[] = [];
      for (const line of lines) {
        // Expected format: QuestionText | OptA,OptB,OptC,OptD | CorrectAnswer | Explanation | Topic
        const parts = line.includes("\t")
          ? line.split("\t")
          : line.includes("|")
          ? line.split("|")
          : line.split(";");

        if (parts.length >= 3) {
          const rawOptions = parts[1]?.split(",").map((o) => o.trim()) || [];
          rows.push({
            questionText: parts[0]?.trim(),
            options: rawOptions.length >= 2 ? rawOptions : ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: parts[2]?.trim() || rawOptions[0] || "",
            explanation: parts[3]?.trim() || "",
            topic: parts[4]?.trim() || "General",
            grade: qGrade,
            domainCategory: qCategory,
            difficulty: "Medium",
          });
        }
      }

      if (rows.length === 0) {
        setBulkParsingError("تعذر قراءة التنسيق. تأكد من إدخال JSON صالح أو أسطر مفصولة بـ (|).");
      } else {
        setBulkParsed(rows);
      }
    } catch (e: any) {
      setBulkParsingError("خطأ في التحليل: " + e.message);
    }
  };

  // Handle Submit Bulk Questions
  const handleSubmitBulk = async () => {
    if (bulkParsed.length === 0) return;
    setBulkSubmitting(true);
    setBulkSuccessNotice("");

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "bulk_insert",
          questions: bulkParsed,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBulkSuccessNotice(`تم استيراد ${data.insertedCount} سؤالاً بنجاح إلى قاعدة البيانات! 🎉`);
        setBulkInput("");
        setBulkParsed([]);
        fetchQuestions();
      }
    } catch (e) {
      console.error("Bulk insert failed:", e);
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Handle Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا السؤال من بنك الأسئلة؟")) return;

    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setTotalCount((prev) => prev - 1);
      }
    } catch (e) {
      console.error("Delete question error:", e);
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setEditingSaving(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(editingQuestion),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingQuestion.id ? editingQuestion : q))
        );
        setEditingQuestion(null);
      }
    } catch (e) {
      console.error("Edit save error:", e);
    } finally {
      setEditingSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. ACTION BAR (HEADER & BUTTONS) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>إدارة بنك الأسئلة الذكي (Question Bank CMS)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            إضافة وتعديل وحذف أسئلة الامتحانات بنظام البوكليت، والاستيراد الجماعي للأسئلة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد جماعي (Bulk Import)</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? "إغلاق النموذج" : "إضافة سؤال فردي سريع"}</span>
          </button>
        </div>
      </div>

      {/* 2. ADD SINGLE QUESTION FORM (COLLAPSIBLE) */}
      {showAddForm && (
        <form
          onSubmit={handleSaveSingleQuestion}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-200 dark:border-blue-900/60 shadow-lg space-y-5 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-black text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>إدخال سؤال جديد إلى بنك الأسئلة</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {singleNotice && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                singleNotice.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {singleNotice.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{singleNotice.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-500 mb-1">الصف الدراسي:</label>
              <select
                value={qGrade}
                onChange={(e) => setQGrade(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Third Secondary (Baccalaureate)">الثالث الثانوي (شهادة عامة)</option>
                <option value="Second Secondary">الصف الثاني الثانوي</option>
                <option value="First Secondary">الصف الأول الثانوي</option>
                <option value="Third Prep">الصف الثالث الإعدادي</option>
                <option value="Second Prep">الصف الثاني الإعدادي</option>
                <option value="First Prep">الصف الأول الإعدادي</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">الوحدة / Topic:</label>
              <input
                type="text"
                placeholder="مثال: Unit 1 - Past Tenses"
                value={qUnit}
                onChange={(e) => setQUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">التصنيف (Category):</label>
              <select
                value={qCategory}
                onChange={(e) => setQCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Grammar">قواعد (Grammar)</option>
                <option value="Vocabulary">مفردات (Vocabulary)</option>
                <option value="Reading">فهم وقراءة (Reading)</option>
                <option value="Story">القصة الأدبية (Story)</option>
                <option value="Writing">مهارات الكتابة (Writing)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">مستوى الصعوبة:</label>
              <select
                value={qDifficulty}
                onChange={(e) => setQDifficulty(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Easy">سهل (مباشر)</option>
                <option value="Medium">متوسط (امتحاني)</option>
                <option value="Hard">متفوقين (تفكير عليا)</option>
                <option value="Exam Past">امتحانات سابقة</option>
              </select>
            </div>
          </div>

          {/* QUESTION TEXT */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              نص السؤال (Question Text بالإنجليزية):
            </label>
            <input
              type="text"
              required
              placeholder="e.g., By next month, the government ______ the new grand hospital."
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              dir="ltr"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
            />
          </div>

          {/* 4 OPTIONS */}
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 block">
              الخيارات الأربعة (حدد الإجابة الصحيحة عبر النقطة الدائرية):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <input
                  type="radio"
                  name="correctChoice"
                  checked={qCorrectChoice === "A"}
                  onChange={() => setQCorrectChoice("A")}
                  className="cursor-pointer"
                />
                <span className="font-bold text-blue-600">A:</span>
                <input
                  type="text"
                  required
                  placeholder="Option A"
                  value={qOptionA}
                  onChange={(e) => setQOptionA(e.target.value)}
                  dir="ltr"
                  className="flex-1 bg-transparent border-none focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <input
                  type="radio"
                  name="correctChoice"
                  checked={qCorrectChoice === "B"}
                  onChange={() => setQCorrectChoice("B")}
                  className="cursor-pointer"
                />
                <span className="font-bold text-blue-600">B:</span>
                <input
                  type="text"
                  required
                  placeholder="Option B"
                  value={qOptionB}
                  onChange={(e) => setQOptionB(e.target.value)}
                  dir="ltr"
                  className="flex-1 bg-transparent border-none focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <input
                  type="radio"
                  name="correctChoice"
                  checked={qCorrectChoice === "C"}
                  onChange={() => setQCorrectChoice("C")}
                  className="cursor-pointer"
                />
                <span className="font-bold text-blue-600">C:</span>
                <input
                  type="text"
                  required
                  placeholder="Option C"
                  value={qOptionC}
                  onChange={(e) => setQOptionC(e.target.value)}
                  dir="ltr"
                  className="flex-1 bg-transparent border-none focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <input
                  type="radio"
                  name="correctChoice"
                  checked={qCorrectChoice === "D"}
                  onChange={() => setQCorrectChoice("D")}
                  className="cursor-pointer"
                />
                <span className="font-bold text-blue-600">D:</span>
                <input
                  type="text"
                  required
                  placeholder="Option D"
                  value={qOptionD}
                  onChange={(e) => setQOptionD(e.target.value)}
                  dir="ltr"
                  className="flex-1 bg-transparent border-none focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* EXPLANATION */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              شرح وتفسير مستر حبيب الرحمن للإجابة (Explanation Note):
            </label>
            <textarea
              rows={2}
              placeholder="مثال: نستخدم المستقبل التام (will have + p.p) لوجود الرابط By متبوعاً بزمن مستقبلي..."
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submittingSingle}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer disabled:opacity-50"
            >
              {submittingSingle ? "جاري الحفظ..." : "حفظ السؤال في بنك الأسئلة"}
            </button>
          </div>
        </form>
      )}

      {/* 3. SMART BULK IMPORTER MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  استيراد مجموعة أسئلة دفعة واحدة (Bulk Importer)
                </h4>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              يمكنك لصق مصفوفة JSON أو أسطر نصية مفصولة بـ (|) بالصيغة:
              <br />
              <code className="text-purple-600 dark:text-purple-400 font-mono" dir="ltr">
                QuestionText | OptA,OptB,OptC,OptD | CorrectAnswer | Explanation
              </code>
            </p>

            <textarea
              rows={6}
              placeholder='[ { "questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." } ]'
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              dir="ltr"
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleParseBulk}
                className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
              >
                معاينة وتحليل البيانات ({bulkParsed.length} سؤال جاهز)
              </button>
            </div>

            {bulkParsingError && (
              <p className="text-xs font-bold text-rose-600">{bulkParsingError}</p>
            )}

            {bulkSuccessNotice && (
              <p className="text-xs font-bold text-emerald-600">{bulkSuccessNotice}</p>
            )}

            {/* PREVIEW TABLE */}
            {bulkParsed.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">نص السؤال</th>
                      <th className="p-2.5">الخيارات</th>
                      <th className="p-2.5">الإجابة الصحيحة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bulkParsed.map((q, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-bold">{i + 1}</td>
                        <td className="p-2.5 font-mono" dir="ltr">{q.questionText}</td>
                        <td className="p-2.5 text-[10px] text-slate-400">
                          {Array.isArray(q.options) ? q.options.join(" | ") : ""}
                        </td>
                        <td className="p-2.5 font-bold text-emerald-600" dir="ltr">{q.correctAnswer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                إغلاق
              </button>
              <button
                onClick={handleSubmitBulk}
                disabled={bulkParsed.length === 0 || bulkSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50 cursor-pointer shadow-md"
              >
                {bulkSubmitting ? "جاري الحفظ الجماعي..." : `حفظ الكل في قاعدة البيانات (${bulkParsed.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SEARCH & FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث في بنك الأسئلة بالكلمة أو الموضوع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">كل المراحل الدراسية</option>
            <option value="Third Secondary (Baccalaureate)">الثالث الثانوي</option>
            <option value="Second Secondary">الثاني الثانوي</option>
            <option value="First Secondary">الأول الثانوي</option>
            <option value="Third Prep">الثالث الإعدادي</option>
            <option value="Second Prep">الثاني الإعدادي</option>
            <option value="First Prep">الأول الإعدادي</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">كل التصنيفات</option>
            <option value="Grammar">Grammar</option>
            <option value="Vocabulary">Vocabulary</option>
            <option value="Reading">Reading</option>
            <option value="Story">Story</option>
          </select>

          <button
            onClick={fetchQuestions}
            className="px-3.5 py-2 rounded-xl bg-blue-600 text-white cursor-pointer"
          >
            تصفية
          </button>
        </div>
      </div>

      {/* 5. QUESTIONS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>إجمالي الأسئلة المسترجعة: {totalCount} سؤال</span>
          <span>عرض أحدث {questions.length} سؤال</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">جاري تحميل الأسئلة...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <HelpCircle className="w-10 h-10 mx-auto" />
            <p className="font-bold">لا توجد أسئلة تطابق معايير البحث الحالية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">نص السؤال</th>
                  <th className="p-3.5">المرحلة والتصنيف</th>
                  <th className="p-3.5">الصعوبة</th>
                  <th className="p-3.5">الإجابة الصحيحة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {questions.map((q, idx) => (
                  <tr key={q.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 max-w-md">
                      <p className="font-bold text-slate-900 dark:text-white truncate" dir="ltr">
                        {q.questionText}
                      </p>
                      {q.explanation && (
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{q.explanation}</p>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">{q.grade}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400">{q.domainCategory}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600" dir="ltr">
                      {q.correctAnswer}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 cursor-pointer"
                          title="تعديل السؤال"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                          title="حذف السؤال"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>تعديل بيانات السؤال</span>
              </h4>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">نص السؤال:</label>
                <input
                  type="text"
                  value={editingQuestion.questionText || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                  }
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">الإجابة الصحيحة:</label>
                <input
                  type="text"
                  value={editingQuestion.correctAnswer || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                  }
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">التفسير النحوي والشرح:</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editingSaving}
                className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {editingSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
