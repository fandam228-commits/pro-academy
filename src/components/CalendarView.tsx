"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { buildWhatsAppLink } from "@/config/platform";
import { Calendar as CalendarIcon, Video, Clock, ChevronLeft, ChevronRight, CheckCircle, Bell, Loader2 } from "lucide-react";

const LIVE_SESSIONS = [
  { id: "ls_1", title: "مراجعة الوحدة الأولى — قواعد الباست تينسز", teacher: "Mr. Habib El Rahman", dayOffset: 2, time: "7:00 PM", duration: "90 mins", grade: "Third Secondary (Baccalaureate)" },
  { id: "ls_2", title: "حل نموذج بوكليت كامل — تدريب تفاعلي", teacher: "Mr. Habib El Rahman", dayOffset: 5, time: "8:00 PM", duration: "60 mins", grade: "Third Secondary (Baccalaureate)" },
  { id: "ls_3", title: "مفردات الثانوية العامة الأكثر تكراراً في الامتحان", teacher: "Ms. Sarah Ahmed", dayOffset: 9, time: "6:30 PM", duration: "45 mins", grade: "Second Secondary" },
  { id: "ls_4", title: "إجابة أسئلة واستفسارات الطلاب المباشرة", teacher: "Mr. Habib El Rahman", dayOffset: 12, time: "9:00 PM", duration: "60 mins", grade: "All Grades" },
  { id: "ls_5", title: "قراءة وفهم القطع (Comprehension Skills) للإعدادي", teacher: "Ms. Sarah Ahmed", dayOffset: 16, time: "7:30 PM", duration: "50 mins", grade: "Third Prep" },
];

export const CalendarView: React.FC = () => {
  const { user, lang } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [remindedSet, setRemindedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/planner?studentId=${user?.id || "usr_student_1"}`);
        const json = await res.json();
        setTasks(json.tasks || []);
      } catch {}
      setLoadingTasks(false);
    })();
  }, [user?.id]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const sessionsWithDates = LIVE_SESSIONS.map((s) => {
    const d = new Date(today);
    d.setDate(today.getDate() + s.dayOffset);
    return { ...s, date: d, dayNum: d.getDate(), monthNum: d.getMonth(), yearNum: d.getFullYear() };
  });

  const sessionsOnDay = (day: number) =>
    sessionsWithDates.filter((s) => s.dayNum === day && s.monthNum === month && s.yearNum === year);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 via-blue-800 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
          <CalendarIcon className="w-8 h-8" />
          {lang === "ar" ? "التقويم وجدولة الحصص المباشرة" : "Calendar & Live Sessions"}
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-2">
          {lang === "ar"
            ? "تابع حصص مستر حبيب المباشرة، ومواعيدك الدراسية في تقويم شهري واحد."
            : "Track Mr. Habib's live streaming classes and your study tasks in one monthly calendar."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CALENDAR GRID */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <h3 className="font-black text-base text-slate-900 dark:text-white">{monthName}</h3>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
            {(lang === "ar" ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const daySessions = sessionsOnDay(day);
              return (
                <div
                  key={day}
                  className={`min-h-[52px] p-1.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    isToday
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : daySessions.length > 0
                      ? "bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-slate-800 dark:text-amber-200"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span>{day}</span>
                  {daySessions.length > 0 && (
                    <div className="mt-1 flex justify-center">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${isToday ? "bg-amber-400 text-slate-950" : "bg-amber-500 text-white"}`}>
                        LIVE
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDE: UPCOMING SESSIONS + TASKS */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Video className="w-4 h-4 text-red-500" />
              {lang === "ar" ? "الحصص المباشرة القادمة" : "Upcoming Live Classes"}
            </h3>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {sessionsWithDates.slice(0, 5).map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">{s.title}</p>
                  <p className="text-[10px] text-slate-500">{s.teacher} • {s.grade}</p>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <CalendarIcon className="w-3 h-3" />
                      {s.date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="w-3 h-3" /> {s.time}
                    </span>
                  </div>
                  <button
                    onClick={() => setRemindedSet(new Set(remindedSet).add(s.id))}
                    className={`w-full py-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                      remindedSet.has(s.id)
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : "bg-red-600 hover:bg-red-500 text-white shadow"
                    }`}
                  >
                    {remindedSet.has(s.id) ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {lang === "ar" ? "تم تفعيل التذكير ✓" : "Reminder On ✓"}
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        {lang === "ar" ? "ذكّرني قبل الحصة" : "Remind Me"}
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {lang === "ar" ? "مهام مذاكرتي" : "My Study Tasks"}
            </h3>
            {loadingTasks ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400 mx-auto my-4" />
            ) : tasks.filter((t) => !t.isCompleted).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">{lang === "ar" ? "لا مهام قيد التنفيذ 🎉" : "No pending tasks 🎉"}</p>
            ) : (
              <div className="space-y-2">
                {tasks.filter((t) => !t.isCompleted).slice(0, 4).map((t) => (
                  <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {t.task}
                    <span className={`block text-[9px] mt-1 font-bold ${t.priority === "High" ? "text-red-500" : "text-amber-500"}`}>
                      {t.priority} • {t.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
