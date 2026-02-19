import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Award, Plus, Search, X, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import EditCertificateDialog from "@/components/EditCertificateDialog";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { useCertificateFilters, CertificateFilterPanel, CertificateCard } from "./certificates";

export default function Certificates() {
  const { user } = useAuth();
  const [editCert, setEditCert] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: certificates, isLoading, refetch } = trpc.certificates.list.useQuery(undefined, {
    enabled: !!user,
  });

  const filters = useCertificateFilters(certificates);

  const deleteCertificate = trpc.certificates.delete.useMutation({
    onSuccess: () => { toast.success("Zertifikat gelöscht"); refetch(); },
    onError: () => { toast.error("Fehler beim Löschen"); },
  });

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Möchtest du "${title}" wirklich löschen?`)) {
      await deleteCertificate.mutateAsync({ id });
    }
  };

  const handleEdit = (cert: any) => {
    setEditCert(cert);
    setEditDialogOpen(true);
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
          <PageBreadcrumb segments={[{ label: "Zertifikate" }]} />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Meine Zertifikate</h1>
              <p className="text-muted-foreground">
                {certificates?.length || 0} Zertifikat{certificates?.length !== 1 ? "e" : ""}
                {filters.filteredCertificates.length !== (certificates?.length || 0) && (
                  <span className="text-accent ml-1">
                    ({filters.filteredCertificates.length} angezeigt)
                  </span>
                )}
              </p>
            </div>
            <Button asChild>
              <Link href="/certificates/new">
                <Plus className="mr-2 h-4 w-4" />
                Neues Zertifikat
              </Link>
            </Button>
          </div>

          {/* Search + Filter Toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zertifikate durchsuchen (Titel, Aussteller, Skills)..."
                value={filters.searchQuery}
                onChange={(e) => filters.setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => filters.setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={filters.showFilters ? "default" : "outline"}
              onClick={() => filters.setShowFilters(!filters.showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
              {filters.activeFilterCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-accent text-accent-foreground">
                  {filters.activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {filters.showFilters && (
            <CertificateFilterPanel
              filterCategory={filters.filterCategory}
              setFilterCategory={filters.setFilterCategory}
              filterLevel={filters.filterLevel}
              setFilterLevel={filters.setFilterLevel}
              filterIssuer={filters.filterIssuer}
              setFilterIssuer={filters.setFilterIssuer}
              filterPriority={filters.filterPriority}
              setFilterPriority={filters.setFilterPriority}
              filterTimeRange={filters.filterTimeRange}
              setFilterTimeRange={filters.setFilterTimeRange}
              uniqueIssuers={filters.uniqueIssuers}
              activeFilterCount={filters.activeFilterCount}
              clearAllFilters={filters.clearAllFilters}
            />
          )}
        </div>
      </div>

      <div className="container py-8">
        {filters.filteredCertificates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filters.filteredCertificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-border/50 bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {filters.searchQuery || filters.activeFilterCount > 0
                  ? "Keine Zertifikate gefunden"
                  : "Noch keine Zertifikate"}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {filters.searchQuery || filters.activeFilterCount > 0
                  ? "Versuche andere Suchbegriffe oder setze die Filter zurück"
                  : "Beginne damit, dein erstes Zertifikat hochzuladen"}
              </p>
              {filters.searchQuery || filters.activeFilterCount > 0 ? (
                <Button variant="outline" onClick={filters.clearAllFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Filter zurücksetzen
                </Button>
              ) : (
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

      <EditCertificateDialog
        certificate={editCert}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
