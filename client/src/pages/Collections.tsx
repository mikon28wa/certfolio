import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { EmptyState } from "@/components/EmptyState";
import { FolderOpen, Plus, Edit, Trash2, Lock, Globe, ArrowLeft } from "lucide-react";

export default function Collections() {
  const [, navigate] = useLocation();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const { data: collections, isLoading, refetch } = trpc.collections.list.useQuery();
  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      toast.success("Collection erstellt");
      setShowCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      toast.success("Collection aktualisiert");
      setShowEditDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.collections.delete.useMutation({
    onSuccess: () => {
      toast.success("Collection gelöscht");
      setShowDeleteDialog(false);
      setSelectedCollection(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setSlug("");
    setIsPublic(false);
    setSelectedCollection(null);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    createMutation.mutate({ name, description, slug: finalSlug, isPublic });
  };

  const handleEdit = (collection: any) => {
    setSelectedCollection(collection);
    setName(collection.name);
    setDescription(collection.description || "");
    setSlug(collection.slug || "");
    setIsPublic(collection.isPublic);
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedCollection) return;
    if (!name.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    updateMutation.mutate({
      id: selectedCollection.id,
      name,
      description,
      slug: finalSlug,
      isPublic,
    });
  };

  const handleDelete = (collection: any) => {
    setSelectedCollection(collection);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedCollection) return;
    deleteMutation.mutate({ id: selectedCollection.id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8 space-y-6">
        <PageBreadcrumb segments={[{ label: "Collections" }]} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <FolderOpen className="h-7 w-7 text-primary" />
                Collections
              </h1>
              <p className="text-muted-foreground mt-1">
                Gruppiere Zertifikate thematisch für Bewerbungen oder Social Media
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Collection
          </Button>
        </div>

        {/* Collections List */}
        {!collections || collections.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Noch keine Collections"
            description="Erstelle deine erste Collection, um Zertifikate thematisch zu gruppieren."
            actions={[
              {
                label: "Collection erstellen",
                onClick: () => setShowCreateDialog(true),
              },
            ]}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {collections.map((collection) => (
              <Card key={collection.id} className="border-border/50 bg-card/30 backdrop-blur hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {collection.name}
                        {collection.isPublic ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      {collection.slug && (
                        <p className="text-xs text-muted-foreground mt-1">
                          /c/{collection.slug}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(collection)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(collection)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {collection.description && (
                    <CardDescription className="mt-2">{collection.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/collections/${collection.id}`)}
                    className="w-full"
                  >
                    Zertifikate verwalten
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Collection erstellen</DialogTitle>
              <DialogDescription>
                Gruppiere Zertifikate thematisch für Bewerbungen oder Social Media.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="z.B. IT-Zertifikate, Marketing-Skills"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Wofür ist diese Collection?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL-Slug (optional)</Label>
                <Input
                  id="slug"
                  placeholder="z.B. it-skills"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
                <p className="text-xs text-muted-foreground">
                  Wird für öffentliche URL verwendet: /c/{slug || "..."}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic">Öffentlich sichtbar</Label>
                <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Abbrechen
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Erstelle..." : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Collection bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Beschreibung</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">URL-Slug (optional)</Label>
                <Input
                  id="edit-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-isPublic">Öffentlich sichtbar</Label>
                <Switch id="edit-isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                Abbrechen
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Speichere..." : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Collection löschen</DialogTitle>
              <DialogDescription>
                Möchtest du die Collection "{selectedCollection?.name}" wirklich löschen?
                Die Zertifikate selbst bleiben erhalten.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedCollection(null); }}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Lösche..." : "Löschen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
