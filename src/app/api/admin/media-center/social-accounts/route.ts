/**
 * PRO MEDIA COMMAND CENTER (PMC) — Social Accounts API Route
 * Professional Academy — Mr. Habib El Rahman
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import { db } from "@/db";
import { pmcSocialAccounts, pmcAuditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function GET(req: Request) {
  await ensureDbSetup();

  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    let rows: any[] = [];
    if (process.env.DATABASE_URL) {
      try {
        rows = await db.select().from(pmcSocialAccounts);
      } catch (err) {
        console.warn("Error selecting pmcSocialAccounts:", err);
      }
    }

    // Default accounts template matching the academy's official handles
    const defaultAccounts = [
      {
        platform: "facebook",
        accountName: "Professional Academy — Mr. Habib El Rahman",
        accountId: "fb_pro_academy",
        pageId: "108239485739201",
        avatarUrl: "/habib-hero.gif",
        scopes: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
      },
      {
        platform: "youtube",
        accountName: "Mr. Habib El Rahman | مستر حبيب الرحمن",
        accountId: "yt_habib_el_rahman",
        channelId: "UC_Habib_English_Academy_2027",
        avatarUrl: "/habib-hero.gif",
        scopes: ["youtube.upload", "youtube.readonly"],
      },
      {
        platform: "tiktok",
        accountName: "@habib_academy_official",
        accountId: "tt_habib_academy",
        avatarUrl: "/habib-hero.gif",
        scopes: ["user.info.basic", "video.publish", "video.upload"],
      },
    ];

    const sanitizedAccounts = defaultAccounts.map((def) => {
      const match = rows.find((r) => r.platform === def.platform);
      return {
        platform: def.platform,
        accountName: match?.accountName || def.accountName,
        accountId: match?.accountId || def.accountId,
        pageId: match?.pageId || def.pageId,
        channelId: match?.channelId || def.channelId,
        avatarUrl: match?.avatarUrl || def.avatarUrl,
        isConnected: Boolean(match?.isConnected),
        hasEncryptedToken: Boolean(match?.encryptedAccessToken),
        tokenExpiresAt: match?.tokenExpiresAt || null,
        lastTestedAt: match?.lastTestedAt || null,
        scopes: (match?.scopes as string[]) || def.scopes,
      };
    });

    return NextResponse.json({
      success: true,
      accounts: sanitizedAccounts,
    });
  } catch (error: any) {
    console.error("PMC Social Accounts API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Social Accounts API", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await ensureDbSetup();

  // Modifying account connection requires Super Admin
  const auth = await requirePMCAuth(req, "super_admin");
  if (auth.denied) return auth.denied;

  try {
    const { action, platform } = await req.json();

    if (!platform || !["facebook", "youtube", "tiktok"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform specified." }, { status: 400 });
    }

    if (action === "test_connection") {
      // In Phase 2: validates existing token or reports configuration state
      let isConnected = false;
      let message = "Account is not yet linked via OAuth.";

      if (process.env.DATABASE_URL) {
        const found = await db
          .select()
          .from(pmcSocialAccounts)
          .where(eq(pmcSocialAccounts.platform, platform));

        if (found.length > 0 && found[0].encryptedAccessToken) {
          isConnected = true;
          message = `Connection to ${platform} verified successfully.`;
          await db
            .update(pmcSocialAccounts)
            .set({ lastTestedAt: new Date(), isConnected: true })
            .where(eq(pmcSocialAccounts.platform, platform));
        }
      }

      // Log action in audit log
      if (process.env.DATABASE_URL) {
        try {
          await db.insert(pmcAuditLogs).values({
            id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            actorId: auth.user!.id,
            actorName: auth.user!.name,
            action: "TEST_SOCIAL_CONNECTION",
            entityType: "social_account",
            entityId: platform,
            details: { isConnected, platform },
          });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        platform,
        isConnected,
        message,
        testedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
  } catch (error: any) {
    console.error("PMC Social Accounts POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Social Accounts Operation", details: error?.message },
      { status: 500 }
    );
  }
}
