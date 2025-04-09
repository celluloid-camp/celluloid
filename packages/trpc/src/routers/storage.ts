import { Prisma, prisma } from "@celluloid/prisma";
import * as Minio from "minio";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";
import { env } from "../env";

const defaultStorageSelect = Prisma.validator<Prisma.StorageSelect>()({
	id: true,
	path: true,
	bucket: true,
	createdAt: true,
	user: true,
	//@ts-expect-error dynamic
	publicUrl: true,
});

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
const storageUrlInfo = parseUrl(env.STORAGE_URL);
const minioClient = new Minio.Client({
	endPoint: storageUrlInfo.host,
	port: storageUrlInfo.port,
	useSSL: storageUrlInfo.isSecure,
	accessKey: env.STORAGE_ACCESS_KEY,
	secretKey: env.STORAGE_SECRET_KEY,
});
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
				const storageUrlInfo = parseUrl(env.STORAGE_URL);
				const minioClient = new Minio.Client({
					endPoint: storageUrlInfo.host,
					port: storageUrlInfo.port,
					useSSL: storageUrlInfo.isSecure,
					accessKey: env.STORAGE_ACCESS_KEY,
					secretKey: env.STORAGE_SECRET_KEY,
				});

				const path = `${ctx.user.id}/${input.name}`;
				const url = await minioClient.presignedPutObject(
					env.STORAGE_BUCKET,
					path,
					24 * 60 * 60, // 24 hours expiry
				);
				return { uploadUrl: url, path };
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
				const file = await prisma.storage.create({
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
				const storage = await prisma.storage.findUnique({
					where: { id: input.storageId },
					select: { ...defaultStorageSelect, user: { select: { id: true } } },
				});

				if (!storage || storage.user?.id !== ctx.user?.id) {
					throw new Error("Storage not found or access denied");
				}

				await minioClient.removeObject(storage.bucket, storage.path);

				await prisma.storage.delete({
					where: { id: input.storageId },
				});

				return true;
			} catch (error) {
				throw new Error("Failed to delete storage");
			}
		}),
});
