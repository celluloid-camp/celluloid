/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';
import { playlistRouter } from './playlist'
import { projectRouter } from './project'
import { userRouter } from './user';


export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  project: projectRouter,
  user: userRouter,
  playlist: playlistRouter
});

export type AppRouter = typeof appRouter;
