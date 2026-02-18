import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as skillsDb from "./skillsDb";
import { getDb } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Track created data for cleanup (module-level)
const createdUserIds: number[] = [];

function createAuthContext(userId: number = 1): TrpcContext {
  // Track user ID for cleanup
  if (!createdUserIds.includes(userId)) {
    createdUserIds.push(userId);
  }
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
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

describe("Skill Management", () => {
  afterEach(async () => {
    // Clean up test data after each test
    const database = await getDb();
    if (!database) return;
    
    try {
      // Delete in reverse order of dependencies
      await database.execute(`DELETE FROM user_skills WHERE userId IN (${createdUserIds.join(',') || '0'})`);
      await database.execute(`DELETE FROM skill_mappings WHERE certificateId IN (SELECT id FROM certificates WHERE userId IN (${createdUserIds.join(',') || '0'}))`);
      await database.execute(`DELETE FROM collection_certificates WHERE certificateId IN (SELECT id FROM certificates WHERE userId IN (${createdUserIds.join(',') || '0'}))`);
      await database.execute(`DELETE FROM certificates WHERE userId IN (${createdUserIds.join(',') || '0'})`);
      await database.execute(`DELETE FROM collections WHERE userId IN (${createdUserIds.join(',') || '0'})`);
      await database.execute(`DELETE FROM course_library WHERE analyzedBy IN (${createdUserIds.join(',') || '0'})`);
      
      // Clear the tracking array
      createdUserIds.length = 0;
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });
  describe("skillMappings.createBulk", () => {
    it("should create multiple skill mappings for a certificate", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create a test certificate first
      const cert = await caller.certificates.create({
        title: "AWS Solutions Architect",
        issuer: "Amazon Web Services",
        issueDate: new Date("2024-01-15"),
        description: "Professional certification for AWS architecture",
        level: "advanced",
        category: "it",
      });

      // Create skill mappings
      const result = await caller.skillMappings.createBulk({
        certificateId: cert.id,
        mappings: [
          {
            skillName: "Cloud Architecture",
            skillCategory: "Technical",
            weight: 40,
            source: "llm",
          },
          {
            skillName: "AWS Services",
            skillCategory: "Technical",
            weight: 30,
            source: "llm",
          },
          {
            skillName: "Security",
            skillCategory: "Technical",
            weight: 20,
            source: "llm",
          },
          {
            skillName: "Cost Optimization",
            skillCategory: "Domain Knowledge",
            weight: 10,
            source: "llm",
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(4);

      // Verify mappings were created
      const mappings = await caller.skillMappings.getByCertificateId({
        certificateId: cert.id,
      });

      expect(mappings).toHaveLength(4);
      expect(mappings.find(m => m.skillName === "Cloud Architecture")?.weight).toBe(40);
    });

    it("should recalculate user skills after creating mappings", async () => {
      const ctx = createAuthContext(2);
      const caller = appRouter.createCaller(ctx);

      // Create certificate
      const cert = await caller.certificates.create({
        title: "Google Analytics Certification",
        issuer: "Google",
        issueDate: new Date("2024-02-01"),
        description: "Web analytics certification",
        category: "marketing",
      });

      // Create skill mappings
      await caller.skillMappings.createBulk({
        certificateId: cert.id,
        mappings: [
          {
            skillName: "Web Analytics",
            skillCategory: "Technical",
            weight: 50,
          },
          {
            skillName: "Data Interpretation",
            skillCategory: "Domain Knowledge",
            weight: 30,
          },
          {
            skillName: "Reporting",
            skillCategory: "Soft Skills",
            weight: 20,
          },
        ],
      });

      // Get user skills
      const skills = await caller.skills.getUserSkills();

      expect(skills.length).toBeGreaterThan(0);
      
      const webAnalytics = skills.find(s => s.skillName === "Web Analytics");
      expect(webAnalytics).toBeDefined();
      expect(webAnalytics?.totalPoints).toBe(50);
      expect(webAnalytics?.level).toBe(1); // 50 points = level 1
      expect(webAnalytics?.progressPercentage).toBe(50); // 50% towards level 2
      expect(webAnalytics?.certificateCount).toBe(1);
    });
  });

  describe("skills.recalculate", () => {
    it("should aggregate skills from multiple certificates", async () => {
      const ctx = createAuthContext(3);
      const caller = appRouter.createCaller(ctx);

      // Create first certificate
      const cert1 = await caller.certificates.create({
        title: "Python Programming",
        issuer: "Coursera",
        description: "Python basics",
        category: "it",
      });

      await caller.skillMappings.createBulk({
        certificateId: cert1.id,
        mappings: [
          { skillName: "Python", skillCategory: "Technical", weight: 60 },
          { skillName: "Programming", skillCategory: "Technical", weight: 40 },
        ],
      });

      // Create second certificate
      const cert2 = await caller.certificates.create({
        title: "Advanced Python",
        issuer: "Udemy",
        description: "Advanced Python concepts",
        category: "it",
      });

      await caller.skillMappings.createBulk({
        certificateId: cert2.id,
        mappings: [
          { skillName: "Python", skillCategory: "Technical", weight: 80 },
          { skillName: "Data Structures", skillCategory: "Technical", weight: 20 },
        ],
      });

      // Recalculate
      const result = await caller.skills.recalculate();
      expect(result.success).toBe(true);

      // Get aggregated skills
      const skills = await caller.skills.getUserSkills();

      const pythonSkill = skills.find(s => s.skillName === "Python");
      expect(pythonSkill).toBeDefined();
      expect(pythonSkill?.totalPoints).toBe(140); // 60 + 80
      expect(pythonSkill?.level).toBe(2); // 140 points = level 2
      expect(pythonSkill?.progressPercentage).toBe(40); // 40% towards level 3
      expect(pythonSkill?.certificateCount).toBe(2);
    });

    it("should calculate correct levels based on points", async () => {
      const ctx = createAuthContext(4);
      const caller = appRouter.createCaller(ctx);

      // Create certificate with high-weight skill
      const cert = await caller.certificates.create({
        title: "Full Stack Developer",
        issuer: "Test Academy",
        description: "Comprehensive full stack course",
        category: "it",
      });

      await caller.skillMappings.createBulk({
        certificateId: cert.id,
        mappings: [
          { skillName: "JavaScript", skillCategory: "Technical", weight: 100 },
        ],
      });

      // Create second certificate to push over 100 points
      const cert2 = await caller.certificates.create({
        title: "Advanced JavaScript",
        issuer: "Test Academy",
        description: "Advanced JS concepts",
        category: "it",
      });

      await caller.skillMappings.createBulk({
        certificateId: cert2.id,
        mappings: [
          { skillName: "JavaScript", skillCategory: "Technical", weight: 100 },
        ],
      });

      // Create third certificate to push over 200 points
      const cert3 = await caller.certificates.create({
        title: "JavaScript Mastery",
        issuer: "Test Academy",
        description: "Expert JS skills",
        category: "it",
      });

      await caller.skillMappings.createBulk({
        certificateId: cert3.id,
        mappings: [
          { skillName: "JavaScript", skillCategory: "Technical", weight: 50 },
        ],
      });

      const skills = await caller.skills.getUserSkills();
      const jsSkill = skills.find(s => s.skillName === "JavaScript");

      expect(jsSkill?.totalPoints).toBe(250); // 100 + 150
      expect(jsSkill?.level).toBe(3); // 250 points = level 3 (floor(250/100) + 1)
      expect(jsSkill?.progressPercentage).toBe(50); // 50% towards level 4
    });
  });

  describe("skills.getSkillDetails", () => {
    it("should return skill details with contributing certificates", async () => {
      const ctx = createAuthContext(5);
      const caller = appRouter.createCaller(ctx);

      // Create certificates
      const cert1 = await caller.certificates.create({
        title: "Project Management Basics",
        issuer: "PMI",
        description: "PM fundamentals",
        category: "management",
      });

      await caller.skillMappings.createBulk({
        certificateId: cert1.id,
        mappings: [
          { skillName: "Project Management", skillCategory: "Domain Knowledge", weight: 70 },
        ],
      });

      const cert2 = await caller.certificates.create({
        title: "Agile Scrum Master",
        issuer: "Scrum.org",
        description: "Agile methodologies",
        category: "management",
      });

      await caller.skillMappings.createBulk({
        certificateId: cert2.id,
        mappings: [
          { skillName: "Project Management", skillCategory: "Domain Knowledge", weight: 50 },
        ],
      });

      // Get skill details
      const details = await caller.skills.getSkillDetails({
        skillName: "Project Management",
      });

      expect(details).toBeDefined();
      expect(details?.skillName).toBe("Project Management");
      expect(details?.totalPoints).toBe(120); // 70 + 50
      expect(details?.contributingCertificates).toHaveLength(2);

      const contrib = details?.contributingCertificates as any[];
      expect(contrib.find((c: any) => c.title === "Project Management Basics")?.weight).toBe(70);
      expect(contrib.find((c: any) => c.title === "Agile Scrum Master")?.weight).toBe(50);
    });
  });

  describe("courseLibrary.create", () => {
    it("should create a course in the library", async () => {
      const ctx = createAuthContext(6);
      const caller = appRouter.createCaller(ctx);

      const course = await caller.courseLibrary.create({
        courseUuid: "coursera-ml-001",
        title: "Machine Learning Specialization",
        issuer: "Stanford University",
        description: "Comprehensive ML course",
        duration: 120,
        credits: 10,
        level: "advanced",
        category: "it",
        providerUrl: "https://coursera.org/ml",
        providerName: "Coursera",
      });

      expect(course).toBeDefined();
      expect(course.courseUuid).toBe("coursera-ml-001");
      expect(course.title).toBe("Machine Learning Specialization");
      expect(course.analyzedBy).toBe(ctx.user.id);
    });

    it("should prevent duplicate courses with same UUID", async () => {
      const ctx = createAuthContext(7);
      const caller = appRouter.createCaller(ctx);

      await caller.courseLibrary.create({
        courseUuid: "edx-python-101",
        title: "Python for Everybody",
        issuer: "University of Michigan",
        providerName: "edX",
      });

      // Try to create duplicate
      await expect(
        caller.courseLibrary.create({
          courseUuid: "edx-python-101",
          title: "Python for Everybody (Duplicate)",
          issuer: "University of Michigan",
          providerName: "edX",
        })
      ).rejects.toThrow("bereits in der Bibliothek");
    });
  });
});
