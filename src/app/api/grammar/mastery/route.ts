import { db } from "@/db";
import { getAuthContext } from "@/lib/security";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const tableSql = sql`
  CREATE TABLE IF NOT EXISTS grammar_mastery (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    stage TEXT NOT NULL,
    grade TEXT NOT NULL,
    curriculum TEXT NOT NULL,
    term TEXT NOT NULL,
    unit TEXT NOT NULL,
    grammar_topic TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    total_answered INTEGER NOT NULL DEFAULT 0,
    last_score INTEGER NOT NULL DEFAULT 0,
    last_total INTEGER NOT NULL DEFAULT 0,
    mastery_percent INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Needs Review',
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(student_id, stage, grade, curriculum, term, unit, grammar_topic)
  );
  CREATE INDEX IF NOT EXISTS idx_grammar_mastery_student ON grammar_mastery(student_id);
  CREATE INDEX IF NOT EXISTS idx_grammar_mastery_scope ON grammar_mastery(stage, grade, curriculum, term, unit, grammar_topic);
`;

async function ensureMasteryTable() {
  await db.execute(tableSql);
  await db.execute(sql`ALTER TABLE grammar_mastery ADD COLUMN IF NOT EXISTS total_answered INTEGER NOT NULL DEFAULT 0`);
}

export async function GET(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  await ensureMasteryTable();
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const grade = searchParams.get("grade");
  const curriculum = searchParams.get("curriculum");
  const term = searchParams.get("term");
  const unit = searchParams.get("unit");
  const grammarTopic = searchParams.get("grammarTopic");

  const conditions = [
    sql`student_id = ${ctx.user.id}`,
    ...(stage ? [sql`stage = ${stage}`] : []),
    ...(grade ? [sql`grade = ${grade}`] : []),
    ...(curriculum ? [sql`curriculum = ${curriculum}`] : []),
    ...(term ? [sql`term = ${term}`] : []),
    ...(unit ? [sql`unit = ${unit}`] : []),
    ...(grammarTopic ? [sql`grammar_topic = ${grammarTopic}`] : []),
  ];

  const result = await db.execute(sql`
    SELECT id, stage, grade, curriculum, term, unit, grammar_topic AS "grammarTopic",
           attempts, correct, total_answered AS "totalAnswered", last_score AS "lastScore", last_total AS "lastTotal",
           mastery_percent AS "masteryPercent", status, last_attempt_at AS "lastAttemptAt"
    FROM grammar_mastery
    WHERE ${sql.join(conditions, sql` AND `)}
    ORDER BY mastery_percent ASC, last_attempt_at DESC
  `);

  return NextResponse.json({ mastery: result.rows });
}

export async function POST(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.user.role !== "student") return NextResponse.json({ error: "Students only" }, { status: 403 });

  const body = await req.json();
  const required = ["stage", "grade", "curriculum", "term", "unit", "grammarTopic", "score", "total"];
  if (required.some((key) => body[key] === undefined || body[key] === null || body[key] === "")) {
    return NextResponse.json({ error: "Complete grammar scope and result are required." }, { status: 400 });
  }

  const score = Math.max(0, Number(body.score) || 0);
  const total = Math.max(1, Number(body.total) || 1);
  const percent = Math.round((score / total) * 100);

  let status = "Needs Review";
  if (percent >= 90) status = "Mastered";
  else if (percent >= 70) status = "Good";
  else if (percent >= 50) status = "Practice More";

  await ensureMasteryTable();

  await db.execute(sql`
    INSERT INTO grammar_mastery
      (id, student_id, stage, grade, curriculum, term, unit, grammar_topic,
       attempts, correct, total_answered, last_score, last_total, mastery_percent, status, last_attempt_at)
    VALUES
      (${`gm_${Date.now()}_${Math.random().toString(36).slice(2,8)}`},
       ${ctx.user.id}, ${String(body.stage)}, ${String(body.grade)}, ${String(body.curriculum)},
       ${String(body.term)}, ${String(body.unit)}, ${String(body.grammarTopic)},
       1, ${score}, ${total}, ${score}, ${total}, ${percent}, ${status}, CURRENT_TIMESTAMP)
    ON CONFLICT (student_id, stage, grade, curriculum, term, unit, grammar_topic)
    DO UPDATE SET
      attempts = grammar_mastery.attempts + 1,
      correct = grammar_mastery.correct + EXCLUDED.correct,
      total_answered = grammar_mastery.total_answered + EXCLUDED.total_answered,
      last_score = EXCLUDED.last_score,
      last_total = EXCLUDED.last_total,
      mastery_percent = ROUND(((grammar_mastery.correct + EXCLUDED.correct)::numeric /
        NULLIF(grammar_mastery.total_answered + EXCLUDED.total_answered, 0)) * 100),
      status = CASE
        WHEN ROUND(((grammar_mastery.correct + EXCLUDED.correct)::numeric /
          NULLIF(grammar_mastery.total_answered + EXCLUDED.total_answered, 0)) * 100) >= 90 THEN 'Mastered'
        WHEN ROUND(((grammar_mastery.correct + EXCLUDED.correct)::numeric /
          NULLIF(grammar_mastery.total_answered + EXCLUDED.total_answered, 0)) * 100) >= 70 THEN 'Good'
        WHEN ROUND(((grammar_mastery.correct + EXCLUDED.correct)::numeric /
          NULLIF(grammar_mastery.total_answered + EXCLUDED.total_answered, 0)) * 100) >= 50 THEN 'Practice More'
        ELSE 'Needs Review'
      END,
      last_attempt_at = CURRENT_TIMESTAMP
  `);

  return NextResponse.json({ success: true, masteryPercent: percent, status });
}
