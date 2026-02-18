import { describe, expect, it, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Track created data for cleanup (module-level)
const createdUserIds: number[] = [];

function createAuthContext(userId: number = 100): TrpcContext {
  // Track user ID for cleanup
  if (!createdUserIds.includes(userId)) {
    createdUserIds.push(userId);
  }
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-upload-user-${userId}`,
    email: `testupload${userId}@example.com`,
    name: `Test Upload User ${userId}`,
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

describe("Upload Flow with Skill Analysis", () => {
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

  it("should create certificate with skill mappings and trigger aggregation", async () => {
    const ctx = createAuthContext(101);
    const caller = appRouter.createCaller(ctx);

    // Simulate upload with skill mappings from LLM analysis
    const cert = await caller.certificates.create({
      title: "Full Stack Web Development",
      issuer: "Udemy",
      issueDate: new Date("2024-01-15"),
      description: "Complete web development course",
      level: "intermediate",
      category: "it",
      skillMappings: [
        {
          skillName: "React",
          skillCategory: "Technical",
          weight: 35,
          reasoning: "Core framework covered in course",
        },
        {
          skillName: "Node.js",
          skillCategory: "Technical",
          weight: 30,
          reasoning: "Backend development focus",
        },
        {
          skillName: "Database Design",
          skillCategory: "Technical",
          weight: 20,
          reasoning: "SQL and NoSQL databases",
        },
        {
          skillName: "API Development",
          skillCategory: "Technical",
          weight: 15,
          reasoning: "RESTful API creation",
        },
      ],
    });

    expect(cert).toBeDefined();
    expect(cert.title).toBe("Full Stack Web Development");

    // Verify skill mappings were created
    const mappings = await caller.skillMappings.getByCertificateId({
      certificateId: cert.id,
    });

    expect(mappings).toHaveLength(4);
    expect(mappings.find(m => m.skillName === "React")?.weight).toBe(35);

    // Verify user skills were aggregated
    const skills = await caller.skills.getUserSkills();

    expect(skills.length).toBeGreaterThan(0);

    const reactSkill = skills.find(s => s.skillName === "React");
    expect(reactSkill).toBeDefined();
    expect(reactSkill?.totalPoints).toBe(35);
    expect(reactSkill?.level).toBe(1); // 35 points = level 1
    expect(reactSkill?.certificateCount).toBe(1);
  });

  it("should add course to library with UUID", async () => {
    const ctx = createAuthContext(102);
    const caller = appRouter.createCaller(ctx);

    const courseUuid = "udemy-fullstack-2024";

    // Create certificate with courseUuid
    const cert = await caller.certificates.create({
      title: "Advanced JavaScript",
      issuer: "Udemy",
      description: "Deep dive into JavaScript",
      category: "it",
      courseUuid,
      courseDuration: 40,
      courseCredits: 5,
      skillMappings: [
        {
          skillName: "JavaScript",
          skillCategory: "Technical",
          weight: 80,
        },
        {
          skillName: "Async Programming",
          skillCategory: "Technical",
          weight: 20,
        },
      ],
    });

    expect(cert).toBeDefined();

    // Verify course was added to library
    const course = await caller.courseLibrary.getByUuid({ courseUuid });

    expect(course).toBeDefined();
    expect(course?.title).toBe("Advanced JavaScript");
    expect(course?.duration).toBe(40);
    expect(course?.usageCount).toBe(1);
  });

  it("should increment usage count for existing course", async () => {
    const ctx = createAuthContext(103);
    const caller = appRouter.createCaller(ctx);

    const courseUuid = "coursera-ml-001";

    // Create first certificate
    await caller.certificates.create({
      title: "Machine Learning Basics",
      issuer: "Coursera",
      courseUuid,
      category: "it",
      skillMappings: [
        {
          skillName: "Machine Learning",
          skillCategory: "Technical",
          weight: 60,
        },
      ],
    });

    // Create second certificate with same UUID
    await caller.certificates.create({
      title: "Machine Learning Basics",
      issuer: "Coursera",
      courseUuid,
      category: "it",
      skillMappings: [
        {
          skillName: "Machine Learning",
          skillCategory: "Technical",
          weight: 60,
        },
      ],
    });

    // Verify usage count was incremented
    const course = await caller.courseLibrary.getByUuid({ courseUuid });

    expect(course).toBeDefined();
    expect(course?.usageCount).toBe(2);

    // Verify skills were aggregated from both certificates
    const skills = await caller.skills.getUserSkills();
    const mlSkill = skills.find(s => s.skillName === "Machine Learning");

    expect(mlSkill?.totalPoints).toBe(120); // 60 + 60
    expect(mlSkill?.certificateCount).toBe(2);
  });

  it("should aggregate skills from multiple certificates", async () => {
    const ctx = createAuthContext(104);
    const caller = appRouter.createCaller(ctx);

    // Create first certificate
    await caller.certificates.create({
      title: "Python Basics",
      issuer: "Coursera",
      category: "it",
      skillMappings: [
        {
          skillName: "Python",
          skillCategory: "Technical",
          weight: 50,
        },
        {
          skillName: "Programming Fundamentals",
          skillCategory: "Technical",
          weight: 30,
        },
      ],
    });

    // Create second certificate
    await caller.certificates.create({
      title: "Advanced Python",
      issuer: "Udemy",
      category: "it",
      skillMappings: [
        {
          skillName: "Python",
          skillCategory: "Technical",
          weight: 70,
        },
        {
          skillName: "Data Analysis",
          skillCategory: "Technical",
          weight: 30,
        },
      ],
    });

    // Create third certificate
    await caller.certificates.create({
      title: "Python for Data Science",
      issuer: "edX",
      category: "it",
      skillMappings: [
        {
          skillName: "Python",
          skillCategory: "Technical",
          weight: 60,
        },
        {
          skillName: "Data Analysis",
          skillCategory: "Technical",
          weight: 40,
        },
      ],
    });

    // Verify aggregation
    const skills = await caller.skills.getUserSkills();

    const pythonSkill = skills.find(s => s.skillName === "Python");
    expect(pythonSkill?.totalPoints).toBe(180); // 50 + 70 + 60
    expect(pythonSkill?.level).toBe(2); // 180 points = level 2
    expect(pythonSkill?.certificateCount).toBe(3);

    const dataAnalysisSkill = skills.find(s => s.skillName === "Data Analysis");
    expect(dataAnalysisSkill?.totalPoints).toBe(70); // 30 + 40
    expect(dataAnalysisSkill?.level).toBe(1);
    expect(dataAnalysisSkill?.certificateCount).toBe(2);
  });

  it("should handle certificate without skill mappings", async () => {
    const ctx = createAuthContext(105);
    const caller = appRouter.createCaller(ctx);

    // Create certificate without skill mappings
    const cert = await caller.certificates.create({
      title: "Basic Certificate",
      issuer: "Test Institute",
      description: "Simple certificate without skills",
    });

    expect(cert).toBeDefined();

    // Verify no skill mappings were created
    const mappings = await caller.skillMappings.getByCertificateId({
      certificateId: cert.id,
    });

    expect(mappings).toHaveLength(0);

    // Verify no user skills exist
    const skills = await caller.skills.getUserSkills();
    expect(skills).toHaveLength(0);
  });
});
