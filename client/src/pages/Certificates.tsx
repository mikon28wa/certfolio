import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Award, Plus, Search, FileText, ExternalLink, Shield, Trash2, Edit, X, Filter, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import EditCertificateDialog from "@/components/EditCertificateDialog";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";

// ==================== CONSTANTS ====================

const CATEGORY_OPTIONS = [
  { value: "it", label: "IT & Software" },
  { value: "marketing", label: "Marketing" },
  { value: "management", label: "Management" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Eigene Kategorie" },
] as const;

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "important", label: "Wichtig" },
  { value: "normal", label: "Normal" },
] as const;

const TIME_RANGE_OPTIONS = [
  { value: "30", label: "Letzte 30 Tage" },
  { value: "90", label: "Letzte 3 Monate" },
  { value: "180", label: "Letzte 6 Monate" },
  { value: "365", label: "Letztes Jahr" },
  { value: "730", label: "Letzte 2 Jahre" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  it: "IT & Software",
  marketing: "Marketing",
  management: "Management",
  healthcare: "Healthcare",
  other: "Eigene Kategorie",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

// ==================== COMPONENT ====================

export default function Certificates() {
  const { user } = useAuth();
  
  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterIssuer, setFilterIssuer] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Edit dialog state
  const [editCert, setEditCert] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
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

  // Extract unique issuers for the issuer filter dropdown
  const uniqueIssuers = useMemo(() => {
    if (!certificates) return [];
    const issuers = Array.from(new Set(certificates.map(c => c.issuer))).sort();
    return issuers;
  }, [certificates]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCategory !== "all") count++;
    if (filterLevel !== "all") count++;
    if (filterIssuer !== "all") count++;
    if (filterPriority !== "all") count++;
    if (filterTimeRange !== "all") count++;
    return count;
  }, [filterCategory, filterLevel, filterIssuer, filterPriority, filterTimeRange]);

  // Apply all filters
  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];
    
    return certificates.filter((cert) => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          cert.title.toLowerCase().includes(query) ||
          cert.issuer.toLowerCase().includes(query) ||
          cert.description?.toLowerCase().includes(query) ||
          cert.skills?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (filterCategory !== "all" && cert.category !== filterCategory) return false;
      
      // Level filter
      if (filterLevel !== "all" && cert.level !== filterLevel) return false;
      
      // Issuer filter
      if (filterIssuer !== "all" && cert.issuer !== filterIssuer) return false;
      
      // Priority filter
      if (filterPriority !== "all" && cert.priority !== filterPriority) return false;
      
      // Time range filter
      if (filterTimeRange !== "all" && cert.issueDate) {
        const days = parseInt(filterTimeRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const certDate = new Date(cert.issueDate);
        if (certDate < cutoffDate) return false;
      }
      
      return true;
    });
  }, [certificates, searchQuery, filterCategory, filterLevel, filterIssuer, filterPriority, filterTimeRange]);

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Möchtest du "${title}" wirklich löschen?`)) {
      await deleteCertificate.mutateAsync({ id });
    }
  };

  const handleEdit = (cert: any) => {
    setEditCert(cert);
    setEditDialogOpen(true);
  };

  const clearAllFilters = () => {
    setFilterCategory("all");
    setFilterLevel("all");
    setFilterIssuer("all");
    setFilterPriority("all");
    setFilterTimeRange("all");
    setSearchQuery("");
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

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Meine Zertifikate</h1>
              <p className="text-muted-foreground">
                {certificates?.length || 0} Zertifikat{certificates?.length !== 1 ? "e" : ""}
                {filteredCertificates.length !== (certificates?.length || 0) && (
                  <span className="text-accent ml-1">
                    ({filteredCertificates.length} angezeigt)
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-accent text-accent-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  Erweiterte Filter
                </div>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="mr-1 h-3 w-3" />
                    Alle zurücksetzen
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Kategorie</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Alle Kategorien" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      {CATEGORY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Level</label>
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Alle Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Level</SelectItem>
                      {LEVEL_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Issuer Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Aussteller</label>
                  <Select value={filterIssuer} onValueChange={setFilterIssuer}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Alle Aussteller" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Aussteller</SelectItem>
                      {uniqueIssuers.map(issuer => (
                        <SelectItem key={issuer} value={issuer}>{issuer}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Priorität</label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Alle Prioritäten" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Prioritäten</SelectItem>
                      {PRIORITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Range Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Zeitraum</label>
                  <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Alle Zeiträume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Zeiträume</SelectItem>
                      {TIME_RANGE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active filter tags */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/30">
                  {filterCategory !== "all" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      Kategorie: {CATEGORY_LABELS[filterCategory]}
                      <button onClick={() => setFilterCategory("all")} className="ml-1 hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filterLevel !== "all" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      Level: {LEVEL_LABELS[filterLevel]}
                      <button onClick={() => setFilterLevel("all")} className="ml-1 hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filterIssuer !== "all" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      Aussteller: {filterIssuer}
                      <button onClick={() => setFilterIssuer("all")} className="ml-1 hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filterPriority !== "all" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      Priorität: {filterPriority === "important" ? "Wichtig" : "Normal"}
                      <button onClick={() => setFilterPriority("all")} className="ml-1 hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filterTimeRange !== "all" && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      Zeitraum: {TIME_RANGE_OPTIONS.find(o => o.value === filterTimeRange)?.label}
                      <button onClick={() => setFilterTimeRange("all")} className="ml-1 hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container py-8">
        {filteredCertificates.length > 0 ? (
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

                    {/* Skills */}
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

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(cert)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Bearbeiten
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
                {searchQuery || activeFilterCount > 0
                  ? "Keine Zertifikate gefunden"
                  : "Noch keine Zertifikate"}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {searchQuery || activeFilterCount > 0
                  ? "Versuche andere Suchbegriffe oder setze die Filter zurück"
                  : "Beginne damit, dein erstes Zertifikat hochzuladen"}
              </p>
              {searchQuery || activeFilterCount > 0 ? (
                <Button variant="outline" onClick={clearAllFilters}>
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

      {/* Edit Dialog */}
      <EditCertificateDialog
        certificate={editCert}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
