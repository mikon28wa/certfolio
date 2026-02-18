import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, FileText, Link as LinkIcon, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";


type UploadMode = "file" | "link";

export default function NewCertificate() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
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
  const analyzePDF = trpc.certificates.analyzePDF.useMutation();
  const analyzeWithSkills = trpc.certificates.analyzeWithSkills.useMutation();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

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

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    try {
      // Upload file first
      const { url: fileUrl } = await uploadFileToS3(selectedFile);
      
      // Analyze with LLM (extended analysis with skills)
      const analysis = await analyzeWithSkills.mutateAsync({
        fileUrl,
        mimeType: selectedFile.type,
      });
      
      // Fill form with extracted data
      setTitle(analysis.title);
      setIssuer(analysis.issuer);
      if (analysis.issueDate) {
        setIssueDate(analysis.issueDate);
      }
      setDescription(analysis.description);
      
      // Fill extended metadata
      if (analysis.skills && analysis.skills.length > 0) {
        setSkills(analysis.skills.join(", "));
      }
      if (analysis.level) {
        setLevel(analysis.level as any);
      }
      if (analysis.category) {
        setCategory(analysis.category as any);
      }
      if (analysis.courseDuration) {
        setCourseDuration(analysis.courseDuration);
      }
      if (analysis.courseCredits) {
        setCourseCredits(analysis.courseCredits);
      }
      
      // Store extracted skill mappings for submission
      if (analysis.skills && analysis.skills.length > 0) {
        setExtractedSkillMappings(analysis.skills);
      }
      
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
    
    if (uploadMode === "file" && !selectedFile) {
      toast.error("Bitte wähle eine Datei aus");
      return;
    }
    
    if (uploadMode === "link" && !externalUrl) {
      toast.error("Bitte gib einen Link ein");
      return;
    }
    
    setIsUploading(true);
    try {
      let fileUrl: string | undefined;
      let fileKey: string | undefined;
      let fileName: string | undefined;
      let mimeType: string | undefined;
      
      if (uploadMode === "file" && selectedFile) {
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
        priority,
        isVerified,
        verificationUrl: verificationUrl || undefined,
        fileUrl,
        fileKey,
        fileName,
        mimeType,
        externalUrl: uploadMode === "link" ? externalUrl : undefined,
        isPublic,
        // Extended metadata
        courseUuid: courseUuid || undefined,
        courseDuration,
        courseCredits,
        completionGrade: completionGrade || undefined,
        learningHours,
        // Skill mappings from LLM analysis
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

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-2">Neues Zertifikat hinzufügen</h1>
          <p className="text-muted-foreground">Lade ein Zertifikat hoch oder füge einen Link hinzu</p>
        </div>
      </div>

      <div className="container py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          {/* Upload Mode Selection */}
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle>Upload-Methode</CardTitle>
              <CardDescription>Wähle, wie du dein Zertifikat hinzufügen möchtest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={uploadMode === "file" ? "default" : "outline"}
                  onClick={() => setUploadMode("file")}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Datei hochladen
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === "link" ? "default" : "outline"}
                  onClick={() => setUploadMode("link")}
                  className="flex-1"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Externer Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          {uploadMode === "file" && (
            <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>Datei hochladen</CardTitle>
                <CardDescription>PDF, JPG oder PNG (max. 10MB)</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center hover:border-accent/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Datei hierher ziehen oder klicken</p>
                    <p className="text-sm text-muted-foreground">PDF, JPG, PNG bis 10MB</p>
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/30">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-accent" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {filePreview && (
                      <div className="border border-border/50 rounded-lg overflow-hidden">
                        <img src={filePreview} alt="Vorschau" className="w-full h-auto" />
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analysiere...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Automatisch analysieren (LLM)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* External Link */}
          {uploadMode === "link" && (
            <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>Externer Link</CardTitle>
                <CardDescription>
                  Link zu deinem Zertifikat (z.B. von Coursera, edX, Udemy)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="url"
                  placeholder="https://www.coursera.org/account/accomplishments/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          {/* Certificate Details */}
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle>Zertifikatsdetails</CardTitle>
              <CardDescription>Grundlegende Informationen zum Zertifikat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. AWS Certified Solutions Architect"
                  required
                />
              </div>

              <div>
                <Label htmlFor="issuer">Aussteller *</Label>
                <Input
                  id="issuer"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="z.B. Amazon Web Services"
                  required
                />
              </div>

              <div>
                <Label htmlFor="issueDate">Ausstellungsdatum</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kurze Beschreibung des Zertifikatsinhalts..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Extended Metadata */}
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle>Erweiterte Metadaten</CardTitle>
              <CardDescription>Kategorisierung und Skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="skills">Skills (kommagetrennt)</Label>
                <Input
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="z.B. React, TypeScript, Node.js"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={level} onValueChange={(val) => setLevel(val as any)}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Wähle ein Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as any)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Wähle eine Kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT & Software</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priorität</Label>
                <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Wichtig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Verification */}
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle>Verifizierung</CardTitle>
              <CardDescription>Optional: Link zur Original-Verifizierung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isVerified">Als verifiziert markieren</Label>
              </div>

              {isVerified && (
                <div>
                  <Label htmlFor="verificationUrl">Verifizierungs-URL</Label>
                  <Input
                    id="verificationUrl"
                    type="url"
                    value={verificationUrl}
                    onChange={(e) => setVerificationUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isPublic">Öffentlich sichtbar</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/certificates")}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichere...
                </>
              ) : (
                "Zertifikat speichern"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
