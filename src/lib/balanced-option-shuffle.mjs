/**
 * Reorders answer options for an exam without changing question or option text.
 * Correct-answer positions are balanced across each generated exam, with randomized
 * tie-breaking and distractor order. Questions with ambiguous/missing answer keys
 * are left in their original option order.
 */
export function shuffleOptionsBalanced(questions, random = Math.random) {
  const result = questions.map((question) => ({
    ...question,
    options: Array.isArray(question.options) ? [...question.options] : question.options,
  }));
  const positionCounts = [0, 0, 0, 0];

  const randomIndex = (length) => {
    if (length <= 1) return 0;
    const value = Number(random());
    const safe = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999999) : 0;
    return Math.floor(safe * length);
  };

  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = randomIndex(index + 1);
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  };

  for (const question of result) {
    if (!Array.isArray(question.options) || question.options.length !== 4) continue;
    if (typeof question.correctAnswer !== "string") continue;

    const answer = question.correctAnswer.trim().toLocaleLowerCase();
    const matchingIndexes = question.options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => typeof option === "string" && option.trim().toLocaleLowerCase() === answer);

    // Never guess when the answer key is missing or matches multiple choices.
    if (matchingIndexes.length !== 1) continue;

    const leastUsed = Math.min(...positionCounts);
    const candidatePositions = positionCounts
      .map((count, index) => ({ count, index }))
      .filter(({ count }) => count === leastUsed)
      .map(({ index }) => index);
    const targetPosition = candidatePositions[randomIndex(candidatePositions.length)];
    const correctOption = question.options[matchingIndexes[0].index];
    const distractors = shuffle(question.options.filter((_, index) => index !== matchingIndexes[0].index));
    distractors.splice(targetPosition, 0, correctOption);

    question.options = distractors;
    positionCounts[targetPosition] += 1;
  }

  return result;
}
