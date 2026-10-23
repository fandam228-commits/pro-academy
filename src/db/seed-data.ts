import crypto from "crypto";
import { db } from "./index";
import {
  users,
  courses,
  units,
  lessons,
  quizzes,
  questions,
  questionBank,
  enrollments,
  certificates,
  payments,
  activationCodes,
  notifications,
  parentLinks,
  blogs,
  liveChat,
  studyPlanner,
  affiliates,
  pdfDocuments,
} from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/security";

export async function seedDatabase() {
  try {
    if (process.env.NODE_ENV === "production") {
      const existingAdmins = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
      if (existingAdmins.length > 0) {
        console.info("Production administrator exists; skipping legacy demo seed data.");
        return;
      }

      const initialAdminName = process.env.INITIAL_ADMIN_NAME?.trim();
      const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
      const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
      if (!initialAdminName || !initialAdminEmail || !initialAdminPassword) {
        console.warn("No production administrator exists. Configure INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD to bootstrap one; legacy demo seed data is disabled.");
        return;
      }
      if (initialAdminPassword.length < 16) {
        console.error("INITIAL_ADMIN_PASSWORD must be at least 16 characters; production seed data was skipped.");
        return;
      }

      const existingAccount = await db.select().from(users).where(eq(users.email, initialAdminEmail)).limit(1);
      if (existingAccount.length > 0) {
        console.warn("The configured initial administrator email already belongs to an account; it was not promoted.");
        return;
      }

      await db.insert(users).values({
        id: crypto.randomUUID(),
        name: initialAdminName,
        email: initialAdminEmail,
        password: hashPassword(initialAdminPassword),
        role: "admin",
        preferredLang: "ar",
      });
      console.info("Created the initial production administrator; legacy demo seed data was skipped.");
      return;
    }

    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded!");
      return;
    }
