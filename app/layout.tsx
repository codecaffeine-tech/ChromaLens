import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "ChromaLens - Website Color Analyzer",
  description:
    "Extract, visualize, and remix color palettes from any website. See how your site looks with different color schemes.",
  keywords: ["color palette", "color extractor", "web design", "color analysis"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');document.documentElement.classList.add(t==='light'?'light':'dark');})()`,
          }}
        />
      </head>
      <body className="font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
