import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import type { SkillLink } from "./useNewProjectForm";

interface ProjectSkillsCardProps {
  skillLinks: SkillLink[];
  handleAddSkill: () => void;
  handleRemoveSkill: (index: number) => void;
  updateSkill: (index: number, updates: Partial<SkillLink>) => void;
  isAnalyzing: boolean;
  handleAnalyze: () => void;
  canAnalyze: boolean;
}

export function ProjectSkillsCard({
  skillLinks, handleAddSkill, handleRemoveSkill, updateSkill,
  isAnalyzing, handleAnalyze, canAnalyze,
}: ProjectSkillsCardProps) {
  return (
    <>
      {/* KI Analysis */}
      <Card className="border-primary/30 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            KI-Skill-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Lass die KI automatisch Skills und Gewichtungen aus deiner Projektbeschreibung extrahieren.
          </p>
          <Button onClick={handleAnalyze} disabled={isAnalyzing || !canAnalyze} variant="outline" className="border-primary/50 hover:bg-primary/10">
            {isAnalyzing ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Analysiere...</> : <><Sparkles className="h-4 w-4 mr-2" /> Projekt analysieren</>}
          </Button>
        </CardContent>
      </Card>

      {/* Skills List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Skill-Zuordnung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {skillLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Skills zugeordnet. Nutze die KI-Analyse oder füge manuell Skills hinzu.</p>
          ) : (
            skillLinks.map((skill, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-md border border-border/50 bg-background/50">
                <Input value={skill.skillName} onChange={e => updateSkill(index, { skillName: e.target.value })} placeholder="Skill-Name" className="flex-1" />
                <Select value={skill.skillCategory} onValueChange={v => updateSkill(index, { skillCategory: v })}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Domain Knowledge">Domain</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 w-[80px]">
                  <Input type="number" min={0} max={100} value={skill.weight} onChange={e => updateSkill(index, { weight: Number(e.target.value) })} className="w-[60px] text-center" />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveSkill(index)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
          <Button variant="outline" size="sm" onClick={handleAddSkill} className="mt-2">
            <Plus className="h-4 w-4 mr-1" /> Skill hinzufügen
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
