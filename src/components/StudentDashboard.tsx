"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Flame,
  Award,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Plus,
  Sparkles,
  Trophy,
  BrainCircuit,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export const StudentDashboard: React.FC<{ onSelectCourse?: (courseId: string) => void }> = ({ onSelectCourse }) => {
  const { user, lang } = useApp();
  const [plannerTasks, setPlannerTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);

  // Fetch Planner Tasks
  const fetchPlanner = async () => {
    try {
      const res = await fetch(`/api/planner?studentId=${user?.id || "usr_student_1"}`);
      const json = await res.json();
      setPlannerTasks(json.tasks || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  // Pomodoro Countdown Effect
  useEffect(() => {
    if (!isPomoRunning) return;
    const interval = setInterval(() => {
      if (pomoSeconds === 0) {
        if (pomoMinutes === 0) {
          setIsPomoRunning(false);
          alert(lang === "ar" ? "انتهت جلسة التركيز المحددة 25 دقيقة! خذ استراحة 5 دقائق ☕" : "Focus session finished! Take a 5 min break ☕");
        } else {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        }
      } else {
        setPomoSeconds(pomoSeconds - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoMinutes, pomoSeconds]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    try {
      await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          studentId: user?.id || "usr_student_1",
          task: newTask,
        }),
      });
      setNewTask("");
      fetchPlanner();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", taskId, isCompleted: !isCompleted }),
      });
      fetchPlanner();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-blue-100">
            {user?.grade || "Third Secondary (Baccalaureate)"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-3">
            {lang === "ar" ? `أهلاً بك يا ${user?.name || "عمر"}!` : `Welcome back, ${user?.name || "Omar"}!`}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            {lang === "ar"
              ? "استمر في مشاهدة محاضرات مستر حبيب الرحمن وحل التدريبات اليومية للحفاظ على التتابع والمكافآت."
              : "Keep up your study streak by completing Unit 1 lectures and practicing with Habib AI Tutor."}
          </p>
        </div>

        {/* STATS BADGES */}
        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center px-3">
            <Flame className="w-6 h-6 text-amber-300 mx-auto mb-1 fill-current" />
            <span className="text-lg font-black">{user?.streak || 12}d</span>
            <span className="text-[10px] block opacity-80">{lang === "ar" ? "تتابع يومي" : "Streak"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-3">
            <Award className="w-6 h-6 text-emerald-300 mx-auto mb-1" />
            <span className="text-lg font-black">{user?.points || 680}</span>
            <span className="text-[10px] block opacity-80">{lang === "ar" ? "نقاط تفوق" : "Points"}</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center px-3">
            <Trophy className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
            <span className="text-lg font-black">{user?.level || "Upper Int."}</span>
            <span className="text-[10px] block opacity-80">{lang === "ar" ? "المستوى" : "Level"}</span>
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ENROLLED COURSES & CONTINUE LEARNING */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>{lang === "ar" ? "متابعة التعلم - كورساتي" : "Continue Learning"}</span>
              </h2>
            </div>

            {/* ACTIVE ENROLLED COURSE CARD */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
                  Active Enrolled Course
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2">
                  Third Secondary Master Class 2025/2026 (Thanawya Amma)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Unit 1: Past Tenses & Newspaper Vocab • Lesson 1.2
                </p>

                {/* PROGRESS BAR */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden w-48">
                    <div className="bg-blue-600 h-full rounded-full w-1/2" />
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">50%</span>
                </div>
              </div>

              <button
                onClick={() => onSelectCourse && onSelectCourse("crs_sec_3")}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 shrink-0 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === "ar" ? "متابعة المحاضرة" : "Resume Lecture"}</span>
              </button>
            </div>
          </div>

          {/* STUDY PLANNER TODO LIST */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>{lang === "ar" ? "مخطط المذاكرة والمهام اليومية" : "Study Planner & Tasks"}</span>
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={lang === "ar" ? "إضافة مهمة مذاكرة جديدة..." : "Add new study task..."}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
              <button
                onClick={handleAddTask}
                className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {plannerTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id, t.isCompleted)}
                  className={`p-3 rounded-2xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                    t.isCompleted
                      ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <span>{t.task}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      t.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-400"
                    }`}
                  >
                    {t.isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: POMODORO TIMER & LEADERBOARD BADGES */}
        <div className="space-y-6">
          
          {/* POMODORO FOCUS TIMER */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{lang === "ar" ? "مؤقت التركيز (Pomodoro Timer)" : "Pomodoro Focus Timer"}</span>
            </h2>

            <div className="text-4xl font-mono font-black text-slate-900 dark:text-white my-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              {pomoMinutes < 10 ? `0${pomoMinutes}` : pomoMinutes}:{pomoSeconds < 10 ? `0${pomoSeconds}` : pomoSeconds}
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                  isPomoRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isPomoRunning ? (lang === "ar" ? "إيقاف مؤقت" : "Pause") : (lang === "ar" ? "ابدأ المذاكرة" : "Start Focus")}
              </button>

              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  setPomoMinutes(25);
                  setPomoSeconds(0);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs"
              >
                {lang === "ar" ? "إعادة ضبط" : "Reset"}
              </button>
            </div>
          </div>

          {/* GAMIFICATION BADGES */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{lang === "ar" ? "شارات وإنجازات التفوق" : "My Badges & Achievements"}</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-1 font-bold text-xs">
                  🔥
                </div>
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block">10-Day Streak</span>
                <span className="text-[9px] text-amber-600 block">Unlocked!</span>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-1 font-bold text-xs">
                  🎯
                </div>
                <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">Quiz Master</span>
                <span className="text-[9px] text-emerald-600 block">90%+ Score</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
