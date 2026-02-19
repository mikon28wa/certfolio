import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link as LinkIcon, Image, FileText, Trash2 } from "lucide-react";
import type { MediaItem } from "./useNewProjectForm";

interface ProjectMediaCardProps {
  mediaItems: MediaItem[];
  handleAddMediaFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddMediaLink: () => void;
  handleRemoveMedia: (index: number) => void;
  updateMediaItem: (index: number, updates: Partial<MediaItem>) => void;
}

export function ProjectMediaCard({
  mediaItems, handleAddMediaFile, handleAddMediaLink,
  handleRemoveMedia, updateMediaItem,
}: ProjectMediaCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Medien & Nachweise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Füge Screenshots, PDFs oder Links (GitHub, Figma, YouTube, etc.) als Nachweise hinzu.
        </p>

        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" multiple accept="image/*,application/pdf" onChange={handleAddMediaFile} className="hidden" />
            <Button variant="outline" size="sm" asChild>
              <span><Upload className="h-4 w-4 mr-1" /> Datei hochladen</span>
            </Button>
          </label>
          <Button variant="outline" size="sm" onClick={handleAddMediaLink}>
            <LinkIcon className="h-4 w-4 mr-1" /> Link hinzufügen
          </Button>
        </div>

        {mediaItems.length > 0 && (
          <div className="space-y-3">
            {mediaItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-md border border-border/50 bg-background/50">
                {/* Preview */}
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                  {item.preview ? (
                    <img src={item.preview} alt="" className="w-12 h-12 rounded object-cover" />
                  ) : item.mediaType === "pdf" ? (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  ) : item.mediaType === "link" ? (
                    <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Image className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {item.mediaType === "link" ? (
                    <div className="flex gap-2">
                      <Select value={item.linkType || "github"} onValueChange={v => updateMediaItem(index, { linkType: v })}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="figma">Figma</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="other">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input value={item.externalUrl || ""} onChange={e => updateMediaItem(index, { externalUrl: e.target.value })} placeholder="https://..." className="flex-1" />
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{item.fileName}</p>
                  )}
                  <Input value={item.caption || ""} onChange={e => updateMediaItem(index, { caption: e.target.value })} placeholder="Beschreibung (optional)" className="text-xs" />
                </div>

                <Button variant="ghost" size="icon" onClick={() => handleRemoveMedia(index)} className="text-destructive hover:text-destructive shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
