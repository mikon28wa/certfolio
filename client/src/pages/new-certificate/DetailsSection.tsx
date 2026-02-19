import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DetailsSectionProps {
  title: string;
  setTitle: (v: string) => void;
  issuer: string;
  setIssuer: (v: string) => void;
  issueDate: string;
  setIssueDate: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}

export function DetailsSection({
  title, setTitle, issuer, setIssuer,
  issueDate, setIssueDate, description, setDescription,
}: DetailsSectionProps) {
  return (
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
  );
}
