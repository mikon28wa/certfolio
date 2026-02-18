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
  
  // Aggregated values (new scoring system with decay)
  totalPoints: int("totalPoints").default(0).notNull(), // Raw sum of weights (legacy)
  score: varchar("score", { length: 20 }).default("0"), // Computed score with decay (stored as string for decimal)
  level: int("level").default(0).notNull(), // Calculated level 0-5
  progressPercentage: int("progressPercentage").default(0).notNull(), // 0-100% within current level
  
  // Contributing event counts
  certificateCount: int("certificateCount").default(0).notNull(),
  projectCount: int("projectCount").default(0).notNull(),
  
  // Last activity tracking
  lastEventDate: timestamp("lastEventDate"),
  
  // Timestamps
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = typeof userSkills.$inferInsert;

/**
 * Project Events - Practical projects that contribute to skills
 * Projects have slower decay than certificates and higher base weight
 */
export const projectEvents = mysqlTable("project_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Project metadata
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  
  // Role in project
  role: mysqlEnum("role", ["solo", "team", "lead"]).default("solo").notNull(),
  
  // Technologies/Tools used (JSON array stored as text)
  technologies: text("technologies"),
  
  // Project type classification
  projectType: varchar("projectType", { length: 100 }), // e.g., "Web-App MVP", "Landingpage", "Datenanalyse"
  
  // Result/Impact description
  impactDescription: text("impactDescription"), // e.g., "500 Nutzer, 20% Conversion"
  
  // Project timeline
  dateCompleted: timestamp("dateCompleted").notNull(),
  
  // Experience signals (1-3 scale as per spec)
  complexity: int("complexity").default(1).notNull(), // 1=Demo, 2=Prototype, 3=Production
  responsibility: int("responsibility").default(1).notNull(), // 1=Contribution, 2=Co-Lead, 3=Lead
  impact: int("impact").default(0).notNull(), // 0=None, 1=Internal, 2=External, 3=Measurable KPIs
  
  // Optional references
  projectUrl: text("projectUrl"), // Link to project (GitHub, portfolio, etc.)
  
  // File storage (main file/image)
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  fileName: varchar("fileName", { length: 300 }),
  mimeType: varchar("mimeType", { length: 100 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectEvent = typeof projectEvents.$inferSelect;
export type InsertProjectEvent = typeof projectEvents.$inferInsert;

/**
 * Project Skill Links - Many-to-many between projects and skills
 * Defines which skills a project demonstrates
 */
export const projectSkillLinks = mysqlTable("project_skill_links", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Skill information
  skillName: varchar("skillName", { length: 200 }).notNull(),
  skillCategory: varchar("skillCategory", { length: 100 }),
  weight: int("weight").default(100).notNull(), // Percentage contribution (0-100)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectSkillLink = typeof projectSkillLinks.$inferSelect;
export type InsertProjectSkillLink = typeof projectSkillLinks.$inferInsert;

/**
 * Project Media - Additional media files/links attached to projects
 */
export const projectMedia = mysqlTable("project_media", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Media type
  mediaType: mysqlEnum("mediaType", ["image", "pdf", "link"]).notNull(),
  
  // For uploaded files
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  fileName: varchar("fileName", { length: 300 }),
  mimeType: varchar("mimeType", { length: 100 }),
  
  // For external links
  externalUrl: text("externalUrl"),
  linkType: varchar("linkType", { length: 50 }), // github, figma, youtube, demo, other
  
  // Display
  caption: varchar("caption", { length: 300 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectMedia = typeof projectMedia.$inferSelect;
export type InsertProjectMedia = typeof projectMedia.$inferInsert;
