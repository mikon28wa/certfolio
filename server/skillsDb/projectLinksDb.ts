import { eq, sql } from "drizzle-orm";
import { projectSkillLinks, projectMedia, InsertProjectSkillLink, InsertProjectMedia } from "../../drizzle/schema";
import { getDb } from "../db";

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
