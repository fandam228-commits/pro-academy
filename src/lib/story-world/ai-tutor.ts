import {
  ALL_CURRICULUM_STORIES,
  StoryItem,
  ChapterItem,
  QuestionAnswer,
  ImportantQuestion
} from "@/data/story-world";
import { interactWithCharacterAgent, isArabicText } from "./character-agents";

export type TutorMode = "character" | "teacher" | "exam_prep";

export interface TutorInteractionParams {
  mode: TutorMode;
  storyId?: string;
  chapterId?: string;
  gradeCode?: string;
  message: string;
  characterName?: string;
  questionId?: string;
  studentAnswer?: string;
}

export interface TutorInteractionResponse {
  success: boolean;
  mode: TutorMode;
  reply: string;
  languageTip?: string;
  suggestedQuestions?: string[];
  evaluation?: {
    score: number; // 0 to 100
    grade: "ممتاز (Excellent)" | "جيد جداً (Very Good)" | "يحتاج لمراجعة (Needs Revision)";
    feedbackAr: string;
    feedbackEn: string;
    modelAnswerEn: string;
    modelAnswerAr?: string;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  contextCitations?: {
    chapterNumber?: number;
    chapterTitleEn?: string;
    chapterTitleAr?: string;
    storyTitleEn?: string;
    storyTitleAr?: string;
  };
}

// ==============================================================================
// TEACHER MODE ENGINE: Mr. Habib El Rahman
// ==============================================================================
export function handleTeacherMode(
  story: StoryItem | undefined,
  chapter: ChapterItem | undefined,
  message: string
): TutorInteractionResponse {
  const isAr = isArabicText(message);
  const msgLower = message.toLowerCase();

  // Find target story and chapter if not provided
  let currentStory = story;
  let currentChapter = chapter;

  if (!currentStory) {
    currentStory = ALL_CURRICULUM_STORIES.find(s =>
      s.chapters.some(c => c.id === currentChapter?.id)
    ) || ALL_CURRICULUM_STORIES[0];
  }
  if (!currentChapter && currentStory) {
    currentChapter = currentStory.chapters[0];
  }

  // Identify student question topic
  const asksAboutCharacters =
    msgLower.includes("character") ||
    msgLower.includes("شخصية") ||
    msgLower.includes("شخصيات") ||
    msgLower.includes("who is") ||
    msgLower.includes("من هو") ||
    msgLower.includes("من هي");

  const asksAboutRelationships =
    msgLower.includes("relationship") ||
    msgLower.includes("relation") ||
    msgLower.includes("علاقة") ||
    msgLower.includes("بين") ||
    msgLower.includes("between");

  const asksAboutTheme =
    msgLower.includes("theme") ||
    msgLower.includes("moral") ||
    msgLower.includes("lesson") ||
    msgLower.includes("درس") ||
    msgLower.includes("عبرة") ||
    msgLower.includes("مغزى") ||
    msgLower.includes("هدف");

  const asksAboutEvents =
    msgLower.includes("summary") ||
    msgLower.includes("event") ||
    msgLower.includes("happen") ||
    msgLower.includes("أحداث") ||
    msgLower.includes("حدث") ||
    msgLower.includes("ملخص") ||
    msgLower.includes("ماذا جرى");

  let reply = "";
  let languageTip = "";
  let suggested: string[] = [];

  if (asksAboutRelationships && currentChapter?.characterRelationships && currentChapter.characterRelationships.length > 0) {
    const rels = currentChapter.characterRelationships;
    if (isAr) {
      reply = `أهلاً بك يا بطل! سؤال ممتاز في صميم أسئلة التفكير النقدي بالامتحان.
في الفصل ${currentChapter.chapterNumber} من قصة (${currentStory?.titleAr})، نلاحظ شبكة علاقات درامية حاسمة:

${rels.map((r, i) => `${i + 1}. **العلاقة بين (${r.characters.join(" و ")}):**
   • **طبيعة العلاقة:** ${r.relationAr} (${r.relationEn}).
   • **التحليل الأدبي:** ${r.detailsAr || r.detailsEn}`).join("\n\n")}

💡 **نصيحة الامتحان:** احرص دائماً على ربط أفعال الشخصية بدافعها النفسي (Motives & Actions) لتحصل على الدرجة النهائية في سؤال القصة!`;
    } else {
      reply = `Welcome! An outstanding question on character dynamics for your exam preparation.
In Chapter ${currentChapter.chapterNumber} of *${currentStory?.titleEn}*, pay close attention to these vital relationships:

${rels.map((r, i) => `${i + 1}. **${r.characters.join(" & ")}:**
   • **Relationship Type:** ${r.relationEn} (${r.relationAr}).
   • **Critical Analysis:** ${r.detailsEn || r.detailsAr}`).join("\n\n")}

💡 **Exam Strategy:** When writing about character relationships, always cite specific actions to substantiate your claims!`;
    }
    languageTip = isAr
      ? `💡 نصيحة مستر حبيب: استخدم تعبيرات الربط التحليلية مثل 'This relationship illustrates...' أو 'The dynamic reveals...' لترقية صياغة مقالك الأدبي!`
      : `💡 Tip from Mr. Habib: Use formal relationship verbs such as 'exemplifies', 'clashes with', and 'substantiates' in your literature essays!`;
    suggested = [
      "ما هي دوافع الشخصيات في هذا الفصل؟",
      "Explain the main conflict in this chapter",
      "كيف أكتب إجابة نموذجية على سؤال التفكير النقدي؟"
    ];
  } else if (asksAboutTheme && currentChapter?.themesAndLessons && currentChapter.themesAndLessons.length > 0) {
    const themes = currentChapter.themesAndLessons;
    if (isAr) {
      reply = `أحسنت باختيار هذا السؤال؛ فالموضوعات الأدبية (Themes) هي جوهر أسئلة امتحان الثانوية العامة والشهادة الإعدادية!
في الفصل ${currentChapter.chapterNumber}، نستخلص الدروس والقيم التالية:

${themes.map((t, i) => `${i + 1}. **الموضوع (${t.themeAr} / ${t.themeEn}):**
   • **الدرس المستفاد:** ${t.lessonAr}
   • **English Context:** "${t.lessonEn}"`).join("\n\n")}

تذكر دائماً أن القصة لم تُكتب للمتعة فقط، بل لغرس قيم الصمود والنزاهة والعدالة ومواجهة التحديات.`;
    } else {
      reply = `Superb inquiry! Literary themes are the absolute core of analytical comprehension exams.
In Chapter ${currentChapter.chapterNumber} of *${currentStory?.titleEn}*, consider these primary themes:

${themes.map((t, i) => `${i + 1}. **Theme: ${t.themeEn} (${t.themeAr})**
   • **Core Lesson:** ${t.lessonEn}
   • **Arabic Reflection:** ${t.lessonAr}`).join("\n\n")}

Keep in mind that examiners test your ability to connect narrative events with universal moral lessons!`;
    }
    languageTip = isAr
      ? `💡 نصيحة مستر حبيب: عند صياغة الدروس المستفادة، استخدم جملاً مبنية على الحكمة مثل: 'The story teaches us that resilience conquers adversity.'`
      : `💡 Tip from Mr. Habib: Master theme-statement openers: 'Through this ordeal, the author demonstrates that...' to score full marks!`;
    suggested = [
      "ما هي أهم الاقتباسات التي تدعم هذا الدرس؟",
      "Who is the main adversary in this story?",
      "أعطني تدريباً من أسئلة الامتحانات السابقة"
    ];
  } else if (asksAboutEvents && currentChapter) {
    const pts = currentChapter.chapterInPoints || [];
    if (isAr) {
      reply = `معك مستر حبيب، وإليك الملخص التحليلي الشامل لأحداث الفصل ${currentChapter.chapterNumber} (${currentChapter.titleAr}):

📌 **ملخص الحبكة الدرامية:**
${currentChapter.summaryAr}

🔍 **تسلسل أهم الأحداث في نقاط:**
${pts.map((p, i) => `${i + 1}. ${p.pointAr || p.pointEn || (p as any).ar}`).join("\n")}

💡 **التركيز الامتحاني:** ركز على نقطة التحول الرئيسية في الفصل وكيف غيرت مسار البطل.`;
    } else {
      reply = `Mr. Habib here with your structured chapter walkthrough! Here is the narrative breakdown for Chapter ${currentChapter.chapterNumber} (*${currentChapter.titleEn}*):

📌 **Plot Overview:**
${currentChapter.summaryEn}

🔍 **Chronological Key Milestones:**
${pts.map((p, i) => `${i + 1}. ${p.pointEn || p.pointAr || (p as any).en}`).join("\n")}

💡 **Exam Focus:** Pay close attention to the climactic turning point and its immediate consequences!`;
    }
    languageTip = isAr
      ? `💡 نصيحة مستر حبيب: تدرب على سرد الأحداث باستخدام الـ Sequence Words (Initially, Subsequently, Consequently, Finally)!`
      : `💡 Tip from Mr. Habib: In summary writing, use past narrative tenses combined with chronological transitional words!`;
    suggested = [
      "من هي الشخصيات المؤثرة في هذا الفصل؟",
      "What key dialogues took place?",
      "اختبرني في سؤال تفكير نقدي من هذا الفصل"
    ];
  } else {
    // General welcoming & educational guidance
    if (isAr) {
      reply = `أهلاً بك يا بطل في نمط المعلم الذكي (Teacher Mode) مع **مستر حبيب الرحمن**!
أنا هنا لأكون مرشدك الأدبي واللغوي الخاص في قصة (${currentStory?.titleAr}).

يمكنني مساعدتك في:
1. **شرح أحداث أي فصل** بتسلسل مبسط ومترجم.
2. **تحليل دوافع الشخصيات** وعلاقات الحب والعداء والخيانة.
3. **توضيح الدروس المستفادة (Themes)** والرسائل التربوية المقررة.
4. **تفسير الاقتباسات المفتاحية** ومن قالها ولمن ولماذا.

عن أي موضوع أو سؤال تحب أن نبدأ بمناقشته؟`;
    } else {
      reply = `Welcome to **Teacher Mode** with **Mr. Habib El Rahman**!
I am delighted to guide you through the literary world of *${currentStory?.titleEn}*.

I can help you master:
1. **Chapter Walkthroughs & Summaries** with clear bilingual explanations.
2. **Character Motivations & Relationships** (alliances, betrayals, and growth).
3. **Themes & Moral Lessons** targeted by Ministry exam boards.
4. **Key Quotations & Significance** (who said it, to whom, and why).

What question or chapter would you like to explore together?`;
    }
    languageTip = isAr
      ? `💡 نصيحة مستر حبيب: الدراسة الذكية للقصة تعتمد على فهم 'السبب والنتيجة' (Cause and Effect) وليس مجرد حفظ الكلمات!`
      : `💡 Tip from Mr. Habib: Literature mastery is built upon asking 'Why did this happen?' and 'What does this symbolize?'`;
    suggested = [
      "اشرح لي أهم أحداث هذا الفصل",
      "ما هي شبكة علاقات الشخصيات؟",
      "أهم الأسئلة المتوقعة في الامتحان"
    ];
  }

  return {
    success: true,
    mode: "teacher",
    reply,
    languageTip,
    suggestedQuestions: suggested,
    contextCitations: currentChapter ? {
      chapterNumber: currentChapter.chapterNumber,
      chapterTitleEn: currentChapter.titleEn,
      chapterTitleAr: currentChapter.titleAr,
      storyTitleEn: currentStory?.titleEn,
      storyTitleAr: currentStory?.titleAr
    } : undefined
  };
}

// ==============================================================================
// EXAM PREPARATION MODE ENGINE: Practice & Evaluation
// ==============================================================================
export function handleExamPrepMode(
  story: StoryItem | undefined,
  chapter: ChapterItem | undefined,
  message: string,
  questionId?: string,
  studentAnswer?: string
): TutorInteractionResponse {
  const isAr = isArabicText(message || studentAnswer || "");
  let currentStory = story || ALL_CURRICULUM_STORIES[0];
  let currentChapter = chapter || currentStory.chapters[0];

  // 1. If evaluating a specific student answer
  if (questionId || studentAnswer) {
    const ansText = String(studentAnswer || message).trim();
    let targetQ: QuestionAnswer | ImportantQuestion | undefined;

    // Search for question
    if (questionId) {
      targetQ = currentChapter.questionsAndAnswers?.find(q => q.id === questionId) ||
                currentChapter.importantQuestions?.find(q => q.id === questionId);
    }
    if (!targetQ && currentChapter.questionsAndAnswers?.length > 0) {
      targetQ = currentChapter.questionsAndAnswers[0];
    }

    const modelAns = targetQ ? targetQ.answer : "Model answer unavailable.";
    const modelWords = modelAns.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s]/g, "").split(/\s+/).filter(w => w.length > 3);
    const studentWords = ansText.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s]/g, "").split(/\s+/);

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const w of modelWords) {
      if (studentWords.includes(w)) {
        if (!matchedKeywords.includes(w)) matchedKeywords.push(w);
      } else {
        if (!missingKeywords.includes(w) && missingKeywords.length < 5) missingKeywords.push(w);
      }
    }

    const ratio = modelWords.length > 0 ? matchedKeywords.length / Math.min(modelWords.length, 6) : 0.8;
    const score = Math.min(100, Math.max(30, Math.round(ratio * 100)));

    let grade: "ممتاز (Excellent)" | "جيد جداً (Very Good)" | "يحتاج لمراجعة (Needs Revision)" = "يحتاج لمراجعة (Needs Revision)";
    if (score >= 80) grade = "ممتاز (Excellent)";
    else if (score >= 60) grade = "جيد جداً (Very Good)";

    let feedbackAr = "";
    let feedbackEn = "";

    if (score >= 80) {
      feedbackAr = `إجابة ممتازة وواعية! لقد تضمنت فكرتك العناصر الجوهرية المطلوبة في نموذج الإجابة الرسمي، وأظهرت استيعاباً دقيقاً للنص.`;
      feedbackEn = `Outstanding answer! You successfully captured the core analytical points required by the official marking rubric.`;
    } else if (score >= 60) {
      feedbackAr = `إجابة جيدة جداً وفي المسار الصحيح! فكرتك واضحة ولكن ينقصها تضمين بعض الكلمات المفتاحية والأدلة النصية المحددة.`;
      feedbackEn = `Very good response! Your understanding is sound, but incorporating specific keywords and textual evidence will boost it to full marks.`;
    } else {
      feedbackAr = `محاولة جيدة، لكن الإجابة تحتاج إلى مزيد من الدقة والتركيز على أسباب ودوافع الحدث كما وردت بالمنهج.`;
      feedbackEn = `Good attempt, but your answer needs sharper alignment with the specific causes and consequences mentioned in the curriculum.`;
    }

    const reply = isAr
      ? `📝 **تقرير تقييم الإجابة الامتحانية (Exam Answer Evaluation):**
• **التقدير:** ${grade} (${score}/100)
• **ملاحظات المعلم:** ${feedbackAr}

📌 **النموذج الرسمي المعتمد (Model Answer):**
"${modelAns}"

💡 **نصيحة الامتحان من مستر حبيب:** تأكد دائماً في أسئلة القصة المقالية من ذكر (السبب + الحدث + النتيجة) لتحصد العلامة الكاملة.`
      : `📝 **Exam Answer Evaluation Report:**
• **Grade:** ${grade} (${score}/100)
• **Teacher Feedback:** ${feedbackEn}

📌 **Official Ministry Model Answer:**
"${modelAns}"

💡 **Exam Tip from Mr. Habib:** Structure your analytical essay answers around: (Motive + Action + Outcome) for top marks!`;

    return {
      success: true,
      mode: "exam_prep",
      reply,
      languageTip: `💡 نصيحة امتحانية: Keywords are the secret to scoring full marks in Thanawya Amma reading evaluations!`,
      evaluation: {
        score,
        grade,
        feedbackAr,
        feedbackEn,
        modelAnswerEn: modelAns,
        matchedKeywords: matchedKeywords.slice(0, 5),
        missingKeywords: missingKeywords.slice(0, 5)
      },
      contextCitations: {
        chapterNumber: currentChapter.chapterNumber,
        chapterTitleEn: currentChapter.titleEn,
        chapterTitleAr: currentChapter.titleAr,
        storyTitleEn: currentStory.titleEn,
        storyTitleAr: currentStory.titleAr
      }
    };
  }

  // 2. Otherwise: Present Mock Exam / Practice Question
  const sampleQA = currentChapter.questionsAndAnswers?.[0] || currentChapter.importantQuestions?.[0];
  const questionPrompt = sampleQA ? sampleQA.question : "Explain the significance of the opening scene in this story.";

  const reply = isAr
    ? `🎯 **تحدي الامتحان والمراجعة الذكية (Exam Prep Challenge):**
معك مستر حبيب في نمط التدريب على أسئلة الامتحانات الرسمية.

إليك سؤال امتحان وزاري هام على الفصل ${currentChapter.chapterNumber} من قصة (${currentStory.titleAr}):

❓ **السؤال:**
"${questionPrompt}"

✏️ **المطلوب منك:**
اكتب إجابتك بالإنجليزية أو بالعربية هنا، وسأقوم بتقييم إجابتك فوراً بنظام تصحيح الامتحانات، وتحديد الكلمات المفتاحية التي أصبتها ومقارنتها بنموذج الوزارة الرسمي!`
    : `🎯 **Exam Preparation Challenge:**
Welcome to Exam Prep Mode with Mr. Habib!

Here is an official exam-level critical thinking question on Chapter ${currentChapter.chapterNumber} of *${currentStory.titleEn}*:

❓ **Question:**
"${questionPrompt}"

✏️ **Your Task:**
Type your answer below in English or Arabic, and I will evaluate it instantly against the official marking criteria, highlight your matched keywords, and show the model answer!`;

  return {
    success: true,
    mode: "exam_prep",
    reply,
    languageTip: `💡 Tip from Mr. Habib: Always read the question twice to determine whether it asks for a factual recall or a critical analysis!`,
    suggestedQuestions: [
      "أعطني سؤالاً آخر من أسئلة التفكير النقدي",
      "كيف أكتب إجابة نموذجية في سؤال القصة؟",
      "Explain the moral dilemma in this chapter"
    ],
    contextCitations: {
      chapterNumber: currentChapter.chapterNumber,
      chapterTitleEn: currentChapter.titleEn,
      chapterTitleAr: currentChapter.titleAr,
      storyTitleEn: currentStory.titleEn,
      storyTitleAr: currentStory.titleAr
    }
  };
}

// ==============================================================================
// MAIN ORCHESTRATOR: AI Story Tutor (3 Modes)
// ==============================================================================
export async function interactWithStoryAITutor(
  params: TutorInteractionParams
): Promise<TutorInteractionResponse> {
  const { mode, storyId, chapterId, message, characterName, questionId, studentAnswer } = params;

  // Resolve story and chapter
  let story = ALL_CURRICULUM_STORIES.find(s => s.id === storyId);
  if (!story && chapterId) {
    for (const s of ALL_CURRICULUM_STORIES) {
      if (s.chapters.some(c => c.id === chapterId)) {
        story = s;
        break;
      }
    }
  }
  let chapter = story?.chapters.find(c => c.id === chapterId);
  if (!chapter && story && story.chapters.length > 0) {
    chapter = story.chapters[0];
  }

  // 1. Character Mode
  if (mode === "character") {
    const charName = characterName || (chapter?.importantCharacters?.[0]?.nameEn) || "Edmond Dantès";
    const res = await interactWithCharacterAgent({
      characterName: charName,
      message,
      chapterId: chapter?.id,
      gradeId: story?.gradeCode
    });
    return {
      success: res.success,
      mode: "character",
      reply: res.reply,
      languageTip: res.languageTip,
      contextCitations: res.contextCitations ? {
        chapterNumber: res.contextCitations.chapterNumber,
        chapterTitleEn: res.contextCitations.chapterTitleEn,
        chapterTitleAr: res.contextCitations.chapterTitleAr,
        storyTitleEn: story?.titleEn,
        storyTitleAr: story?.titleAr
      } : undefined
    };
  }

  // 2. Teacher Mode
  if (mode === "teacher") {
    return handleTeacherMode(story, chapter, message);
  }

  // 3. Exam Prep Mode
  return handleExamPrepMode(story, chapter, message, questionId, studentAnswer);
}
