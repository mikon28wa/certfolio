import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export function useNewCertificateForm() {
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert" | undefined>();
  const [category, setCategory] = useState<"it" | "marketing" | "management" | "healthcare" | "other" | undefined>();
  const [customCategory, setCustomCategory] = useState("");
  const [priority, setPriority] = useState<"normal" | "important">("normal");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [courseUuid, setCourseUuid] = useState("");
  const [courseDuration, setCourseDuration] = useState<number | undefined>();
  const [courseCredits, setCourseCredits] = useState<number | undefined>();
  const [completionGrade, setCompletionGrade] = useState("");
  const [learningHours, setLearningHours] = useState<number | undefined>();
  const [extractedSkillMappings, setExtractedSkillMappings] = useState<any[]>([]);

  const createCertificate = trpc.certificates.create.useMutation();
  const analyzeWithSkills = trpc.certificates.analyzeWithSkills.useMutation();
  const uploadFile = trpc.certificates.uploadFile.useMutation();

  const uploadFileToS3 = async (file: File): Promise<{ url: string; key: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const result = await uploadFile.mutateAsync({
            fileData: base64Data,
            fileName: file.name,
            mimeType: file.type,
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !externalUrl) {
      toast.error("Bitte wähle eine Datei oder gib einen Link ein");
      return;
    }

    setIsAnalyzing(true);
    try {
      let analysis;

      if (selectedFile) {
        const { key: fileKey } = await uploadFileToS3(selectedFile);
        analysis = await analyzeWithSkills.mutateAsync({ fileKey });
      } else if (externalUrl) {
        analysis = await analyzeWithSkills.mutateAsync({ externalUrl });
      }

      if (!analysis) return;

      // Fill form with extracted data
      setTitle(analysis.title);
      setIssuer(analysis.issuer);
      if (analysis.issueDate) setIssueDate(analysis.issueDate);
      setDescription(analysis.description);

      if (analysis.skills && analysis.skills.length > 0) {
        setSkills(analysis.skills.join(", "));
        setExtractedSkillMappings(analysis.skills);
      }
      if (analysis.level) setLevel(analysis.level as any);
      if (analysis.category) setCategory(analysis.category as any);
      if ((analysis as any).customCategory) setCustomCategory((analysis as any).customCategory);
      if ((analysis as any).priority) setPriority((analysis as any).priority);
      if ((analysis as any).isVerified !== null && (analysis as any).isVerified !== undefined) {
        setIsVerified((analysis as any).isVerified);
      }
      if ((analysis as any).verificationUrl) setVerificationUrl((analysis as any).verificationUrl);
      if (analysis.courseDuration) setCourseDuration(analysis.courseDuration);
      if (analysis.courseCredits) setCourseCredits(analysis.courseCredits);

      toast.success(`Zertifikat erfolgreich analysiert! ${analysis.skills?.length || 0} Skills wurden automatisch extrahiert.`);
    } catch (error) {
      console.error("Analyse fehlgeschlagen:", error);
      toast.error("Automatische Analyse fehlgeschlagen. Bitte fülle die Felder manuell aus.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !issuer) {
      toast.error("Bitte fülle mindestens Titel und Aussteller aus");
      return;
    }
    if (!selectedFile && !externalUrl) {
      toast.error("Bitte wähle eine Datei oder gib einen Link ein");
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl: string | undefined;
      let fileKey: string | undefined;
      let fileName: string | undefined;
      let mimeType: string | undefined;

      if (selectedFile) {
        const uploadResult = await uploadFileToS3(selectedFile);
        fileUrl = uploadResult.url;
        fileKey = uploadResult.key;
        fileName = selectedFile.name;
        mimeType = selectedFile.type;
      }

      await createCertificate.mutateAsync({
        title,
        issuer,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        description: description || undefined,
        skills: skills || undefined,
        level,
        category,
        customCategory: category === "other" && customCategory ? customCategory : undefined,
        priority,
        isVerified,
        verificationUrl: verificationUrl || undefined,
        fileUrl,
        fileKey,
        fileName,
        mimeType,
        externalUrl: externalUrl || undefined,
        isPublic,
        courseUuid: courseUuid || undefined,
        courseDuration,
        courseCredits,
        completionGrade: completionGrade || undefined,
        learningHours,
        skillMappings: extractedSkillMappings.length > 0 ? extractedSkillMappings : undefined,
      });

      toast.success("Zertifikat erfolgreich hinzugefügt!");
      setLocation("/certificates");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast.error("Fehler beim Speichern des Zertifikats");
    } finally {
      setIsUploading(false);
    }
  };

  const hasBothSources = selectedFile !== null && externalUrl.trim() !== "";

  return {
    // File state
    selectedFile, filePreview, handleDrop, handleFileChange, clearFile,
    // Form state
    title, setTitle, issuer, setIssuer, issueDate, setIssueDate,
    description, setDescription, skills, setSkills, level, setLevel,
    category, setCategory, customCategory, setCustomCategory,
    priority, setPriority, isVerified, setIsVerified,
    verificationUrl, setVerificationUrl, externalUrl, setExternalUrl,
    isPublic, setIsPublic,
    // Actions
    isUploading, isAnalyzing, handleAnalyze, handleSubmit, hasBothSources,
  };
}
