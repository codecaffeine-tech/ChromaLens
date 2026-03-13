"use client";

import { useState, type FormEvent } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const EXAMPLE_URLS = [
  "github.com",
  "stripe.com",
  "vercel.com",
  "tailwindcss.com",
  "linear.app",
];

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g. github.com)"
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-gray-500">Try:</span>
        {EXAMPLE_URLS.map((example) => (
          <button
            key={example}
            onClick={() => {
              setUrl(example);
              onSubmit(example);
            }}
            disabled={isLoading}
            className="text-xs text-violet-400 hover:text-violet-300 disabled:text-gray-600 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
