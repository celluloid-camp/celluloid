import { and, eq, isNotNull, isNull, or } from "drizzle-orm";
import randomColor from "randomcolor";
import { db, user as userTable } from "../index";
import { keys } from "../keys";

export async function fixUserAttributes() {
  const storageUrl = keys().STORAGE_URL.replace(/\/$/, "");
  const users = await db
    .select()
    .from(userTable)
    .where(
      or(
        isNull(userTable.color),
        isNull(userTable.initial),
        and(isNotNull(userTable.avatarStorageId), isNull(userTable.image)),
      ),
    );
  await db.transaction(async (tx) => {
    for (const currentUser of users) {
      await tx
        .update(userTable)
        .set({
          color:
            currentUser.color ??
            randomColor({ seed: currentUser.id, luminosity: "bright" }),
          initial:
            currentUser.initial ??
            currentUser.username
              .split(" ")
              .map((part: string) => part.substring(0, 1))
              .join(""),
          image:
            currentUser.avatarStorageId && !currentUser.image
              ? `${storageUrl}/${currentUser.avatarStorageId}`
              : currentUser.image,
        })
        .where(eq(userTable.id, currentUser.id));
    }
  });
}
