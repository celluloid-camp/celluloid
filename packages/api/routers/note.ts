import { db, project, projectNote } from "@celluloid/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const noteRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        term: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = (input.limit ?? 50) + 1;
      const { cursor } = input;

      if (!ctx.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view this note",
        });
      }

      const baseWhere = eq(projectNote.userId, ctx.user.id);
      let cursorWhere = baseWhere;

      if (cursor) {
        const [cursorRow] = await db
          .select({ createdAt: projectNote.createdAt, id: projectNote.id })
          .from(projectNote)
          .where(eq(projectNote.id, cursor))
          .limit(1);
        if (cursorRow) {
          cursorWhere = and(
            baseWhere,
            or(
              lt(projectNote.createdAt, cursorRow.createdAt),
              and(
                eq(projectNote.createdAt, cursorRow.createdAt),
                lt(projectNote.id, cursor),
              ),
            ),
          )!;
        }
      }

      const rows = await db
        .select({
          id: projectNote.id,
          content: projectNote.content,
          createdAt: projectNote.createdAt,
          updatedAt: projectNote.updatedAt,
          projectId: projectNote.projectId,
        })
        .from(projectNote)
        .where(cursorWhere)
        .orderBy(desc(projectNote.createdAt))
        .limit(limit);

      const projectIds = [
        ...new Set(rows.map((r) => r.projectId).filter(Boolean)),
      ] as string[];
      const projects =
        projectIds.length > 0
          ? await db
              .select({ id: project.id, title: project.title })
              .from(project)
              .where(inArray(project.id, projectIds))
          : [];

      const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

      const hasMore = rows.length === limit;
      const items = (hasMore ? rows.slice(0, -1) : rows).map((note) => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        project: note.projectId ? (projectMap[note.projectId] ?? null) : null,
      }));

      const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

      return {
        items: items.reverse(),
        nextCursor,
      };
    }),

  byProjectId: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [note] = await db
        .select({
          content: projectNote.content,
          createdAt: projectNote.createdAt,
          updatedAt: projectNote.updatedAt,
        })
        .from(projectNote)
        .where(
          and(
            eq(projectNote.projectId, input.projectId),
            eq(projectNote.userId, ctx.user.id),
          ),
        )
        .limit(1);

      return note ?? null;
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        content: z.any(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [proj] = await db
        .select()
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);

      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project not found with this id: ${input.projectId}`,
        });
      }

      const [existing] = await db
        .select()
        .from(projectNote)
        .where(
          and(
            eq(projectNote.projectId, input.projectId),
            eq(projectNote.userId, ctx.user.id),
          ),
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(projectNote)
          .set({
            content: input.content,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(projectNote.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(projectNote)
        .values({
          projectId: proj.id,
          userId: ctx.user.id,
          content: input.content,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .returning();

      return created!;
    }),
});
