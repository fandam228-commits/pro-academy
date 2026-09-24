"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GraduationCap, Plus, Video, FileText, CheckCircle2, BookOpen, Users, BarChart2, Sparkles, HelpCircle } from "lucide-react";

export const TeacherDashboard: React.FC<{ onOpenLibrary?: () => void }> = ({ onOpenLibrary }) => {
  const { lang, user } = useApp();
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courses" | "create_course" | "question_bank">("courses");

  // Create Course Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState("Secondary");
  const [grade, setGrade] = useState("Third Secondary (Baccalaureate)");
  const [price, setPrice] = useState("250.00");
  const [successMsg, setSuccessMsg] = useState(false);

  const fetchTeacherCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      const json = await res.json();
      setCoursesList(json.courses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!title || !description) return;
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          action: "create_course",
          courseData: {
            title,
            description,
            stage,
            grade,
            price,
            teacherId: user?.id || "usr_admin_1",
            teacherName: user?.name || "Mr. Habib El Rahman",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(true);
        setTitle("");
        setDescription("");
        fetchTeacherCourses();
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {lang === "ar" ? "لوحة معلم الكورس (Teacher Hub)" : "Teacher Course Workspace"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === "ar" ? "مرحباً مستر حبيب الرحمن! رفع الفيديوهات، الشيتات، والملاحظات" : "Manage lectures, PDF files, exam question banks and attendance."}
          </p>
          {onOpenLibrary && (
            <button
              onClick={onOpenLibrary}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-lg shadow-sky-500/25 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>{lang === "ar" ? "رفع وإدارة ملفات PDF" : "Upload & Manage PDF Files"}</span>
            </button>
          )}
        </div>

        {/* TAB BUTTONS */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "courses" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {lang === "ar" ? "الكورسات والدروس" : "My Courses"}
          </button>
          <button
            onClick={() => setActiveTab("create_course")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "create_course" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {lang === "ar" ? "إضافة كورس جديد" : "Create New Course"}
          </button>
        </div>
      </div>

      {/* COURSES TAB */}
      {activeTab === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesList.map((c) => (
            <div key={c.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {c.grade}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3 mb-2">{c.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold">
                <span className="text-blue-600 dark:text-blue-400">{c.price} EGP</span>
                <span className="text-slate-400">Habib El Rahman</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COURSE FORM */}
      {activeTab === "create_course" && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">
            {lang === "ar" ? "إنشاء كورس جديد في المنصة" : "Publish New English Course"}
          </h2>

          <input
            type="text"
            placeholder={lang === "ar" ? "عنوان الكورس كامل..." : "Course Title..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          />

          <textarea
            rows={3}
            placeholder={lang === "ar" ? "وصف الكورس والوحدات..." : "Detailed Course Description..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="Preparatory">Preparatory (إعدادي)</option>
                <option value="Secondary">Secondary (ثانوي)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="First Prep">First Prep</option>
                <option value="Second Prep">Second Prep</option>
                <option value="Third Prep">Third Prep</option>
                <option value="First Secondary">First Secondary</option>
                <option value="Second Secondary">Second Secondary</option>
                <option value="Third Secondary (Baccalaureate)">Third Secondary (Baccalaureate)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateCourse}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition-all"
          >
            {lang === "ar" ? "نشر الكورس فوراً" : "Publish Course"}
          </button>

          {successMsg && (
            <p className="text-xs font-bold text-emerald-600 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === "ar" ? "تم إضافة الكورس بنجاح!" : "Course published successfully!"}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
