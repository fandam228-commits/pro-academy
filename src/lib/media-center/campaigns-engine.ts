// PRO MEDIA COMMAND CENTER — Marketing Campaigns Engine
// Student Enrollment Campaigns for Professional Academy with Budget, Lead, & ROI Tracking

export type CampaignGoal =
  | "thanawya_amma_prep"
  | "free_exam_viral"
  | "midterm_revision"
  | "general_enrollment";

export type CampaignStatus = "active" | "completed" | "paused";

export interface MarketingCampaignRecord {
  id: string;
  name: string;
  goal: CampaignGoal;
  targetStage: "Secondary" | "Preparatory";
  targetGrade: "First Secondary" | "Second Secondary" | "Third Secondary (Baccalaureate)";
  budgetEgp: number;
  spentEgp: number;
  clicksCount: number;
  leadsCount: number;
  registrationsCount: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  cta: string;
  targetPlatforms: Array<"facebook" | "youtube" | "tiktok">;
  conversionRate: number; // calculated: (registrations / clicks) * 100
  costPerRegistrationEgp: number; // calculated: spentEgp / registrations
  revenueEgp: number; // calculated: registrations * avgTicket
  roiPercentage: number; // calculated: (revenue - spent) / spent * 100
}

const DEFAULT_COURSE_PRICE_EGP = 650; // Average student enrollment price for Professional Academy

/**
 * 1. Calculates Campaign Conversion Rate (%).
 */
export function calculateConversionRate(registrations: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return parseFloat(((registrations / clicks) * 100).toFixed(2));
}

/**
 * 2. Calculates Cost Per Registration (CPR in EGP).
 */
export function calculateCostPerRegistration(spentEgp: number, registrations: number): number {
  if (registrations <= 0) return 0;
  return parseFloat((spentEgp / registrations).toFixed(2));
}

/**
 * 3. Calculates Campaign Revenue and ROI (%).
 */
export function calculateCampaignROI(
  registrations: number,
  spentEgp: number,
  coursePriceEgp: number = DEFAULT_COURSE_PRICE_EGP
): { revenueEgp: number; roiPercentage: number } {
  const revenueEgp = registrations * coursePriceEgp;
  if (spentEgp <= 0) {
    return { revenueEgp, roiPercentage: 0 };
  }
  const roiPercentage = parseFloat((((revenueEgp - spentEgp) / spentEgp) * 100).toFixed(1));
  return { revenueEgp, roiPercentage };
}

/**
 * 4. Formats a full campaign record with computed metrics.
 */
export function buildCampaignRecord(
  data: Omit<MarketingCampaignRecord, "conversionRate" | "costPerRegistrationEgp" | "revenueEgp" | "roiPercentage">,
  coursePriceEgp: number = DEFAULT_COURSE_PRICE_EGP
): MarketingCampaignRecord {
  const conversionRate = calculateConversionRate(data.registrationsCount, data.clicksCount);
  const costPerRegistrationEgp = calculateCostPerRegistration(data.spentEgp, data.registrationsCount);
  const { revenueEgp, roiPercentage } = calculateCampaignROI(data.registrationsCount, data.spentEgp, coursePriceEgp);

  return {
    ...data,
    conversionRate,
    costPerRegistrationEgp,
    revenueEgp,
    roiPercentage,
  };
}

/**
 * 5. Predefined Academy Campaign Templates for Quick Scaffolding
 */
export function getPredefinedCampaignTemplates(): Array<{
  name: string;
  goal: CampaignGoal;
  targetGrade: "Third Secondary (Baccalaureate)" | "Second Secondary" | "First Secondary";
  suggestedBudgetEgp: number;
  cta: string;
  description: string;
}> {
  return [
    {
      name: "حملة الفرمان النهائي — مراجعة ليلة الامتحان للثانوية العامة 2026",
      goal: "thanawya_amma_prep",
      targetGrade: "Third Secondary (Baccalaureate)",
      suggestedBudgetEgp: 15000,
      cta: "احجز كورس المراجعة النهائية واضمن الـ 50 درجة مع مستر حبيب الرحمن 🎯",
      description: "حملة مكثفة عبر فيسبوك ويوتيوب لجذب طلاب الثانوية العامة للاشتراك في معسكر المراجعة الشاملة.",
    },
    {
      name: "حملة الامتحان التجريبي المجاني (Viral Diagnostic Quiz)",
      goal: "free_exam_viral",
      targetGrade: "Third Secondary (Baccalaureate)",
      suggestedBudgetEgp: 5000,
      cta: "امتحن الآن مجاناً واعرف مستواك الحقيقي مع تقرير تشخيصي فوري لنقاط ضعفك 📊",
      description: "حملة انتشار فيروسي عبر تيك توك وفيسبوك لجمع بيانات الطلاب الراغبين في تقييم مستواهم.",
    },
    {
      name: "حملة كورس القواعد وبنك الكلمات لطلاب الصف الثاني الثانوي",
      goal: "midterm_revision",
      targetGrade: "Second Secondary",
      suggestedBudgetEgp: 8000,
      cta: "سجل الآن في كورس الـ Vocabulary & Grammar واقفل درجات الترم الأول 🚀",
      description: "حملة موجهة لطلاب الصف الثاني الثانوي لتعزيز اشتراكات نصف العام.",
    },
  ];
}

/**
 * 6. Realistic Seed Campaigns for Professional Academy
 */
export function getSeedMarketingCampaigns(): MarketingCampaignRecord[] {
  return [
    buildCampaignRecord({
      id: "camp_sec3_final_rev",
      name: "حملة معسكر الإنقاذ النهائي للثانوية العامة 2026",
      goal: "thanawya_amma_prep",
      targetStage: "Secondary",
      targetGrade: "Third Secondary (Baccalaureate)",
      budgetEgp: 18000,
      spentEgp: 12400,
      clicksCount: 8450,
      leadsCount: 1620,
      registrationsCount: 420,
      startDate: new Date(Date.now() - 86400000 * 14).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 16).toISOString(),
      status: "active",
      cta: "احجز مقعدك في معسكر الثانوية العامة مع مستر حبيب الرحمن واحصل على المذكرة الذهبية مجاناً!",
      targetPlatforms: ["facebook", "youtube", "tiktok"],
    }),
    buildCampaignRecord({
      id: "camp_free_exam_viral",
      name: "حملة الامتحان الإلكتروني الوزاري التجريبي المجاني",
      goal: "free_exam_viral",
      targetStage: "Secondary",
      targetGrade: "Third Secondary (Baccalaureate)",
      budgetEgp: 6000,
      spentEgp: 5800,
      clicksCount: 14200,
      leadsCount: 4100,
      registrationsCount: 680,
      startDate: new Date(Date.now() - 86400000 * 20).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "completed",
      cta: "اختبر مستواك في 20 دقيقة واستلم نتيجتك فاشلة أو ناجحة مع تقرير الأخطاء الشائع فوراً!",
      targetPlatforms: ["tiktok", "facebook"],
    }),
    buildCampaignRecord({
      id: "camp_sec2_grammar_boost",
      name: "حملة تفوق تانية ثانوي — كورس متلازمات وقواعد اللغة",
      goal: "midterm_revision",
      targetStage: "Secondary",
      targetGrade: "Second Secondary",
      budgetEgp: 7500,
      spentEgp: 2100,
      clicksCount: 2900,
      leadsCount: 540,
      registrationsCount: 110,
      startDate: new Date(Date.now() - 86400000 * 4).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 20).toISOString(),
      status: "active",
      cta: "انضم الآن لمجموعة مستر حبيب أونلاين لثانية ثانوي وادخل الامتحان بكل ثقة!",
      targetPlatforms: ["facebook", "youtube"],
    }),
  ];
}
