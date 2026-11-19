/**
 * Egyptian Governorates & Schools League Master Data & Engine (2026/2027)
 * Professional Academy — Mr. Habib El Rahman
 *
 * Covers all 27 Egyptian Governorates, prestigious secondary & preparatory schools,
 * STEM schools, Al-Azhar institutes, and scoring algorithms for the National League Cup.
 */

export interface GovernorateInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  region: "greater_cairo" | "delta" | "canal" | "upper_egypt" | "border";
  regionAr: string;
  capitalAr: string;
  emblemEmoji: string;
  shieldTier: "platinum" | "gold" | "silver" | "bronze" | "challenger";
  baseWeeklyXp: number;
  baseTotalXp: number;
  activeStudents: number;
  topSchool: string;
  topStudentAmbassador: {
    name: string;
    school: string;
    grade: string;
    weeklyXp: number;
  };
}

export interface SchoolEntry {
  id: string;
  name: string;
  governorateId: string;
  governorateNameAr: string;
  type: "stem" | "experimental_lang" | "general_sec" | "prep" | "azhar";
  typeLabelAr: string;
  badge: "platinum" | "gold" | "silver";
  badgeLabelAr: string;
  activeStudents: number;
  weeklyXp: number;
  totalXp: number;
  rank: number;
}

export const EGYPTIAN_GOVERNORATES: GovernorateInfo[] = [
  {
    id: "dakahlia",
    nameAr: "الدقهلية",
    nameEn: "Dakahlia",
    region: "delta",
    regionAr: "الدلتا",
    capitalAr: "المنصورة",
    emblemEmoji: "🌾",
    shieldTier: "gold",
    baseWeeklyXp: 14850,
    baseTotalXp: 58200,
    activeStudents: 142,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا (STEM الدقهلية)",
    topStudentAmbassador: {
      name: "أحمد مصطفى الشناوي",
      school: "مدرسة المنصورة الثانوية بنين",
      grade: "الثالث الثانوي",
      weeklyXp: 920,
    },
  },
  {
    id: "cairo",
    nameAr: "القاهرة",
    nameEn: "Cairo",
    region: "greater_cairo",
    regionAr: "القاهرة الكبرى",
    capitalAr: "القاهرة",
    emblemEmoji: "🏛️",
    shieldTier: "gold",
    baseWeeklyXp: 14200,
    baseTotalXp: 55400,
    activeStudents: 168,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بالمعادي (STEM)",
    topStudentAmbassador: {
      name: "مريم خالد رضوان",
      school: "مدرسة مصر الجديدة الثانوية بنات",
      grade: "الثالث الثانوي",
      weeklyXp: 880,
    },
  },
  {
    id: "alexandria",
    nameAr: "الإسكندرية",
    nameEn: "Alexandria",
    region: "delta",
    regionAr: "عروس البحر المتوسط",
    capitalAr: "الإسكندرية",
    emblemEmoji: "🌊",
    shieldTier: "gold",
    baseWeeklyXp: 13600,
    baseTotalXp: 51900,
    activeStudents: 135,
    topSchool: "مدرسة المتفوقين ببرج العرب (STEM)",
    topStudentAmbassador: {
      name: "يوسف إبراهيم عبد الرحمن",
      school: "مدرسة العباسية الثانوية بنين",
      grade: "الثالث الثانوي",
      weeklyXp: 810,
    },
  },
  {
    id: "giza",
    nameAr: "الجيزة",
    nameEn: "Giza",
    region: "greater_cairo",
    regionAr: "القاهرة الكبرى",
    capitalAr: "الجيزة",
    emblemEmoji: "🔺",
    shieldTier: "gold",
    baseWeeklyXp: 12950,
    baseTotalXp: 49800,
    activeStudents: 124,
    topSchool: "مدرسة المتفوقين بالسادس من أكتوبر (STEM بنين)",
    topStudentAmbassador: {
      name: "سارة محمود عبد الفتاح",
      school: "مدرسة السعيدية الثانوية العسكرية",
      grade: "الثالث الثانوي",
      weeklyXp: 760,
    },
  },
  {
    id: "gharbia",
    nameAr: "الغربية",
    nameEn: "Gharbia",
    region: "delta",
    regionAr: "الدلتا",
    capitalAr: "طنطا",
    emblemEmoji: "⚙️",
    shieldTier: "silver",
    baseWeeklyXp: 11800,
    baseTotalXp: 44200,
    activeStudents: 98,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بطنطا (STEM)",
    topStudentAmbassador: {
      name: "عمر محمود السيد",
      school: "مدرسة طنطا الثانوية بنين",
      grade: "الثالث الثانوي",
      weeklyXp: 690,
    },
  },
  {
    id: "sharqia",
    nameAr: "الشرقية",
    nameEn: "Sharqia",
    region: "delta",
    regionAr: "الدلتا",
    capitalAr: "الزقازيق",
    emblemEmoji: "🐎",
    shieldTier: "silver",
    baseWeeklyXp: 10900,
    baseTotalXp: 41500,
    activeStudents: 92,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بالزقازيق (STEM)",
    topStudentAmbassador: {
      name: "نورهان هشام الصاوي",
      school: "مدرسة فاقوس الثانوية بنات",
      grade: "الثالث الثانوي",
      weeklyXp: 630,
    },
  },
  {
    id: "menoufia",
    nameAr: "المنوفية",
    nameEn: "Menoufia",
    region: "delta",
    regionAr: "الدلتا",
    capitalAr: "شبين الكوم",
    emblemEmoji: "🦅",
    shieldTier: "silver",
    baseWeeklyXp: 10450,
    baseTotalXp: 39600,
    activeStudents: 87,
    topSchool: "مدرسة المتفوقين بسرس الليان (STEM)",
    topStudentAmbassador: {
      name: "كريم شريف النجار",
      school: "مدرسة شبين الكوم الثانوية بنين",
      grade: "الثالث الثانوي",
      weeklyXp: 590,
    },
  },
  {
    id: "qalyubia",
    nameAr: "القليوبية",
    nameEn: "Qalyubia",
    region: "greater_cairo",
    regionAr: "القاهرة الكبرى",
    capitalAr: "بنها",
    emblemEmoji: "🌾",
    shieldTier: "silver",
    baseWeeklyXp: 9850,
    baseTotalXp: 37200,
    activeStudents: 79,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا ببنها (STEM)",
    topStudentAmbassador: {
      name: "فريدة طارق زايد",
      school: "مدرسة بنها الثانوية بنات",
      grade: "الثالث الثانوي",
      weeklyXp: 540,
    },
  },
  {
    id: "beheira",
    nameAr: "البحيرة",
    nameEn: "Beheira",
    region: "delta",
    regionAr: "الدلتا",
    capitalAr: "دمنهور",
    emblemEmoji: "🚤",
    shieldTier: "silver",
    baseWeeklyXp: 9200,
    baseTotalXp: 34800,
    activeStudents: 74,
    topSchool: "مدرسة دمنهور الثانوية العسكرية",
    topStudentAmbassador: {
      name: "زياد عمرو البنداري",
      school: "مدرسة الشهيد أحمد فوزي الثانوية",
      grade: "الثالث الثانوي",
      weeklyXp: 480,
    },
  },
  {
    id: "kafr_el_sheikh",
    nameAr: "كفر الشيخ",
    nameEn: "Kafr El-Sheikh",
    region: "delta",
    regionAr: "الدلتا",
    capitalAr: "كفر الشيخ",
    emblemEmoji: "🌾",
    shieldTier: "bronze",
    baseWeeklyXp: 8750,
    baseTotalXp: 32900,
    activeStudents: 68,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بكفر الشيخ (STEM)",
    topStudentAmbassador: {
      name: "حبيبة هاني غنيم",
      school: "مدرسة الشهيد حمدي الثانوية بنات",
      grade: "الثالث الثانوي",
      weeklyXp: 430,
    },
  },
  {
    id: "assiut",
    nameAr: "أسيوط",
    nameEn: "Assiut",
    region: "upper_egypt",
    regionAr: "الصعيد",
    capitalAr: "أسيوط",
    emblemEmoji: "🦅",
    shieldTier: "bronze",
    baseWeeklyXp: 8400,
    baseTotalXp: 31500,
    activeStudents: 66,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بأسيوط (STEM)",
    topStudentAmbassador: {
      name: "محمد ياسر الدسوقي",
      school: "مدرسة ناصر الثانوية العسكرية بأسيوط",
      grade: "الثاني الثانوي",
      weeklyXp: 740,
    },
  },
  {
    id: "sohag",
    nameAr: "سوهاج",
    nameEn: "Sohag",
    region: "upper_egypt",
    regionAr: "الصعيد",
    capitalAr: "سوهاج",
    emblemEmoji: "🏛️",
    shieldTier: "bronze",
    baseWeeklyXp: 7950,
    baseTotalXp: 29800,
    activeStudents: 62,
    topSchool: "مدرسة سوهاج الثانوية بنين",
    topStudentAmbassador: {
      name: "شهد سامح علام",
      school: "مدرسة الشهيدة هدى شعراوي الثانوية",
      grade: "الثاني الثانوي",
      weeklyXp: 680,
    },
  },
  {
    id: "qena",
    nameAr: "قنا",
    nameEn: "Qena",
    region: "upper_egypt",
    regionAr: "الصعيد",
    capitalAr: "قنا",
    emblemEmoji: "🏺",
    shieldTier: "bronze",
    baseWeeklyXp: 7400,
    baseTotalXp: 28100,
    activeStudents: 58,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بقنا (STEM)",
    topStudentAmbassador: {
      name: "حازم أحمد القاضي",
      school: "مدرسة قنا الثانوية العسكرية",
      grade: "الثاني الثانوي",
      weeklyXp: 610,
    },
  },
  {
    id: "port_said",
    nameAr: "بورسعيد",
    nameEn: "Port Said",
    region: "canal",
    regionAr: "مدن القناة",
    capitalAr: "بورسعيد",
    emblemEmoji: "🚢",
    shieldTier: "bronze",
    baseWeeklyXp: 7100,
    baseTotalXp: 26900,
    activeStudents: 54,
    topSchool: "مدرسة بورسعيد الثانوية العسكرية",
    topStudentAmbassador: {
      name: "ملك حسام عيسى",
      school: "مدرسة الشهيد مصطفى الشامي الرسمية للغات",
      grade: "الأول الثانوي",
      weeklyXp: 720,
    },
  },
  {
    id: "ismailia",
    nameAr: "الإسماعيلية",
    nameEn: "Ismailia",
    region: "canal",
    regionAr: "مدن القناة",
    capitalAr: "الإسماعيلية",
    emblemEmoji: "🥭",
    shieldTier: "bronze",
    baseWeeklyXp: 6850,
    baseTotalXp: 25400,
    activeStudents: 51,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بالإسماعيلية (STEM)",
    topStudentAmbassador: {
      name: "عبد الله وائل كمال",
      school: "مدرسة 24 أكتوبر التجريبية للغات",
      grade: "الأول الثانوي",
      weeklyXp: 650,
    },
  },
  {
    id: "suez",
    nameAr: "السويس",
    nameEn: "Suez",
    region: "canal",
    regionAr: "مدن القناة",
    capitalAr: "السويس",
    emblemEmoji: "⚓",
    shieldTier: "challenger",
    baseWeeklyXp: 6400,
    baseTotalXp: 23800,
    activeStudents: 47,
    topSchool: "مدرسة السويس الثانوية بنين القديمة",
    topStudentAmbassador: {
      name: "ياسمين تامر فهمي",
      school: "مدرسة شادية سلامة الثانوية بنات",
      grade: "الأول الثانوي",
      weeklyXp: 580,
    },
  },
  {
    id: "damietta",
    nameAr: "دمياط",
    nameEn: "Damietta",
    region: "delta",
    regionAr: "الدلتا",
    capitalAr: "دمياط",
    emblemEmoji: "⛵",
    shieldTier: "challenger",
    baseWeeklyXp: 6150,
    baseTotalXp: 22700,
    activeStudents: 45,
    topSchool: "مدرسة كفر سعد الثانوية بنين",
    topStudentAmbassador: {
      name: "آسر شريف الجوهري",
      school: "مدرسة اللوزي الثانوية بنات",
      grade: "الثالث الإعدادي",
      weeklyXp: 660,
    },
  },
  {
    id: "beni_suef",
    nameAr: "بني سويف",
    nameEn: "Beni Suef",
    region: "upper_egypt",
    regionAr: "الصعيد",
    capitalAr: "بني سويف",
    emblemEmoji: "🔺",
    shieldTier: "challenger",
    baseWeeklyXp: 5800,
    baseTotalXp: 21300,
    activeStudents: 42,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا ببني سويف (STEM)",
    topStudentAmbassador: {
      name: "جنى وليد الديب",
      school: "مدرسة سان مارك للغات",
      grade: "الثالث الإعدادي",
      weeklyXp: 590,
    },
  },
  {
    id: "fayoum",
    nameAr: "الفيوم",
    nameEn: "Fayoum",
    region: "upper_egypt",
    regionAr: "الصعيد",
    capitalAr: "الفيوم",
    emblemEmoji: "🌾",
    shieldTier: "challenger",
    baseWeeklyXp: 5450,
    baseTotalXp: 19800,
    activeStudents: 39,
    topSchool: "مدرسة جمال عبد الناصر الثانوية بالفيوم",
    topStudentAmbassador: {
      name: "محمود إيهاب زايد",
      school: "مدرسة الفيوم الثانوية بنين",
      grade: "الأول الثانوي",
      weeklyXp: 490,
    },
  },
  {
    id: "minya",
    nameAr: "المنيا",
    nameEn: "Minya",
    region: "upper_egypt",
    regionAr: "عروس الصعيد",
    capitalAr: "المنيا",
    emblemEmoji: "👑",
    shieldTier: "challenger",
    baseWeeklyXp: 5100,
    baseTotalXp: 18700,
    activeStudents: 38,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بالمنيا (STEM)",
    topStudentAmbassador: {
      name: "روان حسام الدين",
      school: "مدرسة المنيا الثانوية بنات",
      grade: "الثاني الثانوي",
      weeklyXp: 520,
    },
  },
  {
    id: "luxor",
    nameAr: "الأقصر",
    nameEn: "Luxor",
    region: "upper_egypt",
    regionAr: "عاصمة التاريخ",
    capitalAr: "الأقصر",
    emblemEmoji: "🏛️",
    shieldTier: "challenger",
    baseWeeklyXp: 4750,
    baseTotalXp: 17200,
    activeStudents: 34,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بالأقصر (STEM)",
    topStudentAmbassador: {
      name: "حمزة طارق الصاوي",
      school: "مدرسة الأقصر الثانوية العسكرية",
      grade: "الثالث الثانوي",
      weeklyXp: 470,
    },
  },
  {
    id: "aswan",
    nameAr: "أسوان",
    nameEn: "Aswan",
    region: "upper_egypt",
    regionAr: "بلاد الذهب والجمال",
    capitalAr: "أسوان",
    emblemEmoji: "☀️",
    shieldTier: "challenger",
    baseWeeklyXp: 4400,
    baseTotalXp: 16100,
    activeStudents: 31,
    topSchool: "مدرسة أسوان الثانوية بنين",
    topStudentAmbassador: {
      name: "سلمى عادل نوبي",
      school: "مدرسة التجريبية المتميزة بأسوان",
      grade: "الأول الثانوي",
      weeklyXp: 450,
    },
  },
  {
    id: "red_sea",
    nameAr: "البحر الأحمر",
    nameEn: "Red Sea",
    region: "border",
    regionAr: "المحافظات الحدودية",
    capitalAr: "الغردقة",
    emblemEmoji: "🐠",
    shieldTier: "challenger",
    baseWeeklyXp: 3950,
    baseTotalXp: 14500,
    activeStudents: 27,
    topSchool: "مدرسة المتفوقين في العلوم والتكنولوجيا بالغردقة (STEM)",
    topStudentAmbassador: {
      name: "علي رضا متولي",
      school: "مدرسة الغردقة الثانوية بنين",
      grade: "الثاني الثانوي",
      weeklyXp: 410,
    },
  },
  {
    id: "matrouh",
    nameAr: "مطروح",
    nameEn: "Matrouh",
    region: "border",
    regionAr: "المحافظات الحدودية",
    capitalAr: "مرسى مطروح",
    emblemEmoji: "🏖️",
    shieldTier: "challenger",
    baseWeeklyXp: 3500,
    baseTotalXp: 12800,
    activeStudents: 23,
    topSchool: "مدرسة الشهيد أحمد عبد الكريم الثانوية",
    topStudentAmbassador: {
      name: "منة الله أحمد سالم",
      school: "مدرسة مجمع باحثة البادية للغات",
      grade: "الثالث الإعدادي",
      weeklyXp: 380,
    },
  },
  {
    id: "new_valley",
    nameAr: "الوادي الجديد",
    nameEn: "New Valley",
    region: "border",
    regionAr: "المحافظات الحدودية",
    capitalAr: "الخارجة",
    emblemEmoji: "🌴",
    shieldTier: "challenger",
    baseWeeklyXp: 3100,
    baseTotalXp: 11400,
    activeStudents: 20,
    topSchool: "مدرسة الخارجة الثانوية بنين",
    topStudentAmbassador: {
      name: "يحيى مصطفى البرنس",
      school: "مدرسة الوادي الجديد الرسمية للغات",
      grade: "الأول الثانوي",
      weeklyXp: 350,
    },
  },
  {
    id: "north_sinai",
    nameAr: "شمال سيناء",
    nameEn: "North Sinai",
    region: "border",
    regionAr: "أرض الفيروز",
    capitalAr: "العريش",
    emblemEmoji: "🕊️",
    shieldTier: "challenger",
    baseWeeklyXp: 2850,
    baseTotalXp: 10200,
    activeStudents: 19,
    topSchool: "مدرسة العريش الثانوية العسكرية",
    topStudentAmbassador: {
      name: "إبراهيم خليل السيناوي",
      school: "مدرسة العريش التجريبية للغات",
      grade: "الثالث الثانوي",
      weeklyXp: 360,
    },
  },
  {
    id: "south_sinai",
    nameAr: "جنوب سيناء",
    nameEn: "South Sinai",
    region: "border",
    regionAr: "أرض الفيروز",
    capitalAr: "طور سيناء",
    emblemEmoji: "⛰️",
    shieldTier: "challenger",
    baseWeeklyXp: 2600,
    baseTotalXp: 9400,
    activeStudents: 17,
    topSchool: "مدرسة شرم الشيخ الثانوية الرسمية للغات",
    topStudentAmbassador: {
      name: "هاجر سعيد الديب",
      school: "مدرسة الفيروز النموذجية بالطور",
      grade: "الثاني الثانوي",
      weeklyXp: 340,
    },
  },
];

export const TOP_SCHOOLS_LEAGUE: SchoolEntry[] = [
  {
    id: "sch_stem_dakahlia",
    name: "مدرسة المتفوقين في العلوم والتكنولوجيا (STEM الدقهلية)",
    governorateId: "dakahlia",
    governorateNameAr: "الدقهلية",
    type: "stem",
    typeLabelAr: "مدارس STEM للمتفوقين",
    badge: "platinum",
    badgeLabelAr: "المدرسة البلاتينية 💎",
    activeStudents: 48,
    weeklyXp: 5420,
    totalXp: 21600,
    rank: 1,
  },
  {
    id: "sch_stem_maadi",
    name: "مدرسة المتفوقين في العلوم والتكنولوجيا بالمعادي (STEM القاهرة)",
    governorateId: "cairo",
    governorateNameAr: "القاهرة",
    type: "stem",
    typeLabelAr: "مدارس STEM للمتفوقين",
    badge: "platinum",
    badgeLabelAr: "المدرسة البلاتينية 💎",
    activeStudents: 52,
    weeklyXp: 5180,
    totalXp: 20400,
    rank: 2,
  },
  {
    id: "sch_mansoura_sec",
    name: "مدرسة المنصورة الثانوية بنين (الملكية العريقة)",
    governorateId: "dakahlia",
    governorateNameAr: "الدقهلية",
    type: "general_sec",
    typeLabelAr: "ثانوي عام متميز",
    badge: "gold",
    badgeLabelAr: "المدرسة الذهبية 🥇",
    activeStudents: 64,
    weeklyXp: 4950,
    totalXp: 19800,
    rank: 3,
  },
  {
    id: "sch_saidia_giza",
    name: "مدرسة السعيدية الثانوية العسكرية العريقة",
    governorateId: "giza",
    governorateNameAr: "الجيزة",
    type: "general_sec",
    typeLabelAr: "ثانوي عام عسكري",
    badge: "gold",
    badgeLabelAr: "المدرسة الذهبية 🥇",
    activeStudents: 58,
    weeklyXp: 4780,
    totalXp: 18900,
    rank: 4,
  },
  {
    id: "sch_stem_alex",
    name: "مدرسة المتفوقين ببرج العرب (STEM الإسكندرية)",
    governorateId: "alexandria",
    governorateNameAr: "الإسكندرية",
    type: "stem",
    typeLabelAr: "مدارس STEM للمتفوقين",
    badge: "gold",
    badgeLabelAr: "المدرسة الذهبية 🥇",
    activeStudents: 44,
    weeklyXp: 4620,
    totalXp: 18100,
    rank: 5,
  },
  {
    id: "sch_abbasia_alex",
    name: "مدرسة العباسية الثانوية العسكرية بنين",
    governorateId: "alexandria",
    governorateNameAr: "الإسكندرية",
    type: "general_sec",
    typeLabelAr: "ثانوي عام متميز",
    badge: "silver",
    badgeLabelAr: "المدرسة الفضية 🥈",
    activeStudents: 46,
    weeklyXp: 4210,
    totalXp: 16500,
    rank: 6,
  },
  {
    id: "sch_tanta_sec",
    name: "مدرسة طنطا الثانوية بنين",
    governorateId: "gharbia",
    governorateNameAr: "الغربية",
    type: "general_sec",
    typeLabelAr: "ثانوي عام متميز",
    badge: "silver",
    badgeLabelAr: "المدرسة الفضية 🥈",
    activeStudents: 41,
    weeklyXp: 3950,
    totalXp: 15400,
    rank: 7,
  },
  {
    id: "sch_heliopolis_girls",
    name: "مدرسة مصر الجديدة الثانوية النموذجية بنات",
    governorateId: "cairo",
    governorateNameAr: "القاهرة",
    type: "experimental_lang",
    typeLabelAr: "مدارس رسمية لغات",
    badge: "silver",
    badgeLabelAr: "المدرسة الفضية 🥈",
    activeStudents: 38,
    weeklyXp: 3820,
    totalXp: 14900,
    rank: 8,
  },
  {
    id: "sch_stem_october",
    name: "مدرسة المتفوقين بالسادس من أكتوبر (STEM بنين)",
    governorateId: "giza",
    governorateNameAr: "الجيزة",
    type: "stem",
    typeLabelAr: "مدارس STEM للمتفوقين",
    badge: "silver",
    badgeLabelAr: "المدرسة الفضية 🥈",
    activeStudents: 36,
    weeklyXp: 3690,
    totalXp: 14200,
    rank: 9,
  },
  {
    id: "sch_stem_assiut",
    name: "مدرسة المتفوقين في العلوم والتكنولوجيا بأسيوط (STEM الصعيد)",
    governorateId: "assiut",
    governorateNameAr: "أسيوط",
    type: "stem",
    typeLabelAr: "مدارس STEM للمتفوقين",
    badge: "silver",
    badgeLabelAr: "المدرسة الفضية 🥈",
    activeStudents: 33,
    weeklyXp: 3450,
    totalXp: 13600,
    rank: 10,
  },
];

/**
 * Returns formatted shield description based on rank
 */
export function getGovernorateShieldDetails(rank: number): {
  shieldNameAr: string;
  shieldIcon: string;
  badgeColor: string;
} {
  switch (rank) {
    case 1:
      return {
        shieldNameAr: "🏆 درع التفوق الجمهوري الذهبي",
        shieldIcon: "🏆",
        badgeColor: "from-amber-400 to-yellow-500 text-slate-950",
      };
    case 2:
      return {
        shieldNameAr: "🥈 درع التميز الجمهوري الفضي",
        shieldIcon: "🥈",
        badgeColor: "from-slate-200 to-slate-400 text-slate-950",
      };
    case 3:
      return {
        shieldNameAr: "🥉 درع الصدارة البرونزي",
        shieldIcon: "🥉",
        badgeColor: "from-amber-600 to-amber-800 text-white",
      };
    default:
      if (rank <= 10) {
        return {
          shieldNameAr: `🎖️ درع النخبة (المركز #${rank})`,
          shieldIcon: "🎖️",
          badgeColor: "from-blue-600 to-sky-700 text-white",
        };
      }
      return {
        shieldNameAr: `درع المنافسة (المركز #${rank})`,
        shieldIcon: "🛡️",
        badgeColor: "from-slate-700 to-slate-800 text-slate-300",
      };
  }
}

/**
 * Generates structured viral message for WhatsApp / social sharing
 */
export function generateViralLeagueSharePayload(params: {
  studentName: string;
  governorateNameAr: string;
  schoolName: string;
  weeklyXp: number;
  governorateRank: number;
  schoolRank?: number;
  pointsToNextRank?: number;
  portalUrl?: string;
}): {
  headlineAr: string;
  fullMessageAr: string;
  whatsappUrl: string;
} {
  const url = params.portalUrl || "https://pro-academy-sfl3.vercel.app/dashboard/leaderboard";
  
  const headlineAr = `🇪🇬 فخر محافظة ${params.governorateNameAr} ومدرسة ${params.schoolName}!`;

  const fullMessageAr = [
    `🏆 *أنا بمثل محافظة ${params.governorateNameAr} ومدرسة (${params.schoolName}) في دوري إنجليزي مستر حبيب الرحمن 2026!* 🇪🇬`,
    ``,
    `⭐ *رصيدي الأسبوعي:* ${params.weeklyXp.toLocaleString("en-US")} نقطة XP`,
    `🛡️ *ترتيب محافظتنا الآن:* المركز #${params.governorateRank} على مستوى الجمهورية!`,
    params.schoolRank ? `🏫 *ترتيب مدرستنا:* المركز #${params.schoolRank} جمهورياً!` : ``,
    params.pointsToNextRank ? `⚡ *باقي فقط ${params.pointsToNextRank.toLocaleString("en-US")} نقطة* ونتجاوز المركز اللي قبلنا ونرفع درع الجمهورية!` : ``,
    ``,
    `🔥 زمايلي في ${params.governorateNameAr} وفي مدرستي: ادخلوا حلوا الكويزات ونماذج المعاصر وجيم، وكل نقطة هترفع رصيد مدرستنا ومحافظتنا!`,
    ``,
    `📲 ادخل التحدي وشارك مدرستك من هنا:`,
    url,
  ]
    .filter(Boolean)
    .join("\n");

  const encoded = encodeURIComponent(fullMessageAr);
  const whatsappUrl = `https://wa.me/?text=${encoded}`;

  return {
    headlineAr,
    fullMessageAr,
    whatsappUrl,
  };
}
