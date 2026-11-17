/**
 * PROFESSIONAL ACADEMY — LITERATURE & NOVEL WORLD SEEDS
 * Teacher: Mr. Habib El Rahman
 * Academic Year: 2026 / 2027
 *
 * Egyptian Middle & High School Assigned English Novels:
 * - 3rd Sec: Great Expectations (Charles Dickens)
 * - 2nd Sec: King Lear (William Shakespeare)
 * - 1st Sec: Treasure Island (Robert Louis Stevenson)
 * - 3rd Prep: Black Beauty (Anna Sewell)
 * - 2nd Prep: Around the World in 80 Days (Jules Verne)
 * - 1st Prep: The Secret Garden (Frances Hodgson Burnett)
 */

export interface NovelCharacter {
  name: string;
  role_ar: string;
  traits: string[];
  motivation_ar: string;
}

export interface NovelQuotation {
  quote: string;
  speaker: string;
  addressed_to: string;
  comment_ar: string;
}

export interface CriticalThinkingQuestion {
  id: string;
  question_en: string;
  model_answer_en: string;
  explanation_ar: string;
  key_points: string[];
}

export interface NovelChapter {
  id: string;
  grade_level: "1st_prep" | "2nd_prep" | "3rd_prep" | "1st_sec" | "2nd_sec" | "3rd_sec";
  grade_title_ar: string;
  novel_title: string;
  author: string;
  chapter_number: number;
  chapter_title: string;
  summary_en: string;
  summary_ar: string;
  audio_url?: string;
  key_vocabulary: {
    word: string;
    meaning_ar: string;
    context_sentence: string;
  }[];
  characters: NovelCharacter[];
  key_quotations: NovelQuotation[];
  critical_thinking_qs: CriticalThinkingQuestion[];
}

export const NOVEL_CHAPTERS_SEED: NovelChapter[] = [
  // ==========================================
  // 3RD SECONDARY: GREAT EXPECTATIONS
  // ==========================================
  {
    id: "c3000000-0000-0000-0000-000000000001",
    grade_level: "3rd_sec",
    grade_title_ar: "الصف الثالث الثانوي (الثانوية العامة)",
    novel_title: "Great Expectations",
    author: "Charles Dickens",
    chapter_number: 1,
    chapter_title: "A Terrifying Encounter in the Marshes",
    summary_en:
      "The story opens on a cold Christmas Eve in the desolate marsh country of Kent. Pip, a young orphan raised 'by hand' by his harsh sister Mrs. Joe Gargery and her kind blacksmith husband Joe, visits the graves of his parents and deceased siblings in a lonely churchyard. Suddenly, a terrifying, shivering convict in leg irons and ragged clothes leaps from behind the gravestones. The desperate fugitive threatens to cut Pip's throat unless the boy brings him a blacksmith's file and food. He terrifies Pip by inventing a monstrous young companion who will tear out Pip's heart if he disobeys. Terrified, Pip swears to help him and runs home in fear, setting the life-changing events of his life into motion.",
    summary_ar:
      "تبدأ أحداث الرواية في عشية عيد الميلاد الباردة في منطقة المستنقعات الكئيبة بكنت. يزور الطفل اليتيم بيب قبور والديه وإخوته الراحلين في مقبرة الكنيسة المنعزلة. فجأة، يقفز من بين شواهد القبور سجين هارب مرعب مقيد بالسلاسل وثيابه ممزقة ويرتعد من البرد. يهدد السجين بيب بذبحه إذا لم يحضر له مبرداً لفك قيوده وطعاماً، ويخيفه بشاب شرير خيالي سيقتله إذا أخلف وعده. يرتعد بيب ويعده بالمساعدة ويهرب للمنزل في رعب، لتبدأ نقطة التحول الكبرى في مصيره.",
    audio_url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    key_vocabulary: [
      {
        word: "marsh",
        meaning_ar: "مستنقع / أرض طينية رطبة",
        context_sentence: "The churchyard was situated in the bleak marsh country.",
      },
      {
        word: "convict",
        meaning_ar: "سجين محكوم عليه / مجرم هارب",
        context_sentence: "A fearful man in grey clothes with a great iron on his leg.",
      },
      {
        word: "leg irons",
        meaning_ar: "أصفاد وأغلال حديدية في القدمين",
        context_sentence: "The convict limped heavily because of the heavy leg irons.",
      },
      {
        word: "blacksmith",
        meaning_ar: "حداد",
        context_sentence: "Joe Gargery was the kind village blacksmith.",
      },
      {
        word: "churchyard",
        meaning_ar: "مقبرة الكنيسة",
        context_sentence: "Pip was weeping beside his parents' graves in the churchyard.",
      },
      {
        word: "file",
        meaning_ar: "مبرد حديد لقطع الأغلال",
        context_sentence: "The convict demanded that Pip steal a file from Joe's forge.",
      },
      {
        word: "wittles",
        meaning_ar: "طعام ومؤن (لهجة إنجليزية قديمة)",
        context_sentence: "Bring me that file and them wittles, or your heart shall be torn out.",
      },
      {
        word: "shudder",
        meaning_ar: "يرتعد من الخوف أو البرد",
        context_sentence: "The convict shuddered and his teeth chattered violently.",
      },
    ],
    characters: [
      {
        name: "Pip (بيب)",
        role_ar: "البطل والراوي الصغير",
        traits: ["بريء", "حساس", "يتيم", "خائف"],
        motivation_ar: "البقاء على قيد الحياة وزيارة قبر والديه، وصراعه الأخلاقي بين مساعدة السجين أو سرقة جو.",
      },
      {
        name: "The Convict / Magwitch (السجين الهارب - ماجويتش)",
        role_ar: "السجين الهارب الغامض",
        traits: ["يائس", "جائع", "مرعب", "مكبل بالأغلال"],
        motivation_ar: "فك قيوده والحصول على الطعام للنجاة من مطاردة جنود الحراسة في المستنقعات.",
      },
      {
        name: "Joe Gargery (جو جارجري)",
        role_ar: "زوج الأخت والحداد الطيب",
        traits: ["حنون", "صادق", "مخلص", "مسالم"],
        motivation_ar: "حماية بيب ومحبته وتوفير حياة هادئة له رغم قسوة زوجته.",
      },
      {
        name: "Mrs. Joe Gargery (السيدة جو جارجري)",
        role_ar: "أخت بيب الكبرى القاسية",
        traits: ["حادة الطباع", "سريعة الغضب", "متسلطة"],
        motivation_ar: "التفاخر بتربية بيب بـ (يدها) وتفريغ غضبها المستمر في المنزل.",
      },
    ],
    key_quotations: [
      {
        quote: "Hold your noise! Keep still, you little devil, or I'll cut your throat!",
        speaker: "The Convict (Magwitch)",
        addressed_to: "Pip",
        comment_ar: "الافتتاحية الصادمة التي تبدأ بها الرواية؛ تظهر مدى بؤس ويأس السجين وخوف بيب الشديد، وهو سؤال ثانوية عامة متكرر حول انطباع بيب الأول.",
      },
      {
        quote: "You bring me, to-morrow morning early, that file and them wittles... and you shall be let to live.",
        speaker: "The Convict",
        addressed_to: "Pip",
        comment_ar: "الطلب المحوري الذي يضع الطفل بيب في صراع أخلاقي قاسٍ بين خوفه من الموت وبين السرقة وخيانة ثقة جو.",
      },
      {
        quote: "I was always treated as if I had insisted on being born in defiance of the dictates of reason.",
        speaker: "Pip (Narrator)",
        addressed_to: "Readers / Audience",
        comment_ar: "يعكس قسوة معاملة السيدة جو لبيب وشعوره الدائم بالذنب والاضطهاد كونه طفلاً يتيماً.",
      },
    ],
    critical_thinking_qs: [
      {
        id: "ct_1",
        question_en: "In your opinion, why did the convict invent the story about the 'monstrous young man' to threaten Pip?",
        model_answer_en:
          "The convict wanted to ensure that young Pip would not dare to betray him or tell the police or his family. By creating an imaginary, merciless partner who could find Pip anywhere, the convict exploited the child's vivid imagination and intense fear to guarantee his survival and secure the food and file.",
        explanation_ar:
          "اخترع السجين قصة الشاب المتوحش ليزيد من رعب الطفل الصغير ويضمن عدم إفشائه للسر أو إبلاغ الشرطة وسرعة إحضار المؤن.",
        key_points: ["guarantee silence", "exploit child fear", "ensure survival", "prevent informing police", "secure food and file"],
      },
      {
        id: "ct_2",
        question_en: "Pip felt a deep inner conflict after promising to help the convict. How did this conflict affect his moral conscience?",
        model_answer_en:
          "Pip was torn between fear for his life and guilt about stealing from Joe, the only person who showed him genuine kindness. Although he was forced to commit a theft, his conscience tortured him because he hated deceiving Joe and breaking the moral values of the household.",
        explanation_ar:
          "عاش بيب صراعاً مؤلماً بين خوفه على حياته من السجين وبين شعوره بالذنب لسرقة جو الذي يحبه ويحسن معاملته.",
        key_points: ["torn between fear and guilt", "stealing from Joe", "moral conscience", "deceiving Joe", "inner conflict"],
      },
      {
        id: "ct_3",
        question_en: "How does the opening setting of the desolate marshes reflect Pip's internal emotional state at the beginning of the novel?",
        model_answer_en:
          "The bleak, foggy, and lonely churchyard surrounded by dark marshes mirrors Pip's profound loneliness, grief over his dead family, and his uncertain, vulnerable future. The gloomy environment sets a somber, gothic tone for the entire story.",
        explanation_ar:
          "تعكس البيئة الكئيبة والضبابية في المستنقعات حزن بيب العميق ويتمه وشعوره بالوحدة والضياع في بداية الرواية.",
        key_points: ["bleak setting", "foggy marshes", "mirrors loneliness", "grief for family", "gothic tone", "vulnerability"],
      },
    ],
  },

  // ==========================================
  // 2ND SECONDARY: KING LEAR
  // ==========================================
  {
    id: "c2000000-0000-0000-0000-000000000001",
    grade_level: "2nd_sec",
    grade_title_ar: "الصف الثاني الثانوي",
    novel_title: "King Lear",
    author: "William Shakespeare",
    chapter_number: 1,
    chapter_title: "The Love Test and the Division of the Kingdom",
    summary_en:
      "Aging King Lear decides to step down from the throne and divide his British kingdom among his three daughters: Goneril, Regan, and Cordelia. He subjects them to a public 'love test', offering the largest share to the daughter who expresses the greatest devotion. Flattering Goneril and Regan make exaggerated declarations of love and receive rich thirds of the realm. However, his youngest, most honest daughter Cordelia refuses to flatter, stating she loves him according to her duty—no more, no less. Enraged by her honesty, Lear disowns Cordelia and banishes the loyal Earl of Kent who defends her, making a tragic, fatal mistake.",
    summary_ar:
      "يقرر الملك العجوز لير التنازل عن عرش بريطانيا وتقسيم مملكته بين بناته الثلاث: جونريل، وريجان، وكورديليا. يختبر حبهن علناً، مانحاً الحصة الأكبر لمن تبدي حباً أعظم. تبالغ جونريل وريجان في التملق الكاذب وتنالان نصيبهما. بينما ترفض الابنة الصغرى المخلصة كورديليا النفاق، وتعلن أنها تحبه كما يقتضي واجب الابنة نحو أبيها. يغضب الملك ويطرد كورديليا وينفي مخلصه كنت، بادئاً مأساته التراجيدية الكبرى.",
    audio_url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    key_vocabulary: [
      {
        word: "abdicate",
        meaning_ar: "يتنازل عن العرش",
        context_sentence: "King Lear wished to abdicate his royal responsibilities.",
      },
      {
        word: "flattery",
        meaning_ar: "نفاق وتملق",
        context_sentence: "Goneril used deceitful flattery to win her father's favor.",
      },
      {
        word: "banish",
        meaning_ar: "ينفي أو يطرد",
        context_sentence: "Lear banished the faithful Earl of Kent from the kingdom.",
      },
      {
        word: "disown",
        meaning_ar: "يتبرأ من ابنه/ابنته",
        context_sentence: "In blind fury, Lear chose to disown his beloved Cordelia.",
      },
    ],
    characters: [
      {
        name: "King Lear (الملك لير)",
        role_ar: "ملك بريطانيا العجوز المتكبر والمندفع",
        traits: ["عجوز", "متسرع", "مغرور", "محب للمديح"],
        motivation_ar: "التخلي عن أعباء الحكم مع الاحتفاظ بمظاهر الاحترام الملكي.",
      },
      {
        name: "Cordelia (كورديليا)",
        role_ar: "الابنة الصغرى الصادقة",
        traits: ["صادقة", "شجاعة", "مخلصة", "تكره النفاق"],
        motivation_ar: "الحفاظ على الصدق والمشاعر الحقيقية دون تزلف.",
      },
      {
        name: "Goneril & Regan (جونريل وريجان)",
        role_ar: "الابنتان الكبريان المتملقتان",
        traits: ["منافقتان", "طماعتان", "قاسيتان"],
        motivation_ar: "الاستيلاء على ثروة وأراضي المملكة بأي ثمن.",
      },
    ],
    key_quotations: [
      {
        quote: "Unhappy that I am, I cannot heave my heart into my mouth: I love your majesty according to my bond; nor more nor less.",
        speaker: "Cordelia",
        addressed_to: "King Lear",
        comment_ar: "أشهر مقولة توضح رفض كورديليا للمتاجرة بالمشاعر الصادقة، وكانت سبباً في غضب أبيها.",
      },
      {
        quote: "Come not between the dragon and his wrath.",
        speaker: "King Lear",
        addressed_to: "Earl of Kent",
        comment_ar: "يظهر غطرسة لير وثورته العمياء عندما حاول كنت تحذيره من الخطأ.",
      },
    ],
    critical_thinking_qs: [
      {
        id: "ct_lear_1",
        question_en: "Why was King Lear's love test fundamentally flawed from the very beginning?",
        model_answer_en:
          "Love cannot be measured by flattery or public speeches. By demanding verbal proof of affection, Lear rewarded hypocrisy and punished genuine honesty, mistaking superficial words for true filial devotion.",
        explanation_ar:
          "لأن الحب الحقيقي لا يقاس بالكلام المنمق والنفاق، وبذلك عاقب لير الصدق وكافأ الزيف.",
        key_points: ["love cannot be measured by words", "rewarded hypocrisy", "punished honesty", "superficial flattery"],
      },
    ],
  },

  // ==========================================
  // 1ST SECONDARY: TREASURE ISLAND
  // ==========================================
  {
    id: "c1000000-0000-0000-0000-000000000001",
    grade_level: "1st_sec",
    grade_title_ar: "الصف الأول الثانوي",
    novel_title: "Treasure Island",
    author: "Robert Louis Stevenson",
    chapter_number: 1,
    chapter_title: "The Old Sea Dog at the Admiral Benbow",
    summary_en:
      "Young Jim Hawkins recounts the arrival of a mysterious, brown-faced old seaman with a sabre cut across his cheek at his parents' inn, the Admiral Benbow. The old buccaneer, Billy Bones, sings pirate songs, drinks rum, and pays Jim to keep his 'weather eye open' for a seafaring man with one leg. The arrival of Billy Bones shatters the quiet coastal life of young Jim and marks the prelude to a dangerous adventure for buried pirate treasure.",
    summary_ar:
      "يروي الفتى جيم هوكينز قصة وصول بحار قديم غامض بوجهه الأسمر وندبة السيف على خده إلى نزل والديه (الأدميرال بينبو). كان القرصان العجوز بيلي بونز يشرب الروم ويردد أناشيد القراصنة، ودفع لجيم نقوداً ليراقبه ويحذره من أي بحار ذي ساق خشبية واحدة، لتنطلق أولى خيوط رحلة البحث عن كنز القراصنة المدفون.",
    audio_url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    key_vocabulary: [
      {
        word: "buccaneer",
        meaning_ar: "قرصان بحري قديم",
        context_sentence: "Billy Bones was a fierce old buccaneer.",
      },
      {
        word: "sabre cut",
        meaning_ar: "ندبة جرح سيف",
        context_sentence: "He had a dirty, livid white sabre cut across one cheek.",
      },
      {
        word: "inn",
        meaning_ar: "نزل أو فندق ريفي صغير",
        context_sentence: "Jim's family kept the Admiral Benbow inn.",
      },
    ],
    characters: [
      {
        name: "Jim Hawkins (جيم هوكينز)",
        role_ar: "الراوي والفتى المغامر",
        traits: ["ذكي", "شجاع", "ملاحظ دقيق"],
        motivation_ar: "مساعدة أسرته في إدارة النزل وفضوله لاكتشاف أسرار البحار.",
      },
      {
        name: "Billy Bones (بيلي بونز)",
        role_ar: "القرصان العجوز الغامض",
        traits: ["عنيف", "مذعور", "محب للخمر"],
        motivation_ar: "إخفاء خريطة الكنز والهروب من رفاقه القراصنة السابقين.",
      },
    ],
    key_quotations: [
      {
        quote: "Fifteen men on the dead man's chest—Yo-ho-ho, and a bottle of rum!",
        speaker: "Billy Bones",
        addressed_to: "Guests at the inn",
        comment_ar: "الأغنية الشهيرة للقرصان الكابتن فلينت التي تدل على ماضيه الدامي في البحر.",
      },
    ],
    critical_thinking_qs: [
      {
        id: "ct_treasure_1",
        question_en: "Why was Billy Bones terrified of the 'one-legged sailor'?",
        model_answer_en:
          "Because he knew that Long John Silver, the ruthless pirate leader with one leg, was hunting him down to take Captain Flint's treasure map.",
        explanation_ar:
          "لأنه كان يعلم أن لونج جون سيلفر، زعيم القراصنة الماكر ذو الساق الواحدة، يلاحقه للاستيلاء على خريطة الكنز.",
        key_points: ["Long John Silver", "pirate leader", "hunting for map", "ruthless pirate"],
      },
    ],
  },
];
