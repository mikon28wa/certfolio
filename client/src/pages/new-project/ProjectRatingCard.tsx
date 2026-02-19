import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectRatingCardProps {
  complexity: number; setComplexity: (v: number) => void;
  responsibility: number; setResponsibility: (v: number) => void;
  impact: number; setImpact: (v: number) => void;
  impactDescription: string; setImpactDescription: (v: string) => void;
}

export function ProjectRatingCard({
  complexity, setComplexity,
  responsibility, setResponsibility,
  impact, setImpact,
  impactDescription, setImpactDescription,
}: ProjectRatingCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Bewertung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Komplexität</Label>
            <Select value={String(complexity)} onValueChange={v => setComplexity(Number(v))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Einfach (Kursprojekt)</SelectItem>
                <SelectItem value="2">Mittel (Freelance)</SelectItem>
                <SelectItem value="3">Hoch (Produktion)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Verantwortung</Label>
            <Select value={String(responsibility)} onValueChange={v => setResponsibility(Number(v))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Zuarbeit</SelectItem>
                <SelectItem value="2">Teilverantwortung</SelectItem>
                <SelectItem value="3">Gesamtverantwortung</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Impact</Label>
            <Select value={String(impact)} onValueChange={v => setImpact(Number(v))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Kein messbarer Impact</SelectItem>
                <SelectItem value="1">Intern genutzt</SelectItem>
                <SelectItem value="2">Extern sichtbar</SelectItem>
                <SelectItem value="3">Messbare Ergebnisse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="impactDescription">Impact-Beschreibung (optional)</Label>
          <Input id="impactDescription" value={impactDescription} onChange={e => setImpactDescription(e.target.value)} placeholder="z.B. 30% schnellere Ladezeiten, 500+ aktive Nutzer" className="mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
