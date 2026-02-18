import { invokeLLM } from "./_core/llm";

export interface CertificateMetadata {
  title: string;
  issuer: string;
  issueDate: string | null;
  description: string;
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
