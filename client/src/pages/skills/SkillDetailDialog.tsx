import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap } from "lucide-react";
import { SkillTimelineChart } from "@/components/SkillTimelineChart";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { LEVEL_LABELS, LEVEL_COLORS, LEVEL_BAR_COLORS, getLevelProgress } from "./constants";

interface SkillDetailDialogProps {
  selectedSkill: string | null;
  onClose: () => void;
  skillDetails: any;
  detailsLoading: boolean;
  timeline: any[] | undefined;
}

export function SkillDetailDialog({
  selectedSkill, onClose, skillDetails, detailsLoading, timeline,
}: SkillDetailDialogProps) {
  return (
    <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedSkill}</DialogTitle>
          <DialogDescription>
            Zertifikate und Projekte, die zu diesem Skill beitragen
          </DialogDescription>
        </DialogHeader>
        {detailsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : skillDetails ? (
          <div className="space-y-5">
            {/* Skill Timeline */}
            {timeline && timeline.length > 0 && (
              <SkillTimelineChart skillName={selectedSkill!} data={timeline} />
            )}

            {timeline && timeline.length === 0 && (
              <div className="p-4 bg-accent/20 rounded-lg border border-border/30 text-sm text-muted-foreground">
                Noch keine historischen Daten für diesen Skill. Snapshots werden automatisch bei Skill-Neuberechnungen erstellt.
              </div>
            )}

            {/* Score Overview */}
            <div className="p-4 bg-accent/20 rounded-lg border border-border/30">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${LEVEL_COLORS[Math.min(5, skillDetails.level)]} border-current/30 bg-current/10 text-sm`}>
                  Level {Math.min(5, skillDetails.level)} – {LEVEL_LABELS[Math.min(5, skillDetails.level)]}
                </Badge>
                {skillDetails.skillCategory && (
                  <Badge variant="outline">{skillDetails.skillCategory}</Badge>
                )}
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-2">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${LEVEL_BAR_COLORS[Math.min(5, skillDetails.level)]}`}
                  style={{ width: `${getLevelProgress(Math.min(5, skillDetails.level), skillDetails.totalPoints)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{skillDetails.totalPoints.toFixed(1)} Punkte</span>
                <span>
                  {skillDetails.level < 5
                    ? `${getLevelProgress(Math.min(5, skillDetails.level), skillDetails.totalPoints).toFixed(0)}% bis Level ${skillDetails.level + 1}`
                    : "Maximales Level"}
                </span>
              </div>
            </div>

            {/* Contributing Certificates */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Beitragende Nachweise
              </h4>
              {skillDetails.contributingCertificates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Noch keine Nachweise für diesen Skill.
                </p>
              ) : (
                skillDetails.contributingCertificates.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-3 border border-border/30 rounded-lg bg-background/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cert.title}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{cert.weight} Punkte</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cert.source === "llm" ? "KI-Analyse" : cert.source === "manual" ? "Manuell" : cert.source}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
