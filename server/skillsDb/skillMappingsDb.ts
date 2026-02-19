import { eq } from "drizzle-orm";
import { skillMappings, InsertSkillMapping } from "../../drizzle/schema";
import { getDb } from "../db";

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
