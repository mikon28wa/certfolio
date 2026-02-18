import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Sparkles,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  Shield,
  ShieldCheck,
} from "lucide-react";
import type { Certificate, EditCertificateFormState, EditCertificateFormActions } from "./types";

interface CertificateDetailsTabProps {
  certificate: Certificate | null;
  form: EditCertificateFormState;
  actions: Pick<EditCertificateFormActions, "setField" | "handleReanalyze" | "isAnalyzing">;
}

function FilePreview({ certificate }: { certificate: Certificate }) {
  if (!certificate.fileUrl) return null;

  const isImage = certificate.mimeType?.startsWith("image/");
  const isPdf = certificate.mimeType === "application/pdf";

  const linkClasses = "text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1";

  return (
    <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-950/30">
      <Label className="text-blue-300 text-xs uppercase tracking-wider mb-2 block">
        Hochgeladene Datei
      </Label>
      <div className="flex items-center gap-4">
        {isImage ? (
          <img
            src={certificate.fileUrl}
            alt={certificate.title}
            className="w-24 h-24 object-cover rounded border border-blue-500/30"
          />
        ) : (
          <div className="w-24 h-24 bg-blue-900/50 rounded border border-blue-500/30 flex items-center justify-center">
            {isPdf ? (
              <FileText className="w-10 h-10 text-blue-400" />
            ) : (
              <ImageIcon className="w-10 h-10 text-blue-400" />
            )}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-white/80">
            {certificate.fileName || (isImage ? "Bild" : isPdf ? "PDF-Dokument" : "Datei")}
          </p>
          <a
            href={certificate.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClasses}
          >
            <ExternalLink className="w-3 h-3" />
            {isImage ? "Vollbild öffnen" : isPdf ? "PDF öffnen" : "Datei öffnen"}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CertificateDetailsTab({
  certificate,
  form,
  actions,
}: CertificateDetailsTabProps) {
  const { setField, handleReanalyze, isAnalyzing } = actions;

  const inputClasses = "bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40";
  const labelClasses = "text-blue-300 text-xs uppercase tracking-wider";
  const selectContentClasses = "bg-[#0a1628] border-blue-500/30";

  return (
    <div className="space-y-4 mt-4">
      {/* File Preview */}
      {certificate && <FilePreview certificate={certificate} />}

      {/* Re-analyze button */}
      {(certificate?.fileUrl || certificate?.externalUrl) && (
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
          <Label className={labelClasses}>Titel *</Label>
          <Input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            className={inputClasses}
            placeholder="z.B. Full Stack Web Development"
          />
        </div>
        <div>
          <Label className={labelClasses}>Aussteller *</Label>
          <Input
            value={form.issuer}
            onChange={(e) => setField("issuer", e.target.value)}
            className={inputClasses}
            placeholder="z.B. Coursera, Udemy"
          />
        </div>
      </div>

      {/* Date & Level */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className={labelClasses}>Ausstellungsdatum</Label>
          <Input
            type="date"
            value={form.issueDate}
            onChange={(e) => setField("issueDate", e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <Label className={labelClasses}>Level</Label>
          <Select value={form.level} onValueChange={(v) => setField("level", v)}>
            <SelectTrigger className={inputClasses}>
              <SelectValue placeholder="Wählen..." />
            </SelectTrigger>
            <SelectContent className={selectContentClasses}>
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
          <Label className={labelClasses}>Kategorie</Label>
          <Select value={form.category} onValueChange={(v) => setField("category", v)}>
            <SelectTrigger className={inputClasses}>
              <SelectValue placeholder="Wählen..." />
            </SelectTrigger>
            <SelectContent className={selectContentClasses}>
              <SelectItem value="none">Keine Kategorie</SelectItem>
              <SelectItem value="it">IT & Technologie</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="healthcare">Gesundheitswesen</SelectItem>
              <SelectItem value="other">Eigene Kategorie</SelectItem>
            </SelectContent>
          </Select>
          {form.category === "other" && (
            <Input
              value={form.customCategory}
              onChange={(e) => setField("customCategory", e.target.value)}
              className={`${inputClasses} mt-2`}
              placeholder="Eigene Kategorie eingeben..."
              maxLength={100}
            />
          )}
        </div>
        <div>
          <Label className={labelClasses}>Priorität</Label>
          <Select value={form.priority} onValueChange={(v) => setField("priority", v)}>
            <SelectTrigger className={inputClasses}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentClasses}>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="important">Wichtig</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className={labelClasses}>Beschreibung</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={3}
          className={inputClasses}
          placeholder="Kursbeschreibung oder Zusammenfassung..."
        />
      </div>

      {/* External URL */}
      <div>
        <Label className={labelClasses}>Externer Link</Label>
        <Input
          value={form.externalUrl}
          onChange={(e) => setField("externalUrl", e.target.value)}
          className={inputClasses}
          placeholder="https://coursera.org/verify/..."
        />
      </div>

      {/* Verification */}
      <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {form.isVerified ? (
              <ShieldCheck className="w-5 h-5 text-green-400" />
            ) : (
              <Shield className="w-5 h-5 text-blue-400/50" />
            )}
            <div>
              <Label className={labelClasses}>Verifiziert</Label>
              <p className="text-xs text-blue-400/60">
                Wurde dieses Zertifikat verifiziert?
              </p>
            </div>
          </div>
          <Switch checked={form.isVerified} onCheckedChange={(v) => setField("isVerified", v)} />
        </div>
        {form.isVerified && (
          <div className="mt-3">
            <Label className={labelClasses}>Verifizierungs-URL</Label>
            <Input
              value={form.verificationUrl}
              onChange={(e) => setField("verificationUrl", e.target.value)}
              className={inputClasses}
              placeholder="https://coursera.org/verify/ABC123"
            />
          </div>
        )}
      </div>

      {/* Public toggle */}
      <div className="flex items-center justify-between border border-blue-500/20 rounded-lg p-4 bg-blue-950/20">
        <div>
          <Label className={labelClasses}>Öffentlich sichtbar</Label>
          <p className="text-xs text-blue-400/60">
            Zertifikat im öffentlichen Profil anzeigen
          </p>
        </div>
        <Switch checked={form.isPublic} onCheckedChange={(v) => setField("isPublic", v)} />
      </div>
    </div>
  );
}
