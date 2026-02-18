import { User } from "../drizzle/schema";
import * as db from "./db";
import * as skillsDb from "./skillsDb";

export interface BrandingOptions {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  linkedIn?: string;
}

export interface PDFExportOptions {
  userId: number;
  collectionId?: number;
  includeSkills?: boolean;
  includeCertificates?: boolean;
  branding?: BrandingOptions;
}

/**
 * Generate a professional portfolio PDF using HTML/CSS and WeasyPrint
 * This approach allows for better styling and Blueprint design consistency
 */
export async function generatePortfolioPDF(options: PDFExportOptions): Promise<Buffer> {
  const { userId, collectionId, includeSkills = true, includeCertificates = true, branding = {} } = options;

  // Fetch user data
  const user = await db.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Fetch certificates
  let certificates: any[] = [];
  if (includeCertificates) {
    if (collectionId) {
      certificates = await db.getCertificatesByCollectionId(collectionId);
    } else {
      certificates = await db.getCertificatesByUserId(userId);
    }
  }

  // Fetch skills
  let skills: any[] = [];
  if (includeSkills) {
    skills = await skillsDb.getUserSkills(userId);
  }

  // Generate HTML content
  const html = generatePortfolioHTML({
    user,
    certificates,
    skills,
    branding,
  });

  // Convert HTML to PDF using WeasyPrint (via Python subprocess)
  const pdfBuffer = await htmlToPDF(html);

  return pdfBuffer;
}

interface PortfolioData {
  user: User;
  certificates: any[];
  skills: any[];
  branding: BrandingOptions;
}

function generatePortfolioHTML(data: PortfolioData): string {
  const { user, certificates, skills, branding } = data;

  const primaryColor = branding.primaryColor || "#1e40af";
  const accentColor = branding.accentColor || "#3b82f6";

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${user.name || "Portfolio"} - Zertifikatsportfolio</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #1f2937;
    }
    
    .header {
      border-bottom: 3px solid ${primaryColor};
      padding-bottom: 1cm;
      margin-bottom: 1cm;
    }
    
    .header h1 {
      font-size: 24pt;
      font-weight: bold;
      color: ${primaryColor};
      margin-bottom: 0.3cm;
    }
    
    .header .subtitle {
      font-size: 14pt;
      color: #6b7280;
      margin-bottom: 0.5cm;
    }
    
    .contact-info {
      font-size: 9pt;
      color: #6b7280;
      display: flex;
      flex-wrap: wrap;
      gap: 1cm;
    }
    
    .contact-info span {
      display: inline-block;
    }
    
    .section {
      margin-bottom: 1.5cm;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 16pt;
      font-weight: bold;
      color: ${primaryColor};
      border-bottom: 2px solid ${accentColor};
      padding-bottom: 0.2cm;
      margin-bottom: 0.5cm;
    }
    
    .skill-item {
      margin-bottom: 0.5cm;
    }
    
    .skill-name {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 0.1cm;
      display: flex;
      justify-content: space-between;
    }
    
    .skill-bar-container {
      width: 100%;
      height: 0.4cm;
      background-color: #e5e7eb;
      border-radius: 0.2cm;
      overflow: hidden;
    }
    
    .skill-bar {
      height: 100%;
      background: linear-gradient(90deg, ${primaryColor}, ${accentColor});
      transition: width 0.3s ease;
    }
    
    .skill-meta {
      font-size: 8pt;
      color: #6b7280;
      margin-top: 0.1cm;
    }
    
    .certificate-item {
      margin-bottom: 0.8cm;
      padding: 0.5cm;
      border: 1px solid #e5e7eb;
      border-left: 4px solid ${accentColor};
      page-break-inside: avoid;
    }
    
    .certificate-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 0.3cm;
    }
    
    .certificate-title {
      font-size: 12pt;
      font-weight: bold;
      color: #111827;
    }
    
    .certificate-issuer {
      font-size: 10pt;
      color: #6b7280;
      margin-bottom: 0.2cm;
    }
    
    .certificate-date {
      font-size: 9pt;
      color: #9ca3af;
    }
    
    .certificate-description {
      font-size: 9pt;
      color: #4b5563;
      margin-bottom: 0.3cm;
    }
    
    .certificate-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.2cm;
    }
    
    .skill-tag {
      background-color: #eff6ff;
      color: ${primaryColor};
      padding: 0.1cm 0.3cm;
      border-radius: 0.2cm;
      font-size: 8pt;
      font-weight: 500;
    }
    
    .badge {
      display: inline-block;
      padding: 0.1cm 0.3cm;
      border-radius: 0.2cm;
      font-size: 8pt;
      font-weight: 500;
    }
    
    .badge-verified {
      background-color: #d1fae5;
      color: #065f46;
    }
    
    .badge-level {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    .footer {
      margin-top: 2cm;
      padding-top: 0.5cm;
      border-top: 1px solid #e5e7eb;
      font-size: 8pt;
      color: #9ca3af;
      text-align: center;
    }
    
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>${user.name || "Professionelles Portfolio"}</h1>
    <div class="subtitle">Zertifikatsportfolio & Skill-Profil</div>
    <div class="contact-info">
      ${user.email ? `<span>📧 ${user.email}</span>` : ""}
      ${branding.contactPhone ? `<span>📱 ${branding.contactPhone}</span>` : ""}
      ${branding.website ? `<span>🌐 ${branding.website}</span>` : ""}
      ${branding.linkedIn ? `<span>💼 ${branding.linkedIn}</span>` : ""}
    </div>
  </div>

  ${skills.length > 0 ? `
  <!-- Skills Section -->
  <div class="section">
    <h2 class="section-title">Skill-Profil</h2>
    <p style="margin-bottom: 0.5cm; color: #6b7280; font-size: 9pt;">
      Automatisch aggregiert aus ${certificates.length} Zertifikat${certificates.length !== 1 ? "en" : ""}
    </p>
    ${skills.slice(0, 15).map(skill => {
      const percentage = Math.min((skill.totalPoints / 500) * 100, 100);
      return `
      <div class="skill-item">
        <div class="skill-name">
          <span>${skill.skillName}</span>
          <span>Level ${skill.level}</span>
        </div>
        <div class="skill-bar-container">
          <div class="skill-bar" style="width: ${percentage}%"></div>
        </div>
        <div class="skill-meta">
          ${skill.totalPoints} Punkte · ${skill.certificateCount} Zertifikat${skill.certificateCount !== 1 ? "e" : ""}
          ${skill.skillCategory ? ` · ${skill.skillCategory}` : ""}
        </div>
      </div>
      `;
    }).join("")}
  </div>
  ` : ""}

  ${certificates.length > 0 ? `
  <!-- Certificates Section -->
  <div class="section">
    <h2 class="section-title">Zertifikate (${certificates.length})</h2>
    ${certificates.map((cert, index) => {
      const issueDate = cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("de-DE", { year: "numeric", month: "long" }) : "";
      const skillsList = cert.skills ? cert.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
      
      return `
      <div class="certificate-item">
        <div class="certificate-header">
          <div>
            <div class="certificate-title">${cert.title}</div>
            <div class="certificate-issuer">${cert.issuer}</div>
          </div>
          <div style="text-align: right;">
            ${cert.isVerified ? '<span class="badge badge-verified">✓ Verifiziert</span>' : ""}
            ${cert.level ? `<span class="badge badge-level">${cert.level}</span>` : ""}
            ${issueDate ? `<div class="certificate-date">${issueDate}</div>` : ""}
          </div>
        </div>
        ${cert.description ? `<div class="certificate-description">${cert.description}</div>` : ""}
        ${skillsList.length > 0 ? `
        <div class="certificate-skills">
          ${skillsList.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join("")}
        </div>
        ` : ""}
      </div>
      ${index < certificates.length - 1 && (index + 1) % 5 === 0 ? '<div class="page-break"></div>' : ""}
      `;
    }).join("")}
  </div>
  ` : ""}

  <!-- Footer -->
  <div class="footer">
    Erstellt mit CertFolio · ${new Date().toLocaleDateString("de-DE")}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Convert HTML to PDF using WeasyPrint via Python subprocess
 */
async function htmlToPDF(html: string): Promise<Buffer> {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);
  const fs = await import("fs/promises");
  const path = await import("path");
  const os = await import("os");

  // Create temporary files
  const tmpDir = os.tmpdir();
  const htmlPath = path.join(tmpDir, `portfolio-${Date.now()}.html`);
  const pdfPath = path.join(tmpDir, `portfolio-${Date.now()}.pdf`);

  try {
    // Write HTML to temp file
    await fs.writeFile(htmlPath, html, "utf-8");

    // Convert to PDF using WeasyPrint
    await execAsync(`weasyprint "${htmlPath}" "${pdfPath}"`);

    // Read PDF buffer
    const pdfBuffer = await fs.readFile(pdfPath);

    // Clean up temp files
    await fs.unlink(htmlPath);
    await fs.unlink(pdfPath);

    return pdfBuffer;
  } catch (error) {
    // Clean up on error
    try {
      await fs.unlink(htmlPath);
      await fs.unlink(pdfPath);
    } catch {}
    throw new Error(`PDF generation failed: ${error}`);
  }
}
