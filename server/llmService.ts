import { invokeLLM } from "./_core/llm";

export interface CertificateMetadata {
  title: string;
  issuer: string;
  issueDate: string | null;
  description: string;
}

export interface SkillMapping {
  skillName: string;
  skillCategory: string;
  weight: number;
  reasoning: string;
}

export interface ExtendedCertificateAnalysis {
  title: string;
  issuer: string;
  issueDate: string | null;
  description: string;
  courseDuration: number | null;
  courseCredits: number | null;
  level: "beginner" | "intermediate" | "advanced" | "expert" | null;
  category: "it" | "marketing" | "management" | "healthcare" | "other" | null;
  skills: SkillMapping[];
}

/**
 * Analyzes a certificate PDF using LLM to extract metadata
 * @param fileUrl - Public URL to the certificate file
 * @param mimeType - MIME type of the file (e.g., 'application/pdf', 'image/jpeg')
 * @returns Extracted certificate metadata
 */
export async function analyzeCertificatePDF(
  fileUrl: string,
  mimeType: string
): Promise<CertificateMetadata> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für die Analyse von Zertifikaten und Bescheinigungen. 
Extrahiere folgende Informationen aus dem bereitgestellten Dokument:
1. Titel des Zertifikats (z.B. "AWS Certified Solutions Architect", "Google Analytics Zertifikat")
2. Aussteller/Institution (z.B. "Amazon Web Services", "Google", "Coursera")
3. Ausstellungsdatum im Format YYYY-MM-DD (falls vorhanden, sonst null)
4. Kurze Beschreibung (1-2 Sätze über den Inhalt/Umfang des Zertifikats)

Antworte ausschließlich mit einem JSON-Objekt im folgenden Format, ohne zusätzliche Erklärungen.`,
        },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: {
                url: fileUrl,
                mime_type: mimeType as "application/pdf" | "audio/mpeg" | "audio/wav" | "audio/mp4" | "video/mp4",
              },
            },
            {
              type: "text",
              text: "Analysiere dieses Zertifikat und extrahiere die Metadaten.",
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "certificate_metadata",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Der vollständige Titel des Zertifikats",
              },
              issuer: {
                type: "string",
                description: "Die ausstellende Institution oder Organisation",
              },
              issueDate: {
                type: ["string", "null"],
                description: "Ausstellungsdatum im Format YYYY-MM-DD oder null falls nicht vorhanden",
              },
              description: {
                type: "string",
                description: "Kurze Beschreibung des Zertifikatsinhalts (1-2 Sätze)",
              },
            },
            required: ["title", "issuer", "issueDate", "description"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Keine Antwort vom LLM erhalten");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const metadata = JSON.parse(contentStr) as CertificateMetadata;
    return metadata;
  } catch (error) {
    console.error("[LLM Service] Fehler bei der PDF-Analyse:", error);
    throw new Error("Fehler bei der automatischen Analyse des Zertifikats");
  }
}

/**
 * Analyzes a certificate with extended skill extraction
 * @param fileUrl - Public URL to the certificate file
 * @param mimeType - MIME type of the file
 * @returns Extended analysis including skill mappings
 */
export interface ProjectAnalysis {
  skills: SkillMapping[];
  projectType: string;
  technologies: string[];
}

/**
 * Analyzes a project description using LLM to extract skills and technologies
 * @param title - Project title
 * @param description - Project description
 * @param technologies - Technologies/tools used (optional)
 * @param role - Role in project
 * @returns Extracted skill mappings and project classification
 */
export async function analyzeProject(
  title: string,
  description: string,
  technologies?: string,
  role?: string
): Promise<ProjectAnalysis> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für die Analyse von Projekten und die Extraktion von Skills.

Analysiere das beschriebene Projekt und extrahiere:

1. **Skill-Mapping:**
   Zerlege das Projekt in 3-7 konkrete Skills mit Gewichtung.
   - skillName: Präziser Skill-Name (z.B. "React", "API Design", "Data Analysis")
   - skillCategory: "Technical", "Soft Skills", "Domain Knowledge", "Tools"
   - weight: Gewichtung 0-100 (Summe aller Weights sollte ~100 ergeben)
   - reasoning: Kurze Begründung

2. **Projekttyp:**
   Klassifiziere das Projekt (z.B. "Web-App MVP", "Landingpage", "Datenanalyse", "Kursprojekt", "API-Service", "Mobile App")

3. **Technologien:**
   Liste alle erkannten Technologien und Tools auf.

Antworte ausschließlich mit einem JSON-Objekt.`,
        },
        {
          role: "user",
          content: `Analysiere dieses Projekt:

Titel: ${title}
Beschreibung: ${description}
${technologies ? `Technologien: ${technologies}` : ""}
${role ? `Rolle: ${role}` : ""}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "project_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skillName: { type: "string" },
                    skillCategory: { type: "string" },
                    weight: { type: "number" },
                    reasoning: { type: "string" },
                  },
                  required: ["skillName", "skillCategory", "weight", "reasoning"],
                  additionalProperties: false,
                },
              },
              projectType: { type: "string" },
              technologies: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["skills", "projectType", "technologies"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Keine Antwort vom LLM erhalten");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const analysis = JSON.parse(contentStr) as ProjectAnalysis;
    return analysis;
  } catch (error) {
    console.error("[LLM Service] Fehler bei der Projekt-Analyse:", error);
    throw new Error("Fehler bei der automatischen Analyse des Projekts");
  }
}

export async function analyzeCertificateWithSkills(
  fileUrl: string,
  mimeType: string
): Promise<ExtendedCertificateAnalysis> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für die Analyse von Zertifikaten und die Extraktion von Skill-Informationen.

Extrahiere folgende Informationen aus dem bereitgestellten Zertifikat:

1. **Basis-Metadaten:**
   - Titel des Zertifikats
   - Aussteller/Institution
   - Ausstellungsdatum (YYYY-MM-DD oder null)
   - Beschreibung (1-2 Sätze)

2. **Kurs-Metadaten:**
   - Kursdauer in Stunden (falls erkennbar, sonst null)
   - Credits/ECTS (falls erkennbar, sonst null)
   - Level: beginner, intermediate, advanced, expert (basierend auf Inhalt/Voraussetzungen)
   - Kategorie: it, marketing, management, healthcare, other

3. **Skill-Mapping:**
   Analysiere den Kursinhalt und zerlege ihn in 3-7 konkrete Skills mit Gewichtung.
   - skillName: Präziser Skill-Name (z.B. "Python Programming", "Data Analysis", "Project Management")
   - skillCategory: "Technical", "Soft Skills", "Domain Knowledge", "Tools"
   - weight: Gewichtung 0-100 (Summe aller Weights sollte ~100 ergeben)
   - reasoning: Kurze Begründung warum dieser Skill mit dieser Gewichtung

Beispiel für Skill-Mapping:
- "AWS Solutions Architect" → 40% Cloud Architecture, 30% AWS Services, 20% Security, 10% Cost Optimization
- "Google Analytics" → 50% Web Analytics, 30% Data Interpretation, 20% Reporting

Antworte ausschließlich mit einem JSON-Objekt.`,
        },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: {
                url: fileUrl,
                mime_type: mimeType as "application/pdf" | "audio/mpeg" | "audio/wav" | "audio/mp4" | "video/mp4",
              },
            },
            {
              type: "text",
              text: "Analysiere dieses Zertifikat vollständig mit Skill-Extraktion.",
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "extended_certificate_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              issuer: { type: "string" },
              issueDate: { type: ["string", "null"] },
              description: { type: "string" },
              courseDuration: { type: ["number", "null"] },
              courseCredits: { type: ["number", "null"] },
              level: {
                type: ["string", "null"],
                enum: ["beginner", "intermediate", "advanced", "expert", null],
              },
              category: {
                type: ["string", "null"],
                enum: ["it", "marketing", "management", "healthcare", "other", null],
              },
              skills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skillName: { type: "string" },
                    skillCategory: { type: "string" },
                    weight: { type: "number" },
                    reasoning: { type: "string" },
                  },
                  required: ["skillName", "skillCategory", "weight", "reasoning"],
                  additionalProperties: false,
                },
              },
            },
            required: [
              "title",
              "issuer",
              "issueDate",
              "description",
              "courseDuration",
              "courseCredits",
              "level",
              "category",
              "skills",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Keine Antwort vom LLM erhalten");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const analysis = JSON.parse(contentStr) as ExtendedCertificateAnalysis;
    return analysis;
  } catch (error) {
    console.error("[LLM Service] Fehler bei der erweiterten Analyse:", error);
    throw new Error("Fehler bei der automatischen Skill-Analyse des Zertifikats");
  }
}
