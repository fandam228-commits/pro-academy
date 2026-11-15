"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthScreen } from "@/components/AuthScreen";
import { Sparkles } from "lucide-react";

function LoginContent() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(returnUrl);
    }
  }, [user, authLoading, returnUrl, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-sky-400 flex items-center justify-center text-white shadow-xl animate-pulse mb-3">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-purple-200 animate-pulse">
          جاري التحقق من الجلسة الآمنة...
        </p>
      </div>
    );
  }

  return (
    <AuthScreen
      returnUrl={returnUrl}
      onLoginSuccess={() => {
        router.replace(returnUrl);
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <AppProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </AppProvider>
  );
}
