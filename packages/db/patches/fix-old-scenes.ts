import { and, eq, isNotNull, isNull, or } from "drizzle-orm";
import { chapter, db, storage as storageTable, videoScenes } from "../index";
import { keys } from "../keys";

/**
 * - Ensures each project that has at least one `Chapter` has a `VideoScenes`
 *   row with `status: "completed"` (insert or update on `projectId`).
 * - For every `Chapter` with a missing `spriteURL` but a `thumbnailStorageId`,
 *   sets `spriteURL` to the public object URL from storage — same pattern as
 *   `fix-user-attributes` (`STORAGE_URL` + `bucket` + `path`).
 */
export async function fixOldScenes() {
  const storageUrl = keys().STORAGE_URL.replace(/\/$/, "");
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    const projectsWithChapters = await tx
      .selectDistinct({ projectId: chapter.projectId })
      .from(chapter);

    for (const { projectId } of projectsWithChapters) {
      await tx
        .insert(videoScenes)
        .values({
          projectId,
          status: "completed",
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: videoScenes.projectId,
          set: {
            status: "completed",
            updatedAt: now,
          },
        });
    }

    const chapters = await tx.query.chapter.findMany({
      where: and(
        isNotNull(chapter.thumbnailStorageId),
        or(isNull(chapter.spriteURL), eq(chapter.spriteURL, "")),
      ),
      columns: { id: true, thumbnailStorageId: true },
    });

    for (const ch of chapters) {
      const row = await tx.query.storage.findFirst({
        where: eq(storageTable.id, ch.thumbnailStorageId!),
        columns: { bucket: true, path: true },
      });
      if (!row) {
        continue;
      }

      const spriteURL = `${storageUrl}/${row.bucket}/${row.path}`;
      await tx
        .update(chapter)
        .set({
          spriteURL,
          updatedAt: now,
        })
        .where(eq(chapter.id, ch.id));
    }
  });
}
