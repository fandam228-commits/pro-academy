import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  EGYPTIAN_GOVERNORATES,
  TOP_SCHOOLS_LEAGUE,
  getGovernorateShieldDetails,
  generateViralLeagueSharePayload,
} from "../src/data/governorates-and-schools-data.ts";

test("Inter-Governorate & Schools League Master Suite", async (t) => {
  await t.test("1. Data Integrity: All 27 Egyptian Governorates Master Registry", () => {
    assert.equal(EGYPTIAN_GOVERNORATES.length, 27, "Must contain all 27 Egyptian Governorates exactly");

    const requiredGovs = [
      "cairo", "giza", "alexandria", "dakahlia", "gharbia", "sharqia",
      "qalyubia", "menoufia", "beheira", "kafr_el_sheikh", "assiut", "sohag",
      "qena", "port_said", "ismailia", "suez", "damietta", "beni_suef",
      "fayoum", "minya", "luxor", "aswan", "red_sea", "matrouh",
      "new_valley", "north_sinai", "south_sinai"
    ];

    requiredGovs.forEach((govId) => {
      const found = EGYPTIAN_GOVERNORATES.find((g) => g.id === govId);
      assert.ok(found, `Governorate ${govId} must exist in catalog`);
      assert.ok(found.nameAr, `${govId} must have Arabic name`);
      assert.ok(found.capitalAr, `${govId} must have Arabic capital`);
      assert.ok(found.emblemEmoji, `${govId} must have an emblem emoji`);
      assert.ok(found.topSchool, `${govId} must list a top school`);
      assert.ok(found.topStudentAmbassador?.name, `${govId} must designate a top student ambassador`);
      assert.ok(found.baseWeeklyXp > 0, `${govId} must have baseline weekly XP`);
    });

    // Check specific iconic capitals
    const dakahlia = EGYPTIAN_GOVERNORATES.find((g) => g.id === "dakahlia");
    assert.equal(dakahlia?.capitalAr, "المنصورة");

    const alexandria = EGYPTIAN_GOVERNORATES.find((g) => g.id === "alexandria");
    assert.equal(alexandria?.capitalAr, "الإسكندرية");

    const assiut = EGYPTIAN_GOVERNORATES.find((g) => g.id === "assiut");
    assert.equal(assiut?.region, "upper_egypt");
  });

  await t.test("2. Data Integrity: Top Schools League Registry", () => {
    assert.ok(TOP_SCHOOLS_LEAGUE.length >= 10, "Must contain top schools ranking");

    // Check STEM schools exist
    const stemSchools = TOP_SCHOOLS_LEAGUE.filter((s) => s.type === "stem");
    assert.ok(stemSchools.length >= 4, "Must contain STEM schools in multiple governorates");

    // Check badges
    TOP_SCHOOLS_LEAGUE.forEach((school, idx) => {
      assert.equal(school.rank, idx + 1, "Schools must be ordered by rank");
      assert.ok(school.weeklyXp > 0, `${school.name} must have positive weekly XP`);
      assert.ok(school.activeStudents > 0, `${school.name} must have active students`);
      assert.ok(["platinum", "gold", "silver"].includes(school.badge), `${school.name} must have valid tier badge`);
    });
  });

  await t.test("3. National Shields & Ranks Computation", () => {
    const rank1Shield = getGovernorateShieldDetails(1);
    assert.ok(rank1Shield.shieldNameAr.includes("درع التفوق الجمهوري الذهبي"));
    assert.equal(rank1Shield.shieldIcon, "🏆");

    const rank2Shield = getGovernorateShieldDetails(2);
    assert.ok(rank2Shield.shieldNameAr.includes("درع التميز الجمهوري الفضي"));
    assert.equal(rank2Shield.shieldIcon, "🥈");

    const rank3Shield = getGovernorateShieldDetails(3);
    assert.ok(rank3Shield.shieldNameAr.includes("درع الصدارة البرونزي"));
    assert.equal(rank3Shield.shieldIcon, "🥉");

    const rank10Shield = getGovernorateShieldDetails(10);
    assert.ok(rank10Shield.shieldNameAr.includes("درع النخبة"));
  });

  await t.test("4. Viral Social & WhatsApp Payload Generator", () => {
    const payload = generateViralLeagueSharePayload({
      studentName: "كريم شريف",
      governorateNameAr: "الدقهلية",
      schoolName: "مدرسة المنصورة الثانوية بنين",
      weeklyXp: 850,
      governorateRank: 1,
      schoolRank: 3,
      pointsToNextRank: 40,
    });

    assert.ok(payload.headlineAr.includes("الدقهلية"));
    assert.ok(payload.fullMessageAr.includes("المنصورة الثانوية بنين"));
    assert.ok(payload.fullMessageAr.includes("850"));
    assert.ok(payload.whatsappUrl.startsWith("https://wa.me/?text="));
  });

  await t.test("5. Physical Files & Components Architecture Verification", () => {
    const root = process.cwd();

    // Data file
    const dataPath = path.join(root, "src/data/governorates-and-schools-data.ts");
    assert.ok(fs.existsSync(dataPath), "governorates-and-schools-data.ts must exist");

    // Route file
    const routePath = path.join(root, "src/app/api/gamification/league/route.ts");
    assert.ok(fs.existsSync(routePath), "src/app/api/gamification/league/route.ts must exist");

    // Service methods
    const serviceCode = fs.readFileSync(path.join(root, "src/lib/gamification-service.ts"), "utf-8");
    assert.ok(serviceCode.includes("fetchLeagueData"), "gamification-service must export fetchLeagueData");
    assert.ok(serviceCode.includes("updateStudentLeagueProfile"), "gamification-service must export updateStudentLeagueProfile");

    // Component integration
    const componentCode = fs.readFileSync(path.join(root, "src/components/gamification/WeeklyLeaderboardView.tsx"), "utf-8");
    assert.ok(componentCode.includes("governorates"), "WeeklyLeaderboardView must have governorates tab");
    assert.ok(componentCode.includes("schools"), "WeeklyLeaderboardView must have schools tab");
    assert.ok(componentCode.includes("showProfileModal"), "WeeklyLeaderboardView must support changing governorate/school");

    // Navbar integration
    const navbarCode = fs.readFileSync(path.join(root, "src/components/Navbar.tsx"), "utf-8");
    assert.ok(navbarCode.includes("دوري المحافظات"), "Navbar must mention governorates league");
  });
});
