import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as skillsDb from "../skillsDb";

export const collectionsRouter = router({
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

  getSkills: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input }) => {
      return skillsDb.getCollectionSkills(input.collectionId);
    }),
});
