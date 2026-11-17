"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { ExamSimulatorWorkspace } from "@/components/pro-suite/ExamSimulatorWorkspace";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";

function ExamSimulatorContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      <Navbar
        activeTab="question_bank"
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <ExamSimulatorWorkspace onNavigateHome={() => router.push("/")} />
      </main>
      <Footer
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />
    </div>
  );
}

export default function ExamSimulatorPage() {
  return (
    <AppProvider>
      <ExamSimulatorContent />
    </AppProvider>
  );
}
