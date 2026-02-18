import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as skillsDb from "../skillsDb";

export const skillsRouter = router({
  getUserSkills: protectedProcedure.query(async ({ ctx }) => {
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
  
  getSkillTimeline: protectedProcedure
    .input(z.object({
      skillName: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return await skillsDb.getSkillTimeline(ctx.user.id, input.skillName, input.startDate, input.endDate);
    }),
  
  compareSkills: protectedProcedure
    .input(z.object({
      skillNames: z.array(z.string()).min(2).max(5),
    }))
    .query(async ({ ctx, input }) => {
      return await skillsDb.compareSkills(ctx.user.id, input.skillNames);
    }),
  
  getRecommendations: protectedProcedure
    .query(async ({ ctx }) => {
      return await skillsDb.getSkillRecommendations(ctx.user.id);
    }),
  
  captureSnapshot: protectedProcedure.mutation(async ({ ctx }) => {
    const snapshot = await skillsDb.captureSkillSnapshot(ctx.user.id);
    return { success: true, snapshotCount: snapshot.length };
  }),
});
