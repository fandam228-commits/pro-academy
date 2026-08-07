"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { BookOpen, Calendar, User, ArrowRight, Sparkles } from "lucide-react";

export const BlogView: React.FC = () => {
  const { lang } = useApp();
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  useEffect(() => {
    // Fetch blogs or use default
    setBlogsList([
      {
        id: "blog_1",
        title: "Top 10 Grammar Pitfalls in Thanawya Amma Exams and How to Avoid Them",
        author: "Mr. Habib El Rahman",
        date: "2025-03-20",
        coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
        excerpt: "Every year thousands of Third Secondary students lose points on subtle grammar exceptions. Here are Mr. Habib El Rahman's golden rules.",
        content: `In the latest Ministry of Education examination guidelines, English grammar tests assess contextual comprehension rather than mechanical rule repetition.

1. **Inverted Word Order (No sooner / Hardly / Scarcely):**
   When starting a sentence with negative adverbs, always invert the auxiliary verb:
   - *Incorrect:* No sooner he had finished his exam than he left.
   - *Correct:* No sooner had he finished his exam than he left.

2. **Since vs For with Present Perfect:**
   - Use 'since' for starting points in time (*since 2018, since last Tuesday*).
   - Use 'for' for total duration (*for 5 years, for three weeks*).

3. **Reported Speech Time Conversions:**
   Remember that 'tomorrow' becomes 'the following day' or 'the next day', and 'yesterday' becomes 'the day before' or 'the previous day'.`,
      },
      {
        id: "blog_2",
        title: "How to Build a Powerful Academic English Vocabulary for Prep & Secondary Stages",
        author: "Ms. Sarah Ahmed",
        date: "2025-03-18",
        coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
        excerpt: "Rote memorization doesn't stick long term. Discover active recall and mnemonic tricks.",
        content: `Vocabulary makes up over 40% of the final Thanawya Amma exam grade across translation, reading comprehension passages, and fill-in-blanks.

- **Active Recall Method:** Test yourself without looking at the Arabic translation.
- **Root Word Expansion:** Memorize common prefixes like *un-, dis-, im-, mis-* and suffixes like *-ment, -tion, -able*.`,
      },
    ]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
          {lang === "ar" ? "نصائح وإرشادات التفوق" : "Educational Insights"}
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-3">
          {lang === "ar" ? "مدونة مستر حبيب الرحمن" : "Mr. Habib's Official Blog"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {lang === "ar"
            ? "أحدث أسرار القواعد، مهارات الترجمة، والتكنيكات المعتمدة لحصد أعلى الدرجات في الثانوية العامة والإعدادية."
            : "Master Thanawya Amma & Preparatory English with strategies from expert language educators."}
        </p>
      </div>

      {!selectedBlog ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogsList.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBlog(b)}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{b.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{b.date}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{b.excerpt}</p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 gap-1.5">
                <span>{lang === "ar" ? "اقرأ المقال كاملاً" : "Read Full Article"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* SINGLE BLOG DETAIL */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedBlog(null)}
            className="mb-6 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            ← {lang === "ar" ? "العودة للمقالات" : "Back to Blog Posts"}
          </button>

          <img src={selectedBlog.coverImage} alt={selectedBlog.title} className="w-full h-64 object-cover rounded-2xl mb-6" />

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{selectedBlog.title}</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span>By {selectedBlog.author}</span>
            <span>Date: {selectedBlog.date}</span>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-wrap">
            {selectedBlog.content}
          </div>
        </div>
      )}
    </div>
  );
};
