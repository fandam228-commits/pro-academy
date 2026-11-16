"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  ClipboardCheck,
  UserCheck,
  UserX,
  Clock,
  FileBadge,
  Save,
  Loader2,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  QrCode,
  Barcode,
  Search,
  Filter,
  Users,
  Building,
  GraduationCap,
  History,
  BarChart3,
  Download,
  AlertTriangle,
  Camera,
  CameraOff,
  Volume2,
  Printer,
} from "lucide-react";

const GRADES = [
  { id: "all", labelAr: "جميع المراحل والصفوف", labelEn: "All Grades" },
  { id: "First Prep", labelAr: "الأول الإعدادي (Prep 1)", labelEn: "First Prep" },
  { id: "Second Prep", labelAr: "الثاني الإعدادي (Prep 2)", labelEn: "Second Prep" },
  { id: "Third Prep", labelAr: "الثالث الإعدادي (Prep 3)", labelEn: "Third Prep" },
  { id: "First Secondary", labelAr: "الأول الثانوي (Sec 1)", labelEn: "First Secondary" },
  { id: "Second Secondary", labelAr: "الثاني الثانوي عام (Sec 2)", labelEn: "Second Secondary" },
  { id: "Second Secondary (Baccalaureate)", labelAr: "الثاني الثانوي بكالوريا", labelEn: "Second Secondary (Baccalaureate)" },
  { id: "Third Secondary (Baccalaureate)", labelAr: "الثالث الثانوي بكالوريا (ثانوية عامة)", labelEn: "Third Secondary (Baccalaureate)" },
];

const SESSION_PRESETS = [
  "حصة سنتر الوليد الأسبوعية",
  "حصة مراجعة القواعد والجرامر",
  "حصة حل نماذج بوكليت وامتحانات",
  "حصة المفردات ونصوص القراءة",
  "المتابعة الدورية مع أولياء الأمور",
];

const STATUS_OPTIONS = [
  { id: "present", labelAr: "حاضر", labelEn: "Present", icon: UserCheck, cls: "bg-emerald-600 text-white hover:bg-emerald-500" },
  { id: "late", labelAr: "متأخر", labelEn: "Late", icon: Clock, cls: "bg-amber-500 text-slate-950 hover:bg-amber-400" },
  { id: "absent", labelAr: "غائب", labelEn: "Absent", icon: UserX, cls: "bg-red-500 text-white hover:bg-red-400" },
  { id: "excused", labelAr: "معذور", labelEn: "Excused", icon: FileBadge, cls: "bg-sky-600 text-white hover:bg-sky-500" },
];

export const AttendanceWorkspace: React.FC = () => {
  const { user, lang } = useApp();
  const isStaff = user?.role === "teacher" || user?.role === "admin";
  const [activeTab, setActiveTab] = useState<"roster" | "scanner" | "history" | "reports">("roster");
  const [loading, setLoading] = useState(true);

  // Filters
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sessionTitle, setSessionTitle] = useState(SESSION_PRESETS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [roster, setRoster] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [sessionTitles, setSessionTitles] = useState<string[]>([]);
  const [recentDates, setRecentDates] = useState<string[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);

  // Status & Notifications
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [scanAlert, setScanAlert] = useState<{ type: "success" | "duplicate" | "error"; message: string; student?: any } | null>(null);

  // Scanner States
  const [scannerActive, setScannerActive] = useState(false);
  const [manualBarcodeInput, setManualBarcodeInput] = useState("");
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const html5QrCodeRef = useRef<any>(null);

  // Student State
  const [studentData, setStudentData] = useState<any>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Fetch Data on Filter Change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, date, gradeFilter, groupFilter, activeTab]);

  // Global USB Barcode Reader Interceptor (Hardware Wedge)
  useEffect(() => {
    if (!isStaff) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in regular text inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      const now = Date.now();
      // Hardware scanners type very rapidly (< 50ms per key)
      if (now - lastKeyTimeRef.current > 100) {
        barcodeBufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (barcodeBufferRef.current.length >= 3) {
          handleDirectScan(barcodeBufferRef.current.trim(), "barcode");
        }
        barcodeBufferRef.current = "";
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStaff, sessionTitle, date, groupFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isStaff) {
        if (activeTab === "history") {
          const res = await fetch(`/api/attendance?view=history&date=${date}&grade=${gradeFilter}&sessionTitle=${encodeURIComponent(sessionTitle)}`, {
            headers: authHeaders(),
          });
          const json = await res.json();
          setHistoryRecords(json.records || []);
          if (json.allGroups) setAllGroups(json.allGroups);
        } else if (activeTab === "reports") {
          const res = await fetch(`/api/attendance?view=reports&date=${date}&grade=${gradeFilter}&groupId=${groupFilter}`, {
            headers: authHeaders(),
          });
          const json = await res.json();
          setReportData(json);
          if (json.allGroups) setAllGroups(json.allGroups);
        } else {
          // Roster or Scanner
          const res = await fetch(`/api/attendance?date=${date}&grade=${gradeFilter}&groupId=${groupFilter}&sessionTitle=${encodeURIComponent(sessionTitle)}`, {
            headers: authHeaders(),
          });
          const json = await res.json();
          setRoster(json.roster || []);
          setAllGroups(json.allGroups || []);
          setSessionTitles(json.sessionTitles || []);
          setRecentDates(json.recentDates || []);

          const initial: Record<string, string> = {};
          for (const r of json.roster || []) {
            initial[r.studentId] = r.statusOnDate || "present";
          }
          setMarks(initial);
        }
      } else {
        const res = await fetch("/api/attendance", { headers: authHeaders() });
        const json = await res.json();
        setStudentData(json);
      }
    } catch (err) {
      console.error("Attendance fetch error:", err);
    }
    setLoading(false);
  };

  // Play audio chime
  const playSound = (type: "success" | "duplicate") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  };

  // Direct Scan Handler (QR or Barcode)
  const handleDirectScan = async (code: string, source: "qr" | "barcode") => {
    if (!code) return;
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "scan",
          scanCode: code,
          sessionTitle,
          sessionDate: date,
          groupId: groupFilter !== "all" ? groupFilter : null,
        }),
      });

      const json = await res.json();
      if (json.alreadyMarked) {
        playSound("duplicate");
        setScanAlert({
          type: "duplicate",
          message: json.message,
          student: json.student,
        });
      } else if (json.success) {
        playSound("success");
        setScanAlert({
          type: "success",
          message: json.message,
          student: json.student,
        });
        // Update local mark in roster
        if (json.student?.id) {
          setMarks((prev) => ({ ...prev, [json.student.id]: "present" }));
          setRoster((prev) =>
            prev.map((s) => (s.studentId === json.student.id ? { ...s, statusOnDate: "present" } : s))
          );
        }
      } else {
        playSound("duplicate");
        setScanAlert({
          type: "error",
          message: json.error || "كود غير صالح أو لم يتم العثور على الطالب",
        });
      }
    } catch (err) {
      setScanAlert({ type: "error", message: "فشل الاتصال بالخادم" });
    }

    // Auto-clear notification toast after 4 seconds
    setTimeout(() => {
      setScanAlert(null);
    }, 4500);
  };

  // Camera QR Scanner Lifecycle (html5-qrcode)
  const startCameraScanner = async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      setScannerActive(true);
      const scanner = new Html5Qrcode("qr-camera-feed");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleDirectScan(decodedText, "qr");
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera start error:", err);
      setScannerActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
  };

  // Single Manual Mark Toggle
  const handleSingleMark = async (studentId: string, studentName: string, status: string, grade: string, studentGroupId?: string) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "manual_mark",
          studentId,
          studentName,
          status,
          grade,
          sessionTitle,
          sessionDate: date,
          groupId: studentGroupId || (groupFilter !== "all" ? groupFilter : null),
        }),
      });
      setRoster((prev) =>
        prev.map((s) => (s.studentId === studentId ? { ...s, statusOnDate: status } : s))
      );
    } catch (err) {
      console.error("Manual mark failed:", err);
    }
  };

  // Bulk Save Roster
  const handleBulkSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const payloadMarks = roster.map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        grade: s.grade,
        status: marks[s.studentId] || "present",
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "bulk_mark",
          sessionTitle,
          sessionDate: date,
          groupId: groupFilter !== "all" ? groupFilter : null,
          marks: payloadMarks,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveMsg("تم حفظ وتحديث كشف الحضور بنجاح!");
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch {
      setSaveMsg("حدث خطأ أثناء الحفظ.");
    }
    setSaving(false);
  };

  // Student Self Check-In
  const handleStudentCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "check_in", sessionTitle }),
      });
      const json = await res.json();
      if (json.success) {
        setCheckedIn(true);
        fetchData();
      }
    } catch {}
    setCheckingIn(false);
  };

  // Export Monthly Report to CSV
  const exportReportToCsv = () => {
    if (!reportData?.studentReports) return;
    const headers = ["كود الطالب", "اسم الطالب", "الصف", "المجموعة", "إجمالي الحصص", "حاضر", "متأخر", "غائب", "معذور", "نسبة الحضور"];
    const rows = reportData.studentReports.map((s: any) => [
      s.studentCode || "",
      `"${(s.studentName || "").replace(/"/g, '""')}"`,
      `"${s.grade || ""}"`,
      `"${(s.groupName || "").replace(/"/g, '""')}"`,
      s.totalSessions,
      s.presentCount,
      s.lateCount,
      s.absentCount,
      s.excusedCount,
      `${s.rate}%`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `تقرير_حضور_السنتر_${date.substring(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics summary
  const presentTotal = roster.filter((r) => (marks[r.studentId] || r.statusOnDate) === "present").length;
  const lateTotal = roster.filter((r) => (marks[r.studentId] || r.statusOnDate) === "late").length;
  const absentTotal = roster.filter((r) => (marks[r.studentId] || r.statusOnDate) === "absent").length;
  const excusedTotal = roster.filter((r) => (marks[r.studentId] || r.statusOnDate) === "excused").length;
  const totalCount = roster.length;
  const currentRate = totalCount > 0 ? Math.round(((presentTotal + lateTotal * 0.7 + excusedTotal * 0.85) / totalCount) * 100) : 100;

  // Filtered roster by search box
  const displayRoster = roster.filter((st) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = st.studentName.toLowerCase().includes(q);
    const codeMatch = String(st.studentCode || "").includes(q);
    return nameMatch || codeMatch;
  });

  // =========================================================================
  // VIEW: STUDENT SELF-SERVICE VIEW
  // =========================================================================
  if (!isStaff) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {lang === "ar" ? "سجل الحضور والغياب" : "My Attendance Record"}
              </h2>
              <p className="text-sm text-slate-400">
                {lang === "ar" ? "تابع نسبة حضورك في حصص سنتر الوليد والمحاضرات التفاعلية" : "Track your attendance rate and sessions"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">نسبة الحضور العامة</span>
              <span className={`text-3xl font-black ${studentData?.rate >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                {studentData?.rate || 0}%
              </span>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">الحصص المحضورة</span>
              <span className="text-3xl font-black text-emerald-400">{studentData?.presentCount || 0}</span>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">مرات التأخير</span>
              <span className="text-3xl font-black text-amber-400">{studentData?.lateCount || 0}</span>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block mb-1">مرات الغياب</span>
              <span className="text-3xl font-black text-red-400">{studentData?.absentCount || 0}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {sessionTitle}
              </h3>
              <p className="text-xs text-slate-300 mt-1">تاريخ اليوم: {new Date().toLocaleDateString("ar-EG")}</p>
            </div>
            <button
              onClick={handleStudentCheckIn}
              disabled={checkedIn || checkingIn}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                checkedIn
                  ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
              }`}
            >
              {checkingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {checkedIn ? "تم تسجيل حضورك اليوم بنجاح ✓" : "تسجيل حضوري للحصة الآن"}
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">سجل الحصص السابقة:</h4>
            {studentData?.records?.length > 0 ? (
              studentData.records.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/40 text-sm">
                  <span className="font-medium text-slate-200">{r.sessionTitle}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{r.sessionDate}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      r.status === "present" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50" :
                      r.status === "late" ? "bg-amber-950/80 text-amber-300 border border-amber-700/50" :
                      r.status === "excused" ? "bg-sky-950/80 text-sky-300 border border-sky-700/50" :
                      "bg-red-950/80 text-red-300 border border-red-700/50"
                    }`}>
                      {r.status === "present" ? "حاضر" : r.status === "late" ? "متأخر" : r.status === "excused" ? "معذور" : "غائب"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">لا توجد سجلات حضور مسجلة حتى الآن.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: TEACHER & ADMIN CENTER WORKSPACE
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER & NAVIGATION TABS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                بوابة الحضور الإلكترونية — سنتر الوليد
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  متصل ومفعل
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                مسح الباركود، كيو آر كود (QR)، الرصد الفوري، وتتبع المجموعات الدراسية
              </p>
            </div>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
            <button
              onClick={() => { setActiveTab("roster"); stopCameraScanner(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "roster" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              كشف الحضور والرصد
            </button>
            <button
              onClick={() => setActiveTab("scanner")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "scanner" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              ماسح الباركود و QR
            </button>
            <button
              onClick={() => { setActiveTab("history"); stopCameraScanner(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "history" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="w-4 h-4" />
              السجل والتواريخ
            </button>
            <button
              onClick={() => { setActiveTab("reports"); stopCameraScanner(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "reports" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              التقارير والإحصائيات
            </button>
          </div>
        </div>

        {/* SCAN ALERT TOAST / MODAL */}
        {scanAlert && (
          <div
            className={`p-4 rounded-xl mb-4 border flex items-center justify-between transition-all animate-in fade-in ${
              scanAlert.type === "success"
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                : scanAlert.type === "duplicate"
                ? "bg-amber-950/90 border-amber-500 text-amber-200"
                : "bg-red-950/80 border-red-500 text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {scanAlert.type === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">{scanAlert.message}</p>
                {scanAlert.student && (
                  <p className="text-xs opacity-90 mt-0.5">
                    الطالب: <span className="font-semibold underline">{scanAlert.student.name}</span> | كود: #{scanAlert.student.studentCode} | الصف: {scanAlert.student.grade}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setScanAlert(null)}
              className="px-2.5 py-1 text-xs rounded bg-black/30 hover:bg-black/50 text-white"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* COMPREHENSIVE FILTER BAR (Requirement 1, 2, 3, 4) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 text-sm">
          {/* 1. Date Filter */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
              تاريخ الحصة
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 2. Grade Filter */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              المرحلة والصف الدراسي
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>{g.labelAr}</option>
              ))}
            </select>
          </div>

          {/* 3. Group Filter (Al Waled Groups) */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              مجموعة السنتر والميعاد
            </label>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">جميع مجموعات سنتر الوليد</option>
              {allGroups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name} ({grp.schedule})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Session / Lesson Title Filter */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              عنوان الحصة / المحاضرة
            </label>
            <input
              type="text"
              list="session-preset-list"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="اختر أو اكتب عنوان الحصة..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <datalist id="session-preset-list">
              {SESSION_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
        </div>

        {/* LIVE METRICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-center">
            <span className="text-[11px] text-slate-400 block">إجمالي المسجلين</span>
            <span className="text-xl font-bold text-white">{totalCount}</span>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3 text-center">
            <span className="text-[11px] text-emerald-400 block">حضور مؤكد</span>
            <span className="text-xl font-bold text-emerald-400">{presentTotal}</span>
          </div>
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 text-center">
            <span className="text-[11px] text-amber-400 block">متأخر</span>
            <span className="text-xl font-bold text-amber-400">{lateTotal}</span>
          </div>
          <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-3 text-center">
            <span className="text-[11px] text-red-400 block">غياب</span>
            <span className="text-xl font-bold text-red-400">{absentTotal}</span>
          </div>
          <div className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-3 text-center col-span-2 md:col-span-1">
            <span className="text-[11px] text-blue-400 block">نسبة الحضور</span>
            <span className="text-xl font-bold text-blue-400">{currentRate}%</span>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: ROSTER & MANUAL ATTENDANCE (Requirement 7) */}
      {/* ================================================================= */}
      {activeTab === "roster" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث باسم الطالب أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {saveMsg && (
                <span className="text-xs text-emerald-400 font-semibold animate-pulse">{saveMsg}</span>
              )}
              <button
                onClick={handleBulkSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ كشف الحضور بالكامل
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              جاري تحميل بيانات الطلاب والمجموعات...
            </div>
          ) : displayRoster.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              لا توجد سجلات طلاب تطابق هذا البحث أو الفلتر المحدد.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="py-3 px-3">الكود</th>
                    <th className="py-3 px-3">اسم الطالب</th>
                    <th className="py-3 px-3">الصف</th>
                    <th className="py-3 px-3">المجموعة</th>
                    <th className="py-3 px-3">تليفون ولي الأمر</th>
                    <th className="py-3 px-3 text-center">تسجيل الحالة اليومية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayRoster.map((s) => {
                    const currentStatus = marks[s.studentId] || s.statusOnDate || "present";
                    return (
                      <tr key={s.studentId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-mono text-blue-400 font-bold">#{s.studentCode || s.studentId}</td>
                        <td className="py-3 px-3 font-bold text-white text-sm">{s.studentName}</td>
                        <td className="py-3 px-3 text-slate-300">{s.grade}</td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">{s.groupName}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{s.parentPhone || "—"}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {STATUS_OPTIONS.map((opt) => {
                              const isSelected = currentStatus === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => handleSingleMark(s.studentId, s.studentName, opt.id, s.grade, s.groupId)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                    isSelected
                                      ? opt.cls + " shadow-md ring-2 ring-white/30"
                                      : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                                  }`}
                                >
                                  <opt.icon className="w-3.5 h-3.5" />
                                  {opt.labelAr}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: QR & BARCODE FAST SCANNER (Requirement 5, 6, 8) */}
      {/* ================================================================= */}
      {activeTab === "scanner" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CAMERA QR SCANNER */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                كاميرا مسح كيو آر كود (QR)
              </h2>
              <button
                onClick={scannerActive ? stopCameraScanner : startCameraScanner}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  scannerActive
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                }`}
              >
                {scannerActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                {scannerActive ? "إيقاف الكاميرا" : "تشغيل الكاميرا"}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              وجّه الكاميرا نحو بطاقة أو هاتف الطالب. سيتم التحقق من صحة الكود وتسجيل الحضور فوراً مع منع التكرار.
            </p>

            <div className="relative aspect-square max-w-sm mx-auto bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden">
              <div id="qr-camera-feed" className="w-full h-full" />
              {!scannerActive && (
                <div className="text-center p-6 text-slate-500">
                  <QrCode className="w-16 h-16 mx-auto mb-3 opacity-40" />
                  <p className="text-xs">الكاميرا متوقفة حالياً. اضغط "تشغيل الكاميرا" للمسح المباشر.</p>
                </div>
              )}
            </div>
          </div>

          {/* USB BARCODE READER & MANUAL CODE INPUT */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Barcode className="w-5 h-5 text-blue-400" />
                قارئ الباركود الليزري (USB Hardware Scanner)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                قارئ الباركود اليدوي متصل ويعمل تلقائياً. كل ما عليك هو توجيه المسدس الليزري نحو كارت الطالب وسيقوم النظام بتسجيل الحضور فوراً دون الحاجة للنقر بالفأرة.
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">
                المستمع الليزري التلقائي مفعل (Ready for Barcode Gun)
              </span>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <label className="text-xs text-slate-300 font-semibold mb-2 block">
                أو إدخال كود الطالب يدوياً والضغط على Enter:
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualBarcodeInput.trim()) {
                    handleDirectScan(manualBarcodeInput.trim(), "barcode");
                    setManualBarcodeInput("");
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={manualBarcodeInput}
                  onChange={(e) => setManualBarcodeInput(e.target.value)}
                  placeholder="أدخل كود الطالب (مثال: 101 أو wld_qr_...)"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  تسجيل
                </button>
              </form>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-4 text-xs text-slate-300 space-y-1.5">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                نظام الأمان والتحقق من التكرار (Anti-Duplicate):
              </h4>
              <p className="text-[11px] text-slate-400">
                • يتم التحقق من الكود في قاعدة بيانات Neon PostgreSQL في أجزاء من الثانية.
              </p>
              <p className="text-[11px] text-slate-400">
                • في حال مسح بطاقة طالب تم تسجيله مسبقاً في نفس الحصة، يصدر تنبيه تحذيري فوري ويمنع احتساب الحضور مرتين.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: ATTENDANCE HISTORY (Requirement 9) */}
      {/* ================================================================= */}
      {activeTab === "history" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              سجل الحضور والغياب التاريخي
            </h2>
            <span className="text-xs text-slate-400">
              إجمالي السجلات المعروضة: {historyRecords.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              جاري تحميل السجلات التاريخية...
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              لا توجد سجلات حضور مسجلة للتاريخ والفلاتر المحددة.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="py-3 px-3">التاريخ</th>
                    <th className="py-3 px-3">اسم الطالب</th>
                    <th className="py-3 px-3">عنوان الحصة</th>
                    <th className="py-3 px-3">الصف</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3">طريقة الرصد</th>
                    <th className="py-3 px-3">سجل بواسطة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {historyRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-300">{r.sessionDate}</td>
                      <td className="py-3 px-3 font-bold text-white">{r.studentName}</td>
                      <td className="py-3 px-3 text-slate-300">{r.sessionTitle}</td>
                      <td className="py-3 px-3 text-slate-400">{r.grade || "عام"}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            r.status === "present"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : r.status === "late"
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : r.status === "excused"
                              ? "bg-sky-950 text-sky-400 border border-sky-800"
                              : "bg-red-950 text-red-400 border border-red-800"
                          }`}
                        >
                          {r.status === "present" ? "حاضر" : r.status === "late" ? "متأخر" : r.status === "excused" ? "معذور" : "غائب"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {r.scanMethod === "qr" ? "QR كاميرا" : r.scanMethod === "barcode" ? "باركود ليزر" : "يدوي"}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{r.markedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: DAILY & MONTHLY REPORTS (Requirement 10) */}
      {/* ================================================================= */}
      {activeTab === "reports" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                تقارير الحضور الشهرية والتحليلية
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تقرير شامل لشهر: <span className="font-mono text-blue-400 font-bold">{reportData?.month || date.substring(0, 7)}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 shadow"
              >
                <Printer className="w-4 h-4" />
                طباعة الكشف
              </button>
              <button
                onClick={exportReportToCsv}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                تصدير التقرير Excel (CSV)
              </button>
            </div>
          </div>

          {/* GROUP BREAKDOWN SUMMARY */}
          {reportData?.groupReports && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.groupReports.map((grp: any) => (
                <div key={grp.groupId} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <h3 className="font-bold text-white text-sm mb-1">{grp.groupName}</h3>
                  <p className="text-xs text-slate-400 mb-3">{grp.schedule} — {grp.grade}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">نسبة الحضور:</span>
                    <span className={`font-bold ${grp.rate >= 80 ? "text-emerald-400" : "text-amber-400"}`}>{grp.rate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-400">إجمالي الطلاب:</span>
                    <span className="text-white font-mono">{grp.totalStudents}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DETAILED STUDENT ROSTER TABLE */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              جاري تجهيز التقرير الشهري...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                    <th className="py-3 px-3">الكود</th>
                    <th className="py-3 px-3">اسم الطالب</th>
                    <th className="py-3 px-3">الصف</th>
                    <th className="py-3 px-3">المجموعة</th>
                    <th className="py-3 px-3 text-center">إجمالي الحصص</th>
                    <th className="py-3 px-3 text-center text-emerald-400">حاضر</th>
                    <th className="py-3 px-3 text-center text-amber-400">متأخر</th>
                    <th className="py-3 px-3 text-center text-red-400">غائب</th>
                    <th className="py-3 px-3 text-center">النسبة المئوية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData?.studentReports?.map((s: any) => (
                    <tr key={s.studentId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-blue-400 font-bold">#{s.studentCode || "—"}</td>
                      <td className="py-3 px-3 font-bold text-white">{s.studentName}</td>
                      <td className="py-3 px-3 text-slate-300">{s.grade}</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{s.groupName}</td>
                      <td className="py-3 px-3 text-center font-mono">{s.totalSessions}</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">{s.presentCount}</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-400">{s.lateCount}</td>
                      <td className="py-3 px-3 text-center font-mono text-red-400 font-bold">{s.absentCount}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.rate >= 80 ? "bg-emerald-950 text-emerald-400" :
                          s.rate >= 60 ? "bg-amber-950 text-amber-400" :
                          "bg-red-950 text-red-400"
                        }`}>
                          {s.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
