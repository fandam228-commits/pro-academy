/**
 * PRO MEDIA COMMAND CENTER (PMC) — Community Inbox API Route
 * Professional Academy — Mr. Habib El Rahman
 * Handles student comments across Facebook, YouTube, TikTok and approved replies.
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import {
  getSeedCommunityInteractions,
  approveAndDispatchReply,
  type StudentCommentInteraction,
} from "@/lib/media-center/community-engine";

// In-memory runtime interactions storage
let communityStore: StudentCommentInteraction[] = getSeedCommunityInteractions();

export async function GET(req: Request) {
  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") || "all";
    const classification = searchParams.get("classification") || "all";
    const status = searchParams.get("status") || "all";

    const filtered = communityStore.filter((item) => {
      if (platform !== "all" && item.platform !== platform) return false;
      if (classification !== "all" && item.classification !== classification) return false;
      if (status !== "all" && item.status !== status) return false;
      return true;
    });

    const summary = {
      total: communityStore.length,
      pending: communityStore.filter((i) => i.status === "pending_review").length,
      replied: communityStore.filter((i) => i.status === "approved_sent").length,
      grammarQuestions: communityStore.filter((i) => i.classification === "grammar_question").length,
      subscriptionInquiries: communityStore.filter((i) => i.classification === "subscription_inquiry").length,
      examQueries: communityStore.filter((i) => i.classification === "exam_query").length,
    };

    return NextResponse.json({
      success: true,
      interactions: filtered,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load community inbox." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Replying requires Editor or Super Admin authorization
  const auth = await requirePMCAuth(req, "editor");
  if (auth.denied) return auth.denied;

  try {
    const body = await req.json();
    const { action, commentId, replyText } = body;

    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId." }, { status: 400 });
    }

    const idx = communityStore.findIndex((c) => c.id === commentId);
    if (idx === -1) {
      return NextResponse.json({ error: "Comment interaction not found." }, { status: 404 });
    }

    if (action === "ignore") {
      communityStore[idx].status = "ignored";
      return NextResponse.json({
        success: true,
        message: "Comment marked as ignored / hidden.",
        comment: communityStore[idx],
      });
    }

    if (action === "approve_reply") {
      if (!replyText || replyText.trim().length === 0) {
        return NextResponse.json({ error: "Cannot send an empty reply." }, { status: 400 });
      }

      const res = approveAndDispatchReply(
        communityStore[idx],
        replyText,
        auth.user?.name || "Mr. Habib El Rahman"
      );
      communityStore[idx] = res.comment;

      return NextResponse.json({
        success: true,
        message: "Reply approved and dispatched successfully to student!",
        comment: res.comment,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process comment action." }, { status: 400 });
  }
}
