import { db } from "@/db";
import { payments, activationCodes, enrollments, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  try {
    const allPayments = await db.select().from(payments);
    return NextResponse.json({ payments: allPayments });
  } catch (error) {
    console.error("Payments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    const body = await req.json();
    const { action, studentId, studentName, courseId, amount, method, transactionId, senderNumber, code, paymentId, status } = body;

    // 1. Redeem Activation Code
    if (action === "redeem_code") {
      const foundCodes = await db
        .select()
        .from(activationCodes)
        .where(eq(activationCodes.code, code.trim().toUpperCase()));

      if (foundCodes.length === 0) {
        return NextResponse.json({ error: "Invalid activation code. Please double check." }, { status: 400 });
      }

      const ac = foundCodes[0];
      if (ac.isUsed) {
        return NextResponse.json({ error: "This activation code has already been redeemed." }, { status: 400 });
      }

      // Mark code as used
      await db
        .update(activationCodes)
        .set({
          isUsed: true,
          usedByStudentId: studentId,
          usedAt: new Date(),
        })
        .where(eq(activationCodes.id, ac.id));

      // Enroll student in target course
      const targetCourseId = ac.courseId;
      const existingEnr = await db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, targetCourseId)));

      if (existingEnr.length === 0) {
        await db.insert(enrollments).values({
          id: `enr_${Date.now()}`,
          studentId,
          courseId: targetCourseId,
          status: "active",
          progress: 0,
          completedLessonIds: [],
          paymentMethod: "activation_code",
        });
      }

      // Add Notification
      await db.insert(notifications).values({
        id: `notif_${Date.now()}`,
        userId: studentId,
        title: "🎉 Course Unlocked via Code!",
        message: `Your activation code ${code} was successfully accepted. Enjoy learning!`,
        type: "payment",
      });

      return NextResponse.json({
        success: true,
        message: "Activation code redeemed successfully! Course unlocked.",
        courseId: targetCourseId,
      });
    }

    // 2. Submit Direct Payment (Vodafone Cash, InstaPay, Fawry, Stripe)
    if (action === "submit_payment") {
      const payId = `pay_${Date.now()}`;
      const statusValue = method === "stripe" ? "approved" : "pending"; // Instant approve for stripe simulation

      const newPayment = {
        id: payId,
        studentId,
        studentName: studentName || "Student",
        courseId: courseId || null,
        amount: String(amount || "250.00"),
        method,
        transactionId: transactionId || `TXN-${Date.now()}`,
        senderNumber: senderNumber || "",
        status: statusValue,
        proofUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80",
      };

      await db.insert(payments).values(newPayment);

      // If approved automatically (e.g. stripe or immediate approval)
      if (statusValue === "approved" && courseId) {
        await db.insert(enrollments).values({
          id: `enr_${Date.now()}`,
          studentId,
          courseId,
          status: "active",
          progress: 0,
          completedLessonIds: [],
          paymentMethod: method,
        });
      }

      return NextResponse.json({
        success: true,
        message: statusValue === "approved" ? "Payment successful and course activated!" : "Payment submitted for review. It will be verified shortly by our team.",
        payment: newPayment,
      });
    }

    // 3. Admin Update Payment Status (admin only)
    if (action === "update_status") {
      const { denied } = await requireRoles(req, ["admin"]);
      if (denied) return denied;

      await db
        .update(payments)
        .set({ status })
        .where(eq(payments.id, paymentId));

      if (status === "approved" && courseId) {
        const existingEnr = await db
          .select()
          .from(enrollments)
          .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));

        if (existingEnr.length === 0) {
          await db.insert(enrollments).values({
            id: `enr_${Date.now()}`,
            studentId,
            courseId,
            status: "active",
            progress: 0,
            completedLessonIds: [],
            paymentMethod: "manual_approval",
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Payments POST error:", error);
    return NextResponse.json({ error: "Payment action failed" }, { status: 500 });
  }
}
