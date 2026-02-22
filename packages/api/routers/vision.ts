import { db, videoAnalysis } from "@celluloid/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, publicProcedure, router } from "../trpc";

function getSpritePublicUrl(
  storage: { id: string; path: string; bucket: string } | null,
) {
  if (!storage) return null;
  const baseUrl = keys().STORAGE_URL?.replace(/\/$/, "") ?? "";
  return `${baseUrl}/${storage.bucket}/${storage.path}`;
}

export const visionRouter = router({
  byProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const analysis = await db.query.videoAnalysis.findFirst({
        where: eq(videoAnalysis.projectId, input.projectId),
        columns: {
          status: true,
          visionJobId: true,
          processing: true,
        },
        with: {
          storage: {
            columns: {
              id: true,
              path: true,
              bucket: true,
            },
          },
        },
      });

      if (!analysis) {
        return null;
      }

      const storage = analysis.storage;
      const sprite =
        storage != null
          ? {
              id: storage.id,
              path: storage.path,
              publicUrl: getSpritePublicUrl(storage),
            }
          : null;

      return {
        status: analysis.status,
        visionJobId: analysis.visionJobId,
        processing: analysis.processing,
        sprite,
      };
    }),

  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async () => {
      return null;
    }),

  check: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async () => {
      return null;
    }),

  updateAnalysis: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        analysis: z.unknown(),
      }),
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(videoAnalysis)
        .set({
          processing: input.analysis as unknown as Record<string, unknown>,
        })
        .where(eq(videoAnalysis.projectId, input.projectId))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video analysis not found",
        });
      }

      return updated;
    }),
});
