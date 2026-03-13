"use client";

import { useState } from "react";
import type { ColorExtractionResult, PresetPalette } from "@/types";
import UrlInput from "@/components/UrlInput";
import ColorPalette from "@/components/ColorPalette";
import ColorWheel from "@/components/ColorWheel";
import PaletteSelector from "@/components/PaletteSelector";
import SitePreview from "@/components/SitePreview";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

type AppState = "idle" | "loading" | "success" | "error";

export default function HomePage() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ColorExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedPalette, setSelectedPalette] = useState<PresetPalette | null>(null);
  const [activeTab, setActiveTab] = useState<"palette" | "wheel" | "preview">("palette");
  const [processedScreenshot, setProcessedScreenshot] = useState<string | null>(null);

  const handleUrlSubmit = async (url: string) => {
    setState("loading");
    setResult(null);
    setErrorMessage("");
    setSelectedPalette(null);
    setProcessedScreenshot(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.slice(0, 300));
        throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "색상 추출에 실패했습니다.");
      }

      setResult(data);
      setState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-lg font-bold">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ChromaLens</h1>
            <p className="text-xs text-gray-500 -mt-0.5">웹사이트 색상 분석기</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-3">
            웹사이트 색상을 분석하세요
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            URL만 입력하면 사이트의 색상 팔레트를 추출하고, 색상환으로 시각화하며,
            다른 테마를 적용했을 때의 모습을 미리 볼 수 있습니다.
          </p>
        </div>

        {/* URL Input */}
        <div className="mb-10">
          <UrlInput onSubmit={handleUrlSubmit} isLoading={state === "loading"} />
        </div>

        {/* Loading state */}
        {state === "loading" && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-400">웹사이트 색상을 분석하는 중...</p>
            <p className="text-gray-600 text-sm">
              최대 30초 정도 소요될 수 있습니다
            </p>
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="max-w-xl mx-auto bg-red-950/50 border border-red-800 rounded-xl p-6 text-center">
            <svg
              className="w-10 h-10 text-red-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-red-300 font-medium">{errorMessage}</p>
            <button
              onClick={() => setState("idle")}
              className="mt-4 text-sm text-red-400 hover:text-red-300"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Success state */}
        {state === "success" && result && (
          <div className="space-y-8">
            {/* Site info bar + screenshot */}
            <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50">
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: result.dominantColor }}
                />
                <span className="text-sm text-gray-300 truncate">{result.url}</span>
                <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                  {result.totalColors}개 색상 추출됨
                </span>
              </div>
              {result.screenshot && (
                <div className="border-t border-gray-700/50">
                  {activeTab === "preview" && processedScreenshot ? (
                    <BeforeAfterSlider
                      before={result.screenshot}
                      after={processedScreenshot}
                      afterLabel={selectedPalette?.name}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.screenshot}
                      alt={`${result.url} 스크린샷`}
                      className="w-full object-cover object-top max-h-[480px]"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1 max-w-sm">
              {(
                [
                  { id: "palette", label: "팔레트" },
                  { id: "wheel", label: "색상환" },
                  { id: "preview", label: "테마 미리보기" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === id
                      ? "bg-violet-600 text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "palette" && (
              <ColorPalette colors={result.colors} />
            )}

            {activeTab === "wheel" && (
              <div className="flex justify-center">
                <ColorWheel colors={result.colors} />
              </div>
            )}

            {activeTab === "preview" && (
              <div className="space-y-6">
                {selectedPalette && (
                  <SitePreview
                    originalColors={result.colors}
                    selectedPalette={selectedPalette}
                    screenshot={result.screenshot}
                    onProcessed={setProcessedScreenshot}
                  />
                )}
                <PaletteSelector
                  selectedPaletteId={selectedPalette?.id ?? null}
                  onSelect={setSelectedPalette}
                />
              </div>
            )}
          </div>
        )}

        {/* Idle state - feature cards */}
        {state === "idle" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-4">
            {[
              {
                icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
                title: "색상 추출",
                desc: "실제 브라우저로 사이트를 렌더링해 사용된 모든 색상을 수집합니다.",
              },
              {
                icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
                title: "색상환 시각화",
                desc: "추출된 색상을 색조·채도 기준으로 색상환에 배치해 표시합니다.",
              },
              {
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
                title: "테마 미리보기",
                desc: "프리셋 팔레트를 선택하면 새 색상이 적용된 사이트 모습을 미리 볼 수 있습니다.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5"
              >
                <div className="w-10 h-10 bg-violet-900/50 rounded-lg flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-violet-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={icon}
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-200 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 mt-20 py-8 text-center">
        <p className="text-sm font-semibold text-gray-400 mb-1">ChromaLens</p>
        <p className="text-xs text-gray-600 mb-3">Built for UBcare AI Hackathon</p>
        <p className="text-xs text-gray-600">
          제작자&nbsp;
          <a
            href="mailto:codecaffein@ubcare.co.kr"
            className="text-violet-500 hover:text-violet-400 transition-colors"
          >
            codecaffein@ubcare.co.kr
          </a>
        </p>
      </footer>
    </div>
  );
}
