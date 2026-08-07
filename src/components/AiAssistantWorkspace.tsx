"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { BrainCircuit, Sparkles, BookOpen, PenTool, Lightbulb, MessageSquare, Send, Bot, User, CheckCircle } from "lucide-react";

export const AiAssistantWorkspace: React.FC = () => {
  const { user, lang } = useApp();
  const [activeMode, setActiveMode] = useState<"general" | "grammar" | "homework" | "essay" | "vocab">("grammar");
  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string; mode: string; timestamp: string }[]
  >([
    {
      sender: "ai",
      text: lang === "ar"
        ? "مرحباً بك! أنا مساعد المستر للذكاء الاصطناعي 🤖. يمكنك اختياري لشرح القواعد، أو تصحيح المقالات، أو المساعدة في واجبات الثانوية العامة."
        : "Welcome! I am Mr. Habib's AI Study Assistant 🤖. Ask me about Thanawya Amma grammar, essay feedback, or homework help!",
      mode: "general",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const aiModes = [
    { id: "grammar", labelEn: "Grammar Explainer", labelAr: "شرح القواعد مع مستر حبيب", icon: BookOpen, color: "text-blue-500" },
    { id: "homework", labelEn: "Homework Helper", labelAr: "مساعد الواجبات والحلول", icon: Lightbulb, color: "text-amber-500" },
    { id: "essay", labelEn: "Essay Grader & Feedback", labelAr: "تصحيح المقالات والتعبير", icon: PenTool, color: "text-purple-500" },
    { id: "vocab", labelEn: "Vocabulary Practice", labelAr: "تدريب المفردات والمرادفات", icon: Sparkles, color: "text-emerald-500" },
    { id: "general", labelEn: "General Study Assistant", labelAr: "المساعد التعليمي العام", icon: MessageSquare, color: "text-indigo-500" },
  ];

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || loading) return;

    const userText = inputPrompt;
    setInputPrompt("");

    const newMsg = {
      sender: "user" as const,
      text: userText,
      mode: activeMode,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id || "usr_student_1",
          type: activeMode,
          prompt: userText,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
            mode: activeMode,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[720px]">
      
      {/* LEFT SIDEBAR: MODE SELECTOR */}
      <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg mb-6">
            <BrainCircuit className="w-7 h-7" />
            <div>
              <h3 className="font-extrabold text-sm">Habib AI Tutor</h3>
              <p className="text-[11px] text-blue-100">Powered by Professional Academy</p>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
            {lang === "ar" ? "أدوات الذكاء الاصطناعي:" : "AI Learning Tools:"}
          </p>

          <div className="space-y-1.5">
            {aiModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id as any)}
                  className={`w-full text-start p-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 border ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-md"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${mode.color}`} />
                  <span>{lang === "ar" ? mode.labelAr : mode.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50/60 dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
          💡 {lang === "ar" ? "نصيحة: يمكنك نسخ موضوع المقال ولصقه في أداة التصحيح للحصول على درجة واقتراحات فورية." : "Tip: Paste your essay directly for instant AI grading & polish."}
        </div>
      </div>

      {/* CHAT / INTERACTIVE AREA */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 p-4 sm:p-6">
        
        {/* MESSAGES THREAD */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => {
            const isUser = m.sender === "user";
            return (
              <div key={idx} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 font-bold ${
                    isUser ? "bg-blue-600" : "bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md"
                  }`}
                >
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`max-w-xl p-4 rounded-3xl text-xs leading-relaxed font-medium shadow-sm whitespace-pre-wrap ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-white/20 pb-1">
                    <span className="font-extrabold text-[10px] opacity-80 uppercase">
                      {isUser ? user?.name || "Student" : "Habib AI Tutor"}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">{m.timestamp}</span>
                  </div>
                  <div>{m.text}</div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-500 font-medium animate-pulse">
                {lang === "ar" ? "جاري التفكير وصياغة الرد الذكي..." : "Thinking & generating answer..."}
              </div>
            </div>
          )}
        </div>

        {/* INPUT FORM */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              activeMode === "grammar"
                ? (lang === "ar" ? "اكتب القاعدة التي تريد شرحها (مثال: Inversion / Direct Speech)..." : "Ask about a grammar rule...")
                : activeMode === "essay"
                ? (lang === "ar" ? "الصق نص المقال الذي كتبته للحصول على تقييم نتيجتك..." : "Paste your written essay for grading...")
                : (lang === "ar" ? "اكتب سؤالك هنا..." : "Type your question here...")
            }
            className="flex-1 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleSendMessage}
            disabled={loading || !inputPrompt.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span>{lang === "ar" ? "إرسال" : "Send"}</span>
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
