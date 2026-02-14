import * as Minio from "minio";
import { keys } from "./keys";

export function getMinioClient() {
  const env = keys();
  const storageUrlInfo = parseUrl(env.STORAGE_URL);
  const minioClient = new Minio.Client({
    endPoint: storageUrlInfo.host,
    port: storageUrlInfo.port,
    useSSL: storageUrlInfo.isSecure,
    accessKey: env.STORAGE_ACCESS_KEY,
    secretKey: env.STORAGE_SECRET_KEY,
  });
  return minioClient;
}

export async function ensureBucketExists(
  minioClient: Minio.Client,
  bucket: string,
) {
  const bucketExists = await minioClient.bucketExists(bucket);
  if (!bucketExists) {
    throw new Error("Bucket does not exist");
  }
}

export async function uploadImageFile(s3Path: string, localFilePath: string) {
  const env = keys();
  const minioClient = getMinioClient();
  await ensureBucketExists(minioClient, env.STORAGE_BUCKET);
  await minioClient.fPutObject(env.STORAGE_BUCKET, s3Path, localFilePath, {
    "Content-Type": "image/jpeg",
  });
  return s3Path;
}


export async function generatePresignedUrl(s3Path: string, expiresIn: number = 24 * 60 * 60) {
  const env = keys();
  const minioClient = getMinioClient();
  await ensureBucketExists(minioClient, env.STORAGE_BUCKET);
  return await minioClient.presignedGetObject(env.STORAGE_BUCKET, s3Path, expiresIn);
}

export async function deleteFile(s3Path: string) {
  const env = keys();
  const minioClient = getMinioClient();
  await ensureBucketExists(minioClient, env.STORAGE_BUCKET);
  await minioClient.removeObject(env.STORAGE_BUCKET, s3Path);
}

export function parseUrl(url: string): {
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

export function getBucketName() {
  const env = keys();
  return env.STORAGE_BUCKET;
}
