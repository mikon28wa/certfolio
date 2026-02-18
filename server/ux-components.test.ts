import { describe, it, expect } from "vitest";

/**
 * Tests for UX components logic (Breadcrumb segments, EmptyState props validation).
 * These test the data/logic layer, not React rendering.
 */

// ==================== Breadcrumb Segment Logic ====================

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

function buildBreadcrumbPath(segments: BreadcrumbSegment[]): string[] {
  const path = ["Dashboard"];
  for (const segment of segments) {
    path.push(segment.label);
  }
  return path;
}

function getClickableSegments(segments: BreadcrumbSegment[]): BreadcrumbSegment[] {
  // Dashboard is always clickable, last segment is never clickable
  return segments.slice(0, -1).filter(s => !!s.href);
}

describe("Breadcrumb Logic", () => {
  it("should build correct path for single segment", () => {
    const segments: BreadcrumbSegment[] = [{ label: "Zertifikate" }];
    const path = buildBreadcrumbPath(segments);
    expect(path).toEqual(["Dashboard", "Zertifikate"]);
  });

  it("should build correct path for nested segments", () => {
    const segments: BreadcrumbSegment[] = [
      { label: "Zertifikate", href: "/certificates" },
      { label: "Neues Zertifikat" },
    ];
    const path = buildBreadcrumbPath(segments);
    expect(path).toEqual(["Dashboard", "Zertifikate", "Neues Zertifikat"]);
  });

  it("should identify clickable segments (all except last)", () => {
    const segments: BreadcrumbSegment[] = [
      { label: "Zertifikate", href: "/certificates" },
      { label: "Neues Zertifikat" },
    ];
    const clickable = getClickableSegments(segments);
    expect(clickable).toEqual([{ label: "Zertifikate", href: "/certificates" }]);
  });

  it("should return empty clickable for single segment", () => {
    const segments: BreadcrumbSegment[] = [{ label: "Skills" }];
    const clickable = getClickableSegments(segments);
    expect(clickable).toEqual([]);
  });

  it("should handle empty segments array", () => {
    const path = buildBreadcrumbPath([]);
    expect(path).toEqual(["Dashboard"]);
  });

  it("should handle three-level nesting", () => {
    const segments: BreadcrumbSegment[] = [
      { label: "Projekte", href: "/projects" },
      { label: "Projekt A", href: "/projects/1" },
      { label: "Bearbeiten" },
    ];
    const path = buildBreadcrumbPath(segments);
    expect(path).toEqual(["Dashboard", "Projekte", "Projekt A", "Bearbeiten"]);
    const clickable = getClickableSegments(segments);
    expect(clickable).toEqual([
      { label: "Projekte", href: "/projects" },
      { label: "Projekt A", href: "/projects/1" },
    ]);
  });
});

// ==================== EmptyState Props Validation ====================

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
}

function validateEmptyStateProps(props: {
  title: string;
  description: string;
  actions?: EmptyStateAction[];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!props.title || props.title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (!props.description || props.description.trim().length === 0) {
    errors.push("Description is required");
  }
  if (props.actions) {
    for (const action of props.actions) {
      if (!action.label || action.label.trim().length === 0) {
        errors.push("Action label is required");
      }
      if (!action.href && !action.onClick) {
        errors.push("Action must have either href or onClick");
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

describe("EmptyState Props Validation", () => {
  it("should validate correct props", () => {
    const result = validateEmptyStateProps({
      title: "Noch keine Zertifikate",
      description: "Beginne damit, dein erstes Zertifikat hochzuladen.",
      actions: [{ label: "Zertifikat hinzufügen", href: "/certificates/new" }],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should reject empty title", () => {
    const result = validateEmptyStateProps({
      title: "",
      description: "Beschreibung",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Title is required");
  });

  it("should reject empty description", () => {
    const result = validateEmptyStateProps({
      title: "Titel",
      description: "  ",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Description is required");
  });

  it("should reject action without href or onClick", () => {
    const result = validateEmptyStateProps({
      title: "Titel",
      description: "Beschreibung",
      actions: [{ label: "Klick mich" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Action must have either href or onClick");
  });

  it("should accept action with onClick", () => {
    const result = validateEmptyStateProps({
      title: "Titel",
      description: "Beschreibung",
      actions: [{ label: "Klick mich", onClick: () => {} }],
    });
    expect(result.valid).toBe(true);
  });

  it("should accept props without actions", () => {
    const result = validateEmptyStateProps({
      title: "Keine Daten",
      description: "Es gibt noch keine Einträge.",
    });
    expect(result.valid).toBe(true);
  });

  it("should reject action with empty label", () => {
    const result = validateEmptyStateProps({
      title: "Titel",
      description: "Beschreibung",
      actions: [{ label: "", href: "/test" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Action label is required");
  });
});

// ==================== Page Route Mapping ====================

const PAGE_BREADCRUMB_MAP: Record<string, BreadcrumbSegment[]> = {
  "/certificates": [{ label: "Zertifikate" }],
  "/certificates/new": [{ label: "Zertifikate", href: "/certificates" }, { label: "Neues Zertifikat" }],
  "/skills": [{ label: "Skills" }],
  "/profile": [{ label: "Profil" }],
  "/projects/new": [{ label: "Projekte" }, { label: "Neues Projekt" }],
};

describe("Page Route Breadcrumb Mapping", () => {
  it("should have breadcrumbs for all main pages", () => {
    const expectedRoutes = ["/certificates", "/certificates/new", "/skills", "/profile", "/projects/new"];
    for (const route of expectedRoutes) {
      expect(PAGE_BREADCRUMB_MAP[route]).toBeDefined();
      expect(PAGE_BREADCRUMB_MAP[route].length).toBeGreaterThan(0);
    }
  });

  it("should have correct nesting for certificates/new", () => {
    const segments = PAGE_BREADCRUMB_MAP["/certificates/new"];
    expect(segments[0].label).toBe("Zertifikate");
    expect(segments[0].href).toBe("/certificates");
    expect(segments[1].label).toBe("Neues Zertifikat");
    expect(segments[1].href).toBeUndefined();
  });

  it("should have single segment for top-level pages", () => {
    expect(PAGE_BREADCRUMB_MAP["/certificates"].length).toBe(1);
    expect(PAGE_BREADCRUMB_MAP["/skills"].length).toBe(1);
    expect(PAGE_BREADCRUMB_MAP["/profile"].length).toBe(1);
  });
});
