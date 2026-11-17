import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { seedDatabase } from "./seed-data";
import { seedFirstSecondaryUnits12Review } from "./seed-unit12-review";
import { seedBaccalaureateModelA2027 } from "./seed-baccalaureate-model-a-2027";
import { seedSec2BacComplete } from "./seed-sec2-bac-complete";
import { pool } from "./index";

async function main() {
  console.log("Seeding core database entities...");
  await seedDatabase();
  console.log("Seeding First Secondary Units 1-2 review question bank...");
  await seedFirstSecondaryUnits12Review();
  console.log("Seeding Baccalaureate Model A 2027 question bank...");
  await seedBaccalaureateModelA2027();
  console.log("Seeding Second Year Baccalaureate Complete Curriculum (Giants 2027)...");
  await seedSec2BacComplete();
  console.log("All seeding completed successfully!");
}

main()
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
