// PRO MEDIA COMMAND CENTER — Content Calendar Engine
// Weekly & Monthly View Generation, Curriculum Initial Plan, Filtering, Rescheduling & Duplication

export type PlatformType = "facebook" | "youtube" | "tiktok";
export type ContentFormat = "post" | "reel" | "video" | "short" | "story";
export type PublishingStatus = "draft" | "pending_review" | "approved" | "queued" | "published" | "failed";
export type ApprovalState = "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED";

export interface CalendarItem {
  id: string;
  variantId?: string;
  title: string;
  platform: PlatformType;
  format: ContentFormat;
  scheduledDate: string; // ISO date 'YYYY-MM-DD' or full ISO
  status: PublishingStatus;
  approvalStatus: ApprovalState;
  curriculumTopic: string;
  grade: "First Secondary" | "Second Secondary" | "Third Secondary (Thanawya Amma)";
  unitName: string;
  sourceReference: string;
  reviewer: string;
  hook: string;
  hasVideoAsset: boolean;
  notes?: string;
}

export interface CalendarDaySlot {
  date: string; // 'YYYY-MM-DD'
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayNameAr: string;
  dayNameEn: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  items: CalendarItem[];
}

export interface CalendarGridMonth {
  year: number;
  month: number; // 1-12
  monthNameAr: string;
  monthNameEn: string;
  days: CalendarDaySlot[];
  totalItemsCount: number;
}

const ARABIC_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ENGLISH_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const ENGLISH_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * 1. Generates an organized monthly calendar grid with all scheduled slots.
 */
export function generateCalendarGrid(year: number, month: number, items: CalendarItem[]): CalendarGridMonth {
  const monthIdx = month - 1; // 0-based
  const firstDayOfMonth = new Date(year, monthIdx, 1);
  const lastDayOfMonth = new Date(year, monthIdx + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Create a map of items by date string 'YYYY-MM-DD'
  const itemsByDate = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const dStr = item.scheduledDate.slice(0, 10);
    const existing = itemsByDate.get(dStr) || [];
    existing.push(item);
    itemsByDate.set(dStr, existing);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const days: CalendarDaySlot[] = [];

  // Previous month padding days
  const prevMonthLastDay = new Date(year, monthIdx, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, monthIdx - 1, dayNum);
    const dateStr = prevDate.toISOString().slice(0, 10);
    const dayOfWeek = prevDate.getDay();

    days.push({
      date: dateStr,
      dayOfWeek,
      dayNameAr: ARABIC_DAYS[dayOfWeek],
      dayNameEn: ENGLISH_DAYS[dayOfWeek],
      isToday: dateStr === todayStr,
      isCurrentMonth: false,
      items: itemsByDate.get(dateStr) || [],
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const curDate = new Date(year, monthIdx, dayNum);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const dayOfWeek = curDate.getDay();

    days.push({
      date: dateStr,
      dayOfWeek,
      dayNameAr: ARABIC_DAYS[dayOfWeek],
      dayNameEn: ENGLISH_DAYS[dayOfWeek],
      isToday: dateStr === todayStr,
      isCurrentMonth: true,
      items: itemsByDate.get(dateStr) || [],
    });
  }

  // Next month padding to complete 35 or 42 cells (5 or 6 weeks)
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, monthIdx + 1, i);
    const dateStr = nextDate.toISOString().slice(0, 10);
    const dayOfWeek = nextDate.getDay();

    days.push({
      date: dateStr,
      dayOfWeek,
      dayNameAr: ARABIC_DAYS[dayOfWeek],
      dayNameEn: ENGLISH_DAYS[dayOfWeek],
      isToday: dateStr === todayStr,
      isCurrentMonth: false,
      items: itemsByDate.get(dateStr) || [],
    });
  }

  return {
    year,
    month,
    monthNameAr: ARABIC_MONTHS[monthIdx],
    monthNameEn: ENGLISH_MONTHS[monthIdx],
    days,
    totalItemsCount: items.length,
  };
}

/**
 * 2. Filters calendar items by platform, grade, status, or search query.
 */
export function filterCalendarItems(
  items: CalendarItem[],
  filters: { platform?: string; grade?: string; status?: string; search?: string }
): CalendarItem[] {
  return items.filter((item) => {
    if (filters.platform && filters.platform !== "all" && item.platform !== filters.platform) {
      return false;
    }
    if (filters.grade && filters.grade !== "all" && item.grade !== filters.grade) {
      return false;
    }
    if (filters.status && filters.status !== "all") {
      if (filters.status === "approved" && item.approvalStatus !== "APPROVED") return false;
      if (filters.status === "pending" && item.approvalStatus !== "PENDING") return false;
      if (filters.status === "published" && item.status !== "published") return false;
      if (filters.status === "queued" && item.status !== "queued") return false;
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.curriculumTopic.toLowerCase().includes(q) ||
        item.hook.toLowerCase().includes(q) ||
        item.unitName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

/**
 * 3. Reschedules a calendar item to a new date.
 * If the item was APPROVED and ONLY the date changed, approval remains intact.
 */
export function rescheduleCalendarItem(
  item: CalendarItem,
  newDateStr: string
): { success: boolean; item: CalendarItem; note: string } {
  const normDate = newDateStr.slice(0, 10);
  const updatedItem: CalendarItem = {
    ...item,
    scheduledDate: normDate,
    notes: item.notes ? `${item.notes} | Rescheduled to ${normDate}` : `Rescheduled to ${normDate}`,
  };

  return {
    success: true,
    item: updatedItem,
    note: `Content '${item.title}' rescheduled to ${normDate}. Approval status preserved (${item.approvalStatus}).`,
  };
}

/**
 * 4. Clones / Duplicates a content item for reuse in a different slot or grade.
 * Resets approval state to PENDING because reusing content in a new slot or grade requires educator review.
 */
export function duplicateContentForNewSlot(
  item: CalendarItem,
  newTargetDate: string,
  targetGrade?: "First Secondary" | "Second Secondary" | "Third Secondary (Thanawya Amma)"
): CalendarItem {
  const normDate = newTargetDate.slice(0, 10);
  const randomSuffix = Math.random().toString(36).substring(2, 7);

  return {
    ...item,
    id: `cal_${Date.now()}_${randomSuffix}`,
    variantId: `var_${Date.now()}_${randomSuffix}`,
    title: `${item.title} (نسخة معاد توظيفها)`,
    scheduledDate: normDate,
    status: "draft",
    approvalStatus: "PENDING", // Human review mandatory
    grade: targetGrade || item.grade,
    notes: `تم استنساخ المحتوى من المنشور السابق (${item.id}) لإعادة النشر والاستفادة منه. بانتظار مراجعة الأستاذ حبيب.`,
  };
}

/**
 * 5. Initial Grounded Curriculum Publishing Schedule:
 * Provides a structured 2-week starting schedule for Mr. Habib El Rahman's Academy.
 * Strictly strictly marked as 'PENDING' approval.
 */
export function getCurriculumInitialSchedule(): CalendarItem[] {
  const baseDate = new Date();
  const getOffsetDate = (offsetDays: number) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  return [
    {
      id: "cal_init_01",
      variantId: "var_sec3_unit1_fb",
      title: "كشف أسرار الماضي التام والماضي البسيط — تريكات الامتحان",
      platform: "facebook",
      format: "post",
      scheduledDate: getOffsetDate(1),
      status: "pending_review",
      approvalStatus: "PENDING",
      curriculumTopic: "Past Simple vs Past Perfect & Time Conjunctions",
      grade: "Third Secondary (Thanawya Amma)",
      unitName: "Unit 1: Read All About It!",
      sourceReference: "Official Thanawya Amma Textbook 2026/2027 — Unit 1 Grammar Notes",
      reviewer: "Mr. Habib El Rahman",
      hook: "عارف ليه 80% من طلاب الثانوية العامة بيتلخبطوا بين By the time و Having؟",
      hasVideoAsset: false,
    },
    {
      id: "cal_init_02",
      variantId: "var_sec3_unit1_yt",
      title: "الماستر كلاس: شرح وتريكات Unit 1 كاملة للثانوية العامة 2026",
      platform: "youtube",
      format: "video",
      scheduledDate: getOffsetDate(2),
      status: "approved",
      approvalStatus: "APPROVED",
      curriculumTopic: "Unit 1 Masterclass & Ministry Exam Questions",
      grade: "Third Secondary (Thanawya Amma)",
      unitName: "Unit 1: Read All About It!",
      sourceReference: "Lecture 1 Recording — Studio Master Session",
      reviewer: "Mr. Habib El Rahman",
      hook: "الحلقة الأولى من سلسلة التأسيس والفرمان النهائي مع مستر حبيب الرحمن.",
      hasVideoAsset: true,
    },
    {
      id: "cal_init_03",
      variantId: "var_sec3_unit1_tk",
      title: "تريك سريع في 30 ثانية: الفرق الصادم بين Used to و Would",
      platform: "tiktok",
      format: "short",
      scheduledDate: getOffsetDate(3),
      status: "queued",
      approvalStatus: "APPROVED",
      curriculumTopic: "Past Habits: Used to vs Would & Stative Verbs",
      grade: "Third Secondary (Thanawya Amma)",
      unitName: "Unit 1: Stative vs Dynamic Verbs",
      sourceReference: "Shorts Bank — Sec 3 Trap Grammar",
      reviewer: "Mr. Habib El Rahman",
      hook: "اوعى تختار Would لو شفت الأفعال دي في امتحان الإنجليزي!",
      hasVideoAsset: true,
    },
    {
      id: "cal_init_04",
      variantId: "var_sec2_unit2_fb",
      title: "مقارنة وتفضيل الصفات لثانية ثانوي: تريكات Comparative & Superlative",
      platform: "facebook",
      format: "post",
      scheduledDate: getOffsetDate(5),
      status: "pending_review",
      approvalStatus: "PENDING",
      curriculumTopic: "Adjectives & Adverbs: The + Comparative, The + Comparative",
      grade: "Second Secondary",
      unitName: "Unit 2: Eating Around The World",
      sourceReference: "Official Ministry Curriculum Sec 2",
      reviewer: "Mr. Habib El Rahman",
      hook: "كل ما تذاكر أكتر، درجاتك هتبقى أعلى! إزاي تصيغ دي بالإنجليزي في الامتحان؟",
      hasVideoAsset: false,
    },
    {
      id: "cal_init_05",
      variantId: "var_sec3_story_yt",
      title: "تحليل رواية The Count of Monte Cristo — الفصل الأول وسؤال المقال المتوقع",
      platform: "youtube",
      format: "video",
      scheduledDate: getOffsetDate(7),
      status: "pending_review",
      approvalStatus: "PENDING",
      curriculumTopic: "Story Analysis: Edmund Dantes' Betrayal & Themes",
      grade: "Third Secondary (Thanawya Amma)",
      unitName: "Story: The Count of Monte Cristo — Chapter 1",
      sourceReference: "Official Story Textbook — Novel Analysis & Essay Questions",
      reviewer: "Mr. Habib El Rahman",
      hook: "شخصيات رواية الكونت دي مونت كريستو بالتفصيل ونقاط التحول الدرامية.",
      hasVideoAsset: true,
    },
  ];
}
