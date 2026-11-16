"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import { AttendanceWorkspace } from "@/components/AttendanceWorkspace";
import { ParentConnectAdminHub } from "@/components/ParentConnectAdminHub";
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  QrCode,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ArrowLeft,
  Download,
  Printer,
  RefreshCw,
  Eye,
  Shield,
  Smartphone,
  Send,
  Sliders,
  XCircle,
  HelpCircle,
  ChevronDown,
  Layers,
  ArrowRightLeft,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

export const CenterManagementHub: React.FC = () => {
  const { lang, user } = useApp();
  const [subTab, setSubTab] = useState<
    | "overview"
    | "groups"
    | "students"
    | "attendance"
    | "fees"
    | "collections"
    | "expenses"
    | "notifications"
    | "reports"
    | "settings"
  >("overview");

  // Overview KPIs State
  const [kpis, setKpis] = useState<any>({
    activeStudents: 0,
    activeGroups: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayLate: 0,
    todayCollections: "0.00",
    monthCollections: "0.00",
    monthExpenses: "0.00",
    totalOverdue: "0.00",
    netOperationalResult: "0.00",
  });
  const [loadingKpis, setLoadingKpis] = useState(false);

  // Groups & Memberships State
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Collections & Fees State
  const [collections, setCollections] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Collect Fee Form
  const [collectStudentId, setCollectStudentId] = useState("");
  const [collectGroupId, setCollectGroupId] = useState("");
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMethod, setCollectMethod] = useState("cash");
  const [collectRef, setCollectRef] = useState("");
  const [collectNotes, setCollectNotes] = useState("");
  const [collectSubmitting, setCollectSubmitting] = useState(false);
  const [collectMessage, setCollectMessage] = useState("");

  // Operating Expenses State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [pnlSummary, setPnlSummary] = useState<any>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCatId, setExpCatId] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expMethod, setExpMethod] = useState("cash");
  const [expVendor, setExpVendor] = useState("");
  const [expNotes, setExpNotes] = useState("");

  // Group creation modal state
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupStage, setNewGroupStage] = useState("Secondary");
  const [newGroupGrade, setNewGroupGrade] = useState("Third Secondary (Baccalaureate)");
  const [newGroupTeacherId, setNewGroupTeacherId] = useState("");
  const [newGroupSchedule, setNewGroupSchedule] = useState("");
  const [newGroupRoom, setNewGroupRoom] = useState("");
  const [newGroupFee, setNewGroupFee] = useState("300");
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupMessage, setGroupMessage] = useState("");

  // Student transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStudentId, setTransferStudentId] = useState("");
  const [transferFromGroupId, setTransferFromGroupId] = useState("");
  const [transferToGroupId, setTransferToGroupId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferMessage, setTransferMessage] = useState("");

  // Student pause modal state
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseStudentId, setPauseStudentId] = useState("");
  const [pauseGroupId, setPauseGroupId] = useState("");
  const [pauseActionType, setPauseActionType] = useState<"pause" | "resume">("pause");
  const [pauseReason, setPauseReason] = useState("");
  const [pauseSubmitting, setPauseSubmitting] = useState(false);
  const [pauseMessage, setPauseMessage] = useState("");

  // Attendance & Quick Scanner
  const [students, setStudents] = useState<any[]>([]);
  const [scannerCode, setScannerCode] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTitle, setSessionTitle] = useState("حصة السنتر الأسبوعية");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Load Overview Data
  const fetchOverview = async () => {
    setLoadingKpis(true);
    try {
      // 1. Fetch Fee KPIs
      const feeRes = await fetch(`/api/center-fees?view=overview&month=${selectedMonth}`, { headers: authHeaders() });
      const feeJson = await feeRes.json();

      // 2. Fetch PnL & Expenses
      const expRes = await fetch(`/api/center-expenses?view=pnl&month=${selectedMonth}`, { headers: authHeaders() });
      const expJson = await expRes.json();

      // 3. Fetch Attendance
      const attRes = await fetch(`/api/attendance?date=${attendanceDate}&groupId=${selectedGroup}`, { headers: authHeaders() });
      const attJson = await attRes.json();

      // 4. Fetch Groups & Students
      const grpRes = await fetch("/api/groups", { headers: authHeaders() });
      const grpJson = await grpRes.json();

      if (grpJson.groups) setGroups(grpJson.groups);
      if (grpJson.teachers) setTeachers(grpJson.teachers);
      if (grpJson.students) setStudents(grpJson.students);
      if (grpJson.memberships) setMemberships(grpJson.memberships);

      const roster = attJson.roster || [];
      const presentCount = roster.filter((r: any) => r.statusOnDate === "present").length;
      const absentCount = roster.filter((r: any) => r.statusOnDate === "absent").length;
      const lateCount = roster.filter((r: any) => r.statusOnDate === "late").length;

      setKpis({
        activeStudents: grpJson.students?.length || roster.length || 0,
        activeGroups: grpJson.groups?.filter((g: any) => g.isActive)?.length || 0,
        todayPresent: presentCount,
        todayAbsent: absentCount,
        todayLate: lateCount,
        todayCollections: feeJson.kpis?.todayCollected || "0.00",
        monthCollections: feeJson.kpis?.totalCollected || "0.00",
        monthExpenses: expJson.summary?.totalCenterExpenses || "0.00",
        totalOverdue: feeJson.kpis?.totalOverdue || "0.00",
        netOperationalResult: expJson.summary?.netOperationalResult || "0.00",
      });
      setPnlSummary(expJson.summary);
    } catch (e) {
      console.error("Overview fetch error:", e);
    } finally {
      setLoadingKpis(false);
    }
  };

  // Load Collections
  const fetchCollections = async () => {
    try {
      const res = await fetch(`/api/center-fees?view=collections&month=${selectedMonth}&groupId=${selectedGroup}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.collections) setCollections(json.collections);
    } catch (e) {
      console.error(e);
    }
  };

  // Load Invoices
  const fetchInvoices = async () => {
    try {
      const res = await fetch(`/api/center-fees?view=invoices&month=${selectedMonth}&groupId=${selectedGroup}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.invoices) setInvoices(json.invoices);
    } catch (e) {
      console.error(e);
    }
  };

  // Load Expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/center-expenses?view=ledger&month=${selectedMonth}`, { headers: authHeaders() });
      const json = await res.json();
      if (json.expenses) setExpenses(json.expenses);
      if (json.categories) setExpenseCategories(json.categories);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedMonth, attendanceDate]);

  useEffect(() => {
    if (subTab === "collections") fetchCollections();
    if (subTab === "fees") fetchInvoices();
    if (subTab === "expenses") fetchExpenses();
  }, [subTab, selectedMonth, selectedGroup]);

  // Handle Quick Fee Collection
  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollectSubmitting(true);
    setCollectMessage("");
    try {
      const res = await fetch("/api/center-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "collect_fee",
          studentId: collectStudentId,
          groupId: collectGroupId,
          billingMonth: selectedMonth,
          amount: collectAmount,
          paymentMethod: collectMethod,
          transactionReference: collectRef,
          notes: collectNotes,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCollectMessage("تم تسجيل الدفعة وإصدار الإيصال بنجاح!");
        setSelectedReceipt(json.receipt);
        fetchOverview();
        if (subTab === "collections") fetchCollections();
        setCollectAmount("");
        setCollectRef("");
        setCollectNotes("");
      } else {
        setCollectMessage(json.error || "تعذر تسجيل الدفعة");
      }
    } catch {
      setCollectMessage("خطأ في الاتصال بالسيرفر");
    } finally {
      setCollectSubmitting(false);
    }
  };

  // Handle Add Expense
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/center-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "create_expense",
          title: expTitle,
          categoryId: expCatId,
          amount: expAmount,
          expenseDate: new Date().toISOString().split("T")[0],
          paymentMethod: expMethod,
          recipientVendor: expVendor,
          notes: expNotes,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setShowExpenseModal(false);
        setExpTitle("");
        setExpAmount("");
        setExpVendor("");
        setExpNotes("");
        fetchExpenses();
        fetchOverview();
      } else {
        alert(json.error || "تعذر حفظ المصروف");
      }
    } catch {
      alert("خطأ أثناء الاتصال");
    }
  };

  // Handle Add Group
  const handleAddGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGroup(true);
    setGroupMessage("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "create_group",
          name: newGroupName,
          stage: newGroupStage,
          grade: newGroupGrade,
          teacherId: newGroupTeacherId || undefined,
          schedule: newGroupSchedule,
          room: newGroupRoom,
          monthlyFee: Number(newGroupFee) || 0,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setShowAddGroupModal(false);
        setNewGroupName("");
        setNewGroupSchedule("");
        setNewGroupRoom("");
        fetchOverview();
      } else {
        setGroupMessage(json.error || "تعذر إنشاء المجموعة");
      }
    } catch {
      setGroupMessage("خطأ في الاتصال بالخادم");
    } finally {
      setSavingGroup(false);
    }
  };

  // Handle Transfer Student
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSubmitting(true);
    setTransferMessage("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "transfer_student",
          studentId: transferStudentId,
          fromGroupId: transferFromGroupId || undefined,
          toGroupId: transferToGroupId,
          reason: transferReason,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTransferMessage("تم نقل الطالب بنجاح مع الاحتفاظ بكافة سجلاته السابقة");
        setTimeout(() => {
          setShowTransferModal(false);
          setTransferMessage("");
          fetchOverview();
        }, 1200);
      } else {
        setTransferMessage(json.error || "تعذر نقل الطالب");
      }
    } catch {
      setTransferMessage("خطأ في الاتصال");
    } finally {
      setTransferSubmitting(false);
    }
  };

  // Handle Pause / Resume Student Membership
  const handlePauseResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPauseSubmitting(true);
    setPauseMessage("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: pauseActionType === "pause" ? "pause_student" : "resume_student",
          studentId: pauseStudentId,
          groupId: pauseGroupId,
          notes: pauseReason,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPauseMessage(json.message || "تم تحديث حالة اشتراك الطالب بنجاح");
        setTimeout(() => {
          setShowPauseModal(false);
          setPauseMessage("");
          fetchOverview();
        }, 1200);
      } else {
        setPauseMessage(json.error || "تعذر تحديث الاشتراك");
      }
    } catch {
      setPauseMessage("خطأ في الاتصال");
    } finally {
      setPauseSubmitting(false);
    }
  };

  // Handle Scan Submission
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerCode.trim()) return;

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "scan",
          scanCode: scannerCode.trim(),
          sessionDate: attendanceDate,
          sessionTitle,
          groupId: selectedGroup !== "all" ? selectedGroup : undefined,
          scanMethod: "qr",
        }),
      });
      const json = await res.json();
      setScanResult(json);
      setScannerCode("");
      fetchOverview();
    } catch (err) {
      setScanResult({ success: false, error: "تعذر الاتصال بماسح الحضور" });
    }
  };

  // Export Financial & Operational Report to CSV
  const exportFinancialReportCsv = () => {
    const headers = [
      "رقم العملية / الإيصال",
      "النوع",
      "البيان / الطالب",
      "المبلغ (ج.م)",
      "التصنيف / وسيلة الدفع",
      "التاريخ",
      "الحالة",
    ];
    const collectionRows = collections.map((c) => [
      c.receiptNumber,
      "تحصيل اشتراك سنتر",
      `"${(c.studentName || "").replace(/"/g, '""')}"`,
      c.amount,
      c.paymentMethod,
      c.collectedAt ? new Date(c.collectedAt).toISOString().split("T")[0] : "",
      c.status === "active" ? "معتمد" : "ملغي",
    ]);
    const expenseRows = expenses.map((e) => [
      e.expenseNumber,
      "مصروف تشغيلي",
      `"${(e.title || "").replace(/"/g, '""')}"`,
      `-${e.amount}`,
      e.categoryName || e.paymentMethod,
      e.expenseDate || "",
      e.status === "active" ? "معتمد" : "ملغي",
    ]);
    const allRows = [...collectionRows, ...expenseRows];
    const csvContent = "\uFEFF" + [headers.join(","), ...allRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `تقرير_مالية_السنتر_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-900/40 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/30">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Center Management System
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
                  Staging / Verified
                </span>
              </div>
              <h1 className="text-2xl font-black mt-1">Professional Center Management — إدارة السنتر الشاملة</h1>
              <p className="text-xs text-indigo-200/70">
                منظومة إدارة المجموعات، الحضور والغياب الذكي، التحصيل والإيصالات، والمصروفات التشغيلية المباشرة
              </p>
            </div>
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowCollectModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>تحصيل اشتراك وإصدار إيصال</span>
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مصروف تشغيلي</span>
            </button>
            <button
              onClick={fetchOverview}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION (10 MODULES) */}
        <div className="flex items-center gap-1.5 mt-6 overflow-x-auto pb-1 scrollbar-none border-t border-indigo-900/40 pt-4 text-xs font-bold">
          {[
            { id: "overview", label: "نظرة عامة (Overview)", icon: TrendingUp },
            { id: "groups", label: "المجموعات (Groups)", icon: Layers },
            { id: "students", label: "الطلاب (Students)", icon: Users },
            { id: "attendance", label: "الحضور (Attendance)", icon: QrCode },
            { id: "fees", label: "الاشتراكات (Fees)", icon: DollarSign },
            { id: "collections", label: "التحصيل والإيصالات (Collections)", icon: Receipt },
            { id: "expenses", label: "المصروفات (Expenses)", icon: Building2 },
            { id: "notifications", label: "إشعارات أولياء الأمور (Notifications)", icon: Send },
            { id: "reports", label: "التقارير (Reports)", icon: FileText },
            { id: "settings", label: "الإعدادات (Settings)", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & DASHBOARD KPIS
          ========================================================================= */}
      {subTab === "overview" && (
        <div className="space-y-6">
          {/* TOP 5 METRIC CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">الطلاب النشطون</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{kpis.activeStudents}</div>
              <span className="text-[10px] text-indigo-500 font-semibold">{kpis.activeGroups} مجموعات دراسية</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">حضور اليوم</span>
              <div className="text-2xl font-black text-emerald-600">{kpis.todayPresent}</div>
              <span className="text-[10px] text-slate-400">
                غياب: <b className="text-rose-500">{kpis.todayAbsent}</b> • تأخير:{" "}
                <b className="text-amber-500">{kpis.todayLate}</b>
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">تحصيلات اليوم</span>
              <div className="text-2xl font-black text-indigo-600">{kpis.todayCollections} <span className="text-xs">ج.م</span></div>
              <span className="text-[10px] text-emerald-600 font-semibold">إجمالي الشهر: {kpis.monthCollections} ج.م</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">المصروفات التشغيلية</span>
              <div className="text-2xl font-black text-rose-600">{kpis.monthExpenses} <span className="text-xs">ج.م</span></div>
              <span className="text-[10px] text-slate-400">إيجار، فواتير، مرتبات السنتر</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 md:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">صافي نتيجة التشغيل</span>
              <div className={`text-2xl font-black ${Number(kpis.netOperationalResult) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {kpis.netOperationalResult} <span className="text-xs">ج.م</span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate" title="إيرادات السنتر - المصروفات المباشرة">
                التحصيل - المصروفات
              </span>
            </div>
          </div>

          {/* FINANCIAL SUMMARY & ATTENDANCE PROGRESS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FINANCIAL HEALTH */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <span>الموقف المالي لتشغيل السنتر لشهر ({selectedMonth})</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  عزل تام عن كورسات المنصة
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 mb-4 text-center">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">إجمالي اشتراكات السنتر المحصلة</span>
                  <div className="text-xl font-black text-emerald-600">{kpis.monthCollections} ج.م</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">المصروفات التشغيلية المباشرة</span>
                  <div className="text-xl font-black text-rose-600">{kpis.monthExpenses} ج.م</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">إجمالي الأرصدة المتأخرة</span>
                  <div className="text-xl font-black text-amber-500">{kpis.totalOverdue} ج.م</div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                💡 <b>ملاحظة محاسبية دقيقة:</b> صافي نتيجة التشغيل يمثل الفرق بين تحصيلات اشتراكات السنتر والمصروفات
                المسجلة في الدفتر التشغيلي، ولا يعد أرباحاً محاسبية نهائية إلا بعد تسوية كافة الالتزامات والعهد الدورية.
              </p>
            </div>

            {/* QUICK ACTIONS & SCANNER SHORTCUT */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-500" />
                  <span>تسجيل حضور فوري</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  امسح رمز QR للطالب أو أدخل كود الدخول المسجل للتحضير الآني وإرسال إشعار ولي الأمر.
                </p>

                <form onSubmit={handleScanSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={scannerCode}
                    onChange={(e) => setScannerCode(e.target.value)}
                    placeholder="امسح الـ QR أو اكتب الكود..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all"
                  >
                    تسجيل الحضور الآن
                  </button>
                </form>

                {scanResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs font-bold ${
                      scanResult.success
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    }`}
                  >
                    {scanResult.message || scanResult.error}
                    {scanResult.student && (
                      <div className="mt-1 font-semibold">الطالب: {scanResult.student.name}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">تاريخ الحصة:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{attendanceDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GROUPS MANAGEMENT
          ========================================================================= */}
      {subTab === "groups" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">المجموعات الدراسية بالسنتر</h3>
              <p className="text-xs text-slate-400">قائمة المجموعات المعتمدة، مواعيد الحصص، القاعات، وقيمة الاشتراك الشهري</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddGroupModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مجموعة جديدة</span>
              </button>
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>نقل طالب بين المجموعات</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.map((grp) => (
              <div
                key={grp.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {grp.grade}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${grp.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">{grp.name}</h4>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>المدرس: <b className="text-slate-800 dark:text-slate-200">{grp.teacherName || "مستر حبيب الرحمن"}</b></div>
                  <div>الموعد: <b className="text-slate-800 dark:text-slate-200">{grp.schedule || "غير محدد"}</b></div>
                  <div>القاعة: <b className="text-slate-800 dark:text-slate-200">{grp.room || "القاعة الكبرى"}</b></div>
                  <div>الاشتراك: <b className="text-emerald-600 dark:text-emerald-400 font-black">{grp.monthlyFee} ج.م / شهر</b></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STUDENTS MANAGEMENT
          ========================================================================= */}
      {subTab === "students" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">قائمة طلاب السنتر</h3>
              <p className="text-xs text-slate-400">بيانات الطلاب، المجموعات المقيدين بها، وأكواد QR المشفرة للدخول</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="بحث بالاسم أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shadow"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>نقل طالب</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">كود الطالب</th>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">الصف الدراسي</th>
                  <th className="p-3">المجموعة</th>
                  <th className="p-3">هاتف الطالب</th>
                  <th className="p-3">هاتف ولي الأمر</th>
                  <th className="p-3">رمز QR الآمن</th>
                  <th className="p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {students
                  .filter((s) => !searchTerm || s.name?.includes(searchTerm) || String(s.studentCode)?.includes(searchTerm))
                  .slice(0, 50)
                  .map((st) => {
                    const grp = groups.find((g) => g.id === st.groupId);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-indigo-600">{st.studentCode || `PA-${st.id.slice(-4)}`}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                        <td className="p-3 text-slate-500">{st.grade}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{grp?.name || st.groupId || "عام"}</td>
                        <td className="p-3 font-mono text-slate-500">{st.phone || "-"}</td>
                        <td className="p-3 font-mono text-slate-500">{st.parentPhone || "-"}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-400 truncate max-w-[130px]">
                          {st.qrCode || `wld_qr_${st.id.slice(-8)}`}
                        </td>
                        <td className="p-3 flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setTransferStudentId(st.id);
                              setTransferFromGroupId(st.groupId || "");
                              setShowTransferModal(true);
                            }}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-bold"
                            title="نقل لمجموعة أخرى"
                          >
                            نقل
                          </button>
                          <button
                            onClick={() => {
                              setPauseStudentId(st.id);
                              setPauseGroupId(st.groupId || "");
                              setShowPauseModal(true);
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold"
                            title="إيقاف أو استئناف الاشتراك"
                          >
                            إيقاف/تنشيط
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ATTENDANCE WORKSPACE (EMBEDDED)
          ========================================================================= */}
      {subTab === "attendance" && (
        <div className="space-y-4">
          <AttendanceWorkspace />
        </div>
      )}

      {/* =========================================================================
          TAB 5: FEES & INVOICES
          ========================================================================= */}
      {subTab === "fees" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">مطالبات وااشتراكات الطلاب الشهرية</h3>
              <p className="text-xs text-slate-400">سجل اشتراكات المجموعات، الخصومات المعتمدة، والأرصدة المستحقة</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">الطالب</th>
                  <th className="p-3">المجموعة</th>
                  <th className="p-3">الشهر</th>
                  <th className="p-3">الاشتراك الأساسي</th>
                  <th className="p-3">الخصم</th>
                  <th className="p-3">المستحق</th>
                  <th className="p-3">المدفوع</th>
                  <th className="p-3">المتبقي</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{inv.studentName}</td>
                    <td className="p-3 text-slate-500">{inv.groupName}</td>
                    <td className="p-3 font-mono">{inv.billingMonth}</td>
                    <td className="p-3 font-mono">{inv.baseFee} ج.م</td>
                    <td className="p-3 font-mono text-amber-500">{inv.discountAmount} ج.م</td>
                    <td className="p-3 font-mono font-bold">{inv.netDue} ج.م</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{inv.paidAmount} ج.م</td>
                    <td className="p-3 font-mono font-bold text-rose-500">{inv.remainingAmount} ج.م</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          inv.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : inv.status === "partial"
                            ? "bg-amber-100 text-amber-700"
                            : inv.status === "waived"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {inv.status === "paid"
                          ? "مسدد بالكامل"
                          : inv.status === "partial"
                          ? "مسدد جزئياً"
                          : inv.status === "waived"
                          ? "معفى"
                          : "غير مسدد"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: COLLECTIONS & OFFICIAL RECEIPTS
          ========================================================================= */}
      {subTab === "collections" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">دفتر التحصيلات وسندات القبض</h3>
              <p className="text-xs text-slate-400">سجل الإيصالات الرسمية المتسلسلة لطرق الدفع (نقدي، فودافون كاش، انستاباي)</p>
            </div>
            <button
              onClick={() => setShowCollectModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار إيصال تحصيل جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">رقم الإيصال</th>
                  <th className="p-3">الطالب</th>
                  <th className="p-3">المجموعة</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">طريقة الدفع</th>
                  <th className="p-3">تاريخ ووقت التحصيل</th>
                  <th className="p-3">الموظف المسؤول</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-indigo-600">{col.receiptNumber}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{col.studentName}</td>
                    <td className="p-3 text-slate-500">{col.groupName}</td>
                    <td className="p-3 font-mono font-black text-emerald-600">{col.amount} ج.م</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                      {col.paymentMethod === "cash"
                        ? "نقدي بالسنتر"
                        : col.paymentMethod === "vodafone_cash"
                        ? "فودافون كاش"
                        : col.paymentMethod === "instapay"
                        ? "انستاباي"
                        : col.paymentMethod}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {new Date(col.collectedAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-slate-500">{col.collectedBy}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          col.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {col.status === "active" ? "معتمد" : "ملغي"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedReceipt(col)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: OPERATING EXPENSES (MODULE 3)
          ========================================================================= */}
      {subTab === "expenses" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">دفتر المصروفات التشغيلية للسنتر</h3>
              <p className="text-xs text-slate-400">إيجار السنتر، فواتير الكهرباء والإنترنت، مرتبات المعلمين والمشرفين، ونثريات الصيانة</p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مصروف جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">رقم العملية</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">بيان المصروف</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">طريقة الدفع</th>
                  <th className="p-3">المستلم / المورد</th>
                  <th className="p-3">الموظف المسجل</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-rose-600">{exp.expenseNumber}</td>
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{exp.categoryName}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{exp.title}</td>
                    <td className="p-3 font-mono font-black text-rose-600">{exp.amount} ج.م</td>
                    <td className="p-3 font-mono text-slate-500">{exp.expenseDate}</td>
                    <td className="p-3 text-slate-500">{exp.paymentMethod}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{exp.recipientVendor || "-"}</td>
                    <td className="p-3 text-slate-500">{exp.recordedBy}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {exp.status === "active" ? "معتمد" : "ملغي"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: PARENT CONNECT NOTIFICATIONS (EMBEDDED)
          ========================================================================= */}
      {subTab === "notifications" && (
        <div className="space-y-4">
          <ParentConnectAdminHub />
        </div>
      )}

      {/* =========================================================================
          TAB 9: CENTER COMPREHENSIVE REPORTS
          ========================================================================= */}
      {subTab === "reports" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>التقارير المالية والتشغيلية المجمعة — سنتر الوليد</span>
              </h3>
              <p className="text-xs text-slate-400">ملخص الإيرادات المحصلة، المصروفات التشغيلية المباشرة، صافي نتيجة التشغيل، ونسب الحضور</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
              <button
                onClick={exportFinancialReportCsv}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>تصدير إلى Excel / CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة التقرير الشامل</span>
              </button>
            </div>
          </div>

          {/* FINANCIAL SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mb-1">إجمالي اشتراكات السنتر المحصلة</span>
              <div className="text-2xl font-black text-emerald-600">{kpis.monthCollections} ج.م</div>
              <span className="text-[10px] text-emerald-500">{collections.length} عمليات تحصيل</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-bold block mb-1">المصروفات التشغيلية المباشرة</span>
              <div className="text-2xl font-black text-rose-600">{kpis.monthExpenses} ج.م</div>
              <span className="text-[10px] text-rose-500">{expenses.length} بنود مصروفات</span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
              <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold block mb-1">صافي نتيجة التشغيل (Net)</span>
              <div className={`text-2xl font-black ${Number(kpis.netOperationalResult) >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600"}`}>
                {kpis.netOperationalResult} ج.م
              </div>
              <span className="text-[10px] text-indigo-500">التحصيل - المصروفات</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold block mb-1">إجمالي المتأخرات والديون</span>
              <div className="text-2xl font-black text-amber-600">{kpis.totalOverdue} ج.م</div>
              <span className="text-[10px] text-amber-500">اشتراكات مستحقة غير مسددة</span>
            </div>
          </div>

          {/* GROUPS ATTENDANCE SUMMARY */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">مؤشرات الحضور حسب المجموعات الدراسية</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {groups.map((grp) => {
                const groupStudents = students.filter((s) => s.groupId === grp.id);
                return (
                  <div key={grp.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{grp.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>الطلاب المقيدون: {groupStudents.length}</span>
                      <span className="font-mono text-emerald-600 font-bold">{grp.monthlyFee} ج.م</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 10: CENTER OPERATIONAL SETTINGS
          ========================================================================= */}
      {subTab === "settings" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <span>إعدادات تشغيل السنتر وقنوات الاتصال</span>
            </h3>
            <p className="text-xs text-slate-400">تهيئة بيئة السنتر، ضوابط الحضور، سياسات الاشتراكات، وحالة قنوات التواصل السحابية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SYSTEM STATUS CARD */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>حالة خوادم وقنوات المنظومة السحابية</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">قاعدة بيانات Neon Staging</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    staging-alwaled (ep-young-recipe-b2v76h2n)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">واتساب بيزنس السحابي (WhatsApp Cloud API)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    v21.0 جاهز ومفعل
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">بوت تليجرام الرسمي (@ProfessionalAcademyBot)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    نشط ومرتبط
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">تسلسل أرقام الإيصالات (Receipt Generator)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    PA-REC-YYYYMM-XXXX
                  </span>
                </div>
              </div>
            </div>

            {/* ATTENDANCE & FEE RULES */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>ضوابط وسياسات الحضور والاشتراك</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">فترة السماح قبل احتساب التأخير (Grace Period):</label>
                  <input
                    type="text"
                    disabled
                    value="15 دقيقة بعد موعد بدء الحصة"
                    className="w-full px-3 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">منع تكرار الحضور (Deduplication Check):</label>
                  <input
                    type="text"
                    disabled
                    value="مفعل تلقائياً (منع مسح الطالب مرتين في نفس الحصة)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">الاشتراك الافتراضي للثانوية العامة:</label>
                  <input
                    type="text"
                    disabled
                    value="300.00 ج.م شهرياً"
                    className="w-full px-3 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD GROUP
          ========================================================================= */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                <span>إضافة مجموعة دراسية جديدة بالسنتر</span>
              </h3>
              <button onClick={() => setShowAddGroupModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {groupMessage && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">{groupMessage}</div>
            )}

            <form onSubmit={handleAddGroupSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">اسم المجموعة:</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="مثال: مجموعة السبت 4 عصراً - ثالثة ثانوي"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">المرحلة:</label>
                  <select
                    value={newGroupStage}
                    onChange={(e) => setNewGroupStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Secondary">ثانوي (Secondary)</option>
                    <option value="Preparatory">إعدادي (Preparatory)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الصف الدراسي:</label>
                  <select
                    value={newGroupGrade}
                    onChange={(e) => setNewGroupGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Third Secondary (Baccalaureate)">الثالث الثانوي (ثانوية عامة)</option>
                    <option value="Second Secondary">الثاني الثانوي</option>
                    <option value="First Secondary">الأول الثانوي</option>
                    <option value="Third Prep">الثالث الإعدادي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الموعد / الجدول:</label>
                  <input
                    type="text"
                    value={newGroupSchedule}
                    onChange={(e) => setNewGroupSchedule(e.target.value)}
                    placeholder="مثال: السبت والثلاثاء 4 م"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">القاعة:</label>
                  <input
                    type="text"
                    value={newGroupRoom}
                    onChange={(e) => setNewGroupRoom(e.target.value)}
                    placeholder="مثال: قاعة 1 الكبرى"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">قيمة الاشتراك الشهري (ج.م):</label>
                <input
                  type="number"
                  min="0"
                  value={newGroupFee}
                  onChange={(e) => setNewGroupFee(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingGroup}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow"
                >
                  {savingGroup ? "جاري الحفظ..." : "حفظ المجموعة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TRANSFER STUDENT
          ========================================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                <span>نقل طالب بين المجموعات الدراسية</span>
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {transferMessage && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                {transferMessage}
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">اختر الطالب:</label>
                <select
                  value={transferStudentId}
                  onChange={(e) => {
                    setTransferStudentId(e.target.value);
                    const st = students.find((s) => s.id === e.target.value);
                    if (st?.groupId) setTransferFromGroupId(st.groupId);
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">-- حدد الطالب --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || s.id.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">من المجموعة الحالية:</label>
                  <select
                    value={transferFromGroupId}
                    onChange={(e) => setTransferFromGroupId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="">-- تلقائي / المجموعة الحالية --</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">إلى المجموعة الجديدة:</label>
                  <select
                    value={transferToGroupId}
                    onChange={(e) => setTransferToGroupId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="">-- اختر المجموعة الجديدة --</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.monthlyFee} ج.م)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">سبب النقل:</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="مثال: تعارض جدول المدرسة أو طلب ولي الأمر"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 leading-relaxed">
                💡 <b>ضمان سلامة السجلات:</b> سيتم نقل الطالب للمجموعة الجديدة للمستقبل، مع بقاء كافة سجلات الحضور السابقة
                مرتبطة بمجموعته القديمة بنسبة 100% دون مساس.
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={transferSubmitting}
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow"
                >
                  {transferSubmitting ? "جاري النقل..." : "تأكيد النقل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PAUSE / RESUME STUDENT
          ========================================================================= */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PauseCircle className="w-5 h-5 text-indigo-500" />
                <span>إيقاف أو استئناف اشتراك طالب بمجموعة</span>
              </h3>
              <button onClick={() => setShowPauseModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {pauseMessage && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                {pauseMessage}
              </div>
            )}

            <form onSubmit={handlePauseResumeSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">اختر الطالب:</label>
                <select
                  value={pauseStudentId}
                  onChange={(e) => {
                    setPauseStudentId(e.target.value);
                    const st = students.find((s) => s.id === e.target.value);
                    if (st?.groupId) setPauseGroupId(st.groupId);
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">-- حدد الطالب --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || s.id.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">المجموعة:</label>
                  <select
                    value={pauseGroupId}
                    onChange={(e) => setPauseGroupId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="">-- حدد المجموعة --</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الإجراء المطلوب:</label>
                  <select
                    value={pauseActionType}
                    onChange={(e) => setPauseActionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="pause">إيقاف مؤقت (Pause)</option>
                    <option value="resume">استئناف وتنشيط (Resume)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات الإدارة:</label>
                <input
                  type="text"
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="سبب الإيقاف أو الاستئناف..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPauseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={pauseSubmitting}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow"
                >
                  {pauseSubmitting ? "جاري الحفظ..." : "تأكيد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: COLLECT FEE ON THE SPOT
          ========================================================================= */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <span>تحصيل اشتراك وإصدار إيصال قبض رسمي</span>
              </h3>
              <button onClick={() => setShowCollectModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {collectMessage && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                {collectMessage}
              </div>
            )}

            <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">اختر الطالب:</label>
                <select
                  value={collectStudentId}
                  onChange={(e) => {
                    setCollectStudentId(e.target.value);
                    const st = students.find((s) => s.id === e.target.value);
                    if (st?.groupId) setCollectGroupId(st.groupId);
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">-- حدد الطالب من القائمة --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || s.id.slice(-4)}) - {s.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">المجموعة الدراسية:</label>
                <select
                  value={collectGroupId}
                  onChange={(e) => setCollectGroupId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">-- حدد المجموعة --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.monthlyFee} ج.م)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">المبلغ المحصل (ج.م):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    placeholder="مثال: 250"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">وسيلة الدفع:</label>
                  <select
                    value={collectMethod}
                    onChange={(e) => setCollectMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="cash">نقدي بالسنتر (Cash)</option>
                    <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                    <option value="instapay">انستاباي (InstaPay)</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">رقم مرجع التحويل (إن وجد):</label>
                <input
                  type="text"
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  placeholder="رقم عملية فودافون كاش أو انستاباي"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات التحصيل:</label>
                <textarea
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  placeholder="أي ملاحظات تخص هذه الدفعة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={collectSubmitting}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg"
                >
                  {collectSubmitting ? "جاري الإصدار..." : "تأكيد التحصيل وإصدار الإيصال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD OPERATING EXPENSE
          ========================================================================= */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-500" />
                <span>تسجيل مصروف تشغيلي مباشر</span>
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">بيان المصروف:</label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="مثال: فاتورة كهرباء شهر نوفمبر"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">التصنيف:</label>
                <select
                  value={expCatId}
                  onChange={(e) => setExpCatId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">-- اختر التصنيف --</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">المبلغ (ج.م):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="مثال: 1500"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">طريقة الدفع:</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="cash">نقدي (Cash)</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                    <option value="instapay">انستاباي</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">المستلم / المورد:</label>
                <input
                  type="text"
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  placeholder="اسم الشخص أو الشركة المستلمة"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات إضافية:</label>
                <textarea
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg"
                >
                  تسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINTABLE RECEIPT MODAL
          ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-slate-900 border border-slate-200 space-y-6">
            <div className="text-center border-b border-slate-200 pb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block">
                Official Tuition Receipt
              </span>
              <h2 className="text-xl font-black text-slate-900">Professional Academy</h2>
              <p className="text-xs text-slate-500">سنتر مستر حبيب الرحمن التعليمي</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-100 font-mono text-xs font-black text-slate-700">
                {selectedReceipt.receiptNumber}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">اسم الطالب:</span>
                <span className="font-bold">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">المجموعة:</span>
                <span className="font-semibold">{selectedReceipt.groupName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">الشهر المستحق:</span>
                <span className="font-mono">{selectedReceipt.billingMonth}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">المبلغ المدفوع:</span>
                <span className="font-mono text-base font-black text-emerald-600">{selectedReceipt.amount} ج.م</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-400">طريقة الدفع:</span>
                <span className="font-semibold">{selectedReceipt.paymentMethod}</span>
              </div>
              {selectedReceipt.remainingAmount && (
                <div className="flex justify-between border-b border-slate-100 py-1.5">
                  <span className="text-slate-400">الرصيد المتبقي:</span>
                  <span className="font-mono font-bold text-rose-500">{selectedReceipt.remainingAmount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">التاريخ:</span>
                <span className="font-mono text-slate-500">
                  {selectedReceipt.collectedAt
                    ? new Date(selectedReceipt.collectedAt).toLocaleDateString("ar-EG")
                    : new Date().toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الإيصال (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
