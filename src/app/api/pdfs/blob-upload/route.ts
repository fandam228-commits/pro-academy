import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireRoles } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { denied } = await requireRoles(request, ["admin", "teacher"]);
  if (denied) return denied;

  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.toLowerCase().endsWith(".pdf")) {
          throw new Error("Only PDF files are allowed.");
        }
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Metadata is registered separately through the authenticated /api/pdfs endpoint.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("PDF Blob upload token error:", error);
    return NextResponse.json(
      { error: "Unable to authorize PDF upload. Check Vercel Blob configuration." },
      { status: 500 },
    );
  }
}
