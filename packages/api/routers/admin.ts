import {
  annotation,
  db,
  project,
  projectNote,
  user,
  userToProject,
} from "@celluloid/db";
import { generateUniqueShareName } from "@celluloid/utils";
import { TRPCError } from "@trpc/server";
import { count, desc, eq, ilike, inArray } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../trpc";

export const adminRouter = router({
  listProjects: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        skip: z.number().min(0).nullish(),
        searchTerm: z.string().default(""),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 10;
      const skip = input.skip ?? 0;

      const totalResult = await (async () => {
        if (input.searchTerm) {
          const rows = await db
            .select({ count: count() })
            .from(project)
            .innerJoin(user, eq(project.userId, user.id))
            .where(ilike(user.username, `%${input.searchTerm}%`));
          return rows[0]?.count ?? 0;
        }
        const rows = await db.select({ count: count() }).from(project);
        return rows[0]?.count ?? 0;
      })();

      const total = Number(totalResult);

      let projectIds: string[];
      if (input.searchTerm) {
        const ordered = await db
          .select({ id: project.id })
          .from(project)
          .innerJoin(user, eq(project.userId, user.id))
          .where(ilike(user.username, `%${input.searchTerm}%`))
          .orderBy(desc(project.publishedAt))
          .limit(limit)
          .offset(skip);
        projectIds = ordered.map((r) => r.id);
      } else {
        const ordered = await db
          .select({ id: project.id })
          .from(project)
          .orderBy(desc(project.publishedAt))
          .limit(limit)
          .offset(skip);
        projectIds = ordered.map((r) => r.id);
      }

      if (projectIds.length === 0) {
        return { items: [], total };
      }

      const items = await db.query.project.findMany({
        where: inArray(project.id, projectIds),
        with: {
          user: true,
          userToProjects: true,
        },
      });

      const [annotationCounts, memberCounts] = await Promise.all([
        db
          .select({ projectId: annotation.projectId, count: count() })
          .from(annotation)
          .where(inArray(annotation.projectId, projectIds))
          .groupBy(annotation.projectId),
        db
          .select({ projectId: userToProject.projectId, count: count() })
          .from(userToProject)
          .where(inArray(userToProject.projectId, projectIds))
          .groupBy(userToProject.projectId),
      ]);

      const annByProject = Object.fromEntries(
        annotationCounts.map((r) => [r.projectId, Number(r.count)]),
      );
      const memByProject = Object.fromEntries(
        memberCounts.map((r) => [r.projectId ?? "", Number(r.count)]),
      );

      const ordered = projectIds.map((id) => {
        const p = items.find((i) => i.id === id);
        if (!p) return null;
        return {
          ...p,
          members: p.userToProjects,
          _count: {
            annotations: annByProject[id] ?? 0,
            members: memByProject[id] ?? 0,
          },
        };
      });

      return {
        items: ordered.filter(Boolean),
        total,
      };
    }),

  getUserById: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const [u] = await db
        .select({
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
        })
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);
      if (!u) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return u;
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      await db
        .update(user)
        .set({
          username: input.username,
          firstname: input.firstName,
          lastname: input.lastName,
        })
        .where(eq(user.id, input.userId));
      return true;
    }),

  byId: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const projects = await db.query.project.findMany({
        where: eq(project.id, input.id),
        with: {
          user: true,
          chapters: true,
          playlist: { with: { projects: true } },
          userToProjects: { with: { user: true } },
        },
      });
      const proj = projects[0];
      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No project with id '${input.id}'`,
        });
      }
      const [annCount, memCount] = await Promise.all([
        db
          .select({ count: count() })
          .from(annotation)
          .where(eq(annotation.projectId, input.id)),
        db
          .select({ count: count() })
          .from(userToProject)
          .where(eq(userToProject.projectId, input.id)),
      ]);
      return {
        ...proj,
        members: proj.userToProjects,
        _count: {
          annotations: Number(annCount[0]?.count ?? 0),
          members: Number(memCount[0]?.count ?? 0),
        },
      };
    }),

  update: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().nullish(),
        description: z.string().nullish(),
        public: z.boolean().nullish(),
        collaborative: z.boolean().nullish(),
        shared: z.boolean().default(false),
        keywords: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ input }) => {
      const [proj] = await db
        .select()
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);
      if (!proj) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      let shareCode = proj.shareCode;
      const newTitle =
        input.title !== undefined && input.title !== proj.title
          ? input.title
          : proj.title;

      if (proj.shared !== input.shared) {
        if (input.shared && newTitle) {
          shareCode = generateUniqueShareName(newTitle);
        } else {
          shareCode = null;
        }
      }

      await db
        .update(project)
        .set({
          title: input.title ?? proj.title,
          description: input.description ?? proj.description,
          public: input.public ?? proj.public,
          collaborative: input.collaborative ?? proj.collaborative,
          shared: input.shared ?? proj.shared,
          keywords: input.keywords?.length ? input.keywords : proj.keywords,
          shareCode,
        })
        .where(eq(project.id, input.projectId));

      const [updated] = await db
        .select()
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);
      return updated!;
    }),

  delete: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [proj] = await db
        .select()
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);
      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      await db.delete(projectNote).where(eq(projectNote.projectId, input.projectId));
      await db.delete(project).where(eq(project.id, input.projectId));
      return proj;
    }),

  projectsByUser: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(100).nullish(),
        skip: z.number().min(0).nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50;
      const skip = input.skip ?? 0;

      const [u] = await db
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);
      if (!u) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const [totalRow] = await db
        .select({ count: count() })
        .from(project)
        .where(eq(project.userId, input.userId));
      const total = Number(totalRow?.count ?? 0);

      const items = await db
        .select({
          id: project.id,
          title: project.title,
          description: project.description,
          publishedAt: project.publishedAt,
          public: project.public,
          collaborative: project.collaborative,
          shared: project.shared,
          shareCode: project.shareCode,
          shareExpiresAt: project.shareExpiresAt,
          duration: project.duration,
        })
        .from(project)
        .where(eq(project.userId, input.userId))
        .orderBy(desc(project.publishedAt))
        .limit(limit)
        .offset(skip);

      return { items, total };
    }),

  deleteUserProject: adminProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [proj] = await db
        .select()
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);
      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or doesn't belong to specified user",
        });
      }
      await db.delete(projectNote).where(eq(projectNote.projectId, input.projectId));
      await db.delete(project).where(eq(project.id, input.projectId));
      return proj;
    }),

  getProjectById: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const projects = await db.query.project.findMany({
        where: eq(project.id, input.id),
        with: {
          user: {
            columns: { id: true, username: true },
          },
        },
      });
      const proj = projects[0];
      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No project with id '${input.id}'`,
        });
      }
      return proj;
    }),

  updateProject: adminProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        title: z.string(),
        description: z.string(),
        public: z.boolean().optional(),
        shared: z.boolean().optional(),
        collaborative: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [proj] = await db
        .select()
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);
      if (!proj) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      await db
        .update(project)
        .set({
          title: input.title,
          description: input.description,
          ...(input.public !== undefined && { public: input.public }),
          ...(input.shared !== undefined && { shared: input.shared }),
          ...(input.collaborative !== undefined && {
            collaborative: input.collaborative,
          }),
        })
        .where(eq(project.id, input.projectId));

      const [updated] = await db
        .select()
        .from(project)
        .where(eq(project.id, input.projectId))
        .limit(1);
      return updated!;
    }),
});
