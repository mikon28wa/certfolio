import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { ArrowLeft, Briefcase, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import {
  useNewProjectForm,
  ProjectDetailsCard,
  ProjectRatingCard,
  ProjectSkillsCard,
  ProjectMediaCard,
} from "./new-project";

export default function NewProject() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const form = useNewProjectForm();

  if (!authLoading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Blueprint Grid Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 container max-w-4xl py-8">
        <PageBreadcrumb segments={[{ label: "Projekte" }, { label: "Neues Projekt" }]} />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => form.navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Neues Projekt hinzufügen
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dokumentiere ein Projekt als praktischen Nachweis deiner Skills.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <ProjectDetailsCard
            title={form.title} setTitle={form.setTitle}
            description={form.description} setDescription={form.setDescription}
            dateCompleted={form.dateCompleted} setDateCompleted={form.setDateCompleted}
            role={form.role} setRole={form.setRole}
            technologies={form.technologies} setTechnologies={form.setTechnologies}
            projectType={form.projectType} setProjectType={form.setProjectType}
            projectUrl={form.projectUrl} setProjectUrl={form.setProjectUrl}
          />

          <ProjectRatingCard
            complexity={form.complexity} setComplexity={form.setComplexity}
            responsibility={form.responsibility} setResponsibility={form.setResponsibility}
            impact={form.impact} setImpact={form.setImpact}
            impactDescription={form.impactDescription} setImpactDescription={form.setImpactDescription}
          />

          <ProjectSkillsCard
            skillLinks={form.skillLinks}
            handleAddSkill={form.handleAddSkill}
            handleRemoveSkill={form.handleRemoveSkill}
            updateSkill={form.updateSkill}
            isAnalyzing={form.isAnalyzing}
            handleAnalyze={form.handleAnalyze}
            canAnalyze={!!(form.title.trim() || form.description.trim())}
          />

          <ProjectMediaCard
            mediaItems={form.mediaItems}
            handleAddMediaFile={form.handleAddMediaFile}
            handleAddMediaLink={form.handleAddMediaLink}
            handleRemoveMedia={form.handleRemoveMedia}
            updateMediaItem={form.updateMediaItem}
          />

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={() => form.navigate("/dashboard")}>Abbrechen</Button>
            <Button onClick={form.handleSubmit} disabled={form.isSubmitting || !form.title.trim() || !form.dateCompleted} className="min-w-[160px]">
              {form.isSubmitting ? (
                <>{form.isUploadingMedia ? "Medien werden hochgeladen..." : <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Speichern...</>}</>
              ) : (
                "Projekt speichern"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
