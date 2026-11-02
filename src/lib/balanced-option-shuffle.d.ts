export type QuestionWithOptions = {
  options: unknown;
  correctAnswer?: unknown;
  [key: string]: unknown;
};

export function shuffleOptionsBalanced<T extends QuestionWithOptions>(
  questions: T[],
  random?: () => number
): T[];
