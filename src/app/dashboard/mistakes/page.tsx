"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { MistakesBankWorkspace } from "@/components/mistakes/MistakesBankWorkspace";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";

function MistakesDashboardContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex flex-col font-sans" dir="rtl">
      <Navbar
        activeTab="mistakes_bank"
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <MistakesBankWorkspace />
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

export default function MistakesDashboardPage() {
  return (
    <AppProvider>
      <MistakesDashboardContent />
    </AppProvider>
  );
}
