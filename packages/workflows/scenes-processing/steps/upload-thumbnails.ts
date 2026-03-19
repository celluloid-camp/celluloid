import fs from "node:fs";
import path from "node:path";
import { uploadImageFile } from "@celluloid/storage/client";
import { Scene } from "./types";

export async function uploadThumbnails(projectId: string, scenes: Scene[]) {
  "use step";

  for (const scene of scenes) {
    const localFilePath = scene.thumbnailPath;
    const fileName = path.basename(localFilePath);
    const s3ObjectName = `${projectId}/chapters/${fileName}`;

    await uploadImageFile(s3ObjectName, localFilePath);

    // Update the thumbnailPath with the S3 URL
    scene.thumbnailPath = s3ObjectName;
  }

  return scenes;
}
