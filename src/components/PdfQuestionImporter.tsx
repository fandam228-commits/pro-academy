"use client";

import React, { useState } from "react";
import { FileUp, FileText, AlertTriangle, CheckCircle2, Trash2, Save, Eye } from "lucide-react";

type DraftQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourcePage?: number;
  needsReview: boolean;
};

declare global {
  interface Window { pdfjsLib?: any; }
}

async function loadPdfJs(): Promise<any> {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-pdfjs="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("تعذر تحميل قارئ PDF")), { once: true });
      if (window.pdfjsLib) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.dataset.pdfjs = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("تعذر تحميل قارئ PDF. تحقق من اتصال الإنترنت."));
    document.head.appendChild(script);
  });
  if (!window.pdfjsLib) throw new Error("لم يتم تحميل قارئ PDF.");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return window.pdfjsLib;
}

function parseQuestions(raw: string): DraftQuestion[] {
  const lines = raw.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const result: DraftQuestion[] = [];
  let current: DraftQuestion | null = null;
  let lastOption = -1;
  const flush = () => {
    if (current && current.questionText.trim()) result.push(current);
    current = null;
    lastOption = -1;
  };
  for (const line of lines) {
    const answer = line.match(/^(?:answer|ans|الإجابة|الاجابة|الإجابة الصحيحة)\s*[:：-]\s*(.+)$/i);
    if (answer && current) {
      const value = answer[1].trim();
      const letter = value.match(/^([A-D])(?:[).\s]|$)/i);
      current.correctAnswer = letter ? (current.options[letter[1].toUpperCase().charCodeAt(0) - 65] || "") : value;
      current.needsReview = !current.correctAnswer;
      continue;
    }
    const numbered = line.match(/^(?:Q\s*)?(\d{1,3})\s*[.)、:-]\s*(.+)$/i);
    const option = line.match(/^([A-D])\s*[).、:-]\s*(.+)$/i);
    if (numbered) {
      flush();
      current = { questionText: numbered[2], options: [], correctAnswer: "", explanation: "", needsReview: true };
    } else if (option && current) {
      current.options.push(option[2].trim());
      lastOption = current.options.length - 1;
    } else if (current && lastOption >= 0 && current.options[lastOption]) {
      current.options[lastOption] += " " + line;
    } else if (current) {
      current.questionText += " " + line;
    } else if (result.length === 0 && /^\d+[.)]/.test(line) === false) {
      current = { questionText: line, options: [], correctAnswer: "", explanation: "", needsReview: true };
    }
  }
  flush();
  return result.filter((q) => q.questionText.length > 0);
}

export function PdfQuestionImporter({ lang = "ar", onImported }: { lang?: string; onImported?: () => void }) {
  const [fileName, setFileName] = useState("");
  const [rawText, setRawText] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [stage, setStage] = useState("Preparatory");
  const [grade, setGrade] = useState("Third Prep");
  const [curriculum, setCurriculum] = useState("Ministry");
  const [term, setTerm] = useState("First");
  const [unit, setUnit] = useState("Unit 1");
  const [lesson, setLesson] = useState("Lesson 1");
  const [section, setSection] = useState("Practice");
  const [source, setSource] = useState("External Source");

  const extractPdf = async (file?: File) => {
    if (!file) return;
    setBusy(true); setError(""); setStatus(""); setQuestions([]); setFileName(file.name);
    try {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("ارفع ملف PDF فقط.");
      if (file.size > 30 * 1024 * 1024) throw new Error("الحد الأقصى للملف 30 ميجابايت.");
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages: string[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const text = await page.getTextContent();
        const items = text.items as Array<{ str: string; transform?: number[] }>;
        // Rebuild approximate visual lines from PDF coordinates to preserve question and option boundaries.
        const rows = new Map<number, string[]>();
        for (const item of items) {
          const y = Math.round(item.transform?.[5] ?? 0);
          const row = rows.get(y) || [];
          row.push(item.str);
          rows.set(y, row);
        }
        pages.push(Array.from(rows.entries()).sort((a, b) => b[0] - a[0]).map(([, row]) => row.join(" ").trim()).filter(Boolean).join("\n"));
      }
      const extracted = pages.map((p, i) => `\n${i + 1}. ${p}`).join("\n");
      setRawText(extracted.trim());
      const parsed = parseQuestions(extracted);
      setQuestions(parsed.map((q) => ({ ...q, needsReview: true })));
      if (parsed.length === 0) setError("لم أتعرف على أسئلة واضحة. قد يكون الملف صورة ممسوحة ضوئيًا أو تنسيقه مختلفًا. الصق النص المستخرج في المربع وعدّله يدويًا، ثم اضغط «تحليل النص».");
      else setStatus(`تم استخراج نص ${pdf.numPages} صفحة. راجع تقسيم الأسئلة والاختيارات والإجابات قبل الحفظ؛ لم يتم حفظ أي شيء بعد.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر قراءة الملف.");
    } finally { setBusy(false); }
  };

  const analyzeText = () => {
    setError(""); setStatus("");
    const parsed = parseQuestions(rawText);
    setQuestions(parsed);
    if (!parsed.length) setError("لم أجد أسئلة بالتنسيق المتوقع. استخدم ترقيمًا مثل 1. ثم اختيارات A) وB) وC) وD)، أو راجع النص يدويًا.");
    else setStatus(`تم تجهيز ${parsed.length} سؤالًا للمعاينة. راجع الإجابات قبل الحفظ.`);
  };

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) =>
    setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, ...patch, needsReview: !(patch.correctAnswer ?? q.correctAnswer).trim() || (patch.options ?? q.options).length < 2 } : q));

  const saveQuestions = async () => {
    setError(""); setStatus("");
    if (!questions.length) { setError("حلّل ملفًا أولًا."); return; }
    const invalid = questions.filter((q) => !q.questionText.trim() || q.options.length < 2 || !q.correctAnswer.trim() || !q.options.some((o) => o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()));
    if (invalid.length) { setError(`لا يمكن الحفظ: ${invalid.length} سؤالًا يحتاج مراجعة. تأكد من وجود سؤال واختيارين على الأقل، وأن الإجابة الصحيحة تطابق أحد الاختيارات.`); return; }
    setBusy(true);
    try {
      const items = questions.map((q) => ({
        questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer,
        explanation: q.explanation || "Imported from PDF; teacher reviewed",
        domainCategory: section.toLowerCase().includes("grammar") ? "Grammar" : "Vocabulary",
        questionType: "mcq", stage, grade, curriculum, term, unit, lesson, section, source,
        difficulty: "Medium", topic: lesson, points: 1,
      }));
      const response = await fetch("/api/question-bank", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "import_questions", items }) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "فشل حفظ الأسئلة.");
      setStatus(`تم حفظ ${json.importedCount ?? 0} سؤال، وتخطي ${json.duplicateCount ?? 0} سؤال مكرر. يمكنك الآن استخدامها في التدريب أو إنشاء واجب.`);
      onImported?.();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر حفظ الأسئلة."); }
    finally { setBusy(false); }
  };

  const ar = lang === "ar";
  return <div className="max-w-5xl mx-auto space-y-5" dir={ar ? "rtl" : "ltr"}>
    <div className="rounded-3xl bg-gradient-to-r from-indigo-950 to-blue-900 text-white p-6">
      <h2 className="text-2xl font-black flex items-center gap-2"><FileText /> {ar ? "استيراد أسئلة الدرس من PDF" : "Import lesson questions from PDF"}</h2>
      <p className="mt-2 text-sm text-blue-100">{ar ? "ارفع الملف، راجع المعاينة، صحّح الإجابات، ثم احفظ. لا تُحفظ الأسئلة تلقائيًا." : "Upload, preview, correct answers, then save. Nothing is saved automatically."}</p>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-700 p-4">
      <label className="text-xs font-bold">المرحلة<select value={stage} onChange={e=>setStage(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 bg-transparent"><option value="Preparatory">إعدادي</option><option value="Secondary">ثانوي</option></select></label>
      <label className="text-xs font-bold">الصف<select value={grade} onChange={e=>setGrade(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 bg-transparent">{["First Prep","Second Prep","Third Prep","First Secondary","Second Secondary","Third Secondary (Baccalaureate)"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="text-xs font-bold">المنهج<select value={curriculum} onChange={e=>setCurriculum(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 bg-transparent">{["Ministry","Connect","Connect Plus","M High","Baccalaureate","Thanaweya Amma","Upstream","Aim High"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="text-xs font-bold">الترم<select value={term} onChange={e=>setTerm(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 bg-transparent"><option value="First">الأول</option><option value="Second">الثاني</option></select></label>
      <label className="text-xs font-bold">الوحدة<input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="Unit 1" className="mt-1 w-full rounded-xl border p-2.5 bg-transparent"/></label>
      <label className="text-xs font-bold">الدرس<input value={lesson} onChange={e=>setLesson(e.target.value)} placeholder="Lesson 1" className="mt-1 w-full rounded-xl border p-2.5 bg-transparent"/></label>
      <label className="text-xs font-bold">نوع القسم<select value={section} onChange={e=>setSection(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 bg-transparent"><option>Practice</option><option>Grammar</option><option>Vocabulary</option><option>Reading</option><option>Story</option><option>Rewrite</option></select></label>
      <label className="text-xs font-bold">مصدر الأسئلة<select value={source} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 bg-transparent"><option>External Source</option><option>Ministry Book</option><option>Teacher Created</option><option>Revision</option></select></label>
    </div>
    <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-700 p-5 space-y-3">
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 p-5 text-center">
        <FileUp className="h-8 w-8 text-indigo-600"/><strong>{busy ? "جاري المعالجة..." : "اضغط لاختيار ملف PDF"}</strong><span className="text-xs text-slate-500">حتى 30 MB • الملفات المصورة قد تحتاج OCR</span>
        <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={busy} onChange={e=>extractPdf(e.target.files?.[0])}/>
      </label>
      {fileName && <p className="text-xs text-slate-500">الملف: {fileName}</p>}
      <div className="text-xs text-slate-500">لو النص اتقرأ بشكل غير صحيح، تقدر تعدّله هنا قبل التحليل.</div>
      <textarea value={rawText} onChange={e=>setRawText(e.target.value)} rows={8} placeholder={"1. She ______ to school every day.\nA) go\nB) goes\nC) went\nD) going\nAnswer: goes"} className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 p-3 text-sm"/>
      <button type="button" disabled={busy || !rawText.trim()} onClick={analyzeText} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50"><Eye className="inline h-4 w-4 ml-2"/>تحليل النص وعرض المعاينة</button>
    </div>
    {error && <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="inline h-4 w-4 ml-1"/>{error}</div>}
    {status && <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 className="inline h-4 w-4 ml-1"/>{status}</div>}
    {questions.length > 0 && <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-black">معاينة الأسئلة ({questions.length})</h3><button type="button" disabled={busy} onClick={saveQuestions} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50"><Save className="inline h-4 w-4 ml-2"/>حفظ الأسئلة المعتمدة</button></div>
      <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3">لا يتم تخمين الإجابات. اختر الإجابة الصحيحة لكل سؤال من القائمة قبل الحفظ.</p>
      {questions.map((q,i)=><div key={i} className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-700 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3"><strong className="text-sm">{i+1}. {q.questionText}</strong><button type="button" aria-label="حذف السؤال" onClick={()=>setQuestions(prev=>prev.filter((_,j)=>j!==i))} className="text-red-500"><Trash2 className="h-4 w-4"/></button></div>
        <input value={q.questionText} onChange={e=>updateQuestion(i,{questionText:e.target.value})} aria-label="نص السؤال" className="w-full rounded-lg border bg-transparent p-2 text-sm"/>
        <div className="grid sm:grid-cols-2 gap-2">{[0,1,2,3].map(j=><input key={j} value={q.options[j] || ""} onChange={e=>updateQuestion(i,{options:[...q.options.slice(0,j),e.target.value,...q.options.slice(j+1)]})} placeholder={`الاختيار ${String.fromCharCode(65+j)}`} className="rounded-lg border bg-transparent p-2 text-sm"/>)}</div>
        <div className="grid sm:grid-cols-2 gap-2"><label className="text-xs font-bold">الإجابة الصحيحة<select value={q.correctAnswer} onChange={e=>updateQuestion(i,{correctAnswer:e.target.value})} className="mt-1 w-full rounded-lg border bg-transparent p-2.5"><option value="">اختر الإجابة الصحيحة</option>{q.options.filter(Boolean).map((o,j)=><option key={j} value={o}>{String.fromCharCode(65+j)}. {o}</option>)}</select></label><label className="text-xs font-bold">شرح الإجابة (اختياري)<input value={q.explanation} onChange={e=>updateQuestion(i,{explanation:e.target.value})} className="mt-1 w-full rounded-lg border bg-transparent p-2.5" placeholder="Explanation"/></label></div>
        {(!q.correctAnswer || q.options.filter(Boolean).length<2) && <p className="text-xs text-red-600">السؤال محتاج مراجعة قبل الحفظ.</p>}
      </div>)}
      <button type="button" disabled={busy} onClick={saveQuestions} className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50"><Save className="inline h-4 w-4 ml-2"/>تأكيد وحفظ الأسئلة في بنك الأسئلة</button>
    </div>}
  </div>;
}
