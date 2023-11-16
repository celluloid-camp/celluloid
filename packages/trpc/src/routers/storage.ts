import { Prisma, prisma } from '@celluloid/prisma';
import { env } from '@celluloid/utils';
import * as Minio from 'minio'
import { z } from 'zod';

import { protectedProcedure, router } from '../trpc';

const defaultStorageSelect = Prisma.validator<Prisma.StorageSelect>()({
  id: true,
  path: true,
  bucket: true,
  createdAt: true,
  user: true,
  publicUrl: true
});

function parseUrl(url: string): { host: string; port: number | undefined; isSecure: boolean } {
  const parsedUrl = new URL(url);

  return {
    host: parsedUrl.hostname,
    port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : (parsedUrl.protocol === 'https:' ? 443 : 80),
    isSecure: parsedUrl.protocol === 'https:'
  };
}


export const storageRouter = router({

  presignedUrl: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user && ctx.user.id) {


        const storageUrlInfo = parseUrl(env.STORAGE_URL)

        const minioClient = new Minio.Client({
          endPoint: storageUrlInfo.host,
          port: storageUrlInfo.port,
          useSSL: storageUrlInfo.isSecure,
          accessKey: env.STORAGE_ACCESS_KEY,
          secretKey: env.STORAGE_SECRET_KEY,
        })

        const path = `${ctx.user.id}/${input.name}`
        return new Promise((resolve, reject) => minioClient.presignedPutObject(env.STORAGE_BUCKET, path, (err, url) => {
          if (err) {
            console.log(err);
            reject(err.message)
          }
          resolve({ uploadUrl: url, path })
        }))

      }
    }),
  add: protectedProcedure
    .input(
      z.object({
        path: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user && ctx.user.id) {
        const file = await prisma.storage.create({
          data: {
            user: {
              connect: {
                id: ctx.user.id,
              }
            },
            path: input.path,
            bucket: env.STORAGE_BUCKET,
          },
          select: defaultStorageSelect,
        });
        return file;
      }
    }),
  delete: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      //TODO : check if project owner or collaborator
      if (ctx.user && ctx.user.id) {
        const comment = await prisma.comment.delete({
          where: { id: input.commentId },
        });
        return comment;
      }
    }),
});
