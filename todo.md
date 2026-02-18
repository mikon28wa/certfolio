# CertFolio - Projekt TODO

## Authentifizierung & Benutzerverwaltung
- [ ] Manus OAuth Integration (bereits vorkonfiguriert)
- [ ] Benutzerregistrierung und Login-Flow
- [ ] Benutzerprofil-Verwaltung

## Datenbankschema
- [x] Zertifikats-Tabelle mit Metadaten erstellen
- [x] Beziehungen zwischen User und Zertifikaten definieren
- [x] Migration ausführen

## Backend-API (tRPC Procedures)
- [x] Zertifikat hochladen und speichern
- [x] Zertifikat-Liste abrufen (eigene)
- [x] Einzelnes Zertifikat abrufen
- [x] Zertifikat aktualisieren
- [x] Zertifikat löschen
- [x] Öffentliches Profil abrufen (nach Username/ID)
- [x] Zertifikate filtern und suchen

## LLM-Integration
- [x] PDF-Analyse-Funktion zur Extraktion von Metadaten
- [x] Automatische Befüllung von Titel, Aussteller, Datum, Beschreibung

## Frontend - Design & Layout
- [x] Blueprint-Ästhetik mit königsblauem Hintergrund implementieren
- [x] Rastermuster und technische Linienzeichnungen hinzufügen
- [x] Typografie mit weißer serifenloser Schrift konfigurieren
- [x] Dashboard-Layout mit Navigation erstellen
- [x] Responsive Design für Mobile optimieren

## Frontend - Zertifikatsverwaltung
- [x] Dashboard-Übersicht mit Zertifikatskarten
- [x] Upload-Komponente mit Drag & Drop
- [x] Formular zur Metadaten-Erfassung
- [ ] Bearbeitungs-Dialog für Zertifikate
- [x] Lösch-Funktion mit Bestätigung

## Öffentliches Profil
- [ ] Öffentliche Profilseite mit teilbarem Link
- [ ] Anzeige aller Zertifikate eines Benutzers
- [ ] Profil-Customization (Name, Bio, Avatar)

## Export-Funktionen
- [ ] Einzelnes Zertifikat als PDF exportieren
- [ ] Gesamtes Portfolio als PDF exportieren
- [ ] Download-Buttons in UI integrieren

## Such- und Filterfunktionen
- [ ] Suchleiste zur Volltextsuche
- [ ] Filter nach Aussteller
- [ ] Filter nach Datum
- [ ] Filter nach Kategorie/Tags

## Social Media Integration
- [ ] Share-Buttons für LinkedIn
- [ ] Share-Buttons für Twitter
- [ ] Share-Buttons für Facebook
- [ ] Kopieren-Button für Profil-Link

## Testing & Deployment
- [ ] Vitest-Tests für Backend-Procedures
- [ ] Manuelle UI-Tests durchführen
- [ ] Checkpoint erstellen

## Erweiterte Metadaten & Funktionen
- [x] Skills-Feld zu Zertifikaten hinzufügen
- [x] Level-Feld (Beginner/Intermediate/Advanced/Expert)
- [x] Verifizierungs-Status und Original-URL
- [x] Kategorien-System (IT, Marketing, Pflege, Management)
- [x] Prioritäts-System (wichtig/normal)
- [x] Link-Upload zusätzlich zu Dateien

## Collections/Sets
- [x] Collections-Tabelle erstellen
- [x] Viele-zu-Viele-Beziehung zwischen Collections und Zertifikaten
- [x] Collection erstellen/bearbeiten/löschen
- [x] Zertifikate zu Collections hinzufügen/entfernen
- [x] Öffentliche Collection-URLs

## Open Graph & Social Media
- [ ] Open Graph Metadaten für Portfolio-Seiten
- [ ] Dynamische OG-Bilder generieren
- [ ] Share-Preview für LinkedIn/Twitter/Facebook

## PDF-Export erweitert
- [ ] Export einzelner Collections als PDF
- [ ] Professionelles PDF-Layout mit Logo/Branding

## Zertifikats-Upload-Formular
- [x] Datei-Upload-Komponente mit Drag & Drop
- [x] S3-Upload-Integration
- [x] Automatische LLM-Analyse nach Upload
- [x] Formular für manuelle Metadaten-Eingabe
- [x] Skills-Tags-Eingabe
- [x] Level-Auswahl (Beginner/Intermediate/Advanced/Expert)
- [x] Kategorie-Auswahl
- [x] Verifizierungs-URL-Eingabe
- [x] Alternative: Externe Link-Eingabe statt Datei-Upload
- [x] Vorschau des hochgeladenen Zertifikats
- [x] Validierung und Fehlerbehandlung

## Skill-Mapping-System (Phase 1)
- [x] Course Library Tabelle erstellen (UUID, Titel, Aussteller, Metadaten)
- [x] Skill Mappings Tabelle (Kurs → Skills mit Gewichtung)
- [x] User Skills Tabelle (aggregierte Skill-Werte pro Nutzer)
- [x] Erweiterte Zertifikats-Metadaten (Kursdauer, Note, UUID, Lernumfang)
- [x] Migration für neue Tabellen ausführen

## Skill-Mapping-System (Phase 2)
- [x] Backend-API für Course Library (CRUD)
- [x] Skill-Aggregation-Engine (Berechnung User Skills)
- [x] API-Endpoint für User Skill-Profil
- [x] API-Endpoint für Skill-Details (welche Zertifikate tragen bei)

## Skill-Mapping-System (Phase 3)
- [x] LLM-Analyse für Skill-Extraktion aus Kursbeschreibung
- [x] Automatische Gewichtungs-Vorschläge generieren
- [x] Skill-Taxonomie definieren (Standard-Skills)

## Skill-Mapping-System (Phase 4)
- [x] Skill-Dashboard mit progressiven Balken
- [x] Drill-Down-Ansicht (Zertifikate pro Skill)
- [x] Visualisierung der Skill-Entwicklung über Zeit

## Skill-Mapping-System (Phase 5)
- [ ] Course Library Management-UI
- [ ] UUID-Eingabe beim Upload
- [ ] Automatisches Matching mit Master-DB

## Skill-Mapping-System (Phase 6)
- [ ] UUID-Erkennung aus PDF/Link
- [ ] Automatisches Skill-Mapping beim Upload
- [ ] Crowd-Sourcing: Neue Kurse zur Library hinzufügen

## Skill-Mapping-System (Tests)
- [x] Tests für Skill-Aggregation-Engine
- [x] Tests für Skill Mappings (Bulk-Erstellung)
- [x] Tests für Course Library (CRUD)
- [x] Datenbank-Cleanup zwischen Tests
