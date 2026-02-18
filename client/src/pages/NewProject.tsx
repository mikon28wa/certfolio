import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Briefcase, Loader2, Plus, Sparkles, Trash2, Upload, Link as LinkIcon, Image, FileText } from "lucide-react";
import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

interface SkillLink {
  skillName: string;
  skillCategory: string;
  weight: number;
}

interface MediaItem {
  mediaType: "image" | "pdf" | "link";
  fileUrl?: string;
  fileKey?: string;
  fileName?: string;
  mimeType?: string;
  externalUrl?: string;
  linkType?: string;
  caption?: string;
  file?: File;
  preview?: string;
}

export default function NewProject() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState<"solo" | "team" | "lead">("solo");
  const [technologies, setTechnologies] = useState("");
  const [projectType, setProjectType] = useState("");
  const [impactDescription, setImpactDescription] = useState("");
  const [dateCompleted, setDateCompleted] = useState("");
  const [complexity, setComplexity] = useState(1);
  const [responsibility, setResponsibility] = useState(1);
  const [impact, setImpact] = useState(0);
  const [projectUrl, setProjectUrl] = useState("");
  const [skillLinks, setSkillLinks] = useState<SkillLink[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const createProject = trpc.projects.create.useMutation();
  const analyzeProject = trpc.projects.analyze.useMutation();
  const uploadFile = trpc.projects.uploadFile.useMutation();
  const addMedia = trpc.projects.addMedia.useMutation();

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleAnalyze = async () => {
    if (!title.trim() && !description.trim()) {
      toast.error("Bitte gib mindestens einen Titel oder eine Beschreibung ein.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeProject.mutateAsync({
        title,
        description,
        technologies: technologies || undefined,
        role,
      });

      if (result.skills && result.skills.length > 0) {
        setSkillLinks(result.skills.map(s => ({
          skillName: s.skillName,
          skillCategory: s.skillCategory,
          weight: s.weight,
        })));
      }
      if (result.projectType) {
        setProjectType(result.projectType);
      }
      if (result.technologies && result.technologies.length > 0 && !technologies) {
        setTechnologies(result.technologies.join(", "));
      }
      toast.success("KI-Analyse abgeschlossen! Skills und Projekttyp wurden vorgeschlagen.");
    } catch (error) {
      toast.error("Fehler bei der KI-Analyse. Bitte versuche es erneut.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMediaFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      if (!isImage && !isPdf) {
        toast.error(`Datei "${file.name}" wird nicht unterstützt. Nur Bilder und PDFs.`);
        continue;
      }

      const preview = isImage ? URL.createObjectURL(file) : undefined;
      setMediaItems(prev => [...prev, {
        mediaType: isImage ? "image" : "pdf",
        fileName: file.name,
        mimeType: file.type,
        caption: "",
        file,
        preview,
      }]);
    }
    e.target.value = "";
  }, []);

  const handleAddMediaLink = () => {
    setMediaItems(prev => [...prev, {
      mediaType: "link",
      externalUrl: "",
      linkType: "github",
      caption: "",
    }]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaItems(prev => {
      const item = prev[index];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateMediaItem = (index: number, updates: Partial<MediaItem>) => {
    setMediaItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const handleRemoveSkill = (index: number) => {
    setSkillLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    setSkillLinks(prev => [...prev, { skillName: "", skillCategory: "Technical", weight: 10 }]);
  };

  const updateSkill = (index: number, updates: Partial<SkillLink>) => {
    setSkillLinks(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Bitte gib einen Projekttitel ein.");
      return;
    }
    if (!dateCompleted) {
      toast.error("Bitte gib ein Abschlussdatum ein.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create the project
      const project = await createProject.mutateAsync({
        title,
        description: description || undefined,
        role,
        technologies: technologies || undefined,
        projectType: projectType || undefined,
        impactDescription: impactDescription || undefined,
        dateCompleted: new Date(dateCompleted),
        complexity,
        responsibility,
        impact,
        projectUrl: projectUrl || undefined,
        skillLinks: skillLinks.filter(s => s.skillName.trim()),
      });

      // 2. Upload media files and add them to the project
      const projectId = (project as any).id;
      if (projectId) {
        for (let i = 0; i < mediaItems.length; i++) {
          const item = mediaItems[i];
          if (item.mediaType === "link") {
            await addMedia.mutateAsync({
              projectId,
              mediaType: "link",
              externalUrl: item.externalUrl,
              linkType: item.linkType,
              caption: item.caption || undefined,
              sortOrder: i,
            });
          } else if (item.file) {
            setIsUploadingMedia(true);
            // Upload file to S3
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(item.file!);
            });

            const uploaded = await uploadFile.mutateAsync({
              fileData: base64,
              fileName: item.file.name,
              mimeType: item.file.type,
            });

            await addMedia.mutateAsync({
              projectId,
              mediaType: item.mediaType,
              fileUrl: uploaded.url,
              fileKey: uploaded.key,
              fileName: item.file.name,
              mimeType: item.file.type,
              caption: item.caption || undefined,
              sortOrder: i,
            });
          }
        }
        setIsUploadingMedia(false);
      }

      toast.success("Projekt erfolgreich erstellt!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Fehler beim Erstellen des Projekts.");
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  };

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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
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

        {/* Main Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Projektdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Projekttitel *</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. E-Commerce Dashboard mit React" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschreibe das Projekt, seine Ziele und was du gelernt hast..." className="mt-1 w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateCompleted">Abschlussdatum *</Label>
                  <Input id="dateCompleted" type="date" value={dateCompleted} onChange={e => setDateCompleted(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Rolle</Label>
                  <Select value={role} onValueChange={(v: "solo" | "team" | "lead") => setRole(v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Allein</SelectItem>
                      <SelectItem value="team">Team-Mitglied</SelectItem>
                      <SelectItem value="lead">Team-Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="technologies">Technologien / Tools</Label>
                <Input id="technologies" value={technologies} onChange={e => setTechnologies(e.target.value)} placeholder="z.B. React, Node.js, PostgreSQL, Figma" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="projectType">Projekttyp</Label>
                <Input id="projectType" value={projectType} onChange={e => setProjectType(e.target.value)} placeholder="z.B. Web-App MVP, Datenanalyse, API-Service" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="projectUrl">Projekt-URL (optional)</Label>
                <Input id="projectUrl" value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://github.com/user/project" className="mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* Complexity / Responsibility / Impact */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Bewertung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Komplexität</Label>
                  <Select value={String(complexity)} onValueChange={v => setComplexity(Number(v))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Einfach (Kursprojekt)</SelectItem>
                      <SelectItem value="2">Mittel (Freelance)</SelectItem>
                      <SelectItem value="3">Hoch (Produktion)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Verantwortung</Label>
                  <Select value={String(responsibility)} onValueChange={v => setResponsibility(Number(v))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Zuarbeit</SelectItem>
                      <SelectItem value="2">Teilverantwortung</SelectItem>
                      <SelectItem value="3">Gesamtverantwortung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Impact</Label>
                  <Select value={String(impact)} onValueChange={v => setImpact(Number(v))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Kein messbarer Impact</SelectItem>
                      <SelectItem value="1">Intern genutzt</SelectItem>
                      <SelectItem value="2">Extern sichtbar</SelectItem>
                      <SelectItem value="3">Messbare Ergebnisse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="impactDescription">Impact-Beschreibung (optional)</Label>
                <Input id="impactDescription" value={impactDescription} onChange={e => setImpactDescription(e.target.value)} placeholder="z.B. 30% schnellere Ladezeiten, 500+ aktive Nutzer" className="mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* KI Analysis */}
          <Card className="border-primary/30 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                KI-Skill-Analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Lass die KI automatisch Skills und Gewichtungen aus deiner Projektbeschreibung extrahieren.
              </p>
              <Button onClick={handleAnalyze} disabled={isAnalyzing || (!title.trim() && !description.trim())} variant="outline" className="border-primary/50 hover:bg-primary/10">
                {isAnalyzing ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Analysiere...</> : <><Sparkles className="h-4 w-4 mr-2" /> Projekt analysieren</>}
              </Button>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Skill-Zuordnung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {skillLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Skills zugeordnet. Nutze die KI-Analyse oder füge manuell Skills hinzu.</p>
              ) : (
                skillLinks.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-md border border-border/50 bg-background/50">
                    <Input value={skill.skillName} onChange={e => updateSkill(index, { skillName: e.target.value })} placeholder="Skill-Name" className="flex-1" />
                    <Select value={skill.skillCategory} onValueChange={v => updateSkill(index, { skillCategory: v })}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                        <SelectItem value="Domain Knowledge">Domain</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 w-[80px]">
                      <Input type="number" min={0} max={100} value={skill.weight} onChange={e => updateSkill(index, { weight: Number(e.target.value) })} className="w-[60px] text-center" />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSkill(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
              <Button variant="outline" size="sm" onClick={handleAddSkill} className="mt-2">
                <Plus className="h-4 w-4 mr-1" /> Skill hinzufügen
              </Button>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Medien & Nachweise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Füge Screenshots, PDFs oder Links (GitHub, Figma, YouTube, etc.) als Nachweise hinzu.
              </p>

              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input type="file" multiple accept="image/*,application/pdf" onChange={handleAddMediaFile} className="hidden" />
                  <Button variant="outline" size="sm" asChild>
                    <span><Upload className="h-4 w-4 mr-1" /> Datei hochladen</span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" onClick={handleAddMediaLink}>
                  <LinkIcon className="h-4 w-4 mr-1" /> Link hinzufügen
                </Button>
              </div>

              {mediaItems.length > 0 && (
                <div className="space-y-3">
                  {mediaItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-md border border-border/50 bg-background/50">
                      {/* Preview */}
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                        {item.preview ? (
                          <img src={item.preview} alt="" className="w-12 h-12 rounded object-cover" />
                        ) : item.mediaType === "pdf" ? (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        ) : item.mediaType === "link" ? (
                          <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Image className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        {item.mediaType === "link" ? (
                          <div className="flex gap-2">
                            <Select value={item.linkType || "github"} onValueChange={v => updateMediaItem(index, { linkType: v })}>
                              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="github">GitHub</SelectItem>
                                <SelectItem value="figma">Figma</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="other">Sonstiges</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input value={item.externalUrl || ""} onChange={e => updateMediaItem(index, { externalUrl: e.target.value })} placeholder="https://..." className="flex-1" />
                          </div>
                        ) : (
                          <p className="text-sm font-medium">{item.fileName}</p>
                        )}
                        <Input value={item.caption || ""} onChange={e => updateMediaItem(index, { caption: e.target.value })} placeholder="Beschreibung (optional)" className="text-xs" />
                      </div>

                      <Button variant="ghost" size="icon" onClick={() => handleRemoveMedia(index)} className="text-destructive hover:text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Abbrechen</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim() || !dateCompleted} className="min-w-[160px]">
              {isSubmitting ? (
                <>{isUploadingMedia ? "Medien werden hochgeladen..." : <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Speichern...</>}</>
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
