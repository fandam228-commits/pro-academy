"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Search, BookOpen, FileText, Database, ArrowRight, Loader2 } from "lucide-react";

export const GlobalSearch: React.FC<{ onSelectCourse?: (id: string) => void }> = ({ onSelectCourse }) => {
  const { lang } = useApp();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [courseResults, setCourseResults] = useState<any[]>([]);
  const [pdfResults, setPdfResults] = useState<any[]>([]);
  const [questionResults, setQuestionResults] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setCourseResults([]);
        setPdfResults([]);
        setQuestionResults([]);
        return;
      }
      setSearching(true);
      try {
        const [coursesRes, pdfsRes, qbRes] = await Promise.all([
          fetch("/api/courses"),
          fetch(`/api/pdfs?search=${encodeURIComponent(query)}`),
          fetch(`/api/question-bank?search=${encodeURIComponent(query)}&limit=15`),
        ]);
        const courses = (await coursesRes.json()).courses || [];
        const q = query.toLowerCase();
        setCourseResults(
          courses.filter(
            (c: any) =>
              c.title.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q) ||
              c.grade.toLowerCase().includes(q)
          )
        );
        setPdfResults((await pdfsRes.json()).documents || []);
        setQuestionResults(((await qbRes.json()).questions || []).slice(0, 6));
      } catch {}
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const total = courseResults.length + pdfResults.length + questionResults.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          {lang === "ar" ? "البحث الشامل في المنصة" : "Search Everything"}
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          {lang === "ar" ? "ابحث في الكورسات، ملفات PDF، وبنك الأسئلة الذكي من مكان واحد" : "Search courses, PDF documents, and the question bank at once"}
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <Search className="w-5 h-5 absolute left-4 rtl:right-4 rtl:left-auto top-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder={lang === "ar" ? "اكتب أي كلمة... (مثال: past perfect / piracy / الوحدة الأولى)" : "Type anything... (e.g. past perfect / piracy)"}
          className="w-full pl-12 rtl:pr-12 rtl:pl-4 pr-4 py-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white shadow-xl focus:outline-none focus:border-blue-500"
        />
        {searching && <Loader2 className="w-4 h-4 animate-spin absolute right-4 rtl:left-4 rtl:right-auto top-4.5 text-blue-500" />}
      </div>

      {query.trim().length >= 2 && !searching && (
        <p className="text-center text-xs font-bold text-slate-500">
          {lang === "ar" ? `تم العثور على ${total} نتيجة لـ "${query}"` : `${total} results found for "${query}"`}
        </p>
      )}

      {/* COURSES RESULTS */}
      {courseResults.length > 0 && (
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" /> {lang === "ar" ? "الكورسات" : "Courses"} ({courseResults.length})
          </h3>
          <div className="space-y-2">
            {courseResults.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCourse && onSelectCourse(c.id)}
                className="w-full text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{c.title}</p>
                  <p className="text-[11px] text-slate-500">{c.grade} • {c.teacherName} • {c.price} EGP</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 rtl:rotate-180 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PDF RESULTS */}
      {pdfResults.length > 0 && (
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-500" /> {lang === "ar" ? "ملفات PDF" : "PDF Documents"} ({pdfResults.length})
          </h3>
          <div className="space-y-2">
            {pdfResults.map((p) => (
              <a
                key={p.id}
                href={`/api/pdfs/file/${p.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400 shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{p.title}</p>
                  <p className="text-[11px] text-slate-500">{p.topic} • {p.grade} • 👁 {p.views}</p>
                </div>
                <FileText className="w-4 h-4 text-red-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* QUESTION BANK RESULTS */}
      {questionResults.length > 0 && (
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" /> {lang === "ar" ? "أسئلة من البنك" : "Question Bank"} ({questionResults.length})
          </h3>
          <div className="space-y-2">
            {questionResults.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <p className="font-bold text-xs text-slate-900 dark:text-white leading-relaxed">{q.questionText}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1.5">
                  ✓ {q.correctAnswer} <span className="text-slate-400 font-medium">• {q.domainCategory} • {q.difficulty}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {query.trim().length >= 2 && !searching && total === 0 && (
        <p className="text-center text-sm text-slate-500 py-10">
          {lang === "ar" ? "لا توجد نتائج مطابقة — جرب كلمات مختلفة" : "No matching results — try different keywords"}
        </p>
      )}
    </div>
  );
};
