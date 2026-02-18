# CertFolio - Projekt TODO

---

## 1. Authentifizierung & Benutzerverwaltung
- [x] Manus OAuth Integration (Login/Logout über OAuth-Callback)
- [x] Benutzerregistrierung via OAuth (automatisch bei erstem Login)
- [x] Session-Management mit JWT-Cookie
- [x] Profil-Verwaltung (Name, Bio, Profilslug)
- [x] Öffentliche Profil-URL konfigurierbar (`/p/[slug]` vorbereitet, Slug speicherbar)

## 2. Datenbankschema
- [x] Users-Tabelle (id, openId, name, email, role, bio, profileSlug)
- [x] Certificates-Tabelle (Metadaten, Datei-Referenzen, Kurs-Metadaten)
- [x] Collections-Tabelle (Name, Beschreibung, Slug, Sichtbarkeit)
- [x] Collection-Certificates-Verknüpfung (Many-to-Many mit Sortierung)
- [x] Course Library-Tabelle (UUID-basierte Master-Datenbank)
- [x] Skill Mappings-Tabelle (Kurs/Zertifikat → Skills mit Gewichtung)
- [x] User Skills-Tabelle (aggregierte Skill-Werte mit Decay-Score und Level)
- [x] Project Events-Tabelle (Rolle, Technologien, Komplexität, Impact)
- [x] Project Skill Links-Tabelle (Projekt → Skills mit Gewichtung)
- [x] Project Media-Tabelle (Bilder, PDFs, Links pro Projekt)
- [x] Alle Migrationen ausgeführt

## 3. Backend-API (tRPC Procedures)

### 3.1 Zertifikate
- [x] `certificates.create` – Zertifikat erstellen mit Skill-Mappings und Course-Library-Integration
- [x] `certificates.list` – Eigene Zertifikate auflisten
- [x] `certificates.listPublic` – Öffentliche Zertifikate eines Nutzers abrufen
- [x] `certificates.get` – Einzelnes Zertifikat abrufen (Ownership-Check)
- [x] `certificates.update` – Zertifikat aktualisieren inkl. Skill-Mappings-Ersetzung
- [x] `certificates.delete` – Zertifikat löschen
- [x] `certificates.search` – Volltextsuche (Titel, Aussteller, Beschreibung)
- [x] `certificates.analyzePDF` – LLM-Analyse für Metadaten-Extraktion
- [x] `certificates.analyzeWithSkills` – Erweiterte LLM-Analyse mit Skill-Extraktion
- [x] `certificates.uploadFile` – Datei-Upload zu S3

### 3.2 Skills
- [x] `skills.getUserSkills` – Aggregierte Skills mit Decay-Score und Level abrufen
- [x] `skills.getSkillDetails` – Skill-Details mit beitragenden Zertifikaten/Projekten
- [x] `skills.recalculate` – Skill-Neuberechnung auslösen

### 3.3 Course Library
- [x] `courseLibrary.getAll` – Alle Kurse abrufen
- [x] `courseLibrary.getByUuid` – Kurs per UUID suchen
- [x] `courseLibrary.create` – Neuen Kurs anlegen
- [x] Automatische UUID-Prüfung und Usage-Count-Erhöhung beim Zertifikats-Upload

### 3.4 Skill Mappings
- [x] `skillMappings.getByCertificateId` – Mappings pro Zertifikat abrufen
- [x] `skillMappings.create` – Einzelnes Mapping erstellen
- [x] `skillMappings.createBulk` – Mehrere Mappings erstellen mit Skill-Neuberechnung

### 3.5 Collections
- [x] `collections.create` – Collection erstellen (mit Slug-Duplikat-Check)
- [x] `collections.list` – Eigene Collections auflisten
- [x] `collections.listPublic` – Öffentliche Collections eines Nutzers
- [x] `collections.get` – Einzelne Collection abrufen
- [x] `collections.getBySlug` – Collection per Slug abrufen (public)
- [x] `collections.update` – Collection aktualisieren
- [x] `collections.delete` – Collection löschen
- [x] `collections.getCertificates` – Zertifikate einer Collection abrufen
- [x] `collections.addCertificate` – Zertifikat zu Collection hinzufügen
- [x] `collections.removeCertificate` – Zertifikat aus Collection entfernen
- [x] `collections.getSkills` – Collection-spezifische Skill-Levels berechnen

### 3.6 Projekt-Events
- [x] `projects.list` – Eigene Projekte auflisten
- [x] `projects.get` – Einzelnes Projekt mit Skill-Links und Medien abrufen
- [x] `projects.create` – Projekt erstellen mit Skill-Links und Neuberechnung
- [x] `projects.update` – Projekt aktualisieren mit Skill-Neuberechnung
- [x] `projects.delete` – Projekt löschen mit Skill-Neuberechnung
- [x] `projects.analyze` – KI-Analyse für Projekte (Skill-Extraktion)
- [x] `projects.addMedia` – Medien zu Projekt hinzufügen
- [x] `projects.deleteMedia` – Medien von Projekt entfernen
- [x] `projects.uploadFile` – Projekt-Datei zu S3 hochladen

### 3.7 PDF-Export
- [x] `pdf.exportPortfolio` – Portfolio-PDF generieren (mit Collection-Filter, Branding, S3-Upload)

### 3.8 Profil
- [x] `profile.get` – Eigenes Profil abrufen
- [x] `profile.update` – Profil aktualisieren (Name, Bio, Slug)
- [x] `profile.getBySlug` – Öffentliches Profil per Slug abrufen

## 4. Skill-Score-Engine
- [x] Exponentieller Decay: Zertifikate λ=0.15, Projekte λ=0.07
- [x] Frequenz-Faktor (Spacing-Effekt, α=0.15)
- [x] Level-Mapping Score → Level 0-5 (Schwellen: 0, 1, 3, 6, 10, 15)
- [x] Business-Regel: Zertifikat-only Skills werden nach 12 Monaten auf Level 2 gedeckelt
- [x] Projekt-Gewichtung mit Komplexität, Verantwortung und Impact
- [x] Automatische Neuberechnung bei Zertifikats-/Projekt-Änderungen
- [x] Collection-spezifische Skill-Level-Berechnung

## 5. LLM-Integration
- [x] PDF-Analyse zur Metadaten-Extraktion (Titel, Aussteller, Datum, Beschreibung)
- [x] Erweiterte Analyse mit Skill-Extraktion (3-7 Skills pro Zertifikat, Gewichtung, Kategorie)
- [x] Projekt-Analyse mit Skill-Extraktion aus Beschreibung und Technologien
- [x] Course Library: UUID-Matching zur Wiederverwendung von Analysen

## 6. Frontend – Design & Layout
- [x] Blueprint-Ästhetik mit königsblauem Hintergrund (#1e3a8a)
- [x] Technisches Rastermuster und CAD-Style Linien
- [x] Dark Theme als Standard
- [x] Responsive Design
- [x] Navigation: Startseite, Dashboard, Zertifikate, Skills, Profil, Projekte
- [x] CertFolio-Branding mit "by Blue-Banana-Labs"

## 7. Frontend – Seiten (implementiert)

### 7.1 Startseite (`/`)
- [x] Hero-Bereich mit Produktbeschreibung (deutsch)
- [x] Feature-Cards (Upload & Analyse, Skill-Mapping, Portfolio teilen)
- [x] Anmelden/Registrieren-Button (wechselt zu Dashboard/Abmelden bei Login)
- [x] Blue-Banana-Labs Branding

### 7.2 Dashboard (`/dashboard`)
- [x] Statistik-Karten (Zertifikate, Collections, Verifiziert)
- [x] Quick Actions (Neues Zertifikat, Neues Projekt, PDF-Export)
- [x] Skill-Profil-Übersicht (Top Skills)
- [x] PDF-Export-Dialog

### 7.3 Zertifikate (`/certificates`)
- [x] Zertifikatsliste mit Karten-Layout
- [x] Suchleiste (Volltextsuche über Titel, Aussteller, Beschreibung)
- [x] Bearbeitungs-Dialog (Metadaten, Skills, Erweitert)
- [x] Lösch-Funktion mit Bestätigung
- [x] Kategorie- und Level-Badges

### 7.4 Neues Zertifikat (`/certificates/new`)
- [x] Drag & Drop Upload (PDF, Bilder)
- [x] Alternative: Externe Link-Eingabe
- [x] Automatische LLM-Analyse nach Upload
- [x] Skill-Extraktion mit Gewichtungs-Editor
- [x] Formular für manuelle Metadaten-Eingabe
- [x] UUID-Eingabefeld für Course Library Matching

### 7.5 Skills (`/skills`)
- [x] Skill-Dashboard mit progressiven Balken (Level 0-5)
- [x] Level-Labels (Keine Erfahrung bis Meister)
- [x] Farbcodierung pro Level
- [x] Skill-Detail-Dialog (beitragende Zertifikate und Projekte)
- [x] Tooltips mit Score, Nachweistypen, letzter Nutzung

### 7.6 Profil (`/profile`)
- [x] Persönliche Informationen bearbeiten (Name, Bio)
- [x] Profilslug konfigurieren
- [x] Öffentliche URL anzeigen und kopieren

### 7.7 Neues Projekt (`/projects/new`)
- [x] Projekt-Upload-Formular mit Medien-Upload
- [x] KI-Analyse für Skill-Vorschläge
- [x] Rolle, Technologien, Komplexität, Impact-Felder

## 8. Frontend – Komponenten
- [x] EditCertificateDialog (Tabs: Metadaten, Skills, Erweitert)
- [x] ExportDialog (PDF-Export mit Branding-Optionen)
- [x] ErrorBoundary

## 9. PDF-Export
- [x] Blueprint-Design im PDF
- [x] Skill-Visualisierung mit progressiven Balken
- [x] Collection-basierter Export
- [x] Branding-Optionen (Logo, Farben, Kontaktinfo, LinkedIn)
- [x] Automatischer S3-Upload des generierten PDFs

## 10. Tests (109 bestanden)
- [x] Auth-Tests (1 Test: Logout)
- [x] Zertifikats-Tests (8 Tests: CRUD, Validierung)
- [x] Skill-Management-Tests (7 Tests: Mappings, Aggregation)
- [x] Upload-Flow-Tests (5 Tests: Skill-Mappings, Course Library, Aggregation)
- [x] PDF-Tests (5 Tests: Generierung, Varianten)
- [x] Skill-Score-Engine-Tests (23 Tests: Decay, Frequenz, Level, Business-Regeln)

---

## OFFEN – Noch nicht implementiert

### 11. Öffentliche Portfolio-Seite (`/p/[slug]`)
- [ ] Frontend-Seite für öffentliches Profil (ohne Login sichtbar)
- [ ] Skill-Balken-Anzeige für Besucher
- [ ] Zertifikatsübersicht (nur öffentliche)
- [ ] Projekt-Übersicht (nur öffentliche)
- [ ] Collection-Anzeige
- [ ] Route in App.tsx registrieren

### 12. Open Graph & Social Media
- [ ] OG-Metadaten für Portfolio-Seiten (Titel, Beschreibung, Bild)
- [ ] Dynamische OG-Bilder generieren (serverseitig)
- [ ] Twitter Card Metadaten
- [ ] Share-Buttons für LinkedIn, Twitter, Facebook
- [ ] Kopieren-Button für Portfolio-Link (auf öffentlicher Seite)

### 13. Collections-Management-UI
- [ ] Collections-Listenansicht (`/collections`)
- [ ] Collection erstellen/bearbeiten/löschen im Frontend
- [ ] Zertifikate per Drag & Drop zu Collections hinzufügen
- [ ] Projekte zu Collections hinzufügen (Backend: `collectionProjectEvents`-Tabelle fehlt)
- [ ] Collection-spezifische Skill-Visualisierung im Frontend
- [ ] Öffentliche Collection-Ansicht (`/c/[slug]`)
- [ ] Route in App.tsx registrieren

### 14. Projekte-Listenansicht
- [ ] Projekte-Listenansicht (`/projects`)
- [ ] Projekt-Bearbeitungs-Dialog (analog zu EditCertificateDialog)
- [ ] Projekt-Löschfunktion im Frontend
- [ ] Route in App.tsx registrieren

### 15. Erweiterte Filter-Funktionen (Zertifikate)
- [x] Filter nach Aussteller (Dropdown/Select)
- [x] Filter nach Datum/Zeitraum
- [x] Filter nach Kategorie (IT, Marketing, Management, Healthcare)
- [x] Filter nach Level (Beginner bis Expert)
- [x] Filter nach Priorität (Normal/Wichtig)
- [x] Kombinierte Filter mit Suchleiste
- [x] Filter-Panel mit Ein-/Ausblenden
- [x] Aktive Filter als Tags mit Einzelentfernung
- [x] Filter-Zähler im Button
- [x] "Alle zurücksetzen"-Funktion
- [x] 31 Vitest-Tests für Filter-Logik bestanden

### 16. DSGVO & Rechtliches
- [ ] Datenschutzerklärung-Seite (`/datenschutz`)
- [ ] Impressum-Seite (`/impressum`)
- [ ] Cookie-Banner / Einwilligungsdialog
- [ ] Links in Footer der Startseite
- [ ] Datenexport-Funktion (DSGVO Art. 20)
- [ ] Account-Löschung (DSGVO Art. 17)

### 17. Erweiterte Skill-Features
- [x] Skill-Entwicklung über Zeit visualisieren (Zeitreihen-Diagramm mit Recharts)
- [x] Skill-Historie-Tabelle für Snapshots
- [x] Backend: getSkillTimeline, compareSkills, getSkillRecommendations, captureSnapshot
- [x] Frontend: SkillTimelineChart-Komponente
- [x] Frontend: SkillRecommendations-Komponente
- [x] Skill-Empfehlungen basierend auf Level und Aktivität
- [x] Integration in Skills-Seite
- [x] 13 Vitest-Tests für erweiterte Features bestanden
- [ ] Skill-Vergleich zwischen Collections (UI)
- [ ] Skill-Kategorien-Filter im Dashboard

### 18. UX-Verbesserungen
- [x] Onboarding-Hinweis für neue Nutzer (Dashboard EmptyState mit Aktionen)
- [x] Leere Zustände (Empty States) – wiederverwendbare EmptyState-Komponente
- [x] Breadcrumb-Navigation auf allen Unterseiten (PageBreadcrumb-Komponente)
- [ ] Tastatur-Shortcuts
- [ ] Benachrichtigungen bei Skill-Level-Änderungen
- [x] Favicon konfigurieren (SVG)
- [x] Inter-Font via Google Fonts eingebunden
- [x] Footer-Links für Datenschutz und Impressum
- [x] 16 Vitest-Tests für UX-Komponenten bestanden

### 19. Performance & Qualität
- [ ] Frontend-Tests (Vitest für React-Komponenten)
- [ ] E2E-Tests (kritische Flows)
- [ ] Lazy Loading für Seiten
- [ ] Bild-Optimierung für hochgeladene Zertifikate
- [ ] Error-Tracking und Monitoring
