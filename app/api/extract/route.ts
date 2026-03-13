import { NextRequest, NextResponse } from "next/server";
import { extractColorsFromUrl } from "@/lib/colorExtractor";
import { normalizeUrl } from "@/lib/colorUtils";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바른 JSON 형식이 아닙니다." }, { status: 400 });
  }

  try {
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL을 입력해 주세요." },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url.trim());

    try {
      const parsed = new URL(normalizedUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json(
          { error: "HTTP 또는 HTTPS URL만 지원합니다." },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다. (예: github.com)" },
        { status: 400 }
      );
    }

    const result = await extractColorsFromUrl(normalizedUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Color extraction error:", error);
    const message =
      error instanceof Error ? error.message : "색상 추출에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
