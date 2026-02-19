import { eq, and, sql } from "drizzle-orm";
import {
  skillMappings, certificates, projectSkillLinks, projectEvents,
  userSkills, InsertUserSkill,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { computeSkillScore, SkillEvent } from "../skillScoreEngine";
import { getUserSkills, getUserSkillByName } from "./userSkillsDb";

/**
 * Recalculates all user skills using the scoring engine with decay functions.
 * Considers both certificates and project events.
 */
export async function recalculateUserSkills(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const certMappings = await db
    .select({
      skillName: skillMappings.skillName,
      skillCategory: skillMappings.skillCategory,
      weight: skillMappings.weight,
      certificateId: skillMappings.certificateId,
      issueDate: certificates.issueDate,
    })
    .from(skillMappings)
    .innerJoin(certificates, eq(skillMappings.certificateId, certificates.id))
    .where(eq(certificates.userId, userId));

  const projLinks = await db
    .select({
      skillName: projectSkillLinks.skillName,
      skillCategory: projectSkillLinks.skillCategory,
      weight: projectSkillLinks.weight,
      projectId: projectSkillLinks.projectId,
      dateCompleted: projectEvents.dateCompleted,
      complexity: projectEvents.complexity,
      responsibility: projectEvents.responsibility,
      impact: projectEvents.impact,
    })
    .from(projectSkillLinks)
    .innerJoin(projectEvents, eq(projectSkillLinks.projectId, projectEvents.id))
    .where(eq(projectEvents.userId, userId));

  const skillEventsMap = new Map<string, { events: SkillEvent[]; category: string | null }>();

  for (const cm of certMappings) {
    const existing = skillEventsMap.get(cm.skillName) || { events: [], category: cm.skillCategory };
    existing.events.push({
      type: "certificate",
      dateCompleted: cm.issueDate ? new Date(cm.issueDate) : new Date(),
      weight: cm.weight,
    });
    skillEventsMap.set(cm.skillName, existing);
  }

  for (const pl of projLinks) {
    const existing = skillEventsMap.get(pl.skillName) || { events: [], category: pl.skillCategory };
    existing.events.push({
      type: "project",
      dateCompleted: pl.dateCompleted ? new Date(pl.dateCompleted) : new Date(),
      weight: pl.weight,
      complexity: pl.complexity,
      responsibility: pl.responsibility,
      impact: pl.impact,
    });
    skillEventsMap.set(pl.skillName, existing);
  }

  const now = new Date();
  const userSkillsData: InsertUserSkill[] = [];

  for (const [skillName, { events, category }] of Array.from(skillEventsMap.entries())) {
    const result = computeSkillScore(events, now);
    userSkillsData.push({
      userId, skillName,
      skillCategory: category || null,
      totalPoints: Math.round(result.score * 100),
      score: result.score.toString(),
      level: result.level,
      progressPercentage: result.progressPercentage,
      certificateCount: result.certificateCount,
      projectCount: result.projectCount,
      lastEventDate: result.lastEventDate,
    });
  }

  await db.delete(userSkills).where(eq(userSkills.userId, userId));
  if (userSkillsData.length > 0) {
    await db.insert(userSkills).values(userSkillsData);
  }

  return userSkillsData;
}

/**
 * Get skill details with contributing certificates AND projects
 */
export async function getSkillDetails(userId: number, skillName: string) {
  const db = await getDb();
  if (!db) return null;

  const userSkill = await getUserSkillByName(userId, skillName);
  if (!userSkill) return null;

  const contributingCerts = await db
    .select({
      id: certificates.id, title: certificates.title,
      issuer: certificates.issuer, issueDate: certificates.issueDate,
      weight: skillMappings.weight, source: skillMappings.source,
    })
    .from(certificates)
    .innerJoin(skillMappings, eq(skillMappings.certificateId, certificates.id))
    .where(and(eq(certificates.userId, userId), eq(skillMappings.skillName, skillName)))
    .orderBy(sql`${skillMappings.weight} DESC`);

  const contributingProjects = await db
    .select({
      id: projectEvents.id, title: projectEvents.title,
      role: projectEvents.role, dateCompleted: projectEvents.dateCompleted,
      complexity: projectEvents.complexity, responsibility: projectEvents.responsibility,
      impact: projectEvents.impact, weight: projectSkillLinks.weight,
    })
    .from(projectEvents)
    .innerJoin(projectSkillLinks, eq(projectSkillLinks.projectId, projectEvents.id))
    .where(and(eq(projectEvents.userId, userId), eq(projectSkillLinks.skillName, skillName)))
    .orderBy(sql`${projectSkillLinks.weight} DESC`);

  return { ...userSkill, contributingCertificates: contributingCerts, contributingProjects: contributingProjects };
}

/**
 * Calculate skill scores for a specific collection.
 */
export async function getCollectionSkills(collectionId: number) {
  const db = await getDb();
  if (!db) return [];

  const { collectionCertificates } = await import("../../drizzle/schema");
  const collLinks = await db.select().from(collectionCertificates).where(eq(collectionCertificates.collectionId, collectionId));
  const certIds = collLinks.map(l => l.certificateId);
  if (certIds.length === 0) return [];

  const { inArray } = await import("drizzle-orm");
  const certMappings = await db
    .select({
      skillName: skillMappings.skillName, skillCategory: skillMappings.skillCategory,
      weight: skillMappings.weight, certificateId: skillMappings.certificateId,
      issueDate: certificates.issueDate,
    })
    .from(skillMappings)
    .innerJoin(certificates, eq(skillMappings.certificateId, certificates.id))
    .where(inArray(skillMappings.certificateId, certIds));

  const skillEventsMap = new Map<string, { events: SkillEvent[]; category: string | null }>();
  for (const cm of certMappings) {
    const existing = skillEventsMap.get(cm.skillName) || { events: [], category: cm.skillCategory };
    existing.events.push({
      type: "certificate",
      dateCompleted: cm.issueDate ? new Date(cm.issueDate) : new Date(),
      weight: cm.weight,
    });
    skillEventsMap.set(cm.skillName, existing);
  }

  const now = new Date();
  const results: Array<{
    skillName: string; skillCategory: string | null;
    score: number; level: number; progressPercentage: number;
    certificateCount: number; projectCount: number;
  }> = [];

  for (const [skillName, { events, category }] of Array.from(skillEventsMap.entries())) {
    const result = computeSkillScore(events, now);
    results.push({
      skillName, skillCategory: category,
      score: result.score, level: result.level,
      progressPercentage: result.progressPercentage,
      certificateCount: result.certificateCount, projectCount: result.projectCount,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

// ==================== Skill Timeline & History ====================

export async function captureSkillSnapshot(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const skills = await getUserSkills(userId);
  const snapshotDate = new Date();
  const { skillHistory } = await import("../../drizzle/schema");

  const snapshots = skills.map(skill => ({
    userId, skillName: skill.skillName,
    skillCategory: skill.skillCategory || null,
    level: skill.level,
    totalPoints: skill.totalPoints.toString(),
    certificateCount: skill.certificateCount,
    projectCount: skill.projectCount,
    snapshotDate,
  }));

  if (snapshots.length > 0) {
    await db.insert(skillHistory).values(snapshots);
  }
  return snapshots;
}

export async function getSkillTimeline(userId: number, skillName: string, startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];

  const { skillHistory } = await import("../../drizzle/schema");
  const conditions: any[] = [eq(skillHistory.userId, userId), eq(skillHistory.skillName, skillName)];
  if (startDate) conditions.push(sql`${skillHistory.snapshotDate} >= ${startDate}`);
  if (endDate) conditions.push(sql`${skillHistory.snapshotDate} <= ${endDate}`);

  const history = await db.select().from(skillHistory).where(and(...conditions)).orderBy(skillHistory.snapshotDate);
  return history.map(h => ({
    date: h.snapshotDate, level: h.level,
    totalPoints: parseFloat(h.totalPoints),
    certificateCount: h.certificateCount, projectCount: h.projectCount,
  }));
}

export async function compareSkills(userId: number, skillNames: string[]) {
  const skills = await getUserSkills(userId);
  const filtered = skills.filter(s => skillNames.includes(s.skillName));
  return filtered.map(s => ({
    skillName: s.skillName, skillCategory: s.skillCategory,
    level: s.level, totalPoints: s.totalPoints,
    certificateCount: s.certificateCount, projectCount: s.projectCount,
    lastEventDate: s.lastEventDate,
  }));
}

export async function getSkillRecommendations(userId: number) {
  const skills = await getUserSkills(userId);

  const recommendations: Array<{
    type: "level_up" | "refresh" | "new_skill";
    skillName: string; currentLevel: number;
    reason: string; suggestedAction: string;
  }> = [];

  const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;

  for (const skill of skills) {
    if (skill.level === 2) {
      recommendations.push({
        type: "level_up", skillName: skill.skillName, currentLevel: skill.level,
        reason: "Du bist auf einem guten Weg. Ein weiteres Projekt oder Zertifikat bringt dich auf Level 3.",
        suggestedAction: "Projekt mit " + skill.skillName + " starten oder vertiefenden Kurs belegen",
      });
    }
    if (skill.lastEventDate && new Date(skill.lastEventDate).getTime() < sixMonthsAgo) {
      recommendations.push({
        type: "refresh", skillName: skill.skillName, currentLevel: skill.level,
        reason: "Keine Aktivität in den letzten 6 Monaten. Deine Skills könnten veraltet sein.",
        suggestedAction: "Auffrischungskurs oder kleines Projekt zur Reaktivierung",
      });
    }
  }

  return recommendations.slice(0, 5);
}
