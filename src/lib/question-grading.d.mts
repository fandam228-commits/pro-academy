export declare function normalizedAnswerSet(value: unknown): string[];
export declare function answersMatch(question: any, studentAnswer: unknown): boolean;
export declare function isOptionCorrect(
  opt: unknown,
  correctAnswer?: string | null,
  questionType?: string
): boolean;
