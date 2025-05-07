import type { AppRouter } from "@celluloid/trpc";
import type { inferRouterOutputs } from "@trpc/server";

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

type RouterOutput = inferRouterOutputs<AppRouter>;
export type AdminGetUserById = RouterOutput["admin"]["getUserById"];
export type UserMe = RouterOutput["user"]["me"];

export type ProjectById = RouterOutput["project"]["byId"];
export type ProjectMembers = ArrElement<ProjectById["members"]>;

export type ProjectList = RouterOutput["project"]["list"];
export type ProjectListItem = RouterOutput["project"]["list"]["items"][0];

export type AnnotationsByProjectId = RouterOutput["annotation"]["byProjectId"];
export type AnnotationByProjectId = ArrElement<AnnotationsByProjectId>;
export type AnnotationCommentByProjectId = ArrElement<
  AnnotationByProjectId["comments"]
>;

export type ChaptersByProjectId = RouterOutput["chapter"]["byProjectId"];
export type ChapterByProjectId = ArrElement<ChaptersByProjectId>;
