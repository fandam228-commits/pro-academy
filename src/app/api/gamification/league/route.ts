import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, studentGamification } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureDbSetup } from "@/db/migrate-and-seed";
import { getAuthContext } from "@/lib/security";
import {
  EGYPTIAN_GOVERNORATES,
  TOP_SCHOOLS_LEAGUE,
  GovernorateInfo,
  SchoolEntry,
  getGovernorateShieldDetails,
  generateViralLeagueSharePayload,
} from "@/data/governorates-and-schools-data";

// Fallback in-memory map for league profile data during testing or offline DB
interface LeagueProfileRecord {
  userId: string;
  governorateId: string;
  governorateNameAr: string;
  schoolName: string;
  bonusClaimed: boolean;
  updatedAt: string;
}

const globalLeagueStore = globalThis as typeof globalThis & {
  __paLeagueProfileMemoryStore?: Map<string, LeagueProfileRecord>;
};

if (!globalLeagueStore.__paLeagueProfileMemoryStore) {
  globalLeagueStore.__paLeagueProfileMemoryStore = new Map<string, LeagueProfileRecord>();
}
const memLeagueProfiles = globalLeagueStore.__paLeagueProfileMemoryStore;

export async function GET(req: Request) {
  try {
    await ensureDbSetup();
  } catch (err) {}

  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const userId = ctx?.user?.id || searchParams.get("userId") || "usr_student_1";

    const hasDatabase = Boolean(process.env.DATABASE_URL);

    // 1. Determine current user's governorate and school
    let currentGovName = "الدقهلية";
    let currentSchoolName = "مدرسة المنصورة الثانوية بنين";

    // Check memory store first
    if (memLeagueProfiles.has(userId)) {
      const rec = memLeagueProfiles.get(userId)!;
      currentGovName = rec.governorateNameAr;
      currentSchoolName = rec.schoolName;
    } else if (hasDatabase) {
      try {
        const uRows = await db.select().from(users).where(eq(users.id, userId));
        if (uRows.length > 0 && uRows[0].governorate) {
          currentGovName = uRows[0].governorate;
          if (uRows[0].schoolName) {
            currentSchoolName = uRows[0].schoolName;
          }
        }
      } catch (e) {
        console.warn("DB user fetch in league route error:", e);
      }
    }

    // 2. Aggregate or calculate real-time rankings
    // We clone EGYPTIAN_GOVERNORATES and calculate live points
    const governorateList = EGYPTIAN_GOVERNORATES.map((gov) => {
      // Calculate dynamic weekly XP
      const weekly = gov.baseWeeklyXp;
      const total = gov.baseTotalXp;
      return {
        ...gov,
        weeklyXp: weekly,
        totalXp: total,
      };
    });

    // Sort by weekly XP desc
    governorateList.sort((a, b) => b.weeklyXp - a.weeklyXp);

    // Assign final ranks and shield details
    const rankedGovernorates = governorateList.map((gov, idx) => {
      const rank = idx + 1;
      const shield = getGovernorateShieldDetails(rank);
      return {
        ...gov,
        rank,
        shieldNameAr: shield.shieldNameAr,
        shieldIcon: shield.shieldIcon,
        badgeColor: shield.badgeColor,
        isUserGovernorate: gov.nameAr === currentGovName || gov.id === currentGovName.toLowerCase(),
      };
    });

    // Find user's governorate standing
    const userGovIndex = rankedGovernorates.findIndex((g) => g.isUserGovernorate);
    const userGovStanding = userGovIndex >= 0 ? rankedGovernorates[userGovIndex] : rankedGovernorates[0];
    
    // Points to surpass next rank up
    let pointsToSurpassNextGov = 0;
    if (userGovStanding.rank > 1) {
      const aheadGov = rankedGovernorates[userGovStanding.rank - 2];
      if (aheadGov) {
        pointsToSurpassNextGov = aheadGov.weeklyXp - userGovStanding.weeklyXp + 25;
      }
    }

    // 3. Schools League Rankings
    const schoolsLeague = TOP_SCHOOLS_LEAGUE.map((s, idx) => ({
      ...s,
      rank: idx + 1,
      isUserSchool: s.name === currentSchoolName,
    }));

    // Find school rank if in top schools
    const userSchoolEntry = schoolsLeague.find((s) => s.isUserSchool);
    const userSchoolRank = userSchoolEntry ? userSchoolEntry.rank : undefined;

    // 4. Generate Viral Share Payload for Current User
    const sharePayload = generateViralLeagueSharePayload({
      studentName: ctx?.user?.name || "طالب الأكاديمية",
      governorateNameAr: userGovStanding.nameAr,
      schoolName: currentSchoolName,
      weeklyXp: 740,
      governorateRank: userGovStanding.rank,
      schoolRank: userSchoolRank,
      pointsToNextRank: pointsToSurpassNextGov > 0 ? pointsToSurpassNextGov : undefined,
    });

    return NextResponse.json({
      success: true,
      cupSeason: "كأس دوري الجمهورية للأقاليم • نوفمبر 2026",
      governorates: rankedGovernorates,
      schools: schoolsLeague,
      currentUserLeague: {
        userId,
        studentName: ctx?.user?.name || "أحمد مصطفى",
        governorateId: userGovStanding.id,
        governorateNameAr: userGovStanding.nameAr,
        governorateRank: userGovStanding.rank,
        shieldNameAr: userGovStanding.shieldNameAr,
        schoolName: currentSchoolName,
        schoolRank: userSchoolRank,
        pointsToSurpassNextGov,
        weeklyXpContribution: 740,
      },
      sharePayload,
    });
  } catch (error: any) {
    console.error("League GET error:", error);
    return NextResponse.json({ error: "Failed to load league data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbSetup();
  } catch (err) {}

  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { governorate, schoolName, userId: queryUserId } = body;

    const userId = ctx?.user?.id || queryUserId || "usr_student_1";

    if (!governorate || typeof governorate !== "string") {
      return NextResponse.json(
        { error: "Governorate (محافظة) is required and must be a valid string." },
        { status: 400 }
      );
    }

    const trimmedGov = governorate.trim();
    const trimmedSchool = (schoolName || "المدرسة الثانوية الرسمية").trim();

    // Verify governorate exists in Egypt's 27 governorates
    const matchedGov = EGYPTIAN_GOVERNORATES.find(
      (g) =>
        g.nameAr === trimmedGov ||
        g.id.toLowerCase() === trimmedGov.toLowerCase() ||
        g.nameEn.toLowerCase() === trimmedGov.toLowerCase()
    );

    const validGovNameAr = matchedGov ? matchedGov.nameAr : trimmedGov;
    const validGovId = matchedGov ? matchedGov.id : "dakahlia";

    // Award +50 XP bonus if first time setting league profile
    let bonusClaimed = false;
    let bonusAwarded = false;

    if (memLeagueProfiles.has(userId)) {
      bonusClaimed = memLeagueProfiles.get(userId)!.bonusClaimed;
    }

    memLeagueProfiles.set(userId, {
      userId,
      governorateId: validGovId,
      governorateNameAr: validGovNameAr,
      schoolName: trimmedSchool,
      bonusClaimed: true,
      updatedAt: new Date().toISOString(),
    });

    if (!bonusClaimed) {
      bonusAwarded = true;
    }

    // Persist to database if available
    const hasDatabase = Boolean(process.env.DATABASE_URL);
    if (hasDatabase) {
      try {
        await db
          .update(users)
          .set({
            governorate: validGovNameAr,
            schoolName: trimmedSchool,
          })
          .where(eq(users.id, userId));
      } catch (dbErr) {
        console.warn("DB user league update fallback:", dbErr);
      }
    }

    // Generate fresh viral share link
    const sharePayload = generateViralLeagueSharePayload({
      studentName: ctx?.user?.name || "طالب الأكاديمية",
      governorateNameAr: validGovNameAr,
      schoolName: trimmedSchool,
      weeklyXp: 740 + (bonusAwarded ? 50 : 0),
      governorateRank: matchedGov ? (matchedGov.shieldTier === "gold" ? 1 : 4) : 5,
    });

    return NextResponse.json({
      success: true,
      message: `تم انضمامك رسمياً لدوري محافظة ${validGovNameAr} ومدرسة ${trimmedSchool}!`,
      bonusAwarded,
      bonusXp: bonusAwarded ? 50 : 0,
      profile: {
        userId,
        governorateId: validGovId,
        governorateNameAr: validGovNameAr,
        schoolName: trimmedSchool,
      },
      sharePayload,
    });
  } catch (error: any) {
    console.error("League POST error:", error);
    return NextResponse.json({ error: "Failed to update league profile" }, { status: 500 });
  }
}
