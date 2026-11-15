"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import {
  Users,
  MessageSquare,
  Send,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Share2,
  Copy,
  Check,
  Filter,
  Layers,
  Settings,
  Bot,
  ExternalLink,
  ChevronRight,
  UserCheck,
  FileText,
  Radio,
} from "lucide-react";

export const ParentConnectAdminHub: React.FC<{ onOpenReportForStudent?: (studentId: string) => void }> = ({
  onOpenReportForStudent,
}) => {
  const { lang, user } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<"parents" | "logs" | "broadcast" | "templates">("parents");

  // Parents Directory State
  const [parents, setParents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    verifiedWhatsAppCount: 0,
    linkedTelegramCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add / Edit Parent Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParentName, setNewParentName] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("+20");
  const [newSecondaryPhone, setNewSecondaryPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("Father");
  const [newPreferredChannel, setNewPreferredChannel] = useState("whatsapp");
  const [newStudentId, setNewStudentId] = useState("");
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [savingParent, setSavingParent] = useState(false);

  // Telegram Pairing Modal State
  const [pairingModal, setPairingModal] = useState<{
    parentName: string;
    code: string;
    deepLink: string;
    botUsername: string;
  } | null>(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Direct Note Modal State
  const [directMessageModal, setDirectMessageModal] = useState<{
    parentId: string;
    parentName: string;
    parentPhone: string;
    studentId?: string;
    studentName?: string;
  } | null>(null);
  const [directMsgText, setDirectMsgText] = useState("");
  const [sendingDirectMsg, setSendingDirectMsg] = useState(false);
  const [directMsgFeedback, setDirectMsgFeedback] = useState<string | null>(null);

  // Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [logStats, setLogStats] = useState<any>({});
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilterChannel, setLogFilterChannel] = useState<string>("all");
  const [logFilterStatus, setLogFilterStatus] = useState<string>("all");

  // Bulk Broadcast State
  const [broadcastAudience, setBroadcastAudience] = useState<"all" | "sec3" | "prep" | "selected">("all");
  const [broadcastChannel, setBroadcastChannel] = useState<"whatsapp" | "telegram" | "all">("all");
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  // Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Fetch Parents Directory
  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parent-connect/parents?q=${encodeURIComponent(searchQuery)}`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json();
      if (res.ok && data.parents) {
        setParents(data.parents);
        setStats({
          total: data.total || 0,
          verifiedWhatsAppCount: data.verifiedWhatsAppCount || 0,
          linkedTelegramCount: data.linkedTelegramCount || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch parents:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const chParam = logFilterChannel !== "all" ? `&channel=${logFilterChannel}` : "";
      const stParam = logFilterStatus !== "all" ? `&status=${logFilterStatus}` : "";
      const res = await fetch(`/api/parent-connect/dispatch?limit=100${chParam}${stParam}`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
        setLogStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch Templates
  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/parent-connect/templates", { headers: { ...authHeaders() } });
      const data = await res.json();
      if (res.ok && data.templates) {
        setTemplates(data.templates);
      }
    } catch {}
  };

  // Fetch students for linking dropdown
  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin", { headers: { ...authHeaders() } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setAvailableStudents(data.users.filter((u: any) => u.role === "student"));
      }
    } catch {}
  };

  useEffect(() => {
    fetchParents();
    fetchStudents();
    fetchTemplates();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchParents();
    }, 300);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, logFilterChannel, logFilterStatus]);

  // Handle Save New Parent
  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentName.trim() || !newParentPhone.trim()) return;
    setSavingParent(true);
    try {
      const res = await fetch("/api/parent-connect/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          fullName: newParentName,
          primaryPhone: newParentPhone,
          secondaryPhone: newSecondaryPhone,
          preferredChannel: newPreferredChannel,
          relationship: newRelationship,
          studentId: newStudentId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setNewParentName("");
        setNewParentPhone("+20");
        setNewSecondaryPhone("");
        setNewStudentId("");
        fetchParents();
      } else {
        alert(data.error || "فشل في حفظ البيانات");
      }
    } catch {
      alert("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setSavingParent(false);
    }
  };

  // Generate Telegram Pairing Code
  const handleGenerateTelegramPairing = async (parent: any) => {
    setPairingLoading(true);
    try {
      const res = await fetch("/api/parent-connect/telegram-pair", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ parentId: parent.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPairingModal({
          parentName: parent.fullName,
          code: data.pairingCode,
          deepLink: data.deepLink,
          botUsername: data.botUsername,
        });
        fetchParents();
      } else {
        alert(data.error || "تعذر توليد كود الربط");
      }
    } catch {
      alert("خطأ في الاتصال بالخادم");
    } finally {
      setPairingLoading(false);
    }
  };

  // Send Direct Message
  const handleSendDirectMessage = async () => {
    if (!directMessageModal || !directMsgText.trim()) return;
    setSendingDirectMsg(true);
    setDirectMsgFeedback(null);
    try {
      const res = await fetch("/api/parent-connect/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "send_direct_message",
          parentId: directMessageModal.parentId,
          studentId: directMessageModal.studentId,
          messageText: directMsgText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDirectMsgFeedback(
          data.isMock
            ? "✅ تم تسجيل إرسال الرسالة بنجاح (وضع الاختبار التجريبي Sandbox Mock)"
            : "✅ تم إرسال الرسالة إلى ولي الأمر بنجاح!"
        );
        setTimeout(() => {
          setDirectMessageModal(null);
          setDirectMsgText("");
          setDirectMsgFeedback(null);
          fetchLogs();
        }, 2000);
      } else {
        setDirectMsgFeedback(`❌ ${data.error || "فشل الإرسال"}`);
      }
    } catch {
      setDirectMsgFeedback("❌ خطأ في الاتصال بالخادم");
    } finally {
      setSendingDirectMsg(false);
    }
  };

  // Execute Bulk Broadcast
  const handleSendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setBroadcasting(true);
    setBroadcastResult(null);

    // Filter recipients based on audience
    let targetIds: string[] = [];
    if (broadcastAudience === "all") {
      targetIds = parents.map((p) => p.id);
    } else if (broadcastAudience === "sec3") {
      targetIds = parents
        .filter((p) => p.students?.some((s: any) => s.studentGrade?.includes("Third") || s.studentGrade?.includes("الثالث")))
        .map((p) => p.id);
    } else if (broadcastAudience === "prep") {
      targetIds = parents
        .filter((p) => p.students?.some((s: any) => s.studentStage?.includes("Prep") || s.studentStage?.includes("الإعدادية")))
        .map((p) => p.id);
    } else {
      targetIds = parents.slice(0, 10).map((p) => p.id);
    }

    if (targetIds.length === 0) {
      alert("لا يوجد أولياء أمور مسجلين في هذه الفئة المستهدفة");
      setBroadcasting(false);
      return;
    }

    try {
      const res = await fetch("/api/parent-connect/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "send_bulk_broadcast",
          recipientParentIds: targetIds,
          channel: broadcastChannel,
          messageText: broadcastText,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastResult(data);
        setBroadcastText("");
        fetchLogs();
      } else {
        alert(data.error || "فشل إرسال البث الجماعي");
      }
    } catch {
      alert("خطأ في الاتصال بالخادم");
    } finally {
      setBroadcasting(false);
    }
  };

  // Save Template Edit
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/parent-connect/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          code: editingTemplate.code,
          bodyTextAr: editingTemplate.bodyTextAr,
          metaTemplateName: editingTemplate.metaTemplateName,
          isActive: editingTemplate.isActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        alert(data.error || "فشل حفظ التعديلات");
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & STATUS BAR */}
      <div className="bg-gradient-to-r from-[#190d3d] via-[#12082b] to-[#190d3d] rounded-3xl p-6 border border-purple-800/40 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "ar" ? "نظام التواصل الذكي مع أولياء الأمور" : "Parent Connect Smart Suite"}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {lang === "ar" ? "منظومة Parent Connect — إشعارات WhatsApp و Telegram" : "Parent Connect — WhatsApp & Telegram Hub"}
            </h2>
            <p className="text-xs md:text-sm text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
              {lang === "ar"
                ? "ربط حسابات الطلاب بأرقام أولياء الأمور، وإرسال إشعارات الحضور والغياب الفورية ونتائج الاختبارات والتقارير الأسبوعية والشهرية تلقائياً عبر Meta WhatsApp Cloud API و Telegram Bot."
                : "Automatic attendance alerts, exam results, and smart performance reports dispatched via Meta WhatsApp Cloud API & Telegram Bot."}
            </p>
          </div>

          {/* API Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-purple-200">WhatsApp:</span>
              <span className="font-mono text-emerald-300 font-bold">
                {logStats.isWhatsAppLive ? "Meta Cloud API Live" : "Sandbox Test Mode"}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="font-bold text-purple-200">Telegram:</span>
              <span className="font-mono text-sky-300 font-bold">
                {logStats.isTelegramLive ? "Bot API Live" : "Sandbox Test Mode"}
              </span>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-900/40">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-800/30 text-center">
            <span className="text-[11px] font-bold text-purple-300 block mb-0.5">
              {lang === "ar" ? "أولياء الأمور المرتبطين" : "Linked Parents"}
            </span>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-800/30 text-center">
            <span className="text-[11px] font-bold text-emerald-400 block mb-0.5">
              {lang === "ar" ? "أرقام WhatsApp الموثقة" : "Verified WhatsApp"}
            </span>
            <p className="text-2xl font-black text-emerald-400">{stats.verifiedWhatsAppCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-800/30 text-center">
            <span className="text-[11px] font-bold text-sky-400 block mb-0.5">
              {lang === "ar" ? "حسابات Telegram المفعلة" : "Linked Telegram"}
            </span>
            <p className="text-2xl font-black text-sky-400">{stats.linkedTelegramCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-800/30 text-center">
            <span className="text-[11px] font-bold text-amber-400 block mb-0.5">
              {lang === "ar" ? "نسبة نجاح التسليم" : "Delivery Success"}
            </span>
            <p className="text-2xl font-black text-amber-400">{logStats.successRate || 100}%</p>
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION BAR */}
      <div className="bg-white dark:bg-[#100a26] p-2 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("parents")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "parents"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-950/40"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "أولياء الأمور والطلاب" : "Parents & Students"}</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-950/40"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "سجل الرسائل والإشعارات" : "Notification Logs"}</span>
          </button>

          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "broadcast"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-950/40"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "رسائل وبث جماعي" : "Bulk Broadcast"}</span>
          </button>

          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "templates"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-950/40"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "قوالب الرسائل والإعدادات" : "Templates & Settings"}</span>
          </button>
        </div>

        {activeTab === "parents" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "إضافة ولي أمر جديد" : "Add Parent Profile"}</span>
          </button>
        )}
      </div>

      {/* 3. TAB 1: PARENTS DIRECTORY */}
      {activeTab === "parents" && (
        <div className="space-y-4">
          {/* Search Filter Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ar" ? "بحث باسم ولي الأمر، أو رقم الهاتف، أو اسم الطالب..." : "Search by parent name, phone, or student..."}
              className="w-full bg-white dark:bg-[#100a26] border border-slate-200 dark:border-purple-900/40 rounded-2xl py-2.5 px-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 shadow-sm"
            />
          </div>

          {/* Parents Grid */}
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400 font-bold">
              {lang === "ar" ? "جارِ تحميل دليل أولياء الأمور..." : "Loading directory..."}
            </div>
          ) : parents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parents.map((parent) => (
                <div
                  key={parent.id}
                  className="bg-white dark:bg-[#12082b] border border-slate-200 dark:border-purple-900/40 rounded-3xl p-5 shadow-lg space-y-3.5 flex flex-col justify-between"
                >
                  {/* Parent Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {parent.fullName}
                        </h4>
                        <a
                          href={`https://wa.me/${parent.primaryPhone.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{parent.primaryPhone}</span>
                        </a>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800/40">
                        {parent.preferredChannel === "both"
                          ? "WhatsApp & Telegram"
                          : parent.preferredChannel === "telegram"
                          ? "Telegram"
                          : "WhatsApp"}
                      </span>
                    </div>

                    {/* Linked Students Badges */}
                    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-purple-900/30">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {lang === "ar" ? "الطلاب المرتبطين:" : "Linked Students:"}
                      </span>
                      {parent.students && parent.students.length > 0 ? (
                        parent.students.map((st: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/30 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {st.studentName}
                              </span>
                              <span className="text-[10px] text-purple-600 dark:text-purple-300">
                                {st.studentGrade || "الثانوية العامة"} • {st.relationship || "Guardian"}
                              </span>
                            </div>

                            {onOpenReportForStudent && (
                              <button
                                onClick={() => onOpenReportForStudent(st.studentId)}
                                className="p-1 rounded-lg hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-400 text-[10px] font-bold transition-all"
                                title="عرض التقرير الذكي"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic block">
                          {lang === "ar" ? "لا يوجد طالب مرتبط حالياً" : "No student linked"}
                        </span>
                      )}
                    </div>

                    {/* Telegram Status */}
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-purple-900/30">
                      <span className="text-slate-500 dark:text-purple-300 flex items-center gap-1 text-[11px]">
                        <Bot className="w-3.5 h-3.5 text-sky-400" />
                        <span>Telegram:</span>
                      </span>

                      {parent.telegram?.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{lang === "ar" ? "مرتبط ونشط" : "Linked"}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerateTelegramPairing(parent)}
                          disabled={pairingLoading}
                          className="text-[10px] font-bold text-sky-500 hover:text-sky-400 hover:underline flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>{lang === "ar" ? "توليد كود ربط" : "Pair Bot"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-purple-900/30 flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        setDirectMessageModal({
                          parentId: parent.id,
                          parentName: parent.fullName,
                          parentPhone: parent.primaryPhone,
                          studentId: parent.students?.[0]?.studentId,
                          studentName: parent.students?.[0]?.studentName,
                        })
                      }
                      className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-700 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-600 dark:hover:text-white border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{lang === "ar" ? "مراسلة مباشرة" : "Direct Message"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-[#100a26] rounded-3xl border border-slate-200 dark:border-purple-900/40 p-8 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {lang === "ar" ? "لم يتم العثور على أولياء أمور يطابقون البحث" : "No parents found"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#100a26] p-3 rounded-2xl border border-slate-200 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-bold text-slate-700 dark:text-purple-200">
                {lang === "ar" ? "تصفية السجل:" : "Filter Logs:"}
              </span>

              <select
                value={logFilterChannel}
                onChange={(e) => setLogFilterChannel(e.target.value)}
                className="bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800/40 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">{lang === "ar" ? "كل القنوات" : "All Channels"}</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
              </select>

              <select
                value={logFilterStatus}
                onChange={(e) => setLogFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800/40 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="all">{lang === "ar" ? "كل الحالات" : "All Statuses"}</option>
                <option value="sent">{lang === "ar" ? "مرسل" : "Sent"}</option>
                <option value="delivered">{lang === "ar" ? "تم التسليم" : "Delivered"}</option>
                <option value="read">{lang === "ar" ? "تمت القراءة" : "Read"}</option>
                <option value="failed">{lang === "ar" ? "فشل الإرسال" : "Failed"}</option>
              </select>
            </div>

            <button
              onClick={fetchLogs}
              disabled={logsLoading}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-purple-950/60 hover:bg-slate-200 text-slate-600 dark:text-purple-300 transition-all"
              title="تحديث السجل"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-[#100a26] rounded-3xl border border-slate-200 dark:border-purple-900/40 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 dark:bg-purple-950/50 text-slate-700 dark:text-purple-300 uppercase text-[10px] font-black border-b border-slate-200 dark:border-purple-900/40">
                  <tr>
                    <th className="p-3.5">{lang === "ar" ? "التاريخ / الوقت" : "Timestamp"}</th>
                    <th className="p-3.5">{lang === "ar" ? "القناة" : "Channel"}</th>
                    <th className="p-3.5">{lang === "ar" ? "ولي الأمر / المستلم" : "Recipient"}</th>
                    <th className="p-3.5">{lang === "ar" ? "الطالب" : "Student"}</th>
                    <th className="p-3.5">{lang === "ar" ? "نوع الإشعار" : "Type"}</th>
                    <th className="p-3.5">{lang === "ar" ? "نص الإشعار" : "Summary"}</th>
                    <th className="p-3.5 text-center">{lang === "ar" ? "الحالة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-purple-900/20 text-slate-800 dark:text-slate-200">
                  {logs.length > 0 ? (
                    logs.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-purple-950/30">
                        <td className="p-3.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.channel === "whatsapp"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                            }`}
                          >
                            {item.channel}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold block">{item.parentName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{item.recipient}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-purple-600 dark:text-purple-300">
                          {item.studentName}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {item.messageType}
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-[11px] text-slate-600 dark:text-slate-300" title={item.contentSummary}>
                          {item.contentSummary}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === "delivered" || item.status === "read"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : item.status === "sent"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-slate-400 font-bold">
                        {lang === "ar" ? "لا توجد رسائل مسجلة في هذا النطاق" : "No logs available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: BULK BROADCAST */}
      {activeTab === "broadcast" && (
        <div className="bg-white dark:bg-[#100a26] p-6 rounded-3xl border border-slate-200 dark:border-purple-900/40 shadow-lg space-y-5 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {lang === "ar" ? "إرسال رسالة جماعية وبث عام لأولياء الأمور" : "Bulk Broadcast Announcement"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-purple-300">
                {lang === "ar"
                  ? "إرسال إشعار عام، مواعيد امتحانات، تنبيهات الإجازات، أو مذكرات جديدة."
                  : "Dispatch mass announcement via WhatsApp and Telegram simultaneously."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === "ar" ? "الفئة المستهدفة:" : "Target Audience:"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBroadcastAudience("all")}
                  className={`p-3 rounded-2xl border transition-all text-center ${
                    broadcastAudience === "all"
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25"
                      : "bg-slate-50 dark:bg-[#160d38] border-slate-200 dark:border-purple-900/30 text-slate-700 dark:text-purple-300"
                  }`}
                >
                  {lang === "ar" ? "جميع أولياء الأمور" : "All Parents"}
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastAudience("sec3")}
                  className={`p-3 rounded-2xl border transition-all text-center ${
                    broadcastAudience === "sec3"
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25"
                      : "bg-slate-50 dark:bg-[#160d38] border-slate-200 dark:border-purple-900/30 text-slate-700 dark:text-purple-300"
                  }`}
                >
                  {lang === "ar" ? "أولياء أمور الثانوية العامة" : "3rd Secondary Parents"}
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastAudience("prep")}
                  className={`p-3 rounded-2xl border transition-all text-center ${
                    broadcastAudience === "prep"
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25"
                      : "bg-slate-50 dark:bg-[#160d38] border-slate-200 dark:border-purple-900/30 text-slate-700 dark:text-purple-300"
                  }`}
                >
                  {lang === "ar" ? "أولياء أمور المرحلة الإعدادية" : "Prep Parents"}
                </button>
              </div>
            </div>

            {/* Target Channel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === "ar" ? "قناة الإرسال:" : "Dispatch Channel:"}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "whatsapp", "telegram"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setBroadcastChannel(ch)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      broadcastChannel === ch
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : "bg-slate-100 dark:bg-[#160d38] text-slate-700 dark:text-purple-300 border border-slate-200 dark:border-purple-900/30"
                    }`}
                  >
                    {ch === "all" ? "WhatsApp & Telegram (تلقائي)" : ch === "whatsapp" ? "WhatsApp فقط" : "Telegram فقط"}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Composer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === "ar" ? "نص الرسالة العامة:" : "Announcement Message Body:"}
              </label>
              <textarea
                rows={5}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "📢 تنبيه هام من إدارة منصة مستر حبيب الرحمن للغة الإنجليزية:\nنحيط سيادتكم علماً بأنه تم نشر مذكرات المراجعة النهائية..."
                    : "Write announcement text here..."
                }
                className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-2xl p-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {broadcastResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {lang === "ar"
                    ? `تم بنجاح إرسال البث الجماعي: (${broadcastResult.sent} رسالة تم تسليمها بنجاح).`
                    : `Broadcast completed: ${broadcastResult.sent} messages sent.`}
                </span>
              </div>
            )}

            <button
              onClick={handleSendBroadcast}
              disabled={broadcasting || !broadcastText.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-purple-600/30 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {broadcasting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === "ar" ? "جارِ إرسال البث لجميع الأرقام المحددة..." : "Dispatching..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{lang === "ar" ? "إرسال البث الجماعي الآن" : "Send Bulk Broadcast Now"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 6. TAB 4: TEMPLATES & CHANNELS CONFIG */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Templates List */}
          <div className="bg-white dark:bg-[#100a26] p-6 rounded-3xl border border-slate-200 dark:border-purple-900/40 shadow-lg space-y-4">
            <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-500" />
              <span>{lang === "ar" ? "قوالب الرسائل التلقائية المعتمدة" : "Automated Message Templates"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-slate-50 dark:bg-[#140b30] border border-slate-200 dark:border-purple-900/30 p-4 rounded-2xl flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {tmpl.name}
                      </span>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800/40">
                        {tmpl.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {tmpl.bodyTextAr}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-purple-900/20 flex justify-end">
                    <button
                      onClick={() => setEditingTemplate(tmpl)}
                      className="px-3 py-1 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-600 hover:text-white dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-600 dark:hover:text-white text-[11px] font-bold transition-all"
                    >
                      {lang === "ar" ? "تعديل نص القالب" : "Edit Template"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PARENT PROFILE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12082b] border border-slate-200 dark:border-purple-900/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-slate-900 dark:text-white">
            <h3 className="font-black text-base mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" />
              <span>{lang === "ar" ? "تسجيل بيانات ولي أمر وربطه بالطالب" : "Add Parent & Link Student"}</span>
            </h3>

            <form onSubmit={handleSaveParent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">{lang === "ar" ? "اسم ولي الأمر الرباعي:" : "Full Name:"}</label>
                <input
                  type="text"
                  required
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="أ/ محمود السيد أحمد"
                  className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{lang === "ar" ? "رقم الهاتف الأساسي (WhatsApp):" : "Primary Phone:"}</label>
                  <input
                    type="text"
                    required
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    placeholder="+201012345678"
                    className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">{lang === "ar" ? "رقم هاتف إضافي (اختياري):" : "Secondary Phone:"}</label>
                  <input
                    type="text"
                    value={newSecondaryPhone}
                    onChange={(e) => setNewSecondaryPhone(e.target.value)}
                    placeholder="+201100000000"
                    className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{lang === "ar" ? "صلة القرابة:" : "Relationship:"}</label>
                  <select
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Father">الأب (Father)</option>
                    <option value="Mother">الأم (Mother)</option>
                    <option value="Guardian">ولي أمر / وصي (Guardian)</option>
                    <option value="Other">أخرى (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">{lang === "ar" ? "وسيلة التواصل المفضلة:" : "Preferred Channel:"}</label>
                  <select
                    value={newPreferredChannel}
                    onChange={(e) => setNewPreferredChannel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="both">WhatsApp & Telegram معاً</option>
                  </select>
                </div>
              </div>

              {/* Link to existing student */}
              <div>
                <label className="block font-bold mb-1">{lang === "ar" ? "ربط بالطالب المسجل في الأكاديمية:" : "Link to Registered Student:"}</label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">{lang === "ar" ? "-- اختر الطالب المطلوب ربطه --" : "-- Select Student --"}</option>
                  {availableStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.grade || "عام"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-purple-900/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-950/40 text-slate-700 dark:text-purple-300 text-xs font-bold"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={savingParent}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 disabled:opacity-50"
                >
                  {savingParent ? (lang === "ar" ? "جارِ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ وتوثيق الرقم" : "Save & Verify")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TELEGRAM PAIRING */}
      {pairingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12082b] border border-slate-200 dark:border-purple-900/60 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-white text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30">
              <Bot className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {lang === "ar" ? "كود ربط حساب تيليجرام" : "Telegram Bot Pairing"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-purple-300 mt-1">
                {lang === "ar" ? `لولي الأمر: ${pairingModal.parentName}` : `Parent: ${pairingModal.parentName}`}
              </p>
            </div>

            {/* Code Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0b051c] border-2 border-dashed border-sky-500/50">
              <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                {lang === "ar" ? "كود الربط المؤقت (صالح لـ 24 ساعة):" : "Temporary Pairing Code:"}
              </span>
              <span className="font-mono font-black text-2xl text-sky-500 tracking-wider">
                {pairingModal.code}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 text-right rtl:text-right leading-relaxed bg-slate-50 dark:bg-[#160d38] p-3 rounded-xl border border-slate-200 dark:border-purple-800/30">
              {lang === "ar" ? (
                <>
                  1. افتح تطبيق تيليجرام وابحث عن بوت المنصة: <b>@{pairingModal.botUsername}</b>
                  <br />
                  2. اضغط على <b>Start</b> أو أرسل الكود: <code>/link {pairingModal.code}</code>
                  <br />
                  3. سيتم تفعيل حسابك فوراً وتبدأ الإشعارات في الوصول إليك.
                </>
              ) : (
                <>
                  1. Open Telegram and search for <b>@{pairingModal.botUsername}</b>
                  <br />
                  2. Send <code>/link {pairingModal.code}</code>
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <a
                href={pairingModal.deepLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "فتح المحادثة في تيليجرام" : "Open Telegram Bot"}</span>
              </a>

              <button
                type="button"
                onClick={() => setPairingModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-purple-950/60 text-slate-700 dark:text-purple-300 text-xs font-bold"
              >
                {lang === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT MESSAGE */}
      {directMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12082b] border border-slate-200 dark:border-purple-900/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-slate-900 dark:text-white space-y-4">
            <h3 className="font-black text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span>{lang === "ar" ? "إرسال رسالة مباشرة لولي الأمر" : "Direct Message to Parent"}</span>
            </h3>

            <div className="bg-slate-50 dark:bg-[#160d38] p-3 rounded-xl border border-slate-200 dark:border-purple-900/30 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold block">{directMessageModal.parentName}</span>
                <span className="font-mono text-slate-400 text-[11px]">{directMessageModal.parentPhone}</span>
              </div>
              {directMessageModal.studentName && (
                <span className="text-[11px] text-purple-600 dark:text-purple-300 font-bold">
                  {lang === "ar" ? `الطالب: ${directMessageModal.studentName}` : `Student: ${directMessageModal.studentName}`}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                {lang === "ar" ? "نص الرسالة أو الملاحظة الخاصة:" : "Message Text:"}
              </label>
              <textarea
                rows={4}
                value={directMsgText}
                onChange={(e) => setDirectMsgText(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "نود إحاطة سيادتكم بأن مستوى الطالب ممتاز في القواعد، ويرجى التركيز على حل شيتات الكلمات..."
                    : "Write direct note..."
                }
                className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {directMsgFeedback && (
              <p className="text-xs font-bold text-center p-2 rounded-xl bg-purple-950/40 text-purple-200">
                {directMsgFeedback}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-purple-900/30">
              <button
                type="button"
                onClick={() => setDirectMessageModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-950/40 text-slate-700 dark:text-purple-300 text-xs font-bold"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleSendDirectMessage}
                disabled={sendingDirectMsg || !directMsgText.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {sendingDirectMsg ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === "ar" ? "جارِ الإرسال..." : "Sending..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "إرسال الآن" : "Send Now"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT TEMPLATE */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12082b] border border-slate-200 dark:border-purple-900/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-slate-900 dark:text-white space-y-4">
            <h3 className="font-black text-base flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span>{lang === "ar" ? `تعديل قالب: ${editingTemplate.name}` : `Edit Template: ${editingTemplate.code}`}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold mb-1">{lang === "ar" ? "نص القالب (باللغة العربية):" : "Template Body (Arabic):"}</label>
              <textarea
                rows={5}
                value={editingTemplate.bodyTextAr}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyTextAr: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#160d38] border border-slate-200 dark:border-purple-900/40 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {lang === "ar"
                  ? "المتغيرات المدعومة: {{student_name}}, {{session_title}}, {{date}}, {{time}}, {{score}}, {{total}}, {{report_url}}"
                  : "Supported tags: {{student_name}}, {{session_title}}, {{date}}, {{time}}, {{score}}, {{report_url}}"}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-purple-900/30">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-purple-950/40 text-slate-700 dark:text-purple-300 text-xs font-bold"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 disabled:opacity-50"
              >
                {savingTemplate ? (lang === "ar" ? "جارِ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ التعديل" : "Save Changes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
