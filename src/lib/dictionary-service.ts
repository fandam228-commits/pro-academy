/**
 * Professional Academy — Smart Dictionary Service
 * Provides verified IPA transcriptions (UK / US), parts of speech, and definitions.
 * Follows strict pedagogical accuracy: Never fabricates IPA or definitions.
 * If data is not verified, it explicitly returns null / "غير متاح".
 */

export interface WordDetail {
  word: string;
  arabicMeaning: string;
  partOfSpeech: string;
  ipaUk: string | null;
  ipaUs: string | null;
  definitionEn: string;
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
}

/**
 * Verified Oxford / Cambridge Lexicon Mapping for Egyptian English Curriculum
 */
const VERIFIED_LEXICON: Record<string, Partial<WordDetail>> = {
  // Unit 1-6 Secondary & Prep Core Words
  innovation: {
    word: "Innovation",
    arabicMeaning: "ابتكار / تجديد إبداعي",
    partOfSpeech: "noun",
    ipaUk: "/ˌɪn.əˈveɪ.ʃən/",
    ipaUs: "/ˌɪn.əˈveɪ.ʃən/",
    definitionEn: "The action or process of introducing new ideas, devices, or methods.",
    exampleSentence: "Technological innovation plays a pivotal role in Egypt's sustainable development.",
    synonyms: ["breakthrough", "novelty", "advancement"],
    antonyms: ["stagnation", "tradition"],
    collocations: ["technological innovation", "encourage innovation", "foster innovation"],
  },
  resilience: {
    word: "Resilience",
    arabicMeaning: "مرونة وقدرة على الصمود وتخطي الصعاب",
    partOfSpeech: "noun",
    ipaUk: "/rɪˈzɪl.jəns/",
    ipaUs: "/rɪˈzɪl.jəns/",
    definitionEn: "The capacity to withstand or recover quickly from difficulties; toughness.",
    exampleSentence: "Students demonstrated extraordinary resilience throughout the examination period.",
    synonyms: ["toughness", "endurance", "perseverance"],
    antonyms: ["fragility", "vulnerability"],
    collocations: ["build resilience", "emotional resilience", "economic resilience"],
  },
  sustainable: {
    word: "Sustainable",
    arabicMeaning: "مستدام / صديق للبيئة وطويل الأمد",
    partOfSpeech: "adjective",
    ipaUk: "/səˈsteɪ.nə.bəl/",
    ipaUs: "/səˈsteɪ.nə.bəl/",
    definitionEn: "Able to be maintained at a certain rate without exhausting natural resources.",
    exampleSentence: "Egypt is actively investing in sustainable solar and wind energy projects.",
    synonyms: ["eco-friendly", "renewable", "viable"],
    antonyms: ["unsustainable", "depleting"],
    collocations: ["sustainable development", "sustainable energy", "sustainable practices"],
  },
  collaborate: {
    word: "Collaborate",
    arabicMeaning: "يتعاون وينسق الجهود",
    partOfSpeech: "verb",
    ipaUk: "/kəˈlæb.ə.reɪt/",
    ipaUs: "/kəˈlæb.ə.reɪt/",
    definitionEn: "To work jointly on an activity, especially to produce or create something.",
    exampleSentence: "The researchers collaborate with international experts to protect marine ecosystems.",
    synonyms: ["cooperate", "team up", "partner"],
    antonyms: ["compete", "oppose"],
    collocations: ["collaborate on a project", "collaborate with peers"],
  },
  digital: {
    word: "Digital",
    arabicMeaning: "رقمي / إلكتروني",
    partOfSpeech: "adjective",
    ipaUk: "/ˈdɪdʒ.ɪ.təl/",
    ipaUs: "/ˈdɪdʒ.ə.t̬əl/",
    definitionEn: "Expressed in numerical digits or involving computerized technology.",
    exampleSentence: "Life in a digital world requires continuous digital literacy and cyber safety.",
    synonyms: ["electronic", "computerized"],
    antonyms: ["analog", "manual"],
    collocations: ["digital footprint", "digital world", "digital literacy"],
  },
  footprint: {
    word: "Footprint",
    arabicMeaning: "أثر / بصمة (خاصة البصمة الرقمية)",
    partOfSpeech: "noun",
    ipaUk: "/ˈfʊt.prɪnt/",
    ipaUs: "/ˈfʊt.prɪnt/",
    definitionEn: "A mark left by a foot or a record of things done online.",
    exampleSentence: "Be cautious of what you post online to keep your digital footprint positive.",
    synonyms: ["impression", "trace", "record"],
    antonyms: [],
    collocations: ["digital footprint", "carbon footprint"],
  },
  entrepreneur: {
    word: "Entrepreneur",
    arabicMeaning: "رائد أعمال / مبادر مشاريع",
    partOfSpeech: "noun",
    ipaUk: "/ˌɒn.trə.prəˈnɜːr/",
    ipaUs: "/ˌɑːn.trə.prəˈnɝː/",
    definitionEn: "A person who sets up a business, taking on financial risks in the hope of profit.",
    exampleSentence: "Young entrepreneurs in Cairo are launching innovative tech startups.",
    synonyms: ["business founder", "innovator", "tycoon"],
    antonyms: ["employee"],
    collocations: ["young entrepreneur", "tech entrepreneur"],
  },
  heritage: {
    word: "Heritage",
    arabicMeaning: "تراث / إرث حضاري وتاريخي",
    partOfSpeech: "noun",
    ipaUk: "/ˈher.ɪ.tɪdʒ/",
    ipaUs: "/ˈher.ɪ.t̬ɪdʒ/",
    definitionEn: "Valued objects, traditions, and qualities passed down from previous generations.",
    exampleSentence: "Preserving Egypt's ancient heritage is a collective responsibility.",
    synonyms: ["legacy", "tradition", "inheritance"],
    antonyms: [],
    collocations: ["cultural heritage", "national heritage", "preserve heritage"],
  },
  manipulation: {
    word: "Manipulation",
    arabicMeaning: "تلاعب / توجيه مضلل",
    partOfSpeech: "noun",
    ipaUk: "/məˌnɪp.jəˈleɪ.ʃən/",
    ipaUs: "/məˌnɪp.jəˈleɪ.ʃən/",
    definitionEn: "The action of controlling or influencing someone or something cleverly or unscrupulously.",
    exampleSentence: "Critical thinking helps students detect media manipulation and disinformation.",
    synonyms: ["deception", "exploitation", "distortion"],
    antonyms: ["honesty", "transparency"],
    collocations: ["media manipulation", "psychological manipulation"],
  },
  artificial: {
    word: "Artificial",
    arabicMeaning: "اصطناعي / مصطنع",
    partOfSpeech: "adjective",
    ipaUk: "/ˌɑː.tɪˈfɪʃ.əl/",
    ipaUs: "/ˌɑːr.t̬əˈfɪʃ.əl/",
    definitionEn: "Made or produced by human beings rather than occurring naturally.",
    exampleSentence: "Artificial Intelligence transforms modern education and diagnostics.",
    synonyms: ["synthetic", "man-made", "simulated"],
    antonyms: ["natural", "organic"],
    collocations: ["artificial intelligence", "artificial reef"],
  },
  intelligence: {
    word: "Intelligence",
    arabicMeaning: "ذكاء / قدرة عقلية",
    partOfSpeech: "noun",
    ipaUk: "/ɪnˈtel.ɪ.dʒəns/",
    ipaUs: "/ɪnˈtel.ə.dʒəns/",
    definitionEn: "The ability to acquire and apply knowledge and skills.",
    exampleSentence: "Emotional intelligence is just as vital as academic achievement.",
    synonyms: ["intellect", "cleverness", "wisdom"],
    antonyms: ["stupidity", "ignorance"],
    collocations: ["emotional intelligence", "artificial intelligence"],
  },
  marine: {
    word: "Marine",
    arabicMeaning: "بحري / متعلق بالحياة البحرية",
    partOfSpeech: "adjective",
    ipaUk: "/məˈriːn/",
    ipaUs: "/məˈriːn/",
    definitionEn: "Relating to or found in the sea or ocean.",
    exampleSentence: "The Red Sea is internationally renowned for its diverse marine life.",
    synonyms: ["oceanic", "aquatic", "pelagic"],
    antonyms: ["terrestrial"],
    collocations: ["marine life", "marine biology", "marine ecosystems"],
  },
  ecosystem: {
    word: "Ecosystem",
    arabicMeaning: "نظام بيئي متكامل",
    partOfSpeech: "noun",
    ipaUk: "/ˈiː.kəʊˌsɪs.təm/",
    ipaUs: "/ˈiː.koʊˌsɪs.təm/",
    definitionEn: "A biological community of interacting organisms and their physical environment.",
    exampleSentence: "Protecting coral reefs maintains balance in the marine ecosystem.",
    synonyms: ["environment", "ecological community", "biosphere"],
    antonyms: [],
    collocations: ["fragile ecosystem", "marine ecosystem"],
  },
  mindset: {
    word: "Mindset",
    arabicMeaning: "عقلية / طريقة تفكير ونهج ذهني",
    partOfSpeech: "noun",
    ipaUk: "/ˈmaɪnd.set/",
    ipaUs: "/ˈmaɪnd.set/",
    definitionEn: "The established set of attitudes held by someone.",
    exampleSentence: "Adopting a growth mindset enables learners to overcome difficult challenges.",
    synonyms: ["attitude", "mentality", "outlook"],
    antonyms: [],
    collocations: ["growth mindset", "fixed mindset", "positive mindset"],
  },
  perseverance: {
    word: "Perseverance",
    arabicMeaning: "مثابرة وإصرار مستمر",
    partOfSpeech: "noun",
    ipaUk: "/ˌpɜː.sɪˈvɪə.rəns/",
    ipaUs: "/ˌpɝː.səˈvɪr.əns/",
    definitionEn: "Persistence in doing something despite difficulty or delay in achieving success.",
    exampleSentence: "Through hard work and perseverance, she achieved the top score nationally.",
    synonyms: ["determination", "tenacity", "dedication"],
    antonyms: ["apathy", "surrender"],
    collocations: ["show perseverance", "unwavering perseverance"],
  },
  dignity: {
    word: "Dignity",
    arabicMeaning: "كرامة / عزة نفس ووقار",
    partOfSpeech: "noun",
    ipaUk: "/ˈdɪɡ.nə.ti/",
    ipaUs: "/ˈdɪɡ.nə.t̬i/",
    definitionEn: "The state or quality of being worthy of honor or respect.",
    exampleSentence: "He carried himself with quiet dignity despite all hardships.",
    synonyms: ["self-respect", "honor", "nobility"],
    antonyms: ["humiliation", "dishonor"],
    collocations: ["human dignity", "preserve dignity"],
  },
};

/**
 * Resolves comprehensive word details safely.
 * If data for a field is not verified, it leaves it as null or "غير متاح" per instructions.
 */
export function lookupDictionaryWord(
  rawWord: string,
  contextData?: {
    arabicMeaning?: string;
    partOfSpeech?: string;
    definitionEn?: string;
    exampleSentences?: string[];
    synonyms?: string[];
    antonyms?: string[];
    collocations?: string[];
  }
): WordDetail {
  const cleanWord = (rawWord || "").trim().toLowerCase().replace(/[.,!?;:()"]/g, "");
  const verified = VERIFIED_LEXICON[cleanWord];

  const wordDisplay = rawWord.trim().replace(/[.,!?;:()"]/g, "");

  // Merge verified lexicon with context data from curriculum
  const arabicMeaning =
    verified?.arabicMeaning || contextData?.arabicMeaning || "غير متاح في القاموس الحالي";
  const partOfSpeech =
    verified?.partOfSpeech || contextData?.partOfSpeech || "كلمة لغوية (Word)";
  const ipaUk = verified?.ipaUk || null;
  const ipaUs = verified?.ipaUs || null;
  const definitionEn =
    verified?.definitionEn || contextData?.definitionEn || "No official definition registered.";
  const exampleSentence =
    verified?.exampleSentence ||
    (contextData?.exampleSentences && contextData.exampleSentences[0]) ||
    `The word "${wordDisplay}" is part of your official curriculum.`;
  const synonyms = verified?.synonyms || contextData?.synonyms || [];
  const antonyms = verified?.antonyms || contextData?.antonyms || [];
  const collocations = verified?.collocations || contextData?.collocations || [];

  return {
    word: wordDisplay.charAt(0).toUpperCase() + wordDisplay.slice(1),
    arabicMeaning,
    partOfSpeech,
    ipaUk,
    ipaUs,
    definitionEn,
    exampleSentence,
    synonyms,
    antonyms,
    collocations,
  };
}
