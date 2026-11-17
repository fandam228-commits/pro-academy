"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import { HabibAdminControlPanel } from "@/components/admin/HabibAdminControlPanel";
import { ShieldAlert, ArrowRight, LogIn } from "lucide-react";

function AdminContent() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  // Route protection
  const isAdminOrTeacher = user && (user.role === "admin" || user.role === "teacher");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-sm text-slate-500">جاري التحقق من صلاحيات الدخول للوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!isAdminOrTeacher) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            منطقة مخصصة للإدارة فقط (403 Forbidden)
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            عذراً، هذه الصفحة مخصصة فقط لمستر حبيب الرحمن وفريق الإدارة الأكاديمية للمنصة. يرجى تسجيل الدخول بحساب مسؤول للمتابعة.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>العودة للصفحة الرئيسية</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <HabibAdminControlPanel onExitAdmin={() => router.push("/")} />;
}

export default function AdminPage() {
  return (
    <AppProvider>
      <AdminContent />
    </AppProvider>
  );
}

