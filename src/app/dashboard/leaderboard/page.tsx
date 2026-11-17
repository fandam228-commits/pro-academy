"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { WeeklyLeaderboardView } from "@/components/gamification/WeeklyLeaderboardView";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";

function LeaderboardDashboardContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0c071a] flex flex-col font-sans" dir="rtl">
      <Navbar
        activeTab="leaderboard"
        setActiveTab={(tab) => {
          if (tab === "home") router.push("/");
          else router.push(`/?tab=${tab}`);
        }}
      />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <WeeklyLeaderboardView
          onStartQuiz={() => router.push("/dashboard/exam-simulator")}
          onOpenMistakesBank={() => router.push("/dashboard/mistakes")}
        />
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

export default function LeaderboardDashboardPage() {
  return (
    <AppProvider>
      <LeaderboardDashboardContent />
    </AppProvider>
  );
}
