import QUESTION_BANK_2027_MASTER from "./question-bank-2027-master.json";
import { FIRST_SECONDARY_ADMIN_EXAMS_2025 } from "./first-secondary-district-exams-2025";

/** Complete bundled fallback bank used when the database has not synced yet. */
export const QUESTION_BANK_MASTER = [
  ...(QUESTION_BANK_2027_MASTER as any[]),
  ...FIRST_SECONDARY_ADMIN_EXAMS_2025,
];

