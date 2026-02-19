export const LEVEL_LABELS = ["Keine Erfahrung", "Grundkenntnisse", "Fortgeschritten", "Kompetent", "Experte", "Meister"];

export const LEVEL_COLORS = [
  "text-muted-foreground",
  "text-blue-400",
  "text-cyan-400",
  "text-emerald-400",
  "text-amber-400",
  "text-rose-400",
];

export const LEVEL_BAR_COLORS = [
  "bg-muted",
  "bg-blue-500/80",
  "bg-cyan-500/80",
  "bg-emerald-500/80",
  "bg-amber-500/80",
  "bg-rose-500/80",
];

export function getLevelProgress(level: number, totalPoints: number): number {
  const thresholds = [0, 1, 3, 6, 10, 15];
  if (level >= 5) return 100;
  const currentThreshold = thresholds[level] || 0;
  const nextThreshold = thresholds[level + 1] || 15;
  const range = nextThreshold - currentThreshold;
  const progress = totalPoints - currentThreshold;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}
