import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetadataSectionProps {
  skills: string;
  setSkills: (v: string) => void;
  level: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
  setLevel: (v: any) => void;
  category: "it" | "marketing" | "management" | "healthcare" | "other" | undefined;
  setCategory: (v: any) => void;
  customCategory: string;
  setCustomCategory: (v: string) => void;
  priority: "normal" | "important";
  setPriority: (v: any) => void;
}

export function MetadataSection({
  skills, setSkills, level, setLevel,
  category, setCategory, customCategory, setCustomCategory,
  priority, setPriority,
}: MetadataSectionProps) {
  return (
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
            <Select value={level} onValueChange={(val) => setLevel(val)}>
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
            <Select value={category} onValueChange={(val) => setCategory(val)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Wähle eine Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">IT & Software</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="management">Management</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="other">Eigene Kategorie</SelectItem>
              </SelectContent>
            </Select>
            {category === "other" && (
              <div className="mt-2">
                <Input
                  placeholder="Eigene Kategorie eingeben"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="priority">Priorität</Label>
          <Select value={priority} onValueChange={(val) => setPriority(val)}>
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
  );
}
