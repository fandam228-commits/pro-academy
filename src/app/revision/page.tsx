"use client";

import React, { Suspense } from "react";
import { AppProvider } from "@/context/AppContext";
import { MoasserRevisionHub } from "@/components/revision/MoasserRevisionHub";
import { Sparkles, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function RevisionContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#070314] text-[#243247] dark:text-slate-100 py-6">
      {/* Top Bar navigation */}
      <div className="max-w-6xl mx-auto px-4 mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-purple-950/60 border border-slate-200 dark:border-purple-800/40 text-xs font-bold text-slate-700 dark:text-purple-200 hover:text-purple-600 shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>الرئيسية • منصة مستر حبيب الرحمن</span>
        </Link>
        <div className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
          El-Moasser Official 2026/2027
        </div>
      </div>

      <MoasserRevisionHub onBack={() => router.push("/")} />
    </div>
  );
}

export default function RevisionPage() {
  return (
    <AppProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#F7F9FC] dark:bg-[#070314]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 animate-spin flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <p className="font-extrabold text-sm text-slate-700 dark:text-purple-200">
              جاري تجهيز مراجعات ونماذج المعاصر التفاعلية...
            </p>
          </div>
        }
      >
        <RevisionContent />
      </Suspense>
    </AppProvider>
  );
}
