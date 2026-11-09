"use client";
import React from "react";
import {AppProvider,useApp} from "@/context/AppContext";
import {Navbar} from "@/components/Navbar";
import {Footer} from "@/components/Footer";
import {AuthScreen} from "@/components/AuthScreen";
import {GrammarLibrary} from "@/components/GrammarLibrary";
function Content() {
  const { user } = useApp();
  if (!user) return <AuthScreen />;
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar activeTab="grammar" setActiveTab={() => {}} />
      <main>
        <GrammarLibrary />
      </main>
      <Footer setActiveTab={() => {}} />
    </div>
  );
}
export default function GrammarPage(){return <AppProvider><Content/></AppProvider>}