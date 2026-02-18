import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const profileRouter = router({
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
});
