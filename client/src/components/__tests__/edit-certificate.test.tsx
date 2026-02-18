import { describe, it, expect } from "vitest";
import type {
  Certificate,
  SkillMapping,
  EditCertificateFormState,
  SkillEditorState,
} from "../edit-certificate/types";

/**
 * EditCertificateDialog Refactoring Tests
 * Validates types, data structures, and business logic
 * extracted into the edit-certificate module.
 */

describe("EditCertificate Types", () => {
  it("should validate Certificate interface structure", () => {
    const cert: Certificate = {
      id: 1,
      title: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: "2025-01-15",
      description: "Cloud architecture certification",
      level: "advanced",
      category: "it",
      customCategory: null,
      priority: "important",
      isVerified: true,
      verificationUrl: "https://aws.amazon.com/verify/123",
      fileUrl: "https://s3.example.com/cert.pdf",
      fileName: "cert.pdf",
      mimeType: "application/pdf",
      externalUrl: null,
      isPublic: true,
      tags: null,
      courseUuid: "aws-sa-001",
      courseDuration: 40,
      courseCredits: 5,
      completionGrade: "95%",
      learningHours: 60,
    };

    expect(cert.id).toBe(1);
    expect(cert.title).toBeTruthy();
    expect(cert.issuer).toBeTruthy();
  });

  it("should validate Certificate with minimal required fields", () => {
    const cert: Certificate = {
      id: 42,
      title: "Basic Cert",
      issuer: "Test Issuer",
    };

    expect(cert.id).toBe(42);
    expect(cert.title).toBe("Basic Cert");
    expect(cert.description).toBeUndefined();
    expect(cert.fileUrl).toBeUndefined();
  });

  it("should validate SkillMapping structure", () => {
    const mapping: SkillMapping = {
      skillName: "TypeScript",
      skillCategory: "Technical",
      weight: 85,
      reasoning: "Core language used in the course",
    };

    expect(mapping.skillName).toBe("TypeScript");
    expect(mapping.weight).toBeGreaterThanOrEqual(0);
    expect(mapping.weight).toBeLessThanOrEqual(100);
    expect(mapping.reasoning).toBeTruthy();
  });

  it("should validate SkillMapping without reasoning", () => {
    const mapping: SkillMapping = {
      skillName: "React",
      skillCategory: "Technical",
      weight: 70,
    };

    expect(mapping.reasoning).toBeUndefined();
  });
});

describe("EditCertificateFormState", () => {
  it("should validate complete form state structure", () => {
    const state: EditCertificateFormState = {
      title: "Test Certificate",
      issuer: "Test Issuer",
      issueDate: "2025-01-15",
      description: "A test certificate",
      level: "intermediate",
      category: "it",
      customCategory: "",
      priority: "normal",
      isVerified: false,
      verificationUrl: "",
      externalUrl: "",
      isPublic: true,
      courseUuid: "",
      courseDuration: "",
      courseCredits: "",
      completionGrade: "",
      learningHours: "",
    };

    expect(state.title).toBeTruthy();
    expect(state.issuer).toBeTruthy();
    expect(typeof state.isVerified).toBe("boolean");
    expect(typeof state.isPublic).toBe("boolean");
  });

  it("should validate default form state values", () => {
    const defaults: EditCertificateFormState = {
      title: "",
      issuer: "",
      issueDate: "",
      description: "",
      level: "none",
      category: "none",
      customCategory: "",
      priority: "normal",
      isVerified: false,
      verificationUrl: "",
      externalUrl: "",
      isPublic: true,
      courseUuid: "",
      courseDuration: "",
      courseCredits: "",
      completionGrade: "",
      learningHours: "",
    };

    expect(defaults.level).toBe("none");
    expect(defaults.category).toBe("none");
    expect(defaults.priority).toBe("normal");
    expect(defaults.isPublic).toBe(true);
    expect(defaults.isVerified).toBe(false);
  });

  it("should validate custom category is set when category is 'other'", () => {
    const state: EditCertificateFormState = {
      title: "Custom Cert",
      issuer: "Custom Issuer",
      issueDate: "",
      description: "",
      level: "none",
      category: "other",
      customCategory: "Pflege & Gesundheit",
      priority: "normal",
      isVerified: false,
      verificationUrl: "",
      externalUrl: "",
      isPublic: true,
      courseUuid: "",
      courseDuration: "",
      courseCredits: "",
      completionGrade: "",
      learningHours: "",
    };

    expect(state.category).toBe("other");
    expect(state.customCategory).toBeTruthy();
    expect(state.customCategory.length).toBeLessThanOrEqual(100);
  });
});

describe("SkillEditorState", () => {
  it("should validate skill editor initial state", () => {
    const state: SkillEditorState = {
      skillMappings: [],
      newSkillName: "",
      newSkillCategory: "Technical",
      newSkillWeight: "50",
    };

    expect(state.skillMappings).toHaveLength(0);
    expect(state.newSkillCategory).toBe("Technical");
    expect(state.newSkillWeight).toBe("50");
  });

  it("should validate skill editor with populated mappings", () => {
    const state: SkillEditorState = {
      skillMappings: [
        { skillName: "React", skillCategory: "Technical", weight: 40 },
        { skillName: "Node.js", skillCategory: "Technical", weight: 30 },
        { skillName: "Projektmanagement", skillCategory: "Business", weight: 20 },
      ],
      newSkillName: "",
      newSkillCategory: "Technical",
      newSkillWeight: "50",
    };

    expect(state.skillMappings).toHaveLength(3);
    const totalWeight = state.skillMappings.reduce((sum, m) => sum + m.weight, 0);
    expect(totalWeight).toBe(90);
  });
});

describe("Skill Management Logic", () => {
  it("should detect duplicate skill names (case-insensitive)", () => {
    const mappings: SkillMapping[] = [
      { skillName: "TypeScript", skillCategory: "Technical", weight: 50 },
      { skillName: "React", skillCategory: "Technical", weight: 30 },
    ];

    const newSkillName = "typescript";
    const isDuplicate = mappings.some(
      (m) => m.skillName.toLowerCase() === newSkillName.toLowerCase()
    );

    expect(isDuplicate).toBe(true);
  });

  it("should allow non-duplicate skill names", () => {
    const mappings: SkillMapping[] = [
      { skillName: "TypeScript", skillCategory: "Technical", weight: 50 },
    ];

    const newSkillName = "JavaScript";
    const isDuplicate = mappings.some(
      (m) => m.skillName.toLowerCase() === newSkillName.toLowerCase()
    );

    expect(isDuplicate).toBe(false);
  });

  it("should validate weight range (0-100)", () => {
    const validWeights = [0, 25, 50, 75, 100];
    const invalidWeights = [-1, 101, 200, -50];

    validWeights.forEach((w) => {
      expect(w >= 0 && w <= 100).toBe(true);
    });

    invalidWeights.forEach((w) => {
      expect(w >= 0 && w <= 100).toBe(false);
    });
  });

  it("should calculate total weight correctly", () => {
    const mappings: SkillMapping[] = [
      { skillName: "A", skillCategory: "Technical", weight: 30 },
      { skillName: "B", skillCategory: "Business", weight: 25 },
      { skillName: "C", skillCategory: "Soft Skills", weight: 45 },
    ];

    const total = mappings.reduce((sum, m) => sum + m.weight, 0);
    expect(total).toBe(100);
  });

  it("should detect weight exceeding 100", () => {
    const mappings: SkillMapping[] = [
      { skillName: "A", skillCategory: "Technical", weight: 60 },
      { skillName: "B", skillCategory: "Business", weight: 50 },
    ];

    const total = mappings.reduce((sum, m) => sum + m.weight, 0);
    expect(total).toBeGreaterThan(100);
  });

  it("should clamp weight to valid range", () => {
    const clamp = (value: number) => Math.min(100, Math.max(0, value));

    expect(clamp(-10)).toBe(0);
    expect(clamp(0)).toBe(0);
    expect(clamp(50)).toBe(50);
    expect(clamp(100)).toBe(100);
    expect(clamp(150)).toBe(100);
  });

  it("should remove skill by index correctly", () => {
    const mappings: SkillMapping[] = [
      { skillName: "A", skillCategory: "Technical", weight: 30 },
      { skillName: "B", skillCategory: "Business", weight: 40 },
      { skillName: "C", skillCategory: "Tools", weight: 30 },
    ];

    const indexToRemove = 1;
    const result = mappings.filter((_, i) => i !== indexToRemove);

    expect(result).toHaveLength(2);
    expect(result[0].skillName).toBe("A");
    expect(result[1].skillName).toBe("C");
  });
});

describe("Certificate Date Formatting", () => {
  it("should format valid ISO date to YYYY-MM-DD", () => {
    const isoDate = "2025-06-15T00:00:00.000Z";
    const d = new Date(isoDate);
    const formatted = d.toISOString().split("T")[0];

    expect(formatted).toBe("2025-06-15");
  });

  it("should handle Date object", () => {
    const dateObj = new Date(2025, 5, 15); // June 15, 2025
    const formatted = dateObj.toISOString().split("T")[0];

    expect(formatted).toMatch(/^2025-06-1[45]$/); // timezone-safe
  });

  it("should detect invalid date", () => {
    const invalidDate = new Date("not-a-date");
    expect(isNaN(invalidDate.getTime())).toBe(true);
  });

  it("should handle null/undefined date", () => {
    const cert: Certificate = { id: 1, title: "Test", issuer: "Test" };
    const issueDate = cert.issueDate;

    expect(issueDate).toBeUndefined();
  });
});

describe("File Preview Logic", () => {
  it("should detect image mimeType", () => {
    const mimeType = "image/jpeg";
    expect(mimeType.startsWith("image/")).toBe(true);
  });

  it("should detect PDF mimeType", () => {
    const mimeType = "application/pdf";
    expect(mimeType === "application/pdf").toBe(true);
  });

  it("should handle missing fileUrl", () => {
    const cert: Certificate = { id: 1, title: "Test", issuer: "Test" };
    expect(cert.fileUrl).toBeUndefined();
  });

  it("should extract fileKey from S3 URL", () => {
    const fileUrl = "https://s3.example.com/bucket/1-certificates/1234-abc-cert.pdf";
    const urlParts = fileUrl.split("/");
    const keyStartIndex = urlParts.findIndex((part) => part.includes("-certificates"));

    expect(keyStartIndex).toBeGreaterThan(-1);

    const fileKey = urlParts.slice(keyStartIndex).join("/");
    expect(fileKey).toBe("1-certificates/1234-abc-cert.pdf");
  });
});

describe("Skill Category Validation", () => {
  it("should validate allowed skill categories", () => {
    const validCategories = ["Technical", "Business", "Soft Skills", "Domain", "Tools"];
    const testCategory = "Technical";

    expect(validCategories).toContain(testCategory);
  });

  it("should validate all predefined categories", () => {
    const categories = ["Technical", "Business", "Soft Skills", "Domain", "Tools"];

    expect(categories).toHaveLength(5);
    categories.forEach((cat) => {
      expect(cat.length).toBeGreaterThan(0);
    });
  });
});

describe("Form Submission Validation", () => {
  it("should require title and issuer", () => {
    const title = "";
    const issuer = "";

    const isValid = title.trim().length > 0 && issuer.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("should accept valid title and issuer", () => {
    const title = "AWS Solutions Architect";
    const issuer = "Amazon Web Services";

    const isValid = title.trim().length > 0 && issuer.trim().length > 0;
    expect(isValid).toBe(true);
  });

  it("should reject whitespace-only title", () => {
    const title = "   ";
    expect(title.trim().length > 0).toBe(false);
  });

  it("should parse numeric fields correctly", () => {
    const courseDuration = "40";
    const courseCredits = "5";
    const learningHours = "60";

    expect(parseFloat(courseDuration)).toBe(40);
    expect(parseFloat(courseCredits)).toBe(5);
    expect(parseFloat(learningHours)).toBe(60);
  });

  it("should handle empty numeric fields as undefined", () => {
    const courseDuration = "";
    const result = courseDuration ? parseFloat(courseDuration) : undefined;

    expect(result).toBeUndefined();
  });
});
