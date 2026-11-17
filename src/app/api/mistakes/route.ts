import { NextResponse } from "next/server";
import { db } from "@/db";
import { userMistakes } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";

// In-memory fallback store when running without DATABASE_URL (CI, build, or disconnected local mode)
interface MemoryMistake {
  id: string;
  userId: string;
  questionId: string;
  questionSnapshot: any;
  wrongAnswer: string;
  mistakeCount: number;
  status: "unresolved" | "mastered";
  createdAt: Date;
  updatedAt: Date;
}

const globalMistakesStore = globalThis as typeof globalThis & {
  __paMistakesMemoryStore?: Map<string, MemoryMistake>;
};

if (!globalMistakesStore.__paMistakesMemoryStore) {
  globalMistakesStore.__paMistakesMemoryStore = new Map<string, MemoryMistake>();
}
const memoryStore = globalMistakesStore.__paMistakesMemoryStore;

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
  } catch (err) {
    // Soft fallback if DB setup fails in build or offline mode
  }

  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const statusFilter = searchParams.get("status") || "unresolved"; // 'unresolved' | 'mastered' | 'all'
    const categoryFilter = searchParams.get("category") || "all";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 300);

    // Resolve userId: authenticated user or provided userId (if admin/teacher or testing)
    const userId = ctx?.user?.id || queryUserId || "usr_student_1";

    let items: any[] = [];
    let stats = { totalUnresolved: 0, totalMastered: 0, total: 0 };

    const hasDatabase = Boolean(process.env.DATABASE_URL);

    if (hasDatabase) {
      try {
        // Query user mistakes
        const allUserRows = await db
          .select()
          .from(userMistakes)
          .where(eq(userMistakes.userId, userId))
          .orderBy(desc(userMistakes.updatedAt));

        // Compute stats
        const unresolvedCount = allUserRows.filter((r) => r.status === "unresolved").length;
        const masteredCount = allUserRows.filter((r) => r.status === "mastered").length;
        stats = {
          totalUnresolved: unresolvedCount,
          totalMastered: masteredCount,
          total: allUserRows.length,
        };

        // Filter rows by status
        let filtered = allUserRows;
        if (statusFilter !== "all") {
          filtered = filtered.filter((r) => r.status === statusFilter);
        }

        // Filter by category if requested
        if (categoryFilter !== "all") {
          filtered = filtered.filter((r) => {
            const snap = (r.questionSnapshot || {}) as any;
            const cat = String(snap.domainCategory || snap.category || "").toLowerCase();
            return cat.includes(categoryFilter.toLowerCase());
          });
        }

        items = filtered.slice(0, limit);
      } catch (dbErr) {
        console.warn("Mistakes API: Database query failed, falling back to memory store:", dbErr);
        items = getFromMemory(userId, statusFilter, categoryFilter, limit);
        stats = getMemoryStats(userId);
      }
    } else {
      items = getFromMemory(userId, statusFilter, categoryFilter, limit);
      stats = getMemoryStats(userId);
    }

    return NextResponse.json({
      success: true,
      mistakes: items,
      stats,
    });
  } catch (error: any) {
    console.error("Mistakes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch mistakes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
  } catch (err) {}

  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { action, questionId, questionSnapshot, wrongAnswer, userId: bodyUserId, mistakes } = body;

    const userId = ctx?.user?.id || bodyUserId || "usr_student_1";

    if (!action) {
      return NextResponse.json({ error: "Missing action in request body" }, { status: 400 });
    }

    const hasDatabase = Boolean(process.env.DATABASE_URL);

    // ACTION: RECORD SINGLE MISTAKE (UPSERT)
    if (action === "record") {
      if (!questionId || !questionSnapshot) {
        return NextResponse.json({ error: "questionId and questionSnapshot are required" }, { status: 400 });
      }

      const qIdStr = String(questionId);
      const wrongStr = String(wrongAnswer || "");

      if (hasDatabase) {
        try {
          const newId = `um_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await db
            .insert(userMistakes)
            .values({
              id: newId,
              userId,
              questionId: qIdStr,
              questionSnapshot,
              wrongAnswer: wrongStr,
              mistakeCount: 1,
              status: "unresolved",
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [userMistakes.userId, userMistakes.questionId],
              set: {
                mistakeCount: sql`${userMistakes.mistakeCount} + 1`,
                wrongAnswer: wrongStr,
                status: "unresolved",
                updatedAt: new Date(),
                questionSnapshot,
              },
            });

          return NextResponse.json({ success: true, action: "recorded", questionId: qIdStr });
        } catch (dbErr) {
          console.warn("Mistakes API: DB insert failed, falling back to memory:", dbErr);
          recordInMemory(userId, qIdStr, questionSnapshot, wrongStr);
          return NextResponse.json({ success: true, action: "recorded_memory", questionId: qIdStr });
        }
      } else {
        recordInMemory(userId, qIdStr, questionSnapshot, wrongStr);
        return NextResponse.json({ success: true, action: "recorded_memory", questionId: qIdStr });
      }
    }

    // ACTION: RESOLVE MISTAKE (STUDENT ANSWERED CORRECTLY IN MISTAKES BANK)
    if (action === "resolve") {
      if (!questionId) {
        return NextResponse.json({ error: "questionId is required" }, { status: 400 });
      }

      const qIdStr = String(questionId);

      if (hasDatabase) {
        try {
          await db
            .update(userMistakes)
            .set({
              status: "mastered",
              updatedAt: new Date(),
            })
            .where(and(eq(userMistakes.userId, userId), eq(userMistakes.questionId, qIdStr)));

          return NextResponse.json({ success: true, action: "resolved", questionId: qIdStr });
        } catch (dbErr) {
          console.warn("Mistakes API: DB resolve failed, updating memory:", dbErr);
          resolveInMemory(userId, qIdStr);
          return NextResponse.json({ success: true, action: "resolved_memory", questionId: qIdStr });
        }
      } else {
        resolveInMemory(userId, qIdStr);
        return NextResponse.json({ success: true, action: "resolved_memory", questionId: qIdStr });
      }
    }

    // ACTION: BULK RECORD (BATCH FROM COMPLETED QUIZZES / EXAMS)
    if (action === "bulk_record") {
      if (!Array.isArray(mistakes) || mistakes.length === 0) {
        return NextResponse.json({ success: true, count: 0 });
      }

      let recordedCount = 0;
      for (const m of mistakes) {
        if (!m.questionId || !m.questionSnapshot) continue;
        const qIdStr = String(m.questionId);
        const wrongStr = String(m.wrongAnswer || "");

        if (hasDatabase) {
          try {
            const newId = `um_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            await db
              .insert(userMistakes)
              .values({
                id: newId,
                userId,
                questionId: qIdStr,
                questionSnapshot: m.questionSnapshot,
                wrongAnswer: wrongStr,
                mistakeCount: 1,
                status: "unresolved",
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: [userMistakes.userId, userMistakes.questionId],
                set: {
                  mistakeCount: sql`${userMistakes.mistakeCount} + 1`,
                  wrongAnswer: wrongStr,
                  status: "unresolved",
                  updatedAt: new Date(),
                  questionSnapshot: m.questionSnapshot,
                },
              });
            recordedCount++;
          } catch (e) {
            recordInMemory(userId, qIdStr, m.questionSnapshot, wrongStr);
            recordedCount++;
          }
        } else {
          recordInMemory(userId, qIdStr, m.questionSnapshot, wrongStr);
          recordedCount++;
        }
      }

      return NextResponse.json({ success: true, recordedCount });
    }

    // ACTION: CLEAR MASTERED (DELETE RESOLVED MISTAKES)
    if (action === "clear_mastered") {
      if (hasDatabase) {
        try {
          await db
            .delete(userMistakes)
            .where(and(eq(userMistakes.userId, userId), eq(userMistakes.status, "mastered")));
        } catch (e) {
          clearMasteredInMemory(userId);
        }
      } else {
        clearMasteredInMemory(userId);
      }
      return NextResponse.json({ success: true, action: "cleared_mastered" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Mistakes POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

// Memory Store Helpers
function getFromMemory(userId: string, status: string, category: string, limit: number) {
  const all = Array.from(memoryStore.values()).filter((m) => m.userId === userId);
  let filtered = all;
  if (status !== "all") {
    filtered = filtered.filter((m) => m.status === status);
  }
  if (category !== "all") {
    filtered = filtered.filter((m) => {
      const snap = m.questionSnapshot || {};
      const cat = String(snap.domainCategory || snap.category || "").toLowerCase();
      return cat.includes(category.toLowerCase());
    });
  }
  return filtered
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

function getMemoryStats(userId: string) {
  const all = Array.from(memoryStore.values()).filter((m) => m.userId === userId);
  return {
    totalUnresolved: all.filter((m) => m.status === "unresolved").length,
    totalMastered: all.filter((m) => m.status === "mastered").length,
    total: all.length,
  };
}

function recordInMemory(userId: string, questionId: string, questionSnapshot: any, wrongAnswer: string) {
  const key = `${userId}:${questionId}`;
  const existing = memoryStore.get(key);
  if (existing) {
    existing.mistakeCount += 1;
    existing.wrongAnswer = wrongAnswer;
    existing.status = "unresolved";
    existing.updatedAt = new Date();
    existing.questionSnapshot = questionSnapshot;
  } else {
    memoryStore.set(key, {
      id: `um_mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      questionId,
      questionSnapshot,
      wrongAnswer,
      mistakeCount: 1,
      status: "unresolved",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

function resolveInMemory(userId: string, questionId: string) {
  const key = `${userId}:${questionId}`;
  const existing = memoryStore.get(key);
  if (existing) {
    existing.status = "mastered";
    existing.updatedAt = new Date();
  }
}

function clearMasteredInMemory(userId: string) {
  for (const [key, val] of memoryStore.entries()) {
    if (val.userId === userId && val.status === "mastered") {
      memoryStore.delete(key);
    }
  }
}
