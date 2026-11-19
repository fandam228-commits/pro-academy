import { authHeaders } from "@/lib/client-auth";

export interface GamificationProfile {
  userId: string;
  totalXp: number;
  weeklyXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  gradeLevel: string;
}

export interface LeaderboardStudent {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  initials: string;
  gradeLevel: string;
  weeklyXp: number;
  totalXp: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  grade: string;
  leaderboard: LeaderboardStudent[];
  topPodium: {
    first: LeaderboardStudent | null;
    second: LeaderboardStudent | null;
    third: LeaderboardStudent | null;
  };
  currentUserRank: LeaderboardStudent & {
    pointsToNextRank: number;
    nextRankTarget: number;
  };
}

export interface GamificationToastEvent {
  xp: number;
  message: string;
  streak?: number;
  actionType?: string;
}

// Global subscriber system for sleek celebration toasts
type ToastSubscriber = (event: GamificationToastEvent) => void;
const toastSubscribers: Set<ToastSubscriber> = new Set();

export function subscribeGamificationToast(callback: ToastSubscriber) {
  toastSubscribers.add(callback);
  return () => {
    toastSubscribers.delete(callback);
  };
}

export function triggerGamificationToast(event: GamificationToastEvent) {
  toastSubscribers.forEach((sub) => {
    try {
      sub(event);
    } catch (e) {
      console.error("Toast subscriber error:", e);
    }
  });
}

/**
 * Award XP to student based on standardized academic rules.
 */
export async function awardXP(params: {
  actionType:
    | "quiz_correct"
    | "quiz_bonus_90"
    | "mistake_resolved"
    | "translation_exercise"
    | "story_lesson"
    | "essay_submitted"
    | "exam_completed"
    | "flashcard_mastered"
    | "challenge_won"
    | "challenge_participated";
  referenceId?: string;
  customXp?: number;
  bonusXp?: number;
  userId?: string;
}): Promise<{ success: boolean; xpAwarded?: number; duplicate?: boolean }> {
  try {
    let baseAmount = params.customXp;
    if (baseAmount === undefined) {
      switch (params.actionType) {
        case "quiz_correct":
          baseAmount = 10;
          break;
        case "quiz_bonus_90":
          baseAmount = 50;
          break;
        case "mistake_resolved":
          baseAmount = 15;
          break;
        case "translation_exercise":
          baseAmount = 25;
          break;
        case "story_lesson":
          baseAmount = 20;
          break;
        case "essay_submitted":
          baseAmount = 30;
          break;
        case "exam_completed":
          baseAmount = 60;
          break;
        case "flashcard_mastered":
          baseAmount = 5;
          break;
        case "challenge_won":
          baseAmount = 40;
          break;
        case "challenge_participated":
          baseAmount = 15;
          break;
        default:
          baseAmount = 10;
      }
    }

    const res = await fetch("/api/gamification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        action: "award_xp",
        actionType: params.actionType,
        xp: baseAmount,
        bonusXp: params.bonusXp || 0,
        referenceId: params.referenceId,
        userId: params.userId,
      }),
    });

    const data = await res.json();
    if (data.success && !data.duplicate && (data.xpAwarded || baseAmount)) {
      const earned = data.xpAwarded || (baseAmount + (params.bonusXp || 0));
      let actionLabel = "إجابة صحيحة!";
      if (params.actionType === "quiz_bonus_90") actionLabel = "مكافأة التفوق في الاختبار (90%+)!";
      else if (params.actionType === "mistake_resolved") actionLabel = "إتقان سؤال من بنك الأخطاء!";
      else if (params.actionType === "translation_exercise") actionLabel = "إتمام تمرين ترجمة احترافي!";
      else if (params.actionType === "story_lesson") actionLabel = "إتمام فصل قصة أدبية!";
      else if (params.actionType === "challenge_won") actionLabel = "الفوز في تحدي الأصدقاء 1v1 🏆!";
      else if (params.actionType === "challenge_participated") actionLabel = "المشاركة في تحدي الأصدقاء ⚔️!";

      triggerGamificationToast({
        xp: earned,
        message: `+${earned} XP • ${actionLabel} استمر في التقدم 🔥`,
        streak: data.currentStreak,
        actionType: params.actionType,
      });
    }

    return data;
  } catch (err: any) {
    console.error("awardXP error:", err);
    return { success: false };
  }
}

/**
 * Fetch gamification profile for current or specified student.
 */
export async function fetchGamificationProfile(userId?: string): Promise<{
  success: boolean;
  profile?: GamificationProfile;
}> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);

    const res = await fetch(`/api/gamification?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return await res.json();
  } catch (err) {
    console.error("fetchGamificationProfile error:", err);
    return { success: false };
  }
}

/**
 * Fetch grade-filtered weekly leaderboard.
 */
export async function fetchWeeklyLeaderboard(
  grade?: string,
  userId?: string
): Promise<LeaderboardResponse> {
  try {
    const params = new URLSearchParams();
    if (grade && grade !== "all" && grade !== "الكل") params.set("grade", grade);
    if (userId) params.set("userId", userId);

    const res = await fetch(`/api/gamification/leaderboard?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    return await res.json();
  } catch (err: any) {
    console.error("fetchWeeklyLeaderboard error:", err);
    return {
      success: false,
      grade: grade || "all",
      leaderboard: [],
      topPodium: { first: null, second: null, third: null },
      currentUserRank: {
        rank: 0,
        userId: userId || "",
        name: "",
        initials: "",
        gradeLevel: "",
        weeklyXp: 0,
        totalXp: 0,
        currentStreak: 0,
        isCurrentUser: true,
        pointsToNextRank: 0,
        nextRankTarget: 0,
      },
    };
  }
}

export interface GovernorateLeagueItem {
  id: string;
  nameAr: string;
  nameEn: string;
  region: string;
  regionAr: string;
  capitalAr: string;
  emblemEmoji: string;
  shieldTier: string;
  shieldNameAr: string;
  shieldIcon: string;
  badgeColor: string;
  weeklyXp: number;
  totalXp: number;
  activeStudents: number;
  topSchool: string;
  rank: number;
  isUserGovernorate: boolean;
  topStudentAmbassador: {
    name: string;
    school: string;
    grade: string;
    weeklyXp: number;
  };
}

export interface SchoolLeagueItem {
  id: string;
  name: string;
  governorateId: string;
  governorateNameAr: string;
  type: string;
  typeLabelAr: string;
  badge: string;
  badgeLabelAr: string;
  activeStudents: number;
  weeklyXp: number;
  totalXp: number;
  rank: number;
  isUserSchool: boolean;
}

export interface LeagueResponse {
  success: boolean;
  cupSeason: string;
  governorates: GovernorateLeagueItem[];
  schools: SchoolLeagueItem[];
  currentUserLeague: {
    userId: string;
    studentName: string;
    governorateId: string;
    governorateNameAr: string;
    governorateRank: number;
    shieldNameAr: string;
    schoolName: string;
    schoolRank?: number;
    pointsToSurpassNextGov: number;
    weeklyXpContribution: number;
  };
  sharePayload: {
    headlineAr: string;
    fullMessageAr: string;
    whatsappUrl: string;
  };
}

/**
 * Fetch Inter-Governorate & School League standings.
 */
export async function fetchLeagueData(userId?: string): Promise<LeagueResponse | null> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);

    const res = await fetch(`/api/gamification/league?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("fetchLeagueData error:", err);
    return null;
  }
}

/**
 * Update student's governorate and school affiliation.
 */
export async function updateStudentLeagueProfile(payload: {
  governorate: string;
  schoolName?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  message?: string;
  bonusAwarded?: boolean;
  bonusXp?: number;
  sharePayload?: any;
}> {
  try {
    const res = await fetch("/api/gamification/league", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    console.error("updateStudentLeagueProfile error:", err);
    return { success: false, message: "فشل تحديث ملف دوري المحافظات" };
  }
}
