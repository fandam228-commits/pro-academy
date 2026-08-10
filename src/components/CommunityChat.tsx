"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { authHeaders } from "@/lib/client-auth";
import { MessageSquare, Send, User, ShieldCheck, Sparkles } from "lucide-react";

export const CommunityChat: React.FC = () => {
  const { user, lang } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat", { headers: { ...authHeaders() } });
      const json = await res.json();
      setMessages(json.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          message: inputText,
        }),
      });
      setInputText("");
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[550px]">
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {lang === "ar" ? "شات ومجتمع أكاديمية المستر" : "Community Live Q&A"}
          </h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
          Live Chat Active
        </span>
      </div>

      {/* MESSAGES CONTAINER */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => {
          const isAdmin = m.senderRole === "admin" || m.senderRole === "teacher";
          return (
            <div key={m.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                  {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{m.senderName}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">{m.message}</p>
            </div>
          );
        })}
      </div>

      {/* INPUT BAR */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={lang === "ar" ? "اكتب رسالة أو استفسار للمستر والطلاب..." : "Ask a question to Mr. Habib & peers..."}
          className="flex-1 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <Send className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
