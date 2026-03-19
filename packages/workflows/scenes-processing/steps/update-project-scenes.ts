import { chapter, db, eq, project, storage } from "@celluloid/db";
import { getBucketName } from "@celluloid/storage/client";
import { Scene } from "./types";

export async function updateProjectScenes(projectId: string, scenes: Scene[]) {
  "use step";

  const thumbnailStorages = await db
    .insert(storage)
    .values(
      scenes.map((scene) => ({
        bucket: getBucketName(),
        path: scene.thumbnailPath,
      })),
    )
    .returning();

  await db.insert(chapter).values(
    scenes.map((scene, index) => ({
      projectId,
      thumbnailStorageId: thumbnailStorages[index]?.id,
      startTime: scene.startTime,
      endTime: scene.endTime,
      updatedAt: new Date().toISOString(),
    })),
  );
  await db
    .update(project)
    .set({
      scenesProcessingStatus: "completed",
      scenesProcessingRunId: null,
    })
    .where(eq(project.id, projectId));
}
