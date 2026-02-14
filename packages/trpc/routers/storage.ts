import { db, Prisma } from "@celluloid/db";
import { deleteFile, generatePresignedUrl } from "@celluloid/storage/client";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, router } from "../trpc";

const defaultStorageSelect = {
  id: true,
  path: true,
  bucket: true,
  createdAt: true,
  user: true,
  //@ts-expect-error dynamic
  publicUrl: true,
} satisfies Prisma.StorageSelect;

function parseUrl(url: string): {
  host: string;
  port: number | undefined;
  isSecure: boolean;
} {
  const parsedUrl = new URL(url);

  return {
    host: parsedUrl.hostname,
    port: parsedUrl.port
      ? Number.parseInt(parsedUrl.port, 10)
      : parsedUrl.protocol === "https:"
        ? 443
        : 80,
    isSecure: parsedUrl.protocol === "https:",
  };
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
      const env = keys();
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
      const env = keys();
      if (ctx.user?.id) {
        const file = await db.storage.create({
          data: {
            user: {
              connect: {
                id: ctx.user.id,
              },
            },
            path: input.path,
            bucket: env.STORAGE_BUCKET,
          },
          select: defaultStorageSelect,
        });
        return { id: file.id, publicUrl: file.publicUrl };
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
      try {
        const storage = await db.storage.findUnique({
          where: { id: input.storageId },
          select: { ...defaultStorageSelect, user: { select: { id: true } } },
        });

        if (!storage || storage.user?.id !== ctx.user?.id) {
          throw new Error("Storage not found or access denied");
        }

        await deleteFile(storage.path);

        await db.storage.delete({
          where: { id: input.storageId },
        });

        return true;
      } catch (error) {
        throw new Error("Failed to delete storage");
      }
    }),
});
