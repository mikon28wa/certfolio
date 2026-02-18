import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EditCertificateFormState, EditCertificateFormActions } from "./types";

interface CertificateAdvancedTabProps {
  form: Pick<
    EditCertificateFormState,
    "courseUuid" | "courseDuration" | "courseCredits" | "learningHours" | "completionGrade"
  >;
  setField: EditCertificateFormActions["setField"];
}

export default function CertificateAdvancedTab({ form, setField }: CertificateAdvancedTabProps) {
  const inputClasses = "bg-blue-950/30 border-blue-500/30 text-white placeholder:text-blue-400/40";

  return (
    <div className="space-y-4 mt-4">
      <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-950/20">
        <Label className="text-blue-300 text-xs uppercase tracking-wider mb-3 block">
          Kurs-Metadaten (für Skill-Score-Berechnung)
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-blue-300/70 text-xs">Kurs-UUID</Label>
            <Input
              value={form.courseUuid}
              onChange={(e) => setField("courseUuid", e.target.value)}
              className={inputClasses}
              placeholder="z.B. coursera-ml-001"
            />
          </div>
          <div>
            <Label className="text-blue-300/70 text-xs">Kursdauer (Stunden)</Label>
            <Input
              type="number"
              value={form.courseDuration}
              onChange={(e) => setField("courseDuration", e.target.value)}
              className={inputClasses}
              placeholder="z.B. 40"
            />
          </div>
          <div>
            <Label className="text-blue-300/70 text-xs">Credits/ECTS</Label>
            <Input
              type="number"
              value={form.courseCredits}
              onChange={(e) => setField("courseCredits", e.target.value)}
              className={inputClasses}
              placeholder="z.B. 5"
            />
          </div>
          <div>
            <Label className="text-blue-300/70 text-xs">Lernstunden (geschätzt)</Label>
            <Input
              type="number"
              value={form.learningHours}
              onChange={(e) => setField("learningHours", e.target.value)}
              className={inputClasses}
              placeholder="z.B. 60"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label className="text-blue-300/70 text-xs">Abschlussnote</Label>
          <Input
            value={form.completionGrade}
            onChange={(e) => setField("completionGrade", e.target.value)}
            className={inputClasses}
            placeholder="z.B. 95%, A+, bestanden"
          />
        </div>
      </div>
    </div>
  );
}
