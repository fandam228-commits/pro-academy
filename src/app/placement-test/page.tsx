"use client";

import React from "react";
import Link from "next/link";
import { AppProvider, useApp } from "@/context/AppContext";
import { PlacementTestHub } from "@/components/PlacementTestHub";

function PlacementTestPageContent() {
  const { lang, authLoading, user } = useApp();
  const ar = lang === "ar";

  if (authLoading) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-sm font-bold text-blue-100">{ar ? "جارٍ التحقق من جلستك..." : "Checking your secure session..."}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="text-xs font-black text-blue-700 dark:text-blue-300">Professional Academy</Link>
          <Link href={user ? "/?tab=placement" : "/"} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">{user ? (ar ? "العودة للمنصة" : "Back to academy") : (ar ? "تسجيل الدخول" : "Sign in")}</Link>
        </div>
      </header>
      <PlacementTestHub />
    </div>
  );
}

export default function PlacementTestPage() {
  return <AppProvider><PlacementTestPageContent /></AppProvider>;
}
