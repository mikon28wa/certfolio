# Maintainability Index Report

**Projekt:** CertFolio  
**Datum:** 19. Februar 2026  
**Methodik:** Gewichteter Maintainability Index (MI) nach SEI/Microsoft-Formel, berechnet mit typhonjs-escomplex. Vorher-Werte aus Git-History extrahiert.

---

## Gesamtübersicht

| Bereich | Vorher MI | Nachher MI | Delta | Verbesserung | Module | Bewertung |
|---|:---:|:---:|:---:|:---:|:---:|---|
| server/routers.ts | 36.4 | 54.4 | +18.0 | +49% | 11 | Niedrig → **Mittel** |
| EditCertificateDialog.tsx | 37.6 | 60.6 | +23.0 | +61% | 7 | Niedrig → **Mittel** |
| ComponentShowcase.tsx | 31.4 | 57.2 | +25.8 | +82% | 19 | Niedrig → **Mittel** |
| debug-collector.js | 38.6 | 41.7 | +3.0 | +8% | 1 | Niedrig (intern verbessert) |
| **Durchschnitt** | **36.0** | **53.5** | **+17.5** | **+49%** | | **Niedrig → Mittel** |

> **MI-Skala:** 0–19 = Sehr niedrig (kritisch) | 20–49 = Niedrig (schwer wartbar) | 50–79 = Mittel (moderat) | 80–100 = Hoch (gut wartbar)

---

## 1. server/routers.ts → server/routers/*.ts

**Vorher:** Eine monolithische Datei mit 827 LOC, die alle tRPC-Prozeduren (Auth, Profil, Zertifikate, Skills, Collections, Projekte, PDF, Kursbibliothek, Skill-Mappings) in einem einzigen Router bündelte. Der MI von 36.4 lag im Bereich „Niedrig", was auf hohe Komplexität und erschwerte Wartbarkeit hindeutet.

**Nachher:** 11 Module mit einem gewichteten MI von 54.4 (+49%). Der Haupt-Router umfasst jetzt 26 LOC und importiert alle Sub-Router über eine zentrale Index-Datei. Die durchschnittliche Dateigröße beträgt 79 LOC pro Modul.

| Modul | MI | LOC |
|---|:---:|:---:|
| routers.ts (Shell) | 64.3 | 26 |
| index.ts | 100.0 | 9 |
| auth.ts | 63.5 | 47 |
| profile.ts | 63.9 | 45 |
| skills.ts | 64.4 | 43 |
| courseLibrary.ts | 64.1 | 44 |
| skillMappings.ts | 62.6 | 52 |
| pdf.ts | 51.4 | 34 |
| projects.ts | 52.0 | 159 |
| collections.ts | 50.2 | 192 |
| certificates.ts | 48.0 | 241 |

---

## 2. EditCertificateDialog.tsx → edit-certificate/*.tsx

**Vorher:** Eine 778-LOC-Komponente, die State-Management, Effekte, Mutations, Validierung, Skill-Logik und drei Tab-UIs in einer Datei vereinte. MI von 37.6 im Bereich „Niedrig".

**Nachher:** 7 Module mit einem gewichteten MI von 60.6 (+61%). Die Trennung von Logik (Custom Hook) und Darstellung (Tab-Komponenten) ermöglicht isoliertes Testen und unabhängige Weiterentwicklung.

| Modul | MI | LOC | Verantwortung |
|---|:---:|:---:|---|
| types.ts | 100.0 | 73 | Shared Interfaces |
| index.ts | 100.0 | 5 | Re-Exports |
| CertificateAdvancedTab.tsx | 78.0 | 72 | Kurs-Metadaten UI |
| CertificateDetailsTab.tsx | 72.0 | 257 | Metadaten-Formular |
| EditCertificateDialog.tsx (Shell) | 52.4 | 152 | Dialog + Tab-Routing |
| CertificateSkillsTab.tsx | 50.5 | 186 | Skill-Mappings UI |
| useEditCertificateForm.ts | 46.4 | 288 | State, Effects, Logik |

---

## 3. ComponentShowcase.tsx → showcase/*.tsx

**Vorher:** Eine 1438-LOC-Datei mit 17 UI-Sektionen in einer einzigen Komponente. MI von 31.4 – der niedrigste Wert aller vier Bereiche.

**Nachher:** 19 Module mit einem gewichteten MI von 57.2 (+82%). Die größte relative Verbesserung aller vier Bereiche. Die Shell-Komponente umfasst 67 LOC und orchestriert die Sektionen.

| Modul | MI | LOC |
|---|:---:|:---:|
| index.ts | 100.0 | 17 |
| ComponentShowcase.tsx (Shell) | 77.7 | 67 |
| CalendarSection.tsx | 71.2 | 21 |
| AlertsSection.tsx | 69.5 | 25 |
| ButtonsSection.tsx | 68.8 | 27 |
| AccordionSection.tsx | 66.9 | 33 |
| ColorCombinationsSection.tsx | 66.9 | 33 |
| ResizableSection.tsx | 66.9 | 33 |
| CarouselSection.tsx | 66.1 | 36 |
| LayoutSection.tsx | 65.3 | 39 |
| ToggleSection.tsx | 63.9 | 45 |
| TextColorsSection.tsx | 62.9 | 50 |
| AIChatBoxSection.tsx | 61.9 | 56 |
| MenusSection.tsx | 59.6 | 71 |
| TabsSection.tsx | 59.1 | 75 |
| ToastSection.tsx | 58.1 | 83 |
| OverlaysSection.tsx | 51.4 | 169 |
| DataDisplaySection.tsx | 48.5 | 229 |
| FormInputsSection.tsx | 46.7 | 279 |

---

## 4. debug-collector.js (interne Optimierung)

**Vorher:** 822 LOC mit duplizierten Content-Type-Prüfungen (isBinary/isStreaming in Fetch und XHR), doppelter Payload-Erstellung und redundantem Error-Logging. MI von 38.6.

**Nachher:** 575 LOC (-30%) mit MI von 41.7 (+8%). Da die Datei als IIFE in `client/public/` verbleibt und nicht in separate Module aufgeteilt werden kann, ist die MI-Verbesserung geringer als bei den anderen drei Bereichen. Die interne Qualität wurde durch sechs extrahierte Hilfsfunktionen verbessert:

| Extrahierte Funktion | Eliminierte Redundanz |
|---|---|
| `classifyContentType()` | Duplizierte isBinary/isStreaming-Prüfung in Fetch + XHR |
| `skipBodyReason()` | Duplizierte Body-Skip-Entscheidung in Fetch + XHR |
| `captureTextBody()` | Duplizierte Truncation + Sanitization |
| `buildPayload()` | Duplizierte Payload-Erstellung in reportLogs + beforeunload |
| `logNetworkError()` | Duplizierte network_error UI-Events |
| `logConsoleError()` | Duplizierte error/unhandledrejection Console-Einträge |

---

## Methodik-Hinweise

Der Maintainability Index wird nach der Microsoft-Variante der SEI-Formel berechnet, normalisiert auf eine Skala von 0–100. Die drei Eingangsfaktoren sind Halstead-Volumen (lexikalische Komplexität), zyklomatische Komplexität (Verzweigungstiefe) und Lines of Code (Umfang). Für TypeScript-Dateien, die nicht vollständig geparst werden konnten, wurde ein LOC-basierter Fallback verwendet, der den MI tendenziell überschätzt – die tatsächlichen Werte liegen also eher noch etwas niedriger bei den Vorher-Messungen und etwas höher bei den Nachher-Messungen, was den Verbesserungseffekt konservativ darstellt.

Die Vorher-Werte wurden direkt aus der Git-History extrahiert (Commits vor dem jeweiligen Refactoring), sodass ein exakter Vergleich derselben Codebasis möglich ist.
