import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Award,
  BarChart3,
  FileDown,
  FolderOpen,
  LogIn,
  LogOut,
  LayoutDashboard,
  Share2,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">CertFolio</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">by Blue-Banana-Labs</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <a href={getLoginUrl()}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Anmelden / Registrieren
                </a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Blueprint Grid Background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        {/* Decorative Corner Brackets */}
        <div className="absolute top-24 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/20 hidden lg:block" />
        <div className="absolute top-24 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/20 hidden lg:block" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ein Produkt von Blue-Banana-Labs</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Dein digitales</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                Zertifikatsportfolio
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Sammle alle Online-Zertifikate an einem Ort. Analysiere deine Skills automatisch.
              Teile dein Portfolio mit einem Link in Bewerbungen und auf Social Media.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" className="text-base px-8" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Zum Dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="text-base px-8" asChild>
                  <a href={getLoginUrl()}>
                    <LogIn className="mr-2 h-5 w-5" />
                    Kostenlos starten
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button variant="outline" size="lg" className="text-base px-8" asChild>
                <a href="#features">
                  Mehr erfahren
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">PDF</div>
                <div className="text-xs text-muted-foreground mt-1">Upload & Analyse</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">KI</div>
                <div className="text-xs text-muted-foreground mt-1">Skill-Mapping</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">1 Link</div>
                <div className="text-xs text-muted-foreground mt-1">Portfolio teilen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Alles was du brauchst</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Von der Sammlung bis zur Präsentation – CertFolio deckt den gesamten Workflow ab
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <FeatureCard
              icon={<Award className="h-6 w-6" />}
              title="Zertifikate sammeln"
              description="Lade PDFs, Bilder oder Links von Coursera, Udemy, edX und allen anderen Plattformen hoch."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="KI-gestützte Analyse"
              description="Unsere KI extrahiert automatisch Titel, Aussteller, Datum und Skills aus deinen Zertifikaten."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Skill-Mapping"
              description="Jedes Zertifikat wird in gewichtete Skills zerlegt. Dein Skill-Profil wächst mit jedem Kurs."
            />
            <FeatureCard
              icon={<FolderOpen className="h-6 w-6" />}
              title="Collections erstellen"
              description="Gruppiere Zertifikate thematisch – z.B. für eine bestimmte Bewerbung oder Social Media."
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6" />}
              title="Portfolio teilen"
              description="Ein Link für dein gesamtes Portfolio. Perfekt für Bewerbungen, LinkedIn und Lebensläufe."
            />
            <FeatureCard
              icon={<FileDown className="h-6 w-6" />}
              title="PDF-Export"
              description="Exportiere dein Portfolio als professionelles PDF mit Skill-Übersicht und Branding."
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 relative border-t border-border/30">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Für wen ist CertFolio?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ob Power-Learner, Quereinsteiger oder Freelancer – zeige was du kannst
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <UseCaseCard
              title="Power-Learner"
              description="Du hast 40+ Zertifikate von verschiedenen Plattformen? Wähle die 10 relevantesten für eine Stelle und erstelle mit 2 Klicks eine Bewerbungsseite."
            />
            <UseCaseCard
              title="Quereinsteiger"
              description="Zeige Arbeitgebern gebündelt, welche praktischen Skills du durch Bootcamps, MOOCs und Micro-Degrees erworben hast."
            />
            <UseCaseCard
              title="Freelancer & Coaches"
              description="Erhöhe deine Glaubwürdigkeit durch ein professionelles Lern-Profil mit verifizierter Weiterbildung."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative border-t border-border/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Bereit für dein Portfolio?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Ein Link statt 20 Anhänge. Starte jetzt kostenlos.
            </p>
            {isAuthenticated ? (
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Zum Dashboard
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="text-base px-8" asChild>
                <a href={getLoginUrl()}>
                  <LogIn className="mr-2 h-5 w-5" />
                  Kostenlos registrieren
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">CertFolio</span>
              <span className="text-xs text-muted-foreground">by Blue-Banana-Labs</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
              <Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
              <span>&copy; {new Date().getFullYear()} Blue-Banana-Labs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-primary/20 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-primary/20 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-primary/20 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-primary/20 rounded-br-xl" />

      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function UseCaseCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="absolute -top-3 left-6 px-3 py-0.5 bg-primary/10 border border-primary/30 rounded-full text-xs font-medium text-primary">
        {title}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{description}</p>
    </div>
  );
}
