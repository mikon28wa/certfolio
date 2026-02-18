/**
 * Skill Score Engine
 * 
 * Implements the scoring logic as specified:
 * - Decay functions: certificates decay faster (λ=0.15), projects slower (λ=0.07)
 * - Frequency factor: more events = stronger skill retention
 * - Level mapping: score → level 0-5
 * - Business rules: certificate-only skills cap after 12 months without practice
 */

// ==================== CONSTANTS ====================

const LAMBDA_CERT = 0.15;  // Certificate decay rate (faster)
const LAMBDA_PROJ = 0.07;  // Project decay rate (slower)
const BASE_CERT = 2.0;     // Base weight for certificates
const BASE_PROJ = 4.0;     // Base weight for projects
const ALPHA_FREQ = 0.15;   // Frequency factor coefficient

// Level thresholds
const LEVEL_THRESHOLDS = [
  { maxScore: 1, level: 0 },
  { maxScore: 3, level: 1 },
  { maxScore: 6, level: 2 },
  { maxScore: 10, level: 3 },
  { maxScore: 15, level: 4 },
  // >= 15 → level 5
];

// ==================== TYPES ====================

export interface SkillEvent {
  type: "certificate" | "project";
  dateCompleted: Date;
  weight: number; // 0-100 percentage contribution to this skill
  // Project-specific fields
  complexity?: number;    // 1-3
  responsibility?: number; // 1-3
  impact?: number;         // 0-3
}

export interface SkillScoreResult {
  score: number;
  level: number;
  progressPercentage: number; // 0-100 within current level
  certificateCount: number;
  projectCount: number;
  lastEventDate: Date | null;
  hasProject: boolean;
}

// ==================== CORE FUNCTIONS ====================

/**
 * Calculate months between two dates
 */
function monthsBetween(from: Date, to: Date): number {
  const diffMs = to.getTime() - from.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44); // Average month length
  return Math.max(0, diffMonths);
}

/**
 * Compute the raw skill score from a list of skill events
 * 
 * Formula:
 * For each event:
 *   - Certificate: contribution = base_cert * weight/100 * exp(-λ_cert * t_months)
 *   - Project: contribution = base_proj * factor * weight/100 * exp(-λ_proj * t_months)
 *     where factor = 0.5 + (complexity + responsibility + impact) / 6.0
 * 
 * Total = sum(contributions) * freq_factor
 * freq_factor = 1 + α * log(1 + N)
 */
export function computeSkillScore(events: SkillEvent[], today: Date = new Date()): SkillScoreResult {
  if (events.length === 0) {
    return {
      score: 0,
      level: 0,
      progressPercentage: 0,
      certificateCount: 0,
      projectCount: 0,
      lastEventDate: null,
      hasProject: false,
    };
  }

  let total = 0.0;
  let certificateCount = 0;
  let projectCount = 0;
  let lastEventDate: Date | null = null;
  let hasProject = false;

  for (const event of events) {
    const tMonths = monthsBetween(event.dateCompleted, today);
    const weightFactor = event.weight / 100; // Normalize 0-100 to 0-1

    // Track last event date
    if (!lastEventDate || event.dateCompleted > lastEventDate) {
      lastEventDate = event.dateCompleted;
    }

    if (event.type === "certificate") {
      certificateCount++;
      const decay = Math.exp(-LAMBDA_CERT * tMonths);
      const contribution = BASE_CERT * weightFactor * decay;
      total += contribution;
    } else if (event.type === "project") {
      projectCount++;
      hasProject = true;
      const decay = Math.exp(-LAMBDA_PROJ * tMonths);

      // Experience factor from complexity, responsibility, impact
      const complexity = (event.complexity ?? 1) / 3;       // Normalize 1-3 to 0.33-1.0
      const responsibility = (event.responsibility ?? 1) / 3; // Normalize 1-3 to 0.33-1.0
      const impact = (event.impact ?? 0) / 3;                 // Normalize 0-3 to 0.0-1.0
      const factor = 0.5 + (complexity + responsibility + impact) / 2.0;

      const contribution = BASE_PROJ * factor * weightFactor * decay;
      total += contribution;
    }
  }

  // Frequency factor (spacing effect)
  const N = events.length;
  const freqFactor = 1 + ALPHA_FREQ * Math.log(1 + N);
  const score = total * freqFactor;

  // Map score to level
  let level = mapScoreToLevel(score);

  // Apply business rules
  level = adjustLevelForNoPractice(level, events, today);

  // Calculate progress percentage within current level
  const progressPercentage = calculateProgress(score, level);

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    level,
    progressPercentage,
    certificateCount,
    projectCount,
    lastEventDate,
    hasProject,
  };
}

/**
 * Map score to level 0-5
 */
export function mapScoreToLevel(score: number): number {
  if (score < 1) return 0;
  if (score < 3) return 1;
  if (score < 6) return 2;
  if (score < 10) return 3;
  if (score < 15) return 4;
  return 5;
}

/**
 * Business rules: adjust level based on practice evidence
 * 
 * - Certificate-only, older than 12 months → cap at level 2
 * - Has practice but all older than 24 months → cap at level 3
 */
export function adjustLevelForNoPractice(
  level: number,
  events: SkillEvent[],
  today: Date = new Date()
): number {
  if (events.length === 0) return 0;

  const hasProject = events.some(e => e.type === "project");
  
  // Find the most recent event date
  const lastEventMonths = Math.min(
    ...events.map(e => monthsBetween(e.dateCompleted, today))
  );

  // If only certificates, older than 12 months → cap at level 2
  if (!hasProject && lastEventMonths > 12) {
    level = Math.min(level, 2);
  }

  // If has practice but all older than 24 months → cap at level 3
  if (hasProject && lastEventMonths > 24) {
    level = Math.min(level, 3);
  }

  return level;
}

/**
 * Calculate progress percentage within current level (0-100)
 */
function calculateProgress(score: number, level: number): number {
  const levelBounds: Record<number, [number, number]> = {
    0: [0, 1],
    1: [1, 3],
    2: [3, 6],
    3: [6, 10],
    4: [10, 15],
    5: [15, 25], // Upper bound for display purposes
  };

  const [lower, upper] = levelBounds[level] ?? [0, 1];
  const range = upper - lower;
  if (range <= 0) return 0;

  const progress = ((score - lower) / range) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

/**
 * Compute skill scores for a specific collection
 * Only considers events from certificates/projects in the collection
 */
export function computeCollectionSkillScore(
  events: SkillEvent[],
  today: Date = new Date()
): SkillScoreResult {
  // Same logic, just with filtered events
  return computeSkillScore(events, today);
}

/**
 * Get level label for display
 */
export function getLevelLabel(level: number): string {
  const labels: Record<number, string> = {
    0: "Keine Erfahrung",
    1: "Grundkenntnisse",
    2: "Fortgeschritten",
    3: "Kompetent",
    4: "Erfahren",
    5: "Experte",
  };
  return labels[level] ?? "Unbekannt";
}

/**
 * Get level color for UI display
 */
export function getLevelColor(level: number): string {
  const colors: Record<number, string> = {
    0: "#6b7280", // gray
    1: "#3b82f6", // blue
    2: "#22c55e", // green
    3: "#eab308", // yellow
    4: "#f97316", // orange
    5: "#ef4444", // red (expert)
  };
  return colors[level] ?? "#6b7280";
}
