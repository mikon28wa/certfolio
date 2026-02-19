import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, FileText, Link as LinkIcon, X, AlertCircle } from "lucide-react";

interface UploadSectionProps {
  selectedFile: File | null;
  filePreview: string | null;
  externalUrl: string;
  setExternalUrl: (url: string) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearFile: () => void;
  isAnalyzing: boolean;
  handleAnalyze: () => void;
  hasBothSources: boolean;
}

export function UploadSection({
  selectedFile, filePreview, externalUrl, setExternalUrl,
  handleDrop, handleFileChange, clearFile,
  isAnalyzing, handleAnalyze, hasBothSources,
}: UploadSectionProps) {
  return (
    <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm mb-6">
      <CardHeader>
        <CardTitle>Zertifikat hinzufügen</CardTitle>
        <CardDescription>
          Du kannst entweder eine Datei hochladen oder einen Link zum Zertifikat einfügen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            <FileText className="inline h-4 w-4 mr-2" />
            Datei hochladen
          </Label>
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Datei hierher ziehen oder klicken</p>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-background/30">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-accent" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {filePreview && (
                <div className="border border-border/50 rounded-lg overflow-hidden max-h-64">
                  <img src={filePreview} alt="Vorschau" className="w-full h-auto" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">oder</span>
          </div>
        </div>

        {/* External Link */}
        <div>
          <Label htmlFor="externalUrl" className="text-base font-semibold mb-3 block">
            <LinkIcon className="inline h-4 w-4 mr-2" />
            Externer Link
          </Label>
          <Input
            id="externalUrl"
            type="url"
            placeholder="https://www.coursera.org/account/accomplishments/..."
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Link zu deinem Zertifikat (z.B. von Coursera, edX, Udemy)
          </p>
        </div>

        {/* Warning if both are set */}
        {hasBothSources && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              Du hast sowohl eine Datei als auch einen Link angegeben. Bei der Analyse wird die <strong>Datei priorisiert</strong>.
            </AlertDescription>
          </Alert>
        )}

        {/* Analyze Button */}
        {(selectedFile || externalUrl) && (
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full"
            variant="secondary"
          >
            {isAnalyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analysiere...</>
            ) : (
              <><FileText className="mr-2 h-4 w-4" />Automatisch analysieren (KI)</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
