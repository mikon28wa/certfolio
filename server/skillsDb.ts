import { eq, and, sql } from "drizzle-orm";
import { 
  courseLibrary, 
  skillMappings, 
  userSkills,
  projectEvents,
  projectSkillLinks,
  projectMedia,
  certificates,
  InsertCourseLibrary,
  InsertSkillMapping,
  InsertUserSkill,
  InsertProjectEvent,
  InsertProjectSkillLink,
  InsertProjectMedia,
} from "../drizzle/schema";
import { getDb } from "./db";
import { computeSkillScore, SkillEvent } from "./skillScoreEngine";

// ==================== Course Library ====================

export async function getCourseByUuid(courseUuid: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courseLibrary).where(eq(courseLibrary.courseUuid, courseUuid)).limit(1);
  return result[0];
}

export async function createCourse(course: InsertCourseLibrary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(courseLibrary).values(course);
  const created = await getCourseByUuid(course.courseUuid);
  return created!;
}

export async function incrementCourseUsage(courseUuid: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(courseLibrary).set({ usageCount: sql`${courseLibrary.usageCount} + 1` }).where(eq(courseLibrary.courseUuid, courseUuid));
}

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courseLibrary).orderBy(sql`${courseLibrary.usageCount} DESC`);
}

// ==================== Skill Mappings ====================

export async function getSkillMappingsByCourseLibraryId(courseLibraryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skillMappings).where(eq(skillMappings.courseLibraryId, courseLibraryId));
}

export async function getSkillMappingsByCertificateId(certificateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skillMappings).where(eq(skillMappings.certificateId, certificateId));
}

export async function createSkillMapping(mapping: InsertSkillMapping) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skillMappings).values(mapping);
  return mapping;
}

export async function createSkillMappings(mappings: InsertSkillMapping[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (mappings.length === 0) return [];
  await db.insert(skillMappings).values(mappings);
  return mappings;
}

export async function deleteSkillMappingsByCertificateId(certificateId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(skillMappings).where(eq(skillMappings.certificateId, certificateId));
}

// ==================== Project Events ====================

export async function createProjectEvent(project: InsertProjectEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projectEvents).values(project);
  const insertId = result[0].insertId;
  return { id: insertId, ...project };
}

export async function getProjectEventsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projectEvents).where(eq(projectEvents.userId, userId)).orderBy(sql`${projectEvents.dateCompleted} DESC`);
}

export async function getProjectEventById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projectEvents).where(eq(projectEvents.id, projectId)).limit(1);
  return result[0];
}

export async function updateProjectEvent(projectId: number, data: Partial<InsertProjectEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projectEvents).set(data).where(eq(projectEvents.id, projectId));
}

export async function deleteProjectEvent(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related skill links and media first
  await db.delete(projectSkillLinks).where(eq(projectSkillLinks.projectId, projectId));
  await db.delete(projectMedia).where(eq(projectMedia.projectId, projectId));
  await db.delete(projectEvents).where(eq(projectEvents.id, projectId));
}

// ==================== Project Skill Links ====================

export async function createProjectSkillLinks(links: InsertProjectSkillLink[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (links.length === 0) return [];
  await db.insert(projectSkillLinks).values(links);
  return links;
}

export async function getProjectSkillLinks(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projectSkillLinks).where(eq(projectSkillLinks.projectId, projectId));
}

export async function deleteProjectSkillLinks(projectId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projectSkillLinks).where(eq(projectSkillLinks.projectId, projectId));
}

// ==================== Project Media ====================

export async function addProjectMedia(media: InsertProjectMedia) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projectMedia).values(media);
  return { id: result[0].insertId, ...media };
}

export async function getProjectMedia(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projectMedia).where(eq(projectMedia.projectId, projectId)).orderBy(sql`${projectMedia.sortOrder} ASC`);
}

export async function deleteProjectMedia(mediaId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projectMedia).where(eq(projectMedia.id, mediaId));
}

// ==================== User Skills ====================

export async function getUserSkills(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userSkills).where(eq(userSkills.userId, userId)).orderBy(sql`CAST(${userSkills.score} AS DECIMAL(10,2)) DESC`);
}

export async function getUserSkillByName(userId: number, skillName: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userSkills).where(and(eq(userSkills.userId, userId), eq(userSkills.skillName, skillName))).limit(1);
  return result[0];
}

export async function upsertUserSkill(skill: InsertUserSkill & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserSkillByName(skill.userId, skill.skillName);
  if (existing) {
    await db.update(userSkills).set({
      totalPoints: skill.totalPoints,
      score: skill.score,
      level: skill.level,
      progressPercentage: skill.progressPercentage,
      certificateCount: skill.certificateCount,
      projectCount: skill.projectCount,
      skillCategory: skill.skillCategory,
      lastEventDate: skill.lastEventDate,
    }).where(eq(userSkills.id, existing.id));
    return { ...existing, ...skill };
  } else {
    await db.insert(userSkills).values(skill);
    return skill;
  }
}

// ==================== Skill Aggregation Engine (v2 with Decay) ====================

/**
 * Recalculates all user skills using the new scoring engine with decay functions.
 * Considers both certificates and project events.
 */
export async function recalculateUserSkills(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 1. Get all certificate skill mappings for this user
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

  // 2. Get all project skill links for this user
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

  // 3. Group events by skill name
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

  // 4. Compute scores using the engine
  const now = new Date();
  const userSkillsData: InsertUserSkill[] = [];

  for (const [skillName, { events, category }] of Array.from(skillEventsMap.entries())) {
    const result = computeSkillScore(events, now);
    userSkillsData.push({
      userId,
      skillName,
      skillCategory: category || null,
      totalPoints: Math.round(result.score * 100), // Store as integer (score * 100)
      score: result.score.toString(),
      level: result.level,
      progressPercentage: result.progressPercentage,
      certificateCount: result.certificateCount,
      projectCount: result.projectCount,
      lastEventDate: result.lastEventDate,
    });
  }

  // 5. Replace old user skills
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

  // Get contributing certificates
  const contributingCerts = await db
    .select({
      id: certificates.id,
      title: certificates.title,
      issuer: certificates.issuer,
      issueDate: certificates.issueDate,
      weight: skillMappings.weight,
      source: skillMappings.source,
    })
    .from(certificates)
    .innerJoin(skillMappings, eq(skillMappings.certificateId, certificates.id))
    .where(and(eq(certificates.userId, userId), eq(skillMappings.skillName, skillName)))
    .orderBy(sql`${skillMappings.weight} DESC`);

  // Get contributing projects
  const contributingProjects = await db
    .select({
      id: projectEvents.id,
      title: projectEvents.title,
      role: projectEvents.role,
      dateCompleted: projectEvents.dateCompleted,
      complexity: projectEvents.complexity,
      responsibility: projectEvents.responsibility,
      impact: projectEvents.impact,
      weight: projectSkillLinks.weight,
    })
    .from(projectEvents)
    .innerJoin(projectSkillLinks, eq(projectSkillLinks.projectId, projectEvents.id))
    .where(and(eq(projectEvents.userId, userId), eq(projectSkillLinks.skillName, skillName)))
    .orderBy(sql`${projectSkillLinks.weight} DESC`);

  return {
    ...userSkill,
    contributingCertificates: contributingCerts,
    contributingProjects: contributingProjects,
  };
}

// ==================== Collection-Specific Skill Calculation ====================

/**
 * Calculate skill scores for a specific collection.
 * Only considers certificates and projects that are part of the collection.
 */
export async function getCollectionSkills(collectionId: number) {
  const db = await getDb();
  if (!db) return [];

  // 1. Get certificate IDs in this collection
  const { collectionCertificates } = await import("../drizzle/schema");
  const collLinks = await db.select()
    .from(collectionCertificates)
    .where(eq(collectionCertificates.collectionId, collectionId));

  const certIds = collLinks.map(l => l.certificateId);

  if (certIds.length === 0) return [];

  // 2. Get skill mappings for these certificates
  const { inArray } = await import("drizzle-orm");
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
    .where(inArray(skillMappings.certificateId, certIds));

  // 3. Group events by skill name and compute scores
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

  // 4. Compute scores using the engine
  const now = new Date();
  const results: Array<{
    skillName: string;
    skillCategory: string | null;
    score: number;
    level: number;
    progressPercentage: number;
    certificateCount: number;
    projectCount: number;
  }> = [];

  for (const [skillName, { events, category }] of Array.from(skillEventsMap.entries())) {
    const result = computeSkillScore(events, now);
    results.push({
      skillName,
      skillCategory: category,
      score: result.score,
      level: result.level,
      progressPercentage: result.progressPercentage,
      certificateCount: result.certificateCount,
      projectCount: result.projectCount,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
