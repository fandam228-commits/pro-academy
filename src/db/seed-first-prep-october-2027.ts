import { brotliDecompressSync } from "node:zlib";
import { db } from "./index";
import { questionBank } from "./schema";
import { inArray } from "drizzle-orm";

import { OCTOBER_DATA_0 } from "./october-data-0";
import { OCTOBER_DATA_1 } from "./october-data-1";
import { OCTOBER_DATA_2 } from "./october-data-2";
import { OCTOBER_DATA_3 } from "./october-data-3";
import { OCTOBER_DATA_4 } from "./october-data-4";

const DATA = OCTOBER_DATA_0 + OCTOBER_DATA_1 + OCTOBER_DATA_2 + OCTOBER_DATA_3 + OCTOBER_DATA_4;

type SeedItem = { u:number; n:number; q:string; o:string[]; a:string; domain:string; topic:string; grammar:string|null; type:string };

export async function seedFirstPrepOctober2027() {
  try {
    const raw = JSON.parse(brotliDecompressSync(Buffer.from(DATA, "base64")).toString("utf8")) as SeedItem[];
    const ids = raw.map((x) => `qb_first_prep_october_2027_u${x.u}_${String(x.n).padStart(3,"0")}_${x.type}`);
    const existing = await db.select({ id: questionBank.id }).from(questionBank).where(inArray(questionBank.id, ids));
    const existingIds = new Set(existing.map((x) => x.id));
    const rows = raw.filter((x) => !existingIds.has(`qb_first_prep_october_2027_u${x.u}_${String(x.n).padStart(3,"0")}_${x.type}`)).map((x) => ({
      id: `qb_first_prep_october_2027_u${x.u}_${String(x.n).padStart(3,"0")}_${x.type}`,
      domainCategory: x.domain,
      questionText: x.type === "rewrite" ? `${x.q} (${x.a})` : x.q,
      questionType: x.type,
      stage: "Preparatory",
      grade: "First Prep",
      curriculum: "Ministry",
      term: "First",
      source: "October Revision — Dr. Mohamed Shawky Elnaggar 2027",
      unit: `Unit ${x.u}`,
      lesson: `Unit ${x.u} — October Revision`,
      section: x.domain === "Vocabulary" ? "Vocabulary" : "Grammar",
      difficulty: x.type === "mcq" ? "Medium" : "Hard",
      skill: x.domain,
      topic: x.topic,
      grammarTopic: x.grammar,
      options: x.o,
      correctAnswer: x.type === "rewrite" ? "MANUAL_GRADING" : x.a,
      explanation: x.type === "rewrite" ? "Source PDF supplies the rewrite prompt but no answer key; manual grading required." : null,
      points: 10,
    }));
    for (let i=0;i<rows.length;i+=50) await db.insert(questionBank).values(rows.slice(i,i+50));
    console.log(`Seeded ${rows.length} First Prep October 2027 questions.`);
  } catch (error) { console.error("First Prep October 2027 seed error:", error); }
}