// PRO MEDIA COMMAND CENTER — Phase 6 Test Suite
// Analytics Aggregation, Student Community Management & Academy Enrollment Campaigns

import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateEngagementRate,
  rankTopPerformingPosts,
  aggregateUnifiedAnalytics,
  getLiveConnectedAnalyticsSeed,
} from "../src/lib/media-center/analytics-engine.ts";

import {
  classifyStudentInteraction,
  generateReplySuggestion,
  approveAndDispatchReply,
  getSeedCommunityInteractions,
} from "../src/lib/media-center/community-engine.ts";

import {
  calculateConversionRate,
  calculateCostPerRegistration,
  calculateCampaignROI,
  buildCampaignRecord,
  getPredefinedCampaignTemplates,
  getSeedMarketingCampaigns,
} from "../src/lib/media-center/campaigns-engine.ts";

test("PRO MEDIA COMMAND CENTER — Phase 6 Analytics, Community & Campaigns Suite", async (t) => {
  await t.test("1. Analytics Engine & Data Provenance (Rule 8: Grounded Platform Metrics)", () => {
    // Engagement rate calculation
    const rate = calculateEngagementRate(100, 20, 30, 1000); // (150 / 1000) * 100 = 15%
    assert.equal(rate, 15);

    const zeroRate = calculateEngagementRate(100, 20, 30, 0);
    assert.equal(zeroRate, 0);

    // Seed data verification with strict provenance
    const seed = getLiveConnectedAnalyticsSeed();
    assert.ok(seed.totalViews > 0);
    assert.ok(seed.totalReach > 0);
    assert.ok(seed.totalEngagement > 0);
    assert.ok(seed.totalWatchTimeHours > 0);

    // Provenance strings must be present and verified
    assert.match(seed.platforms.facebook.dataSource, /Meta Graph API/);
    assert.match(seed.platforms.youtube.dataSource, /YouTube Data API/);
    assert.match(seed.platforms.tiktok.dataSource, /TikTok Content Posting API/);
  });

  await t.test("2. Top-Performing Content Leaderboard Ranking", () => {
    const posts = [
      { id: "1", title: "Low", platform: "facebook", format: "post", publishedAt: "2026-11-01", views: 1000, reactions: 10, comments: 2, shares: 1, engagementRate: 1.3 },
      { id: "2", title: "High", platform: "youtube", format: "video", publishedAt: "2026-11-02", views: 5000, reactions: 800, comments: 100, shares: 100, engagementRate: 20.0 },
      { id: "3", title: "Medium", platform: "tiktok", format: "short", publishedAt: "2026-11-03", views: 2000, reactions: 150, comments: 30, shares: 20, engagementRate: 10.0 },
    ];

    const ranked = rankTopPerformingPosts(posts, 2);
    assert.equal(ranked.length, 2);
    assert.equal(ranked[0].id, "2"); // Highest engagement rate
    assert.equal(ranked[1].id, "3");
  });

  await t.test("3. Student Comment Classification (5 Pillars)", () => {
    // Grammar question
    assert.equal(
      classifyStudentInteraction("هو ليه اخترنا had been waiting مش had waited في الجملة دي؟"),
      "grammar_question"
    );

    // Subscription inquiry
    assert.equal(
      classifyStudentInteraction("لو سمحت الحجز بكام وفين مكان السنتر ورقم الواتساب؟"),
      "subscription_inquiry"
    );

    // Exam query
    assert.equal(
      classifyStudentInteraction("فين رابط الامتحان الإلكتروني يا مستر عشان أعرف درجتي؟"),
      "exam_query"
    );

    // Praise
    assert.equal(
      classifyStudentInteraction("ربنا يباركلك يا مستر حبيب، أفضل شرح في مصر وفهمت القاعدة في 5 دقايق!"),
      "praise"
    );

    // Spam
    assert.equal(
      classifyStudentInteraction("تابعوني لزيادة المتابعين 10k مجانا في ساعتين فقط"),
      "spam"
    );
  });

  await t.test("4. AI-Assisted Educational Reply with Mandatory Educator Approval", () => {
    const suggestion = generateReplySuggestion(
      "أحمد محمود",
      "هو ليه اخترنا past perfect؟",
      "grammar_question"
    );

    assert.ok(suggestion.suggestedReply.includes("أحمد"));
    assert.ok(suggestion.suggestedReply.includes("Past Perfect"));
    assert.equal(suggestion.needsTeacherReview, true, "Rule 11: Teacher review is mandatory for all replies");

    // Educator approval and dispatch
    const sampleItem = getSeedCommunityInteractions()[0];
    const approved = approveAndDispatchReply(
      sampleItem,
      "أهلاً يا أحمد، الحدث الأقدم يأخذ Past Perfect دائماً. ممتاز!",
      "Mr. Habib El Rahman"
    );

    assert.equal(approved.success, true);
    assert.equal(approved.comment.status, "approved_sent");
    assert.equal(approved.comment.approvedReply, "أهلاً يا أحمد، الحدث الأقدم يأخذ Past Perfect دائماً. ممتاز!");
    assert.ok(approved.comment.repliedAt);
  });

  await t.test("5. Academy Marketing Campaigns ROI & CPR Financial Calculations", () => {
    // Conversion Rate: 400 registrations out of 8000 clicks = 5.0%
    const cr = calculateConversionRate(400, 8000);
    assert.equal(cr, 5.0);

    // Cost Per Registration (CPR): 10,000 EGP spent / 400 students = 25 EGP/student
    const cpr = calculateCostPerRegistration(10000, 400);
    assert.equal(cpr, 25.0);

    // Revenue & ROI: 400 students * 650 EGP ticket = 260,000 EGP revenue; spent: 10,000 EGP
    // Net profit = 250,000; ROI = 250,000 / 10,000 * 100 = 2500%
    const { revenueEgp, roiPercentage } = calculateCampaignROI(400, 10000, 650);
    assert.equal(revenueEgp, 260000);
    assert.equal(roiPercentage, 2500);

    // Predefined templates exist for Thanawya Amma & Secondary grades
    const templates = getPredefinedCampaignTemplates();
    assert.ok(templates.length >= 3);
    assert.ok(templates.some((t) => t.goal === "thanawya_amma_prep"));
  });

  await t.test("6. Campaign Lifecycle & Record Builder", () => {
    const rawData = {
      id: "camp_test_01",
      name: "حملة تجريبية",
      goal: "thanawya_amma_prep",
      targetStage: "Secondary",
      targetGrade: "Third Secondary (Baccalaureate)",
      budgetEgp: 5000,
      spentEgp: 2000,
      clicksCount: 2000,
      leadsCount: 300,
      registrationsCount: 100,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      status: "active",
      cta: "سجل الآن",
      targetPlatforms: ["facebook", "tiktok"],
    };

    const campaign = buildCampaignRecord(rawData, 500);
    assert.equal(campaign.conversionRate, 5.0); // (100 / 2000) * 100
    assert.equal(campaign.costPerRegistrationEgp, 20.0); // 2000 / 100
    assert.equal(campaign.revenueEgp, 50000); // 100 * 500
    assert.equal(campaign.roiPercentage, 2400); // (50000 - 2000) / 2000 * 100
  });
});
