"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { arenaSounds } from "@/lib/arena-sound-fx";
import {
  Swords,
  Shield,
  Trophy,
  Flame,
  Zap,
  Timer,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Crown,
  Heart,
  Skull,
  Award,
  Users,
  Compass,
  CheckCircle2,
  XCircle,
  MessageCircle,
} from "lucide-react";

interface ArenaQuestion {
  id: string;
  questionText: string;
  options: Array<{ label?: string; text?: string } | string>;
  correctAnswer: string;
  explanation?: string;
  domainCategory?: string;
  topic?: string;
}

interface MatchState {
  id: string;
  roomCode: string;
  stage: string;
  grade: string;
  status: "waiting" | "active" | "finished";
  player1Id: string;
  player1Name: string;
  player1Avatar: string;
  player1Hp: number;
  player1Score: number;
  player1Streak: number;
  player2Id?: string | null;
  player2Name?: string | null;
  player2Avatar?: string;
  player2Hp: number;
  player2Score: number;
  player2Streak: number;
  isVsBot: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: ArenaQuestion[];
  winnerId?: string | null;
}

interface LeaderboardEntry {
  id: string;
  studentName: string;
  avatar: string;
  grade: string;
  trophies: number;
  wins: number;
  losses: number;
  titleRank: string;
}

export const LiveQuizArenaWorkspace: React.FC<{ onBackToHome?: () => void }> = ({ onBackToHome }) => {
  const { user, lang } = useApp();

  // State Management
  const [viewMode, setViewMode] = useState<"lobby" | "waiting" | "battle" | "result">("lobby");
  const [match, setMatch] = useState<MatchState | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>("Third Secondary (Baccalaureate)");
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Battle In-Round State
  const [timeLeft, setTimeLeft] = useState<number>(12);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [roundFeedback, setRoundFeedback] = useState<{
    isCorrect: boolean;
    damageDealt: number;
    selfDamage: number;
    correctAnswer: string;
    explanation?: string;
    botHit?: boolean;
  } | null>(null);

  // Floating damage animation
  const [p1DamageAnim, setP1DamageAnim] = useState<number | null>(null);
  const [p2DamageAnim, setP2DamageAnim] = useState<number | null>(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTabLobby, setActiveTabLobby] = useState<"battle" | "leaderboard">("battle");

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load sound preference & Leaderboard on mount
  useEffect(() => {
    setIsMuted(arenaSounds.isMuted());
    fetchLeaderboard();

    // Check URL query parameters for ?room=CODE
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get("room");
      if (roomParam) {
        joinRoom(roomParam);
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    arenaSounds.setMuted(next);
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/arena?action=leaderboard");
      const data = await res.json();
      if (data.success && data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  };

  // ==========================================
  // ACTION 1: START QUICK MATCH (1v1 or AI Rival)
  // ==========================================
  const startQuickMatch = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      arenaSounds.playAttack();
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick_match",
          playerId: user?.id,
          playerName: user?.name,
          playerAvatar: "⚔️",
          grade: selectedGrade,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "تعذر بدء المبارزة السريعة");

      setMatch(data.match);
      if (data.match.status === "active") {
        startRound(data.match, 0);
      } else {
        setViewMode("waiting");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTION 2: CREATE CUSTOM ROOM
  // ==========================================
  const createCustomRoom = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      arenaSounds.playAttack();
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_room",
          playerId: user?.id,
          playerName: user?.name,
          playerAvatar: "⚔️",
          grade: selectedGrade,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "تعذر إنشاء الغرفة");

      setMatch(data.match);
      setViewMode("waiting");
      startWaitingRoomPolling(data.match.roomCode);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTION 3: JOIN CUSTOM ROOM
  // ==========================================
  const joinRoom = async (codeToJoin?: string) => {
    const code = (codeToJoin || joinCodeInput).toUpperCase().trim();
    if (!code) {
      setErrorMessage("يرجى إدخال كود الغرفة المكون من 6 خانات");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      arenaSounds.playAttack();
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join_room",
          roomCode: code,
          playerId: user?.id,
          playerName: user?.name,
          playerAvatar: "🛡️",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "فشل الانضمام للغرفة");

      setMatch(data.match);
      startRound(data.match, 0);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Polling for Player 2 joining custom room
  const startWaitingRoomPolling = (roomCode: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/arena?action=get_room&roomCode=${roomCode}`);
        const data = await res.json();
        if (data.success && data.match && data.match.status === "active") {
          clearInterval(interval);
          setMatch(data.match);
          startRound(data.match, 0);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  // ==========================================
  // ROUND LIFECYCLE & COUNTDOWN TIMER
  // ==========================================
  const startRound = (currentMatch: MatchState, questionIndex: number) => {
    setViewMode("battle");
    setTimeLeft(12);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setRoundFeedback(null);
    setP1DamageAnim(null);
    setP2DamageAnim(null);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Timeout automatic submission (0 damage / wrong answer penalty)
          handleTimeOut(currentMatch, questionIndex);
          return 0;
        }
        if (prev <= 4) {
          arenaSounds.playTick(true);
        } else if (prev <= 8) {
          arenaSounds.playTick(false);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = (currentMatch: MatchState, questionIndex: number) => {
    if (hasAnswered) return;
    submitAnswer(currentMatch, questionIndex, "__TIMEOUT__", 12);
  };

  // ==========================================
  // SUBMIT ANSWER & DEAL DAMAGE
  // ==========================================
  const submitAnswer = async (
    currentMatch: MatchState,
    questionIndex: number,
    answerText: string,
    timeTaken: number
  ) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedAnswer(answerText);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_answer",
          roomCode: currentMatch.roomCode,
          questionIndex,
          selectedAnswer: answerText,
          timeTakenSeconds: timeTaken,
          playerId: user?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const updated = data.match as MatchState;
      setMatch(updated);

      // Play Sound & Damage Feedback
      if (data.isCorrect) {
        arenaSounds.playCorrect();
        arenaSounds.playAttack();
        setP2DamageAnim(data.damageDealt);
      } else {
        arenaSounds.playWrong();
        setP1DamageAnim(data.selfDamage);
      }

      setRoundFeedback({
        isCorrect: data.isCorrect,
        damageDealt: data.damageDealt,
        selfDamage: data.selfDamage,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        botHit: data.botResult?.isCorrect,
      });

      // Advance after 2 seconds
      setTimeout(() => {
        if (updated.status === "finished") {
          finishMatch(updated);
        } else {
          startRound(updated, updated.currentQuestionIndex);
        }
      }, 2200);
    } catch (err: any) {
      console.error("Submit answer error:", err);
    }
  };

  const finishMatch = (finishedMatch: MatchState) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setViewMode("result");
    const isWinner = finishedMatch.winnerId === (user?.id || finishedMatch.player1Id);
    if (isWinner) {
      arenaSounds.playVictory();
    } else {
      arenaSounds.playDefeat();
    }
    fetchLeaderboard();
  };

  const copyShareLink = () => {
    if (!match) return;
    const shareUrl = `${window.location.origin}?tab=arena&room=${match.roomCode}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const shareViaWhatsApp = () => {
    if (!match) return;
    const shareUrl = `${window.location.origin}?tab=arena&room=${match.roomCode}`;
    const text = encodeURIComponent(
      `⚔️ أتحدّاك الآن في مبارزة إنجليزي حية 1 ضد 1 على منصة مستر حبيب الرحمن (Professional Academy)!\nادخل كود الغرفة: ${match.roomCode}\nأو اضغط على الرابط التالي لمواجهتي فوراً:\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const currentQ = match?.questions[match?.currentQuestionIndex || 0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER & SOUND CONTROL */}
      <header className="border-b border-purple-900/30 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للرئيسية</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <Swords className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black bg-gradient-to-r from-amber-300 via-purple-300 to-sky-300 bg-clip-text text-transparent">
                حلبة التحدي والمبارزة الحية 1v1
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Professional English Arena</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? "bg-slate-800/80 border-slate-700 text-slate-400"
                : "bg-purple-950/60 border-purple-600/50 text-amber-300 shadow-sm"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1 flex flex-col justify-center">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-200 text-sm font-bold flex items-center justify-between animate-shake">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white text-xs">
              إغلاق
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 1: ARENA LOBBY */}
        {/* ============================================================ */}
        {viewMode === "lobby" && (
          <div className="space-y-6">
            {/* HERO BANNER */}
            <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-purple-800/40 bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 shadow-2xl text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-900/60 border border-purple-700/50 text-amber-300 text-xs font-black uppercase tracking-wider mb-4">
                <Flame className="w-4 h-4 animate-bounce text-amber-400" />
                الموسم الأول 2026/2027
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-3">
                تحدَّ زملاءك في معركة لغة إنجليزية حية ⚔️
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed mb-6">
                10 أسئلة سريعة (12 ثانية لكل سؤال). كل إجابة صحيحة وسريعة تخصم من شريط حياة خصمك وتمنحك كؤوس أساطير الأكاديمية!
              </p>

              {/* STAGE & GRADE PICKER */}
              <div className="max-w-md mx-auto mb-6">
                <label className="block text-xs font-bold text-slate-400 mb-2">اختر المرحلة والصف الدراسي:</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-slate-800/90 border border-purple-700/60 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Third Secondary (Baccalaureate)">الثانوية العامة - الصف الثالث الثانوي</option>
                  <option value="Second Secondary">الصف الثاني الثانوي (المرحلة الثانوية)</option>
                  <option value="First Secondary">الصف الأول الثانوي (المرحلة الثانوية)</option>
                  <option value="Third Prep">الصف الثالث الإعدادي (الشهادة الإعدادية)</option>
                  <option value="Second Prep">الصف الثاني الإعدادي</option>
                  <option value="First Prep">الصف الأول الإعدادي</option>
                </select>
              </div>

              {/* ACTION BUTTONS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                {/* BUTTON 1: QUICK MATCH */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={startQuickMatch}
                  className="relative group p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white font-black text-sm sm:text-base shadow-xl shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-amber-300/40"
                >
                  <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>مبارزة سريعة فورية</span>
                </button>

                {/* BUTTON 2: CREATE CUSTOM ROOM */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={createCustomRoom}
                  className="p-4 rounded-2xl bg-slate-800/90 border border-purple-600/50 text-white font-extrabold text-sm sm:text-base hover:bg-purple-900/40 hover:border-purple-400 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <Share2 className="w-5 h-5 text-purple-400" />
                  <span>أنشئ غرفة وتحدَّ زميلك</span>
                </button>
              </div>

              {/* JOIN WITH CODE BOX */}
              <div className="mt-6 pt-6 border-t border-purple-900/30 max-w-md mx-auto flex items-center gap-2">
                <input
                  type="text"
                  placeholder="أدخل كود الغرفة (مثال: ARN-819)"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-800/70 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold text-white uppercase text-center placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => joinRoom()}
                  disabled={loading || !joinCodeInput.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-black rounded-2xl transition-all shadow-md"
                >
                  انضم
                </button>
              </div>
            </div>

            {/* HALL OF LEGENDS (LEADERBOARD) */}
            <div className="bg-slate-900/70 rounded-3xl p-6 border border-purple-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">قائمة أساطير الأكاديمية (Top Legends)</h3>
                </div>
                <span className="text-xs text-slate-400">تحديث دوري ومباشر</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leaderboard.slice(0, 6).map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      idx === 0
                        ? "bg-amber-950/30 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/30"
                        : idx === 1
                        ? "bg-slate-800/80 border-slate-600 text-slate-200"
                        : idx === 2
                        ? "bg-amber-900/20 border-amber-800/40 text-amber-300"
                        : "bg-slate-800/40 border-slate-800/80 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>{item.studentName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300">
                            {item.titleRank}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.grade}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{item.trophies} كأس</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold">{item.wins} فوز</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: WAITING FOR FRIEND TO JOIN */}
        {/* ============================================================ */}
        {viewMode === "waiting" && match && (
          <div className="max-w-lg mx-auto bg-slate-900/90 rounded-3xl p-8 border border-purple-800/50 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mx-auto mb-4 text-purple-400 animate-pulse">
              <Users className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">في انتظار دخول المنافس...</h3>
            <p className="text-xs text-slate-400 mb-6">
              شارك كود الغرفة أو الرابط مع زميلك، وستبدأ المعركة فور دخوله تلقائياً!
            </p>

            {/* Room Code Display */}
            <div className="bg-slate-950 border-2 border-dashed border-amber-500/60 rounded-3xl p-5 mb-6">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">كود الغرفة السري:</span>
              <span className="text-3xl font-black tracking-widest text-amber-300 font-mono select-all">
                {match.roomCode}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={shareViaWhatsApp}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إرسال دعوة التحدي عبر واتساب</span>
              </button>

              <button
                type="button"
                onClick={copyShareLink}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "تم نسخ الرابط بنجاح!" : "نسخ رابط التحدي المباشر"}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("lobby")}
                className="text-xs text-slate-500 hover:text-slate-300 pt-2 block mx-auto underline"
              >
                إلغاء والعودة للصالة
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: LIVE 1V1 BATTLE ARENA */}
        {/* ============================================================ */}
        {viewMode === "battle" && match && currentQ && (
          <div className="space-y-6">
            {/* TOP ARENA HUD: PLAYER 1 vs PLAYER 2 */}
            <div className="grid grid-cols-12 gap-3 items-center bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-purple-900/50 shadow-2xl relative">
              {/* PLAYER 1 (YOU) */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/50 flex items-center justify-center text-xl shadow-lg">
                    {match.player1Avatar || "⚔️"}
                  </div>
                  {p1DamageAnim !== null && (
                    <div className="absolute -top-3 -right-2 text-xs font-black text-red-400 bg-red-950 px-2 py-0.5 rounded-full border border-red-500 animate-bounce">
                      -{p1DamageAnim} HP
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white truncate">{match.player1Name} (أنت)</span>
                    <span className="text-[10px] font-black text-purple-300">{match.player1Hp}/100 HP</span>
                  </div>
                  {/* HEALTH BAR */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        match.player1Hp > 50
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : match.player1Hp > 25
                          ? "bg-gradient-to-r from-amber-500 to-amber-400"
                          : "bg-gradient-to-r from-red-600 to-red-400 animate-pulse"
                      }`}
                      style={{ width: `${Math.max(0, match.player1Hp)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-extrabold text-amber-400">
                    <span>{match.player1Score} نقطة</span>
                    {match.player1Streak > 1 && (
                      <span className="text-orange-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        {match.player1Streak}x كومبو
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CENTER VS & TIMER */}
              <div className="col-span-2 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-black uppercase text-slate-400 mb-0.5">
                  الجولة {(match.currentQuestionIndex || 0) + 1}/{match.totalQuestions}
                </div>

                {/* CIRCULAR TIMER */}
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-base shadow-lg transition-colors ${
                    timeLeft <= 3
                      ? "border-red-500 text-red-400 bg-red-950/60 animate-ping"
                      : timeLeft <= 6
                      ? "border-amber-500 text-amber-400 bg-amber-950/50"
                      : "border-purple-500 text-purple-300 bg-purple-950/50"
                  }`}
                >
                  {timeLeft}s
                </div>

                <div className="text-[10px] font-black text-amber-400 mt-1 uppercase tracking-widest">VS</div>
              </div>

              {/* PLAYER 2 (OPPONENT) */}
              <div className="col-span-5 flex items-center gap-3 text-left dir-ltr">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 border border-amber-400/50 flex items-center justify-center text-xl shadow-lg">
                    {match.player2Avatar || "🛡️"}
                  </div>
                  {p2DamageAnim !== null && (
                    <div className="absolute -top-3 -right-2 text-xs font-black text-red-400 bg-red-950 px-2 py-0.5 rounded-full border border-red-500 animate-bounce">
                      -{p2DamageAnim} HP
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white truncate">{match.player2Name || "المنافس"}</span>
                    <span className="text-[10px] font-black text-rose-300">{match.player2Hp}/100 HP</span>
                  </div>
                  {/* HEALTH BAR */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        match.player2Hp > 50
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : match.player2Hp > 25
                          ? "bg-gradient-to-r from-amber-500 to-amber-400"
                          : "bg-gradient-to-r from-red-600 to-red-400 animate-pulse"
                      }`}
                      style={{ width: `${Math.max(0, match.player2Hp)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-extrabold text-amber-400">
                    <span>{match.player2Score} pts</span>
                    {match.player2Streak > 1 && (
                      <span className="text-orange-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        {match.player2Streak}x combo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* QUESTION DISPLAY CARD */}
            <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-purple-800/40 shadow-2xl relative">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-950/90 border border-purple-700/60 text-purple-300">
                  {currentQ.domainCategory || "Grammar & Vocabulary"}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  سؤال سريع • السرعة تعطي مضاعفة نقاط ⚡
                </span>
              </div>

              {/* STEM */}
              <h3 className="text-lg sm:text-2xl font-black text-white leading-relaxed mb-6 text-left dir-ltr">
                {currentQ.questionText}
              </h3>

              {/* 4 BALANCED OPTIONS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(currentQ.options || []).slice(0, 4).map((opt, i) => {
                  const optText = typeof opt === "object" ? String(opt.text || opt.label || "") : String(opt);
                  const isSelected = selectedAnswer === optText;
                  const isCorrectAnswer = roundFeedback && optText === roundFeedback.correctAnswer;
                  const isWrongAnswer = roundFeedback && isSelected && !roundFeedback.isCorrect;

                  let cardStyle =
                    "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-100 hover:border-purple-400 hover:scale-[1.01]";

                  if (hasAnswered) {
                    if (isCorrectAnswer) {
                      cardStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-black shadow-lg ring-2 ring-emerald-500/50";
                    } else if (isWrongAnswer) {
                      cardStyle = "bg-rose-950/80 border-rose-500 text-rose-200 font-bold";
                    } else {
                      cardStyle = "bg-slate-900/50 border-slate-800 text-slate-500 opacity-50";
                    }
                  }

                  const labels = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => submitAnswer(match, match.currentQuestionIndex, optText, 12 - timeLeft)}
                      className={`p-4 rounded-2xl border text-left dir-ltr font-bold text-sm sm:text-base transition-all flex items-center gap-3.5 ${cardStyle}`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-300">
                        {labels[i]}
                      </span>
                      <span className="flex-1">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* ROUND FEEDBACK OVERLAY */}
              {roundFeedback && (
                <div
                  className={`mt-4 p-3.5 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold animate-fadeIn ${
                    roundFeedback.isCorrect
                      ? "bg-emerald-950/80 border-emerald-500/70 text-emerald-200"
                      : "bg-rose-950/80 border-rose-500/70 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {roundFeedback.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span>
                      {roundFeedback.isCorrect
                        ? `ضربة قاضية! ضربت خصمك بـ -${roundFeedback.damageDealt} HP ⚔️`
                        : `إجابة خاطئة! خسرت -${roundFeedback.selfDamage} HP 💔`}
                    </span>
                  </div>

                  {roundFeedback.explanation && (
                    <span className="text-[11px] text-slate-300 truncate max-w-xs hidden sm:block">
                      💡 {roundFeedback.explanation}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: FINAL VICTORY / DEFEAT RESULT */}
        {/* ============================================================ */}
        {viewMode === "result" && match && (
          <div className="max-w-xl mx-auto bg-slate-900/95 rounded-3xl p-8 border border-purple-800/60 shadow-2xl text-center relative overflow-hidden">
            {match.winnerId === (user?.id || match.player1Id) ? (
              // VICTORY SCREEN
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-2xl shadow-amber-500/40 animate-bounce">
                  <Trophy className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                    VICTORY ACHIEVED • فوز ساحق 🌟
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                    مبروك يا بطل الأكاديمية!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2">
                    لقد انتصرت في المبارزة وتفوقت على خصمك بالسرعة والدقة!
                  </p>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-purple-900/40">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">نقاطك الإجمالية</span>
                    <span className="text-xl font-black text-amber-300">{match.player1Score}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">كؤوس التحدي المكتسبة</span>
                    <span className="text-xl font-black text-emerald-400">+25 🏆</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const shareText = encodeURIComponent(
                        `🏆 كسبت مبارزة الإنجليزي 1v1 على منصة مستر حبيب الرحمن بنتيجة ${match.player1Score} نقطة! مين يتحداني؟`
                      );
                      window.open(`https://wa.me/?text=${shareText}`, "_blank");
                    }}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>مشاركة الفوز على واتساب</span>
                  </button>

                  <button
                    type="button"
                    onClick={startQuickMatch}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm rounded-2xl transition-all"
                  >
                    مبارزة جديدة فوراً ⚔️
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("lobby")}
                    className="text-xs text-slate-400 hover:text-white block mx-auto underline pt-1"
                  >
                    العودة لصالة التحدي
                  </button>
                </div>
              </div>
            ) : (
              // DEFEAT SCREEN
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                  <Shield className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    DEFEAT • مبارزة بطولية
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    حاول مرة أخرى.. الخسارة طريق التميز!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">
                    نصيحة مستر حبيب: راجع أخطاءك وقواعد الأزمنة، وتحدَّ خصمك في جولة جديدة!
                  </p>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">نقاطك</span>
                    <span className="text-xl font-black text-slate-300">{match.player1Score}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">نقاط الخصم</span>
                    <span className="text-xl font-black text-rose-400">{match.player2Score}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={startQuickMatch}
                    className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm rounded-2xl transition-all shadow-lg"
                  >
                    انتقام ومبارزة جديدة ⚔️
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("lobby")}
                    className="text-xs text-slate-400 hover:text-white block mx-auto underline pt-1"
                  >
                    العودة لصالة التحدي
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
