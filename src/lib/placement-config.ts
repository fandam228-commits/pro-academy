import { db } from "@/db";
import { PLACEMENT_GRADES, type PlacementGrade } from "@/data/placement-grades";
import { sql } from "drizzle-orm";

export type VerificationStatus = "needs_review" | "verified";

export interface PlacementConfig {
  grade: PlacementGrade;
  stage: string;
  academicYear: string;
  term: string;
  curriculum: string | null;
  curriculumVersion: string;
  verificationStatus: VerificationStatus;
  sourceNote: string;
  questionCount: number;
  durationMinutes: number;
  marksPerQuestion: number;
  passPercentage: number;
  proficiencyThresholds: { developing: number; good: number; veryGood: number; excellent: number };
  topicDistribution: Array<{ topic: string; percent: number }>;
  difficultyDistribution: { Easy: number; Medium: number; Hard: number };
  isPublished: boolean;
  updatedAt?: string;
}

const DEFAULT_THRESHOLDS = { developing: 40, good: 60, veryGood: 75, excellent: 90 };
const DEFAULT_DIFFICULTY = { Easy: 30, Medium: 50, Hard: 20 };

export async function ensurePlacementConfigTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS placement_test_configs (
      grade TEXT PRIMARY KEY,
      stage TEXT NOT NULL,
      academic_year TEXT NOT NULL DEFAULT 'Needs confirmation',
      term TEXT NOT NULL DEFAULT 'First',
      curriculum TEXT,
      curriculum_version TEXT NOT NULL DEFAULT 'Development sample',
      verification_status TEXT NOT NULL DEFAULT 'needs_review',
      source_note TEXT NOT NULL DEFAULT '',
      question_count INTEGER NOT NULL DEFAULT 30,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      marks_per_question INTEGER NOT NULL DEFAULT 1,
      pass_percentage INTEGER NOT NULL DEFAULT 60,
      proficiency_thresholds JSONB NOT NULL DEFAULT '{"developing":40,"good":60,"veryGood":75,"excellent":90}'::jsonb,
      topic_distribution JSONB NOT NULL DEFAULT '[]'::jsonb,
      difficulty_distribution JSONB NOT NULL DEFAULT '{"Easy":30,"Medium":50,"Hard":20}'::jsonb,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      updated_by TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const item of PLACEMENT_GRADES) {
    await db.execute(sql`
      INSERT INTO placement_test_configs (grade, stage)
      VALUES (${item.grade}, ${item.stage})
      ON CONFLICT (grade) DO NOTHING
    `);
  }
}

function normalizeConfig(row: Record<string, unknown>): PlacementConfig {
  const thresholds = (row.proficiency_thresholds || DEFAULT_THRESHOLDS) as PlacementConfig["proficiencyThresholds"];
  const difficulty = (row.difficulty_distribution || DEFAULT_DIFFICULTY) as PlacementConfig["difficultyDistribution"];
  return {
    grade: String(row.grade) as PlacementGrade,
    stage: String(row.stage),
    academicYear: String(row.academic_year || "Needs confirmation"),
    term: String(row.term || "First"),
    curriculum: row.curriculum ? String(row.curriculum) : null,
    curriculumVersion: String(row.curriculum_version || "Development sample"),
    verificationStatus: row.verification_status === "verified" ? "verified" : "needs_review",
    sourceNote: String(row.source_note || ""),
    questionCount: Number(row.question_count) || 30,
    durationMinutes: Number(row.duration_minutes) || 0,
    marksPerQuestion: Number(row.marks_per_question) || 1,
    passPercentage: Number(row.pass_percentage) || 0,
    proficiencyThresholds: thresholds,
    topicDistribution: (row.topic_distribution || []) as PlacementConfig["topicDistribution"],
    difficultyDistribution: difficulty,
    isPublished: row.is_published === true,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function getPlacementConfigs(): Promise<PlacementConfig[]> {
  await ensurePlacementConfigTable();
  const result = await db.execute(sql`SELECT * FROM placement_test_configs ORDER BY grade`);
  const byGrade = new Map<string, PlacementConfig>();
  for (const row of result.rows as Record<string, unknown>[]) {
    const config = normalizeConfig(row);
    byGrade.set(config.grade, config);
  }
  return PLACEMENT_GRADES.map((item) => byGrade.get(item.grade)).filter((item): item is PlacementConfig => Boolean(item));
}

export async function getPlacementConfig(grade: PlacementGrade): Promise<PlacementConfig | null> {
  const configs = await getPlacementConfigs();
  return configs.find((config) => config.grade === grade) || null;
}

export async function savePlacementConfig(
  config: PlacementConfig,
  updatedBy: string
) {
  await ensurePlacementConfigTable();
  await db.execute(sql`
    UPDATE placement_test_configs SET
      academic_year = ${config.academicYear},
      term = ${config.term},
      curriculum = ${config.curriculum},
      curriculum_version = ${config.curriculumVersion},
      verification_status = ${config.verificationStatus},
      source_note = ${config.sourceNote},
      question_count = ${config.questionCount},
      duration_minutes = ${config.durationMinutes},
      marks_per_question = ${config.marksPerQuestion},
      pass_percentage = ${config.passPercentage},
      proficiency_thresholds = ${JSON.stringify(config.proficiencyThresholds)}::jsonb,
      topic_distribution = ${JSON.stringify(config.topicDistribution)}::jsonb,
      difficulty_distribution = ${JSON.stringify(config.difficultyDistribution)}::jsonb,
      is_published = ${config.isPublished},
      updated_by = ${updatedBy},
      updated_at = CURRENT_TIMESTAMP
    WHERE grade = ${config.grade}
  `);
}

export function defaultThresholds() {
  return { ...DEFAULT_THRESHOLDS };
}

export function defaultDifficultyDistribution() {
  return { ...DEFAULT_DIFFICULTY };
}
