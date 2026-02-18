import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText } from "lucide-react";
import {
  CertificateDetailsTab,
  CertificateSkillsTab,
  CertificateAdvancedTab,
  useEditCertificateForm,
} from "./edit-certificate";
import type { Certificate } from "./edit-certificate";

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
  const form = useEditCertificateForm({ certificate, open, onOpenChange, onSuccess });

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

        <Tabs value={form.activeTab} onValueChange={form.setActiveTab} className="mt-4">
          <TabsList className="bg-blue-950/50 border border-blue-500/20">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
            >
              Skills ({form.skillMappings.length})
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
            >
              Erweitert
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <CertificateDetailsTab
              certificate={certificate}
              form={{
                title: form.title,
                issuer: form.issuer,
                issueDate: form.issueDate,
                description: form.description,
                level: form.level,
                category: form.category,
                customCategory: form.customCategory,
                priority: form.priority,
                isVerified: form.isVerified,
                verificationUrl: form.verificationUrl,
                externalUrl: form.externalUrl,
                isPublic: form.isPublic,
                courseUuid: form.courseUuid,
                courseDuration: form.courseDuration,
                courseCredits: form.courseCredits,
                completionGrade: form.completionGrade,
                learningHours: form.learningHours,
              }}
              actions={{
                setField: form.setField,
                handleReanalyze: form.handleReanalyze,
                isAnalyzing: form.isAnalyzing,
              }}
            />
          </TabsContent>

          <TabsContent value="skills">
            <CertificateSkillsTab
              skillMappings={form.skillMappings}
              skillEditor={{
                newSkillName: form.newSkillName,
                newSkillCategory: form.newSkillCategory,
                newSkillWeight: form.newSkillWeight,
              }}
              actions={{
                addSkill: form.addSkill,
                removeSkill: form.removeSkill,
                updateSkillWeight: form.updateSkillWeight,
                setNewSkillName: form.setNewSkillName,
                setNewSkillCategory: form.setNewSkillCategory,
                setNewSkillWeight: form.setNewSkillWeight,
              }}
              totalWeight={form.totalWeight}
            />
          </TabsContent>

          <TabsContent value="advanced">
            <CertificateAdvancedTab
              form={{
                courseUuid: form.courseUuid,
                courseDuration: form.courseDuration,
                courseCredits: form.courseCredits,
                learningHours: form.learningHours,
                completionGrade: form.completionGrade,
              }}
              setField={form.setField}
            />
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
            onClick={form.handleSubmit}
            disabled={form.isPending || !form.title.trim() || !form.issuer.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            {form.isPending ? (
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
