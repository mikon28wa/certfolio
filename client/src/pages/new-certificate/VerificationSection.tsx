import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface VerificationSectionProps {
  isVerified: boolean;
  setIsVerified: (v: boolean) => void;
  verificationUrl: string;
  setVerificationUrl: (v: string) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
}

export function VerificationSection({
  isVerified, setIsVerified, verificationUrl, setVerificationUrl,
  isPublic, setIsPublic,
}: VerificationSectionProps) {
  return (
    <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm mb-6">
      <CardHeader>
        <CardTitle>Verifizierung & Sichtbarkeit</CardTitle>
        <CardDescription>Verifizierungsstatus und Datenschutzeinstellungen</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isVerified" className="font-medium">Verifiziert</Label>
            <p className="text-xs text-muted-foreground">Zertifikat wurde vom Aussteller bestätigt</p>
          </div>
          <Switch
            id="isVerified"
            checked={isVerified}
            onCheckedChange={setIsVerified}
          />
        </div>

        {isVerified && (
          <div>
            <Label htmlFor="verificationUrl">Verifizierungs-URL</Label>
            <Input
              id="verificationUrl"
              type="url"
              value={verificationUrl}
              onChange={(e) => setVerificationUrl(e.target.value)}
              placeholder="https://verify.example.com/..."
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div>
            <Label htmlFor="isPublic" className="font-medium">Öffentlich sichtbar</Label>
            <p className="text-xs text-muted-foreground">In deinem öffentlichen Portfolio anzeigen</p>
          </div>
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>
      </CardContent>
    </Card>
  );
}
