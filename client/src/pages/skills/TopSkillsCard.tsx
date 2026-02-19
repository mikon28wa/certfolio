import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, GraduationCap, ChevronRight } from "lucide-react";
import { LEVEL_LABELS, LEVEL_COLORS, LEVEL_BAR_COLORS, getLevelProgress } from "./constants";
import { SkillLevelDots } from "./SkillLevelDots";

interface Skill {
  id: number;
  skillName: string;
  skillCategory: string | null;
  level: number;
  totalPoints: number;
  certificateCount: number;
}

interface TopSkillsCardProps {
  skills: Skill[];
  onSelectSkill: (skillName: string) => void;
}

export function TopSkillsCard({ skills, onSelectSkill }: TopSkillsCardProps) {
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top Skills
        </CardTitle>
        <CardDescription>
          Deine stärksten Kompetenzen basierend auf Zertifikaten und Projekten
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {skills.map((skill) => {
          const level = Math.min(5, skill.level);
          const progress = getLevelProgress(level, skill.totalPoints);
          return (
            <div
              key={skill.id}
              className="group p-4 rounded-lg border border-border/30 bg-background/30 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => onSelectSkill(skill.skillName)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{skill.skillName}</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className={`${LEVEL_COLORS[level]} border-current/30 bg-current/10`}>
                        Level {level} – {LEVEL_LABELS[level]}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium mb-1">{skill.skillName} – Level {level}</p>
                      <p className="text-xs">Score: {skill.totalPoints.toFixed(1)} Punkte</p>
                      <p className="text-xs">{skill.certificateCount} Nachweis{skill.certificateCount !== 1 ? "e" : ""}</p>
                      {skill.skillCategory && <p className="text-xs">Kategorie: {skill.skillCategory}</p>}
                    </TooltipContent>
                  </Tooltip>
                  {skill.skillCategory && (
                    <Badge variant="outline" className="text-xs">
                      {skill.skillCategory}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{skill.certificateCount}</span>
                  </div>
                  <SkillLevelDots level={level} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${LEVEL_BAR_COLORS[level]}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{skill.totalPoints.toFixed(1)} Punkte</span>
                  <span>
                    {level < 5
                      ? `${progress.toFixed(0)}% bis Level ${level + 1}`
                      : "Maximales Level erreicht"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
