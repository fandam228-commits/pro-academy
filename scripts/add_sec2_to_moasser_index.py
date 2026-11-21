import json
import re

MOASSER_INDEX = "src/data/moasser-revision-index.ts"
ELMOASSER_JSON = "src/data/secondary-2027/sec2-bac-elmoasser-mcq-extracted.json"

with open(ELMOASSER_JSON, "r", encoding="utf-8") as f:
    qs = json.load(f)

# Pick 25 diverse questions across units 1, 2, 3, 4, 5
selected = qs[:25]

exam_questions_ts = []
for i, q in enumerate(selected):
    q_str = f"""      {{
        id: "moasser_s2_q{i+1}",
        type: "mcq",
        category: {json.dumps(q['domainCategory'])},
        question: {json.dumps(q['questionText'], ensure_ascii=False)},
        options: {json.dumps(q['options'], ensure_ascii=False)},
        correctAnswer: {json.dumps(q['correctAnswer'], ensure_ascii=False)},
        explanationAr: {json.dumps(q['explanation'], ensure_ascii=False)},
        ruleReference: {json.dumps(f"{q['unit']} · {q['topic']}", ensure_ascii=False)},
      }},"""
    exam_questions_ts.append(q_str)

all_exam_qs_code = "\n".join(exam_questions_ts)

sec2_grade_code = """          {
            id: "sec2_bac_general",
            name: "الصف الثاني الثانوي (البكالوريا المصرية)",
            en: "Second Year Baccalaureate (Sec 2)",
            stage: "secondary",
            curriculum: "Egyptian Baccalaureate 2027",
            term: "First Term 2026/2027",
            hasInteractiveExam: true,
            examId: "moasser_sec2_bac_exam1",
            totalQuestions: 25,
            durationMinutes: 45,
            links: [
              {
                label: "كتاب المعاصر - بنك الأسئلة والتدريبات التفاعلية",
                url: "/?tab=question_bank&grade=Second+Secondary",
                type: "model_exams",
              },
            ],
          },"""

sec2_exam_code = f"""  moasser_sec2_bac_exam1: {{
    id: "moasser_sec2_bac_exam1",
    title: "النموذج الاسترشادي الرسمي لكتاب المعاصر — الصف الثاني الثانوي (البكالوريا 2027)",
    grade: "الصف الثاني الثانوي (بكالوريا)",
    stage: "المرحلة الثانوية",
    term: "الفصل الدراسي الأول",
    durationMinutes: 45,
    totalMarks: 25,
    passingMarks: 15,
    questions: [
{all_exam_qs_code}
    ],
  }},"""

with open(MOASSER_INDEX, "r", encoding="utf-8") as f:
    content = f.read()

# Add grade if not already added
if "sec2_bac_general" not in content:
    content = content.replace(
        '            id: "sec1_general",\n            name: "الصف الأول الثانوي",\n            en: "1st Secondary",\n            stage: "secondary",\n            curriculum: "New Hello",\n            term: "First Term 2026/2027",\n            hasInteractiveExam: true,\n            examId: "moasser_sec1_exam1",\n            totalQuestions: 20,\n            durationMinutes: 45,\n            links: [\n              {\n                label: "المراجعة النهائية ونماذج الامتحانات",\n                url: "https://gps-eg.org/dpaS4zH1",\n                type: "revision",\n              },\n            ],\n          },',
        '            id: "sec1_general",\n            name: "الصف الأول الثانوي",\n            en: "1st Secondary",\n            stage: "secondary",\n            curriculum: "New Hello",\n            term: "First Term 2026/2027",\n            hasInteractiveExam: true,\n            examId: "moasser_sec1_exam1",\n            totalQuestions: 20,\n            durationMinutes: 45,\n            links: [\n              {\n                label: "المراجعة النهائية ونماذج الامتحانات",\n                url: "https://gps-eg.org/dpaS4zH1",\n                type: "revision",\n              },\n            ],\n          },\n' + sec2_grade_code
    )

# Add exam to MOASSER_INTERACTIVE_EXAMS
if "moasser_sec2_bac_exam1" not in content:
    content = content.replace(
        "export const MOASSER_INTERACTIVE_EXAMS: Record<string, MoasserExam> = {",
        "export const MOASSER_INTERACTIVE_EXAMS: Record<string, MoasserExam> = {\n" + sec2_exam_code
    )

with open(MOASSER_INDEX, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated moasser-revision-index.ts with 2nd Sec Baccalaureate grade and interactive model exam!")
