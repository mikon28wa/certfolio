import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingUp, Award, RefreshCw, Briefcase, GraduationCap, ArrowLeft, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { SkillRecommendations } from "@/components/SkillRecommendations";
import {
  LEVEL_LABELS, LEVEL_BAR_COLORS,
  TopSkillsCard, SkillCategoryGrid, OtherSkillsCard, SkillDetailDialog,
} from "./skills";

export default function Skills() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const { data: skills, isLoading, refetch } = trpc.skills.getUserSkills.useQuery(undefined, { enabled: !!user });
  const { data: recommendations } = trpc.skills.getRecommendations.useQuery(undefined, { enabled: !!user });
  const { data: timeline } = trpc.skills.getSkillTimeline.useQuery({ skillName: selectedSkill! }, { enabled: !!selectedSkill });
  const { data: skillDetails, isLoading: detailsLoading } = trpc.skills.getSkillDetails.useQuery({ skillName: selectedSkill! }, { enabled: !!selectedSkill });

  const recalculateMutation = trpc.skills.recalculate.useMutation({ onSuccess: () => { refetch(); } });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-24 w-full" />))}
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
          <AlertDescription>Bitte melde dich an, um dein Skill-Profil zu sehen.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const topSkills = skills?.slice(0, 5) || [];
  const otherSkills = skills?.slice(5) || [];
  const skillsByCategory = skills?.reduce((acc, skill) => {
    const category = skill.skillCategory || "Sonstige";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>) || {};
  const totalCertificates = skills?.reduce((sum, s) => sum + s.certificateCount, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
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
              <Link href="/projects/new"><Briefcase className="mr-2 h-4 w-4" />Projekt hinzufügen</Link>
            </Button>
            <Button onClick={() => recalculateMutation.mutate()} disabled={recalculateMutation.isPending} variant="outline" size="sm">
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
                <Button asChild><Link href="/certificates/new"><GraduationCap className="mr-2 h-4 w-4" />Zertifikat hochladen</Link></Button>
                <Button asChild variant="outline"><Link href="/projects/new"><Briefcase className="mr-2 h-4 w-4" />Projekt hinzufügen</Link></Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <TopSkillsCard skills={topSkills} onSelectSkill={setSelectedSkill} />
            <SkillCategoryGrid skillsByCategory={skillsByCategory as Record<string, any[]>} onSelectSkill={setSelectedSkill} />
            <OtherSkillsCard skills={otherSkills} onSelectSkill={setSelectedSkill} />
          </>
        )}

        <SkillDetailDialog
          selectedSkill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          skillDetails={skillDetails}
          detailsLoading={detailsLoading}
          timeline={timeline}
        />
      </div>
    </div>
  );
}
