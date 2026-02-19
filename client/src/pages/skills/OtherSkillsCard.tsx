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

interface OtherSkillsCardProps {
  skills: Skill[];
  onSelectSkill: (skillName: string) => void;
}

export function OtherSkillsCard({ skills, onSelectSkill }: OtherSkillsCardProps) {
  if (skills.length === 0) return null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle>Weitere Skills</CardTitle>
        <CardDescription>{skills.length} zusätzliche Kompetenzen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => {
            const level = Math.min(5, skill.level);
            const progress = getLevelProgress(level, skill.totalPoints);
            return (
              <button
                key={skill.id}
                onClick={() => onSelectSkill(skill.skillName)}
                className="text-left p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{skill.skillName}</span>
                  <div className="flex items-center gap-1.5">
                    <SkillLevelDots level={level} />
                    <Badge variant="outline" className="text-xs">
                      {level}
                    </Badge>
                  </div>
                </div>
                <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${LEVEL_BAR_COLORS[level]}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {skill.certificateCount} Nachweis{skill.certificateCount !== 1 ? "e" : ""}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
