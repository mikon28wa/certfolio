import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as skillsDb from "../skillsDb";

export const courseLibraryRouter = router({
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
      customCategory: z.string().max(100).optional(),
      providerUrl: z.string().optional(),
      providerName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
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
});
