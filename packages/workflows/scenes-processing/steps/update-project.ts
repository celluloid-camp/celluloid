import { db } from "@celluloid/db";
import { getBucketName } from "@celluloid/storage/client";
import { Scene } from "./types";

export async function updateProject(projectId: string, scenes: Scene[]) {
  "use step";

  const thumbnailStorages = await db.storage.createManyAndReturn({
    data: scenes.map((scene) => ({
      bucket: getBucketName(),
      path: scene.thumbnailPath,
    })),
    skipDuplicates: true,
  });

  await db.chapter.createMany({
    data: scenes.map((scene, index) => ({
      projectId,
      thumbnailStorageId: thumbnailStorages[index]?.id,
      startTime: scene.startTime,
      endTime: scene.endTime,
    })),
  });
}
