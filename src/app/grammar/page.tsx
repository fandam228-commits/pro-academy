"use client";
import React from "react";
import {AppProvider,useApp} from "@/context/AppContext";
import {Navbar} from "@/components/Navbar";
import {Footer} from "@/components/Footer";
import {AuthScreen} from "@/components/AuthScreen";
import {GrammarLibrary} from "@/components/GrammarLibrary";
function Content(){const{user,authLoading}=useApp();if(authLoading)return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><div className="text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"/><p className="text-sm font-bold">جاري التحقق من الجلسة...</p></div></div>;if(!user)return <AuthScreen/>;return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><Navbar activeTab="grammar" setActiveTab={()=>{}}/><main><GrammarLibrary/></main><Footer setActiveTab={()=>{}}/></div>}
export default function GrammarPage(){return <AppProvider><Content/></AppProvider>}