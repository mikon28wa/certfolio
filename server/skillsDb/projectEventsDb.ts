import { eq, sql } from "drizzle-orm";
import { projectEvents, projectSkillLinks, projectMedia, InsertProjectEvent } from "../../drizzle/schema";
import { getDb } from "../db";

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
  await db.delete(projectSkillLinks).where(eq(projectSkillLinks.projectId, projectId));
  await db.delete(projectMedia).where(eq(projectMedia.projectId, projectId));
  await db.delete(projectEvents).where(eq(projectEvents.id, projectId));
}
