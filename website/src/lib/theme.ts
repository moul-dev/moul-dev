export interface ThemeColor {
  name: string;
  id: string;
  hue: number;
  chroma: number;
  colorClass: string;
  checkmarkColor: string;
}

export const THEME_COLORS: ThemeColor[] = [
  {
    name: "Amber",
    id: "amber",
    hue: 55,
    chroma: 1,
    colorClass: "oklch(0.65 0.16 55)",
    checkmarkColor: "text-zinc-950",
  },
  {
    name: "Indigo",
    id: "indigo",
    hue: 250,
    chroma: 1,
    colorClass: "oklch(0.60 0.20 250)",
    checkmarkColor: "text-white",
  },
  {
    name: "Violet",
    id: "violet",
    hue: 290,
    chroma: 1,
    colorClass: "oklch(0.60 0.20 290)",
    checkmarkColor: "text-white",
  },
  {
    name: "Pink",
    id: "pink",
    hue: 340,
    chroma: 1,
    colorClass: "oklch(0.60 0.20 340)",
    checkmarkColor: "text-white",
  },
  {
    name: "Ruby",
    id: "ruby",
    hue: 25,
    chroma: 1,
    colorClass: "oklch(0.60 0.20 25)",
    checkmarkColor: "text-white",
  },
  {
    name: "Gold",
    id: "gold",
    hue: 85,
    chroma: 1,
    colorClass: "oklch(0.65 0.14 85)",
    checkmarkColor: "text-zinc-950",
  },
  {
    name: "Emerald",
    id: "emerald",
    hue: 145,
    chroma: 1,
    colorClass: "oklch(0.60 0.18 145)",
    checkmarkColor: "text-white",
  },
  {
    name: "Teal",
    id: "teal",
    hue: 185,
    chroma: 1,
    colorClass: "oklch(0.60 0.16 185)",
    checkmarkColor: "text-white",
  },
  {
    name: "Sky",
    id: "sky",
    hue: 215,
    chroma: 1,
    colorClass: "oklch(0.60 0.18 215)",
    checkmarkColor: "text-white",
  },
  {
    name: "Slate",
    id: "slate",
    hue: 250,
    chroma: 0,
    colorClass: "oklch(0.60 0.00 250)",
    checkmarkColor: "text-white",
  },
];

export function getRandomThemeColor(): ThemeColor {
  const randomIndex = Math.floor(Math.random() * THEME_COLORS.length);
  return THEME_COLORS[randomIndex]!;
}

export const themeInitScript = `(function(){try{var c=${JSON.stringify(
  THEME_COLORS.map(({ id, hue, chroma }) => ({ id, hue, chroma })),
)};var r=c[Math.floor(Math.random()*c.length)];document.documentElement.style.setProperty('--brand-hue',String(r.hue));document.documentElement.style.setProperty('--brand-chroma-multiplier',String(r.chroma));document.documentElement.setAttribute('data-theme-color',r.id);}catch(e){}})();`;
