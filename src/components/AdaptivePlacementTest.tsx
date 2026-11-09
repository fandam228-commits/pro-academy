"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Trophy,
  ShieldCheck,
  HelpCircle,
  Volume2,
  VolumeX,
  Timer,
  Compass,
  BookOpen,
  GraduationCap,
  Award,
  BarChart3,
  Layers,
  Globe,
  School,
  FileText,
  Check,
  X,
  Printer,
  ChevronRight,
} from "lucide-react";

export type TestTrackId = "cefr_global" | "prep_stage" | "secondary_stage";

export interface PlacementQuestion {
  id: string;
  category: "Grammar" | "Vocabulary" | "Reading & Context" | "Idioms & Mechanics";
  levelTag: string; // e.g. "A1", "B2", "Prep 1", "Sec 3"
  cefrEquiv?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  question: string;
  options: string[];
  correct: number;
  explanationAr: string;
  explanationEn: string;
}

export interface TrackDefinition {
  id: TestTrackId;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: React.ElementType;
  badge: string;
  durationMinutes: number;
  standardsBadge: string;
  descriptionAr: string;
  descriptionEn: string;
  questions: PlacementQuestion[];
}

/* =========================================================================
   1. TRACK 1: CEFR GLOBAL (A1 -> C2) - CAMBRIDGE / IELTS / TOEFL
   ========================================================================= */
const cefrGlobalQuestions: PlacementQuestion[] = [
  // A1 (Beginner)
  {
    id: "cefr_a1_1",
    category: "Grammar",
    levelTag: "A1 • Beginner",
    cefrEquiv: "A1",
    question: "My brother ______ eighteen years old.",
    options: ["is", "are", "am", "be"],
    correct: 0,
    explanationAr: "الفاعل المفرد الغائب (My brother = He) يأخذ صيغة (is) في المضارع البسيط لفعل To Be.",
    explanationEn: "Third-person singular subject takes 'is' in the present simple tense of 'be'.",
  },
  {
    id: "cefr_a1_2",
    category: "Vocabulary",
    levelTag: "A1 • Beginner",
    cefrEquiv: "A1",
    question: "Where can I buy some medicine? - At the ______.",
    options: ["pharmacy", "library", "bakery", "museum"],
    correct: 0,
    explanationAr: "نشتري الدواء من الصيدلية (pharmacy)، بينما library للمطالعة، bakery للمخبوزات، وmuseum للآثار.",
    explanationEn: "Medicine is purchased at a pharmacy.",
  },
  {
    id: "cefr_a1_3",
    category: "Grammar",
    levelTag: "A1 • Beginner",
    cefrEquiv: "A1",
    question: "______ do you usually wake up on Fridays? - At 8:00 AM.",
    options: ["What time", "Where", "Who", "How many"],
    correct: 0,
    explanationAr: "للسؤال عن الوقت المحدد (الساعة الثامنة) نستخدم أداة الاستفهام (What time).",
    explanationEn: "'What time' is used to inquire about specific times of day.",
  },

  // A2 (Elementary)
  {
    id: "cefr_a2_1",
    category: "Grammar",
    levelTag: "A2 • Elementary",
    cefrEquiv: "A2",
    question: "Yesterday, we ______ to the Egyptian Museum and saw ancient treasures.",
    options: ["went", "go", "are going", "gone"],
    correct: 0,
    explanationAr: "كلمة Yesterday تدل على الماضي البسيط، والتصريف الثاني للفعل go هو went.",
    explanationEn: "'Yesterday' signals past simple; 'went' is the past form of 'go'.",
  },
  {
    id: "cefr_a2_2",
    category: "Grammar",
    levelTag: "A2 • Elementary",
    cefrEquiv: "A2",
    question: "This new tablet is much ______ than the old model we had.",
    options: ["faster", "fastest", "more fast", "as fast"],
    correct: 0,
    explanationAr: "في المقارنة بين طرفين للصفات القصيرة (fast) نضيف (er) متبوعة بـ than لتصبح faster than.",
    explanationEn: "Short comparative adjectives take -er + than ('faster than').",
  },
  {
    id: "cefr_a2_3",
    category: "Reading & Context",
    levelTag: "A2 • Elementary",
    cefrEquiv: "A2",
    question: "I look forward to ______ you at the graduation ceremony next month.",
    options: ["seeing", "see", "saw", "seen"],
    correct: 0,
    explanationAr: "التركيب الاصطلاحي (look forward to) يُتبع دائماً باسم أو فعل مضاف له ing (Gerund).",
    explanationEn: "The phrasal prepositional verb 'look forward to' requires a gerund (-ing).",
  },

  // B1 (Intermediate - Cambridge Preliminary / IELTS 4.5-5.0 / TOEFL 45-60)
  {
    id: "cefr_b1_1",
    category: "Grammar",
    levelTag: "B1 • Intermediate",
    cefrEquiv: "B1",
    question: "I ______ in Alexandria since 2018, so I know the city thoroughly.",
    options: ["have lived", "lived", "was living", "am living"],
    correct: 0,
    explanationAr: "استخدام since مع نقطة زمنية في الماضي مع استمرار الحدث يتطلب المضارع التام (have lived).",
    explanationEn: "'Since 2018' expressing continuation from the past to the present requires present perfect.",
  },
  {
    id: "cefr_b1_2",
    category: "Grammar",
    levelTag: "B1 • Intermediate",
    cefrEquiv: "B1",
    question: "If I had enough spare time, I ______ join the public speaking club.",
    options: ["would", "will", "can", "shall"],
    correct: 0,
    explanationAr: "الحالة الشرطية الثانية (If + past simple) تعبر عن افتراض غير حقيقي في الحاضر وجواب الشرط يأخذ would + infinitive.",
    explanationEn: "Second conditional (unreal present): If + Past Simple, Would + bare infinitive.",
  },
  {
    id: "cefr_b1_3",
    category: "Grammar",
    levelTag: "B1 • Intermediate",
    cefrEquiv: "B1",
    question: "The scientist ______ discovered the groundbreaking vaccine received a Nobel Prize.",
    options: ["who", "which", "whom", "whose"],
    correct: 0,
    explanationAr: "ضمير الوصل الدال على الفاعل العاقل (The scientist) هو who.",
    explanationEn: "The relative pronoun 'who' refers to the human subject 'scientist'.",
  },

  // B2 (Upper Intermediate - Cambridge First FCE / IELTS 6.0-6.5 / TOEFL 75-90)
  {
    id: "cefr_b2_1",
    category: "Grammar",
    levelTag: "B2 • Upper Intermediate",
    cefrEquiv: "B2",
    question: "All mobile phones must ______ before entering the examination hall.",
    options: ["be switched off", "switch off", "have switched off", "be switching off"],
    correct: 0,
    explanationAr: "المبني للمجهول مع الأفعال الناقصة (must) يتكون من (must + be + p.p) لأن الهواتف مفعول به يتم إغلاقه.",
    explanationEn: "Passive voice with modal verbs: Modal (must) + be + past participle.",
  },
  {
    id: "cefr_b2_2",
    category: "Reading & Context",
    levelTag: "B2 • Upper Intermediate",
    cefrEquiv: "B2",
    question: "The football final had to be ______ due to torrential rain and stormy winds.",
    options: ["called off", "put off", "taken off", "given off"],
    correct: 0,
    explanationAr: "الفعل الاصطلاحي call off يعني إلغاء الحدث تماماً (cancelled)، بينما put off تعني تأجيل.",
    explanationEn: "'Call off' means to cancel an event completely due to adverse conditions.",
  },
  {
    id: "cefr_b2_3",
    category: "Grammar",
    levelTag: "B2 • Upper Intermediate",
    cefrEquiv: "B2",
    question: "The doctor advised that he ______ a full month of physical therapy.",
    options: ["undertake", "undertakes", "undertook", "is undertaking"],
    correct: 0,
    explanationAr: "صيغة الطلب الافتراضي الإنجليزي (Subjunctive Mood) بعد أفعال مثل advise / recommend تتطلب الفعل في المصدر المجرد.",
    explanationEn: "The present subjunctive mood following verbs of recommendation requires the bare base form.",
  },

  // C1 (Advanced - Cambridge Advanced CAE / IELTS 7.0-8.0 / TOEFL 95-110)
  {
    id: "cefr_c1_1",
    category: "Grammar",
    levelTag: "C1 • Advanced",
    cefrEquiv: "C1",
    question: "Scarcely ______ entered the lecture hall when the professor began his presentation.",
    options: ["had the students", "the students had", "did the students", "have the students"],
    correct: 0,
    explanationAr: "البدء بظروف النفي والحصر (Scarcely / Hardly / No sooner) يتطلب تقديم الفعل المساعد على الفاعل (Inversion) بصيغة الماضي التام.",
    explanationEn: "Negative adverbial inversion at clause onset requires auxiliary-subject inversion: 'Scarcely had + S + V3... when'.",
  },
  {
    id: "cefr_c1_2",
    category: "Grammar",
    levelTag: "C1 • Advanced",
    cefrEquiv: "C1",
    question: "If she had taken the advanced prep course last summer, she ______ fluent now.",
    options: ["would be", "would have been", "is", "will be"],
    correct: 0,
    explanationAr: "حالة شرطية مختلطة (Mixed Conditional): شرط في الماضي (had taken) ونتيجته تؤثر في الحاضر (now) فتأخذ would + infinitive.",
    explanationEn: "Mixed conditional: Past unreal condition (Had + V3) with present result ('now' -> would + infinitive).",
  },
  {
    id: "cefr_c1_3",
    category: "Reading & Context",
    levelTag: "C1 • Advanced",
    cefrEquiv: "C1",
    question: "It was only when the final results were announced ______ how well he had performed.",
    options: ["that he realized", "did he realize", "when he realized", "that did he realize"],
    correct: 0,
    explanationAr: "في الجمل المجزأة التوكيدية (Cleft Sentence) التي تبدأ بـ It was only when... يكتمل الربط بـ that متبوعة بجملة ذات ترتيب طبيعي فاعل ثم فعل.",
    explanationEn: "In focus cleft constructions ('It was only when...'), the subordinate clause is linked by 'that' with standard word order.",
  },

  // C2 (Proficiency - Cambridge CPE / IELTS 8.5-9.0 / TOEFL 115-120)
  {
    id: "cefr_c2_1",
    category: "Idioms & Mechanics",
    levelTag: "C2 • Mastery & Proficiency",
    cefrEquiv: "C2",
    question: "______ of all previous diplomatic duties, the delegate was free to represent the institution abroad.",
    options: ["Having been relieved", "Relieving", "Being relieved having", "To be relieved"],
    correct: 0,
    explanationAr: "شبه جملة اسم الفاعل المركبة للمبني للمجهول (Perfect Passive Participle Clause: Having been + p.p) تعبر عن اكتمال إعفائه قبل الحدث التالي.",
    explanationEn: "Perfect passive participle clause ('Having been relieved') expresses prior completion in the passive voice.",
  },
  {
    id: "cefr_c2_2",
    category: "Idioms & Mechanics",
    levelTag: "C2 • Mastery & Proficiency",
    cefrEquiv: "C2",
    question: "The sudden policy shift left regional markets completely ______ for weeks.",
    options: ["at sixes and sevens", "in high spirits", "on cloud nine", "down in the mouth"],
    correct: 0,
    explanationAr: "المصطلح الإنجليزي الفصيح (at sixes and sevens) يعني في حالة فوضى وارتباك شديدين (state of total confusion/disarray).",
    explanationEn: "The C2 idiom 'at sixes and sevens' denotes a state of utter confusion, disorder, and disarray.",
  },
  {
    id: "cefr_c2_3",
    category: "Vocabulary",
    levelTag: "C2 • Mastery & Proficiency",
    cefrEquiv: "C2",
    question: "Far from being a straightforward proposal, the treaty was fraught ______ unforeseen geopolitical risks.",
    options: ["with", "by", "of", "in"],
    correct: 0,
    explanationAr: "الصفة الأكاديمية fraught تأخذ حرف الجر with دائماً لتعني محفوفاً أو مشحوناً بالمخاطر (fraught with risks).",
    explanationEn: "The academic adjective 'fraught' collocates strictly with preposition 'with' meaning filled with or accompanied by perils.",
  },
];

/* =========================================================================
   2. TRACK 2: PREPARATORY STAGE (الإعدادية - NEW HELLO!)
   ========================================================================= */
const prepStageQuestions: PlacementQuestion[] = [
  // الصف الأول الإعدادي (Prep 1)
  {
    id: "prep_1_1",
    category: "Grammar",
    levelTag: "الصف الأول الإعدادي • Prep 1",
    question: "Ali always ______ his homework before having dinner.",
    options: ["does", "do", "doing", "did"],
    correct: 0,
    explanationAr: "الفاعل المفرد Ali مع ظرف التكرار always يتطلب إضافة s/es للفعل في المضارع البسيط: does.",
    explanationEn: "Singular subject 'Ali' with frequency adverb 'always' takes 'does' in present simple.",
  },
  {
    id: "prep_1_2",
    category: "Vocabulary",
    levelTag: "الصف الأول الإعدادي • Prep 1",
    question: "A ______ is someone who designs and builds machines, bridges, and software.",
    options: ["engineer", "carpenter", "dentist", "nurse"],
    correct: 0,
    explanationAr: "المهندس (engineer) هو المسؤول عن تصميم وبناء الآلات والجسور.",
    explanationEn: "An engineer designs and constructs machines and structures.",
  },
  {
    id: "prep_1_3",
    category: "Grammar",
    levelTag: "الصف الأول الإعدادي • Prep 1",
    question: "This is my sister's school bag. It belongs to ______.",
    options: ["her", "hers", "she", "herself"],
    correct: 0,
    explanationAr: "بعد حرف الجر to نستخدم ضمير المفعول به her.",
    explanationEn: "Preposition 'to' requires the object pronoun 'her'.",
  },
  {
    id: "prep_1_4",
    category: "Grammar",
    levelTag: "الصف الأول الإعدادي • Prep 1",
    question: "They ______ like watching horror films; they prefer sports documentaries.",
    options: ["don't", "doesn't", "aren't", "haven't"],
    correct: 0,
    explanationAr: "الضمير They يُنفى في المضارع البسيط للفعل العادي بـ don't + المصدر.",
    explanationEn: "Plural subject 'They' takes 'don't' + base verb in present simple negation.",
  },
  {
    id: "prep_1_5",
    category: "Reading & Context",
    levelTag: "الصف الأول الإعدادي • Prep 1",
    question: "Can I borrow your English dictionary, please? - ______.",
    options: ["Sure, here you are", "No, I am not", "You are welcome", "Never mind"],
    correct: 0,
    explanationAr: "الرد المهذب بالموافقة على طلب الاستعارة هو (Sure, here you are - بالتأكيد تفضل).",
    explanationEn: "'Sure, here you are' is the standard polite agreement to a borrowing request.",
  },

  // الصف الثاني الإعدادي (Prep 2)
  {
    id: "prep_2_1",
    category: "Grammar",
    levelTag: "الصف الثاني الإعدادي • Prep 2",
    question: "While I ______ for the school bus yesterday morning, it began to rain heavily.",
    options: ["was waiting", "waited", "am waiting", "have waited"],
    correct: 0,
    explanationAr: "قاعدة While: يأتي بعدها ماضي مستمر (was waiting) ليعبر عن حدث كان مستمراً وقطعه حدث ماضٍ بسيط.",
    explanationEn: "'While' introduces an ongoing past continuous action interrupted by past simple.",
  },
  {
    id: "prep_2_2",
    category: "Grammar",
    levelTag: "الصف الثاني الإعدادي • Prep 2",
    question: "All students ______ follow the school laboratory safety guidelines.",
    options: ["must", "can't", "aren't", "don't have"],
    correct: 0,
    explanationAr: "للتعبير عن الإلزام والضرورة القوية والقوانين الرسمية نستخدم must.",
    explanationEn: "'Must' expresses formal obligation and mandatory safety rules.",
  },
  {
    id: "prep_2_3",
    category: "Grammar",
    levelTag: "الصف الثاني الإعدادي • Prep 2",
    question: "Cairo is much ______ than Aswan in terms of overall population density.",
    options: ["more crowded", "most crowded", "crowded", "as crowded"],
    correct: 0,
    explanationAr: "الصفة الطويلة crowded في المقارنة مع than تأخذ more crowded.",
    explanationEn: "Long adjectives form comparative with 'more' + adjective + 'than'.",
  },
  {
    id: "prep_2_4",
    category: "Vocabulary",
    levelTag: "الصف الثاني الإعدادي • Prep 2",
    question: "We should recycle plastic waste to help protect our natural ______.",
    options: ["environment", "equipment", "department", "experiment"],
    correct: 0,
    explanationAr: "تدوير المخلفات يحمي البيئة الطبيعية (environment).",
    explanationEn: "Recycling plastic protects the natural environment.",
  },
  {
    id: "prep_2_5",
    category: "Grammar",
    levelTag: "الصف الثاني الإعدادي • Prep 2",
    question: "Look at those dark grey clouds! It ______ rain in a few minutes.",
    options: ["is going to", "will", "is", "was"],
    correct: 0,
    explanationAr: "التنبؤ بدليل ملموس في الحاضر (dark grey clouds) يتطلب استخدام صيغة (is going to + inf).",
    explanationEn: "Prediction based on present physical evidence requires 'be going to'.",
  },

  // الصف الثالث الإعدادي (Prep 3 - الشهادة الإعدادية)
  {
    id: "prep_3_1",
    category: "Grammar",
    levelTag: "الصف الثالث الإعدادي • الشهادة الإعدادية",
    question: "Sara has ______ submitted her English revision project ahead of deadline.",
    options: ["already", "yet", "since", "ever"],
    correct: 0,
    explanationAr: "كلمة already تأتي في الجملة المثبتة للمضارع التام بين have/has والتصريف الثالث لتأكيد إتمام الفعل مبكراً.",
    explanationEn: "'Already' confirms completion in affirmative present perfect statements.",
  },
  {
    id: "prep_3_2",
    category: "Grammar",
    levelTag: "الصف الثالث الإعدادي • الشهادة الإعدادية",
    question: "______ Omar nor his brother managed to solve the challenging puzzle.",
    options: ["Neither", "Either", "Both", "None"],
    correct: 0,
    explanationAr: "الرابط المزدوج الذي يتكامل مع nor لنفي الطرفين معاً هو Neither (Neither... nor).",
    explanationEn: "Correlative negative conjunction 'Neither' pairs with 'nor'.",
  },
  {
    id: "prep_3_3",
    category: "Grammar",
    levelTag: "الصف الثالث الإعدادي • الشهادة الإعدادية",
    question: "The ancient temples in Luxor ______ visited by thousands of global tourists each year.",
    options: ["are", "were", "have", "being"],
    correct: 0,
    explanationAr: "المبني للمجهول في المضارع البسيط للجمع: are + p.p (are visited) للتعبير عن حقيقة متكررة سنوياً.",
    explanationEn: "Present simple passive for plural subjects: are + past participle.",
  },
  {
    id: "prep_3_4",
    category: "Grammar",
    levelTag: "الصف الثالث الإعدادي • الشهادة الإعدادية",
    question: "My grandfather ______ walk five kilometers every morning when he lived in the countryside.",
    options: ["used to", "is used to", "use to", "uses to"],
    correct: 0,
    explanationAr: "للتعبير عن عادة منتظمة كانت تحدث في الماضي وانتهت الآن نستخدم used to + المصدر.",
    explanationEn: "'Used to + infinitive' denotes past discontinued habitual actions.",
  },
  {
    id: "prep_3_5",
    category: "Reading & Context",
    levelTag: "الصف الثالث الإعدادي • الشهادة الإعدادية",
    question: "Always remember to ______ all electronic appliances before leaving your home for travel.",
    options: ["turn off", "turn into", "turn on", "turn up"],
    correct: 0,
    explanationAr: "الفعل الاصطلاحي turn off يعني إطفاء وفصل الأجهزة الكهربائية للأمان.",
    explanationEn: "Phrasal verb 'turn off' means to deactivate or shut down electrical devices.",
  },
];

/* =========================================================================
   3. TRACK 3: SECONDARY STAGE & THANAWYA AMMA (الثانوية العامة)
   ========================================================================= */
const secondaryStageQuestions: PlacementQuestion[] = [
  // الصف الأول الثانوي (Sec 1)
  {
    id: "sec_1_1",
    category: "Grammar",
    levelTag: "الصف الأول الثانوي • Sec 1",
    question: "By the time the civil defense team arrived, the volunteers ______ the fire completely.",
    options: ["had already extinguished", "already extinguished", "have extinguished", "were extinguishing"],
    correct: 0,
    explanationAr: "قاعدة By the time + ماضي بسيط، الحدث الأسبق في الحدوث يكون ماضياً تاماً (had + p.p).",
    explanationEn: "By the time + past simple clause is complemented by past perfect for the prior action.",
  },
  {
    id: "sec_1_2",
    category: "Grammar",
    levelTag: "الصف الأول الثانوي • Sec 1",
    question: "Mount Everest is ______ highest mountain peak on Earth.",
    options: ["the", "a", "an", "no article"],
    correct: 0,
    explanationAr: "صيغ التفضيل العليا (Superlative) للصفات مثل highest تأخذ دائماً أداة التعريف the.",
    explanationEn: "Superlative adjectives require the definite article 'the'.",
  },
  {
    id: "sec_1_3",
    category: "Grammar",
    levelTag: "الصف الأول الثانوي • Sec 1",
    question: "Only a ______ students were able to decipher the final riddle in the competition.",
    options: ["few", "little", "much", "lot"],
    correct: 0,
    explanationAr: "الاسم الجمع المعدود (students) يأخذ a few ليدل على عدد قليل كافٍ، بينما little للكميات غير المعدودة.",
    explanationEn: "Countable plural nouns take 'a few'; 'little' is for uncountable nouns.",
  },
  {
    id: "sec_1_4",
    category: "Grammar",
    levelTag: "الصف الأول الثانوي • Sec 1",
    question: "Amr fractured his leg yesterday, so he ______ be participating in the championship today.",
    options: ["can't", "must", "might", "should"],
    correct: 0,
    explanationAr: "الاستنتاج المؤكد المنفي المبني على دليل قطعي (كسر ساقه) يتطلب can't be (مستحيل أن يشارك).",
    explanationEn: "Negative logical deduction based on certain evidence requires modal 'can't'.",
  },
  {
    id: "sec_1_5",
    category: "Vocabulary",
    levelTag: "الصف الأول الثانوي • Sec 1",
    question: "The state launches comprehensive infrastructure projects to enhance public ______.",
    options: ["welfare", "farewell", "warfare", "hardware"],
    correct: 0,
    explanationAr: "كلمة welfare تعني الرفاهية والصالح العام للمواطنين، بينما farewell تعني وداع، وwarfare حرب.",
    explanationEn: "'Welfare' denotes health, happiness, and prosperity of community members.",
  },

  // الصف الثاني الثانوي (Sec 2)
  {
    id: "sec_2_1",
    category: "Grammar",
    levelTag: "الصف الثاني الثانوي • Sec 2",
    question: "I did not configure the server myself; I ______ by a certified network engineer.",
    options: ["had it configured", "configured it", "had configured it", "have it configure"],
    correct: 0,
    explanationAr: "صيغة السببية للمبني للمجهول (Causative Passive: have/had + object + p.p) تعبر عن تكليف شخص آخر بإنجاز العمل.",
    explanationEn: "Causative passive structure: had + something + past participle.",
  },
  {
    id: "sec_2_2",
    category: "Grammar",
    levelTag: "الصف الثاني الثانوي • Sec 2",
    question: "I distinctly remember ______ the main vault before leaving the bank; I am 100% sure.",
    options: ["locking", "to lock", "lock", "having lock"],
    correct: 0,
    explanationAr: "الفعل remember متبوعاً بـ gerund (-ing) يعني تذكر حدث تم بالفعل في الماضي، أما متبوعاً بـ to + inf فيعني تذكر أن يفعل شيئاً.",
    explanationEn: "'Remember + gerund' refers to recalling an action that has already taken place.",
  },
  {
    id: "sec_2_3",
    category: "Grammar",
    levelTag: "الصف الثاني الثانوي • Sec 2",
    question: "If I had revised the curriculum thoroughly last week, I ______ so anxious right now.",
    options: ["wouldn't be", "wouldn't have been", "am not", "won't be"],
    correct: 0,
    explanationAr: "الحالة الشرطية المختلطة: شرط ماضٍ (had revised) وأثره الحاضر (right now) يأخذ wouldn't be.",
    explanationEn: "Mixed conditional: Past condition linked to present consequence ('right now' -> wouldn't be).",
  },
  {
    id: "sec_2_4",
    category: "Reading & Context",
    levelTag: "الصف الثاني الثانوي • Sec 2",
    question: "Despite severe financial constraints, the startup managed to ______ and achieve profitability.",
    options: ["pull through", "pull out", "pull up", "pull over"],
    correct: 0,
    explanationAr: "الفعل الاصطلاحي pull through يعني النجاة والتعافي من أزمة أو صعوبة بالغة.",
    explanationEn: "'Pull through' means to survive a dangerous or difficult circumstance successfully.",
  },
  {
    id: "sec_2_5",
    category: "Grammar",
    levelTag: "الصف الثاني الثانوي • Sec 2",
    question: "The new high-speed electric railway is reported ______ travel duration by forty percent.",
    options: ["to have reduced", "to reduce having", "reducing", "having reduced"],
    correct: 0,
    explanationAr: "في صيغ التقرير للمبني للمجهول (Passive Reporting): is reported to have + p.p عند الإشارة إلى إنجاز تم في الواقع.",
    explanationEn: "Passive reporting infinitive construction referring to prior completed achievement: to have + past participle.",
  },

  // الصف الثالث الثانوي (Sec 3 - الثانوية العامة)
  {
    id: "sec_3_1",
    category: "Grammar",
    levelTag: "الصف الثالث الثانوي • ثانوية عامة",
    question: "No sooner ______ entered the exam hall than the proctor distributed the test booklets.",
    options: ["had the students", "the students had", "did the students", "have the students"],
    correct: 0,
    explanationAr: "قاعدة No sooner في أول الجملة تتطلب صيغة تقديم (Inversion): No sooner had + Subject + p.p... than.",
    explanationEn: "'No sooner' at sentence beginning triggers auxiliary-first inversion: No sooner had + S + V3.",
  },
  {
    id: "sec_3_2",
    category: "Idioms & Mechanics",
    levelTag: "الصف الثالث الثانوي • ثانوية عامة",
    question: "Which of the following sentences exhibits completely flawless punctuation for Thanawya Amma?",
    options: [
      "Although he studied with immense dedication, he couldn't solve the final problem.",
      "Although he studied with immense dedication; he couldn't solve the final problem.",
      "Although he studied with immense dedication he couldn't solve the final problem.",
      "Although, he studied with immense dedication, he couldn't solve the final problem.",
    ],
    correct: 0,
    explanationAr: "الجملة التي تبدأ بظرف رابط (Although) تتطلب فاصلة وحيدة (comma) تفصل بين شبه الجملة التابعة والجملة الرئيسية فقط.",
    explanationEn: "A dependent introductory adverb clause starting with 'Although' requires a comma after the clause.",
  },
  {
    id: "sec_3_3",
    category: "Grammar",
    levelTag: "الصف الثالث الثانوي • ثانوية عامة",
    question: "______ by the teacher's inspiring speech, the student tackled the comprehension text with great enthusiasm.",
    options: ["Inspired", "Inspiring", "Having inspired", "To inspire"],
    correct: 0,
    explanationAr: "شبه جملة اسم المفعول المختصرة للمبني للمجهول (Past Participle Clause: Inspired) تعبر عن كونه ملهَماً ومتحمساً بواسطة الخطاب.",
    explanationEn: "Past participle clause ('Inspired') functions as a concise passive modifier replacing 'Because he was inspired'.",
  },
  {
    id: "sec_3_4",
    category: "Idioms & Mechanics",
    levelTag: "الصف الثالث الثانوي • ثانوية عامة",
    question: "To achieve a score of 50/50 in the English exam, you must ______ and stay focused throughout the year.",
    options: [
      "keep your nose to the grindstone",
      "let the cat out of the bag",
      "cry over spilled milk",
      "beat around the bush",
    ],
    correct: 0,
    explanationAr: "المصطلح الفصيح (keep your nose to the grindstone) يعني العمل والاجتهاد الدؤوب والمستمر بدون تهاون.",
    explanationEn: "'Keep your nose to the grindstone' is an authentic idiom meaning to work hard and steadily without distraction.",
  },
  {
    id: "sec_3_5",
    category: "Grammar",
    levelTag: "الصف الثالث الثانوي • ثانوية عامة",
    question: "Should any student ______ further guidance, Mr. Habib El Rahman will host a live revision session.",
    options: ["require", "requires", "required", "will require"],
    correct: 0,
    explanationAr: "حذف If واستبدالها بـ Should في الحالة الشرطية الأولى يتبعه الفاعل ثم الفعل في المصدر المجرد دائماً (require).",
    explanationEn: "Inverted first conditional with 'Should' takes subject + bare infinitive regardless of person.",
  },
];

/* =========================================================================
   TRACKS CATALOG
   ========================================================================= */
const testTracks: TrackDefinition[] = [
  {
    id: "cefr_global",
    titleAr: "الاختبار الدولي الشامل (CEFR: A1 → C2)",
    titleEn: "CEFR Global Placement Test (A1 to C2)",
    subtitleAr: "محاكاة معتمدة لاختبارات Cambridge و IELTS و TOEFL",
    subtitleEn: "Standardized Cambridge, IELTS & TOEFL Proficiency Assessment",
    icon: Globe,
    badge: "A1 - C2 International",
    durationMinutes: 20,
    standardsBadge: "Cambridge • IELTS 9.0 • TOEFL iBT",
    descriptionAr: "يقيس مستواك وفق الإطار الأوروبي المشترك للغات (CEFR) من المبتدئ A1 حتى الإتقان الكامل C2، مع درجات مكافئة في الآيلتس والتوفل ومقياس كامبريدج.",
    descriptionEn: "Evaluates your English competency across all 6 CEFR bands from A1 to C2 with precise IELTS band and TOEFL iBT equivalencies.",
    questions: cefrGlobalQuestions,
  },
  {
    id: "secondary_stage",
    titleAr: "تحديد مستوى المرحلة الثانوية والثانوية العامة",
    titleEn: "Secondary Stage & Thanawya Amma Diagnostic",
    subtitleAr: "الصفوف الأول والثاني والثالث الثانوي (تالتة ثانوي)",
    subtitleEn: "1st, 2nd & 3rd Secondary (Thanawya Amma Mastery)",
    icon: GraduationCap,
    badge: "Sec 1 • Sec 2 • Sec 3 (50/50)",
    durationMinutes: 18,
    standardsBadge: "منهج الوزارة • أسئلة المهارات والترجمة",
    descriptionAr: "اختبار تخصصي يقيس جاهزيتك لامتحان الثانوية العامة النهائي وقواعد الصفوف 1 و 2 و 3 ثانوي، مع كشف نقاط القوة وخطة علاجية للوصول للدرجة النهائية 50/50.",
    descriptionEn: "Specialized diagnostic evaluating grammar, translation, and writing mechanics for high school and Thanawya Amma candidates.",
    questions: secondaryStageQuestions,
  },
  {
    id: "prep_stage",
    titleAr: "تحديد مستوى المرحلة الإعدادية",
    titleEn: "Preparatory Stage Placement Test",
    subtitleAr: "الصفوف الأول والثاني والثالث الإعدادي (New Hello!)",
    subtitleEn: "1st, 2nd & 3rd Preparatory (New Hello Curriculum)",
    icon: School,
    badge: "Prep 1 • Prep 2 • Prep 3",
    durationMinutes: 15,
    standardsBadge: "الشهادة الإعدادية • التأسيس الشامل",
    descriptionAr: "اختبار تشخيصي متدرج يقيم مهارات الطالب في منهج المرحلة الإعدادية ويحدد بدقة الصف المناسب ومدى الجاهزية للشهادة الإعدادية والتأسيس للثانوي.",
    descriptionEn: "Tailored preparatory assessment evaluating core grammar, vocabulary, and dialogue comprehension for Prep 1, Prep 2, and Prep 3.",
    questions: prepStageQuestions,
  },
];

/* =========================================================================
   COMPONENT LOGIC
   ========================================================================= */
export const AdaptivePlacementTest: React.FC<{ onComplete?: (level: string) => void }> = ({ onComplete }) => {
  const { lang, user } = useApp();

  // Test State
  const [selectedTrackId, setSelectedTrackId] = useState<TestTrackId>("cefr_global");
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "wrong">("all");

  // Timer State
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20 * 60);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Active track helper
  const activeTrack = useMemo(() => {
    return testTracks.find((t) => t.id === selectedTrackId) || testTracks[0];
  }, [selectedTrackId]);

  const currentQuestions = activeTrack.questions;
  const currentQ = currentQuestions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (!isTestActive || isFinished || !timerEnabled) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishTest(userAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTestActive, isFinished, timerEnabled, userAnswers]);

  // Keyboard navigation (1, 2, 3, 4)
  useEffect(() => {
    if (!isTestActive || isFinished) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (currentQ && idx < currentQ.options.length) {
          setSelectedOption(idx);
        }
      } else if (e.key === "Enter" && selectedOption !== null) {
        handleNextQuestion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTestActive, isFinished, selectedOption, currentQ]);

  // Audio text-to-speech
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/______/g, "blank");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-GB";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Start selected track
  const startTrack = (trackId: TestTrackId) => {
    setSelectedTrackId(trackId);
    const track = testTracks.find((t) => t.id === trackId) || testTracks[0];
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setIsFinished(false);
    setSecondsRemaining(track.durationMinutes * 60);
    setIsTestActive(true);
  };

  // Handle Next
  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    const nextAnswers = [...userAnswers, selectedOption];
    setUserAnswers(nextAnswers);

    if (currentIndex + 1 < currentQuestions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      finishTest(nextAnswers);
    }
  };

  // Finish Test & Calculate Diagnostics
  const finishTest = (finalAnswers: number[]) => {
    setIsFinished(true);
    setIsTestActive(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Computed Evaluation Results
  const evaluation = useMemo(() => {
    let correctCount = 0;
    const details = currentQuestions.map((q, idx) => {
      const studentAns = userAnswers[idx];
      const isCorrect = studentAns === q.correct;
      if (isCorrect) correctCount++;
      return {
        question: q,
        studentAnswer: studentAns,
        isCorrect,
      };
    });

    const total = currentQuestions.length;
    const scorePercent = Math.round((correctCount / (total || 1)) * 100);

    // Diagnostics specific to track
    if (selectedTrackId === "cefr_global") {
      let cefr = "A1";
      let cambridgeScale = 90;
      let ieltsBand = "3.0";
      let toeflIbt = "30";
      let descriptionAr = "مستوى تمهيدي - يمكنك فهم واستخدام التعبيرات اليومية البسيطة جداً.";
      let descriptionEn = "Basic user - can understand and use very simple everyday expressions.";
      let badgeColor = "from-slate-500 to-slate-700";

      if (correctCount >= 17) {
        cefr = "C2";
        cambridgeScale = 220;
        ieltsBand = "8.5 - 9.0";
        toeflIbt = "115 - 120";
        descriptionAr = "مستوى الإتقان التام والطلاقة الأكاديمية (Mastery) - فهم متعمق وقدرة فائقة على الصياغة الاحترافية.";
        descriptionEn = "Proficiency Mastery - full operational command and subtle academic expression.";
        badgeColor = "from-amber-400 via-amber-500 to-yellow-600";
      } else if (correctCount >= 14) {
        cefr = "C1";
        cambridgeScale = 195;
        ieltsBand = "7.5 - 8.0";
        toeflIbt = "102 - 114";
        descriptionAr = "مستوى متقدم (Effective Operational Proficiency) - قدرة ممتازة على التعبير اللغوي المعقد والتراكيب المتقدمة.";
        descriptionEn = "Advanced - fluent, spontaneous expression across demanding academic topics.";
        badgeColor = "from-purple-600 via-indigo-600 to-sky-600";
      } else if (correctCount >= 11) {
        cefr = "B2";
        cambridgeScale = 175;
        ieltsBand = "6.0 - 6.5";
        toeflIbt = "80 - 95";
        descriptionAr = "فوق المتوسط (Vantage / Independent) - تفهم الأفكار المعقدة في النصوص المجردة، ومؤهل لتفوق الثانوية العامة.";
        descriptionEn = "Upper Intermediate - independent user capable of technical discussions.";
        badgeColor = "from-sky-500 to-blue-600";
      } else if (correctCount >= 7) {
        cefr = "B1";
        cambridgeScale = 150;
        ieltsBand = "4.5 - 5.5";
        toeflIbt = "50 - 75";
        descriptionAr = "متوسط (Threshold) - يمكنك التعامل مع معظم المواقف المدرسية واللغوية بوضوح.";
        descriptionEn = "Intermediate - threshold level handling standard routine communication.";
        badgeColor = "from-emerald-500 to-teal-600";
      } else if (correctCount >= 4) {
        cefr = "A2";
        cambridgeScale = 125;
        ieltsBand = "3.5 - 4.0";
        toeflIbt = "35 - 48";
        descriptionAr = "مبتدئ متقدم (Waystage) - تفهم الجمل المباشرة وتحتاج لتكثيف القواعد والتراكيب.";
        descriptionEn = "Elementary - understands basic sentences and direct routine information.";
        badgeColor = "from-blue-400 to-indigo-500";
      }

      return {
        track: "cefr_global",
        correctCount,
        total,
        scorePercent,
        cefr,
        cambridgeScale,
        ieltsBand,
        toeflIbt,
        descriptionAr,
        descriptionEn,
        badgeColor,
        recommendations: [
          cefr === "C1" || cefr === "C2"
            ? "كورس تالتة ثانوي النخبة (Thanawya Amma Elite Masterclass)"
            : cefr === "B2"
            ? "كورس الثانوية العامة الشامل + ورش الترجمة وبنك الأسئلة"
            : cefr === "B1"
            ? "كورس أولى وثانية ثانوي للتأسيس وإتقان القواعد (Grammar Launchpad)"
            : "كورس التأسيس الشامل للإنجليزية (Fundamental Skills & Vocabulary)",
          "مراجعة بنك الأسئلة التفاعلي في Professional Academy",
        ],
        details,
      };
    } else if (selectedTrackId === "prep_stage") {
      let gradeRecommendation = "الصف الأول الإعدادي (Prep 1)";
      let gradeBadge = "تأسيس إعدادي عام";
      let summaryAr = "تحتاج إلى بدء التأسيس مع منهج الصف الأول الإعدادي لضبط الأزمنة والضمائر وحفظ المفردات.";
      let summaryEn = "Focus on Prep 1 fundamentals including basic tenses and pronouns.";

      if (correctCount >= 13) {
        gradeRecommendation = "مؤهل للامتياز في الشهادة الإعدادية (Prep 3 High Honor)";
        gradeBadge = "شهادة إعدادية متفوقة";
        summaryAr = "مستواك رائع وجاهز لحصد الدرجات النهائية في الشهادة الإعدادية والانطلاق للثانوية العامة بتفوق.";
        summaryEn = "Excellent mastery of preparatory curriculum, ready for Thanawya Amma transition.";
      } else if (correctCount >= 9) {
        gradeRecommendation = "الصف الثالث الإعدادي (Prep 3)";
        gradeBadge = "تالتة إعدادي";
        summaryAr = "مستواك مناسب للصف الثالث الإعدادي مع حاجة للتدريب على المبني للمجهول وقواعد since و for.";
        summaryEn = "Good command of Prep 2 with readiness for Prep 3 passive voice and tenses.";
      } else if (correctCount >= 5) {
        gradeRecommendation = "الصف الثاني الإعدادي (Prep 2)";
        gradeBadge = "تانية إعدادي";
        summaryAr = "قواعدك جيدة في الأساسيات، ومناسب للبدء في كورس الصف الثاني الإعدادي.";
        summaryEn = "Solid basics, ready for Prep 2 comparative and continuous tenses.";
      }

      return {
        track: "prep_stage",
        correctCount,
        total,
        scorePercent,
        gradeRecommendation,
        gradeBadge,
        descriptionAr: summaryAr,
        descriptionEn: summaryEn,
        badgeColor: "from-purple-600 to-sky-600",
        recommendations: [
          `كورس ${gradeRecommendation} الرسمي على منصة مستر حبيب الرحمن`,
          "حل نماذج امتحانات الإعدادية التفاعلية في بنك الأسئلة",
        ],
        details,
      };
    } else {
      // Secondary Stage
      let thanawyaStatus = "يحتاج تأسيس شامل في القواعد والترجمة";
      let targetScore = "30 - 38 / 50";
      let secGrade = "أولى ثانوي (Sec 1)";

      if (correctCount >= 13) {
        thanawyaStatus = "جاهز تماماً لحصد 50/50 في الثانوية العامة (Thanawya Amma 50/50 Ready)";
        targetScore = "48 - 50 / 50";
        secGrade = "تالتة ثانوي النخبة (Sec 3)";
      } else if (correctCount >= 10) {
        thanawyaStatus = "مؤهل للتفوق في الثانوية العامة مع التركيز على مهارات المقال والـ Inversion";
        targetScore = "42 - 47 / 50";
        secGrade = "ثانية وثالثة ثانوي (Sec 2 & Sec 3)";
      } else if (correctCount >= 6) {
        thanawyaStatus = "مستوى متوسط في الثانوي، ينصح بحضور كورس القواعد المتقدمة والترجمة";
        targetScore = "35 - 42 / 50";
        secGrade = "أولى وثانية ثانوي (Sec 1 & Sec 2)";
      }

      return {
        track: "secondary_stage",
        correctCount,
        total,
        scorePercent,
        thanawyaStatus,
        targetScore,
        secGrade,
        descriptionAr: `تقييم الجاهزية: ${thanawyaStatus}، والدرجة المتوقعة في امتحان الثانوية العامة ${targetScore}.`,
        descriptionEn: `Secondary readiness score: ${thanawyaStatus} with estimated score range ${targetScore}.`,
        badgeColor: "from-amber-500 via-orange-500 to-purple-700",
        recommendations: [
          "كورس الصف الثالث الثانوي للثانوية العامة 2026/2027 (Mastery Series)",
          "بنك أسئلة الوزارة ونماذج الامتحانات التجريبية التفاعلية",
          "ورشة حل قطاع الترجمة وفنيات الترقيم والمقال (Writing Mechanics)",
        ],
        details,
      };
    }
  }, [currentQuestions, userAnswers, selectedTrackId]);

  // Notify parent on completion
  useEffect(() => {
    if (isFinished && onComplete) {
      if (evaluation.track === "cefr_global" && "cefr" in evaluation && typeof evaluation.cefr === "string") {
        onComplete(evaluation.cefr);
      } else if (evaluation.track === "prep_stage" && "gradeRecommendation" in evaluation && typeof evaluation.gradeRecommendation === "string") {
        onComplete(evaluation.gradeRecommendation);
      } else if (evaluation.track === "secondary_stage" && "thanawyaStatus" in evaluation && typeof evaluation.thanawyaStatus === "string") {
        onComplete(evaluation.thanawyaStatus);
      }
    }
  }, [isFinished, evaluation, onComplete]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  /* =========================================================================
     VIEW A: TRACK SELECTOR HUB
     ========================================================================= */
  if (!isTestActive && !isFinished) {
    return (
      <div className="max-w-5xl mx-auto my-8 px-4 sm:px-6">
        {/* HERO TITLE */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 text-purple-300 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{lang === "ar" ? "منظومة تقييم المستوى التفاعلية الشاملة" : "Interactive Placement Testing Suite"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === "ar" ? "اختر اختبار تحديد المستوى المناسب لك" : "Choose Your Placement Assessment Track"}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
            {lang === "ar"
              ? "ثلاثة اختبارات مستقلة ومصممة وفق أعلى المعايير الأكاديمية: من معايير كامبريدج والآيلتس والتوفل العالمية (A1 إلى C2)، وحتى الامتحانات التشخيصية لمناهج الإعدادية والثانوية العامة."
              : "Three independent placement tracks: Standardized CEFR Global (A1 to C2) aligned with Cambridge, IELTS & TOEFL, plus dedicated Egyptian Preparatory and Secondary curriculum diagnostics."}
          </p>
        </div>

        {/* 3 TRACK CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testTracks.map((track) => {
            const Icon = track.icon;
            const isSelected = selectedTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrackId(track.id)}
                className={`group relative rounded-3xl p-6 sm:p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-b from-[#1c1038] to-[#120a26] border-purple-400 shadow-[0_15px_40px_rgba(124,58,237,0.3)] ring-2 ring-purple-400/50"
                    : "bg-white dark:bg-[#120924] border-slate-200 dark:border-purple-950/60 hover:border-purple-500/40 hover:shadow-xl"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300">
                      {track.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-sky-300 transition-colors">
                    {lang === "ar" ? track.titleAr : track.titleEn}
                  </h3>
                  <p className="text-xs font-bold text-amber-500 dark:text-amber-300/90 mt-1">
                    {lang === "ar" ? track.subtitleAr : track.subtitleEn}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-purple-200/70 mt-3 leading-relaxed">
                    {lang === "ar" ? track.descriptionAr : track.descriptionEn}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-purple-900/40">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-purple-200/60 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-sky-400" />
                      {track.durationMinutes} {lang === "ar" ? "دقيقة" : "mins"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      {track.questions.length} {lang === "ar" ? "سؤالاً" : "questions"}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startTrack(track.id);
                    }}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white shadow-lg shadow-purple-900/50 hover:brightness-110"
                        : "bg-slate-100 dark:bg-purple-950/40 text-slate-700 dark:text-purple-200 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    <span>{lang === "ar" ? "ابدأ هذا الاختبار الآن" : "Start This Assessment"}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* STANDARDS FOOTER BANNER */}
        <div className="mt-10 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 via-[#130b2c] to-sky-900/20 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-xs font-black text-white">
                {lang === "ar" ? "معايير دولية ومحلية معتمدة 100%" : "100% Certified CEFR & Curriculum Alignment"}
              </p>
              <p className="text-[11px] text-purple-200/70">
                {lang === "ar"
                  ? "معادلة فورية لمقياس كامبريدج، وباند الآيلتس (IELTS)، وتوفل (TOEFL iBT)، ومواصفات الورقة الامتحانية للثانوية العامة."
                  : "Instant conversion to Cambridge Scale, IELTS Band, TOEFL iBT, and Egyptian Ministry specifications."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Professional Academy • Mr. Habib El Rahman</span>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW B: ACTIVE QUESTION PLAYER
     ========================================================================= */
  if (isTestActive && !isFinished) {
    const progressPercent = Math.round(((currentIndex + 1) / currentQuestions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto my-8 px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-purple-950/70 bg-white dark:bg-[#120a26] p-6 sm:p-9 shadow-2xl">
          {/* PLAYER TOP HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-purple-900/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300">
                  {lang === "ar" ? activeTrack.titleAr : activeTrack.titleEn}
                </span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300">
                  {currentQ.levelTag}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-500 dark:text-purple-200/70 mt-2">
                {lang === "ar"
                  ? `السؤال ${currentIndex + 1} من ${currentQuestions.length}`
                  : `Question ${currentIndex + 1} of ${currentQuestions.length}`}
              </h2>
            </div>

            {/* TIMER & AUDIO */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => speakText(currentQ.question)}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isSpeaking
                    ? "bg-purple-600 text-white border-purple-400 animate-pulse"
                    : "bg-slate-100 dark:bg-purple-950/50 border-purple-400/20 text-purple-300 hover:bg-purple-600 hover:text-white"
                }`}
                title={lang === "ar" ? "استمع للنطق الإنجليزي السليم" : "Listen to British/American English pronunciation"}
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {timerEnabled && (
                <div
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border font-mono text-xs font-black ${
                    secondsRemaining < 120
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-400 animate-pulse"
                      : "border-sky-400/30 bg-sky-500/10 text-sky-300"
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span>{formatTime(secondsRemaining)}</span>
                </div>
              )}
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-6 mb-8">
            <div className="flex justify-between text-xs font-extrabold text-slate-400 dark:text-purple-300/70 mb-2">
              <span>{lang === "ar" ? "نسبة الإنجاز" : "Progress"}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-purple-950/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-purple-400/10">
              <div
                className="bg-gradient-to-r from-purple-600 via-sky-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-sky-500/40"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* QUESTION BOX */}
          <div className="mb-8 rounded-2xl border border-purple-400/20 bg-gradient-to-r from-purple-900/15 via-[#160c30] to-transparent p-5 sm:p-6">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 mb-2">
              <span className="uppercase tracking-wider">{currentQ.category}</span>
              <span className="text-purple-300/80">{lang === "ar" ? "اختر الإجابة الصحيحة:" : "Select the best answer:"}</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed text-left" dir="ltr">
              {currentQ.question}
            </p>
          </div>

          {/* OPTIONS LIST */}
          <div className="space-y-3 mb-8" dir="ltr">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl font-bold text-sm sm:text-base transition-all border flex items-center justify-between group ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-sky-600/20 border-purple-400 text-white shadow-lg shadow-purple-950/50"
                      : "bg-slate-50 dark:bg-[#160d2e]/80 border-slate-200 dark:border-purple-950/70 text-slate-700 dark:text-purple-100/90 hover:border-purple-500/50 hover:bg-purple-900/20"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                          : "bg-slate-200 dark:bg-purple-950/60 text-slate-700 dark:text-purple-300 group-hover:bg-purple-600 group-hover:text-white"
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span>{opt}</span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-sky-400 bg-sky-400 text-slate-950"
                        : "border-slate-400 dark:border-purple-400/40"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-purple-900/40">
            <button
              onClick={() => {
                if (window.confirm(lang === "ar" ? "هل ترغب في مغادرة الاختبار والعودة لاختيار مسار آخر؟" : "Leave test and return to track selection?")) {
                  setIsTestActive(false);
                }
              }}
              className="text-xs font-extrabold text-slate-400 dark:text-purple-300/60 hover:text-rose-400 transition-colors"
            >
              {lang === "ar" ? "إلغاء الاختبار" : "Cancel Assessment"}
            </button>

            <button
              disabled={selectedOption === null}
              onClick={handleNextQuestion}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:brightness-110 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-950/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>
                {currentIndex + 1 === currentQuestions.length
                  ? lang === "ar"
                    ? "تسليم الاختبار واستخراج النتيجة"
                    : "Submit & Generate Report"
                  : lang === "ar"
                  ? "السؤال التالي"
                  : "Next Question"}
              </span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW C: DIAGNOSTIC RESULTS REPORT & SCORECARD
     ========================================================================= */
  const filteredDetails = evaluation.details.filter((item) => {
    if (reviewFilter === "correct") return item.isCorrect;
    if (reviewFilter === "wrong") return !item.isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6">
      {/* RESULT HERO CARD */}
      <div className="rounded-[2.5rem] border border-purple-400/30 bg-gradient-to-b from-[#180e36] via-[#100724] to-[#0a0518] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Halos */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-sky-500/25 blur-3xl" />

        <div className="relative text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-600 mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/30 mb-5 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <span className="text-xs font-black uppercase tracking-wider text-sky-300 px-3.5 py-1 rounded-full border border-sky-400/30 bg-sky-500/10">
            {lang === "ar" ? "تقرير التقييم التشخيصي الشامل" : "Official Diagnostic Report"}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
            {lang === "ar" ? "تم تحديد مستواك الأكاديمي بنجاح!" : "Assessment Completed Successfully!"}
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl mx-auto mt-2 leading-relaxed">
            {lang === "ar"
              ? "تحليل شامل لمهارات القواعد، والمفردات، والتراكيب المتقدمة بإشراف مستر حبيب الرحمن."
              : "Comprehensive breakdown of grammar, vocabulary, and advanced syntax by Mr. Habib El Rahman."}
          </p>

          {/* CEFR OR STAGE SCORECARD GRID */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-start">
            {/* Primary Level Badge */}
            <div className="sm:col-span-2 rounded-2xl border border-purple-400/30 bg-[#160c30]/90 p-5 backdrop-blur">
              <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider">
                {selectedTrackId === "cefr_global"
                  ? lang === "ar"
                    ? "المستوى المحدد (CEFR Standard)"
                    : "Determined CEFR Level"
                  : selectedTrackId === "prep_stage"
                  ? lang === "ar"
                    ? "المرحلة والصف الموصى به"
                    : "Recommended Stage"
                  : lang === "ar"
                  ? "جاهزية الثانوية العامة"
                  : "Thanawya Amma Readiness"}
              </span>

              <div className="mt-2 flex items-center gap-3">
                <div className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${evaluation.badgeColor} text-white font-black text-2xl sm:text-3xl shadow-lg`}>
                  {"cefr" in evaluation ? evaluation.cefr : "gradeBadge" in evaluation ? evaluation.gradeBadge : "secGrade" in evaluation ? evaluation.secGrade : "Level"}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">
                    {"gradeRecommendation" in evaluation
                      ? evaluation.gradeRecommendation
                      : "thanawyaStatus" in evaluation
                      ? evaluation.thanawyaStatus
                      : `CEFR Level ${"cefr" in evaluation ? evaluation.cefr : ""}`}
                  </p>
                  <p className="text-xs text-amber-300 font-bold mt-0.5">
                    {evaluation.correctCount} / {evaluation.total} {lang === "ar" ? "إجابة صحيحة" : "Correct"} ({evaluation.scorePercent}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Standard Equivalents */}
            {selectedTrackId === "cefr_global" && "cambridgeScale" in evaluation && (
              <>
                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-5">
                  <span className="text-[11px] font-black text-sky-300 uppercase">Cambridge English Scale</span>
                  <p className="mt-1 text-2xl font-black text-white">{evaluation.cambridgeScale} <span className="text-xs text-sky-300 font-semibold">/ 230</span></p>
                  <p className="text-[11px] text-sky-200/80 mt-1">Key • Preliminary • First • Advanced</p>
                </div>

                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
                  <span className="text-[11px] font-black text-amber-300 uppercase">IELTS / TOEFL iBT</span>
                  <p className="mt-1 text-2xl font-black text-white">Band {evaluation.ieltsBand}</p>
                  <p className="text-[11px] text-amber-200/80 mt-1">TOEFL Score: {evaluation.toeflIbt} / 120</p>
                </div>
              </>
            )}

            {selectedTrackId !== "cefr_global" && (
              <>
                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-5">
                  <span className="text-[11px] font-black text-sky-300 uppercase">{lang === "ar" ? "دقة القواعد والمفردات" : "Accuracy"}</span>
                  <p className="mt-1 text-2xl font-black text-white">{evaluation.scorePercent}%</p>
                  <p className="text-[11px] text-sky-200/80 mt-1">{lang === "ar" ? "معدل إتقان الأسئلة" : "Mastery Rate"}</p>
                </div>

                <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
                  <span className="text-[11px] font-black text-amber-300 uppercase">{lang === "ar" ? "الهدف القادم" : "Next Milestone"}</span>
                  <p className="mt-1 text-lg font-black text-white">
                    {"targetScore" in evaluation ? evaluation.targetScore : "100% الدرجة النهائية"}
                  </p>
                  <p className="text-[11px] text-amber-200/80 mt-1">{lang === "ar" ? "الشهادة الرسمية" : "Final Exam Target"}</p>
                </div>
              </>
            )}
          </div>

          {/* DESCRIPTION BOX */}
          <div className="mt-5 rounded-2xl border border-purple-500/20 bg-[#160c30]/60 p-4 text-start">
            <p className="text-xs font-bold text-purple-200/90 leading-relaxed">
              {lang === "ar" ? evaluation.descriptionAr : evaluation.descriptionEn}
            </p>
          </div>
        </div>
      </div>

      {/* RECOMMENDED COURSES & ENROLLMENT */}
      <div className="mt-8 rounded-3xl border border-slate-200 dark:border-purple-950/70 bg-white dark:bg-[#120a26] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {lang === "ar" ? "الكورسات والمسارات الموصى بها لمستواك:" : "Recommended Courses for Your Level:"}
          </h3>
        </div>

        <div className="space-y-3">
          {evaluation.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl border border-purple-400/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-black text-xs">
                  {i + 1}
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-purple-100">{rec}</span>
              </div>
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                <span>{lang === "ar" ? "متاح بالمنصة" : "Available"}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED QUESTION REVIEW & EXPLANATIONS */}
      <div className="mt-8 rounded-3xl border border-slate-200 dark:border-purple-950/70 bg-white dark:bg-[#120a26] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-purple-900/40">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span>{lang === "ar" ? "مراجعة جميع الأسئلة والتفسير الأكاديمي" : "Detailed Questions Review & Explanations"}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-purple-200/70 mt-1">
              {lang === "ar" ? "تفسير قواعدي مفصل لكل سؤال لمعرفة سبب الإجابة الصحيحة." : "Detailed grammatical rationale for every single question."}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReviewFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                reviewFilter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-purple-950/40 text-slate-600 dark:text-purple-300"
              }`}
            >
              {lang === "ar" ? "الكل" : "All"} ({evaluation.details.length})
            </button>
            <button
              onClick={() => setReviewFilter("correct")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                reviewFilter === "correct"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {lang === "ar" ? "الصحيحة" : "Correct"} ({evaluation.correctCount})
            </button>
            <button
              onClick={() => setReviewFilter("wrong")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                reviewFilter === "wrong"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {lang === "ar" ? "الخاطئة" : "Incorrect"} ({evaluation.details.length - evaluation.correctCount})
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredDetails.map((item, idx) => {
            const q = item.question;
            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  item.isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                    : "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      {q.levelTag}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-purple-300/60">
                      {q.category}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                      item.isCorrect
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {item.isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>{item.isCorrect ? (lang === "ar" ? "صحيحة" : "Correct") : (lang === "ar" ? "خاطئة" : "Incorrect")}</span>
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed text-left mb-3" dir="ltr">
                  {q.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold mb-3" dir="ltr">
                  <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    <span className="font-bold">{lang === "ar" ? "الإجابة النموذجية: " : "Correct Answer: "}</span>
                    <span className="font-black underline">{q.options[q.correct]}</span>
                  </div>
                  {!item.isCorrect && (
                    <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
                      <span className="font-bold">{lang === "ar" ? "إجابتك: " : "Your Answer: "}</span>
                      <span>{item.studentAnswer !== undefined ? q.options[item.studentAnswer] : (lang === "ar" ? "لم تجب" : "Unanswered")}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-slate-100 dark:bg-purple-950/40 p-3.5 border border-purple-400/15 text-xs text-slate-700 dark:text-purple-200/90 leading-relaxed">
                  <span className="font-black text-amber-400 flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "التفسير الأكاديمي:" : "Academic Explanation:"}</span>
                  </span>
                  <p>{lang === "ar" ? q.explanationAr : q.explanationEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => {
            setIsFinished(false);
            setIsTestActive(false);
          }}
          className="flex items-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 px-6 py-3.5 text-xs font-black transition-all"
        >
          <RefreshCw className="w-4 h-4 text-purple-400" />
          <span>{lang === "ar" ? "اختيار مسار آخر أو إعادة الاختبار" : "Change Track or Retake Test"}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:brightness-110 text-white px-8 py-3.5 text-xs font-black shadow-xl shadow-purple-950/60 transition-all"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span>{lang === "ar" ? "طباعة / حفظ شهادة المستوى الرسمية" : "Print / Save Official Certificate"}</span>
        </button>
      </div>
    </div>
  );
};
