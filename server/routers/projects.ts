import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as skillsDb from "../skillsDb";
import { analyzeProject } from "../llmService";
import { storagePut } from "../storage";

export const projectsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return skillsDb.getProjectEventsByUserId(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const project = await skillsDb.getProjectEventById(input.id);
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Projekt nicht gefunden" });
      }
      const skillLinks = await skillsDb.getProjectSkillLinks(input.id);
      const media = await skillsDb.getProjectMedia(input.id);
      return { ...project, skillLinks, media };
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      description: z.string().optional(),
      role: z.enum(["solo", "team", "lead"]).default("solo"),
      technologies: z.string().optional(),
      projectType: z.string().optional(),
      impactDescription: z.string().optional(),
      dateCompleted: z.date(),
      complexity: z.number().min(1).max(3).default(1),
      responsibility: z.number().min(1).max(3).default(1),
      impact: z.number().min(0).max(3).default(0),
      projectUrl: z.string().optional(),
      fileUrl: z.string().optional(),
      fileKey: z.string().optional(),
      fileName: z.string().optional(),
      mimeType: z.string().optional(),
      skillLinks: z.array(z.object({
        skillName: z.string(),
        skillCategory: z.string().optional(),
        weight: z.number().min(0).max(100),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { skillLinks, ...projectData } = input;
      
      const project = await skillsDb.createProjectEvent({
        ...projectData,
        userId: ctx.user.id,
      });

      if (skillLinks && skillLinks.length > 0 && project.id) {
        await skillsDb.createProjectSkillLinks(
          skillLinks.map(sl => ({
            ...sl,
            projectId: project.id as number,
          }))
        );
      }

      await skillsDb.recalculateUserSkills(ctx.user.id);

      return project;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(500).optional(),
      description: z.string().optional(),
      role: z.enum(["solo", "team", "lead"]).optional(),
      technologies: z.string().optional(),
      projectType: z.string().optional(),
      impactDescription: z.string().optional(),
      dateCompleted: z.date().optional(),
      complexity: z.number().min(1).max(3).optional(),
      responsibility: z.number().min(1).max(3).optional(),
      impact: z.number().min(0).max(3).optional(),
      projectUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const project = await skillsDb.getProjectEventById(id);
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Projekt nicht gefunden" });
      }
      await skillsDb.updateProjectEvent(id, data);
      await skillsDb.recalculateUserSkills(ctx.user.id);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const project = await skillsDb.getProjectEventById(input.id);
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Projekt nicht gefunden" });
      }
      await skillsDb.deleteProjectEvent(input.id);
      await skillsDb.recalculateUserSkills(ctx.user.id);
      return { success: true };
    }),

  analyze: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      technologies: z.string().optional(),
      role: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await analyzeProject(
        input.title,
        input.description,
        input.technologies,
        input.role
      );
      return result;
    }),

  addMedia: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      mediaType: z.enum(["image", "pdf", "link"]),
      fileUrl: z.string().optional(),
      fileKey: z.string().optional(),
      fileName: z.string().optional(),
      mimeType: z.string().optional(),
      externalUrl: z.string().optional(),
      linkType: z.string().optional(),
      caption: z.string().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const project = await skillsDb.getProjectEventById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Projekt nicht gefunden" });
      }
      return skillsDb.addProjectMedia(input);
    }),

  deleteMedia: protectedProcedure
    .input(z.object({ mediaId: z.number(), projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const project = await skillsDb.getProjectEventById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Projekt nicht gefunden" });
      }
      await skillsDb.deleteProjectMedia(input.mediaId);
      return { success: true };
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
      const fileKey = `${ctx.user.id}-projects/${timestamp}-${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      return { url, key: fileKey };
    }),
});
