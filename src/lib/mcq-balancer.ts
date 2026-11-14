export {
  LABELS,
  generateControlledBalancedSequence,
  resolveQuestionCorrectOption,
  rebalanceQuestion,
  rebalanceQuestionSet,
  verifyQuestionIntegrity,
} from "./mcq-balancer.mjs";

export type OptionLabel = "A" | "B" | "C" | "D";
