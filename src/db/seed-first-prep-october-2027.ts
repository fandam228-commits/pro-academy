import { brotliDecompressSync } from "node:zlib";
import { db } from "./index";
import { questionBank } from "./schema";
import { inArray } from "drizzle-orm";

const DATA = "G4XrjEjN6gHQCB0+532Yavn6ziGlUV6xqaTL3mIlW1rWKW1IDMU5ARguBjDNVH++1/4f+d+bae//Mg4PuypxY2WBIsq5KFPlO+e6+t3TM1U9A6AKMyCqAILfeO7K+PteN9iNwZohvgO/JVfOuDQxkUpp9LrlgI1Wm0mhgkg2xSw5+36Jc/IYDANV6ubMF9Wvp2Srf/aKCn2nYQXAAWh7GarG22/3Q7NNwiCEvtu/4C//Ntn8vCxMeNr5/BXyI8wzTBxOoGr+CsiPMcH+vw+QAH6Bq89/ArACQocWToHhH7wyhUHz878YuadgCtOKtSlMc+jrR4wizvytMO3ZMj/fToK6Z35uJPvwe7pnZbmXcbowP9fD0hyv87ubnxvffzb/LVDtVKHaPoZTeqSjI17G4VTAEc9fwp4UJocLdHm6oMOBlrvWCsGpkzboED39Tn3MD0/KWXFptY5fd+pQP3iTI1yb/AlFBbH+EMgK6PFfMiIBLxQ0ASCfDpT0RBh1EsQtBYOUFuTPE0BynMvYQBcETRBCeqceY4J9ZAqjbwlZRpU6Br/ThGb9aoFRtadwym8/vydIAmXtF1CoAiS9CQ6IOeIEBp1qvdsRTUDVMkwWDKcPUjSFmcyD/nh2IkyLbe8Y5E4bWrEdUzANL1HASGBtbHqK+gjj8INnmAksXboD6Kgl1l/xczL70Ytli0mu0H28wrERFPJtHzSFsdQXEWBXteO3nU3Y/Ct/HAnGpYtsocsK51gC3N5anT+hjmzCSJnfZcvj5J4w0A5jDr+ezOjOD5/GCg1IqdMxjp3tN74lV5hG875JnMvsgTCI3ZkVwXlP4hVv6m2g2q5YkZ8d2vK2u0m3xv7u7m+Q4o+3g==";

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