import { AnnotationShape } from "@celluloid/db/schema/types";
import { useQuery } from "@tanstack/react-query";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
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

const annotationsAtom = atomWithQuery(() => ({
  queryKey: ["todos"],
}));

export function useAnnotations(projectId: string) {
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);

  const api = useTRPC();
  const { data: annotations = [], isLoading } = useQuery({
    ...api.annotation.byProjectId.queryOptions({
      id: projectId,
    }),
    placeholderData: [],
  });

  const currentAnnotations = useMemo(
    () =>
      mediaCurrentTime && annotations
        ? annotations.filter((annotation) => {
            const inRange =
              mediaCurrentTime >= annotation.startTime &&
              mediaCurrentTime <= annotation.stopTime;
            if (annotation.extra != null) {
              return (
                mediaCurrentTime >= annotation.startTime &&
                mediaCurrentTime <= annotation.startTime + 1
              );
            }
            return inRange;
          })
        : [],
    [annotations, mediaCurrentTime],
  );

  const shapeAnnotations = useMemo<AnnotationShapeWithMetadata[]>(() => {
    return currentAnnotations
      .filter(
        (annotation): annotation is AnnotationByProjectIdWithExtra =>
          annotation.extra !== null,
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
  }, [currentAnnotations]);

  return { annotations, currentAnnotations, shapeAnnotations, isLoading };
}
