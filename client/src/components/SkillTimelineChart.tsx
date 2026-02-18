import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TimelineDataPoint {
  date: Date;
  level: number;
  totalPoints: number;
  certificateCount: number;
  projectCount: number;
}

interface SkillTimelineChartProps {
  skillName: string;
  data: TimelineDataPoint[];
}

export function SkillTimelineChart({ skillName, data }: SkillTimelineChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Skill-Entwicklung: {skillName}</CardTitle>
          <CardDescription>Noch keine historischen Daten vorhanden</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Snapshots werden automatisch bei Skill-Neuberechnungen erstellt.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString("de-DE", { month: "short", year: "numeric" }),
    Level: d.level,
    Punkte: d.totalPoints,
    Zertifikate: d.certificateCount,
    Projekte: d.projectCount,
  }));

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle>Skill-Entwicklung: {skillName}</CardTitle>
        <CardDescription>
          Zeitreihe der Skill-Level-Entwicklung basierend auf Snapshots
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: "12px" }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(30, 41, 59, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="Level" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: "#3b82f6", r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Punkte" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{data[data.length - 1].level}</div>
            <div className="text-xs text-muted-foreground">Aktuelles Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{data[data.length - 1].certificateCount}</div>
            <div className="text-xs text-muted-foreground">Zertifikate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{data[data.length - 1].projectCount}</div>
            <div className="text-xs text-muted-foreground">Projekte</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
