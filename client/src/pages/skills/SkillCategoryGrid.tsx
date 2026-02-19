import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEVEL_BAR_COLORS, getLevelProgress } from "./constants";
import { SkillLevelDots } from "./SkillLevelDots";

interface Skill {
  id: number;
  skillName: string;
  skillCategory: string | null;
  level: number;
  totalPoints: number;
  certificateCount: number;
}

interface SkillCategoryGridProps {
  skillsByCategory: Record<string, Skill[]>;
  onSelectSkill: (skillName: string) => void;
}

export function SkillCategoryGrid({ skillsByCategory, onSelectSkill }: SkillCategoryGridProps) {
  if (Object.keys(skillsByCategory).length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Skills nach Kategorie</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <Card key={category} className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{category}</CardTitle>
              <CardDescription>
                {categorySkills.length} Skill{categorySkills.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categorySkills.map((skill) => {
                const level = Math.min(5, skill.level);
                const progress = getLevelProgress(level, skill.totalPoints);
                return (
                  <button
                    key={skill.id}
                    onClick={() => onSelectSkill(skill.skillName)}
                    className="w-full text-left space-y-1.5 p-2 rounded hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{skill.skillName}</span>
                      <div className="flex items-center gap-2">
                        <SkillLevelDots level={level} />
                        <Badge variant="secondary" className="text-xs">
                          Lvl {level}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${LEVEL_BAR_COLORS[level]}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
