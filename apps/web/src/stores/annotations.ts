import { AnnotationShape } from "@celluloid/db/schema/types";
import { useQuery } from "@tanstack/react-query";
import { atomWithQuery } from "jotai-tanstack-query";
import { useMediaSelector } from "media-chrome/react/media-store";
import { useEffect, useMemo, useState } from "react";
import { AnnotationShapeWithMetadata } from "@/components/project/video/annotation/shapes-viewer";
import { useTRPC } from "@/lib/trpc/client";
import type { AnnotationByProjectIdWithExtra } from "@/lib/trpc/types";

const annotationsAtom = atomWithQuery(() => ({
  queryKey: ["todos"],
}));

/**
 * Smooth playback time between sparse `mediaCurrentTime` updates: while playing,
 * advance with rAF × playback rate; when paused, follow the store; on seek the
 * effect restarts from `mediaCurrentTime`.
 */
function useAccurateMediaCurrentTime(): number {
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const mediaPaused = useMediaSelector((state) => state.mediaPaused);
  const playbackRate = useMediaSelector(
    (state) => state.mediaPlaybackRate ?? 1,
  );

  const isPaused = typeof mediaPaused !== "boolean" || mediaPaused === true;

  const clock = mediaCurrentTime ?? 0;
  const [smoothTime, setSmoothTime] = useState(clock);

  useEffect(() => {
    if (isPaused) {
      setSmoothTime(clock);
    }
  }, [isPaused, clock]);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    setSmoothTime(clock);
    let rafId = 0;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      setSmoothTime((t) => t + dt * playbackRate);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused, playbackRate, clock]);

  return smoothTime;
}

export function useAnnotations(projectId: string) {
  const mediaCurrentTime = useAccurateMediaCurrentTime();

  const api = useTRPC();
  const { data: annotations = [], isLoading } = useQuery({
    ...api.annotation.byProjectId.queryOptions({
      id: projectId,
    }),
    placeholderData: [],
  });

  const currentAnnotations = useMemo(
    () =>
      annotations.length > 0
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
