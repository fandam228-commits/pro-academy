import type { ImportedAdminExamQuestion } from "@/db/first-secondary-admin-exams";

const SOURCE = "ثالثة اعدادي ترم أول 2027 - Habib El Rahman.pdf";
const CURRICULUM = "Professional in English 2027";
const COURSE_ID = "crs_prep_3";

type SourceQuestion = {
  id: string;
  page: number;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanation: string;
  domainCategory: string;
  questionType?: string;
  topic: string;
  section: string;
  lesson: string;
  passageText?: string;
  passageHighlightText?: string;
  passageHighlightOccurrence?: number;
};

function makeQuestion(input: SourceQuestion): ImportedAdminExamQuestion {
  return {
    id: `qb_3prep_professional_${input.id}`,
    domainCategory: input.domainCategory,
    questionText: input.questionText,
    questionType: input.questionType || "mcq",
    stage: "Preparatory",
    grade: "Third Prep",
    curriculum: CURRICULUM,
    term: "First",
    source: `${SOURCE} — PDF p. ${input.page}`,
    tags: ["course:crs_prep_3", "Mr. Habib El Rahman", `PDF page ${input.page}`, "Original wording"],
    unit: "Unit 1",
    lesson: input.lesson,
    section: input.section,
    difficulty: "Medium",
    skill: input.domainCategory,
    topic: input.topic,
    bloomLevel: input.domainCategory === "Reading" ? "Understand" : "Apply",
    passageText: input.passageText,
    passageHighlightText: input.passageHighlightText,
    passageHighlightOccurrence: input.passageHighlightOccurrence,
    options: input.options || [],
    correctAnswer: input.correctAnswer,
    acceptedAnswers: input.acceptedAnswers,
    explanation: input.explanation,
    points: 1,
    timesUsed: 0,
    correctCount: 0,
    totalAttempts: 0,
  };
}

const mcq = (
  id: string,
  page: number,
  questionText: string,
  options: string[],
  correctAnswer: string,
  topic: string,
  section: string,
  lesson = "Lessons 1 & 2",
  passageText?: string,
  passageHighlightText?: string,
  passageHighlightOccurrence?: number,
) => makeQuestion({
  id, page, questionText, options, correctAnswer, topic, section, lesson, passageText, passageHighlightText, passageHighlightOccurrence,
  domainCategory: passageText ? "Reading" : "Vocabulary",
  explanation: passageText ? "Answer selected from the source passage." : "Answer checked against the source sentence and vocabulary context.",
});

const mcqForUnit = (unit: string, ...args: Parameters<typeof mcq>) => ({
  ...mcq(...args),
  unit,
});

const dialogue = (
  id: string,
  page: number,
  questionText: string,
  passageText: string,
  correctAnswer: string,
  acceptedAnswers: string[],
  topic: string,
  lesson: string,
) => makeQuestion({
  id, page, questionText, passageText, correctAnswer, acceptedAnswers, topic, lesson,
  domainCategory: "Conversation",
  questionType: "fill_blanks",
  section: "Conversation completion",
  explanation: `Suggested dialogue response based on the following line. Other natural answers may be valid. Teacher review recommended.`,
});

const worldCupPassage = "The FIFA World Cup is the most famous football tournament in the world. It happens every four years, and millions of fans watch it. The best national teams from different countries travel to one host nation to compete for the gold trophy.\n\nIn 2022, Egypt’s neighbors, Qatar, hosted a historic tournament. It was the first World Cup held in an Arab country. Moroccan players amazed everyone by reaching the semi-finals, making all Arabs proud.\n\nMany Egyptian students dream of seeing their national team, the Pharaohs, play in the World Cup again soon. Egypt participated three times before, in 1934, 1990, and 2018.\n\nFootball teaches teenagers about teamwork, hard work, and respecting other cultures. Watching stars like Mohamed Salah inspires young people to practice sports and achieve their goals. Winning the World Cup is the ultimate dream for every football player.";

const communicationPassage = "Communication is one of the most important skills in our daily lives. People use different ways to communicate, such as speaking, writing, or sending messages through technology.\n\nWe need communication to talk to our family, friends, and colleagues every day. It helps us share ideas, solve problems, and build strong relationships.\n\nIn the past, people depended on letters and face-to-face talks. These old methods took a lot of time and effort. Today, modern tools like phones, emails, and social media make communication faster and easier.\n\nHowever, it is not only about words. Listening carefully and showing respect are also important parts of effective communication. This makes everyone feel happy and understood.";

const confidencePassage = "Self-confidence means believing in yourself and your abilities. It helps people face hard situations with courage. For example, a confident student is not afraid to answer difficult questions in class, even if they might make a mistake. They know that making mistakes is how we learn and get better.\n\nConfident people always welcome new chances because they believe in themselves. They easily join competitions, apply for jobs, or speak in front of people. On the other hand, people who do not have confidence usually miss these great chances because they are afraid of failing.\n\nBuilding your confidence does not happen in one day; it takes time. It grows step by step with the help of small successes, and good friends. In the end, self-confidence does not mean that you are perfect. It simply means that you trust yourself enough to try, learn, and grow.";

const schoolGardenChapterOne = "Zeina was a new student at a preparatory school. She was always curious and liked to notice everything around her. On her first day, she looked around the school playground. It was large but empty and gray. The ground was all concrete, and there were just a few old benches. Students threw their trash on the ground, and no one seemed to care.\n\n“This place could be so much better,” Zeina thought. She had an idea, but she didn’t know if anyone would listen to a new student. At lunch, she sat with her new friend Nancy, who was kind and always honest about how she felt. “I don’t like this area,” Nancy said. “It’s a little depressing.”";

const scienceMuseumDialogue = "Ali and Soha are speaking about going to Science Museum\nAli: Hi Soha. Would you like to go to the Science Museum tomorrow?\nSoha: ① ................................................ . I love science. How will we get there?\nAli: ② ................................................ ?\nSoha: The metro is a great idea. It’s fast and clean.\nAli: ③ ................................................ ?\nSoha: The museum opens at 9:00 AM, so we should start early.\nAli: ④ ................................................ ?\nSoha: No, it’s free for students, so we don’t have to pay anything.\nAli: Great! See you tomorrow morning.\nSoha: ⑤ ................................................ .";

const chessDialogue = "Tarek and his teacher are talking about Winning a Chess Competition\nTeacher: Congratulations Tarek! I heard you won the chess competition.\nTarek: ① ................................................ .\nTeacher: ② ................................................ ?\nTarek: I’ve practiced chess since I was seven years old.\nTeacher: ③ ................................................ ?\nTarek: My uncle taught me how to play it.\nTeacher: That’s great! ② ................................................ ?\nTarek: Yes, I think it is difficult, but I enjoy it a lot.\nTeacher: Will you join more competitions in the future?\nTarek: ⑤ ................................................ . I want to win more championships.";

const holidayDialogue = "Jana and Roaa are talking about where to spend their holiday.\nJana: Do you have any plans for the weekend?\nRoaa: ① ................................................ .\nJana: I have a good idea. ② ................................................ .\nRoaa: Wadi El-Rayan! ③ ................................................ ?\nJana: We can enjoy the beautiful scenery of Wadi El-Rayan waterfalls.\nRoaa: ④ ................................................ ?\nJana: We can meet in front of my house.\nRoaa: How will we go there?\nJana: ⑤ ................................................ .";

const questions: ImportedAdminExamQuestion[] = [
  // Unit 1 key vocabulary — source pp. 5–7.
  mcq("vocab_p05_01", 5, "________ means learning more about who you are.", ["Curiosity", "Self-discovery", "Resilience", "Popularity"], "Self-discovery", "Personal identity", "Key vocabulary"),
  mcq("vocab_p05_02", 5, "He looked at himself in the ________ before going out of the house.", ["sketchbook", "wood", "glasses", "mirror"], "mirror", "Personal identity", "Key vocabulary"),
  mcq("vocab_p05_03", 5, "Honesty has a great ________ in our lives.", ["value", "color", "weather", "noise"], "value", "Personal identity", "Key vocabulary"),
  mcq("vocab_p05_04", 5, "________ helps you overcome life’s challenges.", ["Weakness", "Kindness", "Strength", "Tradition"], "Strength", "Personal identity", "Key vocabulary"),
  mcq("vocab_p05_05", 5, "So much homework usually makes students feel ________.", ["patient", "popular", "positive", "stressed"], "stressed", "Personal identity", "Key vocabulary"),
  mcq("vocab_p05_06", 5, "His ________ grew after he scored three goals in the final match.", ["confidence", "curiosity", "character", "difference"], "confidence", "Personal identity", "Key vocabulary"),
  mcq("vocab_p05_07", 5, "People usually ________ those who do something useful like scientists.", ["change", "value", "celebrate", "describe"], "celebrate", "Personal identity", "Key vocabulary"),
  mcq("vocab_p05_08", 5, "Being a talented programmer, Rodina soon became ________ in the world of digital technology.", ["self-respect", "unpopular", "unknown", "popular"], "popular", "Personal identity", "Key vocabulary"),
  mcq("vocab_p05_09", 5, "After failing the exam, she stayed ________ and studied harder.", ["strong", "negative", "famous", "stressful"], "strong", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_10", 6, "It is my deep ________ that honesty is always the best policy in life.", ["belief", "medicine", "purpose", "difference"], "belief", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_11", 6, "When you respect yourself, others will respect you too; so always keep your ________.", ["curiosity", "journey", "self-respect", "classmate"], "self-respect", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_12", 6, "Good teachers always give help and ________ to students before final exams.", ["stress", "kindness", "goal", "support"], "support", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_13", 6, "Every student has a different way of thinking, and we must respect their ________.", ["volunteer", "individuality", "popularity", "tradition"], "individuality", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_14", 6, "This historical mosque is ________; you can’t find any other building like it in the world.", ["negative", "normal", "unique", "common"], "unique", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_15", 6, "Crying when you are sad is normal; it is never a sign of ________.", ["weakness", "sadness", "illness", "kindness"], "weakness", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_16", 6, "Reading books and learning from your mistakes helps your personal ________.", ["height", "pollution", "scientist", "growth"], "growth", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_17", 6, "Egyptians are very proud of their national ________ and history.", ["identity", "industry", "instrument", "ingredient"], "identity", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_18", 6, "Our teacher has a wonderful ________; she is always smiling.", ["tournament", "personality", "opinion", "apartment"], "personality", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_19", 6, "The pharaohs used their great ________ to build the massive pyramids.", ["illness", "weakness", "power", "distance"], "power", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_20", 6, "Her family’s traditions and experiences are an important part of her ________.", ["background", "software", "partner", "disease"], "background", "Personal identity", "Key vocabulary"),
  mcq("vocab_p06_21", 6, "The ________ is where someone comes from.", ["background", "value", "individuality", "belief"], "background", "Personal identity", "Definitions"),
  mcq("vocab_p06_22", 6, "A/An ________ is an idea that you believe to be true.", ["confidence", "growth", "power", "belief"], "belief", "Personal identity", "Definitions"),
  mcq("vocab_p07_23", 7, "________ is who a person is.", ["Popularity", "Identity", "Strength", "Weakness"], "Identity", "Personal identity", "Definitions"),
  mcq("vocab_p07_24", 7, "________ is the qualities that make someone or something different from other things or people.", ["Self-respect", "Support", "Individuality", "Growth"], "Individuality", "Personal identity", "Definitions"),
  mcq("vocab_p07_25", 7, "________ means learning more about who you are.", ["Confidence", "Identity", "Background", "Self-discovery"], "Self-discovery", "Personal identity", "Definitions"),
  mcq("vocab_p07_26", 7, "________ means one of a kind.", ["Unique", "Stressed", "Valued", "Supported"], "Unique", "Personal identity", "Definitions"),
  mcq("vocab_p07_27", 7, "To ________ is to have a high opinion of someone or something.", ["challenge", "grow", "value", "explore"], "value", "Personal identity", "Definitions"),
  mcq("vocab_p07_28", 7, "Climbing that high mountain was a great ________ for the young athletes.", ["journey", "comfort", "agreement", "challenge"], "challenge", "Personal identity", "Important vocabulary"),
  mcq("vocab_p07_29", 7, "Lighting candles on birthday cakes is a popular ________ that most people follow.", ["opinion", "tradition", "invention", "partner"], "tradition", "Personal identity", "Important vocabulary"),
  mcq("vocab_p07_30", 7, "Don’t worry about the costs; your health and safety are the only things that ________.", ["ignore", "destroy", "matter", "disappear"], "matter", "Personal identity", "Important vocabulary"),
  mcq("vocab_p07_31", 7, "Preparing for final exams can be very ________, so you need to take a break.", ["peaceful", "stressful", "relaxing", "enjoyable"], "stressful", "Personal identity", "Important vocabulary"),
  mcq("vocab_p07_32", 7, "Children have a lot of ________; they always want to know how everything works.", ["curiosity", "laziness", "boredom", "sadness"], "curiosity", "Personal identity", "Important vocabulary"),
  mcq("vocab_p07_33", 7, "True friends accept the ________ in their personalities and enjoy spending time together.", ["goals", "similarities", "differences", "classmates"], "differences", "Personal identity", "Important vocabulary"),
  mcq("vocab_p07_34", 7, "Helping the poor and being gentle with animals are great signs of ________.", ["cruelty", "kindness", "weakness", "anger"], "kindness", "Personal identity", "Important vocabulary"),
  mcq("vocab_p07_35", 7, "With that smart suit and new haircut, you have a completely different ________ today.", ["dress", "sound", "experience", "look"], "look", "Personal identity", "Important vocabulary"),

  // Expressions, word formation, and vocabulary from pp. 9–10 and 14.
  mcq("vocab_p09_01", 9, "“growth” and “development” are ________.", ["antonyms", "synonyms", "adjectives", "suffixes"], "synonyms", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p09_02", 9, "The synonym of “confidence” is ________.", ["doubt", "self-assurance", "decline", "support"], "self-assurance", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p09_03", 9, "________ is the antonym of “weakness”.", ["belief", "personality", "trust", "strength"], "strength", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p09_04", 9, "The antonym of the word “stressed” is ________.", ["worried", "relaxed", "sad", "real"], "relaxed", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p09_05", 9, "To ________ is to respect and appreciate.", ["celebrate", "discourage", "value", "devalue"], "value", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p10_06", 10, "The antonym of the word “unique” is ________.", ["special", "different", "extraordinary", "common"], "common", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p10_07", 10, "The suffix “-ity” gives the ________.", ["noun", "verb", "adjective", "adverb"], "noun", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p10_08", 10, "The prefix “self-” in words like “self-respect” and “self-discovery” means doing something ________.", ["with others", "by yourself", "wrongly", "again"], "by yourself", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p10_09", 10, "The prefix “re-” in the word “rewrite” means “to do the action ________.", ["not", "before", "wrongly", "again"], "again", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p10_10", 10, "We add the suffix “________” to the verb “inspire” to form an adjective.", ["-ing", "-ity", "-th", "-ness"], "-ing", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p10_11", 10, "The prefix “________” gives the opposite meaning of the verb “encourage”.", ["un-", "dis-", "im-", "re-"], "dis-", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes"),
  mcq("vocab_p10_12", 10, "You should be ________ of your abilities.", ["confident", "confidence", "confidently", "confide"], "confident", "Personal identity", "Key vocabulary"),
  mcq("vocab_p10_13", 10, "________ is a good value with all people.", ["Unkind", "Kindly", "Kind", "Kindness"], "Kindness", "Personal identity", "Key vocabulary"),
  mcq("vocab_p10_14", 10, "He showed us that being different is his ________.", ["strengthen", "strength", "strong", "strongly"], "strength", "Personal identity", "Key vocabulary"),
  mcq("vocab_p10_15", 10, "These beliefs ________ my character and help me know what’s right.", ["share", "shade", "chop", "shape"], "shape", "Personal identity", "Expressions & Prepositions"),
  mcq("vocab_p10_16", 10, "After many successful presentations, she began to ________ confidence.", ["gain", "win", "do", "make"], "gain", "Personal identity", "Expressions & Prepositions"),
  mcq("vocab_p10_17", 10, "Every student may ________ a challenge.", ["believe", "die", "search", "face"], "face", "Personal identity", "Expressions & Prepositions"),
  mcq("vocab_p10_18", 10, "She learned that her value goes ________ her looks and appearance.", ["from", "at", "beyond", "for"], "beyond", "Personal identity", "Expressions & Prepositions"),
  mcq("vocab_p10_19", 10, "It’s Ahmed’s first day in a new school and he can’t fit ________ easily.", ["on", "at", "in", "for"], "in", "Personal identity", "Expressions & Prepositions"),
  mcq("vocab_p10_20", 10, "Good teachers believe ________ their students and encourage them ________ succeed.", ["to / on", "in / to", "at / in", "for / to"], "in / to", "Personal identity", "Expressions & Prepositions"),
  mcq("vocab_p14_01", 14, "I need to buy ________ pen because this one is broken.", ["another", "other", "an other", "an another"], "another", "Personal identity", "Personality"),
  mcq("vocab_p14_02", 14, "The team needs to hire ________ three workers.", ["another", "other", "an other", "an another"], "another", "Personal identity", "Personality"),
  mcq("vocab_p14_03", 14, "The team needs to hire ________ workers.", ["another", "other", "an other", "an another"], "other", "Personal identity", "Personality"),
  mcq("vocab_p14_04", 14, "He didn’t have his ID card to prove his ________.", ["personality", "background", "character", "identity"], "identity", "Personal identity", "Personality"),
  mcq("vocab_p14_05", 14, "She is very cheerful and friendly, so everybody loves her ________.", ["background", "identity", "personality", "person"], "personality", "Personal identity", "Personality"),

  // Vocabulary practice from pp. 28 and 32.
  mcq("vocab_p28_01", 28, "The little boy was ________ to know what was inside the box.", ["curious", "hungry", "sleepy", "tired"], "curious", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p28_02", 28, "Ibrahim stood in front of the mirror, ________ his clothes for the fifth time.", ["cutting", "adjusting", "buying", "speaking"], "adjusting", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p28_03", 28, "After failing the exam, she stayed ________ and studied harder.", ["strong", "negative", "famous", "stressful"], "strong", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p28_04", 28, "The artist painted a beautiful ________ of the queen.", ["forest", "journey", "machine", "portrait"], "portrait", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p28_05", 28, "Ahmed showed his teacher some quick ________ of animals.", ["games", "bags", "sketches", "map"], "sketches", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p28_06", 28, "New students should ________ to their new school quickly.", ["volunteer", "matter", "adjust", "remind"], "adjust", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p28_07", 28, "The child was ________ about how the toys works.", ["inspiring", "quiet", "unique", "curious"], "curious", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p28_08", 28, "He looked at himself in the ________ before going out of the house.", ["sketchbook", "mirror", "glasses", "wood"], "mirror", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_09", 29, "Students love Mr. Aly because of his ________; he always tells the truth to everyone.", ["assignment", "honesty", "beauty", "community"], "honesty", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_10", 29, "Mona practiced her presentation many times, so she feels ________ about speaking today.", ["afraid", "shy", "confident", "confused"], "confident", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_11", 29, "In our first English session, we drew a/an ________ to show our names, ages, and favorite sports.", ["identity map", "sketchbook", "thumbs-up", "portrait"], "identity map", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_12", 29, "My father was very ________ of me when I won the school running race.", ["excited", "unsure", "fake", "proud"], "proud", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_13", 29, "Losing the final football match was ________ for the whole school team.", ["challenging", "depressing", "happy", "inspiring"], "depressing", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_14", 29, "Good ________ like honesty and kindness are things we learn from our parents and teachers.", ["values", "grades", "curls", "glasses"], "values", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_15", 29, "A/An ________ boy will never lie or take things that do not belong to him.", ["dishonest", "written", "visual", "honest"], "honest", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_16", 29, "This book costs a lot of money, but it is ________ the money because it contains amazing information.", ["enough", "worth", "worse", "outgoing"], "worth", "Personal identity", "Key vocabulary", "Unit 1 review"),
  mcq("vocab_p29_17", 29, "To ________ is to change something a little to make it better.", ["blend", "notice", "identify", "adjust"], "adjust", "Personal identity", "Definitions", "Unit 1 review"),
  mcq("vocab_p29_18", 29, "________ means feeling sure about your abilities, qualities or decisions.", ["Confused", "Confident", "Unsure", "Excited"], "Confident", "Personal identity", "Definitions", "Unit 1 review"),
  mcq("vocab_p29_19", 29, "________ describes something that makes you feel sad.", ["Challenging", "Fake", "Depressing", "Preparatory"], "Depressing", "Personal identity", "Definitions", "Unit 1 review"),
  mcq("vocab_p29_20", 29, "________ means always telling the truth.", ["Visual", "Written", "Enough", "Honest"], "Honest", "Personal identity", "Definitions", "Unit 1 review"),
  mcq("vocab_p29_21", 29, "________ means being truthful and fair in all situations.", ["Honesty", "Importance", "Beauty", "Comfort"], "Honesty", "Personal identity", "Definitions", "Unit 1 review"),
  mcq("vocab_p30_22", 30, "The ________ is a visual or written representation that shows a person’s identity.", ["family tree", "identity map", "photo album", "birth certificate"], "identity map", "Personal identity", "Definitions", "Unit 1 review"),
  mcq("vocab_p30_23", 30, "________ are the beliefs and principles that guide how we live.", ["Values", "Situations", "Communities", "Assignments"], "Values", "Personal identity", "Definitions", "Unit 1 review"),
  mcq("vocab_p30_24", 30, "________ means good enough to deserve the time, effort, or money.", ["Common", "Useful", "Costly", "Worth"], "Worth", "Personal identity", "Definitions", "Unit 1 review"),
  mcq("vocab_p30_25", 30, "A person who always tells the truth and never lies is described as ________.", ["truthful", "creative", "stressful", "comfortable"], "truthful", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_26", 30, "After a long and tiring day at work, everyone looks forward to finding some ________ at home.", ["assignment", "panic", "comfort", "sketchbook"], "comfort", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_27", 30, "My sister is very ________; she always comes up with new and original ideas for her paintings.", ["ordinary", "creative", "concrete", "common"], "creative", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_28", 30, "When you agree with something, you usually show a ________.", ["thumbs-up", "head-shake", "lips-up", "thumbs-down"], "thumbs-up", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_29", 30, "An ________ person is very friendly, open, and enjoys being around other people.", ["angry", "lazy", "quiet", "outgoing"], "outgoing", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_30", 30, "He felt ________; he wasn’t able to think clearly or understand the situation.", ["happy", "ready", "confused", "hungry"], "confused", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_31", 30, "Our English teacher gave us a difficult ________ to finish by next Monday.", ["story", "book", "game", "assignment"], "assignment", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_32", 30, "When the fire alarm went off, people started to ________ and run towards the exits.", ["laugh", "panic", "sing", "relax"], "panic", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_33", 30, "She prefers to ________ into the background during big family meetings.", ["bend", "send", "blend", "blind"], "blend", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_34", 30, "Taking care of the environment is everyone’s ________.", ["identity", "responsibility", "community", "popularity"], "responsibility", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_35", 30, "A ________ person is someone who is kind and helpful to others.", ["careless", "cruel", "caring", "boring"], "caring", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p30_36", 30, "When you treat all your friends equally, you show ________.", ["fairness", "sadness", "laziness", "sickness"], "fairness", "Personal identity", "Important vocabulary", "Unit 1 review"),
  mcq("vocab_p32_01", 32, "Yasser is very outgoing and loves meeting new people. “Outgoing” is an antonym for ________.", ["introvert", "happy", "outstanding", "extrovert"], "introvert", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_02", 32, "The synonym of the word “creative” is ________.", ["unimaginative", "innovative", "confused", "strong"], "innovative", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_03", 32, "“indifferent” is the antonym of ________.", ["curious", "truthful", "proud", "creative"], "curious", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_04", 32, "To ________ is to adapt or modify something.", ["depressed", "talent", "adjust", "strong"], "adjust", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_05", 32, "The antonym of “confused” is ________.", ["puzzled", "weak", "disappointed", "confident"], "confident", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_06", 32, "“resilient” and “powerful” are ________ of the word “strong”.", ["antonyms", "suffixes", "synonyms", "adjectives"], "synonyms", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_07", 32, "The synonym of “truthful” is ________.", ["untruthful", "honest", "indifferent", "ashamed"], "honest", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_08", 32, "________ is the antonym of the word “proud”.", ["ashamed", "delighted", "boastful", "satisfied"], "ashamed", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_09", 32, "“talent” means having a specific ________ or ability.", ["inability", "weakness", "skill", "truth"], "skill", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_10", 32, "The antonym of “depressed” is ________.", ["disappointed", "puzzled", "interested", "delighted"], "delighted", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p32_11", 32, "The prefix “________” gives the opposite meaning of the adjective “honest”.", ["re-", "un-", "im-", "dis-"], "dis-", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p33_12", 33, "We add the suffix “________” to the verb “create” to form an adjective.", ["-ty", "-ity", "-ive", "-ing"], "-ive", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p33_13", 33, "We add the suffix “________” to the adjective “curious” to form a noun.", ["-ity", "-ness", "-ive", "-ment"], "-ity", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p33_14", 33, "We add the suffix “________” to the verb “depress” to form an adjective.", ["-y", "-ful", "-ive", "-ing"], "-ing", "Personal identity", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 1 review"),
  mcq("vocab_p33_15", 33, "It is important to show ________ and always tell the truth.", ["honest", "honesty", "honestly", "dishonest"], "honesty", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),
  mcq("vocab_p33_16", 33, "The news about the accident was very ________.", ["depressing", "depress", "depression", "depresses"], "depressing", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),
  mcq("vocab_p33_17", 33, "He is interested ________ art.", ["on", "in", "to", "with"], "in", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),
  mcq("vocab_p33_18", 33, "Music can ________ people together.", ["bring", "explore", "create", "stand"], "bring", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),
  mcq("vocab_p33_19", 33, "Draw facts about yourself to ________ an identity map.", ["blend", "stand", "create", "give"], "create", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),
  mcq("vocab_p33_20", 33, "The student had to stand ________ the class to speak.", ["at", "to", "in", "before"], "before", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),
  mcq("vocab_p33_21", 33, "Have you ever tried to ________ a change in your school or community?", ["let", "take", "make", "give"], "make", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),
  mcq("vocab_p33_22", 33, "What does “blend into the background” mean?", ["to be easy to see", "to look different from others", "to not be noticed", "to move very fast"], "to not be noticed", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),
  mcq("vocab_p33_23", 33, "Nada keeps to herself during the break time. This means she is ________.", ["shy", "outgoing", "curious", "strong"], "shy", "Personal identity", "Expressions & Prepositions", "Unit 1 review"),

  // Language-in-use and end-of-unit questions.
  mcq("language_p36_01", 36, "We are proud ________ live in such a beautiful country.", ["to", "of", "about", "with"], "to", "Personal identity", "Language in use", "Unit 1 review"),
  mcq("language_p36_03", 36, "Please ________ me to buy some milk on our way back home.", ["remember", "remind", "forget", "let"], "remind", "Personal identity", "Language in use", "Unit 1 review"),
  mcq("language_p36_04", 36, "I can’t ________ where I parked my car this morning.", ["let", "remind", "forget", "remember"], "remember", "Personal identity", "Language in use", "Unit 1 review"),
  mcq("language_p36_05", 36, "The funny movie made everyone ________ out loud.", ["to laugh", "laughing", "laugh", "laughed"], "laugh", "Personal identity", "Language in use", "Unit 1 review"),
  mcq("test_p43_01", 43, "A journalist needs to be ________ to look for new news.", ["indifferent", "kind", "curious", "lazy"], "curious", "Personal identity", "Unit 1 Test", "Unit 1 review"),
  mcq("test_p43_02", 43, "Sama’s ________ helps her overcome different situations.", ["weakness", "curiosity", "popularity", "strength"], "strength", "Personal identity", "Unit 1 Test", "Unit 1 review"),
  mcq("test_p43_03", 43, "We add the prefix ________ to give the opposite of patient.", ["in-", "il-", "im-", "un-"], "im-", "Personal identity", "Unit 1 Test", "Unit 1 review"),
  mcq("test_p43_04", 43, "Nada is very outgoing. “Outgoing” is a synonym for ________.", ["extrovert", "introvert", "outstanding", "shy"], "extrovert", "Personal identity", "Unit 1 Test", "Unit 1 review"),

  // Unit 3 Artificial Intelligence review questions — source pp. 95–96.
  mcqForUnit("Unit 3", "vocab_p95_01", 95, "The synonym of “advanced” is ________.", ["traditional", "modern", "virtual", "old-fashioned"], "modern", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p95_02", 95, "The antonym of “benefit” is ________.", ["profit", "advantage", "intelligence", "harm"], "harm", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p95_03", 95, "The synonym of “compose” is ________.", ["create", "ruin", "replace", "destroy"], "create", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p95_04", 95, "The synonym of “creative” is ________.", ["uncreative", "innovative", "old-fashioned", "unimaginative"], "innovative", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p95_05", 95, "The antonym of “innovation” is ________.", ["invention", "improvement", "tradition", "intelligence"], "tradition", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p95_06", 95, "The synonym of “intelligence” is ________.", ["cleverness", "ignorance", "benefit", "stupidity"], "cleverness", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p95_07", 95, "The antonym of “limit” is ________.", ["restriction", "boundary", "innovation", "freedom"], "freedom", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p95_08", 95, "The antonym of “virtual” is ________.", ["online", "simulated", "real", "efficient"], "real", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p95_09", 95, "We can change the adjective “intelligent” into a noun by adding the suffix “________”.", ["-ment", "-ence", "-tion", "-y"], "-ence", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_10", 96, "To get the noun from the verb “innovate”, we add the suffix “________”.", ["-less", "-able", "-ion", "-ive"], "-ion", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_11", 96, "The suffix “________” changes the verb “behave” into a noun.", ["-ior", "-ment", "-ness", "-al"], "-ior", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_12", 96, "We get a noun by adding the suffix “________” to the adjective “efficient”.", ["-ful", "-ing", "-ly", "-cy"], "-cy", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_13", 96, "The noun form of the verb “replace” is “________”.", ["replacy", "replacer", "replacement", "replacive"], "replacement", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_14", 96, "To change the verb “advance” into an adjective, we add the suffix “________”.", ["-ment", "-ed", "-ing", "-y"], "-ed", "Artificial Intelligence", "Synonyms, Antonyms, Prefixes & Suffixes", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_15", 96, "Artificial intelligence helps doctors to ________ diseases accurately.", ["diagnose", "write", "compose", "create"], "diagnose", "Artificial Intelligence", "Expressions & Prepositions", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_16", 96, "Parents usually ________ decisions for their young children.", ["do", "power", "create", "make"], "make", "Artificial Intelligence", "Expressions & Prepositions", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_17", 96, "Advanced technology ________ healthcare and saves many lives.", ["powers", "brings", "makes", "writes"], "powers", "Artificial Intelligence", "Expressions & Prepositions", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_18", 96, "Computers can ________ tasks much faster than human beings.", ["bring", "offer", "do", "diagnose"], "do", "Artificial Intelligence", "Expressions & Prepositions", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_19", 96, "Smart students can ________ complex math problems very easily.", ["create", "solve", "follow", "power"], "solve", "Artificial Intelligence", "Expressions & Prepositions", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_20", 96, "You must ________ basic orders when you are at work.", ["follow", "make", "bring", "diagnose"], "follow", "Artificial Intelligence", "Expressions & Prepositions", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_21", 96, "Authors usually ________ the draft of their books first.", ["power", "do", "allow", "write"], "write", "Artificial Intelligence", "Expressions & Prepositions", "Unit 3 review"),
  mcqForUnit("Unit 3", "vocab_p96_22", 96, "Nurses bring necessary medicine ________ the elderly patients.", ["at", "to", "of", "on"], "to", "Artificial Intelligence", "Expressions & Prepositions", "Unit 3 review"),

  // Story questions from p. 45 use the source Chapter One text on p. 244.
  mcq("story_p45_01", 45, "Zeina was always ________.", ["lazy", "curious", "nervous", "quiet"], "curious", "The School Garden Project", "Story comprehension", "Chapter One: A New Challenge", schoolGardenChapterOne),
  mcq("story_p45_02", 45, "The ground was all ________.", ["sand", "grass", "soil", "concrete"], "concrete", "The School Garden Project", "Story comprehension", "Chapter One: A New Challenge", schoolGardenChapterOne),
  mcq("story_p45_03", 45, "Students threw their ________ on the ground.", ["books", "clothes", "trash", "bags"], "trash", "The School Garden Project", "Story comprehension", "Chapter One: A New Challenge", schoolGardenChapterOne),
  mcq("story_p45_04", 45, "Nancy was always ________ about how she felt.", ["honest", "shy", "rude", "careless"], "honest", "The School Garden Project", "Story comprehension", "Chapter One: A New Challenge", schoolGardenChapterOne),

  // Source reading passages and their unchanged multiple-choice questions.
  mcq("reading_p24_01", 24, "The underlined word “it” in the first paragraph refers to the ________.", ["the gold trophy", "Egypt’s neighbors", "Qatar’s World Cup", "football tournament"], "football tournament", "FIFA World Cup", "Reading comprehension", "Lessons 1 & 2", worldCupPassage, "It", 1),
  mcq("reading_p24_02", 24, "The Moroccan team made Arabs proud because they reached the ________.", ["finals", "first group", "opening match", "semi-finals"], "semi-finals", "FIFA World Cup", "Reading comprehension", "Lessons 1 & 2", worldCupPassage),
  mcq("reading_p24_03", 24, "How often does the FIFA World Cup take place?", ["Every four years", "Every year", "In 1934, 1990, and 2018", "In 2022 and 2026"], "Every four years", "FIFA World Cup", "Reading comprehension", "Lessons 1 & 2", worldCupPassage),
  mcq("reading_p40_01", 40, "What do people use today to make communication faster?", ["Letters", "Phones and emails", "Face-to-face talks", "Books"], "Phones and emails", "Communication", "Reading comprehension", "Unit 1 review", communicationPassage),
  mcq("reading_p40_02", 40, "The underlined “it” refers to ________.", ["communication", "skill", "family", "message"], "communication", "Communication", "Reading comprehension", "Unit 1 review", communicationPassage, "It", 0),
  mcq("reading_p40_03", 40, "The underlined “effective” means ________.", ["slow", "bad", "successful", "useless"], "successful", "Communication", "Reading comprehension", "Unit 1 review", communicationPassage, "effective", 0),
  mcq("reading_p44_01", 44, "The underlined pronoun “they” refers to ________.", ["great chances", "competitions and jobs", "confident people", "people with no confidence"], "people with no confidence", "Self-confidence", "Reading comprehension", "Unit 1 review", confidencePassage, "they", 2),
  mcq("reading_p44_02", 44, "A confident student is not afraid to ________.", ["believe in themselves", "answer difficult questions", "learn and get better", "make mistakes"], "answer difficult questions", "Self-confidence", "Reading comprehension", "Unit 1 review", confidencePassage),
  mcq("reading_p44_03", 44, "Confidence grows step by step with ________.", ["small successes only", "good friends only", "small successes and good friends", "negative thinking"], "small successes and good friends", "Self-confidence", "Reading comprehension", "Unit 1 review", confidencePassage),

  // Original dialogues are kept as a shared passage; suggested response keys are reviewable.
  dialogue("conversation_p23_01", 23, "Soha: ① ................................................ . I love science. How will we get there?", scienceMuseumDialogue, "Yes, I’d love to.", ["Yes, I would love to.", "Sure, I’d love to.", "Of course, I’d love to."], "Going to the Science Museum", "Lessons 1 & 2"),
  dialogue("conversation_p23_02", 23, "Ali: ② ................................................ ?", scienceMuseumDialogue, "We can go by metro.", ["Let’s go by metro.", "We can take the metro.", "How about going by metro?"], "Going to the Science Museum", "Lessons 1 & 2"),
  dialogue("conversation_p23_03", 23, "Ali: ③ ................................................ ?", scienceMuseumDialogue, "What time does the museum open?", ["When does the museum open?"], "Going to the Science Museum", "Lessons 1 & 2"),
  dialogue("conversation_p23_04", 23, "Ali: ④ ................................................ ?", scienceMuseumDialogue, "Do we have to pay for tickets?", ["Do we have to pay?", "Are the tickets free for students?"], "Going to the Science Museum", "Lessons 1 & 2"),
  dialogue("conversation_p23_05", 23, "Soha: ⑤ ................................................ .", scienceMuseumDialogue, "See you tomorrow.", ["See you.", "See you tomorrow morning.", "Bye. See you tomorrow."], "Going to the Science Museum", "Lessons 1 & 2"),
  dialogue("conversation_p39_01", 39, "Tarek: ① ................................................ .", chessDialogue, "Thank you, sir.", ["Thanks, sir.", "Thank you."], "Winning a Chess Competition", "Lessons 4, 5 & 6"),
  dialogue("conversation_p39_02", 39, "Teacher: ② ................................................ ?", chessDialogue, "How long have you practiced chess?", ["How long have you been practicing chess?"], "Winning a Chess Competition", "Lessons 4, 5 & 6"),
  dialogue("conversation_p39_03", 39, "Teacher: ③ ................................................ ?", chessDialogue, "Who taught you how to play chess?", ["Who taught you to play chess?"], "Winning a Chess Competition", "Lessons 4, 5 & 6"),
  dialogue("conversation_p39_04", 39, "Teacher: That’s great! ② ................................................ ?", chessDialogue, "Do you think chess is difficult?", ["What do you think about chess?", "What do you think of chess?"], "Winning a Chess Competition", "Lessons 4, 5 & 6"),
  dialogue("conversation_p39_05", 39, "Tarek: ⑤ ................................................ . I want to win more championships.", chessDialogue, "Yes, I will.", ["Yes, definitely.", "Yes, I will join more competitions.", "I hope so."], "Winning a Chess Competition", "Lessons 4, 5 & 6"),
  dialogue("conversation_p46_01", 46, "Roaa: ① ................................................ .", holidayDialogue, "I haven’t decided yet.", ["I am not sure yet.", "I don't know yet.", "I haven't made any plans yet."], "Holiday plans", "Unit 1 review"),
  dialogue("conversation_p46_02", 46, "Jana: I have a good idea. ② ................................................ .", holidayDialogue, "Where shall we go?", ["Where can we go?", "Where would you like to go?"], "Holiday plans", "Unit 1 review"),
  dialogue("conversation_p46_03", 46, "Roaa: Wadi El-Rayan! ③ ................................................ ?", holidayDialogue, "Why do you want to go there?", ["Why should we go there?", "What can we do there?"], "Holiday plans", "Unit 1 review"),
  dialogue("conversation_p46_04", 46, "Roaa: ④ ................................................ ?", holidayDialogue, "Where shall we meet?", ["Where can we meet?", "Where will we meet?"], "Holiday plans", "Unit 1 review"),
  dialogue("conversation_p46_05", 46, "Jana: ⑤ ................................................ .", holidayDialogue, "We can go by bus.", ["We can go by car.", "We can take a bus.", "Let's go by bus."], "Holiday plans", "Unit 1 review"),
];

export function getThirdPrepProfessionalEnglishQuestions(): ImportedAdminExamQuestion[] {
  return questions;
}

export const THIRD_PREP_PROFESSIONAL_ENGLISH_QUESTION_COUNT = questions.length;
export const THIRD_PREP_PROFESSIONAL_ENGLISH_CURRICULUM = CURRICULUM;
export const THIRD_PREP_PROFESSIONAL_ENGLISH_COURSE_ID = COURSE_ID;
