import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Link } from "wouter";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const accepted = localStorage.getItem("cookies-accepted");
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookies-accepted", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto border-2 border-primary/30 bg-card/95 backdrop-blur-lg shadow-2xl">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">🍪 Cookie-Hinweis</h3>
              <p className="text-sm text-muted-foreground">
                Diese Website verwendet nur technisch notwendige Cookies für Login und Session-Management. 
                Wir verwenden keine Tracking- oder Marketing-Cookies. Weitere Informationen findest du in 
                unserer{" "}
                <Link href="/datenschutz" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAccept}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleAccept} size="sm">
              Verstanden
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/datenschutz">
                Mehr erfahren
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
