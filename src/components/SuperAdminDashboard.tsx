"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  KeyRound,
  Download,
  Send,
  Plus,
  Trash2,
  CheckCircle,
  BarChart3,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export const SuperAdminDashboard: React.FC = () => {
  const { lang } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "codes" | "announcements" | "backup">("analytics");

  // Code Generator Form State
  const [codeCourseId, setCodeCourseId] = useState("crs_sec_3");
  const [codeCount, setCodeCount] = useState(5);
  const [codePrefix, setCodePrefix] = useState("HABIB3SEC");
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  // User Creator Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("student");

  // Announcement State
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annSent, setAnnSent] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleGenerateCodes = async () => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "generate_codes",
          codeBatch: { courseId: codeCourseId, count: codeCount, prefix: codePrefix },
        }),
      });
      const json = await res.json();
      if (json.codes) {
        setGeneratedCodes(json.codes);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail) return;
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "create_user",
          userData: { name: newUserName, email: newUserEmail, role: newUserRole },
        }),
      });
      setNewUserName("");
      setNewUserEmail("");
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "delete_user", userId: id }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!annMessage) return;
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "send_announcement",
          title: annTitle || "📢 Announcement",
          message: annMessage,
        }),
      });
      setAnnSent(true);
      setAnnTitle("");
      setAnnMessage("");
      setTimeout(() => setAnnSent(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ action: "export_backup" }),
      });
      const json = await res.json();
      if (json.backupJSON) {
        const blob = new Blob([json.backupJSON], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pro-academy-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium">
        <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
        <p>{lang === "ar" ? "جاري تحميل بيانات المشرف العام..." : "Loading Admin Analytics..."}</p>
      </div>
    );
  }

  const { analytics, users: userList, codes } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {lang === "ar" ? "لوحة تحكم المشرف العام (Super Admin)" : "Super Admin Dashboard"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "ar" ? "إدارة المنصة، التقارير المالية، الأكواد، والمستخدمين" : "System Analytics, Users, Financials & Activation Codes"}
          </p>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "analytics" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {lang === "ar" ? "الإحصائيات" : "Analytics"}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "users" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {lang === "ar" ? "المستخدمين" : "Users"}
          </button>
          <button
            onClick={() => setActiveTab("codes")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "codes" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {lang === "ar" ? "أكواد التفعيل" : "Codes Generator"}
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "announcements" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {lang === "ar" ? "الإشعارات" : "Broadcast"}
          </button>
          <button
            onClick={() => setActiveTab("backup")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "backup" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {lang === "ar" ? "النسخ الاحتياطي" : "Backup"}
          </button>
        </div>
      </div>

      {/* 1. ANALYTICS STATS GRID */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{lang === "ar" ? "إجمالي الطلاب" : "Total Students"}</span>
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics?.totalStudents}</p>
              <p className="text-[11px] text-emerald-600 mt-1">↑ +14% {lang === "ar" ? "هذا الشهر" : "this month"}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}</span>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics?.totalRevenue} EGP</p>
              <p className="text-[11px] text-blue-600 mt-1">{lang === "ar" ? "فودافون كاش & انستاباي" : "Vodafone Cash & InstaPay"}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{lang === "ar" ? "الكورسات المنشورة" : "Published Courses"}</span>
                <BookOpen className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics?.totalCourses}</p>
              <p className="text-[11px] text-purple-600 mt-1">{lang === "ar" ? "إعدادي وثانوي" : "Prep & Secondary"}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{lang === "ar" ? "الزيارات اليومية" : "Active Today"}</span>
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics?.activeToday}</p>
              <p className="text-[11px] text-amber-600 mt-1">{lang === "ar" ? "نشطين حالياً" : "Active now"}</p>
            </div>
          </div>

          {/* DEVICE STATS & REVENUE GRAPH */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
                {lang === "ar" ? "نمو الإيرادات الشهرية (EGP)" : "Monthly Revenue Trend"}
              </h3>
              <div className="space-y-3">
                {analytics?.monthlyRevenue?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-bold text-slate-500">{m.month}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${(m.revenue / 50000) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 font-mono font-bold text-end text-slate-800 dark:text-slate-200">
                      {m.revenue} EGP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
                {lang === "ar" ? "توزيع أجهزة الطلاب" : "Device Usage Breakdown"}
              </h3>
              <div className="space-y-4">
                {analytics?.deviceStats?.map((d: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-800 dark:text-slate-200">{d.device}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-mono">{d.percentage}%</span>
                    </div>
                    <div className="bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${d.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS MANAGEMENT TAB */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
              {lang === "ar" ? "إضافة حساب معلم أو طالب جديد" : "Create New User Account"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder={lang === "ar" ? "الاسم الكامل..." : "Full Name..."}
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
              <input
                type="email"
                placeholder={lang === "ar" ? "البريد الإلكتروني..." : "Email Address..."}
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="student">Student (طالب)</option>
                <option value="teacher">Teacher (معلم)</option>
                <option value="parent">Parent (ولي أمر)</option>
                <option value="admin">Super Admin (أدمن)</option>
              </select>
            </div>
            <button
              onClick={handleCreateUser}
              className="mt-3 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "ar" ? "إنشاء الحساب" : "Add User Account"}</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-x-auto">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
              {lang === "ar" ? "قائمة جميع المستخدمين المسجلين بالمنصة" : "Registered Platform Accounts"}
            </h3>
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase">
                  <th className="py-2.5 font-bold text-start">User Name</th>
                  <th className="py-2.5 font-bold text-start">Email</th>
                  <th className="py-2.5 font-bold text-start">Role</th>
                  <th className="py-2.5 font-bold text-start">Stage</th>
                  <th className="py-2.5 font-bold text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userList?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-100">{u.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">{u.email}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{u.stage || "-"}</td>
                    <td className="py-3 text-end">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ACTIVATION CODES GENERATOR */}
      {activeTab === "codes" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
              {lang === "ar" ? "مولد أكواد التفعيل الفورية" : "Activation Code Generator"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value)}
                placeholder="Prefix e.g. HABIB3SEC"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white uppercase"
              />
              <input
                type="number"
                value={codeCount}
                onChange={(e) => setCodeCount(parseInt(e.target.value) || 1)}
                placeholder="Number of codes"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
              <button
                onClick={handleGenerateCodes}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all"
              >
                {lang === "ar" ? "توليد كروت التفعيل" : "Generate Batch Codes"}
              </button>
            </div>

            {generatedCodes.length > 0 && (
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                  🎉 {generatedCodes.length} Codes Generated Successfully:
                </p>
                <div className="flex flex-wrap gap-2">
                  {generatedCodes.map((c, i) => (
                    <span key={i} className="font-mono text-xs font-bold px-3 py-1 bg-white dark:bg-slate-900 rounded-lg shadow text-emerald-600 border border-emerald-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
              {lang === "ar" ? "سجل الأكواد الحالية بالمنظومة" : "Active System Activation Codes"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {codes?.map((c: any) => (
                <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{c.code}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${c.isUsed ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                    {c.isUsed ? "USED" : "AVAILABLE"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. BROADCAST ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg max-w-2xl">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">
            {lang === "ar" ? "إرسال إشعار عام لجميع الطلاب" : "Broadcast Platform Announcement"}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder={lang === "ar" ? "عنوان الإشعار..." : "Announcement Title..."}
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
            />
            <textarea
              rows={4}
              placeholder={lang === "ar" ? "اكتب نص الإشعار هنا..." : "Type announcement message..."}
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
            />
            <button
              onClick={handleSendAnnouncement}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{lang === "ar" ? "بث الإشعار للجميع" : "Broadcast Notification"}</span>
            </button>
            {annSent && (
              <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{lang === "ar" ? "تم بث الإشعار بنجاح!" : "Broadcast sent to all active students!"}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. SYSTEM BACKUP */}
      {activeTab === "backup" && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center max-w-xl mx-auto">
          <Download className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2">
            {lang === "ar" ? "تصدير نسخة احتياطية من قاعدة البيانات" : "Full Database Backup & Restore"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {lang === "ar"
              ? "يمكنك تصدير كافة بيانات الكورسات، الطلاب، المدفوعات، والنتائج في ملف JSON أمن للنسخ الاحتياطي."
              : "Export all system entities (Users, Courses, Payments, Test Results) into encrypted JSON format."}
          </p>
          <button
            onClick={handleExportBackup}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-xl transition-all"
          >
            {lang === "ar" ? "تحميل نسخة احتياطية الآن" : "Download JSON Backup"}
          </button>
        </div>
      )}
    </div>
  );
};
