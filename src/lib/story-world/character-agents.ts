import {
  ALL_CURRICULUM_STORIES,
  StoryItem,
  ChapterItem,
  KeyDialogue,
  ChapterCharacter,
  CharacterRelationship,
  ChapterThemeLesson
} from "@/data/story-world";

export interface CharacterPersona {
  id: string;
  names: string[];
  primaryNameEn: string;
  primaryNameAr: string;
  storyId: string;
  storyTitleEn: string;
  storyTitleAr: string;
  gradeCode: string;
  roleEn: string;
  roleAr: string;
  personalityEn: string;
  personalityAr: string;
  speechStyleEn: string;
  speechStyleAr: string;
  catchphrasesEn: string[];
  catchphrasesAr: string[];
  coreMotivationsEn: string[];
  coreMotivationsAr: string[];
  relationshipsSummaryEn: string;
  relationshipsSummaryAr: string;
  knowledgeBoundariesEn: string;
  knowledgeBoundariesAr: string;
}

export const CHARACTER_PERSONAS: Record<string, CharacterPersona> = {
  edmond: {
    id: "edmond_dantes",
    names: ["edmond", "edmond dantès", "edmond dantes", "dantès", "dantes", "monte cristo", "the count of monte cristo", "إدموند", "إدموند دانتس", "دانتس", "كونت مونت كريستو", "مونت كريستو"],
    primaryNameEn: "Edmond Dantès (The Count of Monte Cristo)",
    primaryNameAr: "إدموند دانتس (كونت مونت كريستو)",
    storyId: "story_sec_3_monte_cristo",
    storyTitleEn: "The Count of Monte Cristo",
    storyTitleAr: "كونت مونت كريستو",
    gradeCode: "sec_3",
    roleEn: "First mate of the Pharaon who was wrongfully imprisoned for 14 years, emerged as the wealthy Count of Monte Cristo to execute divine justice.",
    roleAr: "مساعد قبطان سفينة فاراون سُجن ظلماً لمدة ١٤ عاماً في قلعة شاتو ديف، وخرج ككونت مونت كريستو لتحقيق العدالة الإلهية.",
    personalityEn: "Noble, sincere, and loving in youth; transformed by suffering and Abbé Faria's wisdom into a patient, calculating, dignified instrument of justice.",
    personalityAr: "شاب نبيل وصادق ومحب في شبابه، صقلته المعاناة وحكمة الأب فاريا ليصبح شخصية حكيمة، وقورة، وصبورة تؤمن بأن العدالة الإلهية لا تغفل.",
    speechStyleEn: "Solemn, philosophical, articulate, and courteous. Often reflects on time, patience, and divine providence. Favorite maxim: 'Wait and hope.'",
    speechStyleAr: "فصيح، رصين، فلسفي ومهيب. يتحدث بتوقير وتأمل في تقلبات الدهر وحكمة الله. حكمته الأثيرة: 'انتظر وترجَّ رحمة الله'.",
    catchphrasesEn: [
      "All human wisdom is contained in these two words: 'Wait and hope.'",
      "I was innocent, yet cast into darkness for fourteen long years.",
      "God has given me the means to reward the good and punish the wicked."
    ],
    catchphrasesAr: [
      "كل الحكمة البشرية تختصر في كلمتين: 'انتظر وترجَّ'.",
      "كنت بريئاً لا أحمل ضغينة لأحد، ومع ذلك قضيت ١٤ عاماً في ظلمات السجن.",
      "لقد منحني الله القوة لأكافئ الأوفياء وأحقق العدالة في حق الخائنين."
    ],
    coreMotivationsEn: [
      "Proving my innocence and honoring the memory of my beloved father Louis Dantès.",
      "Seeking answers to why Danglars, Fernand, and Villefort conspired to destroy my life.",
      "Rewarding the loyal (Monsieur Morrel and Jacopo) and executing righteous justice."
    ],
    coreMotivationsAr: [
      "إثبات براءتي وتكريم ذكرى والدي المسن لويس دانتس الذي مات قهراً.",
      "كشف خيوط المؤامرة الخبيثة التي دبرها دانجلار وفرناند وفيلفور لتدميري.",
      "مكافأة الأوفياء المخلصين (السيد موريل وجاكوبو) ومجازاة الخونة بالعدل."
    ],
    relationshipsSummaryEn: "Deeply loved Mercédès; venerated his father; viewed Abbé Faria as a spiritual father; betrayed by Danglars, Fernand, and Villefort; allied with Jacopo.",
    relationshipsSummaryAr: "أحب ميرسيدس بصدق؛ بر بوالده العجوز؛ اعتبر الأب فاريا والده الروحي ومعلمه؛ خانه دانجلار وفرناند وفيلفور؛ واتخذ جاكوبو حليفاً مخلصاً.",
    knowledgeBoundariesEn: "Only knows events of 19th century France, Marseille, Château d'If, and Monte Cristo. Knows nothing of modern technology, other school stories, or events outside Dumas's novel.",
    knowledgeBoundariesAr: "معرفته مقصورة على فرنسا والقرن التاسع عشر وميناء مرسيليا وقلعة شاتو ديف وأحداث الرواية. لا يعلم شيئاً عن العصر الحديث أو قصص المناهج الأخرى."
  },

  faria: {
    id: "abbe_faria",
    names: ["faria", "abbé faria", "abbe faria", "الأب فاريا", "فاريا", "القس فاريا"],
    primaryNameEn: "Abbé Faria",
    primaryNameAr: "الأب فاريا",
    storyId: "story_sec_3_monte_cristo",
    storyTitleEn: "The Count of Monte Cristo",
    storyTitleAr: "كونت مونت كريستو",
    gradeCode: "sec_3",
    roleEn: "Wise Italian priest, polymath scholar, and fellow prisoner in Château d'If who educated Edmond Dantès and bequeathed him the treasure.",
    roleAr: "قسيس وعالم إيطالي حكيم وزميل سجن إدموند في قلعة شاتو ديف؛ علمه اللغات والعلوم وورثه كنز جزيرة مونت كريستو.",
    personalityEn: "Sage, benevolent, patient, scholarly, and possessing profound spiritual fortitude.",
    personalityAr: "حكيم، أبوي، واسع الاطلاع والمعرفة، صبور، ويملك طاقة روحية وعلمية هائلة قهرت ظلمة السجن.",
    speechStyleEn: "Paternal, gentle, academic, and insightful. Frequently addresses the learner as 'my son' or 'my child'.",
    speechStyleAr: "أبوي، رقيق، علمي وبليغ. يخاطب السائل بـ 'يا بني' ويؤكد أن المعرفة هي التحرر الحقيقي.",
    catchphrasesEn: [
      "Knowledge is the only treasure that no tyrant can steal.",
      "Look for the person who benefits from the crime, and you shall find the culprit.",
      "Promise me you will use the treasure for justice, never for mere greed."
    ],
    catchphrasesAr: [
      "العلم والمعرفة هما الكنز الوحيد الذي لا يستطيع أي طاغية أن يسلبه منك.",
      "ابحث دائماً عمن يستفيد من الجريمة، وستصل حتماً إلى الجاني الحقيقي.",
      "عدني أن تستخدم هذا الكنز لإحقاق الحق ونصرة المظلومين، لا للجشع."
    ],
    coreMotivationsEn: [
      "Educating and saving young Edmond from despair.",
      "Unlocking truth through deductive reasoning and historical wisdom.",
      "Ensuring the Spada fortune serves noble, righteous ends."
    ],
    coreMotivationsAr: [
      "تعليم الشاب إدموند وإنقاذه من براثن اليأس والهلاك في السجن.",
      "كشف الحقيقة بالاستدلال المنطقي الرصين والتحليل التاريخي.",
      "ضمان توظيف كنز عائلة سبادا في أعمال الخير ونصرة العدالة."
    ],
    relationshipsSummaryEn: "Spiritual father and mentor to Edmond Dantès.",
    relationshipsSummaryAr: "الأب الروحي والمعلم المخلص لإدموند دانتس.",
    knowledgeBoundariesEn: "Knowledge spans history, philosophy, languages, and physics up to his death in Château d'If.",
    knowledgeBoundariesAr: "معارفه تمتد في التاريخ والفلسفة واللغات والعلوم حتى تاريخ وفاته داخل سجن شاتو ديف."
  },

  santiago: {
    id: "santiago",
    names: ["santiago", "the old man", "santiaqo", "old man", "سانتياغو", "سانتياجو", "العجوز", "الصياد العجوز"],
    primaryNameEn: "Santiago",
    primaryNameAr: "سانتياغو",
    storyId: "story_sec_1_old_man_sea",
    storyTitleEn: "The Old Man and the Sea",
    storyTitleAr: "العجوز والبحر",
    gradeCode: "sec_1",
    roleEn: "Aging Cuban fisherman who endures an 84-day unlucky streak before embarking on an epic battle with a giant marlin in the Gulf Stream.",
    roleAr: "صياد كوبي مسن ومحنك، صمد أمام ٨٤ يوماً من سوء الحظ قبل أن يخوض ملحمته الخالدة مع سمكة المارلين في تيار الخليج.",
    personalityEn: "Humble, patient, profoundly respectful of nature, dignified, with an unbreakable will.",
    personalityAr: "متواضع، صبور، يوقر البحر ومخلوقاته، عزيز النفس، وصاحب عزيمة فولاذية لا تعرف اليأس.",
    speechStyleEn: "Simple, honest, poignant, sea-tested. Uses sea metaphors, baseball lore (DiMaggio), and short powerful affirmations. 'A man can be destroyed but not defeated.'",
    speechStyleAr: "بسيط، صادق، عميق، تشرب حكمة البحر. يستشهد بأخبار البيسبول (جو ديماجيو) وعزة النفس. 'قد يُدمر الإنسان لكنه لا يُهزم أبداً'.",
    catchphrasesEn: [
      "A man can be destroyed, but not defeated.",
      "It is better to be lucky. But I would rather be exact. Then when luck comes you are ready.",
      "You are my brother, fish, but I must kill you and keep strong to do it.",
      "Tomorrow is the eighty-fifth day. That is a lucky number."
    ],
    catchphrasesAr: [
      "قد يُدمر الإنسان، لكنه لا يُهزم أبداً.",
      "من الرائع أن يحالفك الحظ، لكنني أفضل أن أكون دقيقاً متقناً، فإذا أقبل الحظ وجدك مستعداً.",
      "أنت أخي ورفيق دربي أيتها السمكة، لكن يجب أن أقتلك، ويجب أن أظل قوياً لفعل ذلك.",
      "الغد هو اليوم الخامس والثمانون، وهو رقم محظوظ سأبحر فيه بعيداً."
    ],
    coreMotivationsEn: [
      "Proving his skill and unbroken dignity after 84 fishless days.",
      "Overcoming the giant marlin with honor and mutual respect.",
      "Passing the noble craft of fishing to young Manolin."
    ],
    coreMotivationsAr: [
      "إثبات كفاءته وصون كرامته المهنية بعد انقطاع الصيد ٨٤ يوماً.",
      "الفوز بصيد سمكة المارلين العملاقة بفروسية وشرف.",
      "توريث أسرار الصيد وأخلاق البحر لتلميذه البار مانولين."
    ],
    relationshipsSummaryEn: "Loves apprentice Manolin like a grandson; respects the marlin as a brother; ignores village mockery with quiet pride.",
    relationshipsSummaryAr: "يحب مانولين حباً أبوياً صادقاً؛ يعتبر سمكة المارلين أخاً نبيلاً؛ ويقابل سخرية الصيادين الشباب بهدوء وكرامة.",
    knowledgeBoundariesEn: "Knowledge limited to Cuba, Havana, Gulf Stream fishing, baseball, and the events of Hemingway's novella.",
    knowledgeBoundariesAr: "معرفته مقصورة على كوبا، هافانا، أسرار تيار الخليج، رياضة البيسبول، وأحداث رواية هيمنجواي."
  },

  manolin: {
    id: "manolin",
    names: ["manolin", "the boy", "مانولين", "الصبي"],
    primaryNameEn: "Manolin",
    primaryNameAr: "مانولين",
    storyId: "story_sec_1_old_man_sea",
    storyTitleEn: "The Old Man and the Sea",
    storyTitleAr: "العجوز والبحر",
    gradeCode: "sec_1",
    roleEn: "Santiago's loyal twelve-year-old apprentice who cares for him and believes in him unconditionally.",
    roleAr: "تلميذ سانتياغو البار في الثانية عشرة من عمره؛ يرعاه ويؤمن به إيماناً مطلقاً رغم أوامر والديه.",
    personalityEn: "Loyal, compassionate, eager to learn, respectful of elders.",
    personalityAr: "وفيّ، حنون، شغوف بالتعلم، وبار بالمعلم والمسنين.",
    speechStyleEn: "Warm, respectful, enthusiastic, addressing Santiago as 'Old man'.",
    speechStyleAr: "ودود، مفعم بالاحترام والحماس، يخاطب سانتياغو بـ 'يا عمي'.",
    catchphrasesEn: [
      "Old man, you are the greatest fisherman I know.",
      "Now we will fish together again, for I still have much to learn."
    ],
    catchphrasesAr: [
      "يا عمي، أنت أعظم صياد عرفته على وجه الأرض.",
      "من الآن فصاعداً سنصطاد معاً دائماً، فما زال لدي الكثير لأتعلمه منك."
    ],
    coreMotivationsEn: ["Supporting Santiago in his time of need and learning the mastery of the sea."],
    coreMotivationsAr: ["مساندة سانتياغو في شدته والنهل من خبرته وحكمته البحرية."],
    relationshipsSummaryEn: "Santiago's devoted student and protector.",
    relationshipsSummaryAr: "التلميذ المخلص والحامي الوفي للشيخ سانتياغو.",
    knowledgeBoundariesEn: "Limited to the Cuban fishing village and his time with Santiago.",
    knowledgeBoundariesAr: "معرفته مقصورة على قريته الكوبية وأوقاته مع معلمه سانتياغو."
  },

  challenger: {
    id: "professor_challenger",
    names: ["challenger", "professor challenger", "george challenger", "تشالنجر", "البروفيسور تشالنجر", "بروفيسور تشالنجر"],
    primaryNameEn: "Professor George Edward Challenger",
    primaryNameAr: "البروفيسور جورج إدوارد تشالنجر",
    storyId: "story_sec_2_lost_world",
    storyTitleEn: "The Lost World",
    storyTitleAr: "العالم المفقود",
    gradeCode: "sec_2",
    roleEn: "Brilliant, explosive, and formidable British zoologist who discovered a prehistoric plateau in South America.",
    roleAr: "عالم حيوان بريطاني عبقري وضخم الجثة وشديد الانفعال؛ اكتشف هضبة معزولة في أمريكا الجنوبية تعيش عليها كائنات منقرضة.",
    personalityEn: "Titanic intellect, arrogant, combative, unapologetic, but possessing fierce scientific integrity and immense courage.",
    personalityAr: "عقلية جبارة، شديد الاعتداد بنفسه، حاد المزاج، لكنه يتمتع بنزاهة علمية وشجاعة ميدانية لا تلين.",
    speechStyleEn: "Thundering, articulate, academic, disdainful of ignorance. Uses elevated vocabulary like 'preposterous', 'ignoramuses', and 'empirical verification'.",
    speechStyleAr: "جهوري، فصيح، أكاديمي لا يطيق الجهل والتفاهة. يستعمل ألفاظاً رنانة مثل: 'هراء!', 'افتراءات سخيفة!', و'البرهان الميداني'.",
    catchphrasesEn: [
      "Preposterous doubts! Science demands evidence, not timid speculation!",
      "I have touched prehistory with my own hands on that isolated plateau!",
      "You journalists are pests, but if you have courage, follow me into the unknown!"
    ],
    catchphrasesAr: [
      "شكوك سخيفة وتخرصات جوفاء! العلم يتطلب دليلاً مادياً وليس تكهنات جبانة!",
      "لقد لمست عصور ما قبل التاريخ بيدي فوق تلك الهضبة المعزولة!",
      "أنتم معشر الصحفيين مزعجون، لكن إن كنت تملك الشجاعة، فاتبعني إلى المجهول!"
    ],
    coreMotivationsEn: [
      "Defending his revolutionary zoological discovery against the London scientific establishment.",
      "Leading the expedition safely through the wonders and horrors of the Lost World."
    ],
    coreMotivationsAr: [
      "إثبات صحة كشفه العلمي الثوري أمام معهد الحيوان والعلماء المشككين بلندن.",
      "قيادة البعثة الاستكشافية بنجاح وتوثيق كائنات ما قبل التاريخ الحية."
    ],
    relationshipsSummaryEn: "Sparred with reporter Malone before respecting his bravery; rivaled Professor Summerlee in acerbic debate; protected by Lord John Roxton.",
    relationshipsSummaryAr: "اشتبك مع الصحفي مالون ثم قدر شجاعته؛ ناظر سمرلي بسخرية علمية؛ واعتمد على بندقية اللورد جون روكستون.",
    knowledgeBoundariesEn: "Knowledge covers zoology, paleontology, anatomy, and British science up to Sir Arthur Conan Doyle's 1912 novel.",
    knowledgeBoundariesAr: "معارفه تمتد في علم الحيوان والأحياء القديمة والتشريح حتى بعثة الأمازون عام ١٩١٢."
  },

  zeina: {
    id: "zeina",
    names: ["zeina", "zaina", "زينة"],
    primaryNameEn: "Zeina",
    primaryNameAr: "زينة",
    storyId: "story_prep_3_garden_project",
    storyTitleEn: "The School Garden Project",
    storyTitleAr: "مشروع حديقة المدرسة",
    gradeCode: "prep_3",
    roleEn: "Thoughtful preparatory school student who initiated the school garden and became elected Student Council President.",
    roleAr: "طالبة إعدادية واعية أسست مبادرة تحويل فناء المدرسة المهمل إلى حديقة منتجة، وانتُخبت رئيسة لاتحاد الطلاب.",
    personalityEn: "Inspirational, pragmatic, collaborative, resilient, and deeply committed to community service.",
    personalityAr: "ملهمة، عملية، تؤمن بالعمل الجماعي، صبورة في مواجهة الصعاب، ومكرسة لخدمة مدرستها ومجتمعها.",
    speechStyleEn: "Encouraging, bright, energetic, respectful, focused on solutions and hope.",
    speechStyleAr: "محفزة، مفعمة بالطاقة الإيجابية، مهذبة، وتركز دائماً على الحلول والعمل البناء.",
    catchphrasesEn: [
      "Why complain about what is neglected when we can work together to make it green?",
      "Leadership is not a title; it is a duty to serve and help others grow.",
      "When you plant a good seed today, you give hope to tomorrow."
    ],
    catchphrasesAr: [
      "لماذا نكتفي بالشكوى من الإهمال بينما يمكننا أن نتكاتف لنحول الفناء إلى واحة خضراء؟",
      "القيادة ليست لقباً أو منصباً، بل هي أمانة لخدمة الآخرين ومساعدتهم على النجاح.",
      "عندما تزرع بذرة طيبة اليوم، فإنك تمنح أملاً حقيقياً للغد."
    ],
    coreMotivationsEn: [
      "Transforming her school environment through sustainable teamwork.",
      "Demonstrating that youth can initiate lasting positive civic change."
    ],
    coreMotivationsAr: [
      "تطوير البيئة المدرسية من خلال العمل الجماعي المستدام وإعادة التدوير.",
      "إثبات قدرة الشباب على صناعة فارق حقيقي في مجتمعهم المدرسي."
    ],
    relationshipsSummaryEn: "Mentored by Mr. Tarek; collaborated with Kareem and student volunteers; supported by the whole school.",
    relationshipsSummaryAr: "تلقت الدعم من معلم العلوم مستر طارق؛ تعاونت مع كريم وزملائها المتطوعين؛ ونالت ثقة المجتمع المدرسي.",
    knowledgeBoundariesEn: "Knowledge focuses on preparatory school life, environment, agriculture, and Ministry 2026 curriculum themes.",
    knowledgeBoundariesAr: "معارفها تركز على الحياة المدرسية الإعدادية، الزراعة، الاستدامة، ومناهج وزارة التربية والتعليم ٢٠٢٦."
  }
};

export function findPersonaByName(name: string): CharacterPersona | null {
  if (!name) return null;
  const clean = name.trim().toLowerCase();
  for (const key of Object.keys(CHARACTER_PERSONAS)) {
    const p = CHARACTER_PERSONAS[key];
    if (p.names.some(n => clean.includes(n) || n.includes(clean))) {
      return p;
    }
  }
  return null;
}

export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export interface CharacterInteractionParams {
  characterName: string;
  message: string;
  chapterId?: string;
  gradeId?: string;
}

export interface CharacterInteractionResponse {
  success: boolean;
  reply: string;
  languageTip: string;
  character: {
    id: string;
    nameEn: string;
    nameAr: string;
    roleEn: string;
    roleAr: string;
    storyTitleEn: string;
    storyTitleAr: string;
    gradeCode: string;
  };
  contextCitations?: {
    chapterNumber?: number;
    chapterTitleEn?: string;
    chapterTitleAr?: string;
    relevantQuote?: string;
  };
}

export async function interactWithCharacterAgent(
  params: CharacterInteractionParams
): Promise<CharacterInteractionResponse> {
  const { characterName, message, chapterId } = params;
  const persona = findPersonaByName(characterName);

  if (!persona) {
    const isAr = isArabicText(message);
    return {
      success: true,
      reply: isAr
        ? `مرحباً بك! أنا شخصية من عالم القصص الأدبية لـ Professional Academy. يرجى توجيه سؤالك حول أحداث القصة المقررة لأتمكن من إجابتك بدقة.`
        : `Greetings! I am a character from Professional Academy's Story World. Please ask me about our story events, themes, or decisions so I can guide you accurately.`,
      languageTip: `💡 نصيحة لغوية من مستر حبيب: Use clear wh-questions (Who, Why, How) to explore literary characters and themes!`,
      character: {
        id: "generic",
        nameEn: characterName,
        nameAr: characterName,
        roleEn: "Story Character",
        roleAr: "شخصية قصصية",
        storyTitleEn: "Story World",
        storyTitleAr: "عالم القصص",
        gradeCode: "sec_1"
      }
    };
  }

  // Retrieve relevant story data
  const story = ALL_CURRICULUM_STORIES.find(s => s.id === persona.storyId);
  const isAr = isArabicText(message);
  const msgLower = message.toLowerCase();

  // Find targeted chapter if specified or search text
  let targetChapter: ChapterItem | undefined;
  if (chapterId && story) {
    targetChapter = story.chapters.find(c => c.id === chapterId);
  }

  // Check for out-of-boundary questions (modern technology, other stories, cheating)
  const isOutOfBounds =
    msgLower.includes("iphone") ||
    msgLower.includes("mobile") ||
    msgLower.includes("facebook") ||
    msgLower.includes("ai") ||
    msgLower.includes("computer") ||
    msgLower.includes("هاتف") ||
    msgLower.includes("كمبيوتر") ||
    msgLower.includes("إنترنت") ||
    (persona.id === "santiago" && (msgLower.includes("edmond") || msgLower.includes("challenger") || msgLower.includes("zeina"))) ||
    (persona.id === "edmond_dantes" && (msgLower.includes("santiago") || msgLower.includes("dinosaur") || msgLower.includes("ديناصور")));

  if (isOutOfBounds) {
    const boundaryReply = isAr
      ? `عذراً يا بني، هذا الأمر يقع خارج حدود عالمنا وأحداث قصتنا (${persona.storyTitleAr}). أنا هنا لأحدثك عن رحلتي، صراعي، وقراراتي الموثقة في المنهج المقرر، فماذا تود أن تسألني عنه من أحداث قصتنا؟`
      : `That lies outside the realm of our journey in ${persona.storyTitleEn}. As ${persona.primaryNameEn}, my memories belong strictly to the events, decisions, and struggles recorded in our story. Ask me instead about what I endured or learned along the way!`;

    const tip = isAr
      ? `💡 نصيحة من مستر حبيب: لاحظ استخدام أسلوب الاستدراك المهذب ('As ..., my memories belong...') لحصر نطاق النقاش الأكاديمي!`
      : `💡 Tip from Mr. Habib: Notice the polite boundary phrasing ('That lies outside the realm of...'). It is a valuable formal phrase for argumentative writing!`;

    return {
      success: true,
      reply: boundaryReply,
      languageTip: tip,
      character: {
        id: persona.id,
        nameEn: persona.primaryNameEn,
        nameAr: persona.primaryNameAr,
        roleEn: persona.roleEn,
        roleAr: persona.roleAr,
        storyTitleEn: persona.storyTitleEn,
        storyTitleAr: persona.storyTitleAr,
        gradeCode: persona.gradeCode
      }
    };
  }

  // Search relevant Key Dialogues or Text in the story
  let foundDialogue: KeyDialogue | undefined;
  let foundTheme: ChapterThemeLesson | undefined;
  let citationCh: ChapterItem | undefined = targetChapter;

  if (story) {
    for (const ch of story.chapters) {
      if (ch.keyDialogues) {
        for (const dia of ch.keyDialogues) {
          if (
            msgLower.includes(dia.quoteEn.slice(0, 15).toLowerCase()) ||
            msgLower.includes(dia.speakerEn.toLowerCase()) ||
            message.includes(dia.speakerAr)
          ) {
            foundDialogue = dia;
            citationCh = ch;
            break;
          }
        }
      }
      if (foundDialogue) break;
    }
  }

  // Formulate In-Character Response based on Persona
  let reply = "";
  let languageTip = "";

  if (persona.id === "edmond_dantes") {
    if (msgLower.includes("why") && (msgLower.includes("arrest") || msgLower.includes("prison") || msgLower.includes("سجن") || message.includes("اعتقال"))) {
      reply = isAr
        ? `سؤال يفتح جراح أربعة عشر عاماً قبعت فيها في قلعة شاتو ديف! لقد كنت ضحية مؤامرة خبيثة؛ دانجلار حقد على ترقيتي لقبطان سفينة فاراون، وفرناند أراد الاستحواذ على خطيبتي ميرسيدس، بينما أحرق المدعي العام فيلفور رسالة براءتي لحماية والده نورتييه. في الفصل الثاني والثالث، ظنوا أنهم دفنوني حياً، لكن الأب فاريا منحني العلم والكنز لأعود بالعدالة.`
        : `A question that echoes through fourteen silent years in the dungeons of Château d'If! I was innocent, yet framed by Danglars out of pure envy for my captaincy, and by Fernand who coveted my beloved Mercédès. The prosecutor Villefort destroyed the letter to conceal his own father's treason. They believed I was buried forever, but Providence and Abbé Faria gave me knowledge, wealth, and the patience to wait for justice.`;
      languageTip = `💡 Tip from Mr. Habib: Edmond uses the passive voice effectively ('I was innocent, yet framed by Danglars'). Remember: Passive Voice focuses on the receiver of the action (Subject + was/were + V3)!`;
    } else if (msgLower.includes("mercédès") || msgLower.includes("mercedes") || message.includes("ميرسيدس") || message.includes("مرسيدس")) {
      reply = isAr
        ? `ميرسيدس.. كانت ملاك حياتي ونور أيامي في مرسيليا! في الفصل الأول، همست لي وعيناها مليئتان بالحب: "إدموند، لقد عدت سالماً. كنت أدعو لك كل يوم". كانت صدمة اعتقالي في حفل خطوبتنا أقسى من كل آلام الزنزانة. ورغم قسوة ما جرى بعد ذلك، يظل الوفاء هو أسمى المشاعر الإنسانية.`
        : `Mercédès was the light of my youth in Marseille! In Chapter 1, as the Pharaon anchored, she whispered to me with loving tears: "Edmond, you are safe. I prayed for you every day." To be torn from her embrace on our betrothal day was a wound deeper than the sea itself.`;
      languageTip = `💡 Tip from Mr. Habib: Notice the evocative direct quotation ("Edmond, you are safe..."). In Thanawya Amma reading exams, remembering exact speaker attributions is worth vital marks!`;
    } else if (msgLower.includes("faria") || message.includes("فاريا")) {
      reply = isAr
        ? `الأب فاريا لم يكن مجرد سجين شاركني زنزانة شاتو ديف؛ بل كان أبي الروحي وسراج عقلي! علمني اللغات والتاريخ والفيزياء، وحلل المؤامرة التي أودت بي، وورثني كنز جزيرة مونت كريستو لأستخدمه في إحقاق الحق. لولاه لكنت قضيت نحبي في اليأس.`
        : `Abbé Faria was my savior, my teacher, and my second father! In the subterranean gloom of Château d'If, he taught me languages, science, and the art of deduction. He bequeathed to me the Spada treasure on Monte Cristo, commanding me to use it for justice, never for greed.`;
      languageTip = `💡 Tip from Mr. Habib: Pay attention to the correlative conjunctions ('not only ... but also'). They elevate your English writing and score higher band grades in evaluations!`;
    } else {
      reply = isAr
        ? `مرحباً بك يا صديقي الباحث عن الحقيقة. لقد تعلمت في محنتي الطويلة ألا أحكم بتعجل، وأن أتأمل تصاريف القدر. وكما أقول دائماً: كل الحكمة الإنسانية تختصر في كلمتين: 'انتظر وترجَّ رحمة الله'. ما الذي يثقل فكرك وتريد أن تسألني عنه من أحداث رحلتي؟`
        : `Welcome, young scholar of literature. My long trials taught me that despair is the only true death, and that time unravels every treachery. As I often say: all human wisdom is contained in two words: 'Wait and hope.' What aspect of my journey in Marseille, the Château d'If, or Monte Cristo would you like to explore?`;
      languageTip = `💡 Tip from Mr. Habib: Edmond Dantès' iconic motto 'Wait and hope' demonstrates the rhetorical power of short parallel imperatives. Practice using parallel structures in your writing!`;
    }
  } else if (persona.id === "santiago") {
    if (msgLower.includes("why") && (msgLower.includes("84") || msgLower.includes("85") || msgLower.includes("far") || message.includes("بعيد") || message.includes("٨٤") || message.includes("٨٥"))) {
      reply = isAr
        ? `أيها الصديق العزيز، ٨٤ يوماً مرت في تيار الخليج دون سمكة واحدة! همس الصيادون في القرية أنني 'سالاو' أي أسوأ درجات النحس. لكن الصيد ليس حظاً فحسب، بل مهارة وصبر وشجاعة. في اليوم الخامس والثمانين، كان رقماً محظوظاً، فعقدت العزم على الإبحار بعيداً، أبعد مما يجرؤ الآخرون، لأثبت لنفسي وللصبي مانولين أن كرامة الرجل لا تُهزم.`
        : `Ah, young friend! For eighty-four long days I rowed out and returned empty-handed. The younger village fishermen whispered that I was 'salao'—the worst kind of unlucky. But fishing is about precision, endurance, and honor. On the eighty-fifth day, I resolved to venture far out into the deep Gulf Stream, farther than any other man dared to go, determined to prove that my strength was unbroken.`;
      languageTip = `💡 Tip from Mr. Habib: Notice Santiago's exact number: eighty-four days (and the 85th day). In First Secondary exams, numerical factual details from Hemingway's text are frequent question targets!`;
    } else if (msgLower.includes("marlin") || msgLower.includes("fish") || message.includes("سمك") || message.includes("مارلين")) {
      reply = isAr
        ? `سمكة المارلين العظيمة لم تكن مجرد صيد، بل كانت أخي وشريكي في هذا المحيط! قاومتني يومين وليلتين، وجرت قاربي دون كلل. كنت جائعاً ويداي مجروحتان تنزفان، لكنني همست لها بإجلال: 'أحبك وأحترمكِ كثيراً، لكن يجب أن أقتلك قبل أن ينتهي اليوم'. وحين طعنتها بالرمح، شعرت بحزن نبيل على موت هذا المخلوق الأسطوري.`
        : `The great marlin was not just a prize; he was my brother and equal in the ocean! For two days and nights he towed my little skiff. My hands bled and cramped, but I held no anger, only awe. I whispered to him: 'I love you and respect you very much. But I will kill you dead before this day ends.' He died with regal dignity, longer than the skiff itself.`;
      languageTip = `💡 Tip from Mr. Habib: Santiago personifies the fish as his 'brother'. In literary appreciation questions, identify personification as the attribution of human qualities to animals or nature!`;
    } else if (msgLower.includes("shark") || message.includes("قرش") || message.includes("قروش")) {
      reply = isAr
        ? `آه، وحوش القرش الشرهة! جاء قرش الماكو أولاً بعد أن تتبع خط الدم، ثم جاءت أسراب القروش الأخرى في الظلام. قاتلتهم برمح الصيد حتى انكسر، ثم ربطت سكيني بالمجداف، ثم بالدفة ذاتها. التهموا لحم السمكة، لكنهم لم يهزموا روحي؛ لأن الإنسان قد يُدمر لكنه لا يُهزم أبداً!`
        : `The sharks! First the fierce Mako scented the dark blood, then the scavengers came in packs. I fought them with my harpoon until it snapped, then with my knife lashed to an oar, then with the tiller itself. They stole the meat, but they could never take my pride. Remember this: a man can be destroyed, but not defeated!`;
      languageTip = `💡 Tip from Mr. Habib: Memorize Santiago's immortal maxim: 'A man can be destroyed, but not defeated.' It expresses resilience through contrasting passive verbs ('destroyed' vs 'defeated')!`;
    } else {
      reply = isAr
        ? `أهلاً بك يا بني في كوخي المتواضع عند شاطئ البحر. البحر صديق ومعلم قاسٍ، وقد علمني أن الصبر والإتقان هما مفتاح كل خير. كما أقول دائماً لمانولين: من الرائع أن يحالفك الحظ، لكنني أفضل أن أكون دقيقاً متقناً، فإذا أقبل الحظ وجدني مستعداً. ماذا تريد أن تسألني عنه من صراعي في تيار الخليج؟`
        : `Welcome to my humble shack by the sea, young friend. The ocean is generous but demanding. I always say: it is better to be lucky, but I would rather be exact; then when luck comes, you are ready. What weighs on your mind regarding our voyage into the Gulf Stream?`;
      languageTip = `💡 Tip from Mr. Habib: Notice the conditional structure in Santiago's words ('When luck comes, you are ready' - Zero Conditional expressing timeless truth)!`;
    }
  } else if (persona.id === "professor_challenger") {
    if (msgLower.includes("dinosaur") || msgLower.includes("plateau") || message.includes("ديناصور") || message.includes("هضبة")) {
      reply = isAr
        ? `تساؤل جدير بالعلماء الحقيقيين! الهضبة المعزولة في حوض الأمازون حقيقة علمية دامغة لمستها بيدي وتسلقتها بنفسي. الصخور البازلتية الحمراء عزلت تلك البيئة لملايين السنين، فحفظت كائنات الإغوانودون والبتيروداكتيل ووحوش ما قبل التاريخ حية تسعى! لقد كشفت مذكرات مابل وايت لمالون، ثم أثبتنا ذلك أمام معهد الحيوان بلندن!`
        : `A sensible inquiry at last! The isolated plateau in the Amazon basin is a certified scientific reality that I have touched with my own hands. The red basalt cliffs severed that ecosystem from external evolution, preserving Iguanodons, Pterodactyls, and carnivorous theropods alive! I presented Maple White's sketches to young Malone, and our subsequent expedition confirmed it beyond all rational dispute!`;
      languageTip = `💡 Tip from Mr. Habib: Professor Challenger employs precise scientific terminology ('isolated plateau', 'basalt cliffs', 'evolution'). Using domain-specific vocabulary demonstrates advanced lexical mastery!`;
    } else {
      reply = isAr
        ? `حسناً! أراك طالباً مجتهداً يسعى وراء البرهان العلمي وليس التخرصات الصحفية الجاهلة! أنا البروفيسور جورج إدوارد تشالنجر، وعلومي لا تبنى على التخمين، بل على الملاحظة الميدانية الدقيقة. اسأل ما بدا لك عن رحلتنا إلى أعماق أمريكا الجنوبية أو فخ الخائن جوميز، وسأجيبك بحقائق العلم المجردة!`
        : `Silence your timid doubts! I am Professor George Edward Challenger, and I deal solely in verifiable scientific truth, not the contemptible gossip of sensational journalists! Ask your question concerning our perilous expedition to South America or the treachery of Gomez, and I shall instruct you with empirical rigor!`;
      languageTip = `💡 Tip from Mr. Habib: Notice Challenger's imperative commanding tone ('Silence your doubts!'). Imperative sentences without stated subjects emphasize direct authority in formal debates!`;
    }
  } else if (persona.id === "zeina") {
    if (msgLower.includes("garden") || msgLower.includes("idea") || message.includes("حديقة") || message.includes("فكرة")) {
      reply = isAr
        ? `أهلاً بك! فكرة الحديقة بدأت ببساطة عندما وقفت في فناء مدرستنا ورأيت تلك المساحة المهملة الجافة. شعرت أنه من غير اللائق أن نكتفي بالشكوى من الإهمال بينما نملك أيدينا وعقولنا لتغيير الواقع. بالتعاون مع مستر طارق وفريق المتطوعين، واجهنا فقر التربة وشح المياه بالري بالتنقيط وإعادة التدوير، حتى أزهرت الحديقة وأصبحت فخراً لمدرستنا كلها!`
        : `Welcome! The garden idea began the moment I stood in our school playground and saw that dry, neglected ground. I realized complaining changes nothing, but taking personal responsibility changes everything! With Mr. Tarek's guidance and student volunteers, we overcame poor soil through composting and built recycled drip irrigation until our garden flourished!`;
      languageTip = `💡 Tip from Mr. Habib: Zeina contrasts gerunds as subjects ('Complaining changes nothing, but taking responsibility changes everything'). Using gerund phrases adds elegance to your English essays!`;
    } else {
      reply = isAr
        ? `أهلاً بك يا زميلي العزيز! أنا زينة، وتعلمت من تجربتي في المدرسة أن القيادة ليست منصباً أو وجاهة، بل هي أمانة لخدمة الآخرين والعمل المشترك لحل المشكلات. كل خطوة صغيرة نزرعها اليوم بالتعاون والإخلاص تصنع فارقاً مستداماً في الغد. ما الذي تود أن تسألني عنه من مشروعنا أو ناد البيئة المدرسي؟`
        : `Hello! I am Zeina. My experience with the School Garden Project taught me that real leadership is about helping others grow and turning obstacles into learning opportunities. What would you like to know about our student initiatives or overcoming challenges through teamwork?`;
      languageTip = `💡 Tip from Mr. Habib: Zeina frequently uses words of positive action ('initiative', 'collaborative', 'overcome'). Cultivate an active, solution-focused tone in your presentations!`;
    }
  } else {
    reply = isAr
      ? `مرحباً بك! بصفتي شخصية من شخصيات هذه القصة، أؤكد لك أن كل تفصيل وكل قرار في حكايتنا يحمل حكمة وقيمة. ما هو السؤال المحدد الذي تود طرحه حول مجريات الفصل ومواقف الشخصيات؟`
      : `Greetings! In our story, every action and decision carries profound meaning and character motivation. What specific question do you have regarding the chapters, dialogues, or turning points?`;
    languageTip = `💡 Tip from Mr. Habib: Consistent daily practice asking deep interpretive questions helps you excel in literature and comprehension exams!`;
  }

  return {
    success: true,
    reply,
    languageTip,
    character: {
      id: persona.id,
      nameEn: persona.primaryNameEn,
      nameAr: persona.primaryNameAr,
      roleEn: persona.roleEn,
      roleAr: persona.roleAr,
      storyTitleEn: persona.storyTitleEn,
      storyTitleAr: persona.storyTitleAr,
      gradeCode: persona.gradeCode
    },
    contextCitations: citationCh ? {
      chapterNumber: citationCh.chapterNumber,
      chapterTitleEn: citationCh.titleEn,
      chapterTitleAr: citationCh.titleAr,
      relevantQuote: foundDialogue?.quoteEn
    } : undefined
  };
}
