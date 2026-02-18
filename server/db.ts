import { eq, desc, and, like, or, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  certificates, 
  InsertCertificate, 
  Certificate,
  collections,
  InsertCollection,
  Collection,
  collectionCertificates,
  InsertCollectionCertificate
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "bio", "profileSlug"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByProfileSlug(slug: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.profileSlug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; profileSlug?: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set(data).where(eq(users.id, userId));
}

// Certificate operations
export async function createCertificate(cert: InsertCertificate): Promise<Certificate> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(certificates).values(cert);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(certificates).where(eq(certificates.id, insertedId)).limit(1);
  if (inserted.length === 0) {
    throw new Error("Failed to retrieve inserted certificate");
  }
  
  return inserted[0];
}

export async function getCertificatesByUserId(userId: number): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(certificates).where(eq(certificates.userId, userId)).orderBy(desc(certificates.createdAt));
}

export async function getPublicCertificatesByUserId(userId: number): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(certificates).where(
    and(
      eq(certificates.userId, userId),
      eq(certificates.isPublic, true)
    )
  ).orderBy(desc(certificates.createdAt));
}

export async function getCertificateById(id: number): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCertificate(id: number, data: Partial<InsertCertificate>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(certificates).set(data).where(eq(certificates.id, id));
}

export async function deleteCertificate(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(certificates).where(eq(certificates.id, id));
}

export async function searchCertificates(userId: number, query: string): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const searchPattern = `%${query}%`;
  
  return db.select().from(certificates).where(
    and(
      eq(certificates.userId, userId),
      or(
        like(certificates.title, searchPattern),
        like(certificates.issuer, searchPattern),
        like(certificates.description, searchPattern)
      )
    )
  ).orderBy(desc(certificates.createdAt));
}

// Collection operations
export async function createCollection(coll: InsertCollection): Promise<Collection> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(collections).values(coll);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(collections).where(eq(collections.id, insertedId)).limit(1);
  if (inserted.length === 0) {
    throw new Error("Failed to retrieve inserted collection");
  }
  
  return inserted[0];
}

export async function getCollectionsByUserId(userId: number): Promise<Collection[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(collections).where(eq(collections.userId, userId)).orderBy(desc(collections.createdAt));
}

export async function getPublicCollectionsByUserId(userId: number): Promise<Collection[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(collections).where(
    and(
      eq(collections.userId, userId),
      eq(collections.isPublic, true)
    )
  ).orderBy(desc(collections.createdAt));
}

export async function getCollectionById(id: number): Promise<Collection | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCollectionBySlug(userId: number, slug: string): Promise<Collection | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(collections).where(
    and(
      eq(collections.userId, userId),
      eq(collections.slug, slug)
    )
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCollection(id: number, data: Partial<InsertCollection>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(collections).set(data).where(eq(collections.id, id));
}

export async function deleteCollection(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Delete all collection-certificate relationships first
  await db.delete(collectionCertificates).where(eq(collectionCertificates.collectionId, id));
  
  // Then delete the collection
  await db.delete(collections).where(eq(collections.id, id));
}

// Collection-Certificate relationship operations
export async function addCertificateToCollection(collectionId: number, certificateId: number, sortOrder: number = 0): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(collectionCertificates).values({
    collectionId,
    certificateId,
    sortOrder,
  });
}

export async function removeCertificateFromCollection(collectionId: number, certificateId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(collectionCertificates).where(
    and(
      eq(collectionCertificates.collectionId, collectionId),
      eq(collectionCertificates.certificateId, certificateId)
    )
  );
}

export async function getCertificatesByCollectionId(collectionId: number): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  // Get certificate IDs from collection_certificates
  const links = await db.select().from(collectionCertificates)
    .where(eq(collectionCertificates.collectionId, collectionId))
    .orderBy(collectionCertificates.sortOrder);
  
  if (links.length === 0) {
    return [];
  }
  
  const certIds = links.map(link => link.certificateId);
  
  // Get certificates
  const certs = await db.select().from(certificates)
    .where(inArray(certificates.id, certIds));
  
  // Sort by original order
  const certMap = new Map(certs.map(c => [c.id, c]));
  return certIds.map(id => certMap.get(id)).filter((c): c is Certificate => c !== undefined);
}
