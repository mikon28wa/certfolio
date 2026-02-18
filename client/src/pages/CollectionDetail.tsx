import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, Plus, Trash2, FileText, Award } from "lucide-react";

export default function CollectionDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/collections/:id");
  const collectionId = params?.id ? parseInt(params.id) : null;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string>("");

  const { data: collection, isLoading: collectionLoading } = trpc.collections.get.useQuery(
    { id: collectionId! },
    { enabled: !!collectionId }
  );

  const { data: certificates, isLoading: certificatesLoading, refetch: refetchCertificates } = 
    trpc.collections.getCertificates.useQuery(
      { collectionId: collectionId! },
      { enabled: !!collectionId }
    );

  const { data: allCertificates } = trpc.certificates.list.useQuery();

  const addMutation = trpc.collections.addCertificate.useMutation({
    onSuccess: () => {
      toast.success("Zertifikat hinzugefügt");
      setShowAddDialog(false);
      setSelectedCertificateId("");
      refetchCertificates();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMutation = trpc.collections.removeCertificate.useMutation({
    onSuccess: () => {
      toast.success("Zertifikat entfernt");
      refetchCertificates();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAdd = () => {
    if (!selectedCertificateId || !collectionId) return;
    addMutation.mutate({
      collectionId,
      certificateId: parseInt(selectedCertificateId),
    });
  };

  const handleRemove = (certificateId: number) => {
    if (!collectionId) return;
    removeMutation.mutate({
      collectionId,
      certificateId,
    });
  };

  if (!collectionId) {
    return <div>Invalid collection ID</div>;
  }

  if (collectionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return <div>Collection nicht gefunden</div>;
  }

  // Filter out certificates that are already in the collection
  const availableCertificates = allCertificates?.filter(
    (cert) => !certificates?.some((c) => c.id === cert.id)
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8 space-y-6">
        <PageBreadcrumb
          segments={[
            { label: "Collections", href: "/collections" },
            { label: collection.name },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/collections")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground mt-1">{collection.description}</p>
              )}
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} disabled={availableCertificates.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Zertifikat hinzufügen
          </Button>
        </div>

        {/* Certificates List */}
        {certificatesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : !certificates || certificates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Noch keine Zertifikate"
            description="Füge Zertifikate zu dieser Collection hinzu."
            actions={availableCertificates.length > 0 ? [
              {
                label: "Zertifikat hinzufügen",
                onClick: () => setShowAddDialog(true),
              },
            ] : []}
          />
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="border-border/50 bg-card/30 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        {cert.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{cert.issuer}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(cert.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {(cert.level || cert.category) && (
                  <CardContent>
                    <div className="flex gap-2">
                      {cert.level && <Badge variant="outline">{cert.level}</Badge>}
                      {cert.category && <Badge variant="secondary">{cert.category}</Badge>}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Add Certificate Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zertifikat hinzufügen</DialogTitle>
              <DialogDescription>
                Wähle ein Zertifikat aus, das du zu dieser Collection hinzufügen möchtest.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedCertificateId} onValueChange={setSelectedCertificateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Zertifikat auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableCertificates.map((cert) => (
                    <SelectItem key={cert.id} value={cert.id.toString()}>
                      {cert.title} ({cert.issuer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedCertificateId("");
                }}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!selectedCertificateId || addMutation.isPending}
              >
                {addMutation.isPending ? "Füge hinzu..." : "Hinzufügen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
