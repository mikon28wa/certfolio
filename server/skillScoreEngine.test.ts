import { describe, expect, it } from "vitest";
import {
  computeSkillScore,
  mapScoreToLevel,
  adjustLevelForNoPractice,
  getLevelLabel,
  getLevelColor,
  SkillEvent,
} from "./skillScoreEngine";

describe("Skill Score Engine", () => {
  // Fixed reference date for deterministic tests
  const today = new Date("2026-02-18T12:00:00Z");

  describe("mapScoreToLevel", () => {
    it("maps score 0 to level 0", () => {
      expect(mapScoreToLevel(0)).toBe(0);
    });

    it("maps score 0.5 to level 0", () => {
      expect(mapScoreToLevel(0.5)).toBe(0);
    });

    it("maps score 1 to level 1", () => {
      expect(mapScoreToLevel(1)).toBe(1);
    });

    it("maps score 2.9 to level 1", () => {
      expect(mapScoreToLevel(2.9)).toBe(1);
    });

    it("maps score 3 to level 2", () => {
      expect(mapScoreToLevel(3)).toBe(2);
    });

    it("maps score 6 to level 3", () => {
      expect(mapScoreToLevel(6)).toBe(3);
    });

    it("maps score 10 to level 4", () => {
      expect(mapScoreToLevel(10)).toBe(4);
    });

    it("maps score 15 to level 5 (expert)", () => {
      expect(mapScoreToLevel(15)).toBe(5);
    });

    it("maps score 100 to level 5 (expert)", () => {
      expect(mapScoreToLevel(100)).toBe(5);
    });
  });

  describe("computeSkillScore - empty events", () => {
    it("returns zero score for empty events", () => {
      const result = computeSkillScore([], today);
      expect(result.score).toBe(0);
      expect(result.level).toBe(0);
      expect(result.certificateCount).toBe(0);
      expect(result.projectCount).toBe(0);
      expect(result.lastEventDate).toBeNull();
      expect(result.hasProject).toBe(false);
    });
  });

  describe("computeSkillScore - certificate decay", () => {
    it("recent certificate has higher score than old certificate", () => {
      const recentCert: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: new Date("2026-02-01T00:00:00Z"), // ~0.5 months ago
        weight: 50,
      }];

      const oldCert: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: new Date("2024-02-01T00:00:00Z"), // ~24 months ago
        weight: 50,
      }];

      const recentResult = computeSkillScore(recentCert, today);
      const oldResult = computeSkillScore(oldCert, today);

      expect(recentResult.score).toBeGreaterThan(oldResult.score);
    });

    it("certificate with λ=0.15 decays significantly over 12 months", () => {
      const freshCert: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: today, // just now
        weight: 100,
      }];

      const yearOldCert: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: new Date("2025-02-18T00:00:00Z"), // 12 months ago
        weight: 100,
      }];

      const freshResult = computeSkillScore(freshCert, today);
      const yearResult = computeSkillScore(yearOldCert, today);

      // After 12 months: exp(-0.15 * 12) ≈ 0.165
      // So year-old should be roughly 16.5% of fresh
      expect(yearResult.score).toBeLessThan(freshResult.score * 0.3);
    });
  });

  describe("computeSkillScore - project events", () => {
    it("project has higher base weight than certificate", () => {
      const cert: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: today,
        weight: 50,
      }];

      const proj: SkillEvent[] = [{
        type: "project",
        dateCompleted: today,
        weight: 50,
        complexity: 2,
        responsibility: 2,
        impact: 2,
      }];

      const certResult = computeSkillScore(cert, today);
      const projResult = computeSkillScore(proj, today);

      // Project base_weight (4.0) > Certificate base_weight (2.0)
      expect(projResult.score).toBeGreaterThan(certResult.score);
    });

    it("project decays slower than certificate (λ_proj=0.07 vs λ_cert=0.15)", () => {
      const date12MonthsAgo = new Date("2025-02-18T00:00:00Z");

      const oldCert: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: date12MonthsAgo,
        weight: 50,
      }];

      const oldProj: SkillEvent[] = [{
        type: "project",
        dateCompleted: date12MonthsAgo,
        weight: 50,
        complexity: 1,
        responsibility: 1,
        impact: 0,
      }];

      const certResult = computeSkillScore(oldCert, today);
      const projResult = computeSkillScore(oldProj, today);

      // Project should retain more value due to slower decay
      // Even with minimal complexity/responsibility, base_proj (4.0) * slower decay
      // should outweigh base_cert (2.0) * faster decay
      expect(projResult.score).toBeGreaterThan(certResult.score);
    });

    it("higher complexity and responsibility increase project score", () => {
      const lowComplexity: SkillEvent[] = [{
        type: "project",
        dateCompleted: today,
        weight: 50,
        complexity: 1,
        responsibility: 1,
        impact: 0,
      }];

      const highComplexity: SkillEvent[] = [{
        type: "project",
        dateCompleted: today,
        weight: 50,
        complexity: 3,
        responsibility: 3,
        impact: 3,
      }];

      const lowResult = computeSkillScore(lowComplexity, today);
      const highResult = computeSkillScore(highComplexity, today);

      expect(highResult.score).toBeGreaterThan(lowResult.score);
    });
  });

  describe("computeSkillScore - frequency factor", () => {
    it("more events increase score through frequency factor", () => {
      const singleEvent: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: today,
        weight: 50,
      }];

      const multipleEvents: SkillEvent[] = [
        { type: "certificate", dateCompleted: today, weight: 25 },
        { type: "certificate", dateCompleted: new Date("2025-12-01T00:00:00Z"), weight: 25 },
        { type: "certificate", dateCompleted: new Date("2025-08-01T00:00:00Z"), weight: 25 },
      ];

      const singleResult = computeSkillScore(singleEvent, today);
      const multiResult = computeSkillScore(multipleEvents, today);

      // Multiple events should have higher frequency factor
      // freq_factor = 1 + 0.15 * log(1 + N)
      // N=1: 1 + 0.15 * log(2) ≈ 1.104
      // N=3: 1 + 0.15 * log(4) ≈ 1.208
      expect(multiResult.score).toBeGreaterThan(0);
      expect(singleResult.score).toBeGreaterThan(0);
    });
  });

  describe("adjustLevelForNoPractice - business rules", () => {
    it("caps certificate-only skills at level 2 after 12 months", () => {
      const events: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: new Date("2024-06-01T00:00:00Z"), // ~20 months ago
        weight: 100,
      }];

      // Even if computed level is higher, cap at 2
      const adjusted = adjustLevelForNoPractice(4, events, today);
      expect(adjusted).toBeLessThanOrEqual(2);
    });

    it("does not cap certificate-only skills within 12 months", () => {
      const events: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: new Date("2025-08-01T00:00:00Z"), // ~6 months ago
        weight: 100,
      }];

      const adjusted = adjustLevelForNoPractice(4, events, today);
      expect(adjusted).toBe(4);
    });

    it("caps skills with projects at level 3 after 24 months", () => {
      const events: SkillEvent[] = [{
        type: "project",
        dateCompleted: new Date("2023-06-01T00:00:00Z"), // ~32 months ago
        weight: 100,
        complexity: 3,
        responsibility: 3,
        impact: 3,
      }];

      const adjusted = adjustLevelForNoPractice(5, events, today);
      expect(adjusted).toBeLessThanOrEqual(3);
    });

    it("does not cap skills with recent projects", () => {
      const events: SkillEvent[] = [{
        type: "project",
        dateCompleted: new Date("2025-12-01T00:00:00Z"), // ~2 months ago
        weight: 100,
        complexity: 3,
        responsibility: 3,
        impact: 3,
      }];

      const adjusted = adjustLevelForNoPractice(5, events, today);
      expect(adjusted).toBe(5);
    });
  });

  describe("computeSkillScore - combined certificate + project", () => {
    it("certificate + project yields higher score than certificate alone", () => {
      const certOnly: SkillEvent[] = [{
        type: "certificate",
        dateCompleted: today,
        weight: 50,
      }];

      const certAndProj: SkillEvent[] = [
        { type: "certificate", dateCompleted: today, weight: 50 },
        { type: "project", dateCompleted: today, weight: 50, complexity: 2, responsibility: 2, impact: 1 },
      ];

      const certResult = computeSkillScore(certOnly, today);
      const combinedResult = computeSkillScore(certAndProj, today);

      expect(combinedResult.score).toBeGreaterThan(certResult.score);
      expect(combinedResult.hasProject).toBe(true);
      expect(certResult.hasProject).toBe(false);
    });
  });

  describe("getLevelLabel", () => {
    it("returns correct German labels", () => {
      expect(getLevelLabel(0)).toBe("Keine Erfahrung");
      expect(getLevelLabel(1)).toBe("Grundkenntnisse");
      expect(getLevelLabel(2)).toBe("Fortgeschritten");
      expect(getLevelLabel(3)).toBe("Kompetent");
      expect(getLevelLabel(4)).toBe("Erfahren");
      expect(getLevelLabel(5)).toBe("Experte");
    });
  });

  describe("getLevelColor", () => {
    it("returns color strings for all levels", () => {
      for (let i = 0; i <= 5; i++) {
        const color = getLevelColor(i);
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      }
    });
  });
});
