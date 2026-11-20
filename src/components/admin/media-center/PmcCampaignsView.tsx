"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { FacebookIcon, YoutubeIcon, TiktokIcon } from "./icons";
import type { MarketingCampaignRecord, CampaignGoal } from "@/lib/media-center/campaigns-engine";

interface PmcCampaignsViewProps {
  lang?: "ar" | "en";
}

export const PmcCampaignsView: React.FC<PmcCampaignsViewProps> = ({ lang = "ar" }) => {
  const isAr = lang === "ar";

  const [campaigns, setCampaigns] = useState<MarketingCampaignRecord[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalBudgetEgp: 0,
    totalSpentEgp: 0,
    totalRegistrations: 0,
    totalRevenueEgp: 0,
    overallROI: 0,
    activeCampaignsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Create Campaign Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formGoal, setFormGoal] = useState<CampaignGoal>("thanawya_amma_prep");
  const [formGrade, setFormGrade] = useState<any>("Third Secondary (Baccalaureate)");
  const [formBudget, setFormBudget] = useState("10000");
  const [formCta, setFormCta] = useState("");
  const [formPlatforms, setFormPlatforms] = useState<Array<"facebook" | "youtube" | "tiktok">>([
    "facebook",
    "youtube",
    "tiktok",
  ]);
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media-center/campaigns");
      if (res.ok) {
        const json = await res.json();
        setCampaigns(json.campaigns || []);
        if (json.templates) setTemplates(json.templates);
        if (json.summary) setSummary(json.summary);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (tmpl: any) => {
    setFormName(tmpl.name);
    setFormGoal(tmpl.goal);
    setFormGrade(tmpl.targetGrade);
    setFormBudget(String(tmpl.suggestedBudgetEgp));
    setFormCta(tmpl.cta);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formBudget) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/media-center/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          goal: formGoal,
          targetGrade: formGrade,
          budgetEgp: Number(formBudget),
          cta: formCta,
          targetPlatforms: formPlatforms,
        }),
      });

      if (res.ok) {
        setNotification(isAr ? "تم إنشاء الحملة التسويقية بنجاح!" : "Campaign created!");
        setCreateModalOpen(false);
        fetchCampaigns();
      } else {
        setNotification("فشل إنشاء الحملة.");
      }
    } catch {
      setNotification("خطأ أثناء الاتصال.");
    } finally {
      setCreating(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />;
      case "youtube":
        return <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />;
      case "tiktok":
        return <TiktokIcon className="w-3.5 h-3.5 text-slate-900 dark:text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-indigo-600/20">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr ? "حملات تسجيل الطلاب والأداء التسويقي (Campaigns Hub)" : "Academy Enrollment & Campaigns Hub"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? "إدارة الحملات الإعلانية ومتابعة اشتراكات الطلاب في كورسات مستر حبيب وتكلفة الطالب (CPR) والعائد على الاستثمار (ROI)."
              : "Manage academy enrollment campaigns, track student registrations, CPR, and course revenue ROI."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "إنشاء حملة جديدة" : "New Campaign"}</span>
          </button>
        </div>
      </div>

      {/* Top High-Level Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">{isAr ? "إجمالي الميزانية" : "Total Budget"}</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {summary.totalBudgetEgp.toLocaleString()} ج.م
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400">{isAr ? "المصروف الفعلي" : "Spent"}</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {summary.totalSpentEgp.toLocaleString()} ج.م
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-500">{isAr ? "الطلاب المسجلون" : "Registrations"}</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
            {summary.totalRegistrations.toLocaleString()} {isAr ? "طالب" : "students"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500">{isAr ? "العائد المحقق" : "Course Revenue"}</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.totalRevenueEgp.toLocaleString()} ج.م
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500">{isAr ? "العائد على الاستثمار" : "Overall ROI"}</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            +{summary.overallROI}%
          </p>
        </div>
      </div>

      {/* Pre-made Academy Campaign Templates */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{isAr ? "قوالب حملات الأكاديمية الجاهزة للإطلاق السريع:" : "Pre-Configured Academy Campaign Templates:"}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templates.map((tmpl, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-blue-400 dark:hover:border-blue-500 transition group"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {tmpl.targetGrade.includes("Third") ? "3 ثانوي" : "2 ثانوي"}
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
                  {tmpl.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tmpl.suggestedBudgetEgp.toLocaleString()} ج.م
                </span>
                <button
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{isAr ? "استخدام القالب" : "Use Template"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active & Completed Campaigns List */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          {isAr ? "الحملات الإعلانية الحالية والسابقة" : "Active & Completed Campaigns"}
        </h3>

        <div className="space-y-4">
          {campaigns.map((camp) => {
            const budgetPercent = Math.min(100, Math.round((camp.spentEgp / camp.budgetEgp) * 100));

            return (
              <div
                key={camp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
              >
                {/* Campaign Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {camp.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          camp.status === "active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {camp.status === "active" ? (isAr ? "نشطة الآن" : "Active") : isAr ? "مكتملة" : "Completed"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {camp.targetGrade} • الهدف: {camp.goal}
                    </span>
                  </div>

                  {/* Platforms */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl">
                    {camp.targetPlatforms.map((p) => (
                      <span key={p} className="p-1">
                        {getPlatformIcon(p)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress & Numbers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">{isAr ? "المصروف من الميزانية" : "Spent / Budget"}</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {camp.spentEgp.toLocaleString()} / {camp.budgetEgp.toLocaleString()} ج.م
                    </span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${budgetPercent}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">{isAr ? "النقرات والمشاهدات" : "Clicks"}</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {camp.clicksCount.toLocaleString()} {isAr ? "نقرة" : "clicks"}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {isAr ? "المهتمون (Leads):" : "Leads:"} {camp.leadsCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">{isAr ? "الطلاب المسجلون فعلياً" : "Enrolled Students"}</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                      {camp.registrationsCount.toLocaleString()} {isAr ? "طالب" : "students"}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                      {isAr ? "نسبة التحويل:" : "Conv. Rate:"} {camp.conversionRate}%
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">{isAr ? "تكلفة تسجيل الطالب (CPR)" : "Cost Per Registration"}</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {camp.costPerRegistrationEgp} ج.م
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">
                      عائد الاستثمار (ROI): +{camp.roiPercentage}%
                    </span>
                  </div>
                </div>

                {/* CTA Preview */}
                <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-3 text-xs flex items-center justify-between">
                  <span className="text-amber-800 dark:text-amber-300 font-bold">
                    🎯 CTA: "{camp.cta}"
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(camp.startDate).toLocaleDateString()} — {new Date(camp.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-500" />
              <span>{isAr ? "إطلاق حملة تسويقية جديدة لتسجيل الطلاب" : "Launch New Enrollment Campaign"}</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? "اسم الحملة:" : "Campaign Name:"}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: حملة مراجعة ليلة الامتحان للثانوية العامة 2026"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? "الهدف الرئيسي:" : "Campaign Goal:"}
                  </label>
                  <select
                    value={formGoal}
                    onChange={(e) => setFormGoal(e.target.value as CampaignGoal)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="thanawya_amma_prep">معسكر الثانوية العامة</option>
                    <option value="free_exam_viral">الامتحان التجريبي المجاني</option>
                    <option value="midterm_revision">مراجعة نصف العام</option>
                    <option value="general_enrollment">تسجيل عام في السنتر/المنصة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? "الصف الدراسي المستهدف:" : "Target Grade:"}
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Third Secondary (Baccalaureate)">الثانوية العامة (Sec 3)</option>
                    <option value="Second Secondary">الصف الثاني الثانوي (Sec 2)</option>
                    <option value="First Secondary">الصف الأول الثانوي (Sec 1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? "الميزانية المرصودة (بالجنيه المصري):" : "Budget (EGP):"}
                </label>
                <input
                  type="number"
                  required
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? "الدعوة لاتخاذ إجراء (Call to Action - CTA):" : "Call To Action:"}
                </label>
                <input
                  type="text"
                  value={formCta}
                  onChange={(e) => setFormCta(e.target.value)}
                  placeholder="مثال: احجز مكانك في المراجعة النهائية واضمن الـ 50 درجة مع مستر حبيب الرحمن"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAr ? "حفظ وإطلاق الحملة" : "Launch Campaign"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
