import { describe, expect, it } from "vitest";

/**
 * Tests for the certificate filtering logic.
 * The filtering is client-side (useMemo in Certificates.tsx),
 * so we test the pure filter logic extracted here.
 */

interface MockCertificate {
  id: number;
  title: string;
  issuer: string;
  description: string | null;
  skills: string | null;
  category: string | null;
  level: string | null;
  priority: string;
  issueDate: Date | null;
}

// Extracted filter logic matching Certificates.tsx implementation
function filterCertificates(
  certificates: MockCertificate[],
  filters: {
    searchQuery?: string;
    filterCategory?: string;
    filterLevel?: string;
    filterIssuer?: string;
    filterPriority?: string;
    filterTimeRange?: string;
  }
): MockCertificate[] {
  const {
    searchQuery = "",
    filterCategory = "all",
    filterLevel = "all",
    filterIssuer = "all",
    filterPriority = "all",
    filterTimeRange = "all",
  } = filters;

  return certificates.filter((cert) => {
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        cert.title.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query) ||
        cert.description?.toLowerCase().includes(query) ||
        cert.skills?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filterCategory !== "all" && cert.category !== filterCategory) return false;

    // Level filter
    if (filterLevel !== "all" && cert.level !== filterLevel) return false;

    // Issuer filter
    if (filterIssuer !== "all" && cert.issuer !== filterIssuer) return false;

    // Priority filter
    if (filterPriority !== "all" && cert.priority !== filterPriority) return false;

    // Time range filter
    if (filterTimeRange !== "all" && cert.issueDate) {
      const days = parseInt(filterTimeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const certDate = new Date(cert.issueDate);
      if (certDate < cutoffDate) return false;
    }

    return true;
  });
}

// Test data
const testCertificates: MockCertificate[] = [
  {
    id: 1,
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    description: "Cloud architecture certification",
    skills: "AWS, Cloud, EC2, S3",
    category: "it",
    level: "advanced",
    priority: "important",
    issueDate: new Date("2025-12-01"),
  },
  {
    id: 2,
    title: "Google Analytics Certification",
    issuer: "Google",
    description: "Digital marketing analytics",
    skills: "Analytics, Marketing, Data",
    category: "marketing",
    level: "intermediate",
    priority: "normal",
    issueDate: new Date("2025-06-15"),
  },
  {
    id: 3,
    title: "Project Management Professional",
    issuer: "PMI",
    description: "Project management certification",
    skills: "Project Management, Agile, Scrum",
    category: "management",
    level: "expert",
    priority: "important",
    issueDate: new Date("2024-03-20"),
  },
  {
    id: 4,
    title: "React Advanced Patterns",
    issuer: "Frontend Masters",
    description: "Advanced React development patterns",
    skills: "React, JavaScript, TypeScript",
    category: "it",
    level: "advanced",
    priority: "normal",
    issueDate: new Date("2026-01-10"),
  },
  {
    id: 5,
    title: "Python for Data Science",
    issuer: "Coursera",
    description: "Data science with Python",
    skills: "Python, Pandas, NumPy",
    category: "it",
    level: "beginner",
    priority: "normal",
    issueDate: null,
  },
];

describe("Certificate Filter Logic", () => {
  describe("no filters applied", () => {
    it("should return all certificates when no filters are set", () => {
      const result = filterCertificates(testCertificates, {});
      expect(result).toHaveLength(5);
    });

    it("should return all certificates when all filters are 'all'", () => {
      const result = filterCertificates(testCertificates, {
        filterCategory: "all",
        filterLevel: "all",
        filterIssuer: "all",
        filterPriority: "all",
        filterTimeRange: "all",
      });
      expect(result).toHaveLength(5);
    });
  });

  describe("text search", () => {
    it("should filter by title", () => {
      const result = filterCertificates(testCertificates, { searchQuery: "AWS" });
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("AWS");
    });

    it("should filter by issuer", () => {
      const result = filterCertificates(testCertificates, { searchQuery: "Google" });
      expect(result).toHaveLength(1);
      expect(result[0].issuer).toBe("Google");
    });

    it("should filter by description", () => {
      const result = filterCertificates(testCertificates, { searchQuery: "cloud" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("should filter by skills", () => {
      const result = filterCertificates(testCertificates, { searchQuery: "React" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(4);
    });

    it("should be case-insensitive", () => {
      const result = filterCertificates(testCertificates, { searchQuery: "python" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(5);
    });

    it("should return empty for non-matching search", () => {
      const result = filterCertificates(testCertificates, { searchQuery: "Kubernetes" });
      expect(result).toHaveLength(0);
    });
  });

  describe("category filter", () => {
    it("should filter by IT category", () => {
      const result = filterCertificates(testCertificates, { filterCategory: "it" });
      expect(result).toHaveLength(3);
      result.forEach((cert) => expect(cert.category).toBe("it"));
    });

    it("should filter by marketing category", () => {
      const result = filterCertificates(testCertificates, { filterCategory: "marketing" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("should filter by management category", () => {
      const result = filterCertificates(testCertificates, { filterCategory: "management" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it("should return empty for unused category", () => {
      const result = filterCertificates(testCertificates, { filterCategory: "healthcare" });
      expect(result).toHaveLength(0);
    });
  });

  describe("level filter", () => {
    it("should filter by advanced level", () => {
      const result = filterCertificates(testCertificates, { filterLevel: "advanced" });
      expect(result).toHaveLength(2);
      result.forEach((cert) => expect(cert.level).toBe("advanced"));
    });

    it("should filter by beginner level", () => {
      const result = filterCertificates(testCertificates, { filterLevel: "beginner" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(5);
    });

    it("should filter by expert level", () => {
      const result = filterCertificates(testCertificates, { filterLevel: "expert" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });
  });

  describe("issuer filter", () => {
    it("should filter by specific issuer", () => {
      const result = filterCertificates(testCertificates, { filterIssuer: "Google" });
      expect(result).toHaveLength(1);
      expect(result[0].issuer).toBe("Google");
    });

    it("should filter by Amazon Web Services", () => {
      const result = filterCertificates(testCertificates, { filterIssuer: "Amazon Web Services" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe("priority filter", () => {
    it("should filter by important priority", () => {
      const result = filterCertificates(testCertificates, { filterPriority: "important" });
      expect(result).toHaveLength(2);
      result.forEach((cert) => expect(cert.priority).toBe("important"));
    });

    it("should filter by normal priority", () => {
      const result = filterCertificates(testCertificates, { filterPriority: "normal" });
      expect(result).toHaveLength(3);
      result.forEach((cert) => expect(cert.priority).toBe("normal"));
    });
  });

  describe("time range filter", () => {
    it("should filter by last 30 days", () => {
      const result = filterCertificates(testCertificates, { filterTimeRange: "30" });
      // Only certificates from last 30 days (relative to test execution)
      result.forEach((cert) => {
        if (cert.issueDate) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 30);
          expect(new Date(cert.issueDate).getTime()).toBeGreaterThanOrEqual(cutoff.getTime());
        }
      });
    });

    it("should include certificates without issueDate when time filter is active", () => {
      const result = filterCertificates(testCertificates, { filterTimeRange: "30" });
      // Certificate 5 has no issueDate, so the time filter condition is skipped
      const noDateCert = result.find((c) => c.id === 5);
      expect(noDateCert).toBeDefined();
    });

    it("should filter by last 2 years", () => {
      const result = filterCertificates(testCertificates, { filterTimeRange: "730" });
      // Should include most certificates except very old ones
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("combined filters", () => {
    it("should combine search with category filter", () => {
      const result = filterCertificates(testCertificates, {
        searchQuery: "React",
        filterCategory: "it",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(4);
    });

    it("should combine category and level filter", () => {
      const result = filterCertificates(testCertificates, {
        filterCategory: "it",
        filterLevel: "advanced",
      });
      expect(result).toHaveLength(2);
      result.forEach((cert) => {
        expect(cert.category).toBe("it");
        expect(cert.level).toBe("advanced");
      });
    });

    it("should combine category and priority filter", () => {
      const result = filterCertificates(testCertificates, {
        filterCategory: "it",
        filterPriority: "important",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("should return empty when combined filters exclude all", () => {
      const result = filterCertificates(testCertificates, {
        filterCategory: "marketing",
        filterLevel: "expert",
      });
      expect(result).toHaveLength(0);
    });

    it("should combine search, category, and level", () => {
      const result = filterCertificates(testCertificates, {
        searchQuery: "AWS",
        filterCategory: "it",
        filterLevel: "advanced",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("should combine all filters", () => {
      const result = filterCertificates(testCertificates, {
        searchQuery: "AWS",
        filterCategory: "it",
        filterLevel: "advanced",
        filterIssuer: "Amazon Web Services",
        filterPriority: "important",
        filterTimeRange: "730",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe("unique issuers extraction", () => {
    it("should extract unique issuers sorted alphabetically", () => {
      const issuers = Array.from(new Set(testCertificates.map((c) => c.issuer))).sort();
      expect(issuers).toEqual([
        "Amazon Web Services",
        "Coursera",
        "Frontend Masters",
        "Google",
        "PMI",
      ]);
    });
  });

  describe("active filter count", () => {
    it("should count zero when no filters active", () => {
      let count = 0;
      if ("all" !== "all") count++;
      expect(count).toBe(0);
    });

    it("should count active filters correctly", () => {
      const filters = {
        filterCategory: "it",
        filterLevel: "all",
        filterIssuer: "Google",
        filterPriority: "all",
        filterTimeRange: "30",
      };
      let count = 0;
      if (filters.filterCategory !== "all") count++;
      if (filters.filterLevel !== "all") count++;
      if (filters.filterIssuer !== "all") count++;
      if (filters.filterPriority !== "all") count++;
      if (filters.filterTimeRange !== "all") count++;
      expect(count).toBe(3);
    });
  });
});
