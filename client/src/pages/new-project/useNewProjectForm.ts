import { useCallback, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export interface SkillLink {
  skillName: string;
  skillCategory: string;
  weight: number;
}

export interface MediaItem {
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

export function useNewProjectForm() {
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

  const handleAnalyze = async () => {
    if (!title.trim() && !description.trim()) {
      toast.error("Bitte gib mindestens einen Titel oder eine Beschreibung ein.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeProject.mutateAsync({
        title, description,
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
      if (result.projectType) setProjectType(result.projectType);
      if (result.technologies && result.technologies.length > 0 && !technologies) {
        setTechnologies(result.technologies.join(", "));
      }
      toast.success("KI-Analyse abgeschlossen! Skills und Projekttyp wurden vorgeschlagen.");
    } catch {
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
        fileName: file.name, mimeType: file.type,
        caption: "", file, preview,
      }]);
    }
    e.target.value = "";
  }, []);

  const handleAddMediaLink = () => {
    setMediaItems(prev => [...prev, {
      mediaType: "link", externalUrl: "", linkType: "github", caption: "",
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
    if (!title.trim()) { toast.error("Bitte gib einen Projekttitel ein."); return; }
    if (!dateCompleted) { toast.error("Bitte gib ein Abschlussdatum ein."); return; }

    setIsSubmitting(true);
    try {
      const project = await createProject.mutateAsync({
        title,
        description: description || undefined,
        role, technologies: technologies || undefined,
        projectType: projectType || undefined,
        impactDescription: impactDescription || undefined,
        dateCompleted: new Date(dateCompleted),
        complexity, responsibility, impact,
        projectUrl: projectUrl || undefined,
        skillLinks: skillLinks.filter(s => s.skillName.trim()),
      });

      const projectId = (project as any).id;
      if (projectId) {
        for (let i = 0; i < mediaItems.length; i++) {
          const item = mediaItems[i];
          if (item.mediaType === "link") {
            await addMedia.mutateAsync({
              projectId, mediaType: "link",
              externalUrl: item.externalUrl, linkType: item.linkType,
              caption: item.caption || undefined, sortOrder: i,
            });
          } else if (item.file) {
            setIsUploadingMedia(true);
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(item.file!);
            });
            const uploaded = await uploadFile.mutateAsync({
              fileData: base64, fileName: item.file.name, mimeType: item.file.type,
            });
            await addMedia.mutateAsync({
              projectId, mediaType: item.mediaType,
              fileUrl: uploaded.url, fileKey: uploaded.key,
              fileName: item.file.name, mimeType: item.file.type,
              caption: item.caption || undefined, sortOrder: i,
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

  return {
    // Form state
    title, setTitle, description, setDescription,
    role, setRole, technologies, setTechnologies,
    projectType, setProjectType, impactDescription, setImpactDescription,
    dateCompleted, setDateCompleted, complexity, setComplexity,
    responsibility, setResponsibility, impact, setImpact,
    projectUrl, setProjectUrl,
    // Skills
    skillLinks, handleAddSkill, handleRemoveSkill, updateSkill,
    // Media
    mediaItems, handleAddMediaFile, handleAddMediaLink, handleRemoveMedia, updateMediaItem,
    // Actions
    isAnalyzing, isSubmitting, isUploadingMedia,
    handleAnalyze, handleSubmit, navigate,
  };
}
