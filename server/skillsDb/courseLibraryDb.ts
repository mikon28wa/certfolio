import { eq, sql } from "drizzle-orm";
import { courseLibrary, InsertCourseLibrary } from "../../drizzle/schema";
import { getDb } from "../db";

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
