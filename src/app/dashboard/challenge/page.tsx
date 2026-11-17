import { Metadata } from "next";
import { FriendChallengeWorkspace } from "@/components/challenges/FriendChallengeWorkspace";

export const metadata: Metadata = {
  title: "تحدي الأصدقاء 1v1 • أكاديمية المحترف",
  description:
    "تحدَّ زملاءك في 5 أسئلة اختيار من متعدد سريعة في 90 ثانية وقارن النتائج والسرعة مباشرة عبر واتساب.",
};

export default function ChallengePage() {
  return (
    <div className="min-h-screen bg-[#070D18] text-white py-6 px-3 sm:px-6">
      <FriendChallengeWorkspace />
    </div>
  );
}
