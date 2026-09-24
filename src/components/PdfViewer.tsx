"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { FileText, Lock, ZoomIn, ZoomOut } from "lucide-react";

interface PdfViewerProps {
  pdfUrl: string;
  title: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, title }) => {
  const { user, lang } = useApp();
  const [zoom, setZoom] = useState(100);

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-xs">{title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setZoom((z) => Math.max(70, z - 10))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              title={lang === "ar" ? "تصغير" : "Zoom out"}
              aria-label={lang === "ar" ? "تصغير" : "Zoom out"}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(160, z + 10))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              title={lang === "ar" ? "تكبير" : "Zoom in"}
              aria-label={lang === "ar" ? "تكبير" : "Zoom in"}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3 text-red-500" />
            <span>{lang === "ar" ? "عرض محمي" : "Protected view"}</span>
          </div>
        </div>
      </div>

      <div className="relative h-[70vh] min-h-[520px] bg-slate-100 dark:bg-slate-950 overflow-auto">
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-around opacity-20 rotate-[-25deg] select-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="text-sm sm:text-base font-bold font-mono text-slate-700 dark:text-slate-200 whitespace-nowrap">
                {user?.name || "Student"} · {user?.phone || "+20 100 000 0000"} · Mr. Habib El Rahman · Professional Academy
              </div>
            ))}
          </div>
        </div>

        <div
          className="min-w-full min-h-full flex justify-center origin-top-left transition-transform duration-150"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          <iframe
            src={pdfUrl}
            title={title}
            className="w-full min-h-[70vh] border-0 bg-white"
            style={{ height: "calc(70vh)", minHeight: 520 }}
          />
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        {lang === "ar"
          ? "المستند المعروض هو ملف الـPDF الفعلي المرفوع على المنصة. منع النسخ أو التصوير الكامل لا يمكن ضمانه داخل المتصفح."
          : "This is the actual PDF uploaded to the platform. Browsers cannot guarantee prevention of screenshots or copying."}
      </div>
    </div>
  );
};
