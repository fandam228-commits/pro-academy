import { authHeaders } from "@/lib/client-auth";

export interface QuestionSnapshot {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  domainCategory?: string;
  category?: string;
  unit?: string;
  grade?: string;
  difficulty?: string;
  [key: string]: any;
}

export interface UserMistakeItem {
  id: string;
  userId: string;
  questionId: string;
  questionSnapshot: QuestionSnapshot;
  wrongAnswer: string;
  mistakeCount: number;
  status: "unresolved" | "mastered";
  createdAt: string;
  updatedAt: string;
}

export interface MistakesStats {
  totalUnresolved: number;
  totalMastered: number;
  total: number;
}

export interface FetchMistakesResponse {
  success: boolean;
  mistakes: UserMistakeItem[];
  stats: MistakesStats;
  error?: string;
}

/**
 * Fetch mistakes for a student with optional status and category filters.
 */
export async function fetchMistakes(options?: {
  userId?: string;
  status?: "unresolved" | "mastered" | "all";
  category?: string;
  limit?: number;
}): Promise<FetchMistakesResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.userId) params.set("userId", options.userId);
    if (options?.status) params.set("status", options.status);
    if (options?.category && options.category !== "all" && options.category !== "الكل") {
      params.set("category", options.category);
    }
    if (options?.limit) params.set("limit", String(options.limit));

    const res = await fetch(`/api/mistakes?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch mistakes (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.error("fetchMistakes error:", err);
    return {
      success: false,
      mistakes: [],
      stats: { totalUnresolved: 0, totalMastered: 0, total: 0 },
      error: err.message,
    };
  }
}

/**
 * Record a single mistake (UPSERT).
 */
export async function recordMistake(
  questionData: QuestionSnapshot,
  wrongAnswer: string,
  userId?: string
): Promise<{ success: boolean; action?: string; error?: string }> {
  try {
    if (!questionData || !questionData.id) {
      return { success: false, error: "Invalid question data" };
    }

    const payload = {
      action: "record",
      userId,
      questionId: String(questionData.id),
      questionSnapshot: {
        id: String(questionData.id),
        questionText: questionData.questionText || (questionData as any).text || "",
        options: Array.isArray(questionData.options) ? questionData.options : [],
        correctAnswer: questionData.correctAnswer || (questionData as any).answer || "",
        explanation: questionData.explanation || "",
        domainCategory: questionData.domainCategory || questionData.category || "General",
        unit: questionData.unit || "",
        grade: questionData.grade || "",
        difficulty: questionData.difficulty || "medium",
      },
      wrongAnswer: String(wrongAnswer || ""),
    };

    const res = await fetch("/api/mistakes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("recordMistake error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Record bulk mistakes from a completed exam or quiz.
 */
export async function recordBulkMistakes(
  mistakes: Array<{ question: QuestionSnapshot; wrongAnswer: string }>,
  userId?: string
): Promise<{ success: boolean; recordedCount?: number; error?: string }> {
  try {
    if (!mistakes || mistakes.length === 0) return { success: true, recordedCount: 0 };

    const formattedList = mistakes.map((m) => ({
      questionId: String(m.question.id),
      questionSnapshot: {
        id: String(m.question.id),
        questionText: m.question.questionText || (m.question as any).text || "",
        options: Array.isArray(m.question.options) ? m.question.options : [],
        correctAnswer: m.question.correctAnswer || (m.question as any).answer || "",
        explanation: m.question.explanation || "",
        domainCategory: m.question.domainCategory || m.question.category || "General",
        unit: m.question.unit || "",
        grade: m.question.grade || "",
        difficulty: m.question.difficulty || "medium",
      },
      wrongAnswer: String(m.wrongAnswer || ""),
    }));

    const res = await fetch("/api/mistakes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        action: "bulk_record",
        userId,
        mistakes: formattedList,
      }),
    });

    return await res.json();
  } catch (err: any) {
    console.error("recordBulkMistakes error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Mark a mistake as resolved (student answered it correctly in Mistakes Bank).
 */
export async function resolveMistake(
  questionId: string,
  userId?: string
): Promise<{ success: boolean; action?: string; error?: string }> {
  try {
    const res = await fetch("/api/mistakes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        action: "resolve",
        questionId: String(questionId),
        userId,
      }),
    });

    return await res.json();
  } catch (err: any) {
    console.error("resolveMistake error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Clear all mastered mistakes for the user.
 */
export async function clearMasteredMistakes(
  userId?: string
): Promise<{ success: boolean; action?: string; error?: string }> {
  try {
    const res = await fetch("/api/mistakes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        action: "clear_mastered",
        userId,
      }),
    });

    return await res.json();
  } catch (err: any) {
    console.error("clearMasteredMistakes error:", err);
    return { success: false, error: err.message };
  }
}
