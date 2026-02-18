import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  X,
  Plus,
  Sparkles,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  Shield,
  ShieldCheck,
} from "lucide-react";

interface SkillMapping {
  skillName: string;
  skillCategory: string;
  weight: number;
  reasoning?: string;
}

interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issueDate?: string | Date | null;
  description?: string | null;
  skills?: string | null;
  level?: string | null;
  category?: string | null;
  priority?: string | null;
  isVerified?: boolean | number | null;
  verificationUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  externalUrl?: string | null;
  isPublic?: boolean | number | null;
  tags?: string | null;
  courseUuid?: string | null;
  courseDuration?: number | null;
  courseCredits?: number | null;
  completionGrade?: string | null;
  learningHours?: number | null;
}

interface EditCertificateDialogProps {
  certificate: Certificate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditCertificateDialog({
  certificate,
  open,
  onOpenChange,
  onSuccess,
}: EditCertificateDialogProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<string>("none");
  const [category, setCategory] = useState<string>("none");
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

  // Skill mappings state
  const [skillMappings, setSkillMappings] = useState<SkillMapping[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Technical");
  const [newSkillWeight, setNewSkillWeight] = useState("50");

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Fetch existing skill mappings
  const certId = certificate?.id;
  const stableCertId = useMemo(() => certId, [certId]);
  const { data: existingMappings } = trpc.skillMappings.getByCertificateId.useQuery(
    { certificateId: stableCertId! },
    { enabled: !!stableCertId && open }
  );

  const updateMutation = trpc.certificates.update.useMutation();
  const analyzeMutation = trpc.certificates.analyzeWithSkills.useMutation();
  const utils = trpc.useUtils();

  // Populate form when certificate changes
  useEffect(() => {
    if (certificate && open) {
      setTitle(certificate.title || "");
      setIssuer(certificate.issuer || "");
      setDescription(certificate.description || "");
      setLevel(certificate.level || "none");
      setCategory(certificate.category || "none");
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

      // Format date
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

  // Populate skill mappings from existing data
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

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error("Bitte gib einen Skill-Namen ein");
      return;
    }
    const weight = parseInt(newSkillWeight);
    if (isNaN(weight) || weight < 0 || weight > 100) {
      toast.error("Gewichtung muss zwischen 0 und 100 liegen");
      return;
    }
    // Check for duplicates
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
  };

  const handleRemoveSkill = (index: number) => {
    setSkillMappings(skillMappings.filter((_, i) => i !== index));
  };

  const handleUpdateSkillWeight = (index: number, newWeight: string) => {
    const weight = parseInt(newWeight);
    if (isNaN(weight)) return;
    const updated = [...skillMappings];
    updated[index] = { ...updated[index], weight: Math.min(100, Math.max(0, weight)) };
    setSkillMappings(updated);
  };

  const handleReanalyze = async () => {
    if (!certificate?.fileUrl && !certificate?.externalUrl) {
      toast.error("Keine Datei oder Link zum Analysieren vorhanden");
      return;
    }
    setIsAnalyzing(true);
    try {
      // Extract fileKey from fileUrl if available
      let fileKey: string | undefined;
      if (certificate.fileUrl) {
        // Extract key from S3 URL (format: https://.../{fileKey})
        const urlParts = certificate.fileUrl.split('/');
        const keyStartIndex = urlParts.findIndex(part => part.includes('-certificates'));
        if (keyStartIndex !== -1) {
          fileKey = urlParts.slice(keyStartIndex).join('/');
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
  };

  const handleSubmit = async () => {
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
  };

  const totalWeight = skillMappings.reduce((sum, m) => sum + m.weight, 0);

  // File preview helper
  const renderFilePreview = () => {
    if (!certificate?.fileUrl) return null;
    const isImage = certificate.mimeType?.startsWith("image/");
    const isPdf = certificate.mimeType === "application/pdf";

    return (
      <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-950/30">
        <Label className="text-blue-300 text-xs uppercase tracking-wider mb-2 block">
          Hochgeladene Datei
        </Label>
        {isImage ? (
          <div className="flex items-center gap-4">
            <img
              src={certificate.fileUrl}
              alt={certificate.title}
              className="w-24 h-24 object-cover rounded border border-blue-500/30"
            />
            <div className="flex-1">
              <p className="text-sm text-white/80">{certificate.fileName || "Bild"}</p>
              <a
                href={certificate.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> Vollbild öffnen
              </a>
            </div>
          </div>
        ) : isPdf ? (
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-blue-900/50 rounded border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-10 h-10 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/80">{certificate.fileName || "PDF-Dokument"}</p>
              <a
                href={certificate.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> PDF öffnen
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-blue-900/50 rounded border border-blue-500/30 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/80">{certificate.fileName || "Datei"}</p>
              <a
                href={certificate.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> Datei öffnen
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a1628] border-blue-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Zertifikat bearbeiten
          </DialogTitle>
          <DialogDescription className="text-blue-300/70">
            Bearbeite die Metadaten und Skill-Mappings dieses Zertifikats.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-blue-950/50 border border-blue-500/20">
            <TabsTrigger value="details" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300">
              Details
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300">
              Skills ({skillMappings.length})
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300">
              Erweitert
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Details */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* File Preview */}
            {renderFilePreview()}

            {/* Re-analyze button */}
            {certificate?.fileUrl && (
              <Button
                variant="outline"
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    KI analysiert...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Erneut mit KI analysieren
                  </>
                )}
              </Button>
            )}

            {/* Title & Issuer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-300 text-xs uppercase tracking-wider">Titel *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                  placeholder="z.B. Full Stack Web Development"
                />
              </div>
              <div>
                <Label className="text-blue-300 text-xs uppercase tracking-wider">Aussteller *</Label>
                <Input
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                  placeholder="z.B. Coursera, Udemy"
                />
              </div>
            </div>

            {/* Date & Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-300 text-xs uppercase tracking-wider">Ausstellungsdatum</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="bg-blue-950/30 border-blue-500/30 text-white"
                />
              </div>
              <div>
                <Label className="text-blue-300 text-xs uppercase tracking-wider">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="bg-blue-950/30 border-blue-500/30 text-white">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1628] border-blue-500/30">
                    <SelectItem value="none">Kein Level</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-300 text-xs uppercase tracking-wider">Kategorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-blue-950/30 border-blue-500/30 text-white">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1628] border-blue-500/30">
                    <SelectItem value="none">Keine Kategorie</SelectItem>
                    <SelectItem value="it">IT & Technologie</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="healthcare">Gesundheitswesen</SelectItem>
                    <SelectItem value="other">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-blue-300 text-xs uppercase tracking-wider">Priorität</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-blue-950/30 border-blue-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1628] border-blue-500/30">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Wichtig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-blue-300 text-xs uppercase tracking-wider">Beschreibung</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                placeholder="Kursbeschreibung oder Zusammenfassung..."
              />
            </div>

            {/* External URL */}
            <div>
              <Label className="text-blue-300 text-xs uppercase tracking-wider">Externer Link</Label>
              <Input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                placeholder="https://coursera.org/verify/..."
              />
            </div>

            {/* Verification */}
            <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                  ) : (
                    <Shield className="w-5 h-5 text-blue-400/50" />
                  )}
                  <div>
                    <Label className="text-blue-300 text-xs uppercase tracking-wider">Verifiziert</Label>
                    <p className="text-xs text-blue-400/60">
                      Markiere als verifiziert, wenn eine Original-URL vorhanden ist
                    </p>
                  </div>
                </div>
                <Switch checked={isVerified} onCheckedChange={setIsVerified} />
              </div>
              {isVerified && (
                <div className="mt-3">
                  <Label className="text-blue-300 text-xs uppercase tracking-wider">Verifizierungs-URL</Label>
                  <Input
                    value={verificationUrl}
                    onChange={(e) => setVerificationUrl(e.target.value)}
                    className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                    placeholder="https://coursera.org/verify/ABC123"
                  />
                </div>
              )}
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between border border-blue-500/20 rounded-lg p-4 bg-blue-950/20">
              <div>
                <Label className="text-blue-300 text-xs uppercase tracking-wider">Öffentlich sichtbar</Label>
                <p className="text-xs text-blue-400/60">
                  Zertifikat im öffentlichen Profil anzeigen
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </TabsContent>

          {/* Tab 2: Skills */}
          <TabsContent value="skills" className="space-y-4 mt-4">
            <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-950/20">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-blue-300 text-xs uppercase tracking-wider">
                  Skill-Mappings ({skillMappings.length})
                </Label>
                <span className={`text-xs ${totalWeight > 100 ? "text-red-400" : "text-blue-400/60"}`}>
                  Gesamt: {totalWeight}/100
                </span>
              </div>

              {/* Existing skills */}
              {skillMappings.length === 0 ? (
                <p className="text-sm text-blue-400/50 text-center py-6">
                  Keine Skills zugeordnet. Füge manuell Skills hinzu oder nutze die KI-Analyse.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {skillMappings.map((mapping, index) => (
                    <div
                      key={`${mapping.skillName}-${index}`}
                      className="flex items-center gap-3 bg-blue-900/20 border border-blue-500/20 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {mapping.skillName}
                          </span>
                          <span className="text-xs text-blue-400/60 bg-blue-900/30 px-2 py-0.5 rounded">
                            {mapping.skillCategory}
                          </span>
                        </div>
                        {mapping.reasoning && (
                          <p className="text-xs text-blue-400/50 mt-1">{mapping.reasoning}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={mapping.weight}
                          onChange={(e) => handleUpdateSkillWeight(index, e.target.value)}
                          className="w-20 bg-blue-950/30 border-blue-500/30 text-white text-center text-sm"
                        />
                        <span className="text-xs text-blue-400/60">%</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSkill(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new skill */}
              <div className="border-t border-blue-500/20 pt-4">
                <Label className="text-blue-300 text-xs uppercase tracking-wider mb-2 block">
                  Neuen Skill hinzufügen
                </Label>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Skill-Name"
                      className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                      onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    />
                  </div>
                  <div className="w-36">
                    <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                      <SelectTrigger className="bg-blue-950/30 border-blue-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1628] border-blue-500/30">
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                        <SelectItem value="Domain">Domain</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={newSkillWeight}
                      onChange={(e) => setNewSkillWeight(e.target.value)}
                      className="bg-blue-950/30 border-blue-500/30 text-white text-center"
                    />
                  </div>
                  <Button
                    onClick={handleAddSkill}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white h-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Weight warning */}
            {totalWeight > 100 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-300">
                  Die Gesamtgewichtung ({totalWeight}%) überschreitet 100%. Bitte passe die Werte an.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Advanced */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-950/20">
              <Label className="text-blue-300 text-xs uppercase tracking-wider mb-3 block">
                Kurs-Metadaten (für Skill-Score-Berechnung)
              </Label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-300/70 text-xs">Kurs-UUID</Label>
                  <Input
                    value={courseUuid}
                    onChange={(e) => setCourseUuid(e.target.value)}
                    className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                    placeholder="z.B. coursera-ml-001"
                  />
                </div>
                <div>
                  <Label className="text-blue-300/70 text-xs">Kursdauer (Stunden)</Label>
                  <Input
                    type="number"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                    placeholder="z.B. 40"
                  />
                </div>
                <div>
                  <Label className="text-blue-300/70 text-xs">Credits/ECTS</Label>
                  <Input
                    type="number"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(e.target.value)}
                    className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                    placeholder="z.B. 5"
                  />
                </div>
                <div>
                  <Label className="text-blue-300/70 text-xs">Lernstunden (geschätzt)</Label>
                  <Input
                    type="number"
                    value={learningHours}
                    onChange={(e) => setLearningHours(e.target.value)}
                    className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                    placeholder="z.B. 60"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-blue-300/70 text-xs">Abschlussnote</Label>
                <Input
                  value={completionGrade}
                  onChange={(e) => setCompletionGrade(e.target.value)}
                  className="bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40"
                  placeholder="z.B. 95%, A+, bestanden"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-blue-500/30 text-blue-300 hover:bg-blue-900/30"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending || !title.trim() || !issuer.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              "Änderungen speichern"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
