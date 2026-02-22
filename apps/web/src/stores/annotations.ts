import { AnnotationShape } from "@celluloid/db/schema/types";
import { useQuery } from "@tanstack/react-query";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaFullscreenRef,
  useMediaSelector,
} from "media-chrome/react/media-store";
import { useMemo } from "react";
import { AnnotationShapeWithMetadata } from "@/components/project/video/annotation/shapes-viewer";
import { useTRPC } from "@/lib/trpc/client";
import type { AnnotationByProjectIdWithExtra } from "@/lib/trpc/types";

export function useAnnotations(projectId: string) {
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);

  const api = useTRPC();
  const { data: annotations = [], isLoading } = useQuery({
    ...api.annotation.byProjectId.queryOptions({
      id: projectId,
    }),
    placeholderData: [],
  });

  const visibleAnnotations = useMemo(
    () =>
      mediaCurrentTime && annotations
        ? annotations.filter(
            (annotation) =>
              mediaCurrentTime >= annotation.startTime &&
              mediaCurrentTime <= annotation.stopTime,
          )
        : [],
    [annotations, mediaCurrentTime],
  );

  const shapeAnnotations = useMemo<AnnotationShapeWithMetadata[]>(() => {
    if (!mediaCurrentTime) return [];
    return annotations
      .filter(
        (annotation): annotation is AnnotationByProjectIdWithExtra =>
          annotation.extra !== null &&
          Math.floor(mediaCurrentTime) == annotation.startTime,
      )
      .map((annotation) => {
        const extra = annotation.extra;
        return {
          ...extra,
          id: extra.id ?? annotation.id,
          type: extra.type,
          x: extra.x,
          y: extra.y,
          pause: annotation.pause,
          startTime: annotation.startTime,
          metadata: {
            color: annotation.user.color ?? "",
            initial: annotation.user.initial ?? "",
            username: annotation.user.username,
            avatar: annotation.user.image ?? undefined,
            text: annotation.text,
          },
        };
      });
  }, [annotations, mediaCurrentTime]);

  return { annotations, visibleAnnotations, shapeAnnotations, isLoading };
}
