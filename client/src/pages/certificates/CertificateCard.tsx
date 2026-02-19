import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Shield, Trash2, Edit } from "lucide-react";
import { CATEGORY_LABELS, LEVEL_LABELS } from "./useCertificateFilters";

interface CertificateCardProps {
  cert: any;
  onEdit: (cert: any) => void;
  onDelete: (id: number, title: string) => void;
}

export function CertificateCard({ cert, onEdit, onDelete }: CertificateCardProps) {
  return (
    <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {cert.fileUrl ? (
              <FileText className="h-5 w-5 text-accent" />
            ) : (
              <ExternalLink className="h-5 w-5 text-accent" />
            )}
            {cert.isVerified && (
              <Shield className="h-4 w-4 text-green-500" />
            )}
          </div>
          {cert.priority === "important" && (
            <Badge variant="default" className="text-xs">Wichtig</Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">{cert.title}</CardTitle>
        <CardDescription className="line-clamp-1">{cert.issuer}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {cert.issueDate && (
            <p className="text-sm text-muted-foreground">
              {new Date(cert.issueDate).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "long",
              })}
            </p>
          )}

          {cert.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {cert.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {cert.category && (
              <Badge variant="secondary" className="text-xs">
                {cert.category === "other" && (cert as any).customCategory
                  ? (cert as any).customCategory
                  : CATEGORY_LABELS[cert.category] || cert.category}
              </Badge>
            )}
            {cert.level && (
              <Badge variant="outline" className="text-xs">
                {LEVEL_LABELS[cert.level] || cert.level}
              </Badge>
            )}
          </div>

          {cert.skills && (
            <div className="flex flex-wrap gap-1">
              {cert.skills.split(",").slice(0, 3).map((skill: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {skill.trim()}
                </Badge>
              ))}
              {cert.skills.split(",").length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{cert.skills.split(",").length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(cert)}>
              <Edit className="mr-1 h-3 w-3" />
              Bearbeiten
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(cert.id, cert.title)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
