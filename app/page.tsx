"use client";

import { useState } from "react";
import type { ColorExtractionResult, PresetPalette } from "@/types";
import UrlInput from "@/components/UrlInput";
import ColorPalette from "@/components/ColorPalette";
import ColorWheel from "@/components/ColorWheel";
import PaletteSelector from "@/components/PaletteSelector";
import SitePreview from "@/components/SitePreview";

type AppState = "idle" | "loading" | "success" | "error";

export default function HomePage() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ColorExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedPalette, setSelectedPalette] = useState<PresetPalette | null>(null);
  const [activeTab, setActiveTab] = useState<"palette" | "wheel" | "preview">("palette");

  const handleUrlSubmit = async (url: string) => {
    setState("loading");
    setResult(null);
    setErrorMessage("");
    setSelectedPalette(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to extract colors");
      }

      setResult(data);
      setState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
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
            <p className="text-xs text-gray-500 -mt-0.5">Website Color Analyzer</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-3">
            Analyze any website&apos;s colors
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Extract color palettes, visualize on a color wheel, and see what the
            site would look like with a different theme.
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
            <p className="text-gray-400">Analyzing website colors...</p>
            <p className="text-gray-600 text-sm">
              This may take up to 30 seconds
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
              Try again
            </button>
          </div>
        )}

        {/* Success state */}
        {state === "success" && result && (
          <div className="space-y-8">
            {/* Site info bar */}
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: result.dominantColor }}
              />
              <span className="text-sm text-gray-300 truncate">{result.url}</span>
              <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                {result.totalColors} colors extracted
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1 max-w-sm">
              {(
                [
                  { id: "palette", label: "Palette" },
                  { id: "wheel", label: "Color Wheel" },
                  { id: "preview", label: "Theme Preview" },
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
                <PaletteSelector
                  selectedPaletteId={selectedPalette?.id ?? null}
                  onSelect={setSelectedPalette}
                />
                {selectedPalette && (
                  <SitePreview
                    originalColors={result.colors}
                    selectedPalette={selectedPalette}
                    siteUrl={result.url}
                  />
                )}
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
                title: "Extract Colors",
                desc: "Puppeteer scans the live website and collects every color used.",
              },
              {
                icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
                title: "Color Wheel",
                desc: "Colors plotted on a wheel by hue and saturation.",
              },
              {
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
                title: "Theme Preview",
                desc: "Pick a preset palette and preview the site with new colors.",
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

      <footer className="border-t border-gray-800 mt-20 py-6 text-center">
        <p className="text-xs text-gray-600">
          ChromaLens &mdash; Built for AI Hackathon 2026
        </p>
      </footer>
    </div>
  );
}
