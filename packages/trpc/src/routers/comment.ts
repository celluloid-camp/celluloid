import { notifications } from "@celluloid/notifications";
import { prisma } from "@celluloid/prisma";
import { z } from "zod";
import { env } from "../env";
import { protectedProcedure, router } from "../trpc";

// const defaultPostSelect = Prisma.validator<Prisma.ProjectSelect>()({
//   id: true,
//   title: true,
//   text: true,
//   createdAt: true,
//   updatedAt: true,
// });

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
      //TODO : check if project owner or collaborator

      const comment = await prisma.comment.create({
        data: {
          userId: ctx.user.id,
          annotationId: input.annotationId,
          text: input.comment,
        },
        // select: defaultPostSelect,
      });
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
        },
        select: {
          userId: true,
          title: true,
        },
      });

      if (project?.userId !== ctx.user?.id) {
        await notifications.workflows.trigger("new-annotation", {
          recipients: [
            {
              id: ctx.user?.id,
            },
          ],
          data: {
            message: `Nouveau commentaire de ${ctx.user?.username} sur le projet ${project?.title}`,
            link: `${env.BASE_URL}/projects/${input.projectId}`,
          },
        });
      }

      return comment;
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
      //TODO : check if project owner or collaborator
      if (ctx.user && ctx.user.id) {
        const comment = await prisma.comment.update({
          where: {
            id: input.id,
          },
          data: {
            text: input.comment,
          },
          // select: defaultPostSelect,
        });
        return comment;
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
