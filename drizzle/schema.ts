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
