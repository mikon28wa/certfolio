import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Award, Plus, Search, FileText, ExternalLink, Shield, Trash2, Edit } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Certificates() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: certificates, isLoading, refetch } = trpc.certificates.list.useQuery(undefined, {
    enabled: !!user,
  });
  
  const deleteCertificate = trpc.certificates.delete.useMutation({
    onSuccess: () => {
      toast.success("Zertifikat gelöscht");
      refetch();
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Möchtest du "${title}" wirklich löschen?`)) {
      await deleteCertificate.mutateAsync({ id });
    }
  };

  const filteredCertificates = certificates?.filter((cert) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cert.title.toLowerCase().includes(query) ||
      cert.issuer.toLowerCase().includes(query) ||
      cert.description?.toLowerCase().includes(query)
    );
  });

  const getCategoryLabel = (category: string | null) => {
    const labels: Record<string, string> = {
      it: "IT & Software",
      marketing: "Marketing",
      management: "Management",
      healthcare: "Healthcare",
      other: "Sonstiges",
    };
    return category ? labels[category] || category : null;
  };

  const getLevelLabel = (level: string | null) => {
    const labels: Record<string, string> = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      expert: "Expert",
    };
    return level ? labels[level] || level : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Lade Zertifikate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Meine Zertifikate</h1>
              <p className="text-muted-foreground">
                {certificates?.length || 0} Zertifikat{certificates?.length !== 1 ? "e" : ""}
              </p>
            </div>
            <Button asChild>
              <Link href="/certificates/new">
                <Plus className="mr-2 h-4 w-4" />
                Neues Zertifikat
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zertifikate durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="container py-8">
        {filteredCertificates && filteredCertificates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((cert) => (
              <Card
                key={cert.id}
                className="border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-colors"
              >
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

                    {/* Metadata badges */}
                    <div className="flex flex-wrap gap-2">
                      {cert.category && (
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(cert.category)}
                        </Badge>
                      )}
                      {cert.level && (
                        <Badge variant="outline" className="text-xs">
                          {getLevelLabel(cert.level)}
                        </Badge>
                      )}
                    </div>

                    {/* Skills */}
                    {cert.skills && (
                      <div className="flex flex-wrap gap-1">
                        {cert.skills.split(",").slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/certificates/${cert.id}`}>
                          <Edit className="mr-1 h-3 w-3" />
                          Bearbeiten
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cert.id, cert.title)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-border/50 bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "Keine Zertifikate gefunden" : "Noch keine Zertifikate"}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {searchQuery
                  ? "Versuche einen anderen Suchbegriff"
                  : "Beginne damit, dein erstes Zertifikat hochzuladen"}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/certificates/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Erstes Zertifikat hinzufügen
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
