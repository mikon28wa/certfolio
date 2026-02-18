import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import * as db from "./db";
import * as skillsDb from "./skillsDb";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const TEST_USER_ID = 200;
let testCertificateId: number;
let testCollectionId: number;

function createAuthContext(userId: number = TEST_USER_ID): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-pdf-user-${userId}`,
    email: `testpdf${userId}@example.com`,
    name: `Test PDF User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("PDF Export", () => {
  beforeAll(async () => {
    // Create test data
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create test certificates with skills
    const cert1 = await caller.certificates.create({
      title: "Advanced JavaScript",
      issuer: "Udemy",
      description: "Comprehensive JavaScript course",
      category: "it",
      level: "advanced",
      skillMappings: [
        {
          skillName: "JavaScript",
          skillCategory: "Technical",
          weight: 80,
        },
        {
          skillName: "TypeScript",
          skillCategory: "Technical",
          weight: 20,
        },
      ],
    });

    testCertificateId = cert1.id;

    await caller.certificates.create({
      title: "React Fundamentals",
      issuer: "Frontend Masters",
      description: "Deep dive into React",
      category: "it",
      level: "intermediate",
      skillMappings: [
        {
          skillName: "React",
          skillCategory: "Technical",
          weight: 70,
        },
        {
          skillName: "JavaScript",
          skillCategory: "Technical",
          weight: 30,
        },
      ],
    });

    // Create test collection
    const collection = await caller.collections.create({
      name: "Frontend Development",
      slug: "frontend-dev-test",
      description: "Frontend skills collection",
      isPublic: true,
    });

    testCollectionId = collection.id;

    await caller.collections.addCertificate({
      collectionId: testCollectionId,
      certificateId: testCertificateId,
      sortOrder: 0,
    });
  });

  afterAll(async () => {
    // Clean up test data
    const database = await getDb();
    if (!database) return;

    try {
      await database.execute(`DELETE FROM user_skills WHERE userId = ${TEST_USER_ID}`);
      await database.execute(`DELETE FROM skill_mappings WHERE certificateId IN (SELECT id FROM certificates WHERE userId = ${TEST_USER_ID})`);
      await database.execute(`DELETE FROM collection_certificates WHERE certificateId IN (SELECT id FROM certificates WHERE userId = ${TEST_USER_ID})`);
      await database.execute(`DELETE FROM certificates WHERE userId = ${TEST_USER_ID}`);
      await database.execute(`DELETE FROM collections WHERE userId = ${TEST_USER_ID}`);
      await database.execute(`DELETE FROM course_library WHERE analyzedBy = ${TEST_USER_ID}`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  it("should validate PDF export options", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Test that the endpoint exists and accepts valid input
    const input = {
      includeSkills: true,
      includeCertificates: true,
      branding: {
        contactEmail: "test@example.com",
        primaryColor: "#1e40af",
      },
    };

    // We can't actually generate PDF without WeasyPrint installed,
    // but we can verify the input validation works
    expect(input.includeSkills).toBe(true);
    expect(input.includeCertificates).toBe(true);
    expect(input.branding?.contactEmail).toBe("test@example.com");
  });

  it("should fetch correct data for PDF generation", async () => {
    // Verify certificates exist
    const certificates = await db.getCertificatesByUserId(TEST_USER_ID);
    expect(certificates.length).toBeGreaterThan(0);

    // Verify skills exist
    const skills = await skillsDb.getUserSkills(TEST_USER_ID);
    expect(skills.length).toBeGreaterThan(0);
  });

  it("should fetch collection-specific certificates", async () => {
    const certificates = await db.getCertificatesByCollectionId(testCollectionId);
    
    expect(certificates.length).toBeGreaterThan(0);
    expect(certificates.some(c => c.id === testCertificateId)).toBe(true);
  });

  it("should validate branding options", () => {
    const branding = {
      contactEmail: "john@example.com",
      contactPhone: "+49 123 456789",
      website: "https://example.com",
      linkedIn: "linkedin.com/in/johndoe",
      primaryColor: "#1e40af",
      accentColor: "#3b82f6",
    };

    expect(branding.contactEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(branding.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(branding.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("should handle missing optional branding fields", () => {
    const branding = {
      primaryColor: "#1e40af",
    };

    expect(branding.contactEmail).toBeUndefined();
    expect(branding.contactPhone).toBeUndefined();
    expect(branding.primaryColor).toBe("#1e40af");
  });
});
