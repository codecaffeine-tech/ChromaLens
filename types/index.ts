export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  frequency: number;
  percentage: number;
  category: "primary" | "secondary" | "background" | "text" | "accent";
}

export interface ColorExtractionResult {
  url: string;
  colors: ExtractedColor[];
  totalColors: number;
  extractedAt: string;
  dominantColor: string;
  screenshot?: string;
}

export interface PresetPalette {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
}

export interface ColorMapping {
  original: string;
  replacement: string;
  similarity: number;
}

export interface PaletteSwapResult {
  paletteId: string;
  mappings: ColorMapping[];
  previewHtml: string;
}

export type ColorFormat = "hex" | "rgb" | "hsl";
