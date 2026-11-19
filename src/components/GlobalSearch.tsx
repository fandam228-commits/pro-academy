"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Search,
  BookOpen,
  FileText,
  Database,
  ArrowRight,
  Loader2,
  Sparkles,
  Languages,
  AlertTriangle,
  GraduationCap,
  MessageSquare,
  Film,
  Layers,
  CalendarDays,
  BrainCircuit,
  QrCode,
  CreditCard,
  Trophy,
} from "lucide-react";

export interface GlobalSearchProps {
  onSelectCourse?: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSelectCourse, onNavigateTab }) => {
  const { lang } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [courseResults, setCourseResults] = useState<any[]>([]);
  const [pdfResults, setPdfResults] = useState<any[]>([]);
  const [questionResults, setQuestionResults] = useState<any[]>([]);

  // Platform Tools & Modules Knowledge Index
  const platformTools = [
    {
      id: "translation",
      titleAr: "أكاديمية الترجمة الاحترافية",
      titleEn: "Translation Academy",
      descAr: "8 مسارات تدريبية و14 نمط أسئلة مع تقييم بالمعايير الخمسة",
      category: "عالم اللغة",
      icon: Languages,
      keywords: ["ترجمة", "ترجمه", "ترجم", "translation", "sentences", "vocab", "rubric", "pro"],
    },
    {
      id: "mistakes_bank",
      titleAr: "بنك أخطائي الذكي",
      titleEn: "Smart Mistakes Bank",
      descAr: "تجميع أخطاء الكويزات تلقائياً والتدريب عليها حتى الإتقان",
      category: "الاختبارات",
      icon: AlertTriangle,
      keywords: ["أخطاء", "اخطاء", "خطأ", "غلط", "غلطة", "mistakes", "bank", "review", "smart"],
    },
    {
      id: "training_center",
      titleAr: "مركز التدريب والامتحانات",
      titleEn: "Training Center",
      descAr: "أكثر من 894 سؤال ثانوية عامة مصنف بنظام التبديل الذكي",
      category: "الاختبارات",
      icon: Trophy,
      keywords: ["تدريب", "امتحان", "امتحانات", "training", "mcq", "shuffle", "اختبارات"],
    },
    {
      id: "exam_simulator",
      titleAr: "محاكي الامتحانات الشامل (3 ساعات)",
      titleEn: "Full Exam Simulator (3h)",
      descAr: "محاكاة واقعية لبوكليت الثانوية العامة مع توقيت رسمي وتصحيح",
      category: "الاختبارات",
      icon: GraduationCap,
      keywords: ["بوكليت", "محاكي", "شامل", "simulator", "exam", "3h", "ثانوية"],
    },
    {
      id: "essay_lab",
      titleAr: "مختبر المقال والفقرة",
      titleEn: "Essay & Paragraph Lab",
      descAr: "قوالب المقالات وروابط الجمل وتصحيح كتابي فوري",
      category: "عالم اللغة",
      icon: FileText,
      keywords: ["مقال", "مقالات", "فقرة", "فقرات", "essay", "paragraph", "writing", "كتابة"],
    },
    {
      id: "dialogues",
      titleAr: "مركز المحادثة الإنجليزية",
      titleEn: "Dialogue Mastery Center",
      descAr: "94 محادثة وزارية معتمدة لجميع صفوف المرحلة الإعدادية",
      category: "عالم اللغة",
      icon: MessageSquare,
      keywords: ["محادثة", "محادثات", "حوار", "dialogue", "dialogues", "prep", "إعدادي"],
    },
    {
      id: "story_world",
      titleAr: "عالم القصص والروايات الأدبية",
      titleEn: "Literature & Story World",
      descAr: "العجوز والبحر، مونت كريستو، حول العالم، وThe Lost World",
      category: "عالم اللغة",
      icon: Film,
      keywords: ["قصة", "قصص", "رواية", "روايات", "story", "literature", "novel", "العجوز", "مونت كريستو", "lost world"],
    },
    {
      id: "vocabulary_bank",
      titleAr: "بنك المفردات والتعبيرات الأكاديمي",
      titleEn: "Vocabulary Master Bank",
      descAr: "قاموس كلمات المنهج، المتلازمات، وحروف الجر",
      category: "عالم اللغة",
      icon: BookOpen,
      keywords: ["كلمات", "مفردات", "تعبيرات", "vocabulary", "vocab", "idioms", "words"],
    },
    {
      id: "flashcards",
      titleAr: "فلاش كاردز التكرار المتباعد (SRS)",
      titleEn: "Vocab Flashcards (SRS)",
      descAr: "حفظ الكلمات بالنطق البريطاني ونظام التكرار الذكي",
      category: "عالم اللغة",
      icon: Layers,
      keywords: ["فلاش", "كاردز", "بطاقات", "flashcards", "srs", "تكرار", "متباعد"],
    },
    {
      id: "curriculum",
      titleAr: "المناهج والصفوف الرسمية (2026/2027)",
      titleEn: "Official Curriculum System",
      descAr: "وحدات المنهج للمراحل الإعدادية والثانوية وتانية بكالوريا",
      category: "التعلم",
      icon: BookOpen,
      keywords: ["منهج", "مناهج", "وحدات", "صفوف", "curriculum", "units", "بكالوريا", "ثانوي"],
    },
    {
      id: "ministry_assessments",
      titleAr: "تقييمات الوزارة الرسمية 2026/2027",
      titleEn: "Official Ministry Assessments",
      descAr: "الأداءات الصفية والمنزلية والتقييمات الأسبوعية المعتمدة",
      category: "الاختبارات",
      icon: FileText,
      keywords: ["وزارة", "تقييمات", "تقييم", "أداءات", "اداءات", "moe", "ministry", "sheets"],
    },
    {
      id: "grammar",
      titleAr: "شروحات القواعد التفاعلية",
      titleEn: "Grammar Master Video Library",
      descAr: "شرح تفصيلي لقواعد وأزمنة اللغة الإنجليزية بالفيديو والتدريبات",
      category: "التعلم",
      icon: BrainCircuit,
      keywords: ["قواعد", "جرامر", "قاعده", "grammar", "tenses", "past", "present", "conditional"],
    },
    {
      id: "ai_assistant",
      titleAr: "المساعد الذكي (Habib AI Tutor)",
      titleEn: "Habib AI English Tutor",
      descAr: "اسأل أي سؤال في الإنجليزي واحصل على شرح فوري مبسط",
      category: "عالم اللغة",
      icon: Sparkles,
      keywords: ["ذكاء", "مساعد", "بوت", "ai", "tutor", "معلم", "سؤال"],
    },
    {
      id: "calendar",
      titleAr: "قاعة البث المباشر (Google Meet)",
      titleEn: "Live Classroom & Meet",
      descAr: "حصص الأونلاين التفاعلية ومواعيد المجموعات الحية",
      category: "التعلم",
      icon: CalendarDays,
      keywords: ["بث", "مباشر", "لايف", "ميت", "meet", "live", "google meet", "حصص"],
    },
    {
      id: "my_qr",
      titleAr: "بطاقة الطالب الذكية (Digital QR ID)",
      titleEn: "Student Digital QR ID",
      descAr: "باركود الطالب الرقمي للحضور في السنتر واستلام المذكرات",
      category: "حسابي",
      icon: QrCode,
      keywords: ["باركود", "كارت", "بطاقة", "qr", "id", "حضور", "سنتر"],
    },
    {
      id: "activate",
      titleAr: "شحن كروت المنصة الفورية",
      titleEn: "Redeem Voucher Card",
      descAr: "تفعيل اشتراكات الكورسات عبر إدخال كود الكارت",
      category: "حسابي",
      icon: CreditCard,
      keywords: ["شحن", "كارت", "كود", "تفعيل", "voucher", "activate", "كوبون"],
    },
  ];

  const matchedTools = query.trim().length >= 1
    ? platformTools.filter((t) => {
        const q = query.toLowerCase().trim();
        return (
          t.titleAr.toLowerCase().includes(q) ||
          t.titleEn.toLowerCase().includes(q) ||
          t.descAr.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
        );
      })
    : [];

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setCourseResults([]);
        setPdfResults([]);
        setQuestionResults([]);
        return;
      }
      setSearching(true);
      try {
        const [coursesRes, pdfsRes, qbRes] = await Promise.all([
          fetch("/api/courses"),
          fetch(`/api/pdfs?search=${encodeURIComponent(query)}`),
          fetch(`/api/question-bank?search=${encodeURIComponent(query)}&limit=15`),
        ]);
        const courses = (await coursesRes.json()).courses || [];
        const q = query.toLowerCase();
        setCourseResults(
          courses.filter(
            (c: any) =>
              c.title?.toLowerCase().includes(q) ||
              c.description?.toLowerCase().includes(q) ||
              c.grade?.toLowerCase().includes(q)
          )
        );
        setPdfResults((await pdfsRes.json()).documents || []);
        setQuestionResults(((await qbRes.json()).questions || []).slice(0, 6));
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleToolClick = (toolId: string) => {
    if (onNavigateTab) {
      onNavigateTab(toolId);
    } else {
      router.push(`/?tab=${toolId}`);
    }
  };

  const total = matchedTools.length + courseResults.length + pdfResults.length + questionResults.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-7">
      
      {/* SEARCH HEADER */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0E1E38] dark:text-white">
          {lang === "ar" ? "محرك البحث الذكي الشامل" : "Smart Global Discovery"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          {lang === "ar"
            ? "ابحث في الأدوات التخصصية، المناهج، الكورسات، مذكرات PDF، وبنك الأسئلة في مكان واحد"
            : "Search specialized tools, curriculum, courses, PDF documents & question bank at once"}
        </p>
      </div>

      {/* SEARCH INPUT BAR */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="w-5 h-5 absolute start-4 top-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder={lang === "ar" ? "اكتب اسم أداة أو كلمة (مثال: ترجمة / past perfect / العجوز والبحر / أخطائي)..." : "Search tools, topics, grammar or novels..."}
          className="w-full ps-12 pe-12 py-3.5 sm:py-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-sm font-medium text-[#0E1E38] dark:text-white shadow-xl focus:outline-none focus:border-[#2563EB]"
        />
        {searching && <Loader2 className="w-4 h-4 animate-spin absolute end-4 top-4.5 text-[#2563EB]" />}
      </div>

      {/* RESULTS COUNT FEEDBACK */}
      {query.trim().length >= 1 && (
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <span>{lang === "ar" ? `تم العثور على ${total} نتيجة لـ "${query}"` : `${total} results found for "${query}"`}</span>
        </div>
      )}

      {/* 1. MATCHED PLATFORM TOOLS (INSTANT NAVIGATION) */}
      {matchedTools.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-black text-sm text-[#0E1E38] dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#EABF58]" />
            <span>{lang === "ar" ? "الأدوات والخدمات المباشرة" : "Instant Tools & Services"} ({matchedTools.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchedTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition text-right rtl:text-right ltr:text-left flex items-start gap-3 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-xs text-[#0E1E38] dark:text-white group-hover:text-[#2563EB] transition-colors truncate">
                        {lang === "ar" ? tool.titleAr : tool.titleEn}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {tool.descAr}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2563EB] rtl:rotate-180 shrink-0 mt-1 transition-colors" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. COURSES RESULTS */}
      {courseResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-black text-sm text-[#0E1E38] dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
            <span>{lang === "ar" ? "الكورسات والصفوف" : "Courses & Stages"} ({courseResults.length})</span>
          </h2>
          <div className="space-y-2">
            {courseResults.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCourse && onSelectCourse(c.id)}
                className="w-full text-right rtl:text-right ltr:text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-xs hover:shadow-md transition flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div>
                  <p className="font-extrabold text-sm text-[#0E1E38] dark:text-white group-hover:text-[#2563EB] transition-colors">{c.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.grade} • {c.teacherName || "Mr. Habib El Rahman"}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] rtl:rotate-180 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. PDF DOCUMENTS RESULTS */}
      {pdfResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-black text-sm text-[#0E1E38] dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-500" />
            <span>{lang === "ar" ? "مذكرات وملفات PDF" : "PDF Booklets & Sheets"} ({pdfResults.length})</span>
          </h2>
          <div className="space-y-2">
            {pdfResults.map((p) => (
              <a
                key={p.id}
                href={`/api/pdfs/file/${p.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-right rtl:text-right ltr:text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400 shadow-xs hover:shadow-md transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <p className="font-extrabold text-sm text-[#0E1E38] dark:text-white group-hover:text-red-500 transition-colors">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.topic} • {p.grade}</p>
                </div>
                <FileText className="w-4 h-4 text-red-400 shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 4. QUESTION BANK RESULTS */}
      {questionResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-black text-sm text-[#0E1E38] dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            <span>{lang === "ar" ? "أسئلة من بنك الأسئلة الذكي" : "Smart Question Bank"} ({questionResults.length})</span>
          </h2>
          <div className="space-y-2">
            {questionResults.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="font-bold text-xs text-[#0E1E38] dark:text-white leading-relaxed">{q.questionText}</p>
                <div className="flex flex-wrap items-center gap-2 text-[10px] mt-1.5 font-bold">
                  {q.correctAnswer && (
                    <span className="text-emerald-600 dark:text-emerald-400">✓ الإجابة: {q.correctAnswer}</span>
                  )}
                  <span className="text-slate-400 font-medium">• {q.domainCategory} • {q.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {query.trim().length >= 2 && !searching && total === 0 && (
        <div className="text-center py-12 space-y-2">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            {lang === "ar" ? "لا توجد نتائج مطابقة لبحثك" : "No matching results found"}
          </p>
          <p className="text-xs text-slate-400">
            {lang === "ar"
              ? "جرب البحث بكلمات أخرى مثل: ترجمة، قصة، ماضي، قواعد، أو بوكليت"
              : "Try searching with words like: translation, past perfect, story, or booklet"}
          </p>
        </div>
      )}

    </div>
  );
};
