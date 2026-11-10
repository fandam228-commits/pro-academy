"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
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
  Camera,
  CameraOff,
  Search,
  DollarSign,
  Printer,
  Download,
  Share2,
  Phone,
  MessageCircle,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  CreditCard,
  User,
  GraduationCap,
  Volume2,
} from "lucide-react";

const SESSION_PRESETS = [
  "الحصة الأسبوعية مع مستر حبيب الرحمن",
  "حصة مراجعة القواعد والجرامر — سنتر",
  "حصة حل نماذج امتحانات وبوكليت",
  "حصة مهارات الترجمة والمقال",
  "المتابعة الشهرية واختبار التقويم",
];

const STATUS_OPTIONS = [
  { id: "present", labelAr: "حاضر", labelEn: "Present", icon: UserCheck, cls: "bg-emerald-600 text-white" },
  { id: "late", labelAr: "متأخر", labelEn: "Late", icon: Clock, cls: "bg-amber-500 text-slate-950" },
  { id: "absent", labelAr: "غائب", labelEn: "Absent", icon: UserX, cls: "bg-red-500 text-white" },
  { id: "excused", labelAr: "معذور", labelEn: "Excused", icon: FileBadge, cls: "bg-sky-600 text-white" },
];

export const AttendanceWorkspace: React.FC = () => {
  const { user, lang } = useApp();
  const isStaff = user?.role === "teacher" || user?.role === "admin";
  const [loading, setLoading] = useState(true);

  // Active Tab for Staff: "scanner" | "roster" | "fees" | "cards"
  const [activeTab, setActiveTab] = useState<"scanner" | "roster" | "fees" | "cards">("scanner");

  // Teacher common state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTitle, setSessionTitle] = useState(SESSION_PRESETS[0]);
  const [roster, setRoster] = useState<any[]>([]);
  const [recentDates, setRecentDates] = useState<string[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [totalRevenueMonth, setTotalRevenueMonth] = useState(0);

  // QR Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  // Fee collection modal state
  const [feeModalStudent, setFeeModalStudent] = useState<any>(null);
  const [feeAmount, setFeeAmount] = useState<number>(250);
  const [feeNotes, setFeeNotes] = useState<string>("سداد اشتراك السنتر لشهر نوفمبر");
  const [collectingFee, setCollectingFee] = useState(false);
  const [feeReceipt, setFeeReceipt] = useState<any>(null);

  // Student specific state
  const [studentData, setStudentData] = useState<any>(null);
  const [studentQrDataUrl, setStudentQrDataUrl] = useState<string>("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Audio Beep generator
  const playSuccessBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, date]);

  // Generate QR code for student
  useEffect(() => {
    if (user?.id && !isStaff) {
      QRCode.toDataURL(`PA:${user.id}`, {
        width: 300,
        margin: 2,
        color: { dark: "#0c071a", light: "#ffffff" },
      })
        .then((url) => setStudentQrDataUrl(url))
        .catch(() => {});
    }
  }, [user?.id, isStaff]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = isStaff ? `/api/attendance?date=${date}` : "/api/attendance";
      const res = await fetch(url, { headers: authHeaders() });
      const json = await res.json();
      if (isStaff) {
        setRoster(json.roster || []);
        setRecentDates(json.recentDates || []);
        setTotalRevenueMonth(json.totalRevenueMonth || 0);
        const initial: Record<string, string> = {};
        for (const r of json.roster || []) {
          initial[r.studentId] = r.statusOnDate || "present";
        }
        setMarks(initial);
      } else {
        setStudentData(json);
      }
    } catch {}
    setLoading(false);
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError("");
    setLastScanResult(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
        }
        setCameraActive(true);
        startScanLoop();
      } else {
        setCameraError("الكاميرا غير مدعومة في هذا المتصفح. يمكنك إدخال الكود يدوياً.");
      }
    } catch (err: any) {
      setCameraError("تعذر الوصول للكاميرا. يرجى التأكد من إعطاء إذن الكاميرا أو استخدام الإدخال اليدوي.");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Continuous Barcode / QR Detection loop
  const startScanLoop = () => {
    const detect = async () => {
      if (!cameraActive || !videoRef.current) return;

      if ("BarcodeDetector" in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            if (raw) {
              handleProcessScan(raw);
              stopCamera();
              return;
            }
          }
        } catch {}
      }
      scanLoopRef.current = requestAnimationFrame(detect);
    };
    scanLoopRef.current = requestAnimationFrame(detect);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Process Scanned QR Code
  const handleProcessScan = async (codeToScan: string) => {
    if (!codeToScan.trim() || scanning) return;
    setScanning(true);
    setCameraError("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "qr_scan",
          qrCodeData: codeToScan.trim(),
          sessionTitle,
          sessionDate: date,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setCameraError(json.error || "لم يتم التعرف على كود الطالب");
      } else {
        playSuccessBeep();
        setLastScanResult(json);
        setManualCode("");
        fetchData();
      }
    } catch {
      setCameraError("حدث خطأ أثناء الاتصال بالنظام");
    } finally {
      setScanning(false);
    }
  };

  // Collect Fee Action
  const handleCollectFee = async () => {
    if (!feeModalStudent || !feeAmount) return;
    setCollectingFee(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "collect_fee",
          studentId: feeModalStudent.id || feeModalStudent.studentId,
          amount: feeAmount,
          method: "cash_center",
          notes: feeNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeeReceipt({
          ...json,
          studentName: feeModalStudent.name || feeModalStudent.studentName,
          grade: feeModalStudent.grade,
          amount: feeAmount,
        });
        setFeeModalStudent(null);
        fetchData();
      }
    } catch {}
    setCollectingFee(false);
  };

  // Bulk Save Roster
  const handleBulkSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = {
        action: "bulk_mark",
        sessionTitle,
        sessionDate: date,
        marks: roster.map((r) => ({
          studentId: r.studentId,
          studentName: r.studentName,
          grade: r.grade,
          status: marks[r.studentId] || "present",
        })),
      };
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSaveMsg(`تم حفظ حضور ${json.saved} طالب بنجاح ✓`);
        fetchData();
      }
    } catch {}
    setSaving(false);
  };

  // Student Self Check-in
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "check_in", sessionTitle: "الحصة المباشرة مع مستر حبيب الرحمن" }),
      });
      setCheckedIn(true);
      fetchData();
    } catch {}
    setCheckingIn(false);
  };

  const markAllAs = (status: string) => {
    const next: Record<string, string> = {};
    for (const r of roster) next[r.studentId] = status;
    setMarks(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#0c071a] via-[#1a0f38] to-[#080d1a] rounded-[2.5rem] p-6 sm:p-9 text-white shadow-2xl border border-purple-500/20 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-8 -right-8 w-64 h-64 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 w-64 h-64 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3.5 py-1 text-xs font-black text-purple-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>نظام السنتر الذكي • Professional Academy 2026/2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-amber-400" />
              <span>{lang === "ar" ? "تسجيل الحضور وكارنيهات الطلاب والمصاريف" : "Smart Attendance & Fees Hub"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-2 max-w-2xl leading-relaxed">
              {isStaff
                ? "مسح كود QR من كاميرا الموبايل لتسجيل حضور الطلاب لحظياً، مع بيان فوري للمصاريف والاشتراكات الشهرية وتوليد إيصالات السداد."
                : "كارنيه الطالب الذكي المعتمد، سجل مواظبة الحضور، وإيصالات سداد الاشتراكات الشهرية."}
            </p>
          </div>

          {/* QUICK REVENUE / COMPLIANCE STATS */}
          {isStaff ? (
            <div className="flex items-center gap-3 bg-[#170e35] p-4 rounded-3xl border border-purple-400/30">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-300">متحصلات الشهر</span>
                <p className="text-xl font-black text-white">{totalRevenueMonth.toLocaleString()} ج.م</p>
                <span className="text-[10px] font-bold text-emerald-400">سنتر مستر حبيب الرحمن</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-[#170e35] p-4 rounded-3xl border border-purple-400/30">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-lg">
                {studentData?.rate ?? 100}%
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-300">نسبة التزام الحضور</span>
                <p className="text-xs font-black text-white">{studentData?.presentCount ?? 0} حصة حاضر</p>
                <span className="text-[10px] font-bold text-sky-400">مواظب ومتميز</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
          <p className="text-xs font-bold">جاري تحميل منظومة الحضور والمصاريف...</p>
        </div>
      ) : isStaff ? (
        /* =========================================================================
           STAFF DASHBOARD (TEACHER / ADMIN)
           ========================================================================= */
        <div className="space-y-6">
          {/* TAB SELECTOR */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#120a26] border border-slate-200 dark:border-purple-950/70 shadow-md">
            <button
              onClick={() => setActiveTab("scanner")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs transition-all ${
                activeTab === "scanner"
                  ? "bg-gradient-to-r from-purple-600 to-sky-600 text-white shadow-md shadow-purple-950/40"
                  : "text-slate-600 dark:text-purple-200 hover:text-white"
              }`}
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>ماسح الـ QR السريع من الموبايل</span>
            </button>

            <button
              onClick={() => setActiveTab("roster")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs transition-all ${
                activeTab === "roster"
                  ? "bg-gradient-to-r from-purple-600 to-sky-600 text-white shadow-md shadow-purple-950/40"
                  : "text-slate-600 dark:text-purple-200 hover:text-white"
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-sky-300" />
              <span>كشف رصد الحضور ({roster.length} طالب)</span>
            </button>

            <button
              onClick={() => setActiveTab("fees")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs transition-all ${
                activeTab === "fees"
                  ? "bg-gradient-to-r from-purple-600 to-sky-600 text-white shadow-md shadow-purple-950/40"
                  : "text-slate-600 dark:text-purple-200 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-300" />
              <span>سجل المصاريف والاشتراكات الشهرية</span>
            </button>

            <button
              onClick={() => setActiveTab("cards")}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs transition-all ${
                activeTab === "cards"
                  ? "bg-gradient-to-r from-purple-600 to-sky-600 text-white shadow-md shadow-purple-950/40"
                  : "text-slate-600 dark:text-purple-200 hover:text-white"
              }`}
            >
              <Printer className="w-4 h-4 text-purple-300" />
              <span>طباعة وتصدير كارنيهات الطلاب</span>
            </button>
          </div>

          {/* ================= TAB 1: SMART MOBILE QR SCANNER ================= */}
          {activeTab === "scanner" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CAMERA SCANNER VIEWPORT */}
              <div className="rounded-3xl border border-slate-200 dark:border-purple-950/70 bg-white dark:bg-[#120a26] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-purple-900/40 mb-4">
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-purple-600 dark:text-sky-400" />
                        <span>كاميرا مسح كود كارنيه الطالب</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-purple-200/70 mt-0.5">
                        وجّه كاميرا الموبايل نحو كود الـ QR الموجود على كارنيه الطالب
                      </p>
                    </div>

                    <button
                      onClick={cameraActive ? stopCamera : startCamera}
                      className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                        cameraActive
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                          : "bg-purple-600 text-white shadow-lg shadow-purple-600/30 hover:brightness-110"
                      }`}
                    >
                      {cameraActive ? (
                        <>
                          <CameraOff className="w-4 h-4" />
                          <span>إيقاف الكاميرا</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>تشغيل الكاميرا</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* VIDEO CONTAINER WITH SCANNING ANIMATION */}
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-purple-400/40 flex items-center justify-center">
                    <video ref={videoRef} className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`} />

                    {cameraActive && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        {/* Target Box */}
                        <div className="w-48 h-48 border-2 border-sky-400 rounded-3xl relative animate-pulse shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                          {/* Laser beam scanline */}
                          <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
                        </div>
                      </div>
                    )}

                    {!cameraActive && (
                      <div className="text-center p-6 text-slate-400">
                        <QrCode className="w-12 h-12 mx-auto mb-2 text-purple-400 opacity-60" />
                        <p className="text-xs font-bold">اضغط على «تشغيل الكاميرا» لبدء المسح التلقائي</p>
                        <p className="text-[10px] text-slate-500 mt-1">يدعم كاميرا الهاتف الخلفية بدقة عالية</p>
                      </div>
                    )}
                  </div>

                  {cameraError && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>

                {/* MANUAL FALLBACK INPUT */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-purple-900/40">
                  <label className="text-xs font-black text-slate-800 dark:text-purple-200 block mb-2">
                    أو أدخل كود الطالب / رقم هاتفه يدوياً:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="مثال: PA-STUDENT-1 أو 01006468384"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleProcessScan(manualCode)}
                      className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-[#190f36] border border-slate-200 dark:border-purple-500/30 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleProcessScan(manualCode)}
                      disabled={!manualCode.trim() || scanning}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-sky-600 text-white font-black text-xs shadow-md disabled:opacity-50"
                    >
                      {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "مسح"}
                    </button>
                  </div>
                </div>
              </div>

              {/* INSTANT SCAN RESULT & STUDENT CARD */}
              <div className="rounded-3xl border border-slate-200 dark:border-purple-950/70 bg-white dark:bg-[#120a26] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-purple-900/40 mb-4">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>نتيجة المسح الفوري وبيانات الطالب</span>
                    </h3>
                    {lastScanResult && (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        تم رصد الحضور: {lastScanResult.scanTime}
                      </span>
                    )}
                  </div>

                  {lastScanResult ? (
                    <div className="space-y-4 animate-fadeIn">
                      {/* STUDENT PROFILE CHIP */}
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 via-[#170e35] to-sky-900/15 border border-purple-400/30">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-sky-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
                          {lastScanResult.student.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            {lastScanResult.student.name}
                          </h4>
                          <p className="text-xs font-bold text-amber-500 dark:text-amber-300">
                            {lastScanResult.student.grade || "مرحلة ثانوية"}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-purple-300/70 mt-0.5">
                            كود الطالب: {lastScanResult.student.studentCode}
                          </p>
                        </div>
                      </div>

                      {/* PAYMENT & TUITION STATUS BOX */}
                      <div className="p-4 rounded-2xl border border-purple-400/20 bg-slate-50 dark:bg-[#170e35] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-700 dark:text-purple-200 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-sky-400" />
                            <span>حالة اشتراك السنتر لشهر {lastScanResult.paymentStatus.currentMonth}</span>
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black ${
                              lastScanResult.paymentStatus.feeStatus === "paid"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : lastScanResult.paymentStatus.feeStatus === "partial"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {lastScanResult.paymentStatus.feeStatus === "paid"
                              ? "مسدد بالكامل ✓"
                              : lastScanResult.paymentStatus.feeStatus === "partial"
                              ? `متبقي ${lastScanResult.paymentStatus.remainingAmount} ج.م`
                              : "غير مسدد ✕"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-purple-500/15">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-[#100724] border border-purple-500/15">
                            <span className="text-[10px] text-slate-400 block">المسدد هذا الشهر</span>
                            <span className="text-sm font-black text-emerald-400">
                              {lastScanResult.paymentStatus.totalPaid} ج.م
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white dark:bg-[#100724] border border-purple-500/15">
                            <span className="text-[10px] text-slate-400 block">المبلغ المتبقي</span>
                            <span className="text-sm font-black text-rose-400">
                              {lastScanResult.paymentStatus.remainingAmount} ج.م
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* QUICK ACTION BUTTONS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => {
                            setFeeModalStudent(lastScanResult.student);
                            setFeeAmount(lastScanResult.paymentStatus.remainingAmount || 250);
                          }}
                          className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 hover:brightness-110"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>تحصيل المصاريف الآن</span>
                        </button>

                        <a
                          href={`https://wa.me/${(lastScanResult.student.parentPhone || lastScanResult.student.phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `أهلاً بحضرتك.. نود إحاطتكم بتسجيل حضور الطالب (${lastScanResult.student.name}) لحصة اللغة الإنجليزية مع مستر حبيب الرحمن اليوم في تمام ${lastScanResult.scanTime}. (حالة المصاريف: ${
                              lastScanResult.paymentStatus.feeStatus === "paid" ? "مسددة بالكامل ✓" : "متبقي " + lastScanResult.paymentStatus.remainingAmount + " ج.م"
                            })`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 hover:brightness-110"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>إشعار واتساب لولي الأمر</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400">
                      <UserCheck className="w-12 h-12 mx-auto mb-2 text-purple-400/40" />
                      <p className="text-xs font-bold">بانتظار مسح كود أول طالب...</p>
                      <p className="text-[10px] text-slate-500 mt-1">ستظهر البيانات وحالة المصاريف فورياً هنا</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ROSTER SHEET ================= */}
          {activeTab === "roster" && (
            <div className="space-y-4">
              {/* SESSION CONTROLS */}
              <div className="bg-white dark:bg-[#120a26] rounded-3xl border border-slate-200 dark:border-purple-950/70 shadow-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-xs">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">تاريخ الحصة</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#190f36] border border-slate-200 dark:border-purple-500/30 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="text-xs">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">عنوان الحصة</label>
                  <select
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#190f36] border border-slate-200 dark:border-purple-500/30 font-bold text-slate-900 dark:text-white"
                  >
                    {SESSION_PRESETS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs flex flex-col justify-end">
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAllAs("present")}
                      className="flex-1 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 font-black text-xs border border-emerald-500/30 hover:bg-emerald-500/25"
                    >
                      الكل حاضر
                    </button>
                    <button
                      onClick={() => markAllAs("absent")}
                      className="flex-1 py-3 rounded-xl bg-rose-500/15 text-rose-400 font-black text-xs border border-rose-500/30 hover:bg-rose-500/25"
                    >
                      الكل غائب
                    </button>
                  </div>
                </div>
              </div>

              {/* ROSTER TABLE */}
              <div className="bg-white dark:bg-[#120a26] rounded-3xl border border-slate-200 dark:border-purple-950/70 shadow-xl p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-purple-900/40">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    قائمة طلاب السنتر والمجموعة ({roster.length} طالب)
                  </h3>
                  <div className="flex items-center gap-3">
                    {saveMsg && <span className="text-xs font-black text-emerald-400">{saveMsg}</span>}
                    <button
                      onClick={handleBulkSave}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-sky-600 text-white text-xs font-black shadow-lg flex items-center gap-2 hover:brightness-110 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>حفظ رصد الحضور</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {roster.map((r) => {
                    const currentStatus = marks[r.studentId] || "present";
                    return (
                      <div
                        key={r.studentId}
                        className="p-3.5 rounded-2xl border border-slate-100 dark:border-purple-950/50 bg-slate-50 dark:bg-[#160c32] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-200 flex items-center justify-center font-black text-sm">
                            {r.studentName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                              {r.studentName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-purple-300/70">
                              {r.grade || "ثانوية عامة"} • {r.studentCode}
                            </p>
                          </div>
                        </div>

                        {/* STATUS BUTTONS */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {STATUS_OPTIONS.map((st) => {
                            const isSelected = currentStatus === st.id;
                            const Icon = st.icon;
                            return (
                              <button
                                key={st.id}
                                onClick={() => setMarks((prev) => ({ ...prev, [r.studentId]: st.id }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                                  isSelected
                                    ? st.cls + " font-black shadow-md scale-105"
                                    : "bg-slate-200 dark:bg-purple-950/50 text-slate-600 dark:text-purple-300 hover:text-white"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{st.labelAr}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: FEES & TUITION LEDGER ================= */}
          {activeTab === "fees" && (
            <div className="bg-white dark:bg-[#120a26] rounded-3xl border border-slate-200 dark:border-purple-950/70 shadow-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-purple-900/40">
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <span>سجل المصاريف والاشتراكات الشهرية لطلاب السنتر</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-purple-200/70 mt-0.5">
                    متابعة تسديد الرسوم الشهرية، المتأخرات، وتحصيل المصاريف نقداً
                  </p>
                </div>

                <div className="text-xs font-black text-purple-200 bg-purple-950/50 px-4 py-2 rounded-xl border border-purple-400/20">
                  قيمة الاشتراك الشهري: 250 ج.م
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-purple-500/20 text-slate-400 dark:text-purple-300">
                      <th className="py-3 px-3">الطالب</th>
                      <th className="py-3 px-3">الكود</th>
                      <th className="py-3 px-3">المسدد</th>
                      <th className="py-3 px-3">المتبقي</th>
                      <th className="py-3 px-3">الحالة</th>
                      <th className="py-3 px-3 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-purple-900/20">
                    {roster.map((st) => (
                      <tr key={st.studentId} className="hover:bg-purple-900/10">
                        <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
                          {st.studentName}
                        </td>
                        <td className="py-3 px-3 font-mono text-purple-300">{st.studentCode}</td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">{st.totalPaidThisMonth} ج.م</td>
                        <td className="py-3 px-3 text-rose-400 font-bold">{st.remainingAmount} ج.م</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              st.feeStatus === "paid"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : st.feeStatus === "partial"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {st.feeStatus === "paid" ? "مسدد" : st.feeStatus === "partial" ? "متبقي" : "غير مسدد"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setFeeModalStudent(st);
                              setFeeAmount(st.remainingAmount || 250);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-black text-xs hover:bg-emerald-500"
                          >
                            تحصيل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: STUDENT ID CARDS PRINT / EXPORT ================= */}
          {activeTab === "cards" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <Printer className="w-5 h-5 text-amber-400" />
                    <span>كارنيهات الطلاب المعتمدة بـ QR Code جاهزة للطباعة</span>
                  </h3>
                  <p className="text-xs text-purple-200/70 mt-0.5">
                    يمكن طباعة كل كارنيه أو طباعة مجمعة لتوزيعها على الطلاب في السنتر
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-sky-600 text-white font-black text-xs shadow-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة جميع الكارنيهات</span>
                </button>
              </div>

              {/* CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roster.map((st) => (
                  <div
                    key={st.studentId}
                    className="rounded-3xl border border-purple-400/30 bg-gradient-to-b from-[#1c103e] via-[#120829] to-[#0a0518] p-5 shadow-2xl relative overflow-hidden text-right"
                  >
                    {/* Header Seal */}
                    <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                      <div>
                        <span className="text-[10px] font-black text-amber-300">PROFESSIONAL ACADEMY</span>
                        <h4 className="text-xs font-black text-white">مستر حبيب الرحمن</h4>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        {st.studentCode}
                      </span>
                    </div>

                    {/* Body with QR */}
                    <div className="my-4 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                        {st.studentName.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="font-black text-sm text-white truncate">{st.studentName}</h5>
                        <p className="text-xs font-bold text-amber-300/90">{st.grade || "ثانوية عامة"}</p>
                        <p className="text-[10px] text-purple-200/70 mt-1">هاتف: {st.phone || "مسجل بالمنصة"}</p>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="bg-white p-3 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center">
                      <div className="w-28 h-28 flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-slate-900" />
                      </div>
                      <span className="text-[9px] font-mono font-black text-slate-800 mt-1">PA:{st.studentId}</span>
                    </div>

                    {/* Footer Verification */}
                    <div className="mt-3 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[10px] font-bold text-purple-200/60">
                      <span>العام الدراسي 2026/2027</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>معتمد وموثق</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
           STUDENT VIEW (OFFICIAL DIGITAL ID CARD & ATTENDANCE RECORD)
           ========================================================================= */
        <div className="max-w-xl mx-auto space-y-6">
          {/* OFFICIAL SMART STUDENT ID CARD */}
          <div className="rounded-[2.5rem] border border-purple-400/40 bg-gradient-to-b from-[#1e1042] via-[#12082b] to-[#090417] p-7 shadow-2xl text-right relative overflow-hidden">
            {/* Glow halos */}
            <div className="pointer-events-none absolute -top-8 -right-8 w-48 h-48 rounded-full bg-purple-600/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl" />

            {/* Top Brand Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/25">
              <div>
                <span className="text-xs font-black tracking-wider text-amber-300">PROFESSIONAL ACADEMY</span>
                <h3 className="text-base font-black text-white mt-0.5">مستر حبيب الرحمن للغة الإنجليزية</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 font-mono text-xs font-black">
                {studentData?.studentCode || `PA-${user?.id?.slice(-6).toUpperCase()}`}
              </span>
            </div>

            {/* Student Info & Photo */}
            <div className="my-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-sky-500 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-purple-950/60 shrink-0">
                {user?.name?.charAt(0) || "ط"}
              </div>
              <div>
                <h4 className="text-lg font-black text-white">{user?.name}</h4>
                <p className="text-xs font-bold text-amber-300 mt-0.5">{user?.grade || "المرحلة الثانوية"}</p>
                <p className="text-[11px] text-purple-200/80 mt-1">كود الطالب الأكاديمي المعتمد بالسنتر</p>
              </div>
            </div>

            {/* QR CODE DISPLAY */}
            <div className="bg-white p-5 rounded-3xl text-center shadow-2xl flex flex-col items-center justify-center border-4 border-purple-400/30">
              {studentQrDataUrl ? (
                <img src={studentQrDataUrl} alt="Student QR Code" className="w-44 h-44 object-contain" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center">
                  <QrCode className="w-36 h-36 text-slate-900" />
                </div>
              )}
              <span className="text-xs font-mono font-black text-slate-900 mt-2">
                PA:{user?.id}
              </span>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                وجّه هذا الكود لكاميرا السنتر عند دخول الحصة
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-sky-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 hover:brightness-110"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الكارنيه</span>
              </button>
            </div>
          </div>

          {/* ATTENDANCE HISTORY LIST */}
          <div className="rounded-3xl border border-slate-200 dark:border-purple-950/70 bg-white dark:bg-[#120a26] p-6 shadow-xl">
            <h4 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-500" />
              <span>سجل مواظبة الحصص السابقة</span>
            </h4>

            {studentData?.records?.length > 0 ? (
              <div className="space-y-2">
                {studentData.records.slice(0, 5).map((rec: any) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#170e35] border border-purple-500/15 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">{rec.sessionTitle}</p>
                      <p className="text-[10px] text-slate-400">{rec.sessionDate}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-black text-xs ${
                        rec.status === "present"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : rec.status === "late"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {rec.status === "present" ? "حاضر ✓" : rec.status === "late" ? "متأخر" : "غائب ✕"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">لم يتم رصد حضور بعد لهذا الحساب.</p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
         FEE COLLECTION MODAL (TEACHER / ADMIN)
         ========================================================================= */}
      {feeModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-purple-400/40 bg-[#140b2e] p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>تحصيل المصاريف والاشتراك الشهري</span>
              </h3>
              <button onClick={() => setFeeModalStudent(null)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-purple-200">الطالب:</p>
              <h4 className="text-base font-black text-white">{feeModalStudent.name || feeModalStudent.studentName}</h4>
              <p className="text-xs text-amber-300">{feeModalStudent.grade || "ثانوية عامة"}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 block mb-1">المبلغ المحصل (ج.م):</label>
              <input
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(Number(e.target.value))}
                className="w-full p-3 rounded-2xl bg-[#0c071a] border border-purple-500/30 text-white font-black text-lg text-center"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-200 block mb-1">بيان السداد والملاحظات:</label>
              <input
                type="text"
                value={feeNotes}
                onChange={(e) => setFeeNotes(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#0c071a] border border-purple-500/30 text-white text-xs font-bold"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setFeeModalStudent(null)}
                className="flex-1 py-3 rounded-2xl bg-white/10 text-xs font-bold hover:bg-white/20"
              >
                إلغاء
              </button>
              <button
                onClick={handleCollectFee}
                disabled={collectingFee || !feeAmount}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {collectingFee ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>تأكيد التحصيل وإصدار الإيصال</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         FEE RECEIPT POPUP (AFTER SUCCESSFUL PAYMENT)
         ========================================================================= */}
      {feeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-emerald-400/40 bg-[#0e1628] p-6 text-white shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                إيصال سداد رقمي معتمد
              </span>
              <h3 className="text-lg font-black text-white mt-1">تم تحصيل المصاريف بنجاح</h3>
              <p className="text-xs text-slate-300 mt-1">رقم الإيصال: {feeReceipt.receiptNumber}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 text-right space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">اسم الطالب:</span>
                <span className="font-black text-white">{feeReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المبلغ المسدد:</span>
                <span className="font-black text-emerald-400">{feeReceipt.amount} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">طريقة التحصيل:</span>
                <span className="font-black text-white">نقداً بالسنتر</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">التاريخ:</span>
                <span className="font-mono text-slate-300">
                  {new Date(feeReceipt.date).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setFeeReceipt(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-sky-600 text-white font-black text-xs shadow-lg"
            >
              تم وإغلاق الإيصال
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
