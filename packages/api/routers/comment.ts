import { comment, db, project } from "@celluloid/db";
import { getNotificationsClient } from "@celluloid/notifications";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { keys } from "../keys";
import { protectedProcedure, router } from "../trpc";

export const commentRouter = router({
  add: protectedProcedure
    .input(
      z.object({
        annotationId: z.string(),
        projectId: z.string(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [created] = await db
        .insert(comment)
        .values({
          userId: ctx.user.id,
          annotationId: input.annotationId,
          text: input.comment,
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create comment");
      }

      const [proj] = await db
        .select({ userId: project.userId, title: project.title })
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);

      if (proj?.userId !== ctx.user.id) {
        await getNotificationsClient().workflows.trigger("new-annotation", {
          recipients: [
            {
              id: ctx.user?.id,
            },
          ],
          data: {
            message: `Nouveau commentaire de ${ctx.user?.username} sur le projet ${proj?.title}`,
            link: `${keys().BASE_URL}/projects/${input.projectId}`,
          },
        });
      }

      return created;
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        annotationId: z.string(),
        projectId: z.string(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [updated] = await db
        .update(comment)
        .set({ text: input.comment })
        .where(eq(comment.id, input.id))
        .returning();

      return updated;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [deleted] = await db
        .delete(comment)
        .where(eq(comment.id, input.commentId))
        .returning();

      return deleted;
    }),
});
