import { invokeLLM } from "./_core/llm";
import { getCurrentPrompt, CERTIFICATE_METADATA_EXTRACTION_V3, EXTENDED_CERTIFICATE_ANALYSIS_V3, PROJECT_SKILL_EXTRACTION_V3 } from "./llmPrompts";

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
  customCategory: string | null; // Freitext-Kategorie, wenn category="other"
  priority: "normal" | "important" | null;
  isVerified: boolean | null;
  verificationUrl: string | null;
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
          content: getCurrentPrompt(CERTIFICATE_METADATA_EXTRACTION_V3),
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
          content: getCurrentPrompt(PROJECT_SKILL_EXTRACTION_V3),
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
          content: getCurrentPrompt(EXTENDED_CERTIFICATE_ANALYSIS_V3),
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
              customCategory: { type: ["string", "null"] },
              priority: {
                type: ["string", "null"],
                enum: ["normal", "important", null],
              },
              isVerified: { type: ["boolean", "null"] },
              verificationUrl: { type: ["string", "null"] },
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
              "customCategory",
              "priority",
              "isVerified",
              "verificationUrl",
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
