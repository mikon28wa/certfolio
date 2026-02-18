import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Award, Briefcase, FolderOpen, Plus, Settings, Share2, FileDown } from "lucide-react";
import { Link } from "wouter";
import { ExportDialog } from "@/components/ExportDialog";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { data: certificates, isLoading: certsLoading } = trpc.certificates.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: collections, isLoading: collectionsLoading } = trpc.collections.list.useQuery(undefined, {
    enabled: !!user,
  });

  if (loading || certsLoading || collectionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  const certificateCount = certificates?.length || 0;
  const collectionCount = collections?.length || 0;
  const verifiedCount = certificates?.filter(c => c.isVerified).length || 0;

  return (
    <div className="min-h-screen">
      {/* Header with technical lines */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">CertFolio</h1>
              <p className="text-muted-foreground">Dein professionelles Zertifikatsportfolio</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                <FileDown className="mr-2 h-4 w-4" />
                PDF Export
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </Button>
              <Button asChild>
                <Link href="/certificates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Zertifikat hinzufügen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zertifikate</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{certificateCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {verifiedCount} verifiziert
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <FolderOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{collectionCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Thematische Sets
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Öffentliches Profil</CardTitle>
              <Share2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium mb-2">
                {user?.profileSlug ? (
                  <a 
                    href={`/${user.profileSlug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    /{user.profileSlug}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Nicht konfiguriert</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.profileSlug ? "Profil ist öffentlich" : "Richte dein Profil ein"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Zertifikate verwalten</CardTitle>
              <CardDescription>
                Lade neue Zertifikate hoch oder bearbeite bestehende
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/certificates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Zertifikat
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/certificates">
                  Alle anzeigen
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Collections verwalten</CardTitle>
              <CardDescription>
                Gruppiere Zertifikate thematisch für Bewerbungen
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/collections">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Collections ansehen
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Projekte dokumentieren</CardTitle>
              <CardDescription>
                Füge Praxisprojekte als Nachweis deiner Skills hinzu
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/projects/new">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Neues Projekt
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Skill Profile Card */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Dein Skill-Profil
            </CardTitle>
            <CardDescription>
              Automatisch aggregierte Skills aus deinen Zertifikaten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Entdecke, welche Fähigkeiten du durch deine Zertifikate nachweisen kannst. 
              Das System analysiert automatisch deine Zertifikate und erstellt ein detailliertes Skill-Profil.
            </p>
            <Button asChild>
              <Link href="/skills">
                Skill-Profil ansehen
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-1">
        </div>

        {/* Recent Certificates */}
        {certificates && certificates.length > 0 && (
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Neueste Zertifikate</CardTitle>
              <CardDescription>
                Deine zuletzt hinzugefügten Zertifikate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.slice(0, 5).map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      {cert.issueDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(cert.issueDate).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/certificates/${cert.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {certificates && certificates.length === 0 && (
          <EmptyState
            icon={Award}
            title="Noch keine Zertifikate"
            description="Beginne damit, dein erstes Zertifikat hochzuladen und baue dein professionelles Portfolio auf."
            actions={[
              {
                label: "Erstes Zertifikat hinzufügen",
                href: "/certificates/new",
                icon: <Plus className="mr-2 h-4 w-4" />,
              },
              {
                label: "Projekt dokumentieren",
                href: "/projects/new",
                variant: "outline",
                icon: <Briefcase className="mr-2 h-4 w-4" />,
              },
            ]}
          />
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        collections={collections || []}
      />
    </div>
  );
}
