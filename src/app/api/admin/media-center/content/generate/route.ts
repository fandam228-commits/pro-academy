/**
 * PRO MEDIA COMMAND CENTER (PMC) — AI Content Generation API Route
 * Professional Academy — Mr. Habib El Rahman
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { db } from "@/db";
import {
  pmcContentProjects,
  pmcContentVariants,
  pmcApprovalRequests,
  pmcAuditLogs,
} from "@/db/schema";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { generateAcademicMultiplatformContent } from "@/lib/media-center/content-studio";

export async function POST(req: Request) {
  await ensureDbSetup();

  // Content Editors & Super Admin can generate content
  const auth = await requirePMCAuth(req, "editor");
  if (auth.denied) return auth.denied;

  try {
    const body = await req.json();
    const { sourceType, stage, grade, unitTitle, topicTitle, rawText, sourceReference } = body;

    if (!topicTitle) {
      return NextResponse.json({ error: "Missing topicTitle." }, { status: 400 });
    }

    // 1. Generate Curriculum-Grounded Content for Facebook, YouTube, TikTok
    const result = await generateAcademicMultiplatformContent({
      sourceType: sourceType || "curriculum_lesson",
      stage: stage || "Secondary",
      grade: grade || "Third Secondary (Baccalaureate)",
      unitTitle,
      topicTitle,
      rawText,
      sourceReference,
    });

    // 2. Persist in Database if configured
    if (process.env.DATABASE_URL) {
      // A. Create Project
      await db.insert(pmcContentProjects).values({
        id: result.projectId,
        title: result.title,
        stage: result.stage,
        grade: result.grade,
        sourceType: sourceType || "curriculum_lesson",
        sourceReference: result.sourceAttribution,
        sourceText: rawText || "",
        createdBy: auth.user!.id,
      });

      // B. Create the 3 Platform Variants & Pending Approval Requests
      const platforms: ("facebook" | "youtube" | "tiktok")[] = ["facebook", "youtube", "tiktok"];

      for (const platform of platforms) {
        const variant = result.variants[platform];
        const variantId = `var_${platform}_${result.projectId}`;

        await db.insert(pmcContentVariants).values({
          id: variantId,
          projectId: result.projectId,
          platform: variant.platform,
          postType: variant.postType,
          hook: variant.hook,
          script: variant.script,
          caption: variant.caption,
          description: variant.description,
          tags: variant.tags || [],
          hashtags: variant.hashtags || [],
          cta: variant.cta,
          thumbnailText: variant.thumbnailText,
          status: "READY_FOR_REVIEW",
          contentHash: variant.contentHash,
        });

        await db.insert(pmcApprovalRequests).values({
          id: `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          variantId,
          platform: variant.platform,
          requestedBy: auth.user!.id,
          status: "PENDING",
          contentSnapshotHash: variant.contentHash,
        });
      }

      // C. Audit Trail
      await db.insert(pmcAuditLogs).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actorId: auth.user!.id,
        actorName: auth.user!.name,
        action: "GENERATE_ACADEMIC_CONTENT",
        entityType: "project",
        entityId: result.projectId,
        details: { title: result.title, grade: result.grade, source: result.sourceAttribution },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Academic content generated and sent to Human Approval Center.",
      project: result,
    });
  } catch (error: any) {
    console.error("PMC Content Generation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in AI Content Generation", details: error?.message },
      { status: 500 }
    );
  }
}
