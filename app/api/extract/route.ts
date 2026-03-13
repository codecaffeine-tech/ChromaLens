import { NextRequest, NextResponse } from "next/server";
import { extractColorsFromUrl } from "@/lib/colorExtractor";
import { normalizeUrl } from "@/lib/colorUtils";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url.trim());

    // Basic URL validation
    try {
      const parsed = new URL(normalizedUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json(
          { error: "Only HTTP and HTTPS URLs are supported" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const result = await extractColorsFromUrl(normalizedUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Color extraction error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to extract colors";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
