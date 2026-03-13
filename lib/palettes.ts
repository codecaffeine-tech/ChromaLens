import type { PresetPalette } from "@/types";

export const PRESET_PALETTES: PresetPalette[] = [
  {
    id: "linear",
    name: "Linear",
    description: "Modern SaaS dark — indigo & slate",
    colors: {
      primary: "#5B5BD6",
      secondary: "#8B8BF5",
      background: "#0F0F13",
      surface: "#1A1A2E",
      text: "#EDEDED",
      accent: "#7C7CF8",
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Pure minimal — black, white & electric blue",
    colors: {
      primary: "#FFFFFF",
      secondary: "#888888",
      background: "#000000",
      surface: "#111111",
      text: "#FFFFFF",
      accent: "#0070F3",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep dark with soft violet glow",
    colors: {
      primary: "#818CF8",
      secondary: "#6366F1",
      background: "#0A0A18",
      surface: "#12122A",
      text: "#E2E8F0",
      accent: "#A78BFA",
    },
  },
  {
    id: "bento",
    name: "Bento",
    description: "Warm Japanese minimal — cream & terra cotta",
    colors: {
      primary: "#2B2B2B",
      secondary: "#6B6B6B",
      background: "#F7F3EE",
      surface: "#EDEAE4",
      text: "#1A1A1A",
      accent: "#E76F51",
    },
  },
  {
    id: "creme",
    name: "Crème",
    description: "Soft warm minimal — off-white & amber",
    colors: {
      primary: "#1C1917",
      secondary: "#78716C",
      background: "#FAFAF7",
      surface: "#F2EFE8",
      text: "#1C1917",
      accent: "#D97706",
    },
  },
  {
    id: "nord",
    name: "Nord",
    description: "Arctic, north-bluish color palette",
    colors: {
      primary: "#5E81AC",
      secondary: "#81A1C1",
      background: "#2E3440",
      surface: "#3B4252",
      text: "#ECEFF4",
      accent: "#88C0D0",
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin Mocha",
    description: "Soothing pastel dark theme",
    colors: {
      primary: "#CBA6F7",
      secondary: "#89B4FA",
      background: "#1E1E2E",
      surface: "#313244",
      text: "#CDD6F4",
      accent: "#F38BA8",
    },
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    description: "All natural pine, faux fur and soho vibes",
    colors: {
      primary: "#C4A7E7",
      secondary: "#9CCFD8",
      background: "#191724",
      surface: "#1F1D2E",
      text: "#E0DEF4",
      accent: "#EB6F92",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    description: "Classic dark theme with vivid accents",
    colors: {
      primary: "#BD93F9",
      secondary: "#6272A4",
      background: "#282A36",
      surface: "#44475A",
      text: "#F8F8F2",
      accent: "#FF79C6",
    },
  },
  {
    id: "everforest",
    name: "Everforest",
    description: "Muted green nature-inspired palette",
    colors: {
      primary: "#A7C080",
      secondary: "#83C092",
      background: "#2D353B",
      surface: "#343F44",
      text: "#D3C6AA",
      accent: "#E67E80",
    },
  },
];

export function getPaletteById(id: string): PresetPalette | undefined {
  return PRESET_PALETTES.find((p) => p.id === id);
}
