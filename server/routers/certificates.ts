import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as skillsDb from "../skillsDb";
import { analyzeCertificatePDF, analyzeCertificateWithSkills } from "../llmService";
import { storagePut, storageGet } from "../storage";

export const certificatesRouter = router({
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
      skills: z.string().optional(),
      level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
      category: z.enum(["it", "marketing", "management", "healthcare", "other"]).optional(),
      customCategory: z.string().max(100).optional(),
      priority: z.enum(["normal", "important"]).default("normal"),
      isVerified: z.boolean().default(false),
      verificationUrl: z.string().optional(),
      fileUrl: z.string().optional(),
      fileKey: z.string().optional(),
      fileName: z.string().optional(),
      mimeType: z.string().optional(),
      externalUrl: z.string().optional(),
      isPublic: z.boolean().default(true),
      tags: z.string().optional(),
      courseUuid: z.string().optional(),
      courseDuration: z.number().optional(),
      courseCredits: z.number().optional(),
      completionGrade: z.string().optional(),
      learningHours: z.number().optional(),
      skillMappings: z.array(z.object({
        skillName: z.string(),
        skillCategory: z.string(),
        weight: z.number().min(0).max(100),
        reasoning: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { skillMappings, ...certData } = input;
      
      const cert = await db.createCertificate({
        ...certData,
        userId: ctx.user.id,
      });
      
      if (skillMappings && skillMappings.length > 0) {
        await skillsDb.createSkillMappings(
          skillMappings.map(m => ({
            ...m,
            certificateId: cert.id,
            source: 'llm' as const,
          }))
        );
        
        await skillsDb.recalculateUserSkills(ctx.user.id);
      }
      
      if (input.courseUuid) {
        const existingCourse = await skillsDb.getCourseByUuid(input.courseUuid);
        if (!existingCourse) {
          await skillsDb.createCourse({
            courseUuid: input.courseUuid,
            title: input.title,
            issuer: input.issuer,
            description: input.description,
            duration: input.courseDuration,
            credits: input.courseCredits,
            level: input.level,
            category: input.category,
            analyzedBy: ctx.user.id,
          });
        } else {
          await skillsDb.incrementCourseUsage(existingCourse.courseUuid);
        }
      }
      
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
      customCategory: z.string().max(100).optional(),
      priority: z.enum(["normal", "important"]).optional(),
      isVerified: z.boolean().optional(),
      verificationUrl: z.string().optional(),
      externalUrl: z.string().optional(),
      isPublic: z.boolean().optional(),
      tags: z.string().optional(),
      courseUuid: z.string().optional(),
      courseDuration: z.number().optional(),
      courseCredits: z.number().optional(),
      completionGrade: z.string().optional(),
      learningHours: z.number().optional(),
      skillMappings: z.array(z.object({
        skillName: z.string(),
        skillCategory: z.string(),
        weight: z.number().min(0).max(100),
        reasoning: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, skillMappings, ...data } = input;
      
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
      
      if (skillMappings !== undefined) {
        await skillsDb.deleteSkillMappingsByCertificateId(id);
        
        if (skillMappings.length > 0) {
          await skillsDb.createSkillMappings(
            skillMappings.map(m => ({
              ...m,
              certificateId: id,
              source: 'llm' as const,
            }))
          );
        }
        
        await skillsDb.recalculateUserSkills(ctx.user.id);
      }
      
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
      fileKey: z.string().optional(),
      externalUrl: z.string().url().optional(),
    }).refine(data => data.fileKey || data.externalUrl, {
      message: "Either fileKey or externalUrl must be provided",
    }))
    .mutation(async ({ input }) => {
      let fileUrl: string;
      let mimeType: string = "application/pdf";
      
      if (input.fileKey) {
        const { url } = await storageGet(input.fileKey);
        fileUrl = url;
        if (input.fileKey.endsWith('.pdf')) mimeType = 'application/pdf';
        else if (input.fileKey.endsWith('.jpg') || input.fileKey.endsWith('.jpeg')) mimeType = 'image/jpeg';
        else if (input.fileKey.endsWith('.png')) mimeType = 'image/png';
      } else if (input.externalUrl) {
        fileUrl = input.externalUrl;
        if (input.externalUrl.includes('.pdf')) mimeType = 'application/pdf';
        else if (input.externalUrl.match(/\.(jpg|jpeg)$/i)) mimeType = 'image/jpeg';
        else if (input.externalUrl.includes('.png')) mimeType = 'image/png';
      } else {
        throw new Error("Either fileKey or externalUrl must be provided");
      }
      
      const result = await analyzeCertificateWithSkills(fileUrl, mimeType);
      return result;
    }),
  
  uploadFile: protectedProcedure
    .input(z.object({
      fileData: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const base64Data = input.fileData.split(',')[1] || input.fileData;
      const buffer = Buffer.from(base64Data, 'base64');
      
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `${ctx.user.id}-certificates/${timestamp}-${randomSuffix}-${input.fileName}`;
      
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      
      return { url, key: fileKey };
    }),
});
