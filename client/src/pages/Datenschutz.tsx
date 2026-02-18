import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Datenschutz() {
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
          <h1 className="text-3xl font-bold tracking-tight">Datenschutzerklärung</h1>
        </div>

        <Card className="border-border/50 bg-card/30 backdrop-blur">
          <CardContent className="space-y-6 prose prose-sm dark:prose-invert max-w-none pt-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Allgemeine Hinweise</h3>
              <p className="text-muted-foreground text-sm">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
                Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Datenerfassung auf dieser Website</h3>
              <h4 className="font-semibold mt-3 mb-2">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
              <p className="text-muted-foreground text-sm">
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen 
                Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
              </p>

              <h4 className="font-semibold mt-3 mb-2">Wie erfassen wir Ihre Daten?</h4>
              <p className="text-muted-foreground text-sm">
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann 
                es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder bei der 
                Registrierung angeben.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website 
                durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, 
                Betriebssystem oder Uhrzeit des Seitenaufrufs).
              </p>

              <h4 className="font-semibold mt-3 mb-2">Wofür nutzen wir Ihre Daten?</h4>
              <p className="text-muted-foreground text-sm">
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu 
                gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
              </p>

              <h4 className="font-semibold mt-3 mb-2">Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
              <p className="text-muted-foreground text-sm">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck 
                Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die 
                Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur 
                Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft 
                widerrufen.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Hosting</h2>
              <p className="text-muted-foreground text-sm">
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
              </p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Externes Hosting</h3>
              <p className="text-muted-foreground text-sm">
                Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website 
                erfasst werden, werden auf den Servern des Hosters / der Hoster gespeichert. Hierbei kann 
                es sich v.a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, 
                Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert 
                werden, handeln.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen 
                und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, 
                schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen 
                Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Allgemeine Hinweise und Pflichtinformationen</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Datenschutz</h3>
              <p className="text-muted-foreground text-sm">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir 
                behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen 
                Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Hinweis zur verantwortlichen Stelle</h3>
              <p className="text-muted-foreground text-sm">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                [Dein Name oder Firmenname]<br />
                [Straße und Hausnummer]<br />
                [PLZ und Ort]<br />
                E-Mail: [deine@email.de]
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam 
                mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten 
                (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Speicherdauer</h3>
              <p className="text-muted-foreground text-sm">
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, 
                verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung 
                entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur 
                Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich 
                zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
              <p className="text-muted-foreground text-sm">
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. 
                Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der 
                bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Recht auf Datenübertragbarkeit</h3>
              <p className="text-muted-foreground text-sm">
                Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung 
                eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, 
                maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte Übertragung der 
                Daten an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch 
                machbar ist.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Auskunft, Löschung und Berichtigung</h3>
              <p className="text-muted-foreground text-sm">
                Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf 
                unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft 
                und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder 
                Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten 
                können Sie sich jederzeit an uns wenden.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Recht auf Einschränkung der Verarbeitung</h3>
              <p className="text-muted-foreground text-sm">
                Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu 
                verlangen. Hierzu können Sie sich jederzeit an uns wenden. Das Recht auf Einschränkung der 
                Verarbeitung besteht in folgenden Fällen:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                <li>Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten personenbezogenen Daten bestreiten</li>
                <li>Wenn die Verarbeitung Ihrer Daten unrechtmäßig geschah/geschieht</li>
                <li>Wenn wir Ihre Daten nicht mehr benötigen, Sie sie jedoch zur Ausübung, Verteidigung oder 
                Geltendmachung von Rechtsansprüchen benötigen</li>
                <li>Wenn Sie Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt haben</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Datenerfassung auf dieser Website</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Cookies</h3>
              <p className="text-muted-foreground text-sm">
                Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und 
                richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die 
                Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät 
                gespeichert. Session-Cookies werden nach Ende Ihres Besuchs automatisch gelöscht. Permanente 
                Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese selbst löschen oder eine 
                automatische Löschung durch Ihren Webbrowser erfolgt.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Cookies können von uns (First-Party-Cookies) oder von Drittunternehmen stammen 
                (sog. Third-Party-Cookies). Wir verwenden Cookies ausschließlich für technisch notwendige 
                Funktionen (z.B. Login-Status, Session-Management).
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Server-Log-Dateien</h3>
              <p className="text-muted-foreground text-sm">
                Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten 
                Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                <li>Browsertyp und Browserversion</li>
                <li>verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p className="text-muted-foreground text-sm mt-2">
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die 
                Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Registrierung auf dieser Website</h3>
              <p className="text-muted-foreground text-sm">
                Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen zu nutzen. Die 
                dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes 
                oder Dienstes, für den Sie sich registriert haben. Die bei der Registrierung abgefragten 
                Pflichtangaben müssen vollständig angegeben werden. Anderenfalls werden wir die Registrierung 
                ablehnen.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Für wichtige Änderungen etwa beim Angebotsumfang oder bei technisch notwendigen Änderungen 
                nutzen wir die bei der Registrierung angegebene E-Mail-Adresse, um Sie auf diesem Wege zu 
                informieren.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Die Verarbeitung der bei der Registrierung eingegebenen Daten erfolgt zum Zwecke der 
                Durchführung des durch die Registrierung begründeten Nutzungsverhältnisses und ggf. zur 
                Anbahnung weiterer Verträge (Art. 6 Abs. 1 lit. b DSGVO).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Analyse-Tools und Werbung</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Umami Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Diese Website nutzt Umami Analytics, einen datenschutzfreundlichen Webanalyse-Dienst. 
                Umami erfasst anonymisierte Nutzungsdaten (Seitenaufrufe, Verweildauer, Referrer) ohne 
                Verwendung von Cookies oder personenbezogenen Daten. Es werden keine IP-Adressen gespeichert.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser 
                berechtigtes Interesse liegt in der Analyse und Optimierung unseres Webangebots.
              </p>
            </div>

            <div className="pt-4 text-xs text-muted-foreground">
              <p>
                Quelle: Erstellt mit dem{" "}
                <a
                  href="https://www.e-recht24.de/muster-datenschutzerklaerung.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Datenschutz-Generator von eRecht24
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
