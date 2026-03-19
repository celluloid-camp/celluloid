import { db, storage, user } from "@celluloid/db";
import { deleteFile, generatePresignedUrl } from "@celluloid/storage/client";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, router } from "../trpc";

function getPublicUrl(path: string, bucket: string): string {
  const baseUrl = keys().STORAGE_URL?.replace(/\/$/, "") ?? "";
  return `${baseUrl}/${bucket}/${path}`;
}

export const storageRouter = router({
  presignedUrl: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .output(
      z.object({
        uploadUrl: z.string(),
        path: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.id) {
        const path = `${ctx.user.id}/${input.name}`;
        const presignedUrl = await generatePresignedUrl(path);
        return { uploadUrl: presignedUrl, path };
      }
      return { uploadUrl: "", path: "" };
    }),

  add: protectedProcedure
    .input(
      z.object({
        path: z.string(),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        publicUrl: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.id) {
        const env = keys();
        const [file] = await db
          .insert(storage)
          .values({
            path: input.path,
            bucket: env.STORAGE_BUCKET,
          })
          .returning();

        if (!file) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create storage record",
          });
        }

        return {
          id: file.id,
          publicUrl: getPublicUrl(file.path, file.bucket),
        };
      }
      return { id: "", publicUrl: "" };
    }),

  delete: protectedProcedure
    .input(
      z.object({
        storageId: z.string(),
      }),
    )
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      const [storageRow] = await db
        .select()
        .from(storage)
        .where(eq(storage.id, input.storageId))
        .limit(1);

      if (!storageRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Storage not found",
        });
      }

      const [owner] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.avatarStorageId, input.storageId))
        .limit(1);

      if (!owner || owner.id !== ctx.user?.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Storage not found or access denied",
        });
      }

      await deleteFile(storageRow.path);
      await db.delete(storage).where(eq(storage.id, input.storageId));

      return true;
    }),
});
