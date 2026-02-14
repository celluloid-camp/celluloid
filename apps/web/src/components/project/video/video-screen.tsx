"use client";
import { AnnotationShape } from "@celluloid/db";
import { Grid } from "@mui/material";
import { useMeasure } from "@uidotdev/usehooks";
import {
  MediaActionTypes,
  useMediaDispatch,
  useMediaFullscreenRef,
  useMediaSelector,
} from "media-chrome/react/media-store";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import type { AnnotationByProjectId, ProjectById } from "@/lib/trpc/types";
import { AnnotationOverlayHints } from "./annotation/overlay-hints";
import { ShapesEditor } from "./annotation/shapes-editor";
import {
  AnnotationShapeWithMetadata,
  ShapesViewer,
} from "./annotation/shapes-viewer";
import { useAnnotationEditorState } from "./annotation/useAnnotationEditor";
import { VideoPanel } from "./video-panel";
import { VideoVision } from "./video-vision";

const VideoPlayer = dynamic(
  () => import("../../video-player").then((mod) => mod.default),
  { ssr: false },
);

interface Props {
  project: ProjectById;
}

export function ProjectVideoScreen({ project }: Props) {
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime);
  const dispatch = useMediaDispatch();
  const fullscreenRefCallback = useMediaFullscreenRef();

  const [ref, { width, height }] = useMeasure();

  const { data: session } = useSession();
  const utils = trpc.useUtils();

  const [annotations] = trpc.annotation.byProjectId.useSuspenseQuery({
    id: project.id,
  });

  const { contextualEditorVisible, formVisible, showHints } =
    useAnnotationEditorState();

  // trpc.annotation.onChange.useSubscription(undefined, {
  //   onData() {
  //     // addMessages([post]);
  //     utils.annotation.byProjectId.invalidate();
  //   },
  //   onError(err) {
  //     console.error("Subscription error:", err);
  //     // we might have missed a message - invalidate cache
  //     utils.annotation.byProjectId.invalidate();
  //   },
  // });

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

  const shapeAnnotations = useMemo<AnnotationShapeWithMetadata[]>(
    () =>
      visibleAnnotations
        .filter(
          (annotation) =>
            annotation.extra !== null && annotation.extra !== undefined,
        )
        .map((annotation) => {
          const extra = annotation.extra as AnnotationShape;
          return {
            ...annotation.extra,
            id: extra.id ?? annotation.id,
            type: extra.type ?? "point",
            x: extra.relativeX ?? extra.x,
            y: extra.relativeY ?? extra.y,
            pause: annotation.pause,
            startTime: annotation.startTime,
            metadata: {
              color: annotation.user.color,
              initial: annotation.user.initial,
              username: annotation.user.username,
              avatar: annotation.user.avatar?.publicUrl,
              text: annotation.text,
            },
          };
        }),
    [visibleAnnotations],
  );

  useEffect(() => {
    if (!mediaCurrentTime) return;
    const paused = visibleAnnotations.filter(
      (annotation) =>
        annotation.pause &&
        annotation.startTime === Math.floor(mediaCurrentTime),
    );

    if (paused.length > 0) {
      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: mediaCurrentTime + 1,
      });
      dispatch({ type: MediaActionTypes.MEDIA_PAUSE_REQUEST });
    }
  }, [visibleAnnotations, mediaCurrentTime]);

  useEffect(() => {
    if (formVisible) {
      dispatch({ type: MediaActionTypes.MEDIA_PAUSE_REQUEST });
    }
  }, [formVisible]);

  const handleAnnotionHintClick = (annotation: AnnotationByProjectId) => {
    dispatch({
      type: MediaActionTypes.MEDIA_SEEK_REQUEST,
      detail: annotation.startTime,
    });
  };

  return (
    <Grid
      container
      id="fullscreen"
      ref={fullscreenRefCallback}
      sx={{
        backgroundColor: "black",
        height: "60vh",
        minHeight: "60vh",
        maxHeight: "60vh",
      }}
    >
      <Grid item xs={8} ref={ref} sx={{ position: "relative" }}>
        {contextualEditorVisible ? <ShapesEditor /> : null}
        {!formVisible && !showHints && shapeAnnotations.length > 0 ? (
          <ShapesViewer
            shapes={shapeAnnotations}
            width={width ?? 0}
            height={height ?? 0}
          />
        ) : null}
        {showHints ? (
          <AnnotationOverlayHints
            project={project}
            annotations={annotations}
            onClick={handleAnnotionHintClick}
          />
        ) : null}
        <VideoVision projectId={project.id} />

        <VideoPlayer url={`https://${project.host}/w/${project.videoId}`} />
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          height: "100%",
          position: "relative",
          paddingY: 2,
          paddingX: 2,
        }}
      >
        <VideoPanel
          project={project}
          annotations={visibleAnnotations}
          annotationCount={annotations.length}
          user={session?.user}
        />
      </Grid>
    </Grid>
  );
}
