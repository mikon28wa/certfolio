import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Impressum() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Impressum</h1>
        </div>

        <Card className="border-border/50 bg-card/30 backdrop-blur">
          <CardHeader>
            <CardTitle>Angaben gemäß § 5 TMG</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-sm dark:prose-invert max-w-none">
            <div>
              <h3 className="text-lg font-semibold mb-2">Betreiber</h3>
              <p className="text-muted-foreground">
                [Dein Name oder Firmenname]<br />
                [Straße und Hausnummer]<br />
                [PLZ und Ort]<br />
                [Land]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Kontakt</h3>
              <p className="text-muted-foreground">
                E-Mail: [deine@email.de]<br />
                Telefon: [optional]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Umsatzsteuer-ID</h3>
              <p className="text-muted-foreground">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                [Deine USt-IdNr. oder "Nicht vorhanden"]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
              <p className="text-muted-foreground">
                [Dein Name]<br />
                [Adresse wie oben]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">EU-Streitschlichtung</h3>
              <p className="text-muted-foreground">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                <br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h3>
              <p className="text-muted-foreground">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h3 className="text-lg font-semibold mb-2">Haftungsausschluss</h3>
              
              <h4 className="font-semibold mt-4 mb-2">Haftung für Inhalte</h4>
              <p className="text-muted-foreground text-sm">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
                Tätigkeit hinweisen.
              </p>

              <h4 className="font-semibold mt-4 mb-2">Haftung für Links</h4>
              <p className="text-muted-foreground text-sm">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
                Seiten verantwortlich.
              </p>

              <h4 className="font-semibold mt-4 mb-2">Urheberrecht</h4>
              <p className="text-muted-foreground text-sm">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>

            <div className="pt-4 text-xs text-muted-foreground">
              <p>
                Quelle: Erstellt mit dem{" "}
                <a
                  href="https://www.e-recht24.de/impressum-generator.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Impressum Generator von eRecht24
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Hinweis: Bitte ersetze die Platzhalter [in eckigen Klammern] mit deinen tatsächlichen Daten.
          </p>
        </div>
      </div>
    </div>
  );
}
