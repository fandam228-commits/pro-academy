"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { FlashcardsWorkspace } from "@/components/pro-suite/FlashcardsWorkspace";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";

function FlashcardsContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      <Navbar
        activeTab="vocabulary_bank"
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <FlashcardsWorkspace onNavigateHome={() => router.push("/")} />
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

export default function FlashcardsPage() {
  return (
    <AppProvider>
      <FlashcardsContent />
    </AppProvider>
  );
}
