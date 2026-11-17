import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionBank } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import QUESTION_BANK_2027_MASTER from "@/data/question-bank-2027-master.json";

export interface ChallengeQuestion {
  id: string;
  number: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic?: string;
}

const FALLBACK_QUESTIONS: ChallengeQuestion[] = [
  {
    id: "ch_q_1",
    number: 1,
    questionText: "A true journalist must avoid bias by __________, such as leaving out key arguments of one party.",
    options: ["spin", "omission", "placement", "fabrication"],
    correctAnswer: "omission",
    explanation: "Bias by omission يعني التحيز عن طريق الحذف والإغفال المتعمد لبعض الحقائق الهامة.",
    topic: "Unit 1 Vocabulary",
  },
  {
    id: "ch_q_2",
    number: 2,
    questionText: "By the time the ambulance arrived at the scene, the injured passengers __________ first aid.",
    options: ["had received", "have received", "are receiving", "received"],
    correctAnswer: "had received",
    explanation: "الحدث الأسبق في الماضي قبل 'arrived' يكون في زمن الماضي التام Past Perfect.",
    topic: "Past Perfect Grammar",
  },
  {
    id: "ch_q_3",
    number: 3,
    questionText: "Which of the following sentences is punctuated correctly?",
    options: [
      "Although he practiced hard, Omar didn't qualify.",
      "Although, he practiced hard Omar didn't qualify.",
      "Although he practiced hard Omar didn't qualify.",
      "Although he practiced hard; Omar didn't qualify.",
    ],
    correctAnswer: "Although he practiced hard, Omar didn't qualify.",
    explanation: "عندما تبدأ الجملة برابط تناقض مثل Although نضع فاصلة comma بين الجملتين.",
    topic: "Punctuation Skills",
  },
  {
    id: "ch_q_4",
    number: 4,
    questionText: "The new renewable energy project is expected to __________ carbon emissions significantly.",
    options: ["curb", "inflate", "worsen", "provoke"],
    correctAnswer: "curb",
    explanation: "الفعل 'curb' يعني يكبح أو يقلل من الانبعاثات الضارة.",
    topic: "Advanced Vocabulary",
  },
  {
    id: "ch_q_5",
    number: 5,
    questionText: "Hardly __________ the station when the train pulled away.",
    options: ["had I reached", "I had reached", "did I reach", "have I reached"],
    correctAnswer: "had I reached",
    explanation: "عندما تبدأ الجملة بـ Hardly نستخدم صيغة الاستفهام Inversion (had + فاعل + التصريف الثالث).",
    topic: "Inversion Structures",
  },
  {
    id: "ch_q_6",
    number: 6,
    questionText: "Dr. Aisha Abd El-Rahman used the pen name 'Bint El-Shati' because she wanted to __________ women's rights modestly.",
    options: ["champion", "destroy", "disregard", "criticize"],
    correctAnswer: "champion",
    explanation: "الفعل 'champion' يعني يناضل ويدافع بقوة عن قضية نبيلة.",
    topic: "Unit 2 Reading",
  },
  {
    id: "ch_q_7",
    number: 7,
    questionText: "I regret __________ that old car; it caused me endless mechanical troubles.",
    options: ["buying", "to buy", "to buying", "buy"],
    correctAnswer: "buying",
    explanation: "الفعل regret + V-ing يعني يندم على شيء حدث بالفعل في الماضي.",
    topic: "Gerunds & Infinitives",
  },
  {
    id: "ch_q_8",
    number: 8,
    questionText: "Digital __________ is a serious intellectual crime that severely harms publishers.",
    options: ["piracy", "privacy", "policy", "fluency"],
    correctAnswer: "piracy",
    explanation: "كلمة piracy تعني القرصنة الفكرية وانتهاك حقوق النشر.",
    topic: "Unit 1 Key Vocab",
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade") || "Third Secondary";

    let questions: ChallengeQuestion[] = [];

    // 1. Try fetching from Database
    if (process.env.DATABASE_URL) {
      try {
        const rows = await db
          .select()
          .from(questionBank)
          .where(sql`options IS NOT NULL AND jsonb_array_length(options) >= 4`)
          .limit(30);

        if (rows.length >= 5) {
          const shuffled = [...rows].sort(() => 0.5 - Math.random()).slice(0, 5);
          questions = shuffled.map((r, idx) => ({
            id: r.id,
            number: idx + 1,
            questionText: r.questionText,
            options: Array.isArray(r.options) ? (r.options as string[]) : [],
            correctAnswer: r.correctAnswer,
            explanation: r.explanation || "إجابة نموذجية معتمدة وفق معايير الوزارة.",
            topic: r.topic || r.grammarTopic || "Thanaweya Amma Exam Drill",
          }));
        }
      } catch (dbErr) {
        // Fallback to static master
      }
    }

    // 2. Fallback to Master JSON if DB returned insufficient rows
    if (questions.length < 5 && Array.isArray(QUESTION_BANK_2027_MASTER)) {
      const candidates = (QUESTION_BANK_2027_MASTER as any[]).filter(
        (q) => Array.isArray(q.options) && q.options.length >= 4 && q.correctAnswer
      );
      if (candidates.length >= 5) {
        const shuffled = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 5);
        questions = shuffled.map((q, idx) => ({
          id: String(q.id || `master_q_${idx}`),
          number: idx + 1,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "شرح وافٍ ومفصل للقاعدة.",
          topic: q.topic || q.domainCategory || "General",
        }));
      }
    }

    // 3. Fallback to constant seed questions
    if (questions.length < 5) {
      const shuffled = [...FALLBACK_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
      questions = shuffled.map((q, idx) => ({ ...q, number: idx + 1 }));
    }

    return NextResponse.json({
      success: true,
      grade,
      count: questions.length,
      questions,
    });
  } catch (error: any) {
    console.error("Random questions error:", error);
    return NextResponse.json({ error: error.message || "Failed to load questions" }, { status: 500 });
  }
}
