import type { PresetPalette } from "@/types";

export const PRESET_PALETTES: PresetPalette[] = [
  {
    id: "material-blue",
    name: "Material Blue",
    description: "Google Material Design - Blue theme",
    colors: {
      primary: "#1976D2",
      secondary: "#424242",
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#212121",
      accent: "#FF4081",
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
    id: "solarized-light",
    name: "Solarized Light",
    description: "Precision colors for machines and people",
    colors: {
      primary: "#268BD2",
      secondary: "#2AA198",
      background: "#FDF6E3",
      surface: "#EEE8D5",
      text: "#657B83",
      accent: "#CB4B16",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    description: "Dark theme for code and UI",
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
    id: "catppuccin",
    name: "Catppuccin Mocha",
    description: "Soothing pastel theme",
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
    name: "Rose Pine",
    description: "All natural pine, faux fur and a bit of soho vibes",
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
    id: "everforest",
    name: "Everforest",
    description: "Green nature-inspired palette",
    colors: {
      primary: "#A7C080",
      secondary: "#83C092",
      background: "#2D353B",
      surface: "#343F44",
      text: "#D3C6AA",
      accent: "#E67E80",
    },
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    description: "Retro groove color scheme",
    colors: {
      primary: "#FABD2F",
      secondary: "#83A598",
      background: "#282828",
      surface: "#3C3836",
      text: "#EBDBB2",
      accent: "#FB4934",
    },
  },
  {
    id: "pastel-spring",
    name: "Pastel Spring",
    description: "Soft, light pastel colors",
    colors: {
      primary: "#FFB3BA",
      secondary: "#FFDFBA",
      background: "#FFFDE7",
      surface: "#FFFFFF",
      text: "#5D4037",
      accent: "#BAE1FF",
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Maximum accessibility contrast",
    colors: {
      primary: "#0000FF",
      secondary: "#008000",
      background: "#FFFFFF",
      surface: "#F5F5F5",
      text: "#000000",
      accent: "#FF0000",
    },
  },
];

export function getPaletteById(id: string): PresetPalette | undefined {
  return PRESET_PALETTES.find((p) => p.id === id);
}
