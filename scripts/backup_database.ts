import { pool, assertDatabaseConfigured } from "../src/db";
import { ensureDbSetup } from "../src/db/migrate-and-seed";
import fs from "fs";
import path from "path";

async function runBackup() {
  assertDatabaseConfigured();
  console.log("Ensuring database setup and sync...");
  await ensureDbSetup();

  console.log("Connecting to database pool...");

  const schemaRes = await pool.query("SELECT current_schema()");
  const activeSchema = schemaRes.rows[0].current_schema;
  console.log(`Active schema: ${activeSchema}`);

  const tablesRes = await pool.query(
    `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = $1 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `,
    [activeSchema]
  );

  const tables: string[] = tablesRes.rows.map((r: any) => r.table_name);
  console.log(`Discovered ${tables.length} tables in schema "${activeSchema}":`);

  const backupData: Record<string, any[]> = {};
  let totalRows = 0;

  for (const table of tables) {
    try {
      const rowsRes = await pool.query(`SELECT * FROM "${activeSchema}"."${table}"`);
      const rows = rowsRes.rows || [];
      if (table === "users") {
        backupData[table] = rows.map((r: any) => {
          const { password, ...safe } = r;
          return safe;
        });
      } else {
        backupData[table] = rows;
      }
      totalRows += rows.length;
      console.log(`  ✓ Table "${table}": ${rows.length} rows`);
    } catch (e: any) {
      console.error(`  ✗ Error backing up table "${table}":`, e.message);
    }
  }

  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `backup_pre_major_upgrade_2027_${timestamp}.json`);

  const payload = {
    exportedAt: new Date().toISOString(),
    branch: "feature/pro-academy-major-upgrade-2027",
    purpose: "Pre-upgrade backup before Security Hardening, Question Bank Intelligence & Professional Story World",
    schema: activeSchema,
    tablesCount: tables.length,
    totalRows,
    tables,
    data: backupData,
  };

  fs.writeFileSync(backupFile, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`\n==============================================`);
  console.log(`Database Backup Completed Successfully!`);
  console.log(`File: ${backupFile}`);
  console.log(`Total Tables: ${tables.length} | Total Records: ${totalRows}`);
  console.log(`==============================================\n`);

  await pool.end();
}

runBackup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backup failed:", err);
    process.exit(1);
  });
