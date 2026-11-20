/**
 * PRO MEDIA COMMAND CENTER (PMC) — Overview API Route
 * Professional Academy — Mr. Habib El Rahman
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { db } from "@/db";
import {
  pmcSocialAccounts,
  pmcContentVariants,
  pmcApprovalRequests,
  pmcPublishingJobs,
  pmcAnalyticsSnapshots,
} from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function GET(req: Request) {
  await ensureDbSetup();

  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    // 1. Social Accounts Connection Status
    let socialAccounts: any[] = [];
    if (process.env.DATABASE_URL) {
      try {
        socialAccounts = await db
          .select({
            platform: pmcSocialAccounts.platform,
            accountName: pmcSocialAccounts.accountName,
            isConnected: pmcSocialAccounts.isConnected,
            pageId: pmcSocialAccounts.pageId,
            channelId: pmcSocialAccounts.channelId,
            lastTestedAt: pmcSocialAccounts.lastTestedAt,
          })
          .from(pmcSocialAccounts);
      } catch (err) {
        console.warn("Error querying pmc_social_accounts:", err);
      }
    }

    const platformStatus = {
      facebook: {
        connected: socialAccounts.some((a) => a.platform === "facebook" && a.isConnected),
        accountName: socialAccounts.find((a) => a.platform === "facebook")?.accountName || "Professional Academy",
        lastTested: socialAccounts.find((a) => a.platform === "facebook")?.lastTestedAt || null,
      },
      youtube: {
        connected: socialAccounts.some((a) => a.platform === "youtube" && a.isConnected),
        accountName: socialAccounts.find((a) => a.platform === "youtube")?.accountName || "Mr. Habib El Rahman",
        lastTested: socialAccounts.find((a) => a.platform === "youtube")?.lastTestedAt || null,
      },
      tiktok: {
        connected: socialAccounts.some((a) => a.platform === "tiktok" && a.isConnected),
        accountName: socialAccounts.find((a) => a.platform === "tiktok")?.accountName || "@habib_academy",
        lastTested: socialAccounts.find((a) => a.platform === "tiktok")?.lastTestedAt || null,
      },
    };

    // 2. Publication & Approval Counts
    let counts = {
      published: 0,
      readyForReview: 0,
      scheduled: 0,
      failed: 0,
      drafts: 0,
    };

    if (process.env.DATABASE_URL) {
      try {
        const variantRows = await db
          .select({
            status: pmcContentVariants.status,
            total: count(),
          })
          .from(pmcContentVariants)
          .groupBy(pmcContentVariants.status);

        for (const row of variantRows) {
          if (row.status === "PUBLISHED") counts.published = Number(row.total);
          else if (row.status === "READY_FOR_REVIEW") counts.readyForReview = Number(row.total);
          else if (row.status === "SCHEDULED") counts.scheduled = Number(row.total);
          else if (row.status === "FAILED") counts.failed = Number(row.total);
          else if (row.status === "DRAFT") counts.drafts = Number(row.total);
        }
      } catch (err) {
        console.warn("Error querying pmc_content_variants counts:", err);
      }
    }

    // 3. Aggregate Performance Metrics
    let metrics = {
      totalViews: 0,
      totalReach: 0,
      totalReactions: 0,
      totalComments: 0,
      totalShares: 0,
    };

    if (process.env.DATABASE_URL) {
      try {
        const agg = await db
          .select({
            totalViews: sql<number>`COALESCE(SUM(${pmcAnalyticsSnapshots.views}), 0)`,
            totalReach: sql<number>`COALESCE(SUM(${pmcAnalyticsSnapshots.reach}), 0)`,
            totalReactions: sql<number>`COALESCE(SUM(${pmcAnalyticsSnapshots.reactions}), 0)`,
            totalComments: sql<number>`COALESCE(SUM(${pmcAnalyticsSnapshots.commentsCount}), 0)`,
            totalShares: sql<number>`COALESCE(SUM(${pmcAnalyticsSnapshots.sharesCount}), 0)`,
          })
          .from(pmcAnalyticsSnapshots);

        if (agg.length > 0) {
          metrics = {
            totalViews: Number(agg[0].totalViews),
            totalReach: Number(agg[0].totalReach),
            totalReactions: Number(agg[0].totalReactions),
            totalComments: Number(agg[0].totalComments),
            totalShares: Number(agg[0].totalShares),
          };
        }
      } catch (err) {
        console.warn("Error querying pmc_analytics_snapshots:", err);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: {
        id: auth.user!.id,
        name: auth.user!.name,
        role: auth.user!.pmcRole,
        isSuperAdmin: auth.user!.isSuperAdmin,
      },
      platforms: platformStatus,
      counts,
      metrics,
    });
  } catch (error: any) {
    console.error("PMC Overview API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Command Center Overview", details: error?.message },
      { status: 500 }
    );
  }
}
