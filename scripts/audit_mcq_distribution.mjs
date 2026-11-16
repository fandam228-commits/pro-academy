import fs from 'fs';
import path from 'path';

function inspectQuestions(name, questions) {
  console.log('=== ' + name + ' (Total: ' + questions.length + ') ===');
  let over4Options = 0;
  let under4Options = 0;
  let exact4Options = 0;
  const dist = { A: 0, B: 0, C: 0, D: 0, Other: 0 };
  let prevKey = null;
  let currentStreak = 0;
  let maxStreak = 0;
  let streakDetails = [];

  questions.forEach((q, idx) => {
    const opts = q.options;
    if (Array.isArray(opts)) {
      if (opts.length > 4) over4Options++;
      else if (opts.length < 4) under4Options++;
      else exact4Options++;
    }

    // Determine correct key
    let key = 'Other';
    if (q.questionType === 'mcq' || q.questionType === 'comprehension' || !q.questionType) {
      const corr = q.correctAnswer ?? q.correct;
      if (typeof corr === 'number' && corr >= 0 && corr < 4) {
        key = ['A', 'B', 'C', 'D'][corr];
      } else if (typeof corr === 'string') {
        const c = corr.trim().toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(c)) {
          key = c;
        } else if (Array.isArray(opts)) {
          const optIdx = opts.findIndex(o => {
            const str = typeof o === 'object' ? (o.text || o.label) : String(o);
            return str.trim().toLowerCase() === corr.trim().toLowerCase();
          });
          if (optIdx >= 0 && optIdx < 4) {
            key = ['A', 'B', 'C', 'D'][optIdx];
          }
        }
      }
      dist[key] = (dist[key] || 0) + 1;

      if (key !== 'Other') {
        if (key === prevKey) {
          currentStreak++;
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
            streakDetails.push({ key, streak: currentStreak, index: idx });
          }
        } else {
          currentStreak = 1;
        }
        prevKey = key;
      }
    }
  });

  console.log('Options count check: Exact 4:', exact4Options, '| Over 4 (>4):', over4Options, '| Under 4 (<4):', under4Options);
  console.log('Answer distribution:', JSON.stringify(dist));
  console.log('Max streak of identical consecutive answers:', maxStreak);
  if (streakDetails.length > 0) {
    console.log('Longest streak info:', streakDetails.slice(-3));
  }
  console.log('--------------------------------------------------');
}

const files = [
  './src/data/question-bank-2027-master.json',
  './src/data/training-center-extracted-questions.json'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    inspectQuestions(f, data);
  } else {
    console.log('File not found:', f);
  }
}
