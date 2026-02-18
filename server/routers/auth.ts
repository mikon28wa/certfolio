import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import * as skillsDb from "../skillsDb";

export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  exportData: protectedProcedure.query(async ({ ctx }) => {
    // Export all user data as JSON
    const certificates = await db.getCertificatesByUserId(ctx.user.id);
    const projects = await db.getProjectsByUserId(ctx.user.id);
    const collections = await db.getCollectionsByUserId(ctx.user.id);
    const skills = await skillsDb.getUserSkills(ctx.user.id);
    
    return {
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        profileSlug: ctx.user.profileSlug,
        bio: (ctx.user as any).bio,
        createdAt: ctx.user.createdAt,
      },
      certificates,
      projects,
      collections,
      skills,
      exportedAt: new Date().toISOString(),
    };
  }),

  deleteAccount: protectedProcedure
    .input(z.object({
      confirmation: z.literal("DELETE"),
    }))
    .mutation(async ({ ctx }) => {
      // Delete all user data
      await db.deleteUserData(ctx.user.id);
      
      // Clear session cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      
      return { success: true };
    }),
});
