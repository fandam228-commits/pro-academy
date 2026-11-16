import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

function auditDataset(label, questions) {
  let total = questions.length;
  let mcqCount = 0;
  let exact4 = 0;
  let over4 = 0;
  let under4 = 0;
  let noOptions = 0;
  const dist = { A: 0, B: 0, C: 0, D: 0, Unresolved: 0 };
  const sequence = [];

  questions.forEach((q, idx) => {
    const isMCQ = q.questionType === 'mcq' || q.questionType === 'comprehension' || (!q.questionType && Array.isArray(q.options));
    if (!isMCQ) return;
    mcqCount++;

    const opts = q.options;
    if (!Array.isArray(opts)) {
      noOptions++;
      return;
    }

    if (opts.length > 4) over4++;
    else if (opts.length === 4) exact4++;
    else under4++;

    // Resolve correct option
    const corr = q.correctAnswer ?? q.correct ?? q.modelAnswer;
    let label = null;

    if (typeof corr === 'number' && corr >= 0 && corr < opts.length) {
      label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][corr];
    } else if (typeof corr === 'string') {
      const clean = corr.trim().toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(clean)) {
        label = clean;
      } else {
        const normCorr = corr.trim().toLowerCase();
        const foundIdx = opts.findIndex(o => {
          const t = typeof o === 'object' ? (o.text || o.label) : String(o);
          return String(t).trim().toLowerCase() === normCorr;
        });
        if (foundIdx >= 0) {
          label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][foundIdx];
        }
      }
    }

    if (label && ['A', 'B', 'C', 'D'].includes(label)) {
      dist[label]++;
      sequence.push(label);
    } else {
      dist.Unresolved++;
      sequence.push('?');
    }
  });

  // Calculate streaks
  let maxStreak = 0;
  let curStreak = 0;
  let lastL = null;
  for (const l of sequence) {
    if (l !== '?' && l === lastL) {
      curStreak++;
      if (curStreak > maxStreak) maxStreak = curStreak;
    } else {
      curStreak = 1;
      lastL = l;
    }
  }

  console.log(`\n======================================================`);
  console.log(`Dataset: ${label}`);
  console.log(`Total questions: ${total} | MCQs: ${mcqCount}`);
  console.log(`Options Length: Exactly 4: ${exact4} | Over 4: ${over4} | Under 4: ${under4} | No Options: ${noOptions}`);
  console.log(`Answer Distribution:`, dist);
  if (mcqCount > 0) {
    const aPct = ((dist.A / mcqCount) * 100).toFixed(1);
    const bPct = ((dist.B / mcqCount) * 100).toFixed(1);
    const cPct = ((dist.C / mcqCount) * 100).toFixed(1);
    const dPct = ((dist.D / mcqCount) * 100).toFixed(1);
    console.log(`Percentages: A: ${aPct}% | B: ${bPct}% | C: ${cPct}% | D: ${dPct}%`);
  }
  console.log(`Max Streak of Consecutive Same Answer: ${maxStreak}`);
}

// 1. Question Bank 2027 Master
const qb2027Path = path.join(rootDir, 'src/data/question-bank-2027-master.json');
if (fs.existsSync(qb2027Path)) {
  auditDataset('2027 Master Question Bank (src/data/question-bank-2027-master.json)', JSON.parse(fs.readFileSync(qb2027Path, 'utf8')));
}

// 2. Training Center Extracted Questions
const tcPath = path.join(rootDir, 'src/data/training-center-extracted-questions.json');
if (fs.existsSync(tcPath)) {
  auditDataset('Training Center Questions (src/data/training-center-extracted-questions.json)', JSON.parse(fs.readFileSync(tcPath, 'utf8')));
}

// 3. Story World Questions
const storyFiles = ['prep3-story.json', 'sec1-story.json', 'sec2-story.json', 'sec3-story.json'];
const allStoryMCQs = [];
for (const sf of storyFiles) {
  const sp = path.join(rootDir, 'src/data/story-world', sf);
  if (fs.existsSync(sp)) {
    const d = JSON.parse(fs.readFileSync(sp, 'utf8'));
    (d.chapters || []).forEach(c => {
      if (Array.isArray(c.mcqQuestions)) allStoryMCQs.push(...c.mcqQuestions);
    });
  }
}
auditDataset('Story World MCQs', allStoryMCQs);
