"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import { ProMediaCommandCenter } from "@/components/admin/media-center/ProMediaCommandCenter";
import { ShieldAlert, ArrowRight } from "lucide-react";

function MediaCenterContent() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  // Mr. Habib El Rahman or authorized teacher/admin
  const isAuthorized = user && (user.role === "admin" || user.role === "teacher");

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
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white">
            منطقة مخصصة للإدارة العليا (403 Forbidden)
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            عذراً، الوصول لـ PRO MEDIA COMMAND CENTER مقتصر حصرياً على مستر حبيب الرحمن وفريق الإدارة الإعلامية للأكاديمية.
          </p>

          <div className="pt-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>العودة للمنصة الرئيسية</span>
              <ArrowRight className="w-4 h-4" />
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
