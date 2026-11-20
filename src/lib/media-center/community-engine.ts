// PRO MEDIA COMMAND CENTER — Community Manager Engine
// Student Comment Classification & AI-Assisted Academic Reply Suggestions with Mandatory Educator Approval

export type CommentClassification =
  | "grammar_question"
  | "subscription_inquiry"
  | "exam_query"
  | "praise"
  | "spam";

export type InteractionStatus = "pending_review" | "approved_sent" | "ignored";

export interface StudentCommentInteraction {
  id: string;
  platform: "facebook" | "youtube" | "tiktok";
  externalPostId?: string;
  commentId: string;
  authorName: string;
  authorAvatar?: string;
  commentBody: string;
  classification: CommentClassification;
  aiSuggestedReply: string;
  approvedReply?: string | null;
  status: InteractionStatus;
  createdAt: string;
  repliedAt?: string | null;
}

/**
 * 1. Automatic Classification of Student Comments.
 */
export function classifyStudentInteraction(commentBody: string): CommentClassification {
  const norm = commentBody.trim().toLowerCase();

  // 1. Spam detection
  if (
    norm.includes("تابعوني") ||
    norm.includes("زيادة متابعين") ||
    norm.includes("ربح المال") ||
    norm.includes("http://") ||
    norm.includes("https://t.me") ||
    norm.includes("اشترك في قناتي")
  ) {
    return "spam";
  }

  // 2. Praise & Encouragement (when student praises and expresses gratitude)
  const isQuestion =
    norm.includes("؟") ||
    norm.includes("?") ||
    norm.includes("ليه") ||
    norm.includes("إزاي") ||
    norm.includes("بكام") ||
    norm.includes("فين") ||
    norm.includes("ينفع");

  if (
    !isQuestion &&
    (norm.includes("شكرا") ||
      norm.includes("ربنا يباركلك") ||
      norm.includes("أفضل مستر") ||
      norm.includes("شرح ممتاز") ||
      norm.includes("فهمت جدا") ||
      norm.includes("عاش يا مستر") ||
      norm.includes("مبدع") ||
      norm.includes("أحسن مدرس"))
  ) {
    return "praise";
  }

  // Grammar & Academic Questions
  if (
    norm.includes("ليه اخترنا") ||
    norm.includes("الفرق بين") ||
    norm.includes("قاعدة") ||
    norm.includes("grammar") ||
    norm.includes("إعراب") ||
    norm.includes("ينفع استخدم") ||
    norm.includes("past perfect") ||
    norm.includes("used to") ||
    norm.includes("would") ||
    norm.includes("had been") ||
    norm.includes("passive")
  ) {
    return "grammar_question";
  }

  // Subscription & Booking inquiries
  if (
    norm.includes("حجز") ||
    norm.includes("سعر") ||
    norm.includes("بكام") ||
    norm.includes("السنتر") ||
    norm.includes("المنصة") ||
    norm.includes("اشتراك") ||
    norm.includes("مواعيد الحصص") ||
    norm.includes("مذكرة") ||
    norm.includes("واتساب") ||
    norm.includes("رقم الحجز")
  ) {
    return "subscription_inquiry";
  }

  // Exam & Testing queries
  if (
    norm.includes("امتحان") ||
    norm.includes("رابط الامتحان") ||
    norm.includes("الدرجة") ||
    norm.includes("النتيجة") ||
    norm.includes("الشهادة") ||
    norm.includes("نموذج الإجابة")
  ) {
    return "exam_query";
  }

  // Praise & Encouragement
  if (
    norm.includes("شكرا") ||
    norm.includes("ربنا يباركلك") ||
    norm.includes("أفضل مستر") ||
    norm.includes("شرح ممتاز") ||
    norm.includes("فهمت جدا") ||
    norm.includes("عاش يا مستر") ||
    norm.includes("مبدع") ||
    norm.includes("أحسن مدرس")
  ) {
    return "praise";
  }

  return "grammar_question";
}

/**
 * 2. Generates an AI-suggested response in Mr. Habib El Rahman's signature educational voice.
 * Strict Rule: needsTeacherReview is always true. No auto-replies to external networks.
 */
export function generateReplySuggestion(
  authorName: string,
  commentBody: string,
  classification: CommentClassification
): { suggestedReply: string; needsTeacherReview: boolean } {
  const firstName = authorName.split(" ")[0] || "يا بطل";

  let suggestedReply = "";

  switch (classification) {
    case "grammar_question":
      suggestedReply = `أهلاً بك يا ${firstName}! سؤال ممتاز في صميم أفكار الامتحان الوزاري. لاحظ دائماً أن الحدث الأقدم في الماضي يأخذ Past Perfect (had + P.P)، بينما الحدث الأحدث يأخذ Past Simple. راجع جدول المقارنة في الفيديو الدقيقة 02:15 وشاركنا حلك للامتحان التجريبي! 🎯`;
      break;

    case "subscription_inquiry":
      suggestedReply = `أهلاً بك يا ${firstName} في Professional Academy! متاح الآن الانضمام لمجموعات الشرح وحصص المراجعة النهائية مع مستر حبيب الرحمن أونلاين وفي السناتر المعتمدة. للاشتراك واستلام المذكرة المجانية تواصل مع فريق الدعم عبر واتساب الأكاديمية: 01000000000 📲`;
      break;

    case "exam_query":
      suggestedReply = `عاش يا ${firstName}! رابط الامتحان التفاعلي الفوري متاح مجاناً في أول تعليق مثبت وفي صندوق الوصف. بعد ما تحل، النظام هيظهرلك درجتك فوراً مع تحليل الأخطاء والشرح التفصيلي لكل نقطة. بالتوفيق يا بطل! 🌟`;
      break;

    case "praise":
      suggestedReply = `تسلم يا ${firstName}، ربنا يوفقك ويكتبلك أعلى مجموع في الثانوية العامة بإذن الله! فخور بتركيزك ومتابعتك الدائمة، واستعد للتريكات القادمة في الحصة الجديدة! 👏✨`;
      break;

    case "spam":
      suggestedReply = `(ملاحظة الذكاء الاصطناعي: هذا التعليق مصنف كإعلان أو سبام، يُوصى بإخفائه أو تجاهله دون رد).`;
      break;
  }

  return {
    suggestedReply,
    needsTeacherReview: true, // Non-negotiable human approval
  };
}

/**
 * 3. Approves and dispatches a reply.
 */
export function approveAndDispatchReply(
  comment: StudentCommentInteraction,
  finalReplyText: string,
  approverName: string
): { success: boolean; comment: StudentCommentInteraction; note: string } {
  const updated: StudentCommentInteraction = {
    ...comment,
    approvedReply: finalReplyText,
    status: "approved_sent",
    repliedAt: new Date().toISOString(),
  };

  return {
    success: true,
    comment: updated,
    note: `Reply approved by ${approverName} and dispatched to ${comment.platform}.`,
  };
}

/**
 * 4. Realistic Seed Interactions for Community Inbox
 */
export function getSeedCommunityInteractions(): StudentCommentInteraction[] {
  return [
    {
      id: "comm_01",
      platform: "youtube",
      externalPostId: "yt_post_01",
      commentId: "yt_c_101",
      authorName: "أحمد محمود (طالب ثانوية عامة)",
      commentBody: "هو لو جه في الجملة before وجاي بعدها ماضي بسيط، الجملة التانية لازم تبقى had + P.P ولا ممكن past simple؟",
      classification: "grammar_question",
      aiSuggestedReply: "أهلاً بك يا أحمد! سؤال ممتاز في صميم أفكار الامتحان الوزاري. لاحظ دائماً أن الحدث الأقدم في الماضي يأخذ Past Perfect (had + P.P)، بينما الحدث الأحدث يأخذ Past Simple. راجع جدول المقارنة في الفيديو الدقيقة 02:15 وشاركنا حلك للامتحان التجريبي! 🎯",
      status: "pending_review",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "comm_02",
      platform: "facebook",
      externalPostId: "fb_post_01",
      commentId: "fb_c_202",
      authorName: "سارة إبراهيم",
      commentBody: "لو سمحت يا مستر حبيب عايزة أحجز في كورس المراجعة النهائية للثانوية العامة، بكام الاشتراك وإزاي أستلم المذكرات؟",
      classification: "subscription_inquiry",
      aiSuggestedReply: "أهلاً بك يا سارة في Professional Academy! متاح الآن الانضمام لمجموعات الشرح وحصص المراجعة النهائية مع مستر حبيب الرحمن أونلاين وفي السناتر المعتمدة. للاشتراك واستلام المذكرة المجانية تواصل مع فريق الدعم عبر واتساب الأكاديمية: 01000000000 📲",
      status: "pending_review",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "comm_03",
      platform: "tiktok",
      externalPostId: "tt_post_01",
      commentId: "tt_c_303",
      authorName: "زياد خالد",
      commentBody: "أحسن مدرس إنجليزي في مصر والله، التريك ده جه في امتحان السنة اللي فاتت وكلنا غلطنا فيه! ربنا يجعله في ميزان حسناتك",
      classification: "praise",
      aiSuggestedReply: "تسلم يا زياد، ربنا يوفقك ويكتبلك أعلى مجموع في الثانوية العامة بإذن الله! فخور بتركيزك ومتابعتك الدائمة، واستعد للتريكات القادمة في الحصة الجديدة! 👏✨",
      status: "approved_sent",
      approvedReply: "تسلم يا زياد، ربنا يوفقك ويكتبلك أعلى مجموع في الثانوية العامة بإذن الله! فخور بتركيزك ومتابعتك الدائمة، واستعد للتريكات القادمة في الحصة الجديدة! 👏✨",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      repliedAt: new Date(Date.now() - 82000000).toISOString(),
    },
    {
      id: "comm_04",
      platform: "youtube",
      externalPostId: "yt_post_02",
      commentId: "yt_c_404",
      authorName: "مريم طارق",
      commentBody: "فين رابط الامتحان الإلكتروني يا مستر اللي قلت عليه في آخر الفيديو؟",
      classification: "exam_query",
      aiSuggestedReply: "عاش يا مريم! رابط الامتحان التفاعلي الفوري متاح مجاناً في أول تعليق مثبت وفي صندوق الوصف. بعد ما تحل، النظام هيظهرلك درجتك فوراً مع تحليل الأخطاء والشرح التفصيلي لكل نقطة. بالتوفيق يا بطل! 🌟",
      status: "pending_review",
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: "comm_05",
      platform: "facebook",
      externalPostId: "fb_post_02",
      commentId: "fb_c_505",
      authorName: "تابعونا للألعاب",
      commentBody: "تابعوني لزيادة المتابعين 10k مجانا في ساعتين فقط عبر الرابط التالي http://spam-link.example",
      classification: "spam",
      aiSuggestedReply: "(ملاحظة الذكاء الاصطناعي: هذا التعليق مصنف كإعلان أو سبام، يُوصى بإخفائه أو تجاهله دون رد).",
      status: "ignored",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];
}
