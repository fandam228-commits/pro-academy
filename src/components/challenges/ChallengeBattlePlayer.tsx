"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Swords,
  Trophy,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Share2,
  RotateCcw,
  ChevronLeft,
  Award,
  Zap,
} from "lucide-react";
import { AchievementShareModal, AchievementData } from "../share/AchievementShareModal";

interface ChallengeBattlePlayerProps {
  code: string;
}

export function ChallengeBattlePlayer({ code }: ChallengeBattlePlayerProps) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [playerName, setPlayerName] = useState("بطل التحدي");
  const [stage, setStage] = useState<"intro" | "battle" | "submitting" | "result">("intro");

  // Battle State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(90);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Result State
  const [submitResult, setSubmitResult] = useState<any>(null);

  // Achievement Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Challenge Details
  const fetchChallenge = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/challenges?code=${code}`);
      const data = await res.json();

      if (!res.ok || !data.challenge) {
        throw new Error(data.error || "التحدي غير موجود أو انتهت صلاحيته");
      }

      setChallenge(data.challenge);
      if (data.challenge.status === "completed") {
        setStage("result");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "تعذر تحميل بيانات التحدي");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchChallenge();
    }
  }, [code]);

  // Battle Countdown Timer
  useEffect(() => {
    if (stage === "battle") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleSubmitBattle();
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

  const handleStartBattle = () => {
    if (!challenge || !challenge.questions || challenge.questions.length === 0) {
      setErrorMsg("لا توجد أسئلة متوفرة في هذا التحدي");
      return;
    }
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTimeLeft(90);
    setTimeElapsed(0);
    setStage("battle");
  };

  const handleSelectOption = (qId: string, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  const handleNext = () => {
    if (!challenge?.questions) return;
    if (currentIndex < challenge.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitBattle();
    }
  };

  const handleSubmitBattle = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("submitting");

    try {
      const res = await fetch(`/api/challenges/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengerName: playerName.trim() || "بطل التحدي",
          challengerTimeSeconds: timeElapsed,
          answers: selectedAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.result) {
        throw new Error(data.error || "فشل إرسال إجابات التحدي");
      }

      setSubmitResult(data.result);
      setStage("result");

      // Prepare Achievement Share Data if challenger won or aced
      if (data.result.winner === "challenger" || data.result.challengerScore >= 4) {
        setAchievementData({
          title:
            data.result.winner === "challenger"
              ? "فوز ساحق في تحدي 1v1"
              : "أداء بطولي في تحدي 1v1",
          badgeType: data.result.winner === "challenger" ? "challenge_win" : "perfect_score",
          studentName: data.result.challengerName || playerName,
          scoreText: `${data.result.challengerScore} / 5`,
          speedText: `${data.result.challengerTimeSeconds} ثانية`,
          xpEarned: data.result.challengerXp || 40,
          streakDays: 6,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء تقييم التحدي");
      setStage("intro");
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto p-12 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-white">جاري تحميل بيانات التحدي...</h3>
      </div>
    );
  }

  if (errorMsg && !challenge) {
    return (
      <div dir="rtl" className="max-w-xl mx-auto p-8 rounded-3xl bg-[#0B1528] border border-rose-500/30 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">التحدي غير متاح</h2>
        <p className="text-sm text-slate-300">{errorMsg}</p>
        <Link
          href="/dashboard/challenge"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors"
        >
          <Swords className="w-4 h-4" />
          <span>الذهاب إلى ساحة التحديات</span>
        </Link>
      </div>
    );
  }

  const questions = challenge?.questions || [];
  const currentQ = questions[currentIndex];

  return (
    <div dir="rtl" className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-10">
      {/* STAGE: INTRO / ACCEPT CHALLENGE */}
      {stage === "intro" && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#102340] to-[#0A1220] border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
              <Swords className="w-4 h-4" />
              <span>مواجهة 1v1 مباشرة</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {challenge.creatorName} يتحداك في معركة إنجليزية! ⚔️
            </h1>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              5 أسئلة اختيار من متعدد في 90 ثانية. صاحب النتيجة الأعلى يفوز، وفي حال التعادل يفوز
              الأسرع في الثواني!
            </p>
          </div>

          {/* VS Card */}
          <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-center space-y-1">
              <span className="text-xs text-slate-400">صانع التحدي</span>
              <p className="text-lg font-bold text-amber-400">{challenge.creatorName}</p>
              <span className="text-xs text-slate-500">سجل نتيجته وينتظر نتيجتك!</span>
            </div>

            <div className="text-center space-y-1 border-r border-slate-800">
              <span className="text-xs text-slate-400">المتحدي (أنت)</span>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="اكتب اسمك هنا"
                className="w-full text-center bg-slate-800/80 border border-slate-700 focus:border-amber-400 text-white text-sm font-bold rounded-lg px-2 py-1 outline-none transition-colors"
              />
              <span className="text-xs text-emerald-400">جاهز للمنافسة!</span>
            </div>
          </div>

          {/* Rules & Rewards */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Clock className="w-4 h-4 text-sky-400 mx-auto mb-1" />
              <span className="text-slate-400 block">المدة</span>
              <strong className="text-slate-200">90 ثانية</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-slate-400 block">جائزة الفوز</span>
              <strong className="text-amber-400">+40 XP</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Award className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-slate-400 block">المشاركة</span>
              <strong className="text-emerald-400">+15 XP</strong>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartBattle}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-lg shadow-[0_0_25px_rgba(234,191,88,0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Swords className="w-5 h-5 stroke-[2.5px]" />
            <span>قبول التحدي وبدء المعركة الآن ⚔️</span>
          </button>
        </div>
      )}

      {/* STAGE: PLAYING BATTLE */}
      {stage === "battle" && currentQ && (
        <div className="rounded-3xl bg-[#0B1528] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header Stats */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold border border-amber-500/30">
              السؤال {currentIndex + 1} من {questions.length}
            </span>

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
            {currentQ.options.map((opt: string, i: number) => {
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
                  <span dir="ltr" className="text-sm sm:text-base font-medium flex-1 text-left px-2">
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
              <span>{currentIndex === questions.length - 1 ? "حسم النتيجة وإعلان الفائز" : "السؤال التالي"}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE: SUBMITTING EVALUATION */}
      {stage === "submitting" && (
        <div className="p-12 text-center rounded-3xl bg-[#0B1528] border border-slate-800 space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">جاري مراجعة الإجابات وتحديد الفائز بالمعركة...</h3>
        </div>
      )}

      {/* STAGE: FINAL RESULTS */}
      {stage === "result" && (
        <div className="rounded-3xl bg-[#0B1528] border border-amber-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Winner Banner */}
          {(() => {
            const res = submitResult || {
              winner:
                challenge.creatorScore > (challenge.challengerScore || 0)
                  ? "creator"
                  : challenge.creatorScore < (challenge.challengerScore || 0)
                  ? "challenger"
                  : challenge.creatorTimeSeconds < (challenge.challengerTimeSeconds || 999)
                  ? "creator"
                  : "tie",
              creatorName: challenge.creatorName,
              creatorScore: challenge.creatorScore,
              creatorTimeSeconds: challenge.creatorTimeSeconds,
              challengerName: challenge.challengerName || playerName,
              challengerScore: challenge.challengerScore ?? 0,
              challengerTimeSeconds: challenge.challengerTimeSeconds ?? 0,
              challengerXp: 40,
              questions: challenge.questions,
            };

            const isChallengerWin = res.winner === "challenger";
            const isCreatorWin = res.winner === "creator";
            const isTie = res.winner === "tie";

            return (
              <>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
                    <Trophy className="w-8 h-8" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {isTie
                      ? "تعادل بطولي مشرف بين المتنافسين! 🤝"
                      : isChallengerWin
                      ? `مبروك الفوز الساحق لـ ${res.challengerName}! 🏆`
                      : `فاز في التحدي ${res.creatorName}! 🏆`}
                  </h2>

                  <p className="text-sm text-slate-300">
                    {isTie
                      ? "تطابقت النتائج والسرعة في واحدة من أقوى جولات التحدي!"
                      : isChallengerWin
                      ? "حققت نتيجة باهرة وتفوقت في السرعة والدقة!"
                      : "أداء متميز وتجربة تعليمية قوية! تم تسجيل الأخطاء في بنك الأخطاء للتدريب."}
                  </p>
                </div>

                {/* Head-to-Head VS Cards */}
                <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  {/* Creator */}
                  <div
                    className={`p-4 rounded-xl text-center space-y-1 ${
                      isCreatorWin ? "bg-amber-500/10 border border-amber-500/30" : ""
                    }`}
                  >
                    <span className="text-xs text-slate-400">صانع التحدي</span>
                    <p className="text-base sm:text-lg font-bold text-white">{res.creatorName}</p>
                    <p className="text-2xl font-black text-amber-400">{res.creatorScore} / 5</p>
                    <span className="text-xs text-slate-400 block">{res.creatorTimeSeconds} ثانية</span>
                    {isCreatorWin && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full">
                        الفائز باللقب 👑
                      </span>
                    )}
                  </div>

                  {/* Challenger */}
                  <div
                    className={`p-4 rounded-xl text-center space-y-1 border-r border-slate-800 ${
                      isChallengerWin ? "bg-amber-500/10 border border-amber-500/30" : ""
                    }`}
                  >
                    <span className="text-xs text-slate-400">المتحدي</span>
                    <p className="text-base sm:text-lg font-bold text-white">{res.challengerName}</p>
                    <p className="text-2xl font-black text-sky-400">{res.challengerScore} / 5</p>
                    <span className="text-xs text-slate-400 block">{res.challengerTimeSeconds} ثانية</span>
                    {isChallengerWin && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-sky-400 bg-sky-400/20 px-2 py-0.5 rounded-full">
                        الفائز باللقب 👑
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                  {achievementData && (
                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>مشاركة بطاقة الفوز على واتساب</span>
                    </button>
                  )}

                  <Link
                    href="/dashboard/challenge"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all mr-auto"
                  >
                    <Swords className="w-4 h-4 stroke-[2.5px]" />
                    <span>خوض تحدٍ جديد</span>
                  </Link>
                </div>
              </>
            );
          })()}
        </div>
      )}

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

export default ChallengeBattlePlayer;
