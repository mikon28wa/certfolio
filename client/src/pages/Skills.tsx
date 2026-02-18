import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingUp, Award, RefreshCw, ChevronRight, Briefcase, GraduationCap, Clock, Info, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { SkillTimelineChart } from "@/components/SkillTimelineChart";
import { SkillRecommendations } from "@/components/SkillRecommendations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LEVEL_LABELS = ["Keine Erfahrung", "Grundkenntnisse", "Fortgeschritten", "Kompetent", "Experte", "Meister"];
const LEVEL_COLORS = [
  "text-muted-foreground",
  "text-blue-400",
  "text-cyan-400",
  "text-emerald-400",
  "text-amber-400",
  "text-rose-400",
];
const LEVEL_BAR_COLORS = [
  "bg-muted",
  "bg-blue-500/80",
  "bg-cyan-500/80",
  "bg-emerald-500/80",
  "bg-amber-500/80",
  "bg-rose-500/80",
];

function getLevelProgress(level: number, totalPoints: number): number {
  // Level thresholds from the spec
  const thresholds = [0, 1, 3, 6, 10, 15];
  if (level >= 5) return 100;
  const currentThreshold = thresholds[level] || 0;
  const nextThreshold = thresholds[level + 1] || 15;
  const range = nextThreshold - currentThreshold;
  const progress = totalPoints - currentThreshold;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

function SkillLevelDots({ level }: { level: number }) {
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

export default function Skills() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const { data: skills, isLoading, refetch } = trpc.skills.getUserSkills.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: recommendations } = trpc.skills.getRecommendations.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: timeline } = trpc.skills.getSkillTimeline.useQuery(
    { skillName: selectedSkill! },
    { enabled: !!selectedSkill }
  );

  const { data: skillDetails, isLoading: detailsLoading } = trpc.skills.getSkillDetails.useQuery(
    { skillName: selectedSkill! },
    { enabled: !!selectedSkill }
  );

  const recalculateMutation = trpc.skills.recalculate.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bitte melde dich an, um dein Skill-Profil zu sehen.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const topSkills = skills?.slice(0, 5) || [];
  const otherSkills = skills?.slice(5) || [];

  // Group skills by category
  const skillsByCategory = skills?.reduce((acc, skill) => {
    const category = skill.skillCategory || "Sonstige";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const totalCertificates = skills?.reduce((sum, s) => sum + s.certificateCount, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Blueprint Grid Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 container max-w-5xl py-8 space-y-8">
        <PageBreadcrumb segments={[{ label: "Skills" }]} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-primary" />
                Dein Skill-Profil
              </h1>
              <p className="text-muted-foreground mt-1">
                Aggregierte Skills aus {totalCertificates} Nachweisen (Zertifikate + Projekte)
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/projects/new">
                <Briefcase className="mr-2 h-4 w-4" />
                Projekt hinzufügen
              </Link>
            </Button>
            <Button
              onClick={() => recalculateMutation.mutate()}
              disabled={recalculateMutation.isPending}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${recalculateMutation.isPending ? "animate-spin" : ""}`} />
              Neu berechnen
            </Button>
          </div>
        </div>

        {/* Level Legend */}
        <Card className="border-border/50 bg-card/30 backdrop-blur">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Level-System</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {LEVEL_LABELS.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${LEVEL_BAR_COLORS[i]}`} />
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium">{i}</span> {label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 border-t border-border/30 pt-2">
              Skills werden aus Zertifikaten und Projekten berechnet. Projekte zählen stärker als Zertifikate. 
              Ältere Nachweise verlieren über Zeit an Gewicht (Decay). Reine Zertifikat-Skills ohne Praxis werden nach 12 Monaten auf Level 2 gedeckelt.
            </p>
          </CardContent>
        </Card>

        {/* Skill Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <SkillRecommendations recommendations={recommendations} />
        )}
        
        {!skills || skills.length === 0 ? (
          <Card className="border-2 border-dashed border-border/50 bg-card/30">
            <CardContent className="py-16 text-center">
              <Award className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Noch keine Skills erfasst</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Lade Zertifikate hoch oder dokumentiere Projekte, um dein Skill-Profil aufzubauen.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link href="/certificates/new">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Zertifikat hochladen
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/projects/new">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Projekt hinzufügen
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top Skills with Level 0-5 */}
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
                {topSkills.map((skill) => {
                  const level = Math.min(5, skill.level);
                  const progress = getLevelProgress(level, skill.totalPoints);
                  return (
                    <div
                      key={skill.id}
                      className="group p-4 rounded-lg border border-border/30 bg-background/30 hover:border-primary/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedSkill(skill.skillName)}
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

            {/* Skills by Category */}
            {skillsByCategory && Object.keys(skillsByCategory).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Skills nach Kategorie</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <Card key={category} className="border-border/50 bg-card/50 backdrop-blur">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{category}</CardTitle>
                        <CardDescription>
                          {categorySkills!.length} Skill{categorySkills!.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {categorySkills!.map((skill) => {
                          const level = Math.min(5, skill.level);
                          const progress = getLevelProgress(level, skill.totalPoints);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => setSelectedSkill(skill.skillName)}
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
            )}

            {/* All Other Skills */}
            {otherSkills.length > 0 && (
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Weitere Skills</CardTitle>
                  <CardDescription>{otherSkills.length} zusätzliche Kompetenzen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {otherSkills.map((skill) => {
                      const level = Math.min(5, skill.level);
                      const progress = getLevelProgress(level, skill.totalPoints);
                      return (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedSkill(skill.skillName)}
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
            )}
          </>
        )}

        {/* Skill Details Dialog */}
        <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedSkill}</DialogTitle>
              <DialogDescription>
                Zertifikate und Projekte, die zu diesem Skill beitragen
              </DialogDescription>
            </DialogHeader>
            {detailsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : skillDetails ? (
              <div className="space-y-5">
                {/* Skill Timeline */}
                {timeline && timeline.length > 0 && (
                  <SkillTimelineChart skillName={selectedSkill!} data={timeline} />
                )}
                
                {timeline && timeline.length === 0 && (
                  <div className="p-4 bg-accent/20 rounded-lg border border-border/30 text-sm text-muted-foreground">
                    Noch keine historischen Daten für diesen Skill. Snapshots werden automatisch bei Skill-Neuberechnungen erstellt.
                  </div>
                )}
                
                {/* Score Overview */}
                <div className="p-4 bg-accent/20 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${LEVEL_COLORS[Math.min(5, skillDetails.level)]} border-current/30 bg-current/10 text-sm`}>
                      Level {Math.min(5, skillDetails.level)} – {LEVEL_LABELS[Math.min(5, skillDetails.level)]}
                    </Badge>
                    {skillDetails.skillCategory && (
                      <Badge variant="outline">{skillDetails.skillCategory}</Badge>
                    )}
                  </div>
                  <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-2">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${LEVEL_BAR_COLORS[Math.min(5, skillDetails.level)]}`}
                      style={{ width: `${getLevelProgress(Math.min(5, skillDetails.level), skillDetails.totalPoints)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{skillDetails.totalPoints.toFixed(1)} Punkte</span>
                    <span>
                      {skillDetails.level < 5
                        ? `${getLevelProgress(Math.min(5, skillDetails.level), skillDetails.totalPoints).toFixed(0)}% bis Level ${skillDetails.level + 1}`
                        : "Maximales Level"}
                    </span>
                  </div>
                </div>

                {/* Contributing Certificates */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Beitragende Nachweise
                  </h4>
                  {skillDetails.contributingCertificates.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Noch keine Nachweise für diesen Skill.
                    </p>
                  ) : (
                    skillDetails.contributingCertificates.map((cert: any) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-3 border border-border/30 rounded-lg bg-background/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{cert.title}</p>
                            <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{cert.weight} Punkte</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {cert.source === "llm" ? "KI-Analyse" : cert.source === "manual" ? "Manuell" : cert.source}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
