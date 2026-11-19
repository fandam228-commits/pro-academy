/**
 * Smart WhatsApp Parent Report Formatter
 * Generates high-converting, professional, Arabic WhatsApp messages with
 * rich metrics, pedagogical insights from Mr. Habib El Rahman, and instant
 * encrypted web report access links.
 */

export interface FormattedParentReport {
  studentName: string;
  periodLabel: string;
  summaryText: string;
  whatsappMessage: string;
  whatsappLink: string;
  directPhoneLink?: string;
  reportUrl: string;
  stats: {
    attendanceRate: number;
    averageScore: number;
    streak: number;
    points: number;
    masteredMistakes: number;
    homeworkCompletion: number;
  };
}

/**
 * Normalizes phone numbers to standard E.164 format (Egyptian or international)
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  let cleaned = rawPhone.replace(/[^\d+]/g, "").trim();

  // Strip leading 00
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  // Handle + prefix
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  // Egyptian numbers starting with 01 (e.g. 010, 011, 012, 015)
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    cleaned = "20" + cleaned.slice(1);
  }

  return cleaned;
}

export function formatWhatsAppParentReport(params: {
  report: any;
  reportUrl: string;
  parentPhone?: string;
}): FormattedParentReport {
  const { report, reportUrl, parentPhone } = params;
  const student = report.student || { name: "الطالب", grade: "الثانوية العامة", streak: 1, points: 100 };
  const period = report.period || "weekly";
  const attendance = report.attendance || { attendanceRate: 100, present: 0, absent: 0 };
  const academic = report.academic || { averagePercentage: 85, progressStatus: "Very Good", progressStatusAr: "جيد جداً" };
  const homework = report.homework || { completionRate: 100, submitted: 0 };
  const mistakesBank = report.mistakesBank;
  const pedagogicalInsights = report.pedagogicalInsights;

  const periodLabel = period === "weekly" ? "الأسبوعي" : "الشهري";
  const dateStr =
    report.generatedDate ||
    new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Rating and sentiment icon
  let ratingEmoji = "🌟";
  if (academic.progressStatus === "Needs Attention") ratingEmoji = "⚠️";
  else if (academic.progressStatus === "Good") ratingEmoji = "👍";
  else if (academic.progressStatus === "Very Good") ratingEmoji = "👏";

  const lines: string[] = [
    `*🏛️ منصة مستر حبيب الرحمن للغة الإنجليزية*`,
    `*📊 كشف المتابعة والتقرير ${periodLabel} الشامل*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 *الطالب:* ${student.name}`,
    `🎓 *المرحلة:* ${student.grade || "الثانوية العامة"}`,
    `📅 *تاريخ التقرير:* ${dateStr}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*📈 المؤشرات الأكاديمية والالتزام:*`,
    `• 🎯 *نسبة حضور الحصص:* ${attendance.attendanceRate}% (${attendance.present} حضور / ${attendance.absent} غياب)`,
    `• 📝 *متوسط درجات الاختبارات:* ${academic.averagePercentage}% (${ratingEmoji} ${academic.progressStatusAr})`,
    `• 📚 *تسليم الواجبات:* ${homework.completionRate}% (${homework.submitted} تم تسليمه)`,
    `• 🔥 *الاستمرارية والتفاعل:* ${student.streak} أيام متواصلة • ${student.points} نقطة XP`,
  ];

  // Smart Mistakes Bank insight
  if (mistakesBank && mistakesBank.total > 0) {
    lines.push(
      `• 🛡️ *بنك الأخطاء الذكي:* تم إتقان ومعالجة ${mistakesBank.mastered} خطأ وتثبيتها بنجاح`
    );
  }

  // Strengths
  if (pedagogicalInsights?.strengths && pedagogicalInsights.strengths.length > 0) {
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`*✨ نقاط القوة والتميز:*`);
    pedagogicalInsights.strengths.slice(0, 2).forEach((s: string) => {
      lines.push(`✓ ${s}`);
    });
  }

  // Habib's Recommendations
  if (pedagogicalInsights?.habibRecommendations && pedagogicalInsights.habibRecommendations.length > 0) {
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`*💡 توجيه مستر حبيب الرحمن التربوي:*`);
    pedagogicalInsights.habibRecommendations.slice(0, 2).forEach((r: string) => {
      lines.push(`• ${r}`);
    });
  }

  // Web Report Link
  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`*🔗 لعرض الشهادة والتقرير التفاعلي الكامل:*`);
  lines.push(`${reportUrl}`);
  lines.push(``);
  lines.push(`_نسعد دائماً بدعمكم وتفوق أبنائنا_ 🌺`);
  lines.push(`_مع تحيات مستر حبيب الرحمن وفريق العمل_`);

  const whatsappMessage = lines.join("\n");
  const encodedText = encodeURIComponent(whatsappMessage);

  const cleanPhone = parentPhone ? normalizePhoneNumber(parentPhone) : "";
  const directPhoneLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : undefined;
  const whatsappLink = directPhoneLink || `https://wa.me/?text=${encodedText}`;

  return {
    studentName: student.name,
    periodLabel,
    summaryText: `${student.name} - متوسط ${academic.averagePercentage}% - حضور ${attendance.attendanceRate}%`,
    whatsappMessage,
    whatsappLink,
    directPhoneLink,
    reportUrl,
    stats: {
      attendanceRate: attendance.attendanceRate,
      averageScore: academic.averagePercentage,
      streak: student.streak,
      points: student.points,
      masteredMistakes: mistakesBank?.mastered || 0,
      homeworkCompletion: homework.completionRate,
    },
  };
}

/**
 * Generates a direct WhatsApp web or mobile link for any arbitrary phone and message
 */
export function buildParentWhatsAppShareUrl(options: { phone?: string; text: string }): string {
  const encoded = encodeURIComponent(options.text);
  if (options.phone) {
    const normalized = normalizePhoneNumber(options.phone);
    if (normalized) {
      return `https://wa.me/${normalized}?text=${encoded}`;
    }
  }
  return `https://wa.me/?text=${encoded}`;
}
