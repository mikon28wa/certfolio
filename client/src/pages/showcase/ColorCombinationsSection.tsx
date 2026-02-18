import { Card, CardContent } from "@/components/ui/card";

const colorBlocks = [
  { bg: "bg-primary", text: "text-primary-foreground", label: "Primary", desc: "Primary background with foreground text" },
  { bg: "bg-secondary", text: "text-secondary-foreground", label: "Secondary", desc: "Secondary background with foreground text" },
  { bg: "bg-muted", text: "text-muted-foreground", label: "Muted", desc: "Muted background with foreground text" },
  { bg: "bg-accent", text: "text-accent-foreground", label: "Accent", desc: "Accent background with foreground text" },
  { bg: "bg-destructive", text: "text-destructive-foreground", label: "Destructive", desc: "Destructive background with foreground text" },
  { bg: "bg-card", text: "text-card-foreground", label: "Card", desc: "Card background with foreground text", border: true },
  { bg: "bg-popover", text: "text-popover-foreground", label: "Popover", desc: "Popover background with foreground text", border: true },
  { bg: "bg-background", text: "text-foreground", label: "Background", desc: "Default background with foreground text", border: true },
];

export default function ColorCombinationsSection() {
  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-semibold">Color Combinations</h3>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorBlocks.map((block) => (
              <div
                key={block.label}
                className={`${block.bg} ${block.text} rounded-lg p-4 ${block.border ? "border" : ""}`}
              >
                <p className="font-medium mb-1">{block.label}</p>
                <p className="text-sm opacity-90">{block.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
