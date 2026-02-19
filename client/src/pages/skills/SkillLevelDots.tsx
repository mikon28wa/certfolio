import { LEVEL_BAR_COLORS } from "./constants";

export function SkillLevelDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            i < level
              ? LEVEL_BAR_COLORS[level] || "bg-primary"
              : "bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}
