/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';
import { annotationRouter } from "./annotation"
import { chapterRouter } from './chapter';
import { commentRouter } from "./comment"
import { playlistRouter } from './playlist'
import { projectRouter } from './project'
import { storageRouter } from './storage';
import { userRouter } from './user';


export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  project: projectRouter,
  user: userRouter,
  playlist: playlistRouter,
  annotation: annotationRouter,
  chapter: chapterRouter,
  comment: commentRouter,
  storage: storageRouter
});

export type AppRouter = typeof appRouter;
