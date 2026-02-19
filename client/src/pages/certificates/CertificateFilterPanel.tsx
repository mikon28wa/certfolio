import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import {
  CATEGORY_OPTIONS, LEVEL_OPTIONS, PRIORITY_OPTIONS, TIME_RANGE_OPTIONS,
  CATEGORY_LABELS, LEVEL_LABELS,
} from "./useCertificateFilters";

interface CertificateFilterPanelProps {
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterLevel: string;
  setFilterLevel: (v: string) => void;
  filterIssuer: string;
  setFilterIssuer: (v: string) => void;
  filterPriority: string;
  setFilterPriority: (v: string) => void;
  filterTimeRange: string;
  setFilterTimeRange: (v: string) => void;
  uniqueIssuers: string[];
  activeFilterCount: number;
  clearAllFilters: () => void;
}

export function CertificateFilterPanel({
  filterCategory, setFilterCategory,
  filterLevel, setFilterLevel,
  filterIssuer, setFilterIssuer,
  filterPriority, setFilterPriority,
  filterTimeRange, setFilterTimeRange,
  uniqueIssuers, activeFilterCount, clearAllFilters,
}: CertificateFilterPanelProps) {
  return (
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
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Kategorie</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Alle Kategorien" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {CATEGORY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Level</label>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Alle Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Level</SelectItem>
              {LEVEL_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Aussteller</label>
          <Select value={filterIssuer} onValueChange={setFilterIssuer}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Alle Aussteller" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Aussteller</SelectItem>
              {uniqueIssuers.map(issuer => (
                <SelectItem key={issuer} value={issuer}>{issuer}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Priorität</label>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Alle Prioritäten" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Prioritäten</SelectItem>
              {PRIORITY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Zeitraum</label>
          <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Alle Zeiträume" /></SelectTrigger>
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
              <button onClick={() => setFilterCategory("all")} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filterLevel !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Level: {LEVEL_LABELS[filterLevel]}
              <button onClick={() => setFilterLevel("all")} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filterIssuer !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Aussteller: {filterIssuer}
              <button onClick={() => setFilterIssuer("all")} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filterPriority !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Priorität: {filterPriority === "important" ? "Wichtig" : "Normal"}
              <button onClick={() => setFilterPriority("all")} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filterTimeRange !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Zeitraum: {TIME_RANGE_OPTIONS.find(o => o.value === filterTimeRange)?.label}
              <button onClick={() => setFilterTimeRange("all")} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
