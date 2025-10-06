/**
 * This file contains the root router of your tRPC-backend
 */
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { adminRouter } from "./admin";
import { annotationRouter } from "./annotation";
import { chapterRouter } from "./chapter";
import { commentRouter } from "./comment";
import { noteRouter } from "./note";
import { playlistRouter } from "./playlist";
import { projectRouter } from "./project";
import { storageRouter } from "./storage";
import { transcriptRouter } from "./transcript";
import { userRouter } from "./user";
import { visionRouter } from "./vision";

export const appRouter = router({
  healthcheck: publicProcedure
    .meta({ openapi: { method: "GET", path: "/health" } })
    .input(z.object({}))
    .output(z.string())
    .query(() => "yay!"),
  project: projectRouter,
  user: userRouter,
  playlist: playlistRouter,
  annotation: annotationRouter,
  chapter: chapterRouter,
  comment: commentRouter,
  storage: storageRouter,
  admin: adminRouter,
  note: noteRouter,
  transcript: transcriptRouter,
  vision: visionRouter,
});

export type AppRouter = typeof appRouter;
