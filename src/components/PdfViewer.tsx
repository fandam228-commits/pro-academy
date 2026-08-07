"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { FileText, Bookmark, ShieldAlert, Download, Lock, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface PdfViewerProps {
  pdfUrl: string;
  title: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, title }) => {
  const { user, lang } = useApp();
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(12);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const toggleBookmark = (page: number) => {
    if (bookmarks.includes(page)) {
      setBookmarks(bookmarks.filter((p) => p !== page));
    } else {
      setBookmarks([...bookmarks, page]);
    }
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* TOOLBAR */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-xs">{title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setZoom(Math.max(70, zoom - 15))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 15))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => toggleBookmark(currentPage)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
              bookmarks.includes(currentPage)
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
            <span>{lang === "ar" ? "علامة مرجعية" : "Bookmark"}</span>
          </button>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3 text-red-500" />
            <span>{lang === "ar" ? "محمي من الطباعة" : "Protected PDF"}</span>
          </div>
        </div>
      </div>

      {/* PDF DOCUMENT CONTENT DISPLAY & WATERMARK OVERLAY */}
      <div className="relative min-h-[500px] max-h-[650px] overflow-auto bg-slate-100 dark:bg-slate-950 p-6 flex flex-col items-center">
        {/* WATERMARK OVERLAY REPEATED ACROSS PAGE */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-around opacity-15 dark:opacity-20 rotate-[-25deg] select-none">
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {user?.name} - {user?.phone || "+20 100 000 0000"} - Mr. Habib El Rahman
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {user?.name} - {user?.phone || "+20 100 000 0000"} - Professional Academy
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {user?.name} - {user?.phone || "+20 100 000 0000"} - Protected Material
          </div>
        </div>

        {/* MOCK PAGE VIEW */}
        <div
          className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 transition-transform origin-top"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <div className="border-b-2 border-blue-600 pb-4 mb-6 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                Professional Academy Sheet
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">Page {currentPage} of {totalPages}</div>
          </div>

          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              📌 Section {currentPage}: Grammar Rules & Core Concept Summaries
            </p>
            <p>
              1. <strong>Past Perfect Continuous (had + been + V-ing):</strong> Emphasizes the duration of an action that was happening before another past event.
            </p>
            <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded-xl text-blue-900 dark:text-blue-200 text-xs border border-blue-100 dark:border-slate-700">
              <em>Example: He had been studying for three hours when his brother arrived home.</em>
            </div>
            <p>
              2. <strong>Key Signal Words:</strong> 'for', 'since', 'all day', 'before', 'until then'.
            </p>
            <p>
              3. <strong>Exam Tip by Mr. Habib El Rahman:</strong> Do NOT use past continuous or perfect continuous with stative verbs like <em>know, believe, belong, love, understand</em>. Always use simple forms instead!
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Mr. Habib El Rahman - English Platform</span>
            <span>Confidential Student Material</span>
          </div>
        </div>
      </div>

      {/* PAGE PAGINATION */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50"
        >
          {lang === "ar" ? "الصفحة السابقة" : "Previous"}
        </button>

        <span>
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50"
        >
          {lang === "ar" ? "الصفحة التالية" : "Next"}
        </button>
      </div>
    </div>
  );
};
