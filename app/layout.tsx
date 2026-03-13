import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="font-sans bg-gray-950 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
