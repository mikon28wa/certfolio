import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    bio: null,
    profileSlug: null,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("certificates router", () => {
  it("creates a certificate with all required fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const certificate = await caller.certificates.create({
      title: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      issueDate: new Date("2024-01-15"),
      description: "Professional level certification for AWS architecture",
      skills: "AWS, Cloud Architecture, EC2, S3",
      level: "advanced",
      category: "it",
      priority: "important",
      isVerified: true,
      verificationUrl: "https://aws.amazon.com/verification/12345",
      isPublic: true,
    });

    expect(certificate).toBeDefined();
    expect(certificate.title).toBe("AWS Certified Solutions Architect");
    expect(certificate.issuer).toBe("Amazon Web Services");
    expect(certificate.level).toBe("advanced");
    expect(certificate.category).toBe("it");
    expect(certificate.isVerified).toBe(true);
  });

  it("creates a certificate with external URL", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const certificate = await caller.certificates.create({
      title: "Google Analytics Certification",
      issuer: "Google",
      externalUrl: "https://skillshop.exceedlms.com/student/award/12345",
      isPublic: true,
      priority: "normal",
    });

    expect(certificate).toBeDefined();
    expect(certificate.externalUrl).toBe("https://skillshop.exceedlms.com/student/award/12345");
  });

  it("lists certificates for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a test certificate first
    await caller.certificates.create({
      title: "Test Certificate",
      issuer: "Test Issuer",
      isPublic: true,
      priority: "normal",
    });

    const certificates = await caller.certificates.list();
    
    expect(Array.isArray(certificates)).toBe(true);
    expect(certificates.length).toBeGreaterThan(0);
  });

  it("updates certificate metadata", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create certificate
    const certificate = await caller.certificates.create({
      title: "Original Title",
      issuer: "Original Issuer",
      isPublic: true,
      priority: "normal",
    });

    // Update certificate
    await caller.certificates.update({
      id: certificate.id,
      title: "Updated Title",
      level: "expert",
      category: "marketing",
    });

    // Verify update
    const updated = await caller.certificates.get({ id: certificate.id });
    expect(updated.title).toBe("Updated Title");
    expect(updated.level).toBe("expert");
    expect(updated.category).toBe("marketing");
  });

  it("deletes a certificate", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create certificate
    const certificate = await caller.certificates.create({
      title: "To Be Deleted",
      issuer: "Test Issuer",
      isPublic: true,
      priority: "normal",
    });

    // Delete certificate
    const result = await caller.certificates.delete({ id: certificate.id });
    expect(result.success).toBe(true);

    // Verify deletion - should throw NOT_FOUND error
    await expect(
      caller.certificates.get({ id: certificate.id })
    ).rejects.toThrow();
  });

  it("searches certificates by title and issuer", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create test certificates
    await caller.certificates.create({
      title: "React Advanced Patterns",
      issuer: "Frontend Masters",
      isPublic: true,
      priority: "normal",
    });

    await caller.certificates.create({
      title: "Python for Data Science",
      issuer: "Coursera",
      isPublic: true,
      priority: "normal",
    });

    // Search for React
    const reactCerts = await caller.certificates.search({ query: "React" });
    expect(reactCerts.length).toBeGreaterThan(0);
    expect(reactCerts[0]?.title).toContain("React");

    // Search for Python
    const pythonCerts = await caller.certificates.search({ query: "Python" });
    expect(pythonCerts.length).toBeGreaterThan(0);
    expect(pythonCerts[0]?.title).toContain("Python");
  });
});
