import { useState, useEffect, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type {
  Certificate,
  SkillMapping,
  EditCertificateFormState,
  SkillEditorState,
  EditCertificateFormActions,
} from "./types";

interface UseEditCertificateFormOptions {
  certificate: Certificate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function useEditCertificateForm({
  certificate,
  open,
  onOpenChange,
  onSuccess,
}: UseEditCertificateFormOptions): EditCertificateFormState & SkillEditorState & EditCertificateFormActions {
  // --- Form state ---
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<string>("none");
  const [category, setCategory] = useState<string>("none");
  const [customCategory, setCustomCategory] = useState("");
  const [priority, setPriority] = useState<string>("normal");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [courseUuid, setCourseUuid] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
  const [completionGrade, setCompletionGrade] = useState("");
  const [learningHours, setLearningHours] = useState("");

  // --- Skill state ---
  const [skillMappings, setSkillMappings] = useState<SkillMapping[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technical");
  const [newSkillWeight, setNewSkillWeight] = useState("50");

  // --- UI state ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // --- Data fetching ---
  const certId = certificate?.id;
  const stableCertId = useMemo(() => certId, [certId]);
  const { data: existingMappings } = trpc.skillMappings.getByCertificateId.useQuery(
    { certificateId: stableCertId! },
    { enabled: !!stableCertId && open }
  );

  const updateMutation = trpc.certificates.update.useMutation();
  const analyzeMutation = trpc.certificates.analyzeWithSkills.useMutation();
  const utils = trpc.useUtils();

  // --- Populate form when certificate changes ---
  useEffect(() => {
    if (certificate && open) {
      setTitle(certificate.title || "");
      setIssuer(certificate.issuer || "");
      setDescription(certificate.description || "");
      setLevel(certificate.level || "none");
      setCategory(certificate.category || "none");
      setCustomCategory(certificate.customCategory || "");
      setPriority(certificate.priority || "normal");
      setIsVerified(!!certificate.isVerified);
      setVerificationUrl(certificate.verificationUrl || "");
      setExternalUrl(certificate.externalUrl || "");
      setIsPublic(certificate.isPublic !== false && certificate.isPublic !== 0);
      setCourseUuid(certificate.courseUuid || "");
      setCourseDuration(certificate.courseDuration?.toString() || "");
      setCourseCredits(certificate.courseCredits?.toString() || "");
      setCompletionGrade(certificate.completionGrade || "");
      setLearningHours(certificate.learningHours?.toString() || "");
      setActiveTab("details");

      if (certificate.issueDate) {
        const d = new Date(certificate.issueDate);
        if (!isNaN(d.getTime())) {
          setIssueDate(d.toISOString().split("T")[0]);
        } else {
          setIssueDate("");
        }
      } else {
        setIssueDate("");
      }
    }
  }, [certificate, open]);

  // --- Populate skill mappings from existing data ---
  useEffect(() => {
    if (existingMappings && open) {
      setSkillMappings(
        existingMappings.map((m) => ({
          skillName: m.skillName,
          skillCategory: m.skillCategory || "Technical",
          weight: m.weight,
        }))
      );
    }
  }, [existingMappings, open]);

  // --- Generic field setter ---
  const setField = useCallback(<K extends keyof EditCertificateFormState>(
    key: K,
    value: EditCertificateFormState[K]
  ) => {
    const setters: Record<keyof EditCertificateFormState, (v: any) => void> = {
      title: setTitle,
      issuer: setIssuer,
      issueDate: setIssueDate,
      description: setDescription,
      level: setLevel,
      category: setCategory,
      customCategory: setCustomCategory,
      priority: setPriority,
      isVerified: setIsVerified,
      verificationUrl: setVerificationUrl,
      externalUrl: setExternalUrl,
      isPublic: setIsPublic,
      courseUuid: setCourseUuid,
      courseDuration: setCourseDuration,
      courseCredits: setCourseCredits,
      completionGrade: setCompletionGrade,
      learningHours: setLearningHours,
    };
    setters[key](value);
  }, []);

  // --- Skill management ---
  const addSkill = useCallback(() => {
    if (!newSkillName.trim()) {
      toast.error("Bitte gib einen Skill-Namen ein");
      return;
    }
    const weight = parseInt(newSkillWeight);
    if (isNaN(weight) || weight < 0 || weight > 100) {
      toast.error("Gewichtung muss zwischen 0 und 100 liegen");
      return;
    }
    if (skillMappings.some((m) => m.skillName.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error("Dieser Skill existiert bereits");
      return;
    }
    setSkillMappings([
      ...skillMappings,
      {
        skillName: newSkillName.trim(),
        skillCategory: newSkillCategory,
        weight,
      },
    ]);
    setNewSkillName("");
    setNewSkillWeight("50");
  }, [newSkillName, newSkillCategory, newSkillWeight, skillMappings]);

  const removeSkill = useCallback((index: number) => {
    setSkillMappings((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateSkillWeight = useCallback((index: number, newWeight: string) => {
    const weight = parseInt(newWeight);
    if (isNaN(weight)) return;
    setSkillMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], weight: Math.min(100, Math.max(0, weight)) };
      return updated;
    });
  }, []);

  // --- KI-Reanalyse ---
  const handleReanalyze = useCallback(async () => {
    if (!certificate?.fileUrl && !certificate?.externalUrl) {
      toast.error("Keine Datei oder Link zum Analysieren vorhanden");
      return;
    }
    setIsAnalyzing(true);
    try {
      let fileKey: string | undefined;
      if (certificate.fileUrl) {
        const urlParts = certificate.fileUrl.split("/");
        const keyStartIndex = urlParts.findIndex((part) => part.includes("-certificates"));
        if (keyStartIndex !== -1) {
          fileKey = urlParts.slice(keyStartIndex).join("/");
        }
      }

      const result = await analyzeMutation.mutateAsync({
        fileKey,
        externalUrl: certificate.externalUrl || undefined,
      });
      if (result) {
        if (result.title) setTitle(result.title);
        if (result.issuer) setIssuer(result.issuer);
        if (result.description) setDescription(result.description);
        if (result.issueDate) setIssueDate(result.issueDate);
        if (result.skills && result.skills.length > 0) {
          setSkillMappings(
            result.skills.map((s: { skillName: string; skillCategory?: string; weight: number; reasoning?: string }) => ({
              skillName: s.skillName,
              skillCategory: s.skillCategory || "Technical",
              weight: s.weight,
              reasoning: s.reasoning,
            }))
          );
        }
        toast.success("Analyse abgeschlossen – Felder aktualisiert");
        setActiveTab("skills");
      }
    } catch {
      toast.error("Analyse fehlgeschlagen");
    } finally {
      setIsAnalyzing(false);
    }
  }, [certificate, analyzeMutation]);

  // --- Submit ---
  const handleSubmit = useCallback(async () => {
    if (!certificate) return;
    if (!title.trim() || !issuer.trim()) {
      toast.error("Titel und Aussteller sind Pflichtfelder");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: certificate.id,
        title: title.trim(),
        issuer: issuer.trim(),
        issueDate: issueDate ? new Date(issueDate) : undefined,
        description: description.trim() || undefined,
        level: level !== "none" ? (level as "beginner" | "intermediate" | "advanced" | "expert") : undefined,
        category: category !== "none" ? (category as "it" | "marketing" | "management" | "healthcare" | "other") : undefined,
        customCategory: customCategory.trim() || undefined,
        priority: priority as "normal" | "important",
        isVerified,
        verificationUrl: verificationUrl.trim() || undefined,
        externalUrl: externalUrl.trim() || undefined,
        isPublic,
        courseUuid: courseUuid.trim() || undefined,
        courseDuration: courseDuration ? parseFloat(courseDuration) : undefined,
        courseCredits: courseCredits ? parseFloat(courseCredits) : undefined,
        completionGrade: completionGrade.trim() || undefined,
        learningHours: learningHours ? parseFloat(learningHours) : undefined,
        skillMappings: skillMappings.length > 0 ? skillMappings : [],
      });

      toast.success("Zertifikat aktualisiert");
      utils.certificates.list.invalidate();
      utils.certificates.get.invalidate();
      utils.skills.getUserSkills.invalidate();
      utils.skillMappings.getByCertificateId.invalidate();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  }, [
    certificate, title, issuer, issueDate, description, level, category, customCategory,
    priority, isVerified, verificationUrl, externalUrl, isPublic,
    courseUuid, courseDuration, courseCredits, completionGrade, learningHours,
    skillMappings, updateMutation, utils, onOpenChange, onSuccess,
  ]);

  // --- Computed ---
  const totalWeight = useMemo(
    () => skillMappings.reduce((sum, m) => sum + m.weight, 0),
    [skillMappings]
  );

  return {
    // Form state
    title,
    issuer,
    issueDate,
    description,
    level,
    category,
    customCategory,
    priority,
    isVerified,
    verificationUrl,
    externalUrl,
    isPublic,
    courseUuid,
    courseDuration,
    courseCredits,
    completionGrade,
    learningHours,

    // Skill state
    skillMappings,
    newSkillName,
    newSkillCategory,
    newSkillWeight,

    // Actions
    setField,
    addSkill,
    removeSkill,
    updateSkillWeight,
    setNewSkillName,
    setNewSkillCategory,
    setNewSkillWeight,
    setSkillMappings,
    handleReanalyze,
    handleSubmit,

    // Computed / UI
    totalWeight,
    isAnalyzing,
    isPending: updateMutation.isPending,
    activeTab,
    setActiveTab,
  };
}
