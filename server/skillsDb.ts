import { eq, and, sql } from "drizzle-orm";
import { 
  courseLibrary, 
  skillMappings, 
  userSkills,
  InsertCourseLibrary,
  InsertSkillMapping,
  InsertUserSkill,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Course Library Operations
 */

export async function getCourseByUuid(courseUuid: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(courseLibrary)
    .where(eq(courseLibrary.courseUuid, courseUuid))
    .limit(1);
  
  return result[0];
}

export async function createCourse(course: InsertCourseLibrary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(courseLibrary).values(course);
  // Return the created course by querying it back
  const created = await getCourseByUuid(course.courseUuid);
  return created!;
}

export async function incrementCourseUsage(courseUuid: string) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(courseLibrary)
    .set({ usageCount: sql`${courseLibrary.usageCount} + 1` })
    .where(eq(courseLibrary.courseUuid, courseUuid));
}

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(courseLibrary).orderBy(sql`${courseLibrary.usageCount} DESC`);
}

/**
 * Skill Mappings Operations
 */

export async function getSkillMappingsByCourseLibraryId(courseLibraryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(skillMappings)
    .where(eq(skillMappings.courseLibraryId, courseLibraryId));
}

export async function getSkillMappingsByCertificateId(certificateId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(skillMappings)
    .where(eq(skillMappings.certificateId, certificateId));
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

/**
 * User Skills Operations
 */

export async function getUserSkills(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(userSkills)
    .where(eq(userSkills.userId, userId))
    .orderBy(sql`${userSkills.totalPoints} DESC`);
}

export async function getUserSkillByName(userId: number, skillName: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(userSkills)
    .where(and(
      eq(userSkills.userId, userId),
      eq(userSkills.skillName, skillName)
    ))
    .limit(1);
  
  return result[0];
}

export async function upsertUserSkill(skill: InsertUserSkill & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserSkillByName(skill.userId, skill.skillName);
  
  if (existing) {
    await db
      .update(userSkills)
      .set({
        totalPoints: skill.totalPoints,
        level: skill.level,
        progressPercentage: skill.progressPercentage,
        certificateCount: skill.certificateCount,
        skillCategory: skill.skillCategory,
      })
      .where(eq(userSkills.id, existing.id));
    
    return { ...existing, ...skill };
  } else {
    await db.insert(userSkills).values(skill);
    return skill;
  }
}

/**
 * Skill Aggregation Engine
 * Recalculates all user skills based on their certificates and skill mappings
 */

export async function recalculateUserSkills(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get all skill mappings for user's certificates using proper Drizzle joins
  const { certificates } = await import("../drizzle/schema");
  
  const mappings = await db
    .select({
      skillName: skillMappings.skillName,
      skillCategory: skillMappings.skillCategory,
      weight: skillMappings.weight,
      certificateId: skillMappings.certificateId,
    })
    .from(skillMappings)
    .innerJoin(certificates, eq(skillMappings.certificateId, certificates.id))
    .where(eq(certificates.userId, userId));
  
  // Aggregate skills
  const skillAggregates = new Map<string, {
    skillName: string;
    skillCategory: string | null;
    totalPoints: number;
    certificateIds: Set<number>;
  }>();
  
  for (const mapping of mappings) {
    if (!mapping.certificateId) continue;
    
    const existing = skillAggregates.get(mapping.skillName);
    
    if (existing) {
      existing.totalPoints += mapping.weight;
      existing.certificateIds.add(mapping.certificateId);
    } else {
      skillAggregates.set(mapping.skillName, {
        skillName: mapping.skillName,
        skillCategory: mapping.skillCategory,
        totalPoints: mapping.weight,
        certificateIds: new Set([mapping.certificateId]),
      });
    }
  }
  
  // Calculate levels and progress
  // Level calculation: Every 100 points = 1 level
  // Progress: Percentage towards next level
  const userSkillsData: InsertUserSkill[] = [];
  
  for (const [skillName, aggregate] of Array.from(skillAggregates.entries())) {
    const level = Math.floor(aggregate.totalPoints / 100) + 1;
    const progressPercentage = aggregate.totalPoints % 100;
    
    userSkillsData.push({
      userId,
      skillName: aggregate.skillName,
      skillCategory: aggregate.skillCategory || null,
      totalPoints: aggregate.totalPoints,
      level,
      progressPercentage,
      certificateCount: aggregate.certificateIds.size,
    });
  }
  
  // Delete old user skills
  await db.delete(userSkills).where(eq(userSkills.userId, userId));
  
  // Insert new aggregated skills
  if (userSkillsData.length > 0) {
    await db.insert(userSkills).values(userSkillsData);
  }
  
  return userSkillsData;
}

/**
 * Get skill details with contributing certificates
 */
export async function getSkillDetails(userId: number, skillName: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Get user skill
  const userSkill = await getUserSkillByName(userId, skillName);
  if (!userSkill) return null;
  
  // Get contributing certificates using proper Drizzle joins
  const { certificates } = await import("../drizzle/schema");
  
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
    .where(and(
      eq(certificates.userId, userId),
      eq(skillMappings.skillName, skillName)
    ))
    .orderBy(sql`${skillMappings.weight} DESC`);
  
  return {
    ...userSkill,
    contributingCertificates: contributingCerts,
  };
}
