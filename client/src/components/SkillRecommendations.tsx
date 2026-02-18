import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface Recommendation {
  type: "level_up" | "refresh" | "new_skill";
  skillName: string;
  currentLevel: number;
  reason: string;
  suggestedAction: string;
}

interface SkillRecommendationsProps {
  recommendations: Recommendation[];
}

const TYPE_ICONS = {
  level_up: TrendingUp,
  refresh: RefreshCw,
  new_skill: Sparkles,
};

const TYPE_LABELS = {
  level_up: "Level aufsteigen",
  refresh: "Auffrischen",
  new_skill: "Neuer Skill",
};

const TYPE_COLORS = {
  level_up: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  refresh: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  new_skill: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

export function SkillRecommendations({ recommendations }: SkillRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Skill-Empfehlungen
          </CardTitle>
          <CardDescription>
            Keine Empfehlungen verfügbar. Dein Skill-Profil ist auf einem guten Stand!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Skill-Empfehlungen
        </CardTitle>
        <CardDescription>
          Personalisierte Vorschläge zur Weiterentwicklung deiner Skills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = TYPE_ICONS[rec.type];
          return (
            <div
              key={index}
              className="p-4 rounded-lg border border-border/30 bg-background/30 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${TYPE_COLORS[rec.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{rec.skillName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[rec.type]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Level {rec.currentLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                  <p className="text-sm text-foreground/80 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    {rec.suggestedAction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div className="pt-4 border-t border-border/30 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Empfehlungen basieren auf deiner aktuellen Skill-Aktivität
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/certificates/new">
              Zertifikat hinzufügen
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
