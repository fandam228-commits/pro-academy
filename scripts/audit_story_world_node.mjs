import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const storyFiles = [
  "prep1-stories.json",
  "prep2-stories.json",
  "prep3-story.json",
  "sec1-story.json",
  "sec2-story.json",
  "sec3-story.json",
];

const findings = [];
let totalStories = 0;
let totalChapters = 0;
let totalMCQs = 0;
let totalQAs = 0;

for (const sf of storyFiles) {
  const p = path.join(rootDir, "src/data/story-world", sf);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const stories = Array.isArray(data) ? data : [data];
  totalStories += stories.length;

  for (const st of stories) {
    const sTitle = st.titleEn || sf;
    const chapters = st.chapters || [];
    totalChapters += chapters.length;

    for (const ch of chapters) {
      const chNum = ch.chapterNumber;

      // 1. Audit MCQs
      for (const q of ch.mcqQuestions || []) {
        totalMCQs++;
        const qid = q.id;
        const stem = q.questionText || "";
        const opts = q.options || [];

        // Check stem
        if (/^(Who|What|Where|When|Why|How|Which|Did|Do|Does|Was|Were|Is|Are)\b/i.test(stem.trim())) {
          if (stem.trim().endsWith(".") && !stem.includes("______") && !stem.includes(".....")) {
            findings.push({
              file: sf,
              target: `Ch${chNum} MCQ [${qid}]`,
              type: "Punctuation",
              snippet: stem.slice(-25),
              msg: "Direct question ends with period instead of '?'",
            });
          }
        }

        // Duplicate options
        const seen = {};
        for (let i = 0; i < opts.length; i++) {
          const opt = String(opts[i]).trim();
          const low = opt.toLowerCase();
          if (seen[low] !== undefined) {
            findings.push({
              file: sf,
              target: `Ch${chNum} MCQ [${qid}]`,
              type: "Option Duplicate",
              snippet: `opt[${i}] '${opt}' vs opt[${seen[low]}] '${opts[seen[low]]}'`,
              msg: "Duplicate option in Story MCQ",
            });
          }
          seen[low] = i;
        }
      }

      // 2. Audit Q&As
      for (const qa of ch.questionsAndAnswers || []) {
        totalQAs++;
        const qEn = qa.questionEn || "";
        const qAr = qa.questionAr || "";
        const aEn = qa.answerEn || "";
        const aAr = qa.answerAr || "";

        if (qEn && /^(Who|What|Where|When|Why|How|Which|Did|Do|Does|Was|Were|Is|Are)\b/i.test(qEn.trim())) {
          if (qEn.trim().endsWith(".")) {
            findings.push({
              file: sf,
              target: `Ch${chNum} QA En`,
              type: "Punctuation",
              snippet: qEn.slice(-25),
              msg: "Question ends with period instead of '?'",
            });
          }
        }

        // Check if Arabic question has English '?' instead of '؟'
        if (qAr && /[\u0600-\u06FF]+\s*\?$/.test(qAr.trim())) {
          findings.push({
            file: sf,
            target: `Ch${chNum} QA Ar`,
            type: "Arabic Typography",
            snippet: qAr.slice(-20),
            msg: "Arabic question ends with English '?' instead of '؟'",
          });
        }
      }
    }
  }
}

console.log(`Audited ${totalStories} stories, ${totalChapters} chapters, ${totalMCQs} MCQs, ${totalQAs} Q&As.`);
console.log(`Total Story World Findings: ${findings.length}`);
for (const f of findings) {
  console.log(`[${f.file}] ${f.target} - ${f.type}: ${f.msg} -> ${f.snippet}`);
}
