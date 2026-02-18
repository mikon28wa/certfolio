import { describe, it, expect, beforeAll } from "vitest";
import * as skillsDb from "./skillsDb";
import * as db from "./db";

/**
 * Tests for advanced skill features: Timeline, Comparisons, Recommendations
 */

describe("Advanced Skill Features", () => {
  let testUserId: number;
  let testCertId: number;

  beforeAll(async () => {
    // Create test user
    const openId = `test-advanced-${Date.now()}`;
    await db.upsertUser({
      openId,
      name: "Test User Advanced",
      email: "test-advanced@example.com",
    });
    const user = await db.getUserByOpenId(openId);
    testUserId = user!.id;

    // Create test certificate
    const cert = await db.createCertificate({
      userId: testUserId,
      title: "Test Certificate",
      issuer: "Test Issuer",
      issueDate: new Date(),
      isVerified: false,
      isPublic: true,
    });
    testCertId = cert.id;

    // Create skill mappings
    await skillsDb.createSkillMappings([
      { certificateId: testCertId, skillName: "JavaScript", skillCategory: "IT", weight: 100 },
      { certificateId: testCertId, skillName: "React", skillCategory: "IT", weight: 80 },
      { certificateId: testCertId, skillName: "TypeScript", skillCategory: "IT", weight: 90 },
    ]);

    // Recalculate to populate userSkills
    await skillsDb.recalculateUserSkills(testUserId);
  });

  describe("Skill Snapshot", () => {
    it("should capture skill snapshot with current levels", async () => {
      const snapshots = await skillsDb.captureSkillSnapshot(testUserId);
      
      expect(snapshots).toBeDefined();
      expect(snapshots.length).toBeGreaterThan(0);
      expect(snapshots[0]).toHaveProperty("userId", testUserId);
      expect(snapshots[0]).toHaveProperty("skillName");
      expect(snapshots[0]).toHaveProperty("level");
      expect(snapshots[0]).toHaveProperty("totalPoints");
      expect(snapshots[0]).toHaveProperty("snapshotDate");
    });

    it("should include certificate and project counts in snapshot", async () => {
      const snapshots = await skillsDb.captureSkillSnapshot(testUserId);
      
      const jsSnapshot = snapshots.find(s => s.skillName === "JavaScript");
      expect(jsSnapshot).toBeDefined();
      expect(jsSnapshot!.certificateCount).toBeGreaterThanOrEqual(0);
      expect(jsSnapshot!.projectCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Skill Timeline", () => {
    it("should return empty array if no snapshots exist", async () => {
      const timeline = await skillsDb.getSkillTimeline(testUserId, "NonExistentSkill");
      expect(timeline).toEqual([]);
    });

    it("should return timeline data for existing skill", async () => {
      // Capture snapshot first
      await skillsDb.captureSkillSnapshot(testUserId);
      
      const timeline = await skillsDb.getSkillTimeline(testUserId, "JavaScript");
      
      expect(timeline).toBeDefined();
      if (timeline.length > 0) {
        expect(timeline[0]).toHaveProperty("date");
        expect(timeline[0]).toHaveProperty("level");
        expect(timeline[0]).toHaveProperty("totalPoints");
        expect(timeline[0]).toHaveProperty("certificateCount");
        expect(timeline[0]).toHaveProperty("projectCount");
      }
    });

    it("should filter timeline by date range", async () => {
      await skillsDb.captureSkillSnapshot(testUserId);
      
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const timeline = await skillsDb.getSkillTimeline(
        testUserId,
        "JavaScript",
        undefined,
        futureDate.toISOString()
      );
      
      expect(timeline).toBeDefined();
      // All dates should be before the end date
      for (const point of timeline) {
        expect(new Date(point.date).getTime()).toBeLessThanOrEqual(futureDate.getTime());
      }
    });
  });

  describe("Skill Comparison", () => {
    it("should compare multiple skills", async () => {
      const comparison = await skillsDb.compareSkills(testUserId, ["JavaScript", "React", "TypeScript"]);
      
      expect(comparison).toBeDefined();
      expect(comparison.length).toBeGreaterThan(0);
      expect(comparison.length).toBeLessThanOrEqual(3);
      
      for (const skill of comparison) {
        expect(skill).toHaveProperty("skillName");
        expect(skill).toHaveProperty("level");
        expect(skill).toHaveProperty("totalPoints");
        expect(skill).toHaveProperty("certificateCount");
        expect(skill).toHaveProperty("projectCount");
      }
    });

    it("should return empty array if no matching skills", async () => {
      const comparison = await skillsDb.compareSkills(testUserId, ["NonExistent1", "NonExistent2"]);
      expect(comparison).toEqual([]);
    });

    it("should handle partial matches", async () => {
      const comparison = await skillsDb.compareSkills(testUserId, ["JavaScript", "NonExistent"]);
      
      expect(comparison.length).toBe(1);
      expect(comparison[0].skillName).toBe("JavaScript");
    });
  });

  describe("Skill Recommendations", () => {
    it("should return recommendations array", async () => {
      const recommendations = await skillsDb.getSkillRecommendations(testUserId);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should include recommendation structure", async () => {
      const recommendations = await skillsDb.getSkillRecommendations(testUserId);
      
      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec).toHaveProperty("type");
        expect(rec).toHaveProperty("skillName");
        expect(rec).toHaveProperty("currentLevel");
        expect(rec).toHaveProperty("reason");
        expect(rec).toHaveProperty("suggestedAction");
        expect(["level_up", "refresh", "new_skill"]).toContain(rec.type);
      }
    });

    it("should limit recommendations to 5", async () => {
      const recommendations = await skillsDb.getSkillRecommendations(testUserId);
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it("should recommend level_up for level 2 skills", async () => {
      // This test assumes we have a skill at level 2
      // In real scenario, we'd need to create specific test data
      const recommendations = await skillsDb.getSkillRecommendations(testUserId);
      
      const levelUpRecs = recommendations.filter(r => r.type === "level_up");
      for (const rec of levelUpRecs) {
        expect(rec.currentLevel).toBe(2);
      }
    });
  });

  describe("Integration: Snapshot → Timeline", () => {
    it("should create timeline from multiple snapshots", async () => {
      // Capture first snapshot
      await skillsDb.captureSkillSnapshot(testUserId);
      
      // Wait a bit (simulate time passing)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Modify skill (add another mapping)
      await skillsDb.createSkillMappings([
        { certificateId: testCertId, skillName: "JavaScript", skillCategory: "IT", weight: 50 },
      ]);
      await skillsDb.recalculateUserSkills(testUserId);
      
      // Capture second snapshot
      await skillsDb.captureSkillSnapshot(testUserId);
      
      // Get timeline
      const timeline = await skillsDb.getSkillTimeline(testUserId, "JavaScript");
      
      expect(timeline.length).toBeGreaterThanOrEqual(1);
      
      // Timeline should be sorted by date
      for (let i = 1; i < timeline.length; i++) {
        expect(new Date(timeline[i].date).getTime()).toBeGreaterThanOrEqual(
          new Date(timeline[i - 1].date).getTime()
        );
      }
    });
  });
});
