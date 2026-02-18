import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as skillsDb from "./skillsDb";
import { analyzeCertificatePDF, analyzeCertificateWithSkills } from "./llmService";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),
    
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        profileSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if profileSlug is already taken by another user
        if (input.profileSlug) {
          const existing = await db.getUserByProfileSlug(input.profileSlug);
          if (existing && existing.id !== ctx.user.id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Dieser Profilname ist bereits vergeben",
            });
          }
        }
        
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
      
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const user = await db.getUserByProfileSlug(input.slug);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profil nicht gefunden",
          });
        }
        return {
          id: user.id,
          name: user.name,
          bio: user.bio,
          profileSlug: user.profileSlug,
        };
      }),
  }),

  certificates: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getCertificatesByUserId(ctx.user.id);
    }),
    
    listPublic: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getPublicCertificatesByUserId(input.userId);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const cert = await db.getCertificateById(input.id);
        if (!cert) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Zertifikat nicht gefunden",
          });
        }
        
        // Only owner can view private certificates
        if (cert.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        return cert;
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(500),
        issuer: z.string().min(1).max(300),
        issueDate: z.date().optional(),
        description: z.string().optional(),
        skills: z.string().optional(), // JSON string
        level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
        category: z.enum(["it", "marketing", "management", "healthcare", "other"]).optional(),
        priority: z.enum(["normal", "important"]).default("normal"),
        isVerified: z.boolean().default(false),
        verificationUrl: z.string().optional(),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
        fileName: z.string().optional(),
        mimeType: z.string().optional(),
        externalUrl: z.string().optional(),
        isPublic: z.boolean().default(true),
        tags: z.string().optional(), // JSON string
      }))
      .mutation(async ({ ctx, input }) => {
        const cert = await db.createCertificate({
          ...input,
          userId: ctx.user.id,
        });
        return cert;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(500).optional(),
        issuer: z.string().min(1).max(300).optional(),
        issueDate: z.date().optional(),
        description: z.string().optional(),
        skills: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
        category: z.enum(["it", "marketing", "management", "healthcare", "other"]).optional(),
        priority: z.enum(["normal", "important"]).optional(),
        isVerified: z.boolean().optional(),
        verificationUrl: z.string().optional(),
        externalUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        
        const cert = await db.getCertificateById(id);
        if (!cert) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Zertifikat nicht gefunden",
          });
        }
        
        if (cert.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        await db.updateCertificate(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const cert = await db.getCertificateById(input.id);
        if (!cert) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Zertifikat nicht gefunden",
          });
        }
        
        if (cert.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        await db.deleteCertificate(input.id);
        return { success: true };
      }),
    
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        if (!input.query.trim()) {
          return db.getCertificatesByUserId(ctx.user.id);
        }
        return db.searchCertificates(ctx.user.id, input.query);
      }),
    
    analyzePDF: protectedProcedure
      .input(z.object({
        fileUrl: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const result = await analyzeCertificatePDF(input.fileUrl, input.mimeType);
        return result;
      }),
    
    analyzeWithSkills: protectedProcedure
      .input(z.object({
        fileUrl: z.string().url(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const result = await analyzeCertificateWithSkills(input.fileUrl, input.mimeType);
        return result;
      }),
    
    uploadFile: protectedProcedure
      .input(z.object({
        fileData: z.string(), // base64 encoded file
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64
        const base64Data = input.fileData.split(',')[1] || input.fileData;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `${ctx.user.id}-certificates/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { url, key: fileKey };
      }),
  }),

  skills: router({    getUserSkills: protectedProcedure.query(async ({ ctx }) => {
      return await skillsDb.getUserSkills(ctx.user.id);
    }),
    
    getSkillDetails: protectedProcedure
      .input(z.object({
        skillName: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await skillsDb.getSkillDetails(ctx.user.id, input.skillName);
      }),
    
    recalculate: protectedProcedure.mutation(async ({ ctx }) => {
      const skills = await skillsDb.recalculateUserSkills(ctx.user.id);
      return { success: true, skillCount: skills.length };
    }),
  }),

  courseLibrary: router({
    getAll: publicProcedure.query(async () => {
      return await skillsDb.getAllCourses();
    }),
    
    getByUuid: publicProcedure
      .input(z.object({
        courseUuid: z.string(),
      }))
      .query(async ({ input }) => {
        return await skillsDb.getCourseByUuid(input.courseUuid);
      }),
    
    create: protectedProcedure
      .input(z.object({
        courseUuid: z.string(),
        title: z.string(),
        issuer: z.string(),
        description: z.string().optional(),
        duration: z.number().optional(),
        credits: z.number().optional(),
        level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
        category: z.enum(["it", "marketing", "management", "healthcare", "other"]).optional(),
        providerUrl: z.string().optional(),
        providerName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if course already exists
        const existing = await skillsDb.getCourseByUuid(input.courseUuid);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Dieser Kurs existiert bereits in der Bibliothek",
          });
        }
        
        const course = await skillsDb.createCourse({
          ...input,
          analyzedBy: ctx.user.id,
        });
        
        return course;
      }),
  }),

  skillMappings: router({
    getByCertificateId: protectedProcedure
      .input(z.object({
        certificateId: z.number(),
      }))
      .query(async ({ input }) => {
        return await skillsDb.getSkillMappingsByCertificateId(input.certificateId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        certificateId: z.number(),
        skillName: z.string(),
        skillCategory: z.string().optional(),
        weight: z.number().min(0).max(100),
        source: z.enum(["llm", "manual", "library"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const mapping = await skillsDb.createSkillMapping(input);
        return mapping;
      }),
    
    createBulk: protectedProcedure
      .input(z.object({
        certificateId: z.number(),
        mappings: z.array(z.object({
          skillName: z.string(),
          skillCategory: z.string().optional(),
          weight: z.number().min(0).max(100),
          source: z.enum(["llm", "manual", "library"]).optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify certificate belongs to user
        const cert = await db.getCertificateById(input.certificateId);
        if (!cert || cert.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Zertifikat nicht gefunden",
          });
        }
        
        const mappingsWithCertId = input.mappings.map(m => ({
          ...m,
          certificateId: input.certificateId,
        }));
        
        await skillsDb.createSkillMappings(mappingsWithCertId);
        
        // Recalculate user skills
        await skillsDb.recalculateUserSkills(ctx.user.id);
        
        return { success: true, count: mappingsWithCertId.length };
      }),
  }),

  collections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getCollectionsByUserId(ctx.user.id);
    }),
    
    listPublic: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getPublicCollectionsByUserId(input.userId);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const collection = await db.getCollectionById(input.id);
        if (!collection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Collection nicht gefunden",
          });
        }
        
        if (collection.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        return collection;
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ 
        userId: z.number(),
        slug: z.string() 
      }))
      .query(async ({ input }) => {
        const collection = await db.getCollectionBySlug(input.userId, input.slug);
        if (!collection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Collection nicht gefunden",
          });
        }
        
        if (!collection.isPublic) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Diese Collection ist nicht öffentlich",
          });
        }
        
        return collection;
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if slug is already taken by this user
        const existing = await db.getCollectionBySlug(ctx.user.id, input.slug);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Dieser Slug ist bereits vergeben",
          });
        }
        
        const collection = await db.createCollection({
          ...input,
          userId: ctx.user.id,
        });
        return collection;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        slug: z.string().min(1).max(150).regex(/^[a-z0-9-]+$/).optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        
        const collection = await db.getCollectionById(id);
        if (!collection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Collection nicht gefunden",
          });
        }
        
        if (collection.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        // Check if new slug is already taken
        if (data.slug && data.slug !== collection.slug) {
          const existing = await db.getCollectionBySlug(ctx.user.id, data.slug);
          if (existing) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Dieser Slug ist bereits vergeben",
            });
          }
        }
        
        await db.updateCollection(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const collection = await db.getCollectionById(input.id);
        if (!collection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Collection nicht gefunden",
          });
        }
        
        if (collection.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        await db.deleteCollection(input.id);
        return { success: true };
      }),
    
    getCertificates: protectedProcedure
      .input(z.object({ collectionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const collection = await db.getCollectionById(input.collectionId);
        if (!collection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Collection nicht gefunden",
          });
        }
        
        if (collection.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        return db.getCertificatesByCollectionId(input.collectionId);
      }),
    
    addCertificate: protectedProcedure
      .input(z.object({
        collectionId: z.number(),
        certificateId: z.number(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const collection = await db.getCollectionById(input.collectionId);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        const certificate = await db.getCertificateById(input.certificateId);
        if (!certificate || certificate.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        await db.addCertificateToCollection(input.collectionId, input.certificateId, input.sortOrder);
        return { success: true };
      }),
    
    removeCertificate: protectedProcedure
      .input(z.object({
        collectionId: z.number(),
        certificateId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const collection = await db.getCollectionById(input.collectionId);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Keine Berechtigung",
          });
        }
        
        await db.removeCertificateFromCollection(input.collectionId, input.certificateId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
