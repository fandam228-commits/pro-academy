export function withHomeworkSubmissionLock<TTransaction, TResult>(
  tx: TTransaction,
  scope: { homeworkId: string; studentId: string },
  callback: (transaction: TTransaction) => Promise<TResult>,
): Promise<TResult>;
