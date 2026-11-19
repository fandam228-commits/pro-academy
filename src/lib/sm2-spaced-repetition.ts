/**
 * SuperMemo SM-2 Spaced Repetition Algorithm & Flashcard Memory Engine
 * Professional Academy — Mr. Habib El Rahman
 *
 * Implements standard SM-2 intervals, Easiness Factor (EF) adjustments,
 * and pedagogical retention curves for Egyptian curriculum students.
 */

export type SM2Rating = 1 | 2 | 3 | 4 | 5;
// 1 = Again (Blackout / Complete failure) -> review in 10 minutes
// 2 = Difficult (Incorrect response with hesitation) -> review in 1 day
// 3 = Hard (Correct response with serious effort) -> review in 1-2 days
// 4 = Good (Correct response with slight hesitation) -> review in 3-6 days
// 5 = Easy / Mastered (Instant correct recall) -> review in 7-14 days

export interface SM2State {
  repetitionCount: number; // n: number of consecutive successful recalls
  easinessFactor: number;  // EF: easiness factor, minimum 1.3, default 2.5
  intervalDays: number;    // I: interval in days until next review
  lastReviewedAt?: Date | string;
}

export interface SM2Result {
  repetitionCount: number;
  easinessFactor: number;
  intervalDays: number;
  nextReviewAt: Date;
  masteryLevel: 0 | 1 | 2 | 3; // 0=new, 1=learning, 2=familiar, 3=mastered
  xpAwarded: number;
  actionKey: "again" | "hard" | "good" | "mastered";
  messageAr: string;
}

/**
 * Calculates the next review date and parameters using SM-2
 */
export function calculateSM2(
  currentState: Partial<SM2State> = {},
  rating: SM2Rating
): SM2Result {
  let repetitionCount = currentState.repetitionCount ?? 0;
  let easinessFactor = currentState.easinessFactor ?? 2.5;
  let intervalDays = currentState.intervalDays ?? 0;

  // Enforce EF bounds
  if (easinessFactor < 1.3) easinessFactor = 1.3;

  let nextReviewAt = new Date();
  let masteryLevel: 0 | 1 | 2 | 3 = 1;
  let xpAwarded = 0;
  let actionKey: "again" | "hard" | "good" | "mastered" = "good";
  let messageAr = "";

  if (rating < 3) {
    // Failure to recall: reset repetitions, review within 10-15 minutes
    repetitionCount = 0;
    intervalDays = 0;
    nextReviewAt.setMinutes(nextReviewAt.getMinutes() + 10);
    masteryLevel = 1;
    actionKey = "again";
    messageAr = "لا بأس يا بطل! سنكرر الكلمة خلال 10 دقائق لتثبيتها في الذاكرة قصيرة المدى 🔄";
  } else {
    // Successful recall (rating >= 3)
    if (repetitionCount === 0) {
      intervalDays = 1; // 1 day
    } else if (repetitionCount === 1) {
      intervalDays = rating === 5 ? 6 : 3;
    } else {
      intervalDays = Math.round(intervalDays * easinessFactor);
    }

    repetitionCount += 1;

    // Adjust Easiness Factor according to SM-2 formula:
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easinessFactor = easinessFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    if (easinessFactor < 1.3) easinessFactor = 1.3;

    // Schedule next review date
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    if (rating === 3) {
      actionKey = "hard";
      masteryLevel = 1;
      messageAr = "جهد طيب! تمت جدولة المراجعة بعد يوم واحد لتثبيت المعنى 📚";
    } else if (rating === 4) {
      actionKey = "good";
      masteryLevel = 2;
      messageAr = `ممتاز! تمت جدولة المراجعة بعد ${intervalDays} أيام لتنشيط الذاكرة 🌟`;
    } else {
      // rating === 5: Mastered
      actionKey = "mastered";
      masteryLevel = 3;
      xpAwarded = 5;
      messageAr = `رائع جداً! أتقنت الكلمة في الذاكرة طويلة المدى وربحت +5 XP 🎉 (المراجعة بعد ${intervalDays} يوماً)`;
    }
  }

  return {
    repetitionCount,
    easinessFactor: Number(easinessFactor.toFixed(2)),
    intervalDays,
    nextReviewAt,
    masteryLevel,
    xpAwarded,
    actionKey,
    messageAr,
  };
}

/**
 * Maps legacy action string ('hard' | 'good' | 'mastered' | 'again') to SM2Rating
 */
export function mapActionToRating(action: string): SM2Rating {
  switch (action.toLowerCase()) {
    case "again":
    case "repeat":
      return 1;
    case "hard":
    case "difficult":
      return 3;
    case "good":
    case "medium":
      return 4;
    case "mastered":
    case "easy":
      return 5;
    default:
      return 4;
  }
}
