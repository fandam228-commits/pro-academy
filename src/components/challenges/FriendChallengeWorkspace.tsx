"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Swords,
  Trophy,
  Clock,
  Zap,
  Share2,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  Users,
  Award,
} from "lucide-react";
import { AchievementShareModal, AchievementData } from "../share/AchievementShareModal";

interface ChallengeQuestion {
  id: string;
  number: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic?: string;
}

interface ChallengeHistoryItem {
  id: string;
  inviteCode: string;
  gradeLevel: string;
  creatorName: string;
  creatorScore: number;
  creatorTimeSeconds: number;
  challengerName?: string | null;
  challengerScore?: number | null;
  challengerTimeSeconds?: number | null;
  status: "open" | "completed";
  createdAt: string;
}

export function FriendChallengeWorkspace() {
  const [stage, setStage] = useState<"idle" | "loading" | "playing" | "completed">("idle");
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(90);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [createdChallenge, setCreatedChallenge] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState<ChallengeHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Achievement Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch student's recent challenges history
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.challenges)) {
          setHistory(data.challenges);
        }
      }
    } catch (err) {
      console.warn("Failed to load challenges history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Timer loop during playing stage
  useEffect(() => {
    if (stage === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  // Start new challenge battle
  const startChallenge = async () => {
    try {
      setStage("loading");
      setErrorMsg(null);
      const res = await fetch("/api/challenges/random-questions?grade=3rd_sec");
      if (!res.ok) throw new Error("فشل في تحميل أسئلة التحدي");
      const data = await res.json();

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("لم يتم العثور على أسئلة متاحة حالياً");
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTimeLeft(90);
      setTimeElapsed(0);
      setScore(0);
      setStage("playing");
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ غير متوقع");
      setStage("idle");
    }
  };

  // Handle student selecting an option
  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Move to next question or finish
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  // Evaluate quiz and save challenge
  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let totalScore = 0;
    questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (
        selected &&
        q.correctAnswer &&
        selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      ) {
        totalScore++;
      }
    });

    setScore(totalScore);
    setStage("loading");

    try {
      // Create Challenge record on server
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel: "3rd_sec",
          creatorName: "طالب متفوق",
          creatorScore: totalScore,
          creatorTimeSeconds: timeElapsed,
          questions,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.challenge) {
        throw new Error(resData.error || "تعذر حفظ التحدي");
      }

      setCreatedChallenge(resData.challenge);
      setStage("completed");
      fetchHistory(); // Refresh history list

      // Prepare Achievement Share Data if score is high
      if (totalScore >= 3) {
        setAchievementData({
          title: totalScore === 5 ? "العلامة الكاملة في تحدي 1v1" : "بطل تحدي الأصدقاء 1v1",
          badgeType: totalScore === 5 ? "perfect_score" : "challenge_win",
          studentName: resData.challenge.creatorName || "طالب الأكاديمية",
          scoreText: `${totalScore} / 5`,
          speedText: `${timeElapsed} ثانية`,
          xpEarned: totalScore * 10,
          streakDays: 5,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل إرسال بيانات التحدي");
      setStage("completed");
    }
  };

  // Share link helpers
  const shareUrl =
    createdChallenge && typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/challenge/${createdChallenge.inviteCode}`
      : "";

  const whatsappMessage = `🔥 أتحداك في اللغة الإنجليزية مع مستر حبيب الرحمن!
حققت نتيجة ${score}/5 في ${timeElapsed} ثانية ⚡
هل تعتقد أنك تستطيع هزيمتي؟ خض التحدي الآن عبر الرابط التالي:
${shareUrl}`;

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl || whatsappMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  };

  const currentQ = questions[currentIndex];

  return (
    <div dir="rtl" className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-10">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#102340] to-[#0A1220] border border-amber-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold">
              <Swords className="w-4 h-4" />
              <span>تحدي الأصدقاء 1v1 • نظام المواجهة المباشرة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              من يمتلك السرعة والدقة؟ ⚔️
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              أجب عن 5 أسئلة في 90 ثانية، شارك الرابط مع زميلك على واتساب، واكتشف من يحسم المعركة
              ويحصد نقاط الـ XP مضاعفة!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {stage === "idle" && (
              <button
                onClick={startChallenge}
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(234,191,88,0.35)] transition-all active:scale-95"
              >
                <Swords className="w-5 h-5 stroke-[2.5px]" />
                <span>ابدأ التحدي وسجل رقمك (90 ثانية)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STAGE: LOADING */}
      {stage === "loading" && (
        <div className="p-12 text-center rounded-3xl bg-[#0B1528] border border-slate-800 space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">جاري إعداد ساحة المعركة وتجهيز الأسئلة...</h3>
          <p className="text-sm text-slate-400">تجهيز 5 أسئلة ذكية لقياس الفهم والقواعد بدقة</p>
        </div>
      )}

      {/* STAGE: PLAYING BATTLE */}
      {stage === "playing" && currentQ && (
        <div className="rounded-3xl bg-[#0B1528] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Battle Header Stats */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold border border-amber-500/30">
                السؤال {currentIndex + 1} من {questions.length}
              </span>
              {currentQ.topic && (
                <span className="hidden sm:inline-block text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                  {currentQ.topic}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold text-sm sm:text-base">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text Box (LTR for English) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-amber-400">Question {currentIndex + 1}:</p>
            <p
              dir="ltr"
              className="text-lg sm:text-xl font-semibold text-white leading-relaxed text-left font-sans"
            >
              {currentQ.questionText}
            </p>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedAnswers[currentQ.id] === opt;
              const optionLetters = ["A", "B", "C", "D"];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-right transition-all duration-200 active:scale-[0.98] ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(234,191,88,0.2)]"
                      : "bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <span
                    dir="ltr"
                    className="text-sm sm:text-base font-medium flex-1 text-left px-2"
                  >
                    {opt}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 font-black"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {optionLetters[i] || i + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              الوقت المستغرق: <strong className="text-slate-200">{timeElapsed} ثانية</strong>
            </span>

            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQ.id]}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold text-sm shadow-md transition-all"
            >
              <span>{currentIndex === questions.length - 1 ? "إنهاء التحدي وحفظ النتيجة" : "السؤال التالي"}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE: COMPLETED & SHARE SCREEN */}
      {stage === "completed" && createdChallenge && (
        <div className="rounded-3xl bg-[#0B1528] border border-amber-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              أحسنت! سَجَّلت رقمك القياسي بنجاح 🏆
            </h2>
            <p className="text-sm text-slate-300">
              الآن شارك كود التحدي أو الرابط المباشر مع زميلك لمعرفة من سيفوز بالمعركة!
            </p>
          </div>

          {/* Metrics Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xs text-slate-400">نتيجتك</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{score} / 5</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-xs text-slate-400">السرعة</span>
              <p className="text-2xl font-black text-sky-400 mt-1">{timeElapsed} ثانية</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400">كود التحدي</span>
              <p className="text-2xl font-mono font-black text-amber-400 mt-1">
                {createdChallenge.inviteCode}
              </p>
            </div>
          </div>

          {/* Share Links Box */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>إرسال التحدي لصديقك على واتساب</span>
            </h4>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={shareToWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-lg transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4 stroke-[2.5px]" />
                <span>إرسال عبر واتساب الآن</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-colors active:scale-95"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {achievementData && (
              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>عرض بطاقة الإنجاز لمشاركتها كـ Status</span>
              </button>
            )}

            <button
              onClick={() => {
                setStage("idle");
                setCreatedChallenge(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors mr-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>خوض تحدٍ جديد</span>
            </button>
          </div>
        </div>
      )}

      {/* RECENT CHALLENGES HISTORY */}
      <div className="rounded-3xl bg-[#0B1528] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">تحدياتك الأخيرة والمواجهات</h3>
          </div>
          <button
            onClick={fetchHistory}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تحديث</span>
          </button>
        </div>

        {loadingHistory ? (
          <div className="py-8 text-center text-slate-400 text-sm">جاري تحميل سجل التحديات...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm space-y-1">
            <p>لا توجد تحديات مسجلة حتى الآن.</p>
            <p className="text-xs text-slate-400">
              أنشئ تحديك الأول وتحدى أصدقاءك لتظهر مواجهاتكم هنا!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {history.map((item) => {
              const isOpen = item.status === "open";
              const isWin =
                !isOpen &&
                (item.creatorScore > (item.challengerScore || 0) ||
                  (item.creatorScore === item.challengerScore &&
                    item.creatorTimeSeconds < (item.challengerTimeSeconds || 999)));

              const isTie =
                !isOpen &&
                item.creatorScore === item.challengerScore &&
                item.creatorTimeSeconds === item.challengerTimeSeconds;

              return (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                        {item.inviteCode}
                      </span>
                      {isOpen ? (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                          بانتظار منافس ⏳
                        </span>
                      ) : isWin ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          فزت بالمعركة 🏆
                        </span>
                      ) : isTie ? (
                        <span className="text-xs font-bold text-sky-400 bg-sky-500/15 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                          تعادل بطولي 🤝
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                          فاز المنافس
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300">
                      صانع التحدي: <strong>{item.creatorName}</strong> ({item.creatorScore}/5 في{" "}
                      {item.creatorTimeSeconds} ث)
                      {item.challengerName && (
                        <span>
                          {" "}
                          ⚔️ المنافس: <strong>{item.challengerName}</strong> (
                          {item.challengerScore}/5 في {item.challengerTimeSeconds} ث)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/dashboard/challenge/${item.inviteCode}`}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors"
                    >
                      {isOpen ? "عرض رابط المواجهة" : "تفاصيل المعركة"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {achievementData && (
        <AchievementShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          data={achievementData}
        />
      )}
    </div>
  );
}

export default FriendChallengeWorkspace;
