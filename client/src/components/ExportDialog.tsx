import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections?: Array<{ id: number; name: string }>;
}

export function ExportDialog({ open, onOpenChange, collections = [] }: ExportDialogProps) {
  const [collectionId, setCollectionId] = useState<number | undefined>();
  const [includeSkills, setIncludeSkills] = useState(true);
  const [includeCertificates, setIncludeCertificates] = useState(true);
  
  // Branding options
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e40af");
  const [accentColor, setAccentColor] = useState("#3b82f6");

  const exportPDF = trpc.pdf.exportPortfolio.useMutation({
    onSuccess: (data) => {
      toast.success("PDF erfolgreich erstellt!");
      // Download PDF
      window.open(data.url, "_blank");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`PDF-Export fehlgeschlagen: ${error.message}`);
    },
  });

  const handleExport = () => {
    exportPDF.mutate({
      collectionId,
      includeSkills,
      includeCertificates,
      branding: {
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        website: website || undefined,
        linkedIn: linkedIn || undefined,
        primaryColor,
        accentColor,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Portfolio als PDF exportieren
          </DialogTitle>
          <DialogDescription>
            Erstelle ein professionelles PDF-Portfolio mit deinen Zertifikaten und Skills
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Export-Optionen</h3>
            
            {collections.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="collection">Collection (optional)</Label>
                <Select
                  value={collectionId?.toString() || "all"}
                  onValueChange={(value) => setCollectionId(value === "all" ? undefined : parseInt(value))}
                >
                  <SelectTrigger id="collection">
                    <SelectValue placeholder="Alle Zertifikate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Zertifikate</SelectItem>
                    {collections.map((col) => (
                      <SelectItem key={col.id} value={col.id.toString()}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="include-skills">Skill-Profil einbeziehen</Label>
              <Switch
                id="include-skills"
                checked={includeSkills}
                onCheckedChange={setIncludeSkills}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-certs">Zertifikate einbeziehen</Label>
              <Switch
                id="include-certs"
                checked={includeCertificates}
                onCheckedChange={setIncludeCertificates}
              />
            </div>
          </div>

          {/* Branding Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Branding & Kontakt</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="deine@email.de"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+49 123 456789"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://deine-website.de"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn (optional)</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="linkedin.com/in/deinprofil"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primärfarbe</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#1e40af"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Akzentfarbe</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exportPDF.isPending}>
            Abbrechen
          </Button>
          <Button onClick={handleExport} disabled={exportPDF.isPending || (!includeSkills && !includeCertificates)}>
            {exportPDF.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                PDF wird erstellt...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                PDF exportieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
