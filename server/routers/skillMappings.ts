import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as skillsDb from "../skillsDb";

export const skillMappingsRouter = router({
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
      
      await skillsDb.recalculateUserSkills(ctx.user.id);
      
      return { success: true, count: mappingsWithCertId.length };
    }),
});
