import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "translation-academy-data");

const ALLOWED_FILES = [
  "SOURCE_MASTER_INDEX.xlsx",
  "LESSONS_MASTER.xlsx",
  "DICTIONARY_MASTER.xlsx",
  "QUESTIONS_MASTER.xlsx",
  "EXAMPLES_MASTER.xlsx",
  "EXTRACTION_PROGRESS.xlsx",
  "QUALITY_CONTROL_REPORT.xlsx"
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");

    if (!fileName || !ALLOWED_FILES.includes(fileName)) {
      return NextResponse.json(
        { error: "Invalid or unauthorized file requested.", allowedFiles: ALLOWED_FILES },
        { status: 400 }
      );
    }

    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `File ${fileName} not found on server.` }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Download Master Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
