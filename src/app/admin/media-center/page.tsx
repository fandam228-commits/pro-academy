"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import { ProMediaCommandCenter } from "@/components/admin/media-center/ProMediaCommandCenter";
import { ShieldAlert, ArrowRight, Key, Sparkles } from "lucide-react";

function MediaCenterContent() {
  const { user, authLoading, login } = useApp();
  const router = useRouter();

  // Strict admin-only access: Mr. Habib El Rahman / Super Admin
  const isAuthorized = user && user.role === "admin";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sm text-slate-400">
            جاري التحقق من أمان وصلاحيات مركز القيادة الإعلامي...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-amber-500/30 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white">
            منطقة مخصصة للإدارة العليا — Mr. Habib El Rahman
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            الوصول لـ PRO MEDIA COMMAND CENTER يتطلب صلاحيات الإدارة العليا لمستر حبيب الرحمن وفريق العمل الإعلامي.
          </p>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Key className="w-4 h-4" />
              <span>تسجيل الدخول بحساب الإدارة (Admin Login)</span>
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <span>العودة للمنصة الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ProMediaCommandCenter onExitCommandCenter={() => router.push("/admin")} />;
}

export default function MediaCenterPage() {
  return (
    <AppProvider>
      <MediaCenterContent />
    </AppProvider>
  );
}
