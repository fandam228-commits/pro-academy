"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { TranslationAcademyWorkspace } from "@/components/translation/TranslationAcademyWorkspace";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";

function TranslationDashboardContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex flex-col font-sans" dir="rtl">
      <Navbar
        activeTab="translation"
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <TranslationAcademyWorkspace />
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

export default function TranslationDashboardPage() {
  return (
    <AppProvider>
      <TranslationDashboardContent />
    </AppProvider>
  );
}
