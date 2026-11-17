import { Metadata } from "next";
import { ChallengeBattlePlayer } from "@/components/challenges/ChallengeBattlePlayer";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `معركة التحدي (${code}) • أكاديمية المحترف`,
    description: "انضم إلى معركة 1v1 وتحدَّ زميلك في 5 أسئلة اختيار من متعدد سريعة.",
  };
}

export default async function ChallengeBattlePage({ params }: Props) {
  const { code } = await params;

  return (
    <div className="min-h-screen bg-[#070D18] text-white py-6 px-3 sm:px-6">
      <ChallengeBattlePlayer code={code} />
    </div>
  );
}
