export const PLACEMENT_GRADES = [
  { grade: "First Prep", stage: "Preparatory", ar: "الصف الأول الإعدادي", en: "First Preparatory" },
  { grade: "Second Prep", stage: "Preparatory", ar: "الصف الثاني الإعدادي", en: "Second Preparatory" },
  { grade: "Third Prep", stage: "Preparatory", ar: "الصف الثالث الإعدادي", en: "Third Preparatory" },
  { grade: "First Secondary", stage: "Secondary", ar: "الصف الأول الثانوي", en: "First Secondary" },
  { grade: "Second Secondary", stage: "Secondary", ar: "الصف الثاني الثانوي", en: "Second Secondary" },
  { grade: "Third Secondary (Baccalaureate)", stage: "Secondary", ar: "الصف الثالث الثانوي", en: "Third Secondary" },
] as const;

export type PlacementGrade = (typeof PLACEMENT_GRADES)[number]["grade"];

export function getPlacementGrade(grade: string) {
  return PLACEMENT_GRADES.find((item) => item.grade === grade) ?? null;
}
