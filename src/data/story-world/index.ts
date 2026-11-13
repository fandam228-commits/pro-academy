import prep1Data from "./prep1-stories.json";
import prep2Data from "./prep2-stories.json";
import prep3Data from "./prep3-story.json";
import sec1Data from "./sec1-story.json";
import sec2Data from "./sec2-story.json";
import sec3Data from "./sec3-story.json";

export interface VocabularyWord {
  word: string;
  meaningAr: string;
  example?: string;
  phonetic?: string;
}

export interface ChapterPoint {
  en: string;
  ar: string;
}

export interface TextParagraph {
  order: number;
  paragraphEn: string;
  paragraphAr: string;
  audioStart?: number;
  audioEnd?: number;
}

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  type?: "sb_wb" | "directorate" | "critical_thinking" | "general";
  notes?: string;
}

export interface ImportantQuestion {
  id: string;
  question: string;
  answer: string;
  category?: "critical_thinking" | "jre" | "directorate_exam";
  governorate?: string;
  year?: string;
}

export interface HomeworkQuestion {
  id: string;
  question: string;
  type: "essay" | "mcq" | "fill_blanks";
  options?: string[];
  correctAnswer?: string;
  explanationAr?: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanationAr: string;
}

export interface ChapterItem {
  id: string;
  chapterNumber: number;
  titleEn: string;
  titleAr: string;
  term: "first" | "second" | "full_year";
  summaryEn: string;
  summaryAr: string;
  chapterInPoints: ChapterPoint[];
  vocabulary: VocabularyWord[];
  theText: TextParagraph[];
  questionsAndAnswers: QuestionAnswer[];
  importantQuestions: ImportantQuestion[];
  homeworkQuestions: HomeworkQuestion[];
  mcqQuestions: MCQQuestion[];
  isPublished?: boolean;
  orderIndex?: number;
}

export interface StoryCharacter {
  nameEn: string;
  nameAr: string;
  role: string;
  descriptionEn: string;
  descriptionAr: string;
  avatar?: string;
}

export interface StoryTheme {
  themeEn: string;
  themeAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface StoryItem {
  id: string;
  gradeCode: "prep_1" | "prep_2" | "prep_3" | "sec_1" | "sec_2" | "sec_3";
  gradeLabelAr: string;
  gradeLabelEn: string;
  term: "first" | "second" | "full_year";
  termLabelAr: string;
  termLabelEn: string;
  titleAr: string;
  titleEn: string;
  author: string;
  aboutAuthorEn: string;
  aboutAuthorAr: string;
  coverImage: string;
  descriptionAr: string;
  descriptionEn: string;
  plotSummaryEn: string;
  plotSummaryAr: string;
  characters: StoryCharacter[];
  themes: StoryTheme[];
  chapters: ChapterItem[];
}

// Consolidate all extracted curriculum stories
const rawList: StoryItem[] = [
  ...(Array.isArray(prep1Data) ? prep1Data : [prep1Data]),
  ...(Array.isArray(prep2Data) ? prep2Data : [prep2Data]),
  ...(Array.isArray(prep3Data) ? prep3Data : [prep3Data]),
  ...(Array.isArray(sec1Data) ? sec1Data : [sec1Data]),
  ...(Array.isArray(sec2Data) ? sec2Data : [sec2Data]),
  ...(Array.isArray(sec3Data) ? sec3Data : [sec3Data]),
] as StoryItem[];

export const ALL_CURRICULUM_STORIES: StoryItem[] = rawList;

export const GRADE_DEFINITIONS = [
  {
    code: "prep_1",
    labelAr: "الصف الأول الإعدادي",
    labelEn: "First Preparatory",
    stage: "preparatory",
    orderIndex: 1,
  },
  {
    code: "prep_2",
    labelAr: "الصف الثاني الإعدادي",
    labelEn: "Second Preparatory",
    stage: "preparatory",
    orderIndex: 2,
  },
  {
    code: "prep_3",
    labelAr: "الصف الثالث الإعدادي",
    labelEn: "Third Preparatory",
    stage: "preparatory",
    orderIndex: 3,
  },
  {
    code: "sec_1",
    labelAr: "الصف الأول الثانوي",
    labelEn: "First Secondary",
    stage: "secondary",
    orderIndex: 4,
  },
  {
    code: "sec_2",
    labelAr: "الصف الثاني الثانوي",
    labelEn: "Second Secondary",
    stage: "secondary",
    orderIndex: 5,
  },
  {
    code: "sec_3",
    labelAr: "الصف الثالث الثانوي",
    labelEn: "Third Secondary",
    stage: "secondary",
    orderIndex: 6,
  },
] as const;

export function getAllStories(): StoryItem[] {
  return ALL_CURRICULUM_STORIES;
}

export function getStoryById(id: string): StoryItem | undefined {
  return ALL_CURRICULUM_STORIES.find((s) => s.id === id);
}

export function getStoriesByGrade(gradeCode: string): StoryItem[] {
  return ALL_CURRICULUM_STORIES.filter((s) => s.gradeCode === gradeCode);
}

export function getStoriesByGradeAndTerm(
  gradeCode: string,
  term?: "first" | "second" | "full_year"
): StoryItem[] {
  return ALL_CURRICULUM_STORIES.filter((s) => {
    if (s.gradeCode !== gradeCode) return false;
    if (!term) return true;
    if (s.term === "full_year") return true;
    return s.term === term;
  });
}

export function getChapterById(
  chapterId: string
): { story: StoryItem; chapter: ChapterItem } | undefined {
  for (const story of ALL_CURRICULUM_STORIES) {
    const chapter = story.chapters.find((ch) => ch.id === chapterId);
    if (chapter) {
      return { story, chapter };
    }
  }
  return undefined;
}
