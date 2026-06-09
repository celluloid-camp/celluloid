import type { AppRouter } from "@celluloid/api";
import type { inferRouterOutputs } from "@trpc/server";

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

type RouterOutput = inferRouterOutputs<AppRouter>;
export type AdminGetUserById = RouterOutput["admin"]["getUserById"];
export type UserMe = RouterOutput["user"]["me"];

export type ProjectById = RouterOutput["project"]["byId"];

export type ProjectList = RouterOutput["project"]["list"];
export type ProjectListItem = RouterOutput["project"]["list"]["items"][0];

export type AnnotationsByProjectId = RouterOutput["annotation"]["byProjectId"];
export type AnnotationByProjectId = ArrElement<AnnotationsByProjectId>;
export type AnnotationByProjectIdWithExtra = AnnotationByProjectId & {
  extra: NonNullable<AnnotationByProjectId["extra"]>;
};
export type AnnotationCommentByProjectId = ArrElement<
  AnnotationByProjectId["comments"]
>;

export type ChaptersByProjectId = RouterOutput["chapter"]["byProjectId"];
export type ChapterByProjectId = ArrElement<ChaptersByProjectId>;

export type VisionByProjectId = RouterOutput["vision"]["byProjectId"];
