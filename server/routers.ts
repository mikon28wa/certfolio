import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import {
  authRouter,
  profileRouter,
  certificatesRouter,
  skillsRouter,
  collectionsRouter,
  projectsRouter,
  pdfRouter,
  courseLibraryRouter,
  skillMappingsRouter,
} from "./routers/index";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  profile: profileRouter,
  certificates: certificatesRouter,
  skills: skillsRouter,
  collections: collectionsRouter,
  projects: projectsRouter,
  pdf: pdfRouter,
  courseLibrary: courseLibraryRouter,
  skillMappings: skillMappingsRouter,
});

export type AppRouter = typeof appRouter;
