import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  icon?: React.ReactNode;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <Card className={`border-2 border-dashed border-border/50 bg-card/30 ${className || ""}`}>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
        <p className="text-muted-foreground text-center mb-8 max-w-md leading-relaxed">
          {description}
        </p>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {actions.map((action, index) => {
              const btn = (
                <Button
                  key={index}
                  variant={action.variant || (index === 0 ? "default" : "outline")}
                  onClick={action.onClick}
                >
                  {action.icon}
                  {action.label}
                </Button>
              );
              if (action.href) {
                return (
                  <Button
                    key={index}
                    variant={action.variant || (index === 0 ? "default" : "outline")}
                    asChild
                  >
                    <Link href={action.href}>
                      {action.icon}
                      {action.label}
                    </Link>
                  </Button>
                );
              }
              return btn;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
