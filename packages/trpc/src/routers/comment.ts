import { prisma } from "@celluloid/prisma";
import { z } from "zod";

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
      if (ctx.user && ctx.user.id) {
        const comment = await prisma.comment.create({
          data: {
            userId: ctx.user.id,
            annotationId: input.annotationId,
            text: input.comment,
          },
          // select: defaultPostSelect,
        });
        return comment;
      }
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
