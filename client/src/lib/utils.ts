import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} Mi`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)} Mil`;
  }
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const LOTTERY_COLORS: Record<string, string> = {
  "megasena":        "#16a34a",
  "lotofacil":       "#7c3aed",
  "quina":           "#ea580c",
  "lotomania":       "#0ea5e9",
  "timemania":       "#dc2626",
  "duplasena":       "#d97706",
  "diadesorte":      "#db2777",
  "supersete":       "#059669",
  "maismilionaria":  "#6366f1",
  // legacy slugs
  "mega-sena":       "#16a34a",
  "dupla-sena":      "#d97706",
  "dia-de-sorte":    "#db2777",
  "super-sete":      "#059669",
  "mais-milionaria": "#6366f1",
};

const LOTTERY_NAMES: Record<string, string> = {
  "megasena":        "Mega-Sena",
  "lotofacil":       "Lotofácil",
  "quina":           "Quina",
  "lotomania":       "Lotomania",
  "timemania":       "Timemania",
  "duplasena":       "Dupla Sena",
  "diadesorte":      "Dia de Sorte",
  "supersete":       "Super Sete",
  "maismilionaria":  "+Milionária",
  // legacy
  "mega-sena":       "Mega-Sena",
  "dupla-sena":      "Dupla Sena",
  "dia-de-sorte":    "Dia de Sorte",
  "super-sete":      "Super Sete",
  "mais-milionaria": "+Milionária",
};

const LOTTERY_ICONS: Record<string, string> = {
  "megasena":        "🍀",
  "lotofacil":       "🎯",
  "quina":           "🎰",
  "lotomania":       "🌀",
  "timemania":       "⚽",
  "duplasena":       "🎲",
  "diadesorte":      "🌸",
  "supersete":       "7️⃣",
  "maismilionaria":  "💎",
};

export function getLotteryColor(slug: string): string {
  return LOTTERY_COLORS[slug] ?? "#2563eb";
}

export function getLotteryName(slug: string): string {
  return LOTTERY_NAMES[slug] ?? slug;
}

export function getLotteryIcon(slug: string): string {
  return LOTTERY_ICONS[slug] ?? "🎱";
}

export function getLotteryColorLight(slug: string): string {
  const lightColors: Record<string, string> = {
    "megasena":       "#dcfce7",
    "lotofacil":      "#ede9fe",
    "quina":          "#ffedd5",
    "lotomania":      "#e0f2fe",
    "timemania":      "#fee2e2",
    "duplasena":      "#fef3c7",
    "diadesorte":     "#fce7f3",
    "supersete":      "#d1fae5",
    "maismilionaria": "#e0e7ff",
  };
  return lightColors[slug] ?? "#eff6ff";
}
