import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import type { SkillMapping, EditCertificateFormActions, SkillEditorState } from "./types";

interface CertificateSkillsTabProps {
  skillMappings: SkillMapping[];
  skillEditor: Pick<SkillEditorState, "newSkillName" | "newSkillCategory" | "newSkillWeight">;
  actions: Pick<
    EditCertificateFormActions,
    "addSkill" | "removeSkill" | "updateSkillWeight" | "setNewSkillName" | "setNewSkillCategory" | "setNewSkillWeight"
  >;
  totalWeight: number;
}

function SkillMappingRow({
  mapping,
  index,
  onUpdateWeight,
  onRemove,
}: {
  mapping: SkillMapping;
  index: number;
  onUpdateWeight: (index: number, weight: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{mapping.skillName}</span>
          <span className="text-xs text-blue-400/60 bg-blue-900/30 px-2 py-0.5 rounded">
            {mapping.skillCategory}
          </span>
        </div>
        {mapping.reasoning && (
          <p className="text-xs text-blue-400/50 mt-1">{mapping.reasoning}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={100}
          value={mapping.weight}
          onChange={(e) => onUpdateWeight(index, e.target.value)}
          className="w-20 bg-blue-950/30 border-blue-500/30 text-white text-center text-sm"
        />
        <span className="text-xs text-blue-400/60">%</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function AddSkillForm({
  skillEditor,
  onAdd,
  onSetName,
  onSetCategory,
  onSetWeight,
}: {
  skillEditor: Pick<SkillEditorState, "newSkillName" | "newSkillCategory" | "newSkillWeight">;
  onAdd: () => void;
  onSetName: (name: string) => void;
  onSetCategory: (category: string) => void;
  onSetWeight: (weight: string) => void;
}) {
  const inputClasses = "bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40";

  return (
    <div className="border-t border-blue-500/20 pt-4">
      <Label className="text-blue-300 text-xs uppercase tracking-wider mb-2 block">
        Neuen Skill hinzufügen
      </Label>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            value={skillEditor.newSkillName}
            onChange={(e) => onSetName(e.target.value)}
            placeholder="Skill-Name"
            className={inputClasses}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
          />
        </div>
        <div className="w-36">
          <Select value={skillEditor.newSkillCategory} onValueChange={onSetCategory}>
            <SelectTrigger className="bg-blue-950/30 border-blue-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1628] border-blue-500/30">
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Soft Skills">Soft Skills</SelectItem>
              <SelectItem value="Domain">Domain</SelectItem>
              <SelectItem value="Tools">Tools</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-20">
          <Input
            type="number"
            min={0}
            max={100}
            value={skillEditor.newSkillWeight}
            onChange={(e) => onSetWeight(e.target.value)}
            className="bg-blue-950/30 border-blue-500/30 text-white text-center"
          />
        </div>
        <Button
          onClick={onAdd}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white h-10"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CertificateSkillsTab({
  skillMappings,
  skillEditor,
  actions,
  totalWeight,
}: CertificateSkillsTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-950/20">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-blue-300 text-xs uppercase tracking-wider">
            Skill-Mappings ({skillMappings.length})
          </Label>
          <span className={`text-xs ${totalWeight > 100 ? "text-red-400" : "text-blue-400/60"}`}>
            Gesamt: {totalWeight}/100
          </span>
        </div>

        {/* Existing skills */}
        {skillMappings.length === 0 ? (
          <p className="text-sm text-blue-400/50 text-center py-6">
            Keine Skills zugeordnet. Füge manuell Skills hinzu oder nutze die KI-Analyse.
          </p>
        ) : (
          <div className="space-y-2 mb-4">
            {skillMappings.map((mapping, index) => (
              <SkillMappingRow
                key={`${mapping.skillName}-${index}`}
                mapping={mapping}
                index={index}
                onUpdateWeight={actions.updateSkillWeight}
                onRemove={actions.removeSkill}
              />
            ))}
          </div>
        )}

        {/* Add new skill */}
        <AddSkillForm
          skillEditor={skillEditor}
          onAdd={actions.addSkill}
          onSetName={actions.setNewSkillName}
          onSetCategory={actions.setNewSkillCategory}
          onSetWeight={actions.setNewSkillWeight}
        />
      </div>

      {/* Weight warning */}
      {totalWeight > 100 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-sm text-red-300">
            Die Gesamtgewichtung ({totalWeight}%) überschreitet 100%. Bitte passe die Werte an.
          </p>
        </div>
      )}
    </div>
  );
}
