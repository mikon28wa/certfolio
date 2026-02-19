import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectDetailsCardProps {
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  dateCompleted: string; setDateCompleted: (v: string) => void;
  role: "solo" | "team" | "lead"; setRole: (v: "solo" | "team" | "lead") => void;
  technologies: string; setTechnologies: (v: string) => void;
  projectType: string; setProjectType: (v: string) => void;
  projectUrl: string; setProjectUrl: (v: string) => void;
}

export function ProjectDetailsCard({
  title, setTitle, description, setDescription,
  dateCompleted, setDateCompleted, role, setRole,
  technologies, setTechnologies, projectType, setProjectType,
  projectUrl, setProjectUrl,
}: ProjectDetailsCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Projektdetails</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Projekttitel *</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. E-Commerce Dashboard mit React" className="mt-1" />
        </div>

        <div>
          <Label htmlFor="description">Beschreibung</Label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschreibe das Projekt, seine Ziele und was du gelernt hast..." className="mt-1 w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateCompleted">Abschlussdatum *</Label>
            <Input id="dateCompleted" type="date" value={dateCompleted} onChange={e => setDateCompleted(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Rolle</Label>
            <Select value={role} onValueChange={(v: "solo" | "team" | "lead") => setRole(v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Allein</SelectItem>
                <SelectItem value="team">Team-Mitglied</SelectItem>
                <SelectItem value="lead">Team-Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="technologies">Technologien / Tools</Label>
          <Input id="technologies" value={technologies} onChange={e => setTechnologies(e.target.value)} placeholder="z.B. React, Node.js, PostgreSQL, Figma" className="mt-1" />
        </div>

        <div>
          <Label htmlFor="projectType">Projekttyp</Label>
          <Input id="projectType" value={projectType} onChange={e => setProjectType(e.target.value)} placeholder="z.B. Web-App MVP, Datenanalyse, API-Service" className="mt-1" />
        </div>

        <div>
          <Label htmlFor="projectUrl">Projekt-URL (optional)</Label>
          <Input id="projectUrl" value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://github.com/user/project" className="mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}
