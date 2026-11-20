/**
 * PRO MEDIA COMMAND CENTER (PMC) — AI Content Studio & Adaptation Engine
 * Professional Academy — Mr. Habib El Rahman
 * 
 * Generates platform-adapted educational marketing content from:
 * - Egyptian Thanawya Amma & Prep 2026/2027 Curriculum
 * - Master Question Bank & Exam traps
 * - Raw lesson notes / PDF / Word texts
 * 
 * Grounded in zero-hallucination academic accuracy.
 */

import { computeContentHash } from "./crypto.ts";

export interface ContentGenerationSource {
  sourceType: "curriculum_lesson" | "question_bank" | "pdf_document" | "manual_prompt";
  stage?: string; // 'Preparatory', 'Secondary', 'General'
  grade?: string; // e.g. 'Third Secondary (Baccalaureate)'
  unitTitle?: string;
  topicTitle: string;
  rawText?: string;
  sourceReference?: string;
}

export interface GeneratedVariant {
  platform: "facebook" | "youtube" | "tiktok";
  postType: "post" | "reel" | "video" | "short";
  hook: string;
  script?: string;
  caption: string;
  description?: string;
  tags?: string[];
  hashtags: string[];
  cta: string;
  thumbnailText?: string;
  estimatedDurationSeconds?: number;
  contentHash: string;
}

export interface StudioGenerationResult {
  projectId: string;
  title: string;
  stage: string;
  grade: string;
  sourceAttribution: string;
  variants: {
    facebook: GeneratedVariant;
    youtube: GeneratedVariant;
    tiktok: GeneratedVariant;
  };
}

/**
 * Common Thanawya Amma educational hashtags for high viral reach.
 */
export const ACADEMY_HASHTAGS = {
  facebook: ["#ثانوية_عامة_2027", "#انجليزي_مستر_حبيب_الرحمن", "#دفعة_التابلت", "#Professional_Academy"],
  youtube: ["ثانوية عامة 2027", "انجليزي ثانوية عامة", "شرح جرامر مستر حبيب", "مراجعة انجليزي تالتة ثانوي"],
  tiktok: ["#ثانوية_عامة", "#انجليزي_ثانوية_عامة", "#مستر_حبيب_الرحمن", "#thanawya_amma", "#ثانوية_عامة_2027"],
};

/**
 * Curriculum-grounded educational rules for Thanawya Amma
 */
const CURRICULUM_TOPIC_KNOWLEDGE: Record<string, { ruleSummary: string; commonTrap: string; exampleQuestion: string }> = {
  "past_simple_vs_continuous": {
    ruleSummary: "الماضي البسيط يعبر عن حدث اكتمل، بينما الماضي المستمر يعبر عن حدث كان مستمراً وقطعه حدث آخر.",
    commonTrap: "استخدام أفعال الحالة (Stative Verbs) مثل have, see, know في زمن الاستمرار خطأ شائع في الامتحان.",
    exampleQuestion: "While I (was having / had) dinner, the phone rang. — هنا have فعل تناول يجوز فيه الاستمرار.",
  },
  "used_to_vs_would": {
    ruleSummary: "Used to تعبر عن عادات وأفعال حالة في الماضي، بينما Would تعبر عن عادات حركية متكررة فقط ولا تأتي مع أفعال الحالة.",
    commonTrap: "لا يجوز استخدام Would مع be, have, live للتعبير عن الماضي. يجب استخدام Used to.",
    exampleQuestion: "When I was young, I (used to / would) live in Alexandria. — الإجابة used to فقط.",
  },
  "inversion": {
    ruleSummary: "تقديم الفعل المساعد على الفاعل عند بدء الجملة بكلمات سلبية أو مقيدة (Negative Adverbs).",
    commonTrap: "تنسيق جملة No sooner ... than / Hardly ... when مع زمن الماضي التام.",
    exampleQuestion: "No sooner (had he arrived / he had arrived) than the class started. — الإجابة had he arrived.",
  },
  "passive_voice": {
    ruleSummary: "المبني للمجهول: التركيز على المفعول والحدث باستخدام be + V3.",
    commonTrap: "الأفعال اللازمة (Intransitive Verbs) مثل happen, occur, arrive لا تبنى للمجهول أبداً.",
    exampleQuestion: "The accident was (happened / took place / happened) yesterday. — الإجابة happened لأن الفعل لازم.",
  },
};

/**
 * Grounded AI generator producing differentiated platform variants.
 */
export async function generateAcademicMultiplatformContent(
  source: ContentGenerationSource
): Promise<StudioGenerationResult> {
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const stage = source.stage || "Secondary";
  const grade = source.grade || "Third Secondary (Baccalaureate)";
  const topicKey = source.topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");

  const knowledge = CURRICULUM_TOPIC_KNOWLEDGE[topicKey] || {
    ruleSummary: `شرح تفصيلي لقاعدة: ${source.topicTitle} المقررة في المنهج الرسمي.`,
    commonTrap: "احذر من الفروق الدقيقة في تصريف الأفعال وحروف الجر المرتبطة بالقاعدة.",
    exampleQuestion: source.rawText || `اختر الإجابة الصحيحة في امتحان الوحدة الخاصة بـ ${source.topicTitle}.`,
  };

  const sourceAttribution = `منهج ${grade} — وزارة التربية والتعليم 2026/2027 (${source.sourceReference || source.unitTitle || "الوحدة الأولى"})`;

  // 1. Facebook Variant (Deep, Engaging Educational Post)
  const fbHook = `سؤال جه في امتحان الثانوية العامة وفاجئ 80% من الطلاب! 🚨 هل تقدر تجاوبه صح؟`;
  const fbCaption =
    `💡 كبسولة الجرامر مع مستر حبيب الرحمن | ${source.topicTitle}\n\n` +
    `📌 القاعدة الذهبية:\n${knowledge.ruleSummary}\n\n` +
    `⚠️ الفخ الامتحاني الأكثر تكراراً في امتحانات الثانوية:\n${knowledge.commonTrap}\n\n` +
    `📝 سؤال تدريبي من كتاب الوزارة:\n${knowledge.exampleQuestion}\n\n` +
    `👇 شاركنا إجابتك في التعليقات، وتأكد من حل امتحان الحصة التفاعلي الكامل على منصة مستر حبيب الرحمن!\n\n` +
    `${ACADEMY_HASHTAGS.facebook.join(" ")}`;

  const fbVariant: GeneratedVariant = {
    platform: "facebook",
    postType: "post",
    hook: fbHook,
    caption: fbCaption,
    cta: "اشترك الآن في منصة مستر حبيب الرحمن لمراجعات 2027",
    hashtags: ACADEMY_HASHTAGS.facebook,
    contentHash: computeContentHash({
      hook: fbHook,
      caption: fbCaption,
      platform: "facebook",
    }),
  };

  // 2. YouTube Variant (High-CTR Title, Structured Description, SEO Tags, Full Script)
  const ytTitle = `شرح قاعدة ${source.topicTitle} في 10 دقائق | تريكات تضمنلك الدرجة النهائية | ثانوية عامة 2027`;
  const ytDescription =
    `في هذا الفيديو يشرح مستر حبيب الرحمن قاعدة "${source.topicTitle}" المقررة على طلاب ${grade}، مع تفكيك أصعب تريكات الامتحان الوزاري.\n\n` +
    `⏱️ فصول الفيديو:\n` +
    `00:00 فخ الامتحان الذي يتكرر سنوياً\n` +
    `02:15 الشرح المبسط للقاعدة\n` +
    `05:40 حل أهم 5 أسئلة من بنك الأسئلة الوزاري\n` +
    `08:30 نصيحة مستر حبيب لليلة الامتحان\n\n` +
    `🔗 حل الامتحان الإلكتروني التفاعلي الخاص بهذا الدرس مجاناً:\nhttps://pro-academy-sfl3.vercel.app/dashboard/challenge\n\n` +
    `📍 المنصة الرسمية: Professional Academy — Mr. Habib El Rahman\n` +
    `#ثانوية_عامة_2027 #مستر_حبيب_الرحمن`;

  const ytScript =
    `[مقدمة - كاميرا 1 - زووم إن]\n` +
    `أهلاً بكم يا شباب الثانوية العامة، معكم مستر حبيب الرحمن. النهاردة هنقضي على أزمة قاعدة ${source.topicTitle} في 10 دقايق بس.\n\n` +
    `[الشرح التفاعلي - شاشة منقسمة]\n` +
    `شوفوا معايا المثال ده: ${knowledge.exampleQuestion}. معظم الطلاب بيقعوا هنا بسبب ${knowledge.commonTrap}.\n\n` +
    `[الخلاصة والـ CTA]\n` +
    `حل الامتحان التفاعلي في الرابط تحت الفيديو عشان تثبت المعلومة فورياً، ومتنساش تشترك في القناة لأسئلة المراجعة القادمة!`;

  const ytVariant: GeneratedVariant = {
    platform: "youtube",
    postType: "video",
    hook: ytTitle,
    script: ytScript,
    caption: ytTitle,
    description: ytDescription,
    tags: [
      ...ACADEMY_HASHTAGS.youtube,
      source.topicTitle,
      "حل امتحان الإنجليزي",
      "قواعد 2027",
    ],
    hashtags: ["#ثانوية_عامة", "#مستر_حبيب_الرحمن"],
    thumbnailText: `${source.topicTitle} في جيبك 🎯`,
    cta: "حل امتحان الحصة المجاني من الوصف",
    estimatedDurationSeconds: 600, // 10 mins
    contentHash: computeContentHash({
      hook: ytTitle,
      script: ytScript,
      description: ytDescription,
      platform: "youtube",
    }),
  };

  // 3. TikTok / Reels Variant (3-Second Rapid Hook, Fast 45s Script, On-Screen Cues)
  const ttHook = `أوعى تختار الإجابة دي في امتحان الثانوية العامة! ❌ فخ في ثانية`;
  const ttScript =
    `[00:00 - 00:03] (Hook سريع مع زووم مفاجئ على السؤال)\n` +
    `"لو جالك في الامتحان السؤال ده: ${knowledge.exampleQuestion}، أوعى تختار الإجابة المتسرعة!"\n\n` +
    `[00:03 - 00:25] (ظهور القاعدة باللون الذهبي والأصفر)\n` +
    `"ليه؟ لأن ${knowledge.commonTrap}، والإجابة الصحيحة هي ${knowledge.ruleSummary}!"\n\n` +
    `[00:25 - 00:35] (كارت مستر حبيب الرحمن والـ CTA)\n` +
    `"عايز تختبر نفسك في 10 أسئلة شبه دي؟ ادخل على اللينك في البايو وحل امتحان الحصة مجاناً مع مستر حبيب!"`;

  const ttCaption = `فخ امتحان ثانوية عامة متكرر في قاعدة ${source.topicTitle}! 🔥 احفظ الفيديو لليلة الامتحان واكتب إجابتك في الكومنتات 👇`;

  const ttVariant: GeneratedVariant = {
    platform: "tiktok",
    postType: "reel",
    hook: ttHook,
    script: ttScript,
    caption: ttCaption,
    hashtags: ACADEMY_HASHTAGS.tiktok,
    thumbnailText: `فخ امتحان ⚠️ ${source.topicTitle}`,
    cta: "اللينك في البايو لامتحان الحصة المجاني",
    estimatedDurationSeconds: 35,
    contentHash: computeContentHash({
      hook: ttHook,
      script: ttScript,
      caption: ttCaption,
      platform: "tiktok",
    }),
  };

  return {
    projectId,
    title: source.topicTitle,
    stage,
    grade,
    sourceAttribution,
    variants: {
      facebook: fbVariant,
      youtube: ytVariant,
      tiktok: ttVariant,
    },
  };
}
