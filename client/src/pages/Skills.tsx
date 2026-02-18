import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingUp, Award, RefreshCw, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Skills() {
  const { user, loading: authLoading } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const { data: skills, isLoading, refetch } = trpc.skills.getUserSkills.useQuery(undefined, {
    enabled: !!user,
  });

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
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dein Skill-Profil</h1>
          <p className="text-muted-foreground mt-2">
            Aggregierte Skills aus {skills?.reduce((sum, s) => sum + s.certificateCount, 0) || 0}{" "}
            Zertifikaten
          </p>
        </div>
        <Button
          onClick={() => recalculateMutation.mutate()}
          disabled={recalculateMutation.isPending}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${recalculateMutation.isPending ? "animate-spin" : ""}`} />
          Neu berechnen
        </Button>
      </div>

      {!skills || skills.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Noch keine Skills erfasst</h3>
            <p className="text-muted-foreground mb-4">
              Lade Zertifikate hoch, um dein Skill-Profil aufzubauen.
            </p>
            <Button asChild>
              <a href="/certificates/new">Erstes Zertifikat hochladen</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top Skills Overview */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top 5 Skills
              </CardTitle>
              <CardDescription>
                Deine stärksten Kompetenzen basierend auf Zertifikaten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {topSkills.map((skill) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{skill.skillName}</h3>
                      <Badge variant="secondary" className="text-xs">
                        Level {skill.level}
                      </Badge>
                      {skill.skillCategory && (
                        <Badge variant="outline" className="text-xs">
                          {skill.skillCategory}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {skill.certificateCount} Zertifikat{skill.certificateCount !== 1 ? "e" : ""}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSkill(skill.skillName)}
                      >
                        Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={skill.progressPercentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{skill.totalPoints} Punkte</span>
                      <span>{skill.progressPercentage}% bis Level {skill.level + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills by Category */}
          {skillsByCategory && Object.keys(skillsByCategory).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Skills nach Kategorie</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <CardDescription>
                        {categorySkills.length} Skill{categorySkills.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categorySkills.map((skill) => (
                        <div key={skill.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{skill.skillName}</span>
                            <Badge variant="secondary" className="text-xs">
                              Lvl {skill.level}
                            </Badge>
                          </div>
                          <Progress value={skill.progressPercentage} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Other Skills */}
          {otherSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weitere Skills</CardTitle>
                <CardDescription>{otherSkills.length} zusätzliche Kompetenzen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {otherSkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill.skillName)}
                      className="text-left p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{skill.skillName}</span>
                        <Badge variant="outline" className="text-xs">
                          Lvl {skill.level}
                        </Badge>
                      </div>
                      <Progress value={skill.progressPercentage} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {skill.certificateCount} Zertifikat{skill.certificateCount !== 1 ? "e" : ""}
                      </p>
                    </button>
                  ))}
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
            <DialogTitle>{selectedSkill}</DialogTitle>
            <DialogDescription>
              Zertifikate, die zu diesem Skill beitragen
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : skillDetails ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Level {skillDetails.level}</Badge>
                    {skillDetails.skillCategory && (
                      <Badge variant="outline">{skillDetails.skillCategory}</Badge>
                    )}
                  </div>
                  <Progress value={skillDetails.progressPercentage} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {skillDetails.totalPoints} Punkte • {skillDetails.progressPercentage}% bis Level{" "}
                    {skillDetails.level + 1}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Beitragende Zertifikate</h4>
                {skillDetails.contributingCertificates.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{cert.title}</p>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    </div>
                    <div className="text-right">
                      <Badge>{cert.weight} Punkte</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Quelle: {cert.source === "llm" ? "Automatisch" : cert.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
