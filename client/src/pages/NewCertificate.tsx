import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import {
  useNewCertificateForm,
  UploadSection,
  DetailsSection,
  MetadataSection,
  VerificationSection,
} from "./new-certificate";

export default function NewCertificate() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const form = useNewCertificateForm();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8">
        <PageBreadcrumb
          segments={[
            { label: "Zertifikate", href: "/certificates" },
            { label: "Neues Zertifikat" },
          ]}
        />
        <h1 className="text-3xl font-bold mt-4 mb-6">Neues Zertifikat</h1>

        <form onSubmit={form.handleSubmit}>
          <UploadSection
            selectedFile={form.selectedFile}
            filePreview={form.filePreview}
            externalUrl={form.externalUrl}
            setExternalUrl={form.setExternalUrl}
            handleDrop={form.handleDrop}
            handleFileChange={form.handleFileChange}
            clearFile={form.clearFile}
            isAnalyzing={form.isAnalyzing}
            handleAnalyze={form.handleAnalyze}
            hasBothSources={form.hasBothSources}
          />

          <DetailsSection
            title={form.title}
            setTitle={form.setTitle}
            issuer={form.issuer}
            setIssuer={form.setIssuer}
            issueDate={form.issueDate}
            setIssueDate={form.setIssueDate}
            description={form.description}
            setDescription={form.setDescription}
          />

          <MetadataSection
            skills={form.skills}
            setSkills={form.setSkills}
            level={form.level}
            setLevel={form.setLevel}
            category={form.category}
            setCategory={form.setCategory}
            customCategory={form.customCategory}
            setCustomCategory={form.setCustomCategory}
            priority={form.priority}
            setPriority={form.setPriority}
          />

          <VerificationSection
            isVerified={form.isVerified}
            setIsVerified={form.setIsVerified}
            verificationUrl={form.verificationUrl}
            setVerificationUrl={form.setVerificationUrl}
            isPublic={form.isPublic}
            setIsPublic={form.setIsPublic}
          />

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
              disabled={form.isUploading}
              className="flex-1"
            >
              {form.isUploading ? (
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
