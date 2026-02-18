import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
  // Profile customization fields
  bio: text("bio"),
  profileSlug: varchar("profileSlug", { length: 100 }).unique(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Certificates table storing all user certifications and credentials
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Certificate metadata
  title: varchar("title", { length: 500 }).notNull(),
  issuer: varchar("issuer", { length: 300 }).notNull(),
  issueDate: timestamp("issueDate"),
  description: text("description"),
  
  // Extended metadata
  skills: text("skills"), // JSON array stored as text
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced", "expert"]),
  category: mysqlEnum("category", ["it", "marketing", "management", "healthcare", "other"]),
  priority: mysqlEnum("priority", ["normal", "important"]).default("normal").notNull(),
  
  // Course metadata for skill mapping
  courseUuid: varchar("courseUuid", { length: 200 }), // Unique identifier from provider (Coursera ID, edX ID, etc.)
  courseDuration: int("courseDuration"), // Duration in hours
  courseCredits: int("courseCredits"), // Credits/ECTS if applicable
  completionGrade: varchar("completionGrade", { length: 50 }), // Grade/Score if applicable
  learningHours: int("learningHours"), // Estimated learning hours
  
  // Verification
  isVerified: boolean("isVerified").default(false).notNull(),
  verificationUrl: text("verificationUrl"), // Original URL from provider (Coursera, edX, etc.)
  
  // File storage references (for uploaded files)
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  fileName: varchar("fileName", { length: 300 }),
  mimeType: varchar("mimeType", { length: 100 }),
  
  // External link (alternative to file upload)
  externalUrl: text("externalUrl"),
  
  // Visibility and organization
  isPublic: boolean("isPublic").default(true).notNull(),
  tags: text("tags"), // JSON array stored as text
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Collections/Sets for grouping certificates
 */
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 150 }).notNull(), // URL-friendly identifier
  
  // Visibility
  isPublic: boolean("isPublic").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

/**
 * Many-to-many relationship between collections and certificates
 */
export const collectionCertificates = mysqlTable("collection_certificates", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collectionId").notNull(),
  certificateId: int("certificateId").notNull(),
  
  // Order within collection
  sortOrder: int("sortOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollectionCertificate = typeof collectionCertificates.$inferSelect;
export type InsertCollectionCertificate = typeof collectionCertificates.$inferInsert;

/**
 * Course Library - Master database of analyzed courses
 * Stores courses that have been analyzed once and can be reused
 */
export const courseLibrary = mysqlTable("course_library", {
  id: int("id").autoincrement().primaryKey(),
  
  // Course identification
  courseUuid: varchar("courseUuid", { length: 200 }).notNull().unique(), // Unique identifier from provider
  title: varchar("title", { length: 500 }).notNull(),
  issuer: varchar("issuer", { length: 300 }).notNull(),
  
  // Course metadata
  description: text("description"),
  duration: int("duration"), // Duration in hours
  credits: int("credits"), // Credits/ECTS
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced", "expert"]),
  category: mysqlEnum("category", ["it", "marketing", "management", "healthcare", "other"]),
  
  // Provider information
  providerUrl: text("providerUrl"), // Link to course page
  providerName: varchar("providerName", { length: 200 }), // Coursera, edX, Udemy, etc.
  
  // Analysis metadata
  analyzedBy: int("analyzedBy"), // User ID who first uploaded/analyzed this course
  analysisDate: timestamp("analysisDate").defaultNow().notNull(),
  usageCount: int("usageCount").default(1).notNull(), // How many users have this certificate
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseLibrary = typeof courseLibrary.$inferSelect;
export type InsertCourseLibrary = typeof courseLibrary.$inferInsert;

/**
 * Skill Mappings - Links courses to skills with weights
 * Defines which skills a course teaches and to what extent
 */
export const skillMappings = mysqlTable("skill_mappings", {
  id: int("id").autoincrement().primaryKey(),
  
  // Reference to course (can be null for manual skill entries)
  courseLibraryId: int("courseLibraryId"),
  certificateId: int("certificateId"), // Direct link to certificate if not in library
  
  // Skill information
  skillName: varchar("skillName", { length: 200 }).notNull(), // e.g., "Workforce Management", "Finance"
  skillCategory: varchar("skillCategory", { length: 100 }), // e.g., "Technical", "Soft Skills", "Domain Knowledge"
  weight: int("weight").notNull(), // Percentage (0-100) or points
  
  // Source of mapping
  source: mysqlEnum("source", ["llm", "manual", "library"]).default("llm").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillMapping = typeof skillMappings.$inferSelect;
export type InsertSkillMapping = typeof skillMappings.$inferInsert;

/**
 * User Skills - Aggregated skill levels per user
 * Calculated from all certificates and their skill mappings
 */
export const userSkills = mysqlTable("user_skills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Skill information
  skillName: varchar("skillName", { length: 200 }).notNull(),
  skillCategory: varchar("skillCategory", { length: 100 }),
  
  // Aggregated values
  totalPoints: int("totalPoints").default(0).notNull(), // Sum of all weights from certificates
  level: int("level").default(1).notNull(), // Calculated level (1-10 or similar)
  progressPercentage: int("progressPercentage").default(0).notNull(), // 0-100%
  
  // Contributing certificates count
  certificateCount: int("certificateCount").default(0).notNull(),
  
  // Timestamps
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = typeof userSkills.$inferInsert;
