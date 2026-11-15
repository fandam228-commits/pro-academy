import { db } from "@/db";
import { trainingQuestions } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import AUDIT_DATA from "@/data/training-center-audit-report.json";

export async function GET() {
  try {
    await ensureDbSetup();

    // Query live statistics from the database
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingQuestions);
    const total = Number(totalResult[0]?.count || 0);

    const statusCountsResult = await db
      .select({
        status: trainingQuestions.validationStatus,
        count: sql<number>`count(*)`,
      })
      .from(trainingQuestions)
      .groupBy(trainingQuestions.validationStatus);

    const topicCountsResult = await db
      .select({
        topic: trainingQuestions.topic,
        count: sql<number>`count(*)`,
      })
      .from(trainingQuestions)
      .groupBy(trainingQuestions.topic);

    const publishedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingQuestions)
      .where(sql`${trainingQuestions.isPublished} = true`);

    const publishedCount = Number(publishedResult[0]?.count || 0);

    const liveStatusBreakdown: Record<string, number> = {};
    for (const r of statusCountsResult) {
      if (r.status) liveStatusBreakdown[r.status] = Number(r.count);
    }

    const liveTopicBreakdown: Record<string, number> = {};
    for (const r of topicCountsResult) {
      if (r.topic) liveTopicBreakdown[r.topic] = Number(r.count);
    }

    return NextResponse.json({
      success: true,
      audit: {
        sourceDocument: AUDIT_DATA.sourceDocument,
        totalPagesAudited: AUDIT_DATA.totalPagesAudited,
        totalQuestions: total > 0 ? total : AUDIT_DATA.totalExtracted,
        publishedCount: total > 0 ? publishedCount : AUDIT_DATA.publishedCount,
        publishedPercentage: total > 0 ? Math.round((publishedCount / total) * 100) : 62,
        statusBreakdown: Object.keys(liveStatusBreakdown).length > 0 ? liveStatusBreakdown : AUDIT_DATA.statusBreakdown,
        topicBreakdown: Object.keys(liveTopicBreakdown).length > 0 ? liveTopicBreakdown : AUDIT_DATA.topicBreakdown,
        documentInspection: {
          originalDocument: "3000 tests on grammar converted by Mr,Ahmed Said.docx",
          extractedDocument: "Professional_Question_Bank_20261108_233552.docx",
          extractionEngine: "OpenXML AST Parser + Multi-Status Validation Pipeline",
          rulesApplied: [
            "Preserve original English question wording strictly",
            "Preserve question numbering (1., 2., 4.1, etc.)",
            "Separate complete questions from OCR artifacts without deleting",
            "Hold incomplete and unverified items in Admin Review Queue",
            "Only publish pedagogical verified questions to students",
          ],
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/training-center/audit error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load audit report" },
      { status: 500 }
    );
  }
}
