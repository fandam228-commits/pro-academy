import { db } from "@/db";
import { studyPlanner } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || "usr_student_1";

  try {
    const tasks = await db.select().from(studyPlanner).where(eq(studyPlanner.studentId, studentId));
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Planner GET error:", error);
    return NextResponse.json({ error: "Failed to fetch planner tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    const body = await req.json();
    const { action, studentId, task, dueDate, priority, taskId, isCompleted } = body;

    if (action === "create") {
      const newTask = {
        id: `sp_${Date.now()}`,
        studentId: studentId || "usr_student_1",
        task: task || "Study Unit Rule",
        dueDate: dueDate || new Date().toISOString().split("T")[0],
        priority: priority || "Medium",
        isCompleted: false,
      };
      await db.insert(studyPlanner).values(newTask);
      return NextResponse.json({ success: true, task: newTask });
    }

    if (action === "toggle") {
      await db
        .update(studyPlanner)
        .set({ isCompleted })
        .where(eq(studyPlanner.id, taskId));
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      await db.delete(studyPlanner).where(eq(studyPlanner.id, taskId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Planner POST error:", error);
    return NextResponse.json({ error: "Planner operation failed" }, { status: 500 });
  }
}
