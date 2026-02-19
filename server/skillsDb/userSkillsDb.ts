import { eq, and, sql } from "drizzle-orm";
import { userSkills, InsertUserSkill } from "../../drizzle/schema";
import { getDb } from "../db";

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
