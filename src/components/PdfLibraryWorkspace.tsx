"use client";

import React, { useState, useEffect, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { useApp } from "@/context/AppContext";
import {
  FileText,
  Upload,
  Search,
  Eye,
  Download,
  Trash2,
  X,
  Bookmark,
  BookmarkCheck,
  Lock,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Calendar,
  Layers,
  RefreshCw,
} from "lucide-react";

interface PdfDoc {
  id: string;
  title: string;
  description?: string;
  uploaderId: string;
  uploaderName: string;
  stage?: string;
  grade?: string;
  unit?: string;
  topic?: string;
  courseId?: string | null;
  fileName: string;
  storagePath?: string | null;
  fileSizeKb?: number;
  pageCount?: number;
  views?: number;
  downloads?: number;
  isProtected?: boolean;
  watermarkEnabled?: boolean;
  allowDownload?: boolean;
  createdAt?: string;
}

export const PdfLibraryWorkspace: React.FC = () => {
  const { user, lang } = useApp();
  const [docs, setDocs] = useState<PdfDoc[]>([]);
  const [stats, setStats] = useState({ total: 0, totalViews: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");

  // Viewer state
  const [viewDoc, setViewDoc] = useState<PdfDoc | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [bookmarks, setBookmarks] = useState<Record<string, number[]>>({});
  const [watermarkPos, setWatermarkPos] = useState({ top: "20%", left: "15%" });

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [upTitle, setUpTitle] = useState("");
  const [upDesc, setUpDesc] = useState("");
  const [upStage, setUpStage] = useState("Secondary");
  const [upGrade, setUpGrade] = useState("Third Secondary (Baccalaureate)");
  const [upUnit, setUpUnit] = useState("Unit 1");
  const [upTopic, setUpTopic] = useState("Grammar Notes");
  const [upCourseId, setUpCourseId] = useState("");
  const [upAllowDownload, setUpAllowDownload] = useState(false);
  const [upFile, setUpFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage = user?.role === "admin" || user?.role === "teacher";

  // Watermark movement (anti-screenshot deterrence)
  useEffect(() => {
    if (!viewDoc) return;
    const interval = setInterval(() => {
      setWatermarkPos({
        top: `${Math.floor(Math.random() * 70) + 10}%`,
        left: `${Math.floor(Math.random() * 70) + 10}%`,
      });
    }, 7000);
    return () => clearInterval(interval);
  }, [viewDoc]);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pdf_bookmarks");
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {}
  }, []);

  const persistBookmarks = (next: Record<string, number[]>) => {
    setBookmarks(next);
    try {
      localStorage.setItem("pdf_bookmarks", JSON.stringify(next));
    } catch {}
  };

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/pdfs", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (stageFilter !== "All") url.searchParams.set("stage", stageFilter);
      if (gradeFilter !== "All") url.searchParams.set("grade", gradeFilter);
      const res = await fetch(url.toString());
      const json = await res.json();
      setDocs(json.documents || []);
      setStats(json.stats || { total: 0, totalViews: 0, totalDownloads: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, stageFilter, gradeFilter]);

  const handleUpload = async () => {
    if (!upFile) {
      setUploadMsg({ type: "error", text: lang === "ar" ? "اختر ملف PDF أولاً" : "Please select a PDF file" });
      return;
    }
    // Direct browser upload avoids the Vercel serverless request-body limit.
    if (upFile.size > 100 * 1024 * 1024) {
      setUploadMsg({
        type: "error",
        text:
          lang === "ar"
            ? `الملف حجمه ${(upFile.size / (1024 * 1024)).toFixed(1)} ميجا. الحد الأقصى 100 ميجا.`
            : `File is ${(upFile.size / (1024 * 1024)).toFixed(1)}MB. Maximum size is 100MB.`,
      });
      return;
    }
    setUploading(true);
    setUploadMsg(null);
    try {
      const title = upTitle || upFile.name.replace(/\\.pdf$/i, "");
      const blob = await upload(upFile.name, upFile, {
        access: "public",
        handleUploadUrl: "/api/pdfs/blob-upload",
        contentType: "application/pdf",
      });

      const res = await fetch("/api/pdfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_blob",
          title,
          description: upDesc,
          blobUrl: blob.url,
          fileName: upFile.name,
          fileSize: upFile.size,
          stage: upStage,
          grade: upGrade,
          unit: upUnit,
          topic: upTopic,
          courseId: upCourseId.trim(),
          allowDownload: upAllowDownload,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setUploadMsg({
          type: "success",
          text: lang === "ar" ? "تم رفع الملف بنجاح وإضافته للمكتبة!" : "PDF uploaded successfully!",
        });
        setUpTitle("");
        setUpDesc("");
        setUpCourseId("");
        setUpFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchDocs();
        setTimeout(() => {
          setShowUpload(false);
          setUploadMsg(null);
        }, 1200);
      } else {
        setUploadMsg({ type: "error", text: json.error || "Upload failed" });
      }
    } catch (e) {
      const errMsg =
        e instanceof Error ? e.message : String(e);
      setUploadMsg({
        type: "error",
        text:
          lang === "ar"
            ? `فشل الرفع: ${errMsg || "تأكد أن حجم الملف أقل من 4 ميجابايت وأنك مسجّل كمعلم/أدمن"}`
            : `Upload failed: ${errMsg || "Keep file under 4MB and login as teacher/admin"}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: PdfDoc) => {
    try {
      await fetch("/api/pdfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", documentId: doc.id }),
      });
      fetchDocs();
    } catch (e) {
      console.error(e);
    }
  };

  const openViewer = (doc: PdfDoc) => {
    setViewDoc(doc);
    setPage(1);
    setZoom(100);
  };

  const toggleBookmark = (docId: string, pageNum: number) => {
    const existing = bookmarks[docId] || [];
    const next = existing.includes(pageNum)
      ? existing.filter((p) => p !== pageNum)
      : [...existing, pageNum].sort((a, b) => a - b);
    persistBookmarks({ ...bookmarks, [docId]: next });
  };

  const viewerUrl = viewDoc
    ? `/api/pdfs/file/${viewDoc.id}#page=${page}&zoom=${zoom}&toolbar=0&navpanes=0`
    : "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-7 h-7 text-sky-300" />
            <h1 className="text-2xl sm:text-3xl font-black">
              {lang === "ar" ? "مكتبة ملفات PDF التعليمية" : "Educational PDF Library"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-sky-200 mt-2 max-w-xl leading-relaxed">
            {lang === "ar"
              ? "رفع وتصنيف ومطالعة الشيتات والمذكرات داخل المنصة مع علامة مائية متحركة باسم الطالب وحماية من النسخ والتحميل."
              : "Upload, categorize, and read study sheets with dynamic student watermark and anti-copy protection."}
          </p>
        </div>

        <div className="flex gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 text-center">
          <div className="px-3">
            <span className="text-2xl font-black text-sky-300">{stats.total}</span>
            <span className="text-[10px] block opacity-80 uppercase">{lang === "ar" ? "ملف مرفوع" : "Documents"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="px-3">
            <span className="text-2xl font-black text-amber-300">{stats.totalViews}</span>
            <span className="text-[10px] block opacity-80 uppercase">{lang === "ar" ? "مشاهدة" : "Views"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="px-3">
            <span className="text-2xl font-black text-emerald-300">{stats.totalDownloads}</span>
            <span className="text-[10px] block opacity-80 uppercase">{lang === "ar" ? "تحميل" : "Downloads"}</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR: SEARCH, FILTERS, UPLOAD */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن مذكرة أو شيت أو موضوع..." : "Search sheets, notes, topics..."}
            className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
        >
          <option value="All">{lang === "ar" ? "كل المراحل" : "All Stages"}</option>
          <option value="Preparatory">Preparatory (إعدادي)</option>
          <option value="Secondary">Secondary (ثانوي)</option>
        </select>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
        >
          <option value="All">{lang === "ar" ? "كل الصفوف" : "All Grades"}</option>
          <option value="First Prep">First Prep</option>
          <option value="Second Prep">Second Prep</option>
          <option value="Third Prep">Third Prep</option>
          <option value="First Secondary">First Secondary</option>
          <option value="Second Secondary">Second Secondary</option>
          <option value="Third Secondary (Baccalaureate)">Third Secondary</option>
        </select>

        {canManage && (
          <button
            onClick={() => setShowUpload(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{lang === "ar" ? "رفع ملف PDF" : "Upload PDF"}</span>
          </button>
        )}
      </div>

      {/* DOCUMENTS GRID */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-medium">
          <RefreshCw className="w-7 h-7 mx-auto mb-2 animate-spin text-sky-600" />
          {lang === "ar" ? "جاري تحميل المكتبة..." : "Loading library..."}
        </div>
      ) : docs.length === 0 ? (
        <div className="py-16 text-center text-slate-500 font-medium">
          {lang === "ar" ? "لا توجد ملفات مطابقة للبحث." : "No matching PDF documents found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 flex flex-col justify-between hover:border-sky-400 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                    {doc.topic}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">{doc.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{doc.grade}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{doc.unit}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {doc.views || 0}
                  </span>
                  {(doc.fileSizeKb || 0) > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                      {((doc.fileSizeKb || 0) / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  <span>{doc.uploaderName}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => openViewer(doc)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>{lang === "ar" ? "مطالعة الملف" : "Read PDF"}</span>
                </button>

                {doc.allowDownload && (
                  <a
                    href={`/api/pdfs/file/${doc.id}?download=1`}
                    className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                    title={lang === "ar" ? "تحميل" : "Download"}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                {canManage && (
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-100"
                    title={lang === "ar" ? "حذف" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ UPLOAD MODAL ============ */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-600" />
                <span>{lang === "ar" ? "رفع ملف PDF جديد للمكتبة" : "Upload New PDF Document"}</span>
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  uploadMsg.type === "success"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {uploadMsg.text}
              </div>
            )}

            {/* FILE PICKER */}
            <label className="block cursor-pointer border-2 border-dashed border-sky-400/60 rounded-2xl p-6 text-center bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => setUpFile(e.target.files?.[0] || null)}
              />
              <FileText className="w-9 h-9 text-sky-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {upFile ? upFile.name : lang === "ar" ? "اضغط لاختيار ملف PDF من جهازك" : "Click to select a PDF file"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === "ar" ? "الحد الأقصى: 100 ميجابايت" : "Maximum size: 100MB"}
              </p>
            </label>

            <input
              type="text"
              value={upTitle}
              onChange={(e) => setUpTitle(e.target.value)}
              placeholder={lang === "ar" ? "عنوان الملف (مثال: مذكرة الوحدة الأولى)..." : "Document title..."}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />

            <input
              type="text"
              value={upCourseId}
              onChange={(e) => setUpCourseId(e.target.value)}
              placeholder={lang === "ar" ? "معرّف الكورس (اختياري، مثال: crs_sec_3)" : "Course ID (optional, e.g. crs_sec_3)"}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />

            <textarea
              rows={2}
              value={upDesc}
              onChange={(e) => setUpDesc(e.target.value)}
              placeholder={lang === "ar" ? "وصف مختصر للمحتوى..." : "Short description..."}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Stage</label>
                <select
                  value={upStage}
                  onChange={(e) => setUpStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Secondary">Secondary (ثانوي)</option>
                  <option value="Preparatory">Preparatory (إعدادي)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Grade</label>
                <select
                  value={upGrade}
                  onChange={(e) => setUpGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Third Secondary (Baccalaureate)">Third Secondary</option>
                  <option value="Second Secondary">Second Secondary</option>
                  <option value="First Secondary">First Secondary</option>
                  <option value="Third Prep">Third Prep</option>
                  <option value="Second Prep">Second Prep</option>
                  <option value="First Prep">First Prep</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Unit</label>
                <input
                  type="text"
                  value={upUnit}
                  onChange={(e) => setUpUnit(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Topic</label>
                <select
                  value={upTopic}
                  onChange={(e) => setUpTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Grammar Notes">Grammar Notes</option>
                  <option value="Vocabulary Sheets">Vocabulary Sheets</option>
                  <option value="Dialogue Practice">Dialogue Practice</option>
                  <option value="Exam Papers">Exam Papers</option>
                  <option value="Revision Booklets">Revision Booklets</option>
                  <option value="Answer Keys">Answer Keys</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={upAllowDownload}
                onChange={(e) => setUpAllowDownload(e.target.checked)}
                className="w-4 h-4 accent-sky-600"
              />
              <span>{lang === "ar" ? "السماح بالتحميل للطلاب" : "Allow students to download"}</span>
            </label>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {lang === "ar"
                  ? "سيظهر الملف داخل المنصة فقط بعلامة مائية متحركة تحمل اسم ورقم هاتف كل طالب."
                  : "The file will render inside the platform with a moving watermark of each student's name & phone."}
              </span>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 text-white font-extrabold text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {uploading
                ? lang === "ar"
                  ? "جاري الرفع والمعالجة..."
                  : "Uploading..."
                : lang === "ar"
                ? "رفع الملف الآن"
                : "Upload PDF Now"}
            </button>
          </div>
        </div>
      )}

      {/* ============ BUILT-IN PDF VIEWER MODAL ============ */}
      {viewDoc && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* VIEWER TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950 text-white border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-red-400 shrink-0" />
              <span className="font-bold text-sm truncate max-w-xs sm:max-w-md">{viewDoc.title}</span>
              {viewDoc.isProtected && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                  <Lock className="w-3 h-3" />
                  {lang === "ar" ? "محمي" : "Protected"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              {/* PAGE NAVIGATION */}
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <span className="font-mono text-slate-300">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <span className="w-px h-5 bg-slate-700 mx-1" />

              {/* ZOOM */}
              <button
                onClick={() => setZoom(Math.max(60, zoom - 15))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 15))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-slate-700 mx-1" />

              {/* BOOKMARK */}
              <button
                onClick={() => toggleBookmark(viewDoc.id, page)}
                className={`p-1.5 rounded-lg transition-all ${
                  (bookmarks[viewDoc.id] || []).includes(page)
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 hover:bg-slate-700 text-amber-400"
                }`}
                title={lang === "ar" ? "إضافة علامة مرجعية للصفحة" : "Bookmark this page"}
              >
                {(bookmarks[viewDoc.id] || []).includes(page) ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              {/* DOWNLOAD (if allowed) */}
              {viewDoc.allowDownload && (
                <a
                  href={`/api/pdfs/file/${viewDoc.id}?download=1`}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                  title={lang === "ar" ? "تحميل الملف" : "Download file"}
                >
                  <Download className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={() => setViewDoc(null)}
                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* BOOKMARKS STRIP */}
          {(bookmarks[viewDoc.id] || []).length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto">
              <span className="text-[10px] font-bold text-amber-400 uppercase shrink-0">
                {lang === "ar" ? "علاماتي:" : "Bookmarks:"}
              </span>
              {(bookmarks[viewDoc.id] || []).map((bp) => (
                <button
                  key={bp}
                  onClick={() => setPage(bp)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shrink-0 transition-all ${
                    page === bp
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 text-amber-300 hover:bg-slate-700"
                  }`}
                >
                  p.{bp}
                </button>
              ))}
            </div>
          )}

          {/* PDF RENDER AREA + WATERMARK OVERLAY */}
          <div className="relative flex-1 bg-slate-950/95 overflow-hidden select-none">
            <iframe
              key={`${viewDoc.id}-${page}-${zoom}`}
              src={viewerUrl}
              className="w-full h-full"
              title={viewDoc.title}
            />

            {/* DYNAMIC MOVING WATERMARK */}
            {viewDoc.watermarkEnabled && (
              <div
                className="absolute pointer-events-none transition-all duration-1000 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-[11px] font-mono font-bold text-white/80 shadow-2xl flex flex-col items-center z-10"
                style={{ top: watermarkPos.top, left: watermarkPos.left }}
              >
                <span>{user?.name || "Student"}</span>
                <span className="text-amber-300">{user?.phone || "+20 100 000 0000"}</span>
                <span className="text-[9px] text-slate-300">Professional Academy – Mr. Habib El Rahman</span>
              </div>
            )}

            {/* BOTTOM INFO BAR */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex items-center justify-between text-[10px] text-slate-300 font-bold pointer-events-none">
              <span>
                {lang === "ar"
                  ? "العرض داخل المنصة فقط — ممنوع تصوير أو نسخ المحتوى"
                  : "In-platform viewing only — screenshots & copying are tracked"}
              </span>
              <span className="font-mono">{viewDoc.fileName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
