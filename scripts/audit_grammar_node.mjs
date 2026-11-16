import { grammarPackages } from "../src/data/grammar-summaries-and-questions.ts";

const findings = [];
let totalQuestions = 0;
let totalOptions = 0;

for (const pkgId in grammarPackages) {
  const pkg = grammarPackages[pkgId];
  const questions = pkg.questions || [];
  totalQuestions += questions.length;

  for (const q of questions) {
    const qid = q.id;
    const stem = q.questionText || "";
    const opts = q.options || [];
    totalOptions += opts.length;

    // 1. Stem checks
    // Unspaced punctuation
    const m_unspaced = stem.match(/([a-zA-Z]{3,})([,\.?!])([a-zA-Z]{3,})/);
    if (m_unspaced && !m_unspaced[0].includes("http")) {
      findings.push({
        pkgId,
        qid,
        type: "Typography",
        field: "stem",
        snippet: m_unspaced[0],
        msg: `Missing space after punctuation '${m_unspaced[2]}'`,
      });
    }

    // Direct question ending with period instead of ?
    if (/^(Who|What|Where|When|Why|How|Which|Can|Could|Would|Will|Should|Do|Does|Did|Is|Are|Was|Were|Have|Has|Had)\b/i.test(stem.trim())) {
      if (stem.trim().endsWith(".") && !stem.includes("______") && !stem.includes(".....")) {
        findings.push({
          pkgId,
          qid,
          type: "Punctuation",
          field: "stem",
          snippet: stem.slice(-20),
          msg: "Direct question ends with period instead of '?'",
        });
      }
    }

    // 2. Options checks
    // Duplicate options
    const seen = {};
    for (let i = 0; i < opts.length; i++) {
      const opt = String(opts[i]).trim();
      const low = opt.toLowerCase();
      if (seen[low] !== undefined) {
        findings.push({
          pkgId,
          qid,
          type: "Option Integrity",
          field: `options`,
          snippet: `opt[${i}] '${opt}' vs opt[${seen[low]}] '${opts[seen[low]]}'`,
          msg: "Duplicate option detected",
        });
      }
      seen[low] = i;

      // Space before punctuation in option
      if (/\w\s+[,\.\?!;:]/.test(opt)) {
        findings.push({
          pkgId,
          qid,
          type: "Typography",
          field: `opt[${i}]`,
          snippet: opt,
          msg: "Space before punctuation mark in option",
        });
      }
    }

    // Mixed casing when all single words
    const isSingleWord = opts.every((o) => /^[a-zA-Z]+$/.test(String(o).trim()));
    if (isSingleWord && opts.length === 4) {
      const uppers = opts.map((o) => String(o).trim()[0] === String(o).trim()[0].toUpperCase());
      if (uppers.some(Boolean) && !uppers.every(Boolean)) {
        findings.push({
          pkgId,
          qid,
          type: "Option Consistency",
          field: "options",
          snippet: JSON.stringify(opts),
          msg: "Mixed casing across single-word options",
        });
      }
    }
  }
}

console.log(`Audited ${totalQuestions} Grammar questions and ${totalOptions} options.`);
console.log(`Total Grammar Package Findings: ${findings.length}`);
for (const f of findings) {
  console.log(`[${f.pkgId} / ${f.qid}] ${f.type} (${f.field}): ${f.msg}`);
  console.log(`   Snippet: ${f.snippet}`);
}
