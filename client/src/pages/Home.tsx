import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, FolderOpen, Share2, Shield, Zap, Globe } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  // Redirect to dashboard if logged in
  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="container py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Technical corner brackets */}
            <div className="relative inline-block mb-8">
              <div className="absolute -top-4 -left-4 w-12 h-12 border-l-2 border-t-2 border-accent/50" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-r-2 border-b-2 border-accent/50" />
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight px-8">
                CertFolio
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Dein professionelles Zertifikatsportfolio. Sammle, verwalte und präsentiere alle deine Online-Zertifikate an einem Ort.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <a href={getLoginUrl()}>
                  Jetzt starten
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <a href="#features">
                  Mehr erfahren
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Technical line decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>

      {/* Features Section */}
      <div id="features" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Funktionen für Power-Learner
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Alles was du brauchst, um deine Weiterbildungen professionell zu präsentieren
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Zentrale Verwaltung</CardTitle>
              <CardDescription>
                Sammle alle Zertifikate von Coursera, Udemy, edX und anderen Plattformen an einem Ort
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Automatische Analyse</CardTitle>
              <CardDescription>
                KI-gestützte Extraktion von Metadaten aus deinen PDF-Zertifikaten – spare Zeit beim Erfassen
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <FolderOpen className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Thematische Collections</CardTitle>
              <CardDescription>
                Erstelle Sets für verschiedene Bewerbungen – Frontend-Dev, Data Science, Marketing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Teilbare Links</CardTitle>
              <CardDescription>
                Generiere öffentliche Portfolio-URLs für Bewerbungen und Social Media
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Verifizierung</CardTitle>
              <CardDescription>
                Markiere Zertifikate als verifiziert mit Original-URLs von Ausstellern
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Export & Integration</CardTitle>
              <CardDescription>
                Exportiere dein Portfolio als PDF oder teile es direkt auf LinkedIn
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="border-t border-border/50 bg-card/30">
        <div className="container py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfekt für
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Power-Learner</h3>
              <p className="text-muted-foreground">
                Die viele Online-Kurse absolvieren und ihre Skills gebündelt präsentieren wollen
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quereinsteiger</h3>
              <p className="text-muted-foreground">
                Die praktische Skills aus Bootcamps und MOOCs professionell nachweisen möchten
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Freiberufler</h3>
              <p className="text-muted-foreground">
                Die Glaubwürdigkeit durch zertifizierte Weiterbildungen erhöhen wollen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border/50">
        <div className="container py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit, dein Portfolio aufzubauen?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Starte jetzt und präsentiere deine Weiterbildungen professionell
            </p>
            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                Kostenlos registrieren
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 bg-card/30">
        <div className="container py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 CertFolio. Dein professionelles Zertifikatsportfolio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
