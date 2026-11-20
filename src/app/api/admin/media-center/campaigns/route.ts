/**
 * PRO MEDIA COMMAND CENTER (PMC) — Marketing Campaigns API Route
 * Professional Academy — Mr. Habib El Rahman
 * Handles student enrollment marketing campaigns, ROI calculations, and academy targets.
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import {
  getSeedMarketingCampaigns,
  getPredefinedCampaignTemplates,
  buildCampaignRecord,
  type MarketingCampaignRecord,
} from "@/lib/media-center/campaigns-engine";

// In-memory runtime campaigns store
let campaignsStore: MarketingCampaignRecord[] = getSeedMarketingCampaigns();

export async function GET(req: Request) {
  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    const totalBudget = campaignsStore.reduce((acc, c) => acc + c.budgetEgp, 0);
    const totalSpent = campaignsStore.reduce((acc, c) => acc + c.spentEgp, 0);
    const totalRegistrations = campaignsStore.reduce((acc, c) => acc + c.registrationsCount, 0);
    const totalRevenue = campaignsStore.reduce((acc, c) => acc + c.revenueEgp, 0);
    const overallROI = totalSpent > 0 ? parseFloat((((totalRevenue - totalSpent) / totalSpent) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      campaigns: campaignsStore,
      templates: getPredefinedCampaignTemplates(),
      summary: {
        totalBudgetEgp: totalBudget,
        totalSpentEgp: totalSpent,
        totalRegistrations,
        totalRevenueEgp: totalRevenue,
        overallROI,
        activeCampaignsCount: campaignsStore.filter((c) => c.status === "active").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load campaigns." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Creating campaigns requires Editor or Super Admin authorization
  const auth = await requirePMCAuth(req, "editor");
  if (auth.denied) return auth.denied;

  try {
    const body = await req.json();
    const { name, goal, targetStage, targetGrade, budgetEgp, cta, targetPlatforms, startDate, endDate } = body;

    if (!name || !goal || !budgetEgp) {
      return NextResponse.json(
        { error: "Missing required fields: name, goal, budgetEgp." },
        { status: 400 }
      );
    }

    const newId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCampaign = buildCampaignRecord({
      id: newId,
      name,
      goal,
      targetStage: targetStage || "Secondary",
      targetGrade: targetGrade || "Third Secondary (Baccalaureate)",
      budgetEgp: Number(budgetEgp),
      spentEgp: 0,
      clicksCount: 0,
      leadsCount: 0,
      registrationsCount: 0,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 86400000 * 30).toISOString(),
      status: "active",
      cta: cta || "سجل الآن في الأكاديمية",
      targetPlatforms: targetPlatforms || ["facebook", "youtube", "tiktok"],
    });

    campaignsStore.unshift(newCampaign);

    return NextResponse.json({
      success: true,
      message: "New student enrollment campaign created successfully!",
      campaign: newCampaign,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create campaign." }, { status: 400 });
  }
}
