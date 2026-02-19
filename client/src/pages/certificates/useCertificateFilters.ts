import { useState, useMemo } from "react";

export const CATEGORY_OPTIONS = [
  { value: "it", label: "IT & Software" },
  { value: "marketing", label: "Marketing" },
  { value: "management", label: "Management" },
  { value: "healthcare", label: "Healthcare" },
  { value: "other", label: "Eigene Kategorie" },
] as const;

export const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

export const PRIORITY_OPTIONS = [
  { value: "important", label: "Wichtig" },
  { value: "normal", label: "Normal" },
] as const;

export const TIME_RANGE_OPTIONS = [
  { value: "30", label: "Letzte 30 Tage" },
  { value: "90", label: "Letzte 3 Monate" },
  { value: "180", label: "Letzte 6 Monate" },
  { value: "365", label: "Letztes Jahr" },
  { value: "730", label: "Letzte 2 Jahre" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  it: "IT & Software",
  marketing: "Marketing",
  management: "Management",
  healthcare: "Healthcare",
  other: "Eigene Kategorie",
};

export const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export function useCertificateFilters(certificates: any[] | undefined) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterIssuer, setFilterIssuer] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const uniqueIssuers = useMemo(() => {
    if (!certificates) return [];
    return Array.from(new Set(certificates.map(c => c.issuer))).sort();
  }, [certificates]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterCategory !== "all") count++;
    if (filterLevel !== "all") count++;
    if (filterIssuer !== "all") count++;
    if (filterPriority !== "all") count++;
    if (filterTimeRange !== "all") count++;
    return count;
  }, [filterCategory, filterLevel, filterIssuer, filterPriority, filterTimeRange]);

  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];

    return certificates.filter((cert) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          cert.title.toLowerCase().includes(query) ||
          cert.issuer.toLowerCase().includes(query) ||
          cert.description?.toLowerCase().includes(query) ||
          cert.skills?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (filterCategory !== "all" && cert.category !== filterCategory) return false;
      if (filterLevel !== "all" && cert.level !== filterLevel) return false;
      if (filterIssuer !== "all" && cert.issuer !== filterIssuer) return false;
      if (filterPriority !== "all" && cert.priority !== filterPriority) return false;
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

  const clearAllFilters = () => {
    setFilterCategory("all");
    setFilterLevel("all");
    setFilterIssuer("all");
    setFilterPriority("all");
    setFilterTimeRange("all");
    setSearchQuery("");
  };

  return {
    searchQuery, setSearchQuery,
    filterCategory, setFilterCategory,
    filterLevel, setFilterLevel,
    filterIssuer, setFilterIssuer,
    filterPriority, setFilterPriority,
    filterTimeRange, setFilterTimeRange,
    showFilters, setShowFilters,
    uniqueIssuers, activeFilterCount,
    filteredCertificates, clearAllFilters,
  };
}
