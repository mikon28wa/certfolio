import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

export const pdfRouter = router({
  exportPortfolio: protectedProcedure
    .input(z.object({
      collectionId: z.number().optional(),
      includeSkills: z.boolean().default(true),
      includeCertificates: z.boolean().default(true),
      branding: z.object({
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        website: z.string().optional(),
        linkedIn: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { generatePortfolioPDF } = await import("../pdfGenerator");
      
      const pdfBuffer = await generatePortfolioPDF({
        userId: ctx.user.id,
        ...input,
      });
      
      const fileName = `portfolio-${ctx.user.id}-${Date.now()}.pdf`;
      const { url } = await storagePut(
        `portfolios/${fileName}`,
        pdfBuffer,
        "application/pdf"
      );
      
      return { url, fileName };
    }),
});
