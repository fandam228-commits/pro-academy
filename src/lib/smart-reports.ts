import crypto from "crypto";
import { db } from "@/db";
import {
  users,
  attendanceRecords,
  quizSubmissions,
  homeworkSubmissions,
  parentProfiles,
  parentStudentLinks,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const SIGNING_SECRET = process.env.PARENT_REPORT_SIGNING_SECRET || "pa_habib_academy_smart_report_secret_key_2026";

export interface StudentReportData {
  student: {
    id: string;
    name: string;
    grade: string;
    stage: string;
    streak: number;
    points: number;
    level: string;
  };
  parent?: {
    id: string;
    name: string;
    phone: string;
    relationship: string;
  };
  period: "weekly" | "monthly";
  generatedDate: string;
  attendance: {
    totalSessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number; // 0 - 100
    statusLabel: string;
    records: Array<{
      date: string;
      sessionTitle: string;
      status: string;
    }>;
  };
  academic: {
    totalQuizzes: number;
    averagePercentage: number;
    highestScore: number;
    progressStatus: "Excellent" | "Very Good" | "Good" | "Needs Attention";
    progressStatusAr: string;
    recentExams: Array<{
      title: string;
      score: number;
      total: number;
      percentage: number;
      date: string;
    }>;
  };
  homework: {
    assigned: number;
    submitted: number;
    onTime: number;
    late: number;
    completionRate: number;
  };
  pedagogicalInsights: {
    strengths: string[];
    focusAreas: string[];
    habibRecommendations: string[];
  };
}

/**
 * Creates a cryptographically signed URL token for parent report access
 */
export function createSignedReportToken(payload: {
  studentId: string;
  parentId?: string;
  period: "weekly" | "monthly";
}): string {
  const data = {
    ...payload,
    exp: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days validity
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const jsonStr = JSON.stringify(data);
  const base64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto.createHmac("sha256", SIGNING_SECRET).update(base64Data).digest("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Validates signed report token and returns parsed payload
 */
export function verifySignedReportToken(token: string): {
  studentId: string;
  parentId?: string;
  period: "weekly" | "monthly";
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", SIGNING_SECRET).update(base64Data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(base64Data, "base64url").toString("utf8"));
    if (parsed.exp && parsed.exp < Date.now()) {
      return null; // Expired
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Generates the full rich student report data from database records
 */
export async function generateStudentReport(
  studentId: string,
  period: "weekly" | "monthly" = "weekly",
  parentId?: string
): Promise<StudentReportData | null> {
  const studentRows = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
  if (studentRows.length === 0) return null;
  const student = studentRows[0];

  // 1. Parent Details
  let parentInfo: StudentReportData["parent"] = undefined;
  if (parentId) {
    const pRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, parentId)).limit(1);
    if (pRows.length > 0) {
      parentInfo = {
        id: pRows[0].id,
        name: pRows[0].fullName,
        phone: pRows[0].primaryPhone,
        relationship: "Guardian",
      };
    }
  } else {
    // Find first linked parent
    const links = await db.select().from(parentStudentLinks).where(eq(parentStudentLinks.studentId, studentId)).limit(1);
    if (links.length > 0) {
      const pRows = await db.select().from(parentProfiles).where(eq(parentProfiles.id, links[0].parentId)).limit(1);
      if (pRows.length > 0) {
        parentInfo = {
          id: pRows[0].id,
          name: pRows[0].fullName,
          phone: pRows[0].primaryPhone,
          relationship: links[0].relationship || "Guardian",
        };
      }
    }
  }

  // 2. Attendance Records
  const allAtt = await db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.studentId, studentId))
    .orderBy(desc(attendanceRecords.createdAt));

  const totalSessions = allAtt.length || 0;
  const present = allAtt.filter((r) => r.status === "present").length;
  const absent = allAtt.filter((r) => r.status === "absent").length;
  const late = allAtt.filter((r) => r.status === "late").length;
  const excused = allAtt.filter((r) => r.status === "excused").length;

  const attendanceRate = totalSessions > 0 ? Math.round(((present + late * 0.7 + excused * 0.85) / totalSessions) * 100) : 100;
  let statusLabel = "ممتاز — التزام تام بالمواعيد";
  if (attendanceRate < 75) statusLabel = "يحتاج متابعة مكثفة — تكرار غياب";
  else if (attendanceRate < 88) statusLabel = "جيد — يرجى تجنب التأخير";

  // 3. Quiz / Exam Submissions
  const subs = await db
    .select()
    .from(quizSubmissions)
    .where(eq(quizSubmissions.studentId, studentId))
    .orderBy(desc(quizSubmissions.submittedAt));

  const totalQuizzes = subs.length;
  const averagePercentage =
    totalQuizzes > 0 ? Math.round(subs.reduce((sum, s) => sum + s.percentage, 0) / totalQuizzes) : 85;
  const highestScore = totalQuizzes > 0 ? Math.max(...subs.map((s) => s.percentage)) : 90;

  let progressStatus: StudentReportData["academic"]["progressStatus"] = "Very Good";
  let progressStatusAr = "جيد جداً ومتطور";
  if (averagePercentage >= 90) {
    progressStatus = "Excellent";
    progressStatusAr = "ممتاز ومتفوق دراسياً";
  } else if (averagePercentage >= 75) {
    progressStatus = "Very Good";
    progressStatusAr = "جيد جداً";
  } else if (averagePercentage >= 60) {
    progressStatus = "Good";
    progressStatusAr = "جيد ويحتاج مراجعة دورية";
  } else {
    progressStatus = "Needs Attention";
    progressStatusAr = "يحتاج اهتمام وتقوية";
  }

  // 4. Homework submissions
  const hwSubs = await db
    .select()
    .from(homeworkSubmissions)
    .where(eq(homeworkSubmissions.studentId, studentId));

  const hwSubmitted = hwSubs.length;
  const hwOnTime = hwSubs.filter((h) => h.status === "graded" || h.status === "submitted").length;
  const hwLate = hwSubs.filter((h) => h.status === "late").length;
  const hwAssigned = Math.max(hwSubmitted, 4);
  const hwCompletionRate = Math.round((hwSubmitted / hwAssigned) * 100);

  // 5. Pedagogical Insights
  const strengths: string[] = [];
  const focusAreas: string[] = [];
  const habibRecommendations: string[] = [];

  if (attendanceRate >= 90) {
    strengths.push("انضباط رائع في حضور الحصص والتفاعل المباشر");
  }
  if (averagePercentage >= 85) {
    strengths.push("استيعاب ممتاز لقواعد اللغة الإنجليزية وتطبيق صحيح للأزمنة التامة");
  } else {
    focusAreas.push("التركيز على مراجعة شيتات بنك الأسئلة للقواعد المركبة وحل المزيد من النماذج");
  }

  if (hwCompletionRate >= 80) {
    strengths.push("تسليم منتظم للواجبات والتطبيقات المنزلية في الموعد المحدد");
  } else {
    focusAreas.push("الاهتمام برفع الواجبات أولاً بأول وعدم تأجيلها لتفادي تراكم الدروس");
  }

  habibRecommendations.push("متابعة فيديوهات المراجعة الشاملة وحل اختبار الـ 50 سؤال التفاعلي أسبوعياً");
  habibRecommendations.push("المشاركة في الشات التعليمي وطرح الاستفسارات على المساعد الذكي بالأكاديمية");
  if (absent > 0) {
    habibRecommendations.push(`التنسيق لتعويض الحصص المتغيب عنها (${absent} حصة) من خلال منصة المذكرات والفيديوهات`);
  }

  return {
    student: {
      id: student.id,
      name: student.name,
      grade: student.grade || "الثانوية العامة",
      stage: student.stage || "المرحلة الثانوية",
      streak: student.streak || 1,
      points: student.points || 150,
      level: student.level || "Intermediate",
    },
    parent: parentInfo,
    period,
    generatedDate: new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    attendance: {
      totalSessions,
      present,
      absent,
      late,
      excused,
      attendanceRate,
      statusLabel,
      records: allAtt.slice(0, 8).map((r) => ({
        date: r.sessionDate,
        sessionTitle: r.sessionTitle,
        status: r.status,
      })),
    },
    academic: {
      totalQuizzes,
      averagePercentage,
      highestScore,
      progressStatus,
      progressStatusAr,
      recentExams: subs.slice(0, 5).map((s) => ({
        title: s.quizId,
        score: s.score,
        total: s.totalQuestions,
        percentage: s.percentage,
        date: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("ar-EG") : "",
      })),
    },
    homework: {
      assigned: hwAssigned,
      submitted: hwSubmitted,
      onTime: hwOnTime,
      late: hwLate,
      completionRate: hwCompletionRate,
    },
    pedagogicalInsights: {
      strengths,
      focusAreas,
      habibRecommendations,
    },
  };
}
