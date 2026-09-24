import { db } from "@/db";
import { payments, activationCodes, enrollments, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { requireRoles } from "@/lib/security";

export async function GET(req: Request) {
  await ensureDbSetup();
  const { user, denied } = await requireRoles(req, ["admin"]);
  if (denied) return denied;
  void user;
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

    if (action === "redeem_code") {
      const { user, denied } = await requireRoles(req, ["student"]);
      if (denied) return denied;

      const normalizedCode = String(code || "").trim().toUpperCase();
      if (!normalizedCode) {
        return NextResponse.json({ error: "Activation code is required." }, { status: 400 });
      }

      const foundCodes = await db
        .select()
        .from(activationCodes)
        .where(eq(activationCodes.code, normalizedCode));

      if (foundCodes.length === 0) {
        return NextResponse.json({ error: "Invalid activation code. Please double check." }, { status: 400 });
      }

      const ac = foundCodes[0];
      if (ac.isUsed) {
        return NextResponse.json({ error: "This activation code has already been redeemed." }, { status: 400 });
      }

      const claimed = await db
        .update(activationCodes)
        .set({ isUsed: true, usedByStudentId: user!.id, usedAt: new Date() })
        .where(and(eq(activationCodes.id, ac.id), eq(activationCodes.isUsed, false)))
        .returning({ id: activationCodes.id });

      if (claimed.length === 0) {
        return NextResponse.json({ error: "This activation code was just redeemed. Please use another code." }, { status: 409 });
      }

      const existingEnr = await db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.studentId, user!.id), eq(enrollments.courseId, ac.courseId)));

      if (existingEnr.length === 0) {
        await db.insert(enrollments).values({
          id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          studentId: user!.id,
          courseId: ac.courseId,
          status: "active",
          progress: 0,
          completedLessonIds: [],
          paymentMethod: "activation_code",
        });
      }

      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: user!.id,
        title: "🎉 Course Unlocked!",
        message: "Your activation code was successfully accepted. Enjoy learning!",
        type: "payment",
      });

      return NextResponse.json({
        success: true,
        message: "Activation code redeemed successfully! Course unlocked.",
        courseId: ac.courseId,
      });
    }

    if (action === "submit_payment") {
      const { user, denied } = await requireRoles(req, ["student"]);
      if (denied) return denied;

      if (!courseId || !method) {
        return NextResponse.json({ error: "Course and payment method are required." }, { status: 400 });
      }

      const payId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const statusValue = "pending";

      const newPayment = {
        id: payId,
        studentId: user!.id,
        studentName: user!.name,
        courseId,
        amount: String(amount || "250.00"),
        method,
        transactionId: transactionId || `TXN-${Date.now()}`,
        senderNumber: senderNumber || "",
        status: statusValue,
        proofUrl: body.proofUrl || "",
      };

      await db.insert(payments).values(newPayment);

      return NextResponse.json({
        success: true,
        message: "Payment submitted for review. It will be verified by our team.",
        payment: newPayment,
      });
    }

    if (action === "update_status") {
      const { denied } = await requireRoles(req, ["admin"]);
      if (denied) return denied;

      if (!paymentId || !["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Invalid payment update." }, { status: 400 });
      }

      const paymentRows = await db.select().from(payments).where(eq(payments.id, paymentId));
      if (paymentRows.length === 0) {
        return NextResponse.json({ error: "Payment not found." }, { status: 404 });
      }

      const payment = paymentRows[0];
      await db.update(payments).set({ status }).where(eq(payments.id, paymentId));

      if (status === "approved" && payment.courseId) {
        const existingEnr = await db
          .select()
          .from(enrollments)
          .where(and(eq(enrollments.studentId, payment.studentId), eq(enrollments.courseId, payment.courseId)));

        if (existingEnr.length === 0) {
          await db.insert(enrollments).values({
            id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            studentId: payment.studentId,
            courseId: payment.courseId,
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
